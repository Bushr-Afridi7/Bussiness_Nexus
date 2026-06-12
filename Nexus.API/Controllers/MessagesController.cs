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
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(AppDbContext context)
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

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage(SendMessageDto dto)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var sender = await _context.Users.FindAsync(currentUserId.Value);

            if (sender == null)
            {
                return Unauthorized(new
                {
                    message = "Sender user not found."
                });
            }

            var receiver = await _context.Users.FindAsync(dto.ReceiverUserId);

            if (receiver == null)
            {
                return NotFound(new
                {
                    message = "Receiver user not found."
                });
            }

            if (sender.Id == receiver.Id)
            {
                return BadRequest(new
                {
                    message = "You cannot send message to yourself."
                });
            }

            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                return BadRequest(new
                {
                    message = "Message content is required."
                });
            }

            var message = new ChatMessage
            {
                SenderUserId = sender.Id,
                ReceiverUserId = receiver.Id,
                Content = dto.Content.Trim(),
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Message sent successfully.",
                chatMessage = new
                {
                    message.Id,
                    message.SenderUserId,
                    SenderName = sender.FullName,
                    message.ReceiverUserId,
                    ReceiverName = receiver.FullName,
                    message.Content,
                    message.IsRead,
                    message.CreatedAt
                }
            });
        }

        [HttpGet("conversation/{userId:int}")]
        public async Task<IActionResult> GetConversation(int userId)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var otherUser = await _context.Users.FindAsync(userId);

            if (otherUser == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            var messages = await _context.Messages
                .Where(m =>
                    (m.SenderUserId == currentUserId.Value && m.ReceiverUserId == userId) ||
                    (m.SenderUserId == userId && m.ReceiverUserId == currentUserId.Value)
                )
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var users = await _context.Users.ToListAsync();

            var result = messages.Select(m => new
            {
                m.Id,
                m.SenderUserId,
                SenderName = users.FirstOrDefault(u => u.Id == m.SenderUserId)?.FullName ?? "Unknown User",
                m.ReceiverUserId,
                ReceiverName = users.FirstOrDefault(u => u.Id == m.ReceiverUserId)?.FullName ?? "Unknown User",
                m.Content,
                m.IsRead,
                m.CreatedAt,
                IsMine = m.SenderUserId == currentUserId.Value
            });

            var unreadMessages = messages
                .Where(m => m.ReceiverUserId == currentUserId.Value && !m.IsRead)
                .ToList();

            foreach (var unreadMessage in unreadMessages)
            {
                unreadMessage.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Conversation fetched successfully.",
                otherUser = new
                {
                    otherUser.Id,
                    otherUser.FullName,
                    otherUser.Email,
                    otherUser.Role
                },
                count = messages.Count,
                messages = result
            });
        }

        [HttpGet("my-chats")]
        public async Task<IActionResult> GetMyChats()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var allMessages = await _context.Messages
                .Where(m => m.SenderUserId == currentUserId.Value || m.ReceiverUserId == currentUserId.Value)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            var users = await _context.Users.ToListAsync();

            var chatUserIds = allMessages
                .Select(m => m.SenderUserId == currentUserId.Value ? m.ReceiverUserId : m.SenderUserId)
                .Distinct()
                .ToList();

            var chats = chatUserIds.Select(otherUserId =>
            {
                var otherUser = users.FirstOrDefault(u => u.Id == otherUserId);

                var lastMessage = allMessages
                    .Where(m =>
                        (m.SenderUserId == currentUserId.Value && m.ReceiverUserId == otherUserId) ||
                        (m.SenderUserId == otherUserId && m.ReceiverUserId == currentUserId.Value)
                    )
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefault();

                var unreadCount = allMessages.Count(m =>
                    m.SenderUserId == otherUserId &&
                    m.ReceiverUserId == currentUserId.Value &&
                    !m.IsRead
                );

                return new
                {
                    UserId = otherUserId,
                    FullName = otherUser?.FullName ?? "Unknown User",
                    Email = otherUser?.Email ?? "",
                    Role = otherUser?.Role ?? "",
                    LastMessage = lastMessage?.Content ?? "",
                    LastMessageAt = lastMessage?.CreatedAt,
                    UnreadCount = unreadCount
                };
            })
            .OrderByDescending(c => c.LastMessageAt)
            .ToList();

            return Ok(new
            {
                message = "Chats fetched successfully.",
                count = chats.Count,
                chats
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

            var message = await _context.Messages.FindAsync(id);

            if (message == null)
            {
                return NotFound(new
                {
                    message = "Message not found."
                });
            }

            if (message.ReceiverUserId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You can only mark your received messages as read."
                });
            }

            message.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Message marked as read successfully.",
                chatMessage = message
            });
        }
    }
}