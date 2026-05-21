import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createDoctorAction, updateDoctorAction } from "../actions/doctor.actions";
import { DoctorConsultationSettingsFields } from "./doctor-consultation-settings-fields";
import { DoctorScheduleFields } from "./doctor-schedule-fields";
import type { DoctorDetails, DoctorFormOptions } from "../types/doctor.types";

export function DoctorForm({ doctor, options }: { doctor?: DoctorDetails; options: DoctorFormOptions }) {
  const action = (doctor ? updateDoctorAction : createDoctorAction) as unknown as (formData: FormData) => void;
  const defaultDuration = doctor?.consultationSettings?.defaultSlotDuration ?? 20;

  return (
    <form action={action} className="space-y-6">
      {doctor ? <input type="hidden" name="id" value={doctor.id} /> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{doctor ? "Edit Doctor" : "Add Doctor"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create the doctor user account, profile, fees, weekly defaults, and generated slots in one flow.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={(doctor ? `/doctors/${doctor.id}` : "/doctors") as any}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <Label>Display name</Label>
            <Input name="displayName" defaultValue={doctor?.displayName ?? ""} required />
          </label>
          <label className="grid gap-2">
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue={doctor?.email ?? ""} required />
          </label>
          <label className="grid gap-2">
            <Label>Phone</Label>
            <Input name="phone" defaultValue={doctor?.phone ?? ""} />
          </label>
          <label className="grid gap-2">
            <Label>{doctor ? "New password" : "Password"}</Label>
            <Input name="password" type="password" minLength={8} required={!doctor} />
          </label>
          <label className="grid gap-2">
            <Label>Branch</Label>
            <Select name="branchId" defaultValue={doctor?.branchId ?? options.branches[0]?.id}>
              <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent>{options.branches.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <Label>Department</Label>
            <Select name="departmentId" defaultValue={doctor?.departmentId ?? "none"}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {options.departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <Label>Specialty</Label>
            <Select name="specialtyId" defaultValue={doctor?.specialtyId ?? "none"}>
              <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General Medicine</SelectItem>
                {options.specialties.map((specialty) => <SelectItem key={specialty.id} value={specialty.id}>{specialty.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <Label>License number</Label>
            <Input name="licenseNumber" defaultValue={doctor?.licenseNumber ?? ""} required />
          </label>
          <label className="grid gap-2">
            <Label>Qualification</Label>
            <Input name="qualification" defaultValue={doctor?.qualification ?? ""} />
          </label>
          <label className="grid gap-2">
            <Label>Experience years</Label>
            <Input name="experienceYears" type="number" min={0} max={100} defaultValue={doctor?.experienceYears ?? 0} />
          </label>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="isActive">Active</Label>
            <Switch id="isActive" name="isActive" value="true" defaultChecked={doctor?.isActive ?? true} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="isAvailable">Available for booking</Label>
            <Switch id="isAvailable" name="isAvailable" value="true" defaultChecked={doctor?.isAvailable ?? true} />
          </div>
          <label className="grid gap-2 md:col-span-2">
            <Label>Bio</Label>
            <Textarea name="bio" defaultValue={doctor?.bio ?? ""} rows={4} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Consultation Settings</CardTitle></CardHeader>
        <CardContent><DoctorConsultationSettingsFields settings={doctor?.consultationSettings} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Default Weekly Schedule</CardTitle></CardHeader>
        <CardContent><DoctorScheduleFields schedules={doctor?.schedules} defaultSlotDuration={defaultDuration} /></CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button asChild variant="outline"><Link href="/doctors">Cancel</Link></Button>
        <Button type="submit">{doctor ? "Update Doctor" : "Create Doctor"}</Button>
      </div>
    </form>
  );
}
