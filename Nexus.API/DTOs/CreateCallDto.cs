using System.ComponentModel.DataAnnotations;

namespace Nexus.DTOs
{
    public class CreateCallDto
    {
        [Required]
        public int ReceiverUserId { get; set; }

        [Required]
        public string CallType { get; set; } = "Video";
        // Audio / Video
    }
}