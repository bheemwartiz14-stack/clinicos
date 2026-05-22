import Link from "next/link";
import { CalendarDays, Plus, UserMinus } from "lucide-react";
import { addLeaveAction, addScheduleAction, createDoctorAction, deactivateDoctorAction, updateDoctorAction } from "../actions/doctor.actions";
import type { DoctorRecord } from "../services/doctor.service";
import { CheckboxField, FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Option = { id: string; name: string };
type Schedule = { id: string; dayOfWeek: number; startTime: string; endTime: string; slotDurationMinutes: number; isActive: boolean };
type Leave = { id: string; leaveDate: string; reason: string | null; isFullDay: boolean; startTime: string | null; endTime: string | null };
type Slot = { id: string; slotDate: string; startTime: string; endTime: string; isBooked: boolean; isBlocked: boolean };

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function DoctorsListView({ doctors, generatedPassword }: { doctors: DoctorRecord[]; generatedPassword?: string | null }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Doctor Management</h1>
          <p className="text-sm text-muted-foreground">Profiles, specialties, fees, schedules, leave dates, and slots.</p>
        </div>
        <Button asChild>
          <Link href="/doctors/add">
            <Plus className="h-4 w-4" aria-hidden />
            Add Doctor
          </Link>
        </Button>
      </div>
      {generatedPassword ? (
        <Card className="rounded-lg border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Doctor created. Temporary password generated.</p>
              <p className="text-xs text-muted-foreground">Share this password with the doctor and ask them to change it after login.</p>
            </div>
            <code className="w-fit rounded-md border bg-background px-3 py-2 text-sm font-semibold">{generatedPassword}</code>
          </CardContent>
        </Card>
      ) : null}
      <Card className="rounded-lg">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Specialty</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Fee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="transition hover:bg-muted/35">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{doctor.name}</div>
                    <div className="text-xs text-muted-foreground">{doctor.email} · {doctor.phone ?? "No phone"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{doctor.specialtyName ?? "No specialty"}</div>
                    <div className="text-xs text-muted-foreground">{doctor.qualification ?? "No qualification"}</div>
                  </td>
                  <td className="px-4 py-3">{doctor.departmentName ?? "No department"}</td>
                  <td className="px-4 py-3 font-medium">${doctor.consultationFee}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={doctor.status === "active" ? "default" : "outline"}>{doctor.status}</Badge>
                      <Badge variant={doctor.isAvailable ? "default" : "outline"}>{doctor.isAvailable ? "Available" : "Unavailable"}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm"><Link href={`/doctors/${doctor.id}`}>Manage</Link></Button>
                      <Button asChild variant="outline" size="sm"><Link href={`/doctors/${doctor.id}/edit`}>Edit</Link></Button>
                      <form action={deactivateDoctorAction}>
                        <input type="hidden" name="id" value={doctor.id} />
                        <Button type="submit" variant="destructive" size="sm" aria-label={`Deactivate ${doctor.name}`}>
                          <UserMinus className="h-4 w-4" aria-hidden />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {doctors.length === 0 ? <div className="px-4 py-8 text-sm text-muted-foreground">No doctors found.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function DoctorForm({ doctor, departments, specialties }: { doctor?: DoctorRecord | null; departments: Option[]; specialties: Option[] }) {
  const action = doctor ? updateDoctorAction.bind(null, doctor.id) : createDoctorAction;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">{doctor ? "Edit Doctor" : "Add Doctor"}</h1>
        <p className="text-sm text-muted-foreground">Manage profile, specialty, fees, and availability status.</p>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
          <CardDescription>Doctor users automatically receive the Doctor role. Create can also generate Monday-Saturday schedules and slots.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4 md:grid-cols-2">
            <FormField label="First name" name="firstName" defaultValue={doctor?.firstName ?? ""} required />
            <FormField label="Last name" name="lastName" defaultValue={doctor?.lastName ?? ""} />
            <FormField label="Email" name="email" type="email" defaultValue={doctor?.email ?? ""} required />
            <FormField label="Phone" name="phone" defaultValue={doctor?.phone ?? ""} />
            {doctor ? <FormField label="New password (leave blank)" name="password" type="password" /> : null}
            <SelectField label="Department" name="departmentId" defaultValue={doctor?.departmentId ?? ""} options={[{ value: "", label: "No department" }, ...departments.map((item) => ({ value: item.id, label: item.name }))]} />
            <SelectField label="Specialty" name="specialtyId" defaultValue={doctor?.specialtyId ?? ""} options={[{ value: "", label: "No specialty" }, ...specialties.map((item) => ({ value: item.id, label: item.name }))]} />
            <FormField label="Qualification" name="qualification" defaultValue={doctor?.qualification ?? ""} />
            <FormField label="Experience years" name="experienceYears" type="number" min={0} defaultValue={doctor?.experienceYears ?? 0} />
            <FormField label="License number" name="licenseNumber" defaultValue={doctor?.licenseNumber ?? ""} />
            <FormField label="Consultation fee" name="consultationFee" type="number" step="0.01" min={0} defaultValue={doctor?.consultationFee ?? "0"} required />
            <SelectField label="Status" name="status" defaultValue={doctor?.status ?? "active"} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "blocked", label: "Blocked" }]} />
            <div className="flex items-end">
              <CheckboxField label="Available for appointments" name="isAvailable" defaultChecked={doctor?.isAvailable ?? true} />
            </div>
            <TextareaField label="Bio" name="bio" defaultValue={doctor?.bio ?? ""} className="md:col-span-2" rows={4} />
            {!doctor ? (
              <div className="grid gap-4 rounded-lg border bg-muted/25 p-4 md:col-span-2 md:grid-cols-3">
                <div className="md:col-span-3">
                  <CheckboxField label="Create initial schedule and generate slots now (Monday to Saturday)" name="createSchedule" defaultChecked />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {days.slice(1).map((day) => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                  </div>
                </div>
                <FormField label="Start time" name="scheduleStartTime" type="time" defaultValue="09:00" />
                <FormField label="End time" name="scheduleEndTime" type="time" defaultValue="17:00" />
                <FormField label="Slot minutes" name="scheduleSlotDurationMinutes" type="number" min={5} defaultValue={30} />
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <Button type="submit">{doctor ? "Save Doctor" : "Create Doctor"}</Button>
              <Button asChild variant="outline"><Link href="/doctors">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function DoctorDetailView({ doctor, schedules, leaves, slots }: { doctor: DoctorRecord; schedules: Schedule[]; leaves: Leave[]; slots: Slot[] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{doctor.name}</h1>
          <p className="text-sm text-muted-foreground">{doctor.specialtyName ?? "Doctor"} · Fee ${doctor.consultationFee}</p>
        </div>
        <Button asChild variant="outline"><Link href="/doctors">Back to Doctors</Link></Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Doctor Schedule</CardTitle>
            <CardDescription>Add weekly schedules to generate appointment slots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addScheduleAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="doctorId" value={doctor.id} />
              <SelectField label="Day" name="dayOfWeek" defaultValue="1" options={days.map((day, index) => ({ value: String(index), label: day }))} />
              <FormField label="Slot duration" name="slotDurationMinutes" type="number" defaultValue={30} min={5} />
              <FormField label="Start time" name="startTime" type="time" defaultValue="09:00" required />
              <FormField label="End time" name="endTime" type="time" defaultValue="17:00" required />
              <CheckboxField label="Active" name="isActive" defaultChecked />
              <Button type="submit">Add Schedule</Button>
            </form>
            <List items={schedules.map((item) => `${days[item.dayOfWeek]} ${item.startTime}-${item.endTime} (${item.slotDurationMinutes} min)`)} empty="No schedules yet." />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Leave / Block Dates</CardTitle>
            <CardDescription>Block full or partial days from availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addLeaveAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="doctorId" value={doctor.id} />
              <FormField label="Leave date" name="leaveDate" type="date" required />
              <FormField label="Reason" name="reason" />
              <FormField label="Start time" name="startTime" type="time" />
              <FormField label="End time" name="endTime" type="time" />
              <CheckboxField label="Full day" name="isFullDay" defaultChecked />
              <Button type="submit">Add Leave</Button>
            </form>
            <List items={leaves.map((item) => `${item.leaveDate} · ${item.isFullDay ? "Full day" : `${item.startTime}-${item.endTime}`} · ${item.reason ?? "No reason"}`)} empty="No leave dates." />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden /> Available Appointment Slots</CardTitle>
          <CardDescription>Generated from active schedules for the next 14 days.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {slots.slice(0, 80).map((slot) => (
            <Badge key={slot.id} variant={slot.isBooked || slot.isBlocked ? "outline" : "default"}>{slot.slotDate} {slot.startTime}</Badge>
          ))}
          {slots.length === 0 ? <p className="text-sm text-muted-foreground">No slots generated yet. Add a schedule first.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <div className="space-y-2">{items.map((item) => <div key={item} className="rounded-lg border p-2 text-sm">{item}</div>)}</div>;
}
