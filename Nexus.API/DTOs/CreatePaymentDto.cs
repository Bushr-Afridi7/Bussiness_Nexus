using System.ComponentModel.DataAnnotations;

namespace Nexus.DTOs
{
    public class CreatePaymentDto
    {
        [Required]
        public int ReceiverUserId { get; set; }

        [Range(1, 1000000)]
        public decimal Amount { get; set; }

        public string Currency { get; set; } = "USD";

        [Required]
        public string Purpose { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = "Mock Stripe";
    }
}