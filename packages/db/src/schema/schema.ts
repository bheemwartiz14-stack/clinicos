import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "doctor", "nurse", "receptionist", "accountant", "analyst", "patient"]);
export const branchStatusEnum = pgEnum("branch_status", ["active", "inactive", "maintenance"]);
export const departmentStatusEnum = pgEnum("department_status", ["active", "inactive"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "pending", "confirmed", "checked_in", "in_room", "in_consultation", "completed", "cancelled", "no_show", "rescheduled"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "open", "paid", "void", "refunded"]);
export const notificationChannelEnum = pgEnum("notification_channel", ["email", "sms", "whatsapp"]);
export const payrollStatusEnum = pgEnum("payroll_status", ["draft", "approved", "paid"]);
export const appointmentModeEnum = pgEnum("appointment_mode", ["offline", "online", "hybrid"]);
export const consultationModeEnum = pgEnum("consultation_mode", ["offline", "online", "hybrid"]);
export const locationTypeEnum = pgEnum("location_type", ["clinic", "online"]);
export const integrationProviderEnum = pgEnum("integration_provider", ["google_calendar", "google_meet"]);
export const integrationStatusEnum = pgEnum("integration_status", ["connected", "disconnected", "failed", "expired"]);
export const insuranceVerificationStatusEnum = pgEnum("insurance_verification_status", ["not_verified", "pending", "verified", "rejected", "expired"]);
export const queuePriorityEnum = pgEnum("queue_priority", ["routine", "priority", "emergency"]);
export const appointmentTypeEnum = pgEnum("appointment_type", ["consultation", "follow_up", "emergency", "walk_in"]);
export const appointmentQueueStatusEnum = pgEnum("appointment_queue_status", ["waiting", "called", "in_consultation", "skipped", "completed"]);
export const appointmentReminderStatusEnum = pgEnum("appointment_reminder_status", ["queued", "sent", "failed", "cancelled"]);
export const documentTypeEnum = pgEnum("document_type", ["report", "prescription", "scan", "pdf", "image", "insurance", "other"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "upi", "stripe", "insurance"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "refunded", "partially_refunded"]);
export const refundStatusEnum = pgEnum("refund_status", ["pending", "succeeded", "failed"]);
export const claimStatusEnum = pgEnum("claim_status", ["draft", "ready", "submitted", "accepted", "rejected", "paid", "denied"]);
export const aiRecommendationStatusEnum = pgEnum("ai_recommendation_status", ["pending", "accepted", "dismissed", "expired"]);
export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
});
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  npi: varchar("npi", { length: 32 }),
  ein: varchar("ein", { length: 16 }),
  profile: text("profile").default("").notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 255 }),
  addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line_2", { length: 255 }),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  postalCode: varchar("postal_code", { length: 16 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).default("America/New_York").notNull(),
  status: branchStatusEnum("status").default("active").notNull(),
  isMain: boolean("is_main").default(false).notNull(),
  operatingHours: jsonb("operating_hours")
    .$type<Record<string, { open: string; close: string; closed: boolean }>>()
    .default(sql`'{}'::jsonb`)
    .notNull(),
  ...timestamps()
}, (table) => ({
  mainUnique: uniqueIndex("branches_single_main_unique").on(table.isMain).where(sql`${table.isMain} = true`),
  statusIdx: index("branches_status_idx").on(table.status)
}));

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 32 }),
  description: text("description"),
  status: departmentStatusEnum("status").default("active").notNull(),
  headId: uuid("head_id"),
  ...timestamps()
}, (table) => ({
  branchIdx: index("departments_branch_idx").on(table.branchId)
}));

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  departmentId: uuid("department_id").references(() => departments.id),
  role: roleEnum("role").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  username: varchar("username", { length: 64 }),
  phone: varchar("phone", { length: 32 }),
  avatar: text("avatar"),
  gender: varchar("gender", { length: 32 }),
  dob: date("dob"),
  address: text("address"),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 120 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 120 }),
  emergencyContact: jsonb("emergency_contact").$type<{ name: string; phone: string; relationship: string }>(),
  bio: text("bio"),
  profileVisibility: varchar("profile_visibility", { length: 32 }).default("team").notNull(),
  shiftStart: varchar("shift_start", { length: 16 }),
  shiftEnd: varchar("shift_end", { length: 16 }),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastPasswordChangedAt: timestamp("last_password_changed_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
  usernameUnique: uniqueIndex("users_username_unique").on(table.username),
  branchIdx: index("users_branch_idx").on(table.branchId)
}));

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tokenVersion: varchar("token_version", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  deviceName: varchar("device_name", { length: 160 }),
  browser: varchar("browser", { length: 120 }),
  os: varchar("os", { length: 120 }),
  location: varchar("location", { length: 160 }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps()
}, (table) => ({
  userIdx: index("user_sessions_user_idx").on(table.userId),
  expiresIdx: index("user_sessions_expires_idx").on(table.expiresAt)
}));

export const loginHistory = pgTable("login_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sessionId: uuid("session_id").references(() => userSessions.id),
  status: varchar("status", { length: 32 }).default("success").notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  deviceName: varchar("device_name", { length: 160 }),
  location: varchar("location", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("login_history_user_idx").on(table.userId),
  createdIdx: index("login_history_created_idx").on(table.createdAt)
}));

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  smsNotifications: boolean("sms_notifications").default(false).notNull(),
  whatsappNotifications: boolean("whatsapp_notifications").default(false).notNull(),
  appointmentAlerts: boolean("appointment_alerts").default(true).notNull(),
  billingAlerts: boolean("billing_alerts").default(true).notNull(),
  systemAlerts: boolean("system_alerts").default(true).notNull(),
  quietHoursStart: varchar("quiet_hours_start", { length: 16 }),
  quietHoursEnd: varchar("quiet_hours_end", { length: 16 }),
  ...timestamps()
}, (table) => ({
  userUnique: uniqueIndex("notification_preferences_user_unique").on(table.userId)
}));

export const passwordChangeLogs = pgTable("password_change_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  changedByUserId: uuid("changed_by_user_id").references(() => users.id),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  sessionId: uuid("session_id").references(() => userSessions.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("password_change_logs_user_idx").on(table.userId),
  createdIdx: index("password_change_logs_created_idx").on(table.createdAt)
}));

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  tokenUnique: uniqueIndex("password_reset_tokens_hash_unique").on(table.tokenHash),
  userIdx: index("password_reset_tokens_user_idx").on(table.userId)
}));

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  mrn: varchar("mrn", { length: 64 }).notNull(),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull(),
  fullName: varchar("full_name", { length: 260 }),
  dateOfBirth: date("date_of_birth").notNull(),
  sex: varchar("sex", { length: 32 }).notNull(),
  gender: varchar("gender", { length: 32 }),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 255 }),
  bloodGroup: varchar("blood_group", { length: 16 }),
  maritalStatus: varchar("marital_status", { length: 32 }),
  occupation: varchar("occupation", { length: 120 }),
  preferredLanguage: varchar("preferred_language", { length: 80 }).default("English").notNull(),
  profilePhotoUrl: text("profile_photo_url"),
  address: jsonb("address").$type<{ line1: string; line2?: string; city: string; state: string; postalCode: string }>(),
  emergencyContact: jsonb("emergency_contact").$type<{ name: string; phone: string; relationship: string }>(),
  allergies: text("allergies").default("").notNull(),
  medications: text("medications").default("").notNull(),
  insurance: jsonb("insurance").$type<{ payer: string; memberId: string; groupId?: string }>(),
  isActive: boolean("is_active").default(true).notNull(),
  consentOnFile: boolean("consent_on_file").default(false).notNull(),
  hipaaNoticeAcceptedAt: timestamp("hipaa_notice_accepted_at", { withTimezone: true }),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  updatedByUserId: uuid("updated_by_user_id").references(() => users.id),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  userUnique: uniqueIndex("patients_user_unique").on(table.userId),
  mrnUnique: uniqueIndex("patients_branch_mrn_unique").on(table.branchId, table.mrn),
  nameIdx: index("patients_name_idx").on(table.lastName, table.firstName),
  branchIdx: index("patients_branch_idx").on(table.branchId)
}));

export const patientAddresses = pgTable("patient_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  addressType: varchar("address_type", { length: 32 }).default("home").notNull(),
  line1: varchar("line1", { length: 255 }).notNull(),
  line2: varchar("line2", { length: 255 }),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 120 }).default("USA").notNull(),
  isPrimary: boolean("is_primary").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_addresses_patient_idx").on(table.patientId)
}));

export const patientFamilyMembers = pgTable("patient_family_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  relatedPatientId: uuid("related_patient_id").references(() => patients.id, { onDelete: "set null" }),
  name: varchar("name", { length: 160 }).notNull(),
  relationship: varchar("relationship", { length: 80 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 255 }),
  dateOfBirth: date("date_of_birth"),
  isDependent: boolean("is_dependent").default(false).notNull(),
  isEmergencyContact: boolean("is_emergency_contact").default(false).notNull(),
  notes: text("notes"),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_family_members_patient_idx").on(table.patientId)
}));

export const patientEmergencyContacts = pgTable("patient_emergency_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  relationship: varchar("relationship", { length: 80 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  priority: integer("priority").default(1).notNull(),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_emergency_contacts_patient_idx").on(table.patientId)
}));

export const patientInsurance = pgTable("patient_insurance", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  payerName: varchar("payer_name", { length: 160 }).notNull(),
  payerId: varchar("payer_id", { length: 80 }),
  memberId: varchar("member_id", { length: 120 }).notNull(),
  policyNumber: varchar("policy_number", { length: 120 }),
  groupNumber: varchar("group_number", { length: 120 }),
  policyHolderName: varchar("policy_holder_name", { length: 160 }),
  relationshipToPatient: varchar("relationship_to_patient", { length: 80 }),
  policyHolderDob: date("policy_holder_dob"),
  validFrom: date("valid_from"),
  validTo: date("valid_to"),
  coverageNotes: text("coverage_notes"),
  copayAmount: numeric("copay_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  verificationStatus: insuranceVerificationStatusEnum("verification_status").default("not_verified").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  isPrimary: boolean("is_primary").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_insurance_patient_idx").on(table.patientId),
  memberIdx: index("patient_insurance_member_idx").on(table.memberId)
}));

export const patientAllergies = pgTable("patient_allergies", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  allergen: varchar("allergen", { length: 160 }).notNull(),
  allergyType: varchar("allergy_type", { length: 64 }).default("other").notNull(),
  reaction: varchar("reaction", { length: 255 }),
  notes: text("notes"),
  recordedByUserId: uuid("recorded_by_user_id").references(() => users.id),
  severity: varchar("severity", { length: 32 }),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  notedAt: timestamp("noted_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_allergies_patient_idx").on(table.patientId)
}));

export const patientMedicalHistories = pgTable("patient_medical_histories", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  conditionName: varchar("condition_name", { length: 180 }).notNull(),
  diagnosisDate: date("diagnosis_date"),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  severity: varchar("severity", { length: 32 }),
  notes: text("notes"),
  recordedByUserId: uuid("recorded_by_user_id").references(() => users.id),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_medical_histories_patient_idx").on(table.patientId),
  statusIdx: index("patient_medical_histories_status_idx").on(table.patientId, table.status)
}));

export const patientNotes = pgTable("patient_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  authorUserId: uuid("author_user_id").references(() => users.id),
  noteType: varchar("note_type", { length: 64 }).default("general").notNull(),
  title: varchar("title", { length: 160 }),
  body: text("body").notNull(),
  visibility: varchar("visibility", { length: 32 }).default("care_team").notNull(),
  soap: jsonb("soap").$type<{ subjective?: string; objective?: string; assessment?: string; plan?: string }>(),
  icd10Codes: jsonb("icd10_codes").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  cptCodes: jsonb("cpt_codes").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  isSensitive: boolean("is_sensitive").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_notes_patient_idx").on(table.patientId),
  authorIdx: index("patient_notes_author_idx").on(table.authorUserId)
}));

export const patientDocuments = pgTable("patient_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id),
  documentType: documentTypeEnum("document_type").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  storageKey: text("storage_key").notNull(),
  byteSize: integer("byte_size").notNull(),
  description: text("description"),
  isSensitive: boolean("is_sensitive").default(false).notNull(),
  checksum: varchar("checksum", { length: 128 }),
  encrypted: boolean("encrypted").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_documents_patient_idx").on(table.patientId),
  typeIdx: index("patient_documents_type_idx").on(table.documentType)
}));

export const patientTimelines = pgTable("patient_timelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  eventType: varchar("event_type", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`).notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_timelines_patient_idx").on(table.patientId),
  occurredIdx: index("patient_timelines_occurred_idx").on(table.patientId, table.occurredAt)
}));

export const patientAiSummaries = pgTable("patient_ai_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  requestedByUserId: uuid("requested_by_user_id").references(() => users.id),
  summaryType: varchar("summary_type", { length: 64 }).default("clinical").notNull(),
  summary: text("summary").notNull(),
  sourceSnapshot: jsonb("source_snapshot").default(sql`'{}'::jsonb`).notNull(),
  isSuggestionOnly: boolean("is_suggestion_only").default(true).notNull(),
  approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_ai_summaries_patient_idx").on(table.patientId),
  createdIdx: index("patient_ai_summaries_created_idx").on(table.patientId, table.createdAt)
}));

export const patientFollowupSuggestions = pgTable("patient_followup_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  requestedByUserId: uuid("requested_by_user_id").references(() => users.id),
  recommendedDate: date("recommended_date"),
  department: varchar("department", { length: 120 }),
  recommendedDoctorId: uuid("recommended_doctor_id"),
  reason: text("reason").notNull(),
  priority: varchar("priority", { length: 32 }).default("routine").notNull(),
  status: aiRecommendationStatusEnum("status").default("pending").notNull(),
  isSuggestionOnly: boolean("is_suggestion_only").default(true).notNull(),
  approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  patientIdx: index("patient_followup_suggestions_patient_idx").on(table.patientId),
  statusIdx: index("patient_followup_suggestions_status_idx").on(table.patientId, table.status),
  recommendedDoctorFk: foreignKey({
    columns: [table.recommendedDoctorId],
    foreignColumns: [doctors.id],
    name: "patient_followup_doctor_fk"
  })
}));

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  departmentId: uuid("department_id").references(() => departments.id),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  gender: varchar("gender", { length: 32 }),
  dateOfBirth: date("date_of_birth"),
  specialization: varchar("specialization", { length: 120 }).notNull(),
  qualification: text("qualification"),
  experienceYears: integer("experience_years").default(0).notNull(),
  npi: varchar("npi", { length: 32 }),
  deaNumber: varchar("dea_number", { length: 32 }),
  licenseNumber: varchar("license_number", { length: 64 }).notNull(),
  stateLicenseNumber: varchar("state_license_number", { length: 64 }),
  consultationFee: numeric("consultation_fee", { precision: 12, scale: 2 }).default("0").notNull(),
  bio: text("bio"),
  isActive: boolean("is_active").default(true).notNull(),
  visitDurationMinutes: integer("visit_duration_minutes").default(20).notNull(),
  ...timestamps()
}, (table) => ({
  branchIdx: index("doctors_branch_idx").on(table.branchId),
  userUnique: uniqueIndex("doctors_user_unique").on(table.userId),
  emailIdx: index("doctors_email_idx").on(table.email)
}));

export const doctorSchedules = pgTable("doctor_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  startTime: varchar("start_time", { length: 16 }).notNull(),
  endTime: varchar("end_time", { length: 16 }).notNull(),
  ...timestamps()
}, (table) => ({
  doctorDayIdx: index("doctor_schedules_doctor_day_idx").on(table.doctorId, table.dayOfWeek)
}));

export const doctorBreaks = pgTable("doctor_breaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  breakType: varchar("break_type", { length: 32 }).notNull(),
  breakName: varchar("break_name", { length: 64 }),
  startTime: varchar("start_time", { length: 16 }).notNull(),
  endTime: varchar("end_time", { length: 16 }).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  doctorIdx: index("doctor_breaks_doctor_idx").on(table.doctorId)
}));

export const doctorLeaveBlocks = pgTable("doctor_leave_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  leaveType: varchar("leave_type", { length: 32 }).notNull(),
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
  startTime: varchar("start_time", { length: 16 }),
  endTime: varchar("end_time", { length: 16 }),
  reason: text("reason"),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  ...timestamps()
}, (table) => ({
  doctorDateIdx: index("doctor_leave_blocks_doctor_date_idx").on(table.doctorId, table.fromDate, table.toDate)
}));

export const doctorVisitSettings = pgTable("doctor_visit_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull().unique(),
  visitDurationMinutes: integer("visit_duration_minutes").default(20).notNull(),
  bufferTimeMinutes: integer("buffer_time_minutes").default(5).notNull(),
  maxPatientsPerDay: integer("max_patients_per_day").default(20).notNull(),
  autoGenerateSlots: boolean("auto_generate_slots").default(true).notNull(),
  allowOnlineConsultation: boolean("allow_online_consultation").default(false).notNull(),
  calendarSyncEnabled: boolean("calendar_sync_enabled").default(false).notNull(),
  calendarAccessToken: text("calendar_access_token"),
  calendarRefreshToken: text("calendar_refresh_token"),
  calendarTokenExpiry: timestamp("calendar_token_expiry", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  doctorIdx: index("doctor_visit_settings_doctor_idx").on(table.doctorId)
}));

export const calendarProviderEnum = pgEnum("calendar_provider", ["google", "outlook", "ical"]);
export const calendarSyncStatusEnum = pgEnum("calendar_sync_status", ["connected", "disconnected", "failed", "expired"]);
export const calendarSyncTypeEnum = pgEnum("calendar_sync_type", ["manual", "automatic", "callback"]);
export const calendarSyncLogStatusEnum = pgEnum("calendar_sync_log_status", ["success", "failed"]);
export const calendarEventStatusEnum = pgEnum("calendar_event_status", ["busy", "cancelled"]);

export const doctorCalendarConnections = pgTable("doctor_calendar_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  provider: calendarProviderEnum("provider").notNull().default("google"),
  providerAccountEmail: varchar("provider_account_email", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenType: varchar("token_type", { length: 32 }),
  scope: text("scope"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  calendarId: varchar("calendar_id", { length: 255 }).default("primary"),
  isConnected: boolean("is_connected").default(false).notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  syncStatus: calendarSyncStatusEnum("sync_status").default("disconnected").notNull(),
  syncError: text("sync_error"),
  ...timestamps()
}, (table) => ({
  doctorIdx: index("doctor_calendar_connections_doctor_idx").on(table.doctorId),
  userIdx: index("doctor_calendar_connections_user_idx").on(table.userId),
  emailIdx: index("doctor_calendar_connections_email_idx").on(table.providerAccountEmail),
  uniqueDoctor: uniqueIndex("doctor_calendar_connection_unique").on(table.doctorId, table.provider)
}));

export const doctorIntegrations = pgTable("doctor_integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  provider: integrationProviderEnum("provider").notNull(),
  providerAccountEmail: varchar("provider_account_email", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenType: varchar("token_type", { length: 32 }),
  scope: text("scope"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  calendarId: varchar("calendar_id", { length: 255 }).default("primary").notNull(),
  status: integrationStatusEnum("status").default("disconnected").notNull(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  ...timestamps()
}, (table) => ({
  doctorIdx: index("doctor_integrations_doctor_idx").on(table.doctorId),
  userIdx: index("doctor_integrations_user_idx").on(table.userId),
  providerIdx: index("doctor_integrations_provider_idx").on(table.provider),
  uniqueDoctorProvider: uniqueIndex("doctor_integrations_doctor_provider_unique").on(table.doctorId, table.provider)
}));

export const doctorCalendarBusyEvents = pgTable("doctor_calendar_busy_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  connectionId: uuid("connection_id"),
  integrationId: uuid("integration_id"),
  providerEventId: varchar("provider_event_id", { length: 255 }),
  calendarId: varchar("calendar_id", { length: 255 }),
  title: varchar("title", { length: 255 }),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  isAllDay: boolean("is_all_day").default(false).notNull(),
  status: calendarEventStatusEnum("status").default("busy").notNull(),
  source: calendarProviderEnum("source").default("google"),
  ...timestamps()
}, (table) => ({
  doctorIdx: index("doctor_calendar_busy_events_doctor_idx").on(table.doctorId),
  connectionIdx: index("doctor_calendar_busy_events_connection_idx").on(table.connectionId),
  integrationIdx: index("doctor_calendar_busy_events_integration_idx").on(table.integrationId),
  dateRangeIdx: index("doctor_calendar_busy_events_date_idx").on(table.doctorId, table.startAt, table.endAt),
  connectionFk: foreignKey({
    columns: [table.connectionId],
    foreignColumns: [doctorCalendarConnections.id],
    name: "doctor_busy_connection_fk"
  }).onDelete("cascade"),
  integrationFk: foreignKey({
    columns: [table.integrationId],
    foreignColumns: [doctorIntegrations.id],
    name: "doctor_busy_integration_fk"
  }).onDelete("cascade")
}));

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentNumber: varchar("appointment_number", { length: 64 }),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  departmentId: uuid("department_id").references(() => departments.id),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  slotId: uuid("slot_id"),
  bookedByUserId: uuid("booked_by_user_id").references(() => users.id),
  status: appointmentStatusEnum("status").default("scheduled").notNull(),
  mode: appointmentModeEnum("mode").default("offline").notNull(),
  consultationMode: consultationModeEnum("consultation_mode").default("offline").notNull(),
  appointmentType: appointmentTypeEnum("appointment_type").default("consultation").notNull(),
  locationType: locationTypeEnum("location_type").default("clinic").notNull(),
  priority: queuePriorityEnum("priority").default("routine").notNull(),
  roomId: uuid("room_id"),
  roomNumber: varchar("room_number", { length: 64 }),
  location: text("location"),
  appointmentDate: date("appointment_date"),
  startTime: varchar("start_time", { length: 16 }),
  endTime: varchar("end_time", { length: 16 }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  visitReason: varchar("visit_reason", { length: 255 }),
  symptoms: text("symptoms"),
  notes: text("notes"),
  insuranceId: uuid("insurance_id").references(() => patientInsurance.id),
  insuranceVerificationStatus: insuranceVerificationStatusEnum("insurance_verification_status").default("not_verified").notNull(),
  cptCodes: jsonb("cpt_codes").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  icd10Codes: jsonb("icd10_codes").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  queueToken: varchar("queue_token", { length: 32 }),
  queueNumber: integer("queue_number"),
  tokenNumber: varchar("token_number", { length: 32 }),
  queuePriority: queuePriorityEnum("queue_priority").default("routine").notNull(),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  meetingProvider: varchar("meeting_provider", { length: 64 }),
  meetingUrl: text("meeting_url"),
  meetingEventId: varchar("meeting_event_id", { length: 255 }),
  meetingCreatedAt: timestamp("meeting_created_at", { withTimezone: true }),
  googleCalendarEventId: varchar("google_calendar_event_id", { length: 255 }),
  googleMeetLink: text("google_meet_link"),
  aiIntakeSummary: text("ai_intake_summary"),
  ...timestamps()
}, (table) => ({
  appointmentNumberUnique: uniqueIndex("appointments_number_unique").on(table.appointmentNumber),
  branchScheduleIdx: index("appointments_branch_schedule_idx").on(table.branchId, table.startsAt),
  doctorScheduleIdx: index("appointments_doctor_schedule_idx").on(table.doctorId, table.startsAt),
  patientIdx: index("appointments_patient_idx").on(table.patientId),
  statusIdx: index("appointments_status_idx").on(table.branchId, table.status),
  slotIdx: index("appointments_slot_idx").on(table.slotId)
}));

export const appointmentStatusHistory = pgTable("appointment_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  oldStatus: appointmentStatusEnum("old_status"),
  newStatus: appointmentStatusEnum("new_status").notNull(),
  changedByUserId: uuid("changed_by_user_id").references(() => users.id),
  reason: text("reason"),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps()
}, (table) => ({
  appointmentIdx: index("appointment_status_history_appointment_idx").on(table.appointmentId, table.changedAt),
  changedByIdx: index("appointment_status_history_changed_by_idx").on(table.changedByUserId)
}));

export const appointmentQueueTokens = pgTable("appointment_queue_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  tokenNumber: varchar("token_number", { length: 32 }).notNull(),
  queuePosition: integer("queue_position").default(1).notNull(),
  estimatedWaitMinutes: integer("estimated_wait_minutes").default(0).notNull(),
  queueStatus: appointmentQueueStatusEnum("queue_status").default("waiting").notNull(),
  priority: queuePriorityEnum("priority").default("routine").notNull(),
  calledAt: timestamp("called_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  appointmentUnique: uniqueIndex("appointment_queue_tokens_appointment_unique").on(table.appointmentId),
  branchIdx: index("appointment_queue_tokens_branch_idx").on(table.branchId, table.queueStatus, table.createdAt),
  tokenIdx: index("appointment_queue_tokens_token_idx").on(table.branchId, table.tokenNumber)
}));

export const appointmentNotes = pgTable("appointment_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  authorUserId: uuid("author_user_id").references(() => users.id),
  noteType: varchar("note_type", { length: 64 }).default("general").notNull(),
  body: text("body").notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  ...timestamps()
}, (table) => ({
  appointmentIdx: index("appointment_notes_appointment_idx").on(table.appointmentId),
  authorIdx: index("appointment_notes_author_idx").on(table.authorUserId)
}));

export const appointmentReschedules = pgTable("appointment_reschedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  oldStartsAt: timestamp("old_starts_at", { withTimezone: true }).notNull(),
  oldEndsAt: timestamp("old_ends_at", { withTimezone: true }).notNull(),
  newStartsAt: timestamp("new_starts_at", { withTimezone: true }).notNull(),
  newEndsAt: timestamp("new_ends_at", { withTimezone: true }).notNull(),
  reason: text("reason"),
  changedByUserId: uuid("changed_by_user_id").references(() => users.id),
  notifyPatient: boolean("notify_patient").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  appointmentIdx: index("appointment_reschedules_appointment_idx").on(table.appointmentId)
}));

export const appointmentCancellations = pgTable("appointment_cancellations", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  reason: text("reason").notNull(),
  cancelledByUserId: uuid("cancelled_by_user_id").references(() => users.id),
  notifyPatient: boolean("notify_patient").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  appointmentIdx: index("appointment_cancellations_appointment_idx").on(table.appointmentId)
}));

export const appointmentReminders = pgTable("appointment_reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  channel: notificationChannelEnum("channel").notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  status: appointmentReminderStatusEnum("status").default("queued").notNull(),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  appointmentIdx: index("appointment_reminders_appointment_idx").on(table.appointmentId),
  scheduleIdx: index("appointment_reminders_schedule_idx").on(table.status, table.scheduledFor)
}));

export const appointmentAiPredictions = pgTable("appointment_ai_predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  noShowRiskScore: numeric("no_show_risk_score", { precision: 5, scale: 4 }).default("0").notNull(),
  riskLevel: varchar("risk_level", { length: 32 }).default("low").notNull(),
  recommendedReminderFrequency: varchar("recommended_reminder_frequency", { length: 64 }).default("standard").notNull(),
  recommendedSlotAt: timestamp("recommended_slot_at", { withTimezone: true }),
  signals: jsonb("signals").default(sql`'{}'::jsonb`).notNull(),
  model: varchar("model", { length: 80 }).default("heuristic-v1").notNull(),
  ...timestamps()
}, (table) => ({
  appointmentUnique: uniqueIndex("appointment_ai_predictions_appointment_unique").on(table.appointmentId),
  riskIdx: index("appointment_ai_predictions_risk_idx").on(table.riskLevel)
}));

export const appointmentCalendarEvents = pgTable("appointment_calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  integrationId: uuid("integration_id").references(() => doctorIntegrations.id, { onDelete: "set null" }),
  provider: integrationProviderEnum("provider").default("google_calendar").notNull(),
  providerEventId: varchar("provider_event_id", { length: 255 }).notNull(),
  calendarId: varchar("calendar_id", { length: 255 }).default("primary").notNull(),
  eventUrl: text("event_url"),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
  syncStatus: varchar("sync_status", { length: 32 }).default("pending").notNull(),
  syncError: text("sync_error"),
  ...timestamps()
}, (table) => ({
  appointmentUnique: uniqueIndex("appointment_calendar_events_appointment_unique").on(table.appointmentId),
  doctorIdx: index("appointment_calendar_events_doctor_idx").on(table.doctorId)
}));

export const appointmentMeetSessions = pgTable("appointment_meet_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  provider: integrationProviderEnum("provider").default("google_meet").notNull(),
  meetingUrl: text("meeting_url").notNull(),
  meetingCode: varchar("meeting_code", { length: 120 }),
  providerEventId: varchar("provider_event_id", { length: 255 }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  ...timestamps()
}, (table) => ({
  appointmentUnique: uniqueIndex("appointment_meet_sessions_appointment_unique").on(table.appointmentId),
  doctorIdx: index("appointment_meet_sessions_doctor_idx").on(table.doctorId)
}));

export const doctorMeetEvents = pgTable("doctor_meet_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  integrationId: uuid("integration_id").references(() => doctorIntegrations.id, { onDelete: "cascade" }).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  googleEventId: varchar("google_event_id", { length: 255 }),
  meetUrl: text("meet_url").notNull(),
  meetCode: varchar("meet_code", { length: 120 }),
  title: varchar("title", { length: 255 }),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  ...timestamps()
}, (table) => ({
  doctorIdx: index("doctor_meet_events_doctor_idx").on(table.doctorId),
  integrationIdx: index("doctor_meet_events_integration_idx").on(table.integrationId),
  appointmentUnique: uniqueIndex("doctor_meet_events_appointment_unique").on(table.appointmentId)
}));

export const doctorCalendarSyncLogs = pgTable("doctor_calendar_sync_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  connectionId: uuid("connection_id").notNull(),
  syncType: calendarSyncTypeEnum("sync_type").notNull(),
  status: calendarSyncLogStatusEnum("status").notNull(),
  message: text("message"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  doctorIdx: index("doctor_calendar_sync_logs_doctor_idx").on(table.doctorId),
  connectionIdx: index("doctor_calendar_sync_logs_connection_idx").on(table.connectionId),
  createdIdx: index("doctor_calendar_sync_logs_created_idx").on(table.createdAt),
  connectionFk: foreignKey({
    columns: [table.connectionId],
    foreignColumns: [doctorCalendarConnections.id],
    name: "doctor_sync_connection_fk"
  }).onDelete("cascade")
}));

export const doctorAppointmentSlots = pgTable("doctor_appointment_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  slotDate: date("slot_date").notNull(),
  startTime: varchar("start_time", { length: 16 }).notNull(),
  endTime: varchar("end_time", { length: 16 }).notNull(),
  status: varchar("status", { length: 32 }).default("available").notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  ...timestamps()
}, (table) => ({
  doctorDateIdx: index("doctor_appointment_slots_doctor_date_idx").on(table.doctorId, table.slotDate),
  statusIdx: index("doctor_appointment_slots_status_idx").on(table.status)
}));

export const appointmentQueueEntries = pgTable("appointment_queue_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  token: varchar("token", { length: 32 }).notNull(),
  priority: queuePriorityEnum("priority").default("routine").notNull(),
  status: varchar("status", { length: 64 }).default("waiting").notNull(),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).defaultNow().notNull(),
  calledAt: timestamp("called_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  branchIdx: index("appointment_queue_branch_idx").on(table.branchId, table.checkedInAt),
  appointmentUnique: uniqueIndex("appointment_queue_appointment_unique").on(table.appointmentId),
  tokenIdx: index("appointment_queue_token_idx").on(table.branchId, table.token)
}));

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 64 }),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  copayAmount: numeric("copay_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  insuranceAmount: numeric("insurance_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
  amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).default("0").notNull(),
  balanceDue: numeric("balance_due", { precision: 12, scale: 2 }).default("0").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  dueDate: date("due_date"),
  ...timestamps()
}, (table) => ({
  branchIdx: index("invoices_branch_idx").on(table.branchId),
  patientIdx: index("invoices_patient_idx").on(table.patientId),
  invoiceNumberUnique: uniqueIndex("invoices_invoice_number_unique").on(table.invoiceNumber)
}));

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  cptCode: varchar("cpt_code", { length: 16 }),
  icd10Code: varchar("icd10_code", { length: 16 }),
  quantity: integer("quantity").default(1).notNull(),
  unitAmount: numeric("unit_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  ...timestamps()
}, (table) => ({
  invoiceIdx: index("invoice_items_invoice_idx").on(table.invoiceId)
}));

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  referenceNumber: varchar("reference_number", { length: 120 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  invoiceIdx: index("payments_invoice_idx").on(table.invoiceId),
  patientIdx: index("payments_patient_idx").on(table.patientId)
}));

export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "cascade" }).notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  status: refundStatusEnum("status").default("pending").notNull(),
  stripeRefundId: varchar("stripe_refund_id", { length: 255 }),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  paymentIdx: index("refunds_payment_idx").on(table.paymentId),
  invoiceIdx: index("refunds_invoice_idx").on(table.invoiceId)
}));

export const billingSettings = pgTable("billing_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }).notNull(),
  invoicePrefix: varchar("invoice_prefix", { length: 16 }).default("INV").notNull(),
  taxRate: numeric("tax_rate", { precision: 6, scale: 4 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  paymentTermsDays: integer("payment_terms_days").default(15).notNull(),
  superbillEnabled: boolean("superbill_enabled").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  branchUnique: uniqueIndex("billing_settings_branch_unique").on(table.branchId)
}));

export const insuranceClaims = pgTable("insurance_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  insuranceId: uuid("insurance_id").references(() => patientInsurance.id),
  claimNumber: varchar("claim_number", { length: 80 }),
  status: claimStatusEnum("status").default("draft").notNull(),
  cptCodes: jsonb("cpt_codes").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  icd10Codes: jsonb("icd10_codes").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  billedAmount: numeric("billed_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  allowedAmount: numeric("allowed_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  adjudicatedAt: timestamp("adjudicated_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),
  ...timestamps()
}, (table) => ({
  branchIdx: index("insurance_claims_branch_idx").on(table.branchId),
  invoiceIdx: index("insurance_claims_invoice_idx").on(table.invoiceId),
  claimNumberIdx: index("insurance_claims_claim_number_idx").on(table.claimNumber)
}));

export const aiPrompts = pgTable("ai_prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 120 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  model: varchar("model", { length: 80 }).default("gpt-4.1-mini").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps()
}, (table) => ({
  keyUnique: uniqueIndex("ai_prompts_key_unique").on(table.key)
}));

export const aiAuditLogs = pgTable("ai_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id),
  userId: uuid("user_id").references(() => users.id),
  patientId: uuid("patient_id").references(() => patients.id),
  promptKey: varchar("prompt_key", { length: 120 }).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  inputHash: varchar("input_hash", { length: 128 }),
  outputSummary: text("output_summary"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  branchIdx: index("ai_audit_logs_branch_idx").on(table.branchId, table.createdAt),
  patientIdx: index("ai_audit_logs_patient_idx").on(table.patientId)
}));

export const aiRecommendations = pgTable("ai_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id),
  doctorId: uuid("doctor_id").references(() => doctors.id),
  recommendationType: varchar("recommendation_type", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  status: aiRecommendationStatusEnum("status").default("pending").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  branchIdx: index("ai_recommendations_branch_idx").on(table.branchId, table.status),
  patientIdx: index("ai_recommendations_patient_idx").on(table.patientId),
  doctorIdx: index("ai_recommendations_doctor_idx").on(table.doctorId)
}));

export const payrollRuns = pgTable("payroll_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  status: payrollStatusEnum("status").default("draft").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  grossTotal: numeric("gross_total", { precision: 12, scale: 2 }).default("0").notNull(),
  netTotal: numeric("net_total", { precision: 12, scale: 2 }).default("0").notNull(),
  approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  ...timestamps()
}, (table) => ({
  branchPeriodIdx: index("payroll_runs_branch_period_idx").on(table.branchId, table.periodStart, table.periodEnd)
}));

export const payrollItems = pgTable("payroll_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  payrollRunId: uuid("payroll_run_id").references(() => payrollRuns.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  regularHours: numeric("regular_hours", { precision: 8, scale: 2 }).default("0").notNull(),
  overtimeHours: numeric("overtime_hours", { precision: 8, scale: 2 }).default("0").notNull(),
  grossPay: numeric("gross_pay", { precision: 12, scale: 2 }).default("0").notNull(),
  deductions: numeric("deductions", { precision: 12, scale: 2 }).default("0").notNull(),
  netPay: numeric("net_pay", { precision: 12, scale: 2 }).default("0").notNull(),
  ...timestamps()
}, (table) => ({
  runIdx: index("payroll_items_run_idx").on(table.payrollRunId),
  userIdx: index("payroll_items_user_idx").on(table.userId)
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  action: varchar("action", { length: 160 }).notNull(),
  resourceType: varchar("resource_type", { length: 120 }).notNull(),
  resourceId: uuid("resource_id"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`).notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  actorIdx: index("audit_logs_actor_idx").on(table.actorUserId),
  resourceIdx: index("audit_logs_resource_idx").on(table.resourceType, table.resourceId)
}));

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id),
  channel: notificationChannelEnum("channel").notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  status: varchar("status", { length: 64 }).default("queued").notNull(),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  ...timestamps()
});

export const branchRelations = relations(branches, ({ one, many }) => ({
  departments: many(departments),
  doctors: many(doctors),
  users: many(users),
  patients: many(patients),
  appointments: many(appointments),
  invoices: many(invoices),
  billingSettings: one(billingSettings),
  insuranceClaims: many(insuranceClaims),
  payrollRuns: many(payrollRuns),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  aiAuditLogs: many(aiAuditLogs),
  aiRecommendations: many(aiRecommendations)
}));

export const departmentRelations = relations(departments, ({ one, many }) => ({
  branch: one(branches, {
    fields: [departments.branchId],
    references: [branches.id]
  }),
  users: many(users),
  doctors: many(doctors)
}));

export const userRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id]
  }),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id]
  }),
  doctor: one(doctors),
  sessions: many(userSessions),
  loginHistory: many(loginHistory),
  notificationPreferences: one(notificationPreferences),
  passwordResetTokens: many(passwordResetTokens),
  passwordChangeLogs: many(passwordChangeLogs, { relationName: "passwordChangeUser" }),
  passwordChangesMade: many(passwordChangeLogs, { relationName: "passwordChangeActor" }),
  payrollItems: many(payrollItems),
  approvedPayrollRuns: many(payrollRuns, { relationName: "payrollApprovedBy" }),
  auditLogs: many(auditLogs),
  uploadedDocuments: many(patientDocuments),
  patientNotes: many(patientNotes),
  patientTimelineEvents: many(patientTimelines),
  aiAuditLogs: many(aiAuditLogs)
}));

export const userSessionRelations = relations(userSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id]
  }),
  loginHistory: many(loginHistory),
  passwordChangeLogs: many(passwordChangeLogs)
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id]
  }),
  session: one(userSessions, {
    fields: [loginHistory.sessionId],
    references: [userSessions.id]
  })
}));

export const notificationPreferenceRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id]
  })
}));

export const passwordChangeLogRelations = relations(passwordChangeLogs, ({ one }) => ({
  user: one(users, {
    fields: [passwordChangeLogs.userId],
    references: [users.id],
    relationName: "passwordChangeUser"
  }),
  changedBy: one(users, {
    fields: [passwordChangeLogs.changedByUserId],
    references: [users.id],
    relationName: "passwordChangeActor"
  }),
  session: one(userSessions, {
    fields: [passwordChangeLogs.sessionId],
    references: [userSessions.id]
  })
}));

export const passwordResetTokenRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id]
  })
}));

export const patientRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id]
  }),
  branch: one(branches, {
    fields: [patients.branchId],
    references: [branches.id]
  }),
  familyMembers: many(patientFamilyMembers),
  emergencyContacts: many(patientEmergencyContacts),
  insurancePolicies: many(patientInsurance),
  allergiesList: many(patientAllergies),
  notes: many(patientNotes),
  documents: many(patientDocuments),
  timelineEvents: many(patientTimelines),
  appointments: many(appointments),
  invoices: many(invoices),
  payments: many(payments),
  insuranceClaims: many(insuranceClaims),
  notifications: many(notifications),
  aiAuditLogs: many(aiAuditLogs),
  aiRecommendations: many(aiRecommendations)
}));

export const patientFamilyMemberRelations = relations(patientFamilyMembers, ({ one }) => ({
  patient: one(patients, {
    fields: [patientFamilyMembers.patientId],
    references: [patients.id]
  })
}));

export const patientEmergencyContactRelations = relations(patientEmergencyContacts, ({ one }) => ({
  patient: one(patients, {
    fields: [patientEmergencyContacts.patientId],
    references: [patients.id]
  })
}));

export const patientInsuranceRelations = relations(patientInsurance, ({ one, many }) => ({
  patient: one(patients, {
    fields: [patientInsurance.patientId],
    references: [patients.id]
  }),
  appointments: many(appointments),
  insuranceClaims: many(insuranceClaims)
}));

export const patientAllergyRelations = relations(patientAllergies, ({ one }) => ({
  patient: one(patients, {
    fields: [patientAllergies.patientId],
    references: [patients.id]
  })
}));

export const patientNoteRelations = relations(patientNotes, ({ one }) => ({
  patient: one(patients, {
    fields: [patientNotes.patientId],
    references: [patients.id]
  }),
  author: one(users, {
    fields: [patientNotes.authorUserId],
    references: [users.id]
  })
}));

export const patientDocumentRelations = relations(patientDocuments, ({ one }) => ({
  patient: one(patients, {
    fields: [patientDocuments.patientId],
    references: [patients.id]
  }),
  uploadedBy: one(users, {
    fields: [patientDocuments.uploadedByUserId],
    references: [users.id]
  })
}));

export const patientTimelineRelations = relations(patientTimelines, ({ one }) => ({
  patient: one(patients, {
    fields: [patientTimelines.patientId],
    references: [patients.id]
  }),
  createdBy: one(users, {
    fields: [patientTimelines.createdByUserId],
    references: [users.id]
  })
}));

export const doctorRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id]
  }),
  branch: one(branches, {
    fields: [doctors.branchId],
    references: [branches.id]
  }),
  department: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id]
  }),
  appointments: many(appointments),
  queueEntries: many(appointmentQueueEntries),
  schedules: many(doctorSchedules),
  breaks: many(doctorBreaks),
  leaveBlocks: many(doctorLeaveBlocks),
  visitSettings: one(doctorVisitSettings),
  appointmentSlots: many(doctorAppointmentSlots),
  calendarConnections: many(doctorCalendarConnections),
  integrations: many(doctorIntegrations),
  calendarBusyEvents: many(doctorCalendarBusyEvents),
  calendarSyncLogs: many(doctorCalendarSyncLogs),
  meetEvents: many(doctorMeetEvents),
  aiRecommendations: many(aiRecommendations)
}));

export const doctorScheduleRelations = relations(doctorSchedules, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorSchedules.doctorId],
    references: [doctors.id]
  })
}));

export const doctorBreakRelations = relations(doctorBreaks, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorBreaks.doctorId],
    references: [doctors.id]
  })
}));

export const doctorLeaveBlockRelations = relations(doctorLeaveBlocks, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorLeaveBlocks.doctorId],
    references: [doctors.id]
  })
}));

export const doctorVisitSettingRelations = relations(doctorVisitSettings, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorVisitSettings.doctorId],
    references: [doctors.id]
  })
}));

export const doctorAppointmentSlotRelations = relations(doctorAppointmentSlots, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorAppointmentSlots.doctorId],
    references: [doctors.id]
  }),
  appointment: one(appointments, {
    fields: [doctorAppointmentSlots.appointmentId],
    references: [appointments.id]
  })
}));

export const doctorCalendarConnectionRelations = relations(doctorCalendarConnections, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [doctorCalendarConnections.doctorId],
    references: [doctors.id]
  }),
  user: one(users, {
    fields: [doctorCalendarConnections.userId],
    references: [users.id]
  }),
  busyEvents: many(doctorCalendarBusyEvents),
  syncLogs: many(doctorCalendarSyncLogs)
}));

export const doctorIntegrationRelations = relations(doctorIntegrations, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [doctorIntegrations.doctorId],
    references: [doctors.id]
  }),
  user: one(users, {
    fields: [doctorIntegrations.userId],
    references: [users.id]
  }),
  busyEvents: many(doctorCalendarBusyEvents),
  meetEvents: many(doctorMeetEvents)
}));

export const doctorCalendarBusyEventRelations = relations(doctorCalendarBusyEvents, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorCalendarBusyEvents.doctorId],
    references: [doctors.id]
  }),
  connection: one(doctorCalendarConnections, {
    fields: [doctorCalendarBusyEvents.connectionId],
    references: [doctorCalendarConnections.id]
  }),
  integration: one(doctorIntegrations, {
    fields: [doctorCalendarBusyEvents.integrationId],
    references: [doctorIntegrations.id]
  })
}));

export const doctorMeetEventRelations = relations(doctorMeetEvents, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorMeetEvents.doctorId],
    references: [doctors.id]
  }),
  integration: one(doctorIntegrations, {
    fields: [doctorMeetEvents.integrationId],
    references: [doctorIntegrations.id]
  }),
  appointment: one(appointments, {
    fields: [doctorMeetEvents.appointmentId],
    references: [appointments.id]
  })
}));

export const doctorCalendarSyncLogRelations = relations(doctorCalendarSyncLogs, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorCalendarSyncLogs.doctorId],
    references: [doctors.id]
  }),
  connection: one(doctorCalendarConnections, {
    fields: [doctorCalendarSyncLogs.connectionId],
    references: [doctorCalendarConnections.id]
  })
}));

export const appointmentRelations = relations(appointments, ({ one, many }) => ({
  branch: one(branches, {
    fields: [appointments.branchId],
    references: [branches.id]
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id]
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id]
  }),
  insurance: one(patientInsurance, {
    fields: [appointments.insuranceId],
    references: [patientInsurance.id]
  }),
  queueEntry: one(appointmentQueueEntries),
  meetEvent: one(doctorMeetEvents),
  invoices: many(invoices)
}));

export const appointmentQueueEntryRelations = relations(appointmentQueueEntries, ({ one }) => ({
  branch: one(branches, {
    fields: [appointmentQueueEntries.branchId],
    references: [branches.id]
  }),
  appointment: one(appointments, {
    fields: [appointmentQueueEntries.appointmentId],
    references: [appointments.id]
  }),
  patient: one(patients, {
    fields: [appointmentQueueEntries.patientId],
    references: [patients.id]
  }),
  doctor: one(doctors, {
    fields: [appointmentQueueEntries.doctorId],
    references: [doctors.id]
  })
}));

export const invoiceRelations = relations(invoices, ({ one, many }) => ({
  branch: one(branches, {
    fields: [invoices.branchId],
    references: [branches.id]
  }),
  patient: one(patients, {
    fields: [invoices.patientId],
    references: [patients.id]
  }),
  appointment: one(appointments, {
    fields: [invoices.appointmentId],
    references: [appointments.id]
  }),
  items: many(invoiceItems),
  payments: many(payments),
  refunds: many(refunds),
  insuranceClaims: many(insuranceClaims)
}));

export const invoiceItemRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id]
  })
}));

export const paymentRelations = relations(payments, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id]
  }),
  patient: one(patients, {
    fields: [payments.patientId],
    references: [patients.id]
  }),
  refunds: many(refunds)
}));

export const refundRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id]
  }),
  invoice: one(invoices, {
    fields: [refunds.invoiceId],
    references: [invoices.id]
  })
}));

export const billingSettingRelations = relations(billingSettings, ({ one }) => ({
  branch: one(branches, {
    fields: [billingSettings.branchId],
    references: [branches.id]
  })
}));

export const insuranceClaimRelations = relations(insuranceClaims, ({ one }) => ({
  branch: one(branches, {
    fields: [insuranceClaims.branchId],
    references: [branches.id]
  }),
  invoice: one(invoices, {
    fields: [insuranceClaims.invoiceId],
    references: [invoices.id]
  }),
  patient: one(patients, {
    fields: [insuranceClaims.patientId],
    references: [patients.id]
  }),
  insurance: one(patientInsurance, {
    fields: [insuranceClaims.insuranceId],
    references: [patientInsurance.id]
  })
}));

export const payrollRunRelations = relations(payrollRuns, ({ one, many }) => ({
  branch: one(branches, {
    fields: [payrollRuns.branchId],
    references: [branches.id]
  }),
  approvedBy: one(users, {
    fields: [payrollRuns.approvedByUserId],
    references: [users.id],
    relationName: "payrollApprovedBy"
  }),
  items: many(payrollItems)
}));

export const payrollItemRelations = relations(payrollItems, ({ one }) => ({
  payrollRun: one(payrollRuns, {
    fields: [payrollItems.payrollRunId],
    references: [payrollRuns.id]
  }),
  user: one(users, {
    fields: [payrollItems.userId],
    references: [users.id]
  })
}));

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  branch: one(branches, {
    fields: [auditLogs.branchId],
    references: [branches.id]
  }),
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id]
  })
}));

export const aiPromptRelations = relations(aiPrompts, () => ({}));

export const aiAuditLogRelations = relations(aiAuditLogs, ({ one }) => ({
  branch: one(branches, {
    fields: [aiAuditLogs.branchId],
    references: [branches.id]
  }),
  user: one(users, {
    fields: [aiAuditLogs.userId],
    references: [users.id]
  }),
  patient: one(patients, {
    fields: [aiAuditLogs.patientId],
    references: [patients.id]
  })
}));

export const aiRecommendationRelations = relations(aiRecommendations, ({ one }) => ({
  branch: one(branches, {
    fields: [aiRecommendations.branchId],
    references: [branches.id]
  }),
  patient: one(patients, {
    fields: [aiRecommendations.patientId],
    references: [patients.id]
  }),
  doctor: one(doctors, {
    fields: [aiRecommendations.doctorId],
    references: [doctors.id]
  })
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  branch: one(branches, {
    fields: [notifications.branchId],
    references: [branches.id]
  }),
  patient: one(patients, {
    fields: [notifications.patientId],
    references: [patients.id]
  })
}));
