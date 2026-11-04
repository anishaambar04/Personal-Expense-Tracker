
namespace backend.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string Type { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
