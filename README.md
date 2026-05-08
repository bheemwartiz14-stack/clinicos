# MediClinic Pro

Enterprise-grade, AI-ready clinic management system scaffolded as a Bun + Turborepo monorepo.

## 1. Architecture Overview

MediClinic Pro is a multi-tenant Next.js 16 full-stack application. The web app uses App Router, Server Components, route handlers, Server Actions, Suspense, partial prerendering, tRPC, React Query, Zustand, Dexie, and a service worker for offline-first workflows. Shared packages isolate database, authentication, API routers, validations, UI, config, utilities, and domain types.

## 2. Folder Structure

```txt
apps/
  web/        Next.js 16 application, PWA, dashboard, route handlers
  docs/       Internal documentation app
packages/
  api/        tRPC context, middleware, modular routers
  auth/       Better Auth configuration and RBAC permissions
  config/     Typed environment validation
  db/         Drizzle schema, config, seed scripts
  types/      Shared domain types
  ui/         shadcn-compatible primitives
  utils/      Common helpers
  validations/Zod schemas
```

## 3. Installation Commands

```bash
bun install
cp .env.example .env
docker compose up -d postgres
bun db:generate
bun db:migrate
bun db:seed
bun dev
```

The web app runs on `http://localhost:3000`; docs run on `http://localhost:3001`.

## 4. Turborepo Setup

`turbo.json` defines cached build/typecheck/test pipelines and uncached long-running dev/database tasks. Workspaces are declared in the root `package.json` and are resolved with Bun workspaces.

## 5. Bun Setup

Bun is the only package manager/runtime used. Scripts call `bun`, `bun --filter`, and Turbopack-enabled Next commands. CI uses `oven-sh/setup-bun`.

## 6. Database Setup

PostgreSQL is available through `docker-compose.yml`. Drizzle config lives in `packages/db/drizzle.config.ts`.

```bash
bun db:generate
bun db:migrate
bun db:studio
bun db:seed
```

## 7. Drizzle Schema

The schema includes tenants, users, sessions, accounts, verifications, permissions, patients, doctors, appointments, EMR records, documents, prescriptions, inventory, invoices, payments, notifications, sync events, and audit logs. Tables are multi-tenant-ready, relation-aware, indexed, and include soft-delete timestamps where user-facing records need them.

## 8. Authentication

Better Auth is configured in `packages/auth` with email/password support, secure cookies, sessions, JWT-ready extension points, and shared RBAC helpers. Protected tRPC procedures check session state and permissions.

## 9. tRPC Setup

`packages/api` exposes modular routers:

- `dashboard.overview`
- `patients.list/create/update`
- `appointments.byRange/create`
- `billing.createInvoice`
- `sync.pull/push`

All inputs are Zod-validated and procedures enforce auth and role permissions.

## 10. Offline-First Architecture

The app uses Dexie-backed IndexedDB tables for local patients, queued mutations, and metadata. React Query uses `networkMode: "offlineFirst"`. A service worker caches the shell and returns graceful API offline responses.

## 11. Sync Engine

`apps/web/lib/offline/sync-engine.ts` queues mutations, retries when online, deletes accepted mutations, and leaves conflicts available for UI resolution. Server-side sync events are modeled in Drizzle for pull-based reconciliation.

Conflict strategy:

- Each mutable clinical record carries a `version`.
- Updates include `baseVersion`.
- Server accepts when versions match.
- Server returns conflicts when stale.
- UI can choose server-wins, local-wins, or field-level merge for EMR notes.

## 12. UI System

The UI package provides shadcn-compatible primitives for buttons, cards, inputs, badges, and tables. The dashboard uses a restrained medical SaaS style, responsive sidebar/header, charts, skeleton-ready Suspense boundaries, dark-mode-ready tokens, and accessible controls.

## 13. Dashboard Pages

`apps/web/app/(dashboard)/dashboard/page.tsx` renders analytics cards, revenue chart, activity feed, and recent patient registry. The layout is production-shaped and ready for real tRPC data.

## 14. CRUD Examples

Patient CRUD is implemented across:

- Zod input schemas in `packages/validations`
- Drizzle table in `packages/db`
- tRPC router in `packages/api/src/routers/patients.ts`
- Server Action in `apps/web/lib/actions/patients.ts`
- UI table in `apps/web/components/patients/patient-table.tsx`

## 15. Deployment

Vercel: configure env vars and deploy `apps/web`.

Railway/Render: use `apps/web/Dockerfile`, attach PostgreSQL, and set `.env` values.

Neon: set `DATABASE_URL` to the pooled Neon connection string and run Drizzle migrations from CI.

## 16. Scaling Recommendations

Use tenant-scoped indexes for every high-volume query, move notifications and AI jobs to a queue worker, add object storage for documents, enable database read replicas for analytics, and split audit/sync events into monthly partitions when volumes grow.

## 17. Future AI Integrations

The schema and modules are ready for AI visit summaries, SOAP note generation, billing suggestions, appointment slot suggestions, chatbot triage, and voice-to-text transcription. Keep AI outputs traceable by storing prompt metadata, source note IDs, model versions, and human approval state.
