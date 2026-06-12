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
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
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

        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment(CreatePaymentDto dto)
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

            var receiverUser = await _context.Users.FindAsync(dto.ReceiverUserId);

            if (receiverUser == null)
            {
                return NotFound(new
                {
                    message = "Receiver user not found."
                });
            }

            if (currentUser.Id == receiverUser.Id)
            {
                return BadRequest(new
                {
                    message = "You cannot create payment with yourself."
                });
            }

            if (currentUser.Role == receiverUser.Role)
            {
                return BadRequest(new
                {
                    message = "Payment can only be created between Investor and Entrepreneur."
                });
            }

            if (dto.Amount <= 0)
            {
                return BadRequest(new
                {
                    message = "Payment amount must be greater than zero."
                });
            }

            int investorId;
            int entrepreneurId;

            if (currentUser.Role == "Investor" && receiverUser.Role == "Entrepreneur")
            {
                investorId = currentUser.Id;
                entrepreneurId = receiverUser.Id;
            }
            else if (currentUser.Role == "Entrepreneur" && receiverUser.Role == "Investor")
            {
                investorId = receiverUser.Id;
                entrepreneurId = currentUser.Id;
            }
            else
            {
                return BadRequest(new
                {
                    message = "Invalid user roles."
                });
            }

            var payment = new Payment
            {
                InvestorId = investorId,
                EntrepreneurId = entrepreneurId,
                CreatedByUserId = currentUser.Id,
                Amount = dto.Amount,
                Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "USD" : dto.Currency.Trim(),
                Purpose = dto.Purpose.Trim(),
                PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "Mock" : dto.PaymentMethod.Trim(),
                Status = "Pending",
                TransactionReference = $"NEXUS-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}"
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Mock payment created successfully.",
                payment
            });
        }

        [HttpGet("my-payments")]
        public async Task<IActionResult> GetMyPayments()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var payments = await _context.Payments
                .Where(p => p.InvestorId == currentUserId.Value || p.EntrepreneurId == currentUserId.Value)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var users = await _context.Users.ToListAsync();

            var result = payments.Select(p => new
            {
                p.Id,
                p.Amount,
                p.Currency,
                p.Purpose,
                p.PaymentMethod,
                p.Status,
                p.TransactionReference,
                p.CreatedByUserId,
                p.CreatedAt,
                p.CompletedAt,

                p.InvestorId,
                InvestorName = users.FirstOrDefault(u => u.Id == p.InvestorId)?.FullName ?? "Unknown Investor",

                p.EntrepreneurId,
                EntrepreneurName = users.FirstOrDefault(u => u.Id == p.EntrepreneurId)?.FullName ?? "Unknown Entrepreneur"
            });

            return Ok(new
            {
                message = "Payments fetched successfully.",
                count = payments.Count,
                payments = result
            });
        }

        [HttpPut("{id:int}/complete")]
        public async Task<IActionResult> CompletePayment(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Payment not found."
                });
            }

            if (payment.InvestorId != currentUserId.Value && payment.EntrepreneurId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to complete this payment."
                });
            }

            if (payment.Status != "Pending")
            {
                return BadRequest(new
                {
                    message = $"Payment is already {payment.Status}."
                });
            }

            payment.Status = "Completed";
            payment.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment completed successfully.",
                payment
            });
        }

        [HttpPut("{id:int}/fail")]
        public async Task<IActionResult> FailPayment(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Payment not found."
                });
            }

            if (payment.InvestorId != currentUserId.Value && payment.EntrepreneurId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to fail this payment."
                });
            }

            if (payment.Status != "Pending")
            {
                return BadRequest(new
                {
                    message = $"Only pending payment can be failed. Current status: {payment.Status}."
                });
            }

            payment.Status = "Failed";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment marked as failed successfully.",
                payment
            });
        }

        [HttpPut("{id:int}/refund")]
        public async Task<IActionResult> RefundPayment(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Payment not found."
                });
            }

            if (payment.InvestorId != currentUserId.Value && payment.EntrepreneurId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to refund this payment."
                });
            }

            if (payment.Status != "Completed")
            {
                return BadRequest(new
                {
                    message = "Only completed payment can be refunded."
                });
            }

            payment.Status = "Refunded";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment refunded successfully.",
                payment
            });
        }
    }
}