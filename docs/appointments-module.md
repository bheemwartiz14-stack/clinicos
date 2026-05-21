# Appointment Management Module

Implemented under `apps/modules/appointments` using the existing HMVC layout, custom session system, Server Actions, Drizzle, Zod, RBAC, Google Calendar, and Google Meet integration paths.

## Routes

- `/appointments`
- `/appointments/create`
- `/appointments/calendar`
- `/appointments/walk-in`
- `/appointments/queue`
- `/appointments/[id]`
- `/appointments/[id]/edit`
- `/settings/my-appointments`
- `/settings/my-calendar`
- `/settings/my-online-consultations`

## RBAC

Added granular permissions to `@mediclinic/rbac`:

- `appointments.view`
- `appointments.create`
- `appointments.edit`
- `appointments.delete`
- `appointments.cancel`
- `appointments.reschedule`
- `appointments.checkin`
- `appointments.complete`
- `appointments.queue.manage`
- `appointments.calendar.view`
- `appointments.online.manage`

## Database Migration Notes

The Drizzle schema now includes lifecycle tables:

- `appointment_status_history`
- `appointment_queue_tokens`
- `appointment_notes`
- `appointment_reschedules`
- `appointment_cancellations`
- `appointment_reminders`
- `appointment_ai_predictions`
- `appointment_calendar_events`
- `appointment_meet_sessions`

Generate and apply migration:

```bash
bun run db:generate
bun run db:migrate
```

If the database already has the original `appointment_status` enum, add the new enum values before applying dependent table changes:

```sql
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'in_consultation';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'rescheduled';
```

## Env Example

Google Calendar and Meet continue to use the existing integration environment:

```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/integrations/google-calendar/callback"
```

Required Google scopes:

```txt
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
```

## Seed Data Notes

Appointments require existing branch, patient, doctor, and user records. Minimal seed shape:

```ts
await db.insert(appointments).values({
  branchId,
  patientId,
  doctorId,
  bookedByUserId,
  appointmentNumber: "APT-SEED-001",
  appointmentDate: "2026-05-21",
  startTime: "10:00",
  endTime: "10:20",
  startsAt: new Date("2026-05-21T10:00:00.000Z"),
  endsAt: new Date("2026-05-21T10:20:00.000Z"),
  status: "confirmed",
  consultationMode: "offline",
  mode: "offline",
  locationType: "clinic",
  appointmentType: "consultation",
  priority: "routine",
  reason: "Seed consultation"
});
```
