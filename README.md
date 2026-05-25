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
bun run db:push
bun run db:seed
bun run dev
```