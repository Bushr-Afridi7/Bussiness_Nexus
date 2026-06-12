using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Data;
using System.Security.Claims;

namespace Nexus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
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

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
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

            // Meetings Stats
            var totalMeetings = await _context.Meetings
                .CountAsync(m =>
                    m.InvestorId == currentUserId.Value ||
                    m.EntrepreneurId == currentUserId.Value
                );

            var pendingMeetings = await _context.Meetings
                .CountAsync(m =>
                    (m.InvestorId == currentUserId.Value ||
                     m.EntrepreneurId == currentUserId.Value) &&
                    m.Status == "Pending"
                );

            var acceptedMeetings = await _context.Meetings
                .CountAsync(m =>
                    (m.InvestorId == currentUserId.Value ||
                     m.EntrepreneurId == currentUserId.Value) &&
                    m.Status == "Accepted"
                );

            // Documents Stats
            var totalDocuments = await _context.Documents
                .CountAsync(d =>
                    d.UploadedByUserId == currentUserId.Value ||
                    d.ReceiverUserId == currentUserId.Value
                );

            var signedDocuments = await _context.Documents
                .CountAsync(d =>
                    (d.UploadedByUserId == currentUserId.Value ||
                     d.ReceiverUserId == currentUserId.Value) &&
                    d.Status == "Signed"
                );

            // Payments Stats
            var totalPayments = await _context.Payments
                .CountAsync(p =>
                    p.InvestorId == currentUserId.Value ||
                    p.EntrepreneurId == currentUserId.Value
                );

            var completedPayments = await _context.Payments
                .CountAsync(p =>
                    (p.InvestorId == currentUserId.Value ||
                     p.EntrepreneurId == currentUserId.Value) &&
                    p.Status == "Completed"
                );

            var pendingPayments = await _context.Payments
                .CountAsync(p =>
                    (p.InvestorId == currentUserId.Value ||
                     p.EntrepreneurId == currentUserId.Value) &&
                    p.Status == "Pending"
                );

            // Messages / Chats Stats
            var allUserMessages = await _context.Messages
                .Where(m =>
                    m.SenderUserId == currentUserId.Value ||
                    m.ReceiverUserId == currentUserId.Value
                )
                .ToListAsync();

            var totalChats = allUserMessages
                .Select(m =>
                    m.SenderUserId == currentUserId.Value
                        ? m.ReceiverUserId
                        : m.SenderUserId
                )
                .Distinct()
                .Count();

            var unreadMessages = allUserMessages
                .Count(m =>
                    m.ReceiverUserId == currentUserId.Value &&
                    !m.IsRead
                );

            // Notifications Stats
            var unreadNotifications = await _context.Notifications
                .CountAsync(n =>
                    n.UserId == currentUserId.Value &&
                    !n.IsRead
                );

            // Call Stats
            var totalCalls = await _context.CallSessions
                .CountAsync(c =>
                    c.CallerUserId == currentUserId.Value ||
                    c.ReceiverUserId == currentUserId.Value
                );

            var audioCalls = await _context.CallSessions
                .CountAsync(c =>
                    (c.CallerUserId == currentUserId.Value ||
                     c.ReceiverUserId == currentUserId.Value) &&
                    c.CallType == "Audio"
                );

            var videoCalls = await _context.CallSessions
                .CountAsync(c =>
                    (c.CallerUserId == currentUserId.Value ||
                     c.ReceiverUserId == currentUserId.Value) &&
                    c.CallType == "Video"
                );

            var endedCalls = await _context.CallSessions
                .CountAsync(c =>
                    (c.CallerUserId == currentUserId.Value ||
                     c.ReceiverUserId == currentUserId.Value) &&
                    c.Status == "Ended"
                );

            // Platform Users Stats
            var totalInvestors = await _context.Users
                .CountAsync(u => u.Role == "Investor");

            var totalEntrepreneurs = await _context.Users
                .CountAsync(u => u.Role == "Entrepreneur");

            return Ok(new
            {
                message = "Dashboard statistics fetched successfully.",
                user = new
                {
                    currentUser.Id,
                    currentUser.FullName,
                    currentUser.Email,
                    currentUser.Role
                },
                stats = new
                {
                    totalMeetings,
                    pendingMeetings,
                    acceptedMeetings,

                    totalDocuments,
                    signedDocuments,

                    totalPayments,
                    completedPayments,
                    pendingPayments,

                    totalChats,
                    unreadMessages,
                    unreadNotifications,

                    totalCalls,
                    audioCalls,
                    videoCalls,
                    endedCalls,

                    totalInvestors,
                    totalEntrepreneurs
                }
            });
        }
    }
}