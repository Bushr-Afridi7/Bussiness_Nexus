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
    public class MeetingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MeetingsController(AppDbContext context)
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

        [HttpPost("schedule")]
        public async Task<IActionResult> ScheduleMeeting(ScheduleMeetingDto dto)
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
                    message = "You cannot schedule a meeting with yourself."
                });
            }

            if (currentUser.Role == receiverUser.Role)
            {
                return BadRequest(new
                {
                    message = "Meeting can only be scheduled between Investor and Entrepreneur."
                });
            }

            if (dto.ScheduledAt <= DateTime.Now)
            {
                return BadRequest(new
                {
                    message = "Meeting time must be in the future."
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

            var startTime = dto.ScheduledAt;
            var endTime = dto.ScheduledAt.AddMinutes(dto.DurationMinutes);

            var existingMeetings = await _context.Meetings
                .Where(m =>
                    m.Status != "Canceled" &&
                    m.Status != "Rejected" &&
                    m.ScheduledAt < endTime &&
                    (
                        m.InvestorId == investorId ||
                        m.EntrepreneurId == entrepreneurId ||
                        m.InvestorId == entrepreneurId ||
                        m.EntrepreneurId == investorId
                    ))
                .ToListAsync();

            var hasConflict = existingMeetings.Any(m =>
                m.ScheduledAt.AddMinutes(m.DurationMinutes) > startTime
            );

            if (hasConflict)
            {
                return BadRequest(new
                {
                    message = "Meeting time conflict found. Please choose another time."
                });
            }

            var meeting = new Meeting
            {
                InvestorId = investorId,
                EntrepreneurId = entrepreneurId,
                CreatedByUserId = currentUser.Id,
                Title = dto.Title,
                Description = dto.Description,
                ScheduledAt = dto.ScheduledAt,
                DurationMinutes = dto.DurationMinutes,
                MeetingLink = dto.MeetingLink,
                Status = "Pending"
            };

            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Meeting scheduled successfully.",
                meeting
            });
        }

        [HttpGet("my-meetings")]
        public async Task<IActionResult> GetMyMeetings()
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var meetings = await _context.Meetings
                .Where(m => m.InvestorId == currentUserId.Value || m.EntrepreneurId == currentUserId.Value)
                .OrderByDescending(m => m.ScheduledAt)
                .ToListAsync();

            var users = await _context.Users.ToListAsync();

            var result = meetings.Select(m => new
            {
                m.Id,
                m.Title,
                m.Description,
                m.ScheduledAt,
                m.DurationMinutes,
                m.MeetingLink,
                m.Status,
                m.CreatedByUserId,
                m.CreatedAt,

                InvestorId = m.InvestorId,
                InvestorName = users.FirstOrDefault(u => u.Id == m.InvestorId)?.FullName ?? "Unknown Investor",

                EntrepreneurId = m.EntrepreneurId,
                EntrepreneurName = users.FirstOrDefault(u => u.Id == m.EntrepreneurId)?.FullName ?? "Unknown Entrepreneur"
            });

            return Ok(new
            {
                message = "Meetings fetched successfully.",
                count = meetings.Count,
                meetings = result
            });
        }

        [HttpPut("{id:int}/accept")]
        public async Task<IActionResult> AcceptMeeting(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var meeting = await _context.Meetings.FindAsync(id);

            if (meeting == null)
            {
                return NotFound(new
                {
                    message = "Meeting not found."
                });
            }

            if (meeting.InvestorId != currentUserId.Value && meeting.EntrepreneurId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to accept this meeting."
                });
            }

            if (meeting.CreatedByUserId == currentUserId.Value)
            {
                return BadRequest(new
                {
                    message = "You cannot accept your own meeting request."
                });
            }

            if (meeting.Status != "Pending")
            {
                return BadRequest(new
                {
                    message = $"Meeting is already {meeting.Status}."
                });
            }

            meeting.Status = "Accepted";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Meeting accepted successfully.",
                meeting
            });
        }

        [HttpPut("{id:int}/reject")]
        public async Task<IActionResult> RejectMeeting(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var meeting = await _context.Meetings.FindAsync(id);

            if (meeting == null)
            {
                return NotFound(new
                {
                    message = "Meeting not found."
                });
            }

            if (meeting.InvestorId != currentUserId.Value && meeting.EntrepreneurId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to reject this meeting."
                });
            }

            if (meeting.CreatedByUserId == currentUserId.Value)
            {
                return BadRequest(new
                {
                    message = "You cannot reject your own meeting request."
                });
            }

            if (meeting.Status != "Pending")
            {
                return BadRequest(new
                {
                    message = $"Meeting is already {meeting.Status}."
                });
            }

            meeting.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Meeting rejected successfully.",
                meeting
            });
        }

        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelMeeting(int id)
        {
            var currentUserId = GetCurrentUserId();

            if (currentUserId == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid token. User id not found."
                });
            }

            var meeting = await _context.Meetings.FindAsync(id);

            if (meeting == null)
            {
                return NotFound(new
                {
                    message = "Meeting not found."
                });
            }

            if (meeting.InvestorId != currentUserId.Value && meeting.EntrepreneurId != currentUserId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to cancel this meeting."
                });
            }

            if (meeting.Status == "Canceled")
            {
                return BadRequest(new
                {
                    message = "Meeting is already canceled."
                });
            }

            meeting.Status = "Canceled";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Meeting canceled successfully.",
                meeting
            });
        }
    }
}