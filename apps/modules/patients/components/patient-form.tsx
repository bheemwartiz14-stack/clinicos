"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createPatientAction,
  updatePatientAction,
} from "../actions/patient.actions";
import {
  patientBloodGroupOptions,
  patientGenderOptions,
  patientMaritalStatusOptions,
} from "../schemas/patient.schema";
import type { PatientDetails } from "../types/patient.types";
import { generatePatientCode } from "../helpers/patient-code-generator.helper";
import { FormField, Select2Field, TextareaField } from "@/components/form-controls";

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PatientForm({
  patient,
}: {
  patient?: PatientDetails;
}) {
  const action = (
    patient ? updatePatientAction : createPatientAction
  ) as unknown as (formData: FormData) => void;

  // AUTO PATIENT CODE
  const patientCode = useMemo(() => {
    return patient?.patientCode || generatePatientCode();
  }, [patient]);

  return (
    <form action={action} className="space-y-6">
      {patient ? (
        <input type="hidden" name="id" value={patient.id} />
      ) : null}

      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            {patient ? "Edit Patient" : "Add Patient"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage demographics, contact details, emergency contact,
            and medical notes.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link
            href={
              patient
                ? (`/patients/${patient.id}` as any)
                : ("/patients" as any)
            }
          >
            Cancel
          </Link>
        </Button>
      </div>

      {/* BASIC INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* PATIENT CODE */}
          <FormField
            label="Patient Code"
            name="patientCode"
            value={patientCode}
            readOnly
          />

          {/* FULL NAME */}
          <FormField
            label="Full Name"
            name="fullName"
            defaultValue={patient?.fullName ?? ""}
            required
          />

          {/* EMAIL */}
          <FormField
            label="Email"
            name="email"
            type="email"
            defaultValue={patient?.email ?? ""}
          />

          {/* PHONE */}
          <FormField
            label="Phone"
            name="phone"
            defaultValue={patient?.phone ?? ""}
            required
          />

          {/* DATE OF BIRTH */}
          <FormField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            defaultValue={patient?.dateOfBirth ?? ""}
            required
          />

          {/* GENDER */}
          <Select2Field
            label="Gender"
            name="gender"
            defaultValue={
              patient?.gender ?? "prefer_not_to_say"
            }
          >
            {patientGenderOptions.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </Select2Field>

          {/* BLOOD GROUP */}
          <Select2Field
            label="Blood Group"
            name="bloodGroup"
            defaultValue={patient?.bloodGroup ?? "unknown"}
          >
            {patientBloodGroupOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select2Field>

          {/* MARITAL STATUS */}
          <Select2Field
            label="Marital Status"
            name="maritalStatus"
            defaultValue={
              patient?.maritalStatus ?? "single"
            }
          >
            {patientMaritalStatusOptions.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </Select2Field>

          {/* ACTIVE */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="text-sm font-medium">
                Active Patient
              </h4>

              <p className="text-xs text-muted-foreground">
                Enable or disable patient account.
              </p>
            </div>

            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={patient?.isActive ?? true}
              className="h-4 w-4"
            />
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <TextareaField
              label="Address"
              name="address"
              rows={3}
              defaultValue={
                patient?.address
                  ? typeof patient.address === "object"
                    ? [
                        patient.address.line1,
                        patient.address.city,
                        patient.address.state,
                        patient.address.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : patient.address
                  : ""
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* EMERGENCY & MEDICAL */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency & Medical Info</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* EMERGENCY NAME */}
          <FormField
            label="Emergency Contact Name"
            name="emergencyContactName"
            defaultValue={
              patient?.emergencyContactName ?? ""
            }
          />

          {/* EMERGENCY PHONE */}
          <FormField
            label="Emergency Contact Phone"
            name="emergencyContactPhone"
            defaultValue={
              patient?.emergencyContactPhone ?? ""
            }
          />

          {/* ALLERGIES */}
          <div className="md:col-span-2">
            <TextareaField
              label="Allergies"
              name="allergies"
              defaultValue={patient?.allergies ?? ""}
            />
          </div>

          {/* CHRONIC DISEASES */}
          <div className="md:col-span-2">
            <TextareaField
              label="Chronic Diseases"
              name="chronicDiseases"
              defaultValue={
                patient?.chronicDiseases ?? ""
              }
            />
          </div>

          {/* CURRENT MEDICATIONS */}
          <div className="md:col-span-2">
            <TextareaField
              label="Current Medications"
              name="currentMedications"
              defaultValue={
                patient?.currentMedications ?? ""
              }
            />
          </div>

          {/* NOTES */}
          <div className="md:col-span-2">
            <TextareaField
              label="Notes"
              name="notes"
              defaultValue={patient?.notes ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button type="submit">
          {patient ? "Update Patient" : "Create Patient"}
        </Button>
      </div>
    </form>
  );
}