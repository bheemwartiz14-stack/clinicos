"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { updateDoctorAction, type DoctorActionState } from "../actions/doctor.actions";
import { doctorProfileFormSchema, type DoctorProfileFormData } from "../validations/doctor.validation";

interface DoctorProfileFormProps {
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    gender: string | null;
    dateOfBirth: string | Date | null;
    specialization: string;
    qualification: string | null;
    experienceYears: number;
    npi: string | null;
    licenseNumber: string;
    consultationFee: string;
    bio: string | null;
    isActive: boolean;
    branchId?: string;
    departmentId?: string | null;
  };
  branches: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
}

const initialState: DoctorActionState = { ok: false, message: "" };

export function DoctorProfileForm({ doctor, branches, departments }: DoctorProfileFormProps) {
  const [state, action, isPending] = useActionState(updateDoctorAction, initialState);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(doctorProfileFormSchema) as any,
    mode: "onBlur",
    defaultValues: {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone ?? "",
      gender: doctor.gender ?? "",
      dateOfBirth: doctor.dateOfBirth ? (typeof doctor.dateOfBirth === 'string' ? doctor.dateOfBirth.split("T")[0] : doctor.dateOfBirth.toISOString().split("T")[0]) : "",
      specialization: doctor.specialization,
      qualification: doctor.qualification ?? "",
      experienceYears: doctor.experienceYears,
      npi: doctor.npi ?? "",
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio ?? "",
      isActive: doctor.isActive,
      branchId: doctor.branchId ?? "",
      departmentId: doctor.departmentId ?? ""
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

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    action(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <input type="hidden" {...register("id")} />

      {formMessage && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${formMessage.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {formMessage.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="First Name" type="text" required error={String(errors.firstName?.message ?? "")} {...register("firstName")} />
        <FormField label="Last Name" type="text" required error={String(errors.lastName?.message ?? "")} {...register("lastName")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Email" type="email" required error={String(errors.email?.message ?? "")} {...register("email")} />
        <FormField label="Phone" type="tel" error={String(errors.phone?.message ?? "")} {...register("phone")} placeholder="(555) 123-4567" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Gender"
          error={String(errors.gender?.message ?? "")}
          options={[
            { value: "", label: "Select gender" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
            { value: "prefer_not_to_say", label: "Prefer not to say" }
          ]}
          {...register("gender")}
        />
        <FormField
          label="Date of Birth"
          type="date"
          error={String(errors.dateOfBirth?.message ?? "")}
          {...register("dateOfBirth")}
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Branch"
          error={String(errors.branchId?.message ?? "")}
          options={[
            { value: "", label: "Select branch" },
            ...branches.map((b) => ({ value: b.id, label: b.name }))
          ]}
          {...register("branchId")}
        />
        <SelectField
          label="Department"
          error={String(errors.departmentId?.message ?? "")}
          options={[
            { value: "", label: "Select department" },
            ...departments.map((d) => ({ value: d.id, label: d.name }))
          ]}
          {...register("departmentId")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Specialization" required error={String(errors.specialization?.message ?? "")} {...register("specialization")} placeholder="e.g., Cardiology, General Practice" />
        <FormField label="Qualification" error={String(errors.qualification?.message ?? "")} {...register("qualification")} placeholder="e.g., MD, MBBS, PhD" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="Experience (Years)" type="number" error={String(errors.experienceYears?.message ?? "")} {...register("experienceYears", { valueAsNumber: true })} min={0} />
        <FormField label="NPI Number" error={String(errors.npi?.message ?? "")} {...register("npi")} placeholder="10-digit NPI" />
        <FormField label="License Number" required error={String(errors.licenseNumber?.message ?? "")} {...register("licenseNumber")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Consultation Fee ($)" type="number" required error={String(errors.consultationFee?.message ?? "")} {...register("consultationFee", { valueAsNumber: true })} min={0} step="0.01" />
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2">
              <input type="radio" value="true" {...register("isActive")} defaultChecked={doctor.isActive} className="h-4 w-4 text-primary accent-primary" />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="false" {...register("isActive")} defaultChecked={!doctor.isActive} className="h-4 w-4 text-primary accent-primary" />
              <span className="text-sm">Inactive</span>
            </label>
          </div>
          {errors.isActive && <span className="text-xs font-medium text-rose-500">{String(errors.isActive.message ?? "")}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Bio / About</label>
        <TextareaField
          error={String(errors.bio?.message ?? "")}
          {...register("bio")}
          placeholder="Brief professional biography..."
        />
      </div>

      <button type="submit" disabled={isPending} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70">
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}