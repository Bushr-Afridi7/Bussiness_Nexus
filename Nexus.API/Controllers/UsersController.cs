using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Data;

namespace Nexus.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("investors")]
        public async Task<IActionResult> GetInvestors()
        {
            var investors = await _context.Users
                .Where(u => u.Role == "Investor")
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.Bio,
                    u.Location,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                message = "Investors fetched successfully.",
                count = investors.Count,
                users = investors
            });
        }

        [HttpGet("entrepreneurs")]
        public async Task<IActionResult> GetEntrepreneurs()
        {
            var entrepreneurs = await _context.Users
                .Where(u => u.Role == "Entrepreneur")
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.Bio,
                    u.Location,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                message = "Entrepreneurs fetched successfully.",
                count = entrepreneurs.Count,
                users = entrepreneurs
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.Bio,
                    u.Location,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(new
            {
                message = "User fetched successfully.",
                user
            });
        }
    }
}