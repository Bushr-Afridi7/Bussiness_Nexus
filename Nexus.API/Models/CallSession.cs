using System.ComponentModel.DataAnnotations;

namespace Nexus.Models
{
    public class CallSession
    {
        public int Id { get; set; }

        [Required]
        public int CallerUserId { get; set; }

        [Required]
        public int ReceiverUserId { get; set; }

        [Required]
        public string CallType { get; set; } = "Video"; 
        // Audio / Video

        public string Status { get; set; } = "Started";
        // Started / Accepted / Rejected / Ended

        public string RoomName { get; set; } = string.Empty;

        public string CallLink { get; set; } = string.Empty;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EndedAt { get; set; }
    }
}