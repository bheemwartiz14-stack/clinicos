"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, SelectField } from "@/components/form-controls";
import { updatePatientAction, type PatientActionState } from "../actions/patient.actions";
import { patientEditFormSchema } from "../validations/patient.validation";

const initialState: PatientActionState = { ok: false, message: "" };

export function PatientEditView({ patient }: { patient: any }) {
  const [state, action, isPending] = useActionState(updatePatientAction, initialState);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(patientEditFormSchema) as any,
    mode: "onBlur",
    defaultValues: {
      patientId: patient.id,
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      dateOfBirth: patient.dateOfBirth ? String(patient.dateOfBirth).slice(0, 10) : "",
      sex: patient.sex || "",
      phone: patient.phone || "",
      email: patient.email || "",
      bloodGroup: patient.bloodGroup || "",
      maritalStatus: patient.maritalStatus || "",
      occupation: patient.occupation || "",
      preferredLanguage: patient.preferredLanguage || "",
      isActive: patient.isActive ?? true
    }
  });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        setFormMessage({ type: 'success', text: state.message });
      } else {
        setFormMessage({ type: 'error', text: state.message });
      }
    }
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          setError(key as any, { message: messages[0] });
        }
      });
    }
  }, [state, setError]);

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("patientId", data.patientId);
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "patientId" && value != null) {
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, String(value));
        }
      }
    });
    action(formData);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Edit Patient</h1>
        <p className="mt-2 text-sm text-muted-foreground">{patient.mrn} · demographic updates only.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit as any)} className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Update patient demographic information below.
        </div>

        {formMessage && (
          <div className={`mb-5 rounded-lg px-3 py-2 text-sm font-medium ${formMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {formMessage.text}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="First name" type="text" required error={String(errors.firstName?.message ?? "")} {...register("firstName")} />
          <FormField label="Last name" type="text" required error={String(errors.lastName?.message ?? "")} {...register("lastName")} />
          <FormField label="Date of birth" type="date" required error={String(errors.dateOfBirth?.message ?? "")} {...register("dateOfBirth")} max={new Date().toISOString().split("T")[0]} />
          <SelectField label="Gender" required error={String(errors.sex?.message ?? "")} options={[
            { value: "", label: "Select gender" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" }
          ]} {...register("sex")} />
          <FormField label="Phone" type="tel" required error={String(errors.phone?.message ?? "")} {...register("phone")} placeholder="(555) 123-4567" />
          <FormField label="Email" type="email" error={String(errors.email?.message ?? "")} {...register("email")} placeholder="patient@example.com" />
          <FormField label="Blood group" {...register("bloodGroup")} />
          <FormField label="Marital status" {...register("maritalStatus")} />
          <FormField label="Occupation" {...register("occupation")} />
          <FormField label="Preferred language" {...register("preferredLanguage")} />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" {...register("isActive")} defaultChecked={patient.isActive} className="h-4 w-4 rounded border-border text-primary accent-primary" />
            Active patient
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={isPending} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}