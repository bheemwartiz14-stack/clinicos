"use client";

import { CalendarIcon, Loader2, Save, Stethoscope, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CountryStateCitySelects } from "@/components/shared/country-state-city-selects";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ActionState, AddDoctorPageModel } from "../doctors.types";

type AddDoctorViewProps = AddDoctorPageModel & {
  action: (formData: FormData) => Promise<ActionState>;
};

function SectionHeading({
  description,
  icon: Icon,
  title,
}: {
  description?: string;
  icon: typeof UserRound;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

export function DoctorsToast() {
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

export function AddDoctorView({
  action,
  breadcrumb,
  branches,
  departments,
  description,
  title,
}: AddDoctorViewProps) {
  const router = useRouter();
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [portalLoginEnabled, setPortalLoginEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    if (!portalLoginEnabled) {
      toast.error("Doctor portal login is required to create a doctor account.");
      return;
    }

    startTransition(async () => {
      const result = await action(formData);

      if (result.ok) {
        toast.success(result.message);
        formRef.current?.reset();
        setDateOfBirth(undefined);
        setPortalLoginEnabled(true);
        router.push("/doctors/view");
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <DashboardShell activeHref="/doctors/add-doctor" breadcrumb={breadcrumb} title={title}>
      <DoctorsToast />

      <form ref={formRef} action={onSubmit} className="grid gap-5">
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <SectionHeading
            icon={UserRound}
            title="Doctor details"
            description="Basic identity and contact information."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-firstName`}>
              First name
              <Input id={`${fieldId}-firstName`} name="firstName" />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-lastName`}>
              Last name
              <Input id={`${fieldId}-lastName`} name="lastName" />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-phone`}>
              Phone
              <Input id={`${fieldId}-phone`} name="phone" type="tel" />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-dateOfBirth`}>
              Date of birth
              <input
                id={`${fieldId}-dateOfBirth`}
                name="dateOfBirth"
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
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-gender`}>
              Gender
              <select
                id={`${fieldId}-gender`}
                name="gender"
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <SectionHeading
            icon={Stethoscope}
            title="Clinical details"
            description="Specialty, department, license, and consultation settings."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-departmentId`}>
              Department
              <select
                id={`${fieldId}-departmentId`}
                name="departmentId"
                required
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                    {department.code ? ` (${department.code})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-specialization`}
            >
              Specialization
              <Input id={`${fieldId}-specialization`} name="specialization" required />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-branchId`}>
              Clinic / Branch
              <select
                id={`${fieldId}-branchId`}
                name="branchId"
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-qualification`}
            >
              Qualification
              <Input id={`${fieldId}-qualification`} name="qualification" />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-experienceYears`}
            >
              Experience years
              <Input
                id={`${fieldId}-experienceYears`}
                name="experienceYears"
                type="number"
                min={0}
              />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-consultationFee`}
            >
              Consultation fee
              <Input
                id={`${fieldId}-consultationFee`}
                name="consultationFee"
                type="number"
                min={0}
                step="0.01"
              />
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-licenseNumber`}
            >
              License number
              <Input id={`${fieldId}-licenseNumber`} name="licenseNumber" />
            </label>

            <label className="flex items-center gap-2 self-end text-sm font-medium">
              <input
                name="isAvailable"
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-input"
              />
              Available for consultations
            </label>

            <label
              className="grid gap-1.5 text-sm font-medium md:col-span-2"
              htmlFor={`${fieldId}-bio`}
            >
              Bio
              <Textarea id={`${fieldId}-bio`} name="bio" rows={4} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">Address details</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label
              className="grid gap-1.5 text-sm font-medium md:col-span-2"
              htmlFor={`${fieldId}-address`}
            >
              Address
              <Textarea id={`${fieldId}-address`} name="address" rows={3} />
            </label>
            <CountryStateCitySelects fieldId={fieldId} className="contents" />

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-postalCode`}>
              Postal code
              <Input id={`${fieldId}-postalCode`} name="postalCode" />
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
              Enable doctor portal login
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
          <Button type="button" variant="outline" onClick={() => router.push("/doctors/view")}>
            Cancel
          </Button>

          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save doctor
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
