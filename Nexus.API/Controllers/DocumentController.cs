using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Data;
using Nexus.DTOs;
using Nexus.Models;
using System.Security.Claims;

namespace Nexus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public DocumentsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("userId")?.Value ??
                User.FindFirst("sub")?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }

            return null;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentDto dto)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var currentUser = await _context.Users.FindAsync(currentUserId.Value);

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Current user not found."
                });
            }

            if (dto.ReceiverUserId != null)
            {
                var receiver = await _context.Users.FindAsync(dto.ReceiverUserId.Value);

                if (receiver == null)
                {
                    return NotFound(new
                    {
                        message = "Receiver user not found."
                    });
                }

                if (receiver.Id == currentUser.Id)
                {
                    return BadRequest(new
                    {
                        message = "You cannot send a document to yourself."
                    });
                }
            }

            if (dto.File == null || dto.File.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Please upload a valid file."
                });
            }

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg" };
            var extension = Path.GetExtension(dto.File.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message = "Only PDF, DOC, DOCX, PNG, JPG, and JPEG files are allowed."
                });
            }

            var maxFileSize = 10 * 1024 * 1024;

            if (dto.File.Length > maxFileSize)
            {
                return BadRequest(new
                {
                    message = "File size must be less than 10 MB."
                });
            }

            var uploadFolder = Path.Combine(
                _environment.ContentRootPath,
                "wwwroot",
                "uploads",
                "documents"
            );

            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            var storedFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadFolder, storedFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var document = new Document
            {
                UploadedByUserId = currentUser.Id,
                ReceiverUserId = dto.ReceiverUserId,
                Title = dto.Title,
                OriginalFileName = dto.File.FileName,
                StoredFileName = storedFileName,
                FilePath = filePath,
                ContentType = dto.File.ContentType,
                FileSizeBytes = dto.File.Length,
                Status = "Uploaded"
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Document uploaded successfully.",
                document
            });
        }

        [HttpGet("my-documents")]
        public async Task<IActionResult> GetMyDocuments()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var documents = await _context.Documents
                .Where(d =>
                    d.UploadedByUserId == currentUserId.Value ||
                    d.ReceiverUserId == currentUserId.Value
                )
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            var users = await _context.Users.ToListAsync();

            var result = documents.Select(d => new
            {
                d.Id,
                d.Title,
                d.OriginalFileName,
                d.ContentType,
                d.FileSizeBytes,
                d.Status,
                d.SignatureText,
                d.SignedAt,
                d.CreatedAt,

                d.UploadedByUserId,
                UploadedByName = users.FirstOrDefault(u => u.Id == d.UploadedByUserId)?.FullName ?? "Unknown User",

                d.ReceiverUserId,
                ReceiverName = d.ReceiverUserId == null
                    ? null
                    : users.FirstOrDefault(u => u.Id == d.ReceiverUserId)?.FullName
            });

            return Ok(new
            {
                message = "Documents fetched successfully.",
                count = documents.Count,
                documents = result
            });
        }

        [HttpGet("{id:int}/download")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var document = await _context.Documents.FindAsync(id);

            if (document == null)
            {
                return NotFound(new
                {
                    message = "Document not found."
                });
            }

            if (document.UploadedByUserId != currentUserId.Value &&
                document.ReceiverUserId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to download this document."
                });
            }

            if (!System.IO.File.Exists(document.FilePath))
            {
                return NotFound(new
                {
                    message = "File not found on server."
                });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);

            return File(
                fileBytes,
                document.ContentType ?? "application/octet-stream",
                document.OriginalFileName
            );
        }

        [HttpPut("{id:int}/sign")]
        public async Task<IActionResult> SignDocument(int id, SignDocumentDto dto)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var document = await _context.Documents.FindAsync(id);

            if (document == null)
            {
                return NotFound(new
                {
                    message = "Document not found."
                });
            }

            if (document.UploadedByUserId != currentUserId.Value &&
                document.ReceiverUserId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to sign this document."
                });
            }

            if (document.Status == "Signed")
            {
                return BadRequest(new
                {
                    message = "Document is already signed."
                });
            }

            document.Status = "Signed";
            document.SignatureText = dto.SignatureText;
            document.SignedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Document signed successfully.",
                document
            });
        }

        [HttpPut("{id:int}/reject")]
        public async Task<IActionResult> RejectDocument(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var document = await _context.Documents.FindAsync(id);

            if (document == null)
            {
                return NotFound(new
                {
                    message = "Document not found."
                });
            }

            if (document.UploadedByUserId != currentUserId.Value &&
                document.ReceiverUserId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to reject this document."
                });
            }

            if (document.Status == "Rejected")
            {
                return BadRequest(new
                {
                    message = "Document is already rejected."
                });
            }

            document.Status = "Rejected";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Document rejected successfully.",
                document
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var document = await _context.Documents.FindAsync(id);

            if (document == null)
            {
                return NotFound(new
                {
                    message = "Document not found."
                });
            }

            if (document.UploadedByUserId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "Only uploader can delete this document."
                });
            }

            if (System.IO.File.Exists(document.FilePath))
            {
                System.IO.File.Delete(document.FilePath);
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Document deleted successfully."
            });
        }
    }
}