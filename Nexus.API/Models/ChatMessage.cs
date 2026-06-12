using System.ComponentModel.DataAnnotations;

namespace Nexus.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }

        [Required]
        public int SenderUserId { get; set; }

        [Required]
        public int ReceiverUserId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}