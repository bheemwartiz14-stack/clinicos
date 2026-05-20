# MediClinic Pro

Enterprise-grade, single-tenant clinic management platform for USA-based clinics.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS, shadcn/ui style primitives, Framer Motion, Lucide Icons
- Next Server Actions, tRPC, JWT HttpOnly cookie sessions
- PostgreSQL, Drizzle ORM, Docker
- Stripe, Twilio SMS, WhatsApp Cloud API, Nodemailer, OpenAI-ready service layer

## Architecture

This repository uses a Turborepo monorepo with HMVC modules under `apps/modules`.
The platform is single-tenant by design: data is scoped by `branch_id`, never `tenant_id`.

## Quick Start

```bash
cp .env.example .env
docker compose up -d postgres
bun install
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

## Development Notes

If Next.js exits with `OS file watch limit reached` while running the dev server,
raise the Linux inotify limits and restart the dev command:

```bash
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl fs.inotify.max_user_instances=1024
```

To make the limits persist after reboot:

```bash
printf "fs.inotify.max_user_watches=524288\nfs.inotify.max_user_instances=1024\n" | sudo tee /etc/sysctl.d/99-mediclinic-dev.conf
sudo sysctl --system
```

If Turbopack still fails locally, run the dev server with Webpack instead:

```bash
bun run dev:webpack
```

### Google OAuth Local Setup

Google Calendar and Meet integrations use the Google OAuth consent screen. While
the app is in Testing mode, add every local developer Google account under
Google Cloud Console -> APIs & Services -> OAuth consent screen -> Test users.

Configure these authorized redirect URIs for the OAuth client:

```text
http://localhost:3000/api/integrations/google-calendar/callback
http://localhost:3000/api/integrations/google-meet/callback
```

These must exactly match `GOOGLE_CALENDAR_REDIRECT_URI`,
and `GOOGLE_MEET_REDIRECT_URI`. Google treats different paths, ports,
hostnames, schemes, and trailing slashes as different redirect URIs.

If the consent screen shows `Error 403: access_denied`, the signed-in Google
account is not an approved test user for that Google Cloud project.

## Enterprise Architecture

- `apps/web/app`: Next.js App Router routes, streaming boundaries, metadata, PWA manifest, route protection proxy, and Server Components.
- `apps/modules`: HMVC feature modules with actions, controllers, services, repositories, validations, views, and reusable feature components.
- `packages/auth`: Zod schemas, secure password hashing, reset-token hashing, JWT session creation, and session payload validation.
- `packages/rbac`: Role and permission vocabulary with filtering helpers used by middleware, server actions, tRPC procedures, and navigation.
- `packages/db`: Drizzle schema, database client, migrations, and seeders for branch-scoped USA clinic workflows.
- `packages/ui`: shared design utilities used by web components.

## Default Seed Accounts
- `admin@mediclinic.example` / `admin`
- `doctor@mediclinic.example` / `doctor`
- `nurse@mediclinic.example` / `nurse`
- `frontdesk@mediclinic.example` / `frontdesk`
- `accounting@mediclinic.example` / `accounting`
