"use client";

import { CalendarIcon, Loader2, Save, ShieldPlus, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAdultDate } from "../hooks/use-adult-date";
import type { ActionState, DoctorOption, PatientListItem } from "../patients.types";

type AddNewPatientViewProps = {
  action: (formData: FormData) => Promise<ActionState>;
  doctorOptions: DoctorOption[];
};

type PatientAction = (formData: FormData) => Promise<ActionState>;

const MIN_PATIENT_AGE = 18;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PATIENT_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Admitted", value: "admitted" },
  { label: "Discharged", value: "discharged" },
  { label: "Transferred", value: "transferred" },
];

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatFormDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateAge(dateOfBirth: Date) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  const hasBirthdayPassed =
    monthDiff > 0 || (monthDiff === 0 && today.getDate() >= dateOfBirth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

export function PatientsToast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        className: "border bg-background text-foreground shadow-lg",
      }}
    />
  );
}

export function AddNewPatientView({ action, doctorOptions }: AddNewPatientViewProps) {
  const router = useRouter();
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [portalLoginEnabled, setPortalLoginEnabled] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { maxDateOfBirth } = useAdultDate(MIN_PATIENT_AGE);
  const patientAge = dateOfBirth ? calculateAge(dateOfBirth) : "";

  function onSubmit(formData: FormData) {
    if (!dateOfBirth) {
      toast.error("Select the patient's date of birth.");
      return;
    }
    const calculatedAge = calculateAge(dateOfBirth);
    if (calculatedAge < MIN_PATIENT_AGE) {
      toast.error(`Patient must be at least ${MIN_PATIENT_AGE} years old.`);
      return;
    }
    formData.set("dateOfBirth", formatFormDate(dateOfBirth));
    formData.set("age", String(calculatedAge));
    startTransition(async () => {
      const result = await action(formData);

      if (result.ok) {
        toast.success(result.message);
        formRef.current?.reset();
        setDateOfBirth(undefined);
        router.push("/patients/view");
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <DashboardShell breadcrumb={["Patient Module", "Patient Management"]} title="Add New Patient">
      <PatientsToast />

      <form ref={formRef} action={onSubmit} className="grid gap-5">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Patient details</h2>
              <p className="text-sm text-muted-foreground">
                Core demographics and contact information.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-firstName`}>
              First name
              <Input id={`${fieldId}-firstName`} name="firstName" required />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-lastName`}>
              Last name
              <Input id={`${fieldId}-lastName`} name="lastName" required />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-email`}>
              Email
              <Input id={`${fieldId}-email`} name="email" type="email" />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-phone`}>
              Phone
              <Input id={`${fieldId}-phone`} name="phone" required type="tel" />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-dateOfBirth`}>
              Date of birth
              <input
                id={`${fieldId}-dateOfBirth`}
                name="dateOfBirth"
                required
                type="hidden"
                value={dateOfBirth ? formatFormDate(dateOfBirth) : ""}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "justify-start gap-2 text-left font-normal",
                      !dateOfBirth && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {dateOfBirth ? formatDisplayDate(dateOfBirth) : "Select date of birth"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    disabled={(date) => date > new Date(maxDateOfBirth)}
                  />
                </PopoverContent>
              </Popover>
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-age`}>
              Age
              <Input
                id={`${fieldId}-age`}
                max={130}
                min={MIN_PATIENT_AGE}
                name="age"
                readOnly
                type="number"
                value={patientAge}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-gender`}>
              Gender
              <select
                id={`${fieldId}-gender`}
                name="gender"
                required
                defaultValue="unknown"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="unknown">Unknown</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-bloodGroup`}>
              Blood group
              <select
                id={`${fieldId}-bloodGroup`}
                name="bloodGroup"
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-doctorAssigned`}
            >
              Doctor assigned
              <select
                id={`${fieldId}-doctorAssigned`}
                name="doctorAssigned"
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select doctor</option>
                {doctorOptions.map((doctor) => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.label}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-admissionDate`}
            >
              Admission date
              <Input id={`${fieldId}-admissionDate`} name="admissionDate" required type="date" />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-dischargeDate`}
            >
              Discharge date
              <Input id={`${fieldId}-dischargeDate`} name="dischargeDate" type="date" />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-status`}>
              Status
              <select
                id={`${fieldId}-status`}
                name="status"
                required
                defaultValue="active"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {PATIENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium md:col-span-2"
              htmlFor={`${fieldId}-address`}
            >
              Address
              <Textarea id={`${fieldId}-address`} name="address" rows={3} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Clinical information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-allergies`}>
              Allergies
              <Textarea id={`${fieldId}-allergies`} name="allergies" rows={4} />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-medicalHistory`}
            >
              Medical history
              <Textarea id={`${fieldId}-medicalHistory`} name="medicalHistory" rows={4} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldPlus className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Insurance</h2>
              <p className="text-sm text-muted-foreground">
                Optional policy details for billing and claims.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-insuranceProvider`}
            >
              Insurance provider
              <Input id={`${fieldId}-insuranceProvider`} name="insuranceProvider" />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-insurancePolicyNumber`}
            >
              Policy number
              <Input id={`${fieldId}-insurancePolicyNumber`} name="insurancePolicyNumber" />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-insuranceMemberId`}
            >
              Member ID
              <Input id={`${fieldId}-insuranceMemberId`} name="insuranceMemberId" />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-insuranceGroupNumber`}
            >
              Group number
              <Input id={`${fieldId}-insuranceGroupNumber`} name="insuranceGroupNumber" />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <label
            className="flex items-start gap-3 text-sm font-medium"
            htmlFor={`${fieldId}-portalLoginEnabled`}
          >
            <input
              id={`${fieldId}-portalLoginEnabled`}
              name="portalLoginEnabled"
              type="checkbox"
              className="mt-1 size-4"
              checked={portalLoginEnabled}
              onChange={(event) => setPortalLoginEnabled(event.target.checked)}
            />
            <span>
              Enable patient portal login
              <span className="mt-1 block font-normal text-muted-foreground">
                Creates a user account using the portal name, email, and password below.
              </span>
            </span>
          </label>

          {portalLoginEnabled ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-portalName`}>
                Portal user name
                <Input id={`${fieldId}-portalName`} name="portalName" required />
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-portalEmail`}
              >
                Portal email
                <Input id={`${fieldId}-portalEmail`} name="portalEmail" required type="email" />
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-portalPassword`}
              >
                Portal password
                <Input
                  id={`${fieldId}-portalPassword`}
                  minLength={8}
                  name="portalPassword"
                  required
                  type="password"
                />
              </label>

              <label
                className="flex items-center gap-3 self-end text-sm font-medium"
                htmlFor={`${fieldId}-portalEmailVerified`}
              >
                <input
                  id={`${fieldId}-portalEmailVerified`}
                  name="portalEmailVerified"
                  type="checkbox"
                  className="size-4"
                />
                Email verified
              </label>
            </div>
          ) : null}
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/patients/view")}>
            Cancel
          </Button>

          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save patient
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}

export function DeletePatientButton({
  action,
  patient,
}: {
  action: PatientAction;
  patient: PatientListItem;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    const formData = new FormData();
    formData.set("id", patient.id);

    startTransition(async () => {
      const result = await action(formData);

      if (result.ok) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <Button
      aria-label={`Delete ${patient.fullName}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={onDelete}
      size="icon"
      type="button"
      variant="ghost"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
