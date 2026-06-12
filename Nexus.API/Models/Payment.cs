using System.ComponentModel.DataAnnotations;

namespace Nexus.Models
{
    public class Payment
    {
        public int Id { get; set; }

        [Required]
        public int InvestorId { get; set; }

        [Required]
        public int EntrepreneurId { get; set; }

        [Required]
        public int CreatedByUserId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public string Currency { get; set; } = "USD";

        [Required]
        public string Purpose { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = "Mock";

        public string Status { get; set; } = "Pending";

        public string TransactionReference { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }
    }
}