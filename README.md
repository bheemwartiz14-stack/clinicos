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
docker compose up -d
bun install
bun run db:generate
bun run db:push
bun run db:seed
bun run dev
```

## Deploy to Vercel

This is a Bun workspace monorepo. The Vercel app lives in `apps/web`, but install and build should run from the repository root so workspace packages resolve correctly.

```bash
bun add -g vercel
vercel login
vercel
```
When the Vercel CLI asks for the project directory, use:
```text
apps/web
```
Add the required production environment variables:
```bash
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
```
Optional service integrations can be added the same way:
```bash
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASS production
vercel env add EMAIL_FROM production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```
Deploy to production:
```bash
vercel --prod
```
