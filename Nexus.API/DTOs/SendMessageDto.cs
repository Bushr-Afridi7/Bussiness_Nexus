using System.ComponentModel.DataAnnotations;

namespace Nexus.DTOs
{
    public class SendMessageDto
    {
        [Required]
        public int ReceiverUserId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;
    }
}