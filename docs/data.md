You are a senior enterprise software architect and principal full-stack engineer.

Your task is to build a production-ready, enterprise-grade, AI-enabled Clinic Management System for a USA-based clinic using scalable architecture, modern UI/UX, HIPAA-ready security practices, and modular HMVC development.

====================================================
PROJECT OVERVIEW
====================================================

Project Name:
MediClinic Pro

Project Type:
Enterprise AI-Ready Clinic Management System

Business Model:
Single-Tenant Clinic Management Platform

Target Users:
- Clinics
- Medical practices
- Multi-doctor clinics
- Reception staff
- Accountants
- Nurses
- Doctors
- Clinic administrators

Primary Goals:
- Fast receptionist workflow
- Secure patient records
- AI-assisted operations
- Low-click appointment booking
- Modern responsive dashboard
- HIPAA-ready architecture
- Branch-based management
- Scalable modular system

====================================================
TENANCY MODEL
====================================================

Build this as a SINGLE-TENANT clinic management system.

Do NOT implement:
- SaaS multi-tenancy
- tenant_id columns
- tenant onboarding
- tenant-based database isolation
- organization switching

The system is for ONE clinic business only.

However, support:
- Multiple branches
- Multiple departments
- Multiple doctors
- Multiple staff users
- Multiple patients

Use:
- branch_id
instead of:
- tenant_id

====================================================
TECH STACK
====================================================

Frontend:
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide Icons

Backend:
- Next.js Server Actions
- tRPC
- Node.js

Database:
- PostgreSQL
- Drizzle ORM
- drizzle-kit

Authentication:
- JWT sessions
- Secure HttpOnly cookies
- RBAC system

Package Manager:
- Bun

Architecture:
- Turborepo Monorepo
- HMVC Architecture

Storage:
- local

Notifications:
- WhatsApp Cloud API
- Twilio SMS
- Email notifications (Nodemailer)

Payments:
- Stripe

AI:
- OpenAI API
- AI workflow assistant
- AI summarization
- AI appointment assistant

Deployment:
- Docker
- Vercel
- PostgreSQL WITH  Docker


====================================================
PROJECT STRUCTURE
====================================================

apps/
  web/


packages/
  db/
  ui/
  config/
  rbac/
  auth/


apps/modules/
  auth/
  dashboard/
  patients/
  doctors/
  appointments/
  billing/
  payroll/
  notifications/
  branches/
  staff/
  rbac/
  settings/
  ai/
  reports/

Each module must include:
- actions
- controllers
- services
- repositories
- components
- views
- schemas
- validations
- types

====================================================
UI/UX REQUIREMENTS
====================================================

Build a premium enterprise healthcare dashboard.

UI Style:
- Modern SaaS dashboard
- Glassmorphism cards
- Clean healthcare interface
- Mobile-first responsive
- Fast workflow optimized
- Minimal clicks

Must Include:
- Sticky headers
- Responsive sidebar
- Global search
- Dashboard cards
- Modern tables
- boneyard Skeleton loading
- Empty states
- Form validation
- Toast notifications
- Dark/light mode
- Accessibility support

Use:
- Tailwind CSS
- shadcn/ui
- Framer Motion

====================================================
AUTHENTICATION & RBAC
====================================================

Implement:
- Secure login
- Email/username authentication
- Password reset
- Session management
- Permission middleware
- Route protection
- Sidebar permission filtering
- Server action protection
Zod vaidation for the client side vaidation and service side vaidation 

Roles:
- Admin
- Doctor
- Receptionist
- Accountant
- Nurse

Permission Examples:
- patients.view
- patients.create
- appointments.manage
- billing.view
- payroll.manage
- settings.manage

====================================================
BRANCH MANAGEMENT MODULE
====================================================

Features:
- Create/Edit/Delete branches
- Branch profile
- Branch address
- Branch contact details
- Branch operating hours
- Branch status
- Main branch setting
- Zod validation
- Client-side validation
- Server-side validation

Branch Relations:
- Branch doctors
- Branch departments
- Branch staff
- Branch appointments
- Branch billing
- Branch payroll

====================================================
DEPARTMENT MODULE
====================================================

Features:
- Department CRUD
- Department head assignment
- Department status
- Department description
- Department code
- Client-side validation
- Server-side validation
Relations:
- Branch mapping
- Doctor mapping
- Staff mapping

====================================================
STAFF MANAGEMENT MODULE
====================================================

Features:
- Staff CRUD
- Role assignment
- Department assignment
- Branch assignment
- Staff profiles
- Active/inactive status
- Shift timings
- Staff permissions

====================================================
DOCTOR MANAGEMENT MODULE
====================================================

Features:
- Doctor profiles
- Specialties
- Consultation fees
- Doctor schedules
- Availability slots
- Leave/block dates
- Google Calendar sync
- Branch assignment
- Department assignment

AI Features:
- AI schedule optimization
- AI slot recommendation
Required database tables:
- doctors
- doctor_schedules
- doctor_breaks
- doctor_leave_blocks
- doctor_visit_settings
- doctor_appointment_slots



====================================================
PATIENT MANAGEMENT MODULE
====================================================

Features:
- Quick patient registration
- Fast patient search
- Patient profiles
- Medical history
- Appointment history
- Billing history
- Insurance details
- Allergies
- Emergency contacts
- Family members
- Timeline view
- Notes
- Document uploads

Patient Documents:
- Reports
- Prescriptions
- Scans
- PDFs
- Images

AI Features:
- AI patient search
- AI summaries
- AI follow-up suggestions
====================================================
MASTER PROMPT — APPOINTMENT MODULE
MediClinic Pro
====================================================

Implement a complete enterprise-grade Appointment Management Module in my Next.js 16 clinic management system.

====================================================
PROJECT STACK
====================================================

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Shadcn UI
- PostgreSQL
- Drizzle ORM
- Zod validation
- Server Actions
- Custom auth/session system
- HMVC architecture
- RBAC permission system
- Google Calendar integration
- Google Meet integration

DO NOT USE:
- NextAuth
- SaaS multi-tenancy
- tenant_id columns
- API route auth libraries

Use existing:
- DashboardShell
- permission checker
- custom session system
- RBAC system

====================================================
MODULE NAME
====================================================

Appointment Management

====================================================
MAIN GOALS
====================================================

Build a scalable appointment booking and scheduling system with:

- Fast booking interface
- Doctor-wise scheduling
- Calendar view
- Smart slot management
- Walk-in appointments
- Queue/token system
- Appointment lifecycle tracking
- Reschedule/cancel flow
- Google Calendar sync
- Google Meet integration
- AI-powered scheduling assistance

====================================================
ROUTES
====================================================

Admin/receptionist routes:
- /appointments
- /appointments/create
- /appointments/calendar
- /appointments/walk-in
- /appointments/queue
- /appointments/[id]
- /appointments/[id]/edit

Doctor self-service:
- /settings/my-appointments
- /settings/my-calendar
- /settings/my-online-consultations

====================================================
REQUIRED APPOINTMENT FEATURES
====================================================

1. Fast Booking Interface
- Quick patient search
- Search by:
  - MRN
  - Phone
  - Name
- Quick doctor selection
- Auto slot suggestion
- One-click booking
- Walk-in booking
- Emergency booking
- Returning patient booking

2. Doctor-wise Scheduling
- Doctor schedule integration
- Doctor availability checking
- Lunch/break handling
- Leave blocking
- Google Calendar busy slot blocking
- Max patients/day limit
- Visit duration handling
- Buffer time support

3. Calendar Views
Implement:
- Day view
- Week view
- Month view

Calendar requirements:
- Color-coded statuses
- Doctor filter
- Department filter
- Branch filter
- Search support
- Drag/drop reschedule
- Click slot to book
- Click appointment to open detail drawer/modal

4. Slot Management
Generate slots based on:
- Doctor working schedule
- Visit duration
- Buffer time
- Break/lunch
- Leave blocks
- Existing appointments
- Google Calendar busy events

Slot statuses:
- Available
- Booked
- Blocked
- Lunch
- Leave
- Calendar Busy
- Emergency Reserved

5. Walk-in Support
Features:
- Instant token generation
- Queue position
- Waiting time estimation
- Reception queue display
- Doctor queue display
- Priority walk-in support

6. Queue / Token System
Fields:
- Token number
- Queue position
- Estimated wait time
- Queue status

Queue statuses:
- Waiting
- Called
- In Consultation
- Skipped
- Completed

7. Appointment Status Tracking

Statuses:
- Pending
- Confirmed
- Checked-in
- In Consultation
- Completed
- Cancelled
- No-show
- Rescheduled

Add status timeline tracking.

8. Reschedule / Cancel Flow
Features:
- Reschedule reason
- Cancel reason
- Auto slot release
- Notify patient
- Google Calendar sync update
- Google Meet update
- Reschedule history

9. Google Calendar Sync
Features:
- Create/update calendar events
- Block busy slots
- Prevent double booking
- Sync doctor schedule
- Sync leave blocks
- Sync appointment updates

10. Google Meet Support
Features:
- Auto-create Meet links
- Online consultation support
- Hybrid consultation mode
- Patient invitation emails
- Join meeting button
- Doctor dashboard quick join

====================================================
CONSULTATION MODES
====================================================

Support:
- Offline
- Online
- Hybrid

Logic:
- Offline:
  - Use clinic/room location
  - No Meet link
- Online:
  - Auto-create Google Meet link
  - Store meeting URL
- Hybrid:
  - Receptionist chooses online/offline

====================================================
AI FEATURES
====================================================

1. AI Appointment Assistant
Features:
- Smart scheduling suggestions
- Auto-recommend best slots
- Recommend low-conflict times
- Suggest earliest available doctor
- Suggest alternate doctors

2. Smart Slot Suggestions
AI should consider:
- Doctor workload
- Patient history
- No-show probability
- Peak hours
- Buffer optimization

3. AI No-show Prediction
Analyze:
- Patient history
- Previous no-shows
- Time/day patterns
- Confirmation status

Generate:
- Risk score
- High-risk badge
- Recommended reminder frequency

4. AI Reminder Optimization
AI should determine:
- Best reminder time
- WhatsApp reminder timing
- SMS reminder timing
- Email reminder timing

====================================================
DATABASE TABLES
====================================================

Create tables:

- appointments
- appointment_status_history
- appointment_queue_tokens
- appointment_notes
- appointment_reschedules
- appointment_cancellations
- appointment_reminders
- appointment_ai_predictions
- appointment_calendar_events
- appointment_meet_sessions

====================================================
DRIZZLE SCHEMA REQUIREMENTS
====================================================

Use:
- UUID primary keys
- timestamps
- indexes
- enums
- foreign keys
- cascade/delete rules

====================================================
APPOINTMENTS TABLE
====================================================

Fields:
- id
- appointmentNumber
- patientId
- doctorId
- branchId
- departmentId
- slotId
- bookedByUserId

- appointmentDate
- startTime
- endTime

- consultationMode
  - offline
  - online
  - hybrid

- appointmentType
  - consultation
  - follow_up
  - emergency
  - walk_in

- priority
  - normal
  - urgent
  - emergency

- status
  - pending
  - confirmed
  - checked_in
  - in_consultation
  - completed
  - cancelled
  - no_show
  - rescheduled

- queueNumber
- tokenNumber

- visitReason
- symptoms
- notes

- roomNumber
- location

- meetingProvider
- meetingUrl
- meetingEventId

- checkedInAt
- completedAt
- cancelledAt

- createdAt
- updatedAt

====================================================
APPOINTMENT STATUS HISTORY
====================================================

Track:
- oldStatus
- newStatus
- changedBy
- changedAt
- reason

====================================================
QUEUE TOKEN TABLE
====================================================

Fields:
- tokenNumber
- queuePosition
- estimatedWaitMinutes
- queueStatus

====================================================
GOOGLE CALENDAR INTEGRATION
====================================================

Features:
- Create calendar events
- Update events
- Delete events
- Sync doctor availability
- Prevent overlap

Required scopes:
- calendar
- calendar.events

====================================================
GOOGLE MEET INTEGRATION
====================================================

Use Google Calendar conferenceData.createRequest.

Features:
- Auto-create Meet link
- Save hangoutLink
- Join consultation button
- Email invite support

====================================================
VALIDATION
====================================================

Use Zod for:
- appointment create/update
- walk-in booking
- queue update
- appointment status update
- cancellation
- reschedule
- slot generation
- online consultation creation

====================================================
RBAC PERMISSIONS
====================================================

Permissions:
- appointments.view
- appointments.create
- appointments.edit
- appointments.delete
- appointments.cancel
- appointments.reschedule
- appointments.checkin
- appointments.complete
- appointments.queue.manage
- appointments.calendar.view
- appointments.online.manage

====================================================
RBAC RULES
====================================================

Admin:
- Full access

Doctor:
- View own appointments
- Update consultation status
- Start/end consultation
- Join Meet

Receptionist:
- Book appointments
- Manage queue
- Check-in patients
- Reschedule/cancel

Nurse:
- View appointments
- View queue
- Check-in patients

Accountant:
- View billing-related appointment info only

====================================================
UI REQUIREMENTS
====================================================

Create modern MediClinic Pro UI:

- White cards
- Rounded-xl / rounded-2xl
- Soft borders
- Teal buttons
- Responsive design
- DashboardShell
- Breadcrumbs
- Drawer/modal booking flow
- Calendar grid
- Queue board
- Status badges

====================================================
REQUIRED COMPONENTS
====================================================

Components:
- AppointmentCalendar
- AppointmentBookingForm
- AppointmentDetailDrawer
- AppointmentStatusBadge
- AppointmentQueueBoard
- WalkInBookingCard
- AppointmentTimeline
- SlotSelector
- DoctorAvailabilityIndicator
- MeetJoinButton
- AppointmentFilters
- AppointmentSearchBar
- AppointmentNotesPanel
- QueueTokenCard

====================================================
HMVC STRUCTURE
====================================================

src/modules/appointments/

  actions/
  components/
  controllers/
  repositories/
  schemas/
  services/
  types/
  utils/
  views/

====================================================
REQUIRED HELPERS
====================================================

Implement:
- slot generation helper
- overlap detection helper
- queue estimation helper
- AI slot recommendation helper
- no-show prediction helper
- reminder optimization helper
- doctor availability helper
- Google Calendar sync helper
- Google Meet link generator

====================================================
EXPECTED OUTPUT
====================================================

Generate complete production-ready implementation for:

1. Drizzle schemas
2. Zod schemas
3. Types
4. Repository layer
5. Service layer
6. Controller layer
7. Server actions
8. Views/components
9. Route files
10. Calendar integration
11. Google Meet integration
12. Queue/token system
13. AI helper utilities
14. Permission checks
15. Seed data
16. Migration notes
17. Env example
18. Clean TypeScript code

====================================================
IMPORTANT
====================================================

- Follow HMVC strictly
- Use async server components
- Use Server Actions
- Use Drizzle query builder
- Use Tailwind/Shadcn UI
- Optimize for scalability
- Prevent double booking
- Prevent overlapping appointments
- Ensure mobile responsiveness
- Keep architecture enterprise-ready

====================================================
BILLING & PAYMENT MODULE
====================================================

Features:
- Invoice generation
- Consultation billing
- Payment tracking
- Stripe integration
- Tax/GST support
- Invoice PDFs
- Revenue reports
- Refund tracking

Payment Methods:
- Cash
- Card
- UPI
- Stripe

AI Features:
- AI billing suggestions
- AI payment reminders

====================================================
PAYROLL MODULE
====================================================

Features:
- Doctor commissions
- Salary management
- Revenue sharing
- Payroll reports
- Payout tracking
- Monthly payroll generation
- Export reports

====================================================
NOTIFICATION MODULE
====================================================

Channels:
- WhatsApp
- SMS
- Email

Features:
- Appointment reminders
- Booking confirmations
- Follow-up reminders
- Reschedule notifications
- Payment reminders

====================================================
AI MODULE
====================================================

Create a dedicated AI module.

Features:
- AI receptionist assistant
- AI workflow assistant
- AI patient search
- AI note summarization
- AI dashboard insights
- AI operational analytics

Important:
DO NOT implement:
- AI diagnosis
- AI prescription recommendations
- AI treatment recommendations

AI must only assist workflow operations.

====================================================
DASHBOARD MODULE
====================================================

Admin Dashboard:
- Revenue analytics
- Appointment statistics
- Doctor schedules
- Pending payments
- Branch overview
- AI insights

Doctor Dashboard:
- Today's patients
- Upcoming appointments
- Notes
- Follow-ups
- Schedule overview

Reception Dashboard:
- Fast booking
- Queue handling
- Walk-in management
- Notifications

Accountant Dashboard:
- Billing
- Payroll
- Revenue
- Payment tracking

====================================================
REPORTS MODULE
====================================================

Generate:
- Revenue reports
- Appointment reports
- Doctor performance
- Staff performance
- Patient analytics
- Payment reports
- Payroll reports

Export:
- PDF
- CSV
- Excel

====================================================
DATABASE REQUIREMENTS
====================================================

Use PostgreSQL.

Requirements:
- UUID primary keys
- Proper indexes
- Audit logs
- Soft deletes
- Secure relations
- Timestamps
- Encrypted sensitive data

Core Tables:
- users
- roles
- permissions
- branches
- departments
- staff
- doctors
- doctor_specialties
- doctor_schedules
- appointments
- appointment_slots
- patients
- medical_records
- patient_documents
- invoices
- payments
- payroll
- notifications
- audit_logs
- ai_logs

====================================================
SECURITY REQUIREMENTS
====================================================

Must include:
- HIPAA-ready architecture
- Secure authentication
- RBAC authorization
- Audit logs
- Secure uploads
- Rate limiting
- XSS protection
- CSRF protection
- SQL injection prevention
- Sensitive data encryption

====================================================
NEXT.JS REQUIREMENTS
====================================================

Use:
- App Router
- Server Components
- Server Actions
- Streaming
- Suspense
- Dynamic metadata
- SEO optimization
- PWA support

====================================================
VALIDATION REQUIREMENTS
====================================================

Use:
- Zod validation
- Client-side validation
- Server-side validation
- Type-safe forms
- Reusable schemas

====================================================
CODING RULES
====================================================

Rules:
- Use TypeScript everywhere
- Strong typing
- Modular architecture
- Reusable components
- Reusable server actions
- Clean code
- No duplicated logic
- Proper error handling
- Async/await only
- Production-ready code only

====================================================
UI COMPONENTS
====================================================

Create:
- Advanced tables
- Search filters
- Analytics cards
- Drawer forms
- Modal dialogs
- Calendar UI
- Charts
- Queue management UI
- Status badges
- Dashboard widgets

====================================================
FINAL OUTPUT REQUIREMENTS
====================================================

Generate:
- Full project architecture
- HMVC structure
- Drizzle schema
- Database design
- Full CRUD modules
- Modern responsive UI
- RBAC system
- AI workflows
- Authentication system
- Protected routes
- Branch architecture
- Production-ready dashboard
- Docker support
- Seeders
- Validation
- Reusable UI components

The final system must feel like a premium enterprise healthcare platform optimized for USA clinic workflows.


Implement Doctor Management Module in my Next.js 16 clinic management system.

Stack:
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Shadcn UI
- Drizzle ORM
- PostgreSQL
- Zod
- Server Actions
- HMVC folder structure
- Custom auth/session system
- RBAC permission-based access
- Do NOT use NextAuth API routes

Module:
Doctor Management

Main requirement:
Add doctor self-service calendar sync functionality at:

/settings/my-calendar-sync

When a logged-in Doctor clicks this route, show a Calendar Sync page where the doctor can connect Google Calendar. Implement Google Calendar API integration to sync doctor availability, busy times, block dates, and appointments.

Also merge this feature with the complete Doctor Management module.

Roles:
- Admin
- Doctor
- Receptionist
- Nurse
- Accountant

RBAC rules:
- Admin can manage all doctors.
- Doctor can only manage their own profile, schedule, availability, leaves, slots, consultation settings, and calendar sync.
- Receptionist can view doctor availability and slots only.
- Nurse can view doctor availability only.
- Accountant can view consultation fee only.

Required permissions:
- doctors.view
- doctors.create
- doctors.edit
- doctors.delete
- doctors.schedule.manage
- doctors.leave.manage
- doctors.slots.manage
- doctors.settings.manage
- doctors.self.manage
- doctors.calendar.manage
- doctors.calendar.connect
- doctors.calendar.disconnect
- doctors.calendar.sync

Doctor self-service routes:
- /settings/profile
- /settings/my-schedule
- /settings/my-availability
- /settings/my-leaves
- /settings/my-slots
- /settings/my-calendar-sync
- /settings/my-consultation-settings

Doctor profile tabs:
[Profile] [Schedule] [Slots] [Leave] [Calendar] [AI]

UI requirement:
Create a clean modern MediClinic Pro dashboard UI:
- DashboardShell layout
- Breadcrumb support
- White cards
- Rounded-xl / rounded-2xl
- Soft borders
- Teal primary buttons
- Mobile responsive layout
- Left settings sidebar
- Calendar Sync page similar to the attached screenshot

Calendar Sync page UI:
Title:
Calendar Sync

Subtitle:
Connect your calendar to automatically sync availability.

Google Calendar Integration card:
- Icon
- Title: Google Calendar Integration
- Description: Connect your Google Calendar to automatically sync your working hours and block dates. This helps prevent double-booking and keeps your availability up to date.
- Status:
  - Not connected
  - Connected
  - Sync failed
- Button:
  - Connect Google Calendar
  - Disconnect
  - Sync Now

“What gets synced?” section:
- Working hours and availability
- Blocked time for meetings and appointments
- Out of office events
- Automatic slot blocking when calendar is busy

Coming soon section:
- Microsoft Outlook integration
- iCal/CALDAV support
- Two-way sync with automatic conflict resolution

Required doctor profile fields:
- First name
- Last name
- Email
- Phone
- Gender
- Date of birth
- Department
- Branch
- Specialization
- Qualification
- Experience years
- License number / NPI number
- Consultation fee
- Bio/About
- Active status

Schedule and availability:
Weekly schedule:
- Monday to Sunday
- Available toggle
- Start time
- End time

Break / lunch management:
- Enable lunch break
- Lunch start time
- Lunch end time
- Additional break name
- Additional break start time
- Additional break end time

Visit duration settings:
- Visit duration: 15, 20, 30, 45, 60 minutes
- Buffer time: 0, 5, 10, 15 minutes
- Max patients per day
- Auto-generate slots toggle
- Allow online consultation toggle

Leave / block dates:
- Leave type: Full day, Half day, Custom time
- From date
- To date
- Start time
- End time
- Reason
- Status: Pending, Approved, Rejected

Appointment slots:
Generate appointment slots based on:
- Doctor working schedule
- Visit duration
- Buffer time
- Lunch/break time
- Leave/block dates
- Already booked appointments
- Google Calendar busy events

Slot status:
- Available
- Booked
- Blocked
- Lunch
- Leave
- Calendar Busy

Doctor availability status logic:
Implement helper function:
- If doctor is on leave today: “On Leave”
- Else if current time is inside lunch/break: “On Lunch”
- Else if current slot has appointment: “Busy”
- Else if Google Calendar has a busy event now: “Busy”
- Else if current time is inside working schedule and doctor is active: “Available”
- Else if no schedule exists today: “Not Scheduled”
- Else: “Offline”

Required database tables:
- doctors
- doctor_schedules
- doctor_breaks
- doctor_leave_blocks
- doctor_visit_settings
- doctor_appointment_slots
- doctor_calendar_connections
- doctor_calendar_sync_logs
- doctor_calendar_busy_events

Use Drizzle with:
- UUID primary keys
- createdAt / updatedAt timestamps
- indexes
- proper foreign keys
- enum columns where useful
- cascade/delete behavior where appropriate

Google Calendar schema requirements:
Create table: doctor_calendar_connections

Fields:
- id uuid primary key
- doctorId uuid foreign key doctors.id cascade
- userId uuid foreign key users.id cascade
- provider enum: google
- providerAccountEmail varchar
- accessToken text encrypted or nullable
- refreshToken text encrypted or nullable
- tokenType varchar
- scope text
- expiryDate timestamp
- calendarId varchar default primary
- isConnected boolean default false
- lastSyncedAt timestamp nullable
- syncStatus enum: connected, disconnected, failed, expired
- syncError text nullable
- createdAt
- updatedAt

Create table: doctor_calendar_busy_events

Fields:
- id uuid primary key
- doctorId uuid foreign key doctors.id cascade
- connectionId uuid foreign key doctor_calendar_connections.id cascade
- providerEventId varchar
- calendarId varchar
- title varchar nullable
- startAt timestamp
- endAt timestamp
- isAllDay boolean default false
- status enum: busy, cancelled
- source enum: google
- createdAt
- updatedAt

Create table: doctor_calendar_sync_logs

Fields:
- id uuid primary key
- doctorId uuid foreign key doctors.id cascade
- connectionId uuid foreign key doctor_calendar_connections.id cascade
- syncType enum: manual, automatic, callback
- status enum: success, failed
- message text nullable
- startedAt timestamp
- completedAt timestamp nullable
- createdAt

Google Calendar API flow:
Implement without NextAuth.

Required routes:
- GET /api/doctor-calendar/google/connect
- GET /api/doctor-calendar/google/callback
- POST /api/doctor-calendar/google/disconnect
- POST /api/doctor-calendar/google/sync

Flow:
1. Doctor clicks Connect Google Calendar.
2. Redirect to Google OAuth consent screen.
3. Request scopes:
   - openid
   - email
   - profile
   - https://www.googleapis.com/auth/calendar.readonly
   - https://www.googleapis.com/auth/calendar.events.readonly
4. Callback receives code.
5. Exchange code for tokens.
6. Store connection in doctor_calendar_connections.
7. Fetch calendar busy events using Google FreeBusy API or events API.
8. Store busy blocks in doctor_calendar_busy_events.
9. Mark matching doctor appointment slots as Calendar Busy or Blocked.
10. Redirect back to /settings/my-calendar-sync with success/error state.

Environment variables:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- GOOGLE_CALENDAR_SCOPES
- APP_URL

Validation:
Use Zod for:
- Doctor profile create/update
- Weekly schedule update
- Break/lunch update
- Visit settings update
- Leave/block date create/update
- Slot generation request
- Calendar connect request
- Calendar sync request
- Calendar disconnect request

Expected folder structure:

src/modules/doctors/
  actions/
    doctor-profile.actions.ts
    doctor-schedule.actions.ts
    doctor-break.actions.ts
    doctor-leave.actions.ts
    doctor-slot.actions.ts
    doctor-calendar.actions.ts

  components/
    doctor-tabs.tsx
    doctor-profile-form.tsx
    doctor-schedule-form.tsx
    doctor-break-form.tsx
    doctor-visit-settings-form.tsx
    doctor-leave-form.tsx
    doctor-slots-table.tsx
    doctor-calendar-sync-card.tsx
    doctor-settings-sidebar.tsx

  controllers/
    doctor-profile.controller.ts
    doctor-schedule.controller.ts
    doctor-availability.controller.ts
    doctor-leave.controller.ts
    doctor-slots.controller.ts
    doctor-calendar.controller.ts

  repositories/
    doctor.repository.ts
    doctor-schedule.repository.ts
    doctor-break.repository.ts
    doctor-leave.repository.ts
    doctor-slot.repository.ts
    doctor-calendar.repository.ts

  schemas/
    doctor.schema.ts
    doctor-schedule.schema.ts
    doctor-break.schema.ts
    doctor-leave.schema.ts
    doctor-slot.schema.ts
    doctor-calendar.schema.ts

  services/
    doctor.service.ts
    doctor-schedule.service.ts
    doctor-break.service.ts
    doctor-leave.service.ts
    doctor-slot.service.ts
    doctor-calendar.service.ts
    google-calendar.service.ts

  types/
    doctor.types.ts
    doctor-calendar.types.ts

  utils/
    doctor-slot-generator.ts
    doctor-availability-status.ts
    google-oauth.ts
    calendar-token-encryption.ts

  views/
    doctor-profile.view.tsx
    doctor-schedule.view.tsx
    doctor-availability.view.tsx
    doctor-leaves.view.tsx
    doctor-slots.view.tsx
    doctor-calendar-sync.view.tsx
    doctor-consultation-settings.view.tsx

Required app routes:
app/(protected)/settings/profile/page.tsx
app/(protected)/settings/my-schedule/page.tsx
app/(protected)/settings/my-availability/page.tsx
app/(protected)/settings/my-leaves/page.tsx
app/(protected)/settings/my-slots/page.tsx
app/(protected)/settings/my-calendar-sync/page.tsx
app/(protected)/settings/my-consultation-settings/page.tsx

Required API routes:
app/api/doctor-calendar/google/connect/route.ts
app/api/doctor-calendar/google/callback/route.ts
app/api/doctor-calendar/google/disconnect/route.ts
app/api/doctor-calendar/google/sync/route.ts

Implementation details:
- Use custom session helper to get current logged-in user.
- Do not expose accessToken or refreshToken to the client.
- Store refresh token securely.
- Use server-side Google Calendar API calls only.
- Calendar page should call controller on server and pass model to view.
- Button click should use server action or route redirect.
- Add permission checks in controller and actions.
- Doctor role must only access own doctorId.
- Admin may pass doctorId for management views.
- Receptionist/Nurse/Accountant should only get allowed read-only data.
- Generate slots using server-side service.
- Mark slots blocked when they overlap leave, lunch, break, booked appointment, or Google Calendar busy events.
- Add seed data for sample doctor, weekly schedule, visit settings, lunch break, and sample calendar disconnected state.

Expected output:
Generate complete production-ready code for:
1. Drizzle schemas
2. Zod validation schemas
3. TypeScript types
4. Repository layer
5. Service layer
6. Controller layer
7. Server actions
8. API route handlers for Google OAuth
9. Views/components
10. Route files
11. Permission checks
12. Slot generation helper
13. Availability status helper
14. Seed data
15. Required env example
16. Migration notes

Important:
Follow HMVC strictly.
Use clean TypeScript.
Use async server components.
Use Server Actions.
Use Drizzle query builder.
Use Tailwind/Shadcn UI.
Use existing DashboardShell.
Use existing permission checker.
Do not use SaaS multi-tenancy.
Do not add tenant_id.
Do not use NextAuth.