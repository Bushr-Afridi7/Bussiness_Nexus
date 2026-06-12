using System.ComponentModel.DataAnnotations;

namespace Nexus.DTOs
{
    public class ScheduleMeetingDto
    {
        [Required]
        public int ReceiverUserId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime ScheduledAt { get; set; }

        [Range(15, 180)]
        public int DurationMinutes { get; set; } = 30;

        public string? MeetingLink { get; set; }
    }
}