"use client";

import { useState } from "react";
import { DoctorProfileForm } from "../components/doctor-profile-form";
import { DoctorScheduleForm } from "../components/doctor-schedule-form";
import { DoctorBreaksForm } from "../components/doctor-breaks-form";
import { DoctorVisitSettingsForm } from "../components/doctor-visit-settings-form";
import { DoctorLeaveForm } from "../components/doctor-leave-form";
import { DoctorLeaveList } from "../components/doctor-leave-list";
import { DoctorSlotsGenerator } from "../components/doctor-slots-generator";
import type { DoctorProfile, DoctorSchedule, DoctorBreak, DoctorLeaveBlock, DoctorVisitSettings, DoctorAppointmentSlot, DoctorStatus } from "../types/doctor.types";

interface DoctorSelfProfileViewProps {
  doctor: DoctorProfile;
  schedules: DoctorSchedule[];
  breaks: DoctorBreak[];
  leaves: DoctorLeaveBlock[];
  visitSettings: DoctorVisitSettings | null;
  slots: DoctorAppointmentSlot[];
  availabilityStatus: DoctorStatus;
  branches: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
}

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "schedule", label: "Schedule" },
  { id: "slots", label: "Slots" },
  { id: "leave", label: "Leave" },
  { id: "calendar", label: "Calendar" },
  { id: "ai", label: "AI" }
] as const;

export function DoctorSelfProfileView({
  doctor,
  schedules,
  breaks,
  leaves,
  visitSettings,
  slots,
  availabilityStatus,
  branches,
  departments
}: DoctorSelfProfileViewProps) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("profile");

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${availabilityStatus.color.replace("text-", "bg-").replace("600", "100").replace("500", "100")}`}>
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${availabilityStatus.status === "available" ? "bg-green-500" : availabilityStatus.status === "on_leave" ? "bg-red-500" : availabilityStatus.status === "on_lunch" ? "bg-amber-500" : "bg-slate-400"}`} />
              {availabilityStatus.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {doctor.specialization} • {doctor.branchName ?? "No branch"}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "profile" && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h2>
            <DoctorProfileForm doctor={doctor} branches={branches} departments={departments} />
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Working Hours</h2>
              <DoctorScheduleForm doctorId={doctor.id} schedules={schedules} />
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Break Times</h2>
              <DoctorBreaksForm doctorId={doctor.id} breaks={breaks} />
            </div>
          </div>
        )}

        {activeTab === "slots" && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Appointment Slots</h2>
            {visitSettings ? (
              <DoctorSlotsGenerator doctorId={doctor.id} slots={slots} />
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
                Please configure your visit settings first to generate slots.
              </div>
            )}
          </div>
        )}

        {activeTab === "leave" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Request Leave</h2>
              <DoctorLeaveForm doctorId={doctor.id} />
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Leave History</h2>
              <DoctorLeaveList doctorId={doctor.id} leaves={leaves} canManage={true} />
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Calendar Sync</h2>
            <div className="text-center py-8 text-slate-500">
              <p>Calendar integration coming soon</p>
              <p className="text-sm mt-2">Connect your Google Calendar or Outlook for automatic availability sync</p>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">AI Assistant</h2>
            <div className="text-center py-8 text-slate-500">
              <p>AI scheduling optimization coming soon</p>
              <p className="text-sm mt-2">Get AI-powered recommendations for optimal scheduling patterns</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}