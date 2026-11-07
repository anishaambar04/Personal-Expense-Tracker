
using Microsoft.EntityFrameworkCore;
using backend.Models;
using PersonalExpenseTracker.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Transaction> Transactions { get; set; }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("Transactions");

                entity.HasKey(t => t.Id);

                entity.Property(t => t.Title)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(t => t.Amount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(t => t.Type)
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(t => t.Category)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(t => t.TransactionDate)
                    .HasColumnType("date");

                entity.Property(t => t.Notes)
                    .HasMaxLength(500);

                entity.Property(t => t.CreatedAt)
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
            });

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
        }
    }
}
