"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, SelectField, CheckboxField } from "@/components/form-controls";
import { createPatientAction, type PatientActionState } from "../actions/patient.actions";
import { patientCreateFormSchema } from "../validations/patient.validation";

const initialState: PatientActionState = { ok: false, message: "" };

type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  allergies: string;
  medications: string;
  insurancePayer: string;
  insuranceMemberId: string;
  insuranceGroupId: string;
  consentOnFile: boolean;
  portalAccess: boolean;
  portalPassword: string;
};

export function PatientCreateForm() {
  const [state, action, isPending] = useActionState(createPatientAction, initialState);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(patientCreateFormSchema) as any,
    mode: "onBlur"
  });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        setFormMessage({ type: 'success', text: state.message });
        reset();
      } else {
        setFormMessage({ type: 'error', text: state.message });
      }
    }
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          setError(key as keyof FormData, { message: messages[0] });
        }
      });
    }
  }, [state, setError, reset]);

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      } else if (value != null) {
        formData.append(key, String(value));
      }
    });
    action(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        MRN is generated automatically. Emergency contact is required for quick registration.
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
        <FormField label="Address" type="text" error={String(errors.addressLine1?.message ?? "")} {...register("addressLine1")} />
        <FormField label="City" type="text" error={String(errors.city?.message ?? "")} {...register("city")} />
        <FormField label="State" type="text" error={String(errors.state?.message ?? "")} {...register("state")} placeholder="CA" maxLength={2} />
        <FormField label="ZIP" type="text" error={String(errors.postalCode?.message ?? "")} {...register("postalCode")} placeholder="90210" />
      </div>

      <h3 className="mt-6 mb-3 text-sm font-semibold text-foreground">Emergency Contact</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="Contact name" required error={String(errors.emergencyContactName?.message ?? "")} {...register("emergencyContactName")} />
        <FormField label="Contact phone" type="tel" required error={String(errors.emergencyContactPhone?.message ?? "")} {...register("emergencyContactPhone")} />
        <FormField label="Relationship" required error={String(errors.emergencyContactRelationship?.message ?? "")} {...register("emergencyContactRelationship")} />
      </div>

      <h3 className="mt-6 mb-3 text-sm font-semibold text-foreground">Medical Info (Optional)</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Allergies</span>
            <textarea {...register("allergies")} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          </label>
        </div>
        <div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Medications</span>
            <textarea {...register("medications")} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          </label>
        </div>
      </div>

      <h3 className="mt-6 mb-3 text-sm font-semibold text-foreground">Insurance (Optional)</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="Insurance provider" {...register("insurancePayer")} />
        <FormField label="Policy/member number" {...register("insuranceMemberId")} />
        <FormField label="Group number" {...register("insuranceGroupId")} />
      </div>

      <h3 className="mt-6 mb-3 text-sm font-semibold text-foreground">Patient Portal Access</h3>
      <div className="space-y-3">
        <CheckboxField label="Enable portal access" {...register("portalAccess")} />
        <FormField label="Portal password (min 8 characters)" type="password" error={String(errors.portalPassword?.message ?? "")} {...register("portalPassword")} />
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={isPending} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
          {isPending ? "Creating..." : "Create patient"}
        </button>
      </div>
    </form>
  );
}