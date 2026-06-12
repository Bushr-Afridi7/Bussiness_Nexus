using System.ComponentModel.DataAnnotations;

namespace Nexus.Models
{
    public class Document
    {
        public int Id { get; set; }

        [Required]
        public int UploadedByUserId { get; set; }

        public int? ReceiverUserId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string OriginalFileName { get; set; } = string.Empty;

        [Required]
        public string StoredFileName { get; set; } = string.Empty;

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public string? ContentType { get; set; }

        public long FileSizeBytes { get; set; }

        public string Status { get; set; } = "Uploaded";

        public string? SignatureText { get; set; }

        public DateTime? SignedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}