using System.ComponentModel.DataAnnotations;

namespace Nexus.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        public string? Bio { get; set; }

        public string? Location { get; set; }
    }
}