# Doctor Calendar Sync

Doctor self-service route:

- `/settings/my-calendar-sync`

Doctor-only Google Calendar API routes:

- `GET /api/doctor-calendar/google/connect`
- `GET /api/doctor-calendar/google/callback`
- `POST /api/doctor-calendar/google/disconnect`
- `POST /api/doctor-calendar/google/sync`

## OAuth Setup

Add these env values:

```bash
APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/doctor-calendar/google/callback
GOOGLE_CALENDAR_SCOPES="openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly"
```

Google Cloud authorized redirect URI:

```txt
http://localhost:3000/api/doctor-calendar/google/callback
```

## Database

The schema already includes:

- `doctor_calendar_connections`
- `doctor_calendar_busy_events`
- `doctor_calendar_sync_logs`

Run migrations after schema changes:

```bash
bun run db:generate
bun run db:migrate
```

## Behavior

- Doctors can connect only their own Google Calendar.
- Tokens are encrypted before storage and never sent to the client.
- Sync fetches Google Calendar busy events, stores them, writes a sync log, and marks overlapping available doctor slots as `calendar_busy`.
- Disconnect clears the connection and busy events.
