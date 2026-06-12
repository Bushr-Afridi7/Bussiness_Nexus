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
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
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
        public async Task<IActionResult> CreateNotification(CreateNotificationDto dto)
        {
            var receiverUser = await _context.Users.FindAsync(dto.UserId);

            if (receiverUser == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new
                {
                    message = "Notification title is required."
                });
            }

            if (string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest(new
                {
                    message = "Notification message is required."
                });
            }

            var notification = new Notification
            {
                UserId = dto.UserId,
                Title = dto.Title.Trim(),
                Message = dto.Message.Trim(),
                Type = string.IsNullOrWhiteSpace(dto.Type) ? "General" : dto.Type.Trim(),
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Notification created successfully.",
                notification
            });
        }

        [HttpGet("my-notifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == currentUserId.Value)
                .OrderBy(n => n.IsRead)
                .ThenByDescending(n => n.CreatedAt)
                .ToListAsync();

            var unreadCount = notifications.Count(n => !n.IsRead);

            return Ok(new
            {
                message = "Notifications fetched successfully.",
                count = notifications.Count,
                unreadCount,
                notifications
            });
        }

        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
            {
                return NotFound(new
                {
                    message = "Notification not found."
                });
            }

            if (notification.UserId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to update this notification."
                });
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Notification marked as read successfully.",
                notification
            });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == currentUserId.Value && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "All notifications marked as read successfully.",
                updatedCount = notifications.Count
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
            {
                return NotFound(new
                {
                    message = "Notification not found."
                });
            }

            if (notification.UserId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to delete this notification."
                });
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Notification deleted successfully."
            });
        }
    }
}