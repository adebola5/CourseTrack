
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CourseTrack.API.Models;

namespace CourseTrack.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    //it receives receives database configuration from the application.
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    //these represent the tables in our database
    public DbSet<Course> Courses { get; set; }
    public DbSet<Milestone> Milestones { get; set; }
    public DbSet<Resource> Resources { get; set; }
    public DbSet<StudySession> StudySessions { get; set; }
    public DbSet<AiConversation> AiConversations { get; set; }
    public DbSet<AiMessage> AiMessages { get; set; }
    public DbSet<AiUsageRecord> AiUsageRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AiConversation>(entity =>
        {
            entity.Property(item => item.Title).HasMaxLength(120).IsRequired();
            entity.HasIndex(item => new { item.UserId, item.UpdatedAtUtc });
            entity.HasOne(item => item.User)
                .WithMany()
                .HasForeignKey(item => item.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AiMessage>(entity =>
        {
            entity.Property(item => item.Role).HasMaxLength(20).IsRequired();
            entity.Property(item => item.Content).HasMaxLength(3000).IsRequired();
            entity.HasIndex(item => new { item.ConversationId, item.CreatedAtUtc });
            entity.HasOne(item => item.Conversation)
                .WithMany(item => item.Messages)
                .HasForeignKey(item => item.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AiUsageRecord>(entity =>
        {
            entity.Property(item => item.UsageDate).HasColumnType("date");
            entity.HasIndex(item => new { item.UserId, item.UsageDate }).IsUnique();
            entity.HasOne(item => item.User)
                .WithMany()
                .HasForeignKey(item => item.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    //the users one isn't here beacuse Identity also creates its own tables for users, roles and authentication-related information.
}
