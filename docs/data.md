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
APPOINTMENT MODULE
====================================================

Features:
- Fast booking interface
- Doctor-wise scheduling
- Day/week/month calendar
- Slot management
- Walk-in support
- Queue/token system
- Appointment status tracking
- Reschedule/cancel flow
- Google Calendar sync
- Google Meet support

Statuses:
- Pending
- Confirmed
- Checked-in
- Completed
- Cancelled
- No-show

AI Features:
- AI appointment assistant
- Smart slot suggestions
- AI no-show prediction
- AI reminder optimization

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