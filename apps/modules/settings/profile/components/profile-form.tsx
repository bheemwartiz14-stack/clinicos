"use client";

import { useActionState, useEffect, useState } from "react";
import { Bot, CalendarClock, CalendarX2, Clock3, Link2, Save, Sparkles } from "lucide-react";
import { updateProfileAction, type SettingsActionState } from "../actions/settings.actions";
import type { SettingsOption, SettingsProfile } from "../types/settings.types";
import { AvatarUploader } from "./avatar-uploader";
import { Field, SelectField, TextArea } from "./settings-fields";
import { settingsToast } from "./toast-event";
import { DatePickerField } from "@/components/form-controls";

const initialState: SettingsActionState = { ok: false, message: "" };

function error(state: SettingsActionState, field: string) {
  return state.fieldErrors?.[field]?.[0];
}

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid gap-2 text-sm">
      <span className="font-semibold text-foreground">{label}</span>
      <div className="flex h-11 items-center rounded-lg border border-border bg-muted/50 px-3 text-sm font-medium text-muted-foreground">
        {value || "Not assigned"}
      </div>
    </div>
  );
}

function DoctorPracticeTabs({ profile }: { profile: SettingsProfile }) {
  const [activeTab, setActiveTab] = useState("profile");
  const tabs = [
    { id: "profile", label: "Profile", icon: Sparkles },
    { id: "schedule", label: "Schedules", icon: CalendarClock },
    { id: "availability", label: "Slots", icon: Clock3 },
    { id: "leave", label: "Leave", icon: CalendarX2 },
    { id: "calendar", label: "Calendar", icon: Link2 },
    { id: "ai", label: "AI", icon: Bot }
  ];

  return (
    <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-background text-foreground ring-1 ring-border hover:bg-muted"
            }`}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab !== "profile" ? (
        <>
          <input type="hidden" name="specialty" value={profile.specialty ?? ""} />
          <input type="hidden" name="licenseNumber" value={profile.licenseNumber ?? ""} />
          <input type="hidden" name="experienceYears" value={profile.experienceYears ?? 0} />
          <input type="hidden" name="consultationFee" value={profile.consultationFee ?? 0} />
        </>
      ) : null}

      {activeTab === "profile" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Specialization" name="specialty" defaultValue={profile.specialty} error={undefined} />
          <Field label="License number" name="licenseNumber" defaultValue={profile.licenseNumber} error={undefined} />
          <Field label="Experience years" name="experienceYears" type="number" defaultValue={profile.experienceYears ?? 0} error={undefined} />
          <Field label="Consultation fee" name="consultationFee" type="number" defaultValue={profile.consultationFee ?? 0} error={undefined} />
        </div>
      ) : null}

      {activeTab === "schedule" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Default day start" name="doctorScheduleStartPreview" type="time" defaultValue="09:00" />
          <Field label="Default day end" name="doctorScheduleEndPreview" type="time" defaultValue="17:00" />
          <Field label="Visit duration" name="doctorVisitDurationPreview" type="number" defaultValue={20} />
          <p className="rounded-lg border border-primary/20 bg-background p-3 text-sm text-foreground/80 md:col-span-2">Schedule tabs are ready for the doctor-owned schedule tables. These controls are not assigned to admin branch or department management.</p>
        </div>
      ) : null}

      {activeTab === "availability" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Slot window start" name="availabilityStartPreview" type="time" defaultValue="09:00" />
          <Field label="Slot window end" name="availabilityEndPreview" type="time" defaultValue="13:00" />
          <p className="rounded-lg border border-primary/20 bg-background p-3 text-sm text-foreground/80 md:col-span-2">Doctors own availability slots; admins should only see resulting capacity for booking and operations.</p>
        </div>
      ) : null}

      {activeTab === "leave" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Block date" name="leaveDatePreview" type="date" />
          <Field label="Reason" name="leaveReasonPreview" placeholder="Conference, vacation, emergency" />
          <p className="rounded-lg border border-primary/20 bg-background p-3 text-sm text-foreground/80 md:col-span-2">Leave and block dates belong to the doctor workflow and should block appointment slot recommendations.</p>
        </div>
      ) : null}

      {activeTab === "calendar" ? (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-foreground">Google Calendar sync</p>
              <p className="mt-1 text-sm text-muted-foreground">Connect OAuth here when the integration keys and callback route are ready.</p>
            </div>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 text-sm font-semibold text-primary">
              <Link2 className="h-4 w-4" aria-hidden />
              Connect
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === "ai" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="font-semibold text-foreground">AI schedule optimization</p>
            <p className="mt-2 text-sm text-muted-foreground">Use appointment history, leaves, and preferred hours to reduce gaps.</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="font-semibold text-foreground">AI slot recommendation</p>
            <p className="mt-2 text-sm text-muted-foreground">Recommend the best slot from doctor availability and patient urgency.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProfileForm({ profile, branches, departments }: { profile: SettingsProfile; branches: SettingsOption[]; departments: SettingsOption[] }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  const isDoctor = profile.role === "doctor";
  useEffect(() => {
    if (!state.message) return;
    settingsToast(state.ok ? "success" : "error", state.message);
  }, [state]);

  return (
    <form action={action} className="grid gap-5">
      <section id={isDoctor ? "doctor-practice" : undefined} className="rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep identity, contact, assignment, and professional details current.</p>
        </div>
        <AvatarUploader name={profile.name} defaultValue={profile.avatar} />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Full name" name="name" defaultValue={profile.name} error={error(state, "name")} required />
          <Field label="Username" name="username" defaultValue={profile.username} error={error(state, "username")} />
          <Field label="Email" name="email" type="email" defaultValue={profile.email} error={error(state, "email")} required />
          <Field label="Phone number" name="phone" type="tel" defaultValue={profile.phone} error={error(state, "phone")} />
          <SelectField label="Gender" name="gender" defaultValue={profile.gender} error={error(state, "gender")}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non_binary">Non-binary</option>
            <option value="other">Other</option>
          </SelectField>
          <DatePickerField label="Date of birth" name="dob" type="date" defaultValue={profile.dob ?? undefined} error={error(state, "dob")} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur">
        <h2 className="text-lg font-semibold text-foreground">Contact & Address</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Address" name="address" defaultValue={profile.address} error={error(state, "address")} />
          <Field label="City" name="city" defaultValue={profile.city} error={error(state, "city")} />
          <Field label="State" name="state" defaultValue={profile.state} error={error(state, "state")} />
          <Field label="ZIP code" name="zipCode" defaultValue={profile.zipCode} error={error(state, "zipCode")} />
          <Field label="Country" name="country" defaultValue={profile.country} error={error(state, "country")} />
          <Field label="Emergency contact name" name="emergencyContactName" defaultValue={profile.emergencyContact?.name} />
          <Field label="Emergency contact phone" name="emergencyContactPhone" defaultValue={profile.emergencyContact?.phone} />
          <SelectField label="Relationship" name="emergencyContactRelationship" defaultValue={profile.emergencyContact?.relationship}>
            <option value="">Select relationship</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="sibling">Sibling</option>
            <option value="guardian">Guardian</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </SelectField>
        </div>
        <div className="mt-4">
          <TextArea label="Bio/About" name="bio" defaultValue={profile.bio} error={error(state, "bio")} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur">
        <h2 className="text-lg font-semibold text-foreground">Role & Assignment</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Role" name="roleDisplay" defaultValue={profile.role} />
          {isDoctor ? (
            <>
              <input type="hidden" name="departmentId" value={profile.departmentId ?? ""} />
              <input type="hidden" name="branchId" value={profile.branchId} />
              <ReadOnlyField label="Department" value={profile.departmentName} />
              <ReadOnlyField label="Branch" value={profile.branchName} />
            </>
          ) : (
            <>
              <SelectField label="Department" name="departmentId" defaultValue={profile.departmentId}>
                <option value="">No department assigned</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </SelectField>
              <SelectField label="Branch" name="branchId" defaultValue={profile.branchId} error={error(state, "branchId")} required>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </SelectField>
            </>
          )}
        </div>
        {isDoctor ? (
          <>
            <div className="mt-5 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground/80">
              You manage your doctor profile, consultation fee, schedules, availability, leave blocks, calendar sync, and AI preferences. Admin manages branch and department assignment.
            </div>
            <DoctorPracticeTabs profile={profile} />
          </>
        ) : null}
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden />
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
