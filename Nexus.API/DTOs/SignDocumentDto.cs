using System.ComponentModel.DataAnnotations;

namespace Nexus.DTOs
{
    public class SignDocumentDto
    {
        [Required]
        public string SignatureText { get; set; } = string.Empty;
    }
}