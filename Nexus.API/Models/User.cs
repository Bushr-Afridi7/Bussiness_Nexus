using System.ComponentModel.DataAnnotations;

namespace Nexus.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;
        // Investor or Entrepreneur

        public string? Bio { get; set; }

        public string? Location { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}