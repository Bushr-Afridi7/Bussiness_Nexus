using System.ComponentModel.DataAnnotations;

namespace Nexus.Models
{
    public class Meeting
    {
        public int Id { get; set; }

        [Required]
        public int InvestorId { get; set; }

        [Required]
        public int EntrepreneurId { get; set; }

        [Required]
        public int CreatedByUserId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime ScheduledAt { get; set; }

        public int DurationMinutes { get; set; } = 30;

        public string? MeetingLink { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}