# CourseTrack AI Assistant - Setup

This version adds a presentation-focused AI Academic Assistant using Cloudflare Workers AI and the `@cf/google/gemma-4-26b-a4b-it` model.

## Included features

- Authenticated AI assistant page in the React frontend.
- Separate conversation history for each signed-in user.
- Backend ownership checks on every conversation and message request.
- Cloudflare credentials kept in ASP.NET Core User Secrets (never in the frontend).
- A configurable per-user daily request limit (10 requests by default).
- PostgreSQL storage for conversations, messages, and daily usage counts.

## Backend configuration

The backend expects these User Secrets on the machine where it runs:

```powershell
dotnet user-secrets set "Cloudflare:AccountId" "YOUR_ACCOUNT_ID"
dotnet user-secrets set "Cloudflare:ApiToken" "YOUR_API_TOKEN"
dotnet user-secrets set "Cloudflare:Model" "@cf/google/gemma-4-26b-a4b-it"
```

Do not place the Cloudflare API token in the React `.env` file or commit it to source control. The project already has a `UserSecretsId` in its `.csproj`; run the commands from the backend project directory.

The daily request limit defaults to 10 per user, per UTC day. To change it, set:

```powershell
dotnet user-secrets set "Cloudflare:DailyRequestLimit" "10"
```

## Apply the database migration

From `backend/CourseTrack.API` run:

```powershell
dotnet ef database update
```

This applies the `20261123152500_AddAiChat` migration and creates the AI conversation, message, and usage tables. It does not recreate or delete the existing CourseTrack tables.

## Frontend configuration

Create or update `frontend/.env` with the backend URL used by the current Visual Studio launch profile. For the HTTP profile shown in the supplied project:

```env
VITE_API_BASE_URL=http://localhost:5195
```

Restart Vite after changing `.env`:

```powershell
npm run dev
```

## Run and test

1. Start PostgreSQL.
2. Start the backend from Visual Studio or with `dotnet run` in `backend/CourseTrack.API`.
3. Start the frontend with `npm run dev` in `frontend`.
4. Sign in to CourseTrack.
5. Open **AI Assistant** in the navigation bar.
6. Create a conversation and send a short academic question.
7. Refresh the page and confirm that the conversation is still listed and its messages reload.
8. Sign in as a different account and confirm that the first account's conversations are not visible.

## API routes

All routes require the existing JWT bearer authentication:

- `GET /api/ai/conversations`
- `POST /api/ai/conversations`
- `GET /api/ai/conversations/{conversationId}/messages`
- `POST /api/ai/conversations/{conversationId}/messages`
- `DELETE /api/ai/conversations/{conversationId}`
- `GET /api/ai/usage`

The backend derives the user ID from the validated JWT. It never accepts a user ID from the frontend for conversation ownership.
