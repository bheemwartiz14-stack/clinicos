"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, PatientListItem } from "../patients.types";
import { useAdultDate } from "../hooks/use-adult-date";

type PatientAction = (formData: FormData) => Promise<ActionState>;

type PatientsFormProps = {
  action: PatientAction;
  mode?: "create" | "edit";
  patient?: PatientListItem;
  trigger?: React.ReactNode;
};

const defaultActionState: ActionState = { ok: false, message: "" };

const MIN_PATIENT_AGE = 18;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientsToast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        className: "border bg-background text-foreground shadow-lg",
        success: {
          iconTheme: {
            primary: "hsl(var(--primary))",
            secondary: "white",
          },
        },
      }}
    />
  );
}

export function PatientsForm({
  action,
  mode = "create",
  patient,
  trigger,
}: PatientsFormProps) {
  const router = useRouter();
  const reactId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(defaultActionState);
  const [isPending, startTransition] = useTransition();

  const { maxDateOfBirth, toDateInputValue } = useAdultDate(MIN_PATIENT_AGE);

  const isEdit = mode === "edit";
  const fieldId = `${mode}-${patient?.id ?? "new"}-${reactId}`;

  const title = isEdit ? "Edit patient" : "Add patient";

  const description = isEdit
    ? "Update contact, clinical, and demographic information."
    : "Create a patient record for appointments, prescriptions, and billing.";

  const defaultTrigger = useMemo(
    () => (
      <Button type="button" className="gap-2">
        <Plus className="size-4" />
        Add patient
      </Button>
    ),
    [],
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);

      if (!isEdit) {
        formRef.current?.reset();
      }

      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [state, router, isEdit]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        <div className="bg-gradient-to-br from-primary/15 via-background to-background p-6 pb-4">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              {isEdit ? (
                <Pencil className="size-5" />
              ) : (
                <UserRound className="size-5" />
              )}
            </div>

            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <form ref={formRef} action={onSubmit} className="grid gap-5 px-6 pb-6">
          {patient ? <input name="id" type="hidden" value={patient.id} /> : null}

          <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
            <div>
              <h3 className="font-medium text-foreground">Personal details</h3>
              <p className="text-sm text-muted-foreground">
                Basic patient identity information.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-firstName`}
              >
                First name
                <Input
                  id={`${fieldId}-firstName`}
                  name="firstName"
                  required
                  defaultValue={patient?.firstName ?? ""}
                />
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-lastName`}
              >
                Last name
                <Input
                  id={`${fieldId}-lastName`}
                  name="lastName"
                  required
                  defaultValue={patient?.lastName ?? ""}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-dateOfBirth`}
              >
                Date of birth
                <Input
                  id={`${fieldId}-dateOfBirth`}
                  name="dateOfBirth"
                  required
                  type="date"
                  max={maxDateOfBirth}
                  defaultValue={toDateInputValue(patient?.dateOfBirth)}
                />
                <span className="text-xs text-muted-foreground">
                  Patient must be at least {MIN_PATIENT_AGE} years old
                </span>
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-gender`}
              >
                Gender
                <select
                  id={`${fieldId}-gender`}
                  name="gender"
                  required
                  defaultValue={patient?.gender ?? "unknown"}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="unknown">Unknown</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-bloodGroup`}
              >
                Blood group
                <select
                  id={`${fieldId}-bloodGroup`}
                  name="bloodGroup"
                  required
                  defaultValue={patient?.bloodGroup ?? ""}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>
                    Select blood group
                  </option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
            <div>
              <h3 className="font-medium text-foreground">Contact information</h3>
              <p className="text-sm text-muted-foreground">
                Phone, email, and address.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-phone`}
              >
                Phone
                <Input
                  id={`${fieldId}-phone`}
                  name="phone"
                  required
                  type="tel"
                  defaultValue={patient?.phone ?? ""}
                />
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-email`}
              >
                Email
                <Input
                  id={`${fieldId}-email`}
                  name="email"
                  type="email"
                  defaultValue={patient?.email ?? ""}
                />
              </label>
            </div>

            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor={`${fieldId}-address`}
            >
              Address
              <Textarea
                id={`${fieldId}-address`}
                name="address"
                rows={3}
                defaultValue={patient?.address ?? ""}
              />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
            <div>
              <h3 className="font-medium text-foreground">Clinical notes</h3>
              <p className="text-sm text-muted-foreground">
                Important history for care teams.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-allergies`}
              >
                Allergies
                <Textarea
                  id={`${fieldId}-allergies`}
                  name="allergies"
                  rows={3}
                  defaultValue={patient?.allergies ?? ""}
                />
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-medicalHistory`}
              >
                Medical history
                <Textarea
                  id={`${fieldId}-medicalHistory`}
                  name="medicalHistory"
                  rows={3}
                  defaultValue={patient?.medicalHistory ?? ""}
                />
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Update patient" : "Save patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditPatientButton({
  action,
  patient,
}: {
  action: PatientAction;
  patient: PatientListItem;
}) {
  return (
    <PatientsForm
      action={action}
      mode="edit"
      patient={patient}
      trigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Edit ${patient.fullName}`}
        >
          <Pencil className="size-4" />
        </Button>
      }
    />
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
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      size="icon"
      type="button"
      variant="ghost"
      disabled={isPending}
      onClick={onDelete}
      aria-label={`Delete ${patient.fullName}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}