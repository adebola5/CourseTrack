using CourseTrack.API.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourseTrack.API.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261123152500_AddAiChat")]
public partial class AddAiChat : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AiConversations",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UserId = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AiConversations", x => x.Id);
                table.ForeignKey(
                    name: "FK_AiConversations_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AiUsageRecords",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<string>(type: "text", nullable: false),
                UsageDate = table.Column<DateOnly>(type: "date", nullable: false),
                RequestCount = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AiUsageRecords", x => x.Id);
                table.ForeignKey(
                    name: "FK_AiUsageRecords_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AiMessages",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                Content = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AiMessages", x => x.Id);
                table.ForeignKey(
                    name: "FK_AiMessages_AiConversations_ConversationId",
                    column: x => x.ConversationId,
                    principalTable: "AiConversations",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AiConversations_UserId_UpdatedAtUtc",
            table: "AiConversations",
            columns: new[] { "UserId", "UpdatedAtUtc" });

        migrationBuilder.CreateIndex(
            name: "IX_AiMessages_ConversationId_CreatedAtUtc",
            table: "AiMessages",
            columns: new[] { "ConversationId", "CreatedAtUtc" });

        migrationBuilder.CreateIndex(
            name: "IX_AiUsageRecords_UserId_UsageDate",
            table: "AiUsageRecords",
            columns: new[] { "UserId", "UsageDate" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AiMessages");
        migrationBuilder.DropTable(name: "AiUsageRecords");
        migrationBuilder.DropTable(name: "AiConversations");
    }
}
