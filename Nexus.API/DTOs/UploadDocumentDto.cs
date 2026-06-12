using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Nexus.DTOs
{
    public class UploadDocumentDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public int? ReceiverUserId { get; set; }

        [Required]
        public IFormFile File { get; set; } = null!;
    }
}