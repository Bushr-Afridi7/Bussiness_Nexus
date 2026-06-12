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
    public class CallsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CallsController(AppDbContext context)
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

        [HttpPost("start")]
        public async Task<IActionResult> StartCall(CreateCallDto dto)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var caller = await _context.Users.FindAsync(currentUserId.Value);

            if (caller == null)
            {
                return Unauthorized(new
                {
                    message = "Caller user not found."
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

            if (caller.Id == receiver.Id)
            {
                return BadRequest(new
                {
                    message = "You cannot call yourself."
                });
            }

            var callType = dto.CallType.Trim();

            if (callType != "Audio" && callType != "Video")
            {
                return BadRequest(new
                {
                    message = "Call type must be Audio or Video."
                });
            }

            var roomName = $"Nexus-{Guid.NewGuid().ToString("N")[..10]}";
            var callLink = $"https://meet.jit.si/{roomName}";

            var callSession = new CallSession
            {
                CallerUserId = caller.Id,
                ReceiverUserId = receiver.Id,
                CallType = callType,
                Status = "Started",
                RoomName = roomName,
                CallLink = callLink,
                StartedAt = DateTime.UtcNow
            };

            _context.CallSessions.Add(callSession);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"{callType} call started successfully.",
                callSession = new
                {
                    callSession.Id,
                    callSession.CallerUserId,
                    CallerName = caller.FullName,
                    callSession.ReceiverUserId,
                    ReceiverName = receiver.FullName,
                    callSession.CallType,
                    callSession.Status,
                    callSession.RoomName,
                    callSession.CallLink,
                    callSession.StartedAt,
                    callSession.EndedAt
                }
            });
        }

        [HttpGet("my-calls")]
        public async Task<IActionResult> GetMyCalls()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var calls = await _context.CallSessions
                .Where(c =>
                    c.CallerUserId == currentUserId.Value ||
                    c.ReceiverUserId == currentUserId.Value
                )
                .OrderByDescending(c => c.StartedAt)
                .ToListAsync();

            var users = await _context.Users.ToListAsync();

            var result = calls.Select(c => new
            {
                c.Id,
                c.CallerUserId,
                CallerName = users.FirstOrDefault(u => u.Id == c.CallerUserId)?.FullName ?? "Unknown Caller",
                c.ReceiverUserId,
                ReceiverName = users.FirstOrDefault(u => u.Id == c.ReceiverUserId)?.FullName ?? "Unknown Receiver",
                c.CallType,
                c.Status,
                c.RoomName,
                c.CallLink,
                c.StartedAt,
                c.EndedAt
            });

            return Ok(new
            {
                message = "Calls fetched successfully.",
                count = calls.Count,
                calls = result
            });
        }

        [HttpPut("{id:int}/accept")]
        public async Task<IActionResult> AcceptCall(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new { message = "Invalid token. User id not found." });
            }

            var call = await _context.CallSessions.FindAsync(id);

            if (call == null)
            {
                return NotFound(new { message = "Call not found." });
            }

            if (call.ReceiverUserId != currentUserId.Value)
            {
                return StatusCode(403, new { message = "Only receiver can accept this call." });
            }

            if (call.Status != "Started")
            {
                return BadRequest(new { message = $"Call is already {call.Status}." });
            }

            call.Status = "Accepted";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Call accepted successfully.",
                call
            });
        }

        [HttpPut("{id:int}/reject")]
        public async Task<IActionResult> RejectCall(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new { message = "Invalid token. User id not found." });
            }

            var call = await _context.CallSessions.FindAsync(id);

            if (call == null)
            {
                return NotFound(new { message = "Call not found." });
            }

            if (call.ReceiverUserId != currentUserId.Value)
            {
                return StatusCode(403, new { message = "Only receiver can reject this call." });
            }

            if (call.Status != "Started")
            {
                return BadRequest(new { message = $"Call is already {call.Status}." });
            }

            call.Status = "Rejected";
            call.EndedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Call rejected successfully.",
                call
            });
        }

        [HttpPut("{id:int}/end")]
        public async Task<IActionResult> EndCall(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new { message = "Invalid token. User id not found." });
            }

            var call = await _context.CallSessions.FindAsync(id);

            if (call == null)
            {
                return NotFound(new { message = "Call not found." });
            }

            if (call.CallerUserId != currentUserId.Value && call.ReceiverUserId != currentUserId.Value)
            {
                return StatusCode(403, new { message = "You are not allowed to end this call." });
            }

            if (call.Status == "Ended")
            {
                return BadRequest(new { message = "Call is already ended." });
            }

            call.Status = "Ended";
            call.EndedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Call ended successfully.",
                call
            });
        }
    }
}