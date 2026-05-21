"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAppointmentAction } from "../actions/appointment.actions";
import type { AppointmentDoctorOption, AppointmentPatientOption } from "../types/appointment.types";
import { DoctorSearchSelect } from "./doctor-search-select";
import { PatientSearchSelect } from "./patient-search-select";
import { QuickPatientCreateModal } from "./quick-patient-create-modal";

type Prefill = { doctorId?: string; appointmentDate: string; startTime?: string };

export function NewBookingModal({
  open,
  onOpenChange,
  doctors,
  patients,
  prefill,
  statusOptions,
  typeOptions
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctors: AppointmentDoctorOption[];
  patients: AppointmentPatientOption[];
  prefill: Prefill;
  statusOptions: Array<{ value: string; label: string }>;
  typeOptions: Array<{ value: string; label: string }>;
}) {
  const [patientOptions, setPatientOptions] = useState(patients);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(prefill.doctorId ?? "");
  const [quickOpen, setQuickOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setDoctorId(prefill.doctorId ?? "");
  }, [prefill.doctorId]);

  function submit(formData: FormData) {
    formData.set("patientId", patientId);
    formData.set("doctorId", doctorId);
    startTransition(() => {
      void createAppointmentAction(formData).then((result) => {
        console.log(result);
        setMessage(result.message);
        if (result.ok) onOpenChange(false);
      });
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Booking</DialogTitle></DialogHeader>
          <form action={submit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <PatientSearchSelect patients={patientOptions} value={patientId} onChange={setPatientId} onAddPatient={() => setQuickOpen(true)} />
            </div>
            <div className="md:col-span-2">
              <DoctorSearchSelect doctors={doctors} value={doctorId} onChange={setDoctorId} />
            </div>
            <Input name="appointmentDate" type="date" defaultValue={prefill.appointmentDate} required />
            <Input name="startTime" type="time" defaultValue={prefill.startTime ?? "09:00"} required />
            <Input name="durationMinutes" type="number" min={5} max={240} defaultValue={30} required />
            <Select name="type" defaultValue="in_clinic">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{typeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select name="status" defaultValue="confirmed">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input name="reasonForVisit" placeholder="Reason for visit" required className="md:col-span-2" />
            <Textarea name="notes" placeholder="Notes optional" className="md:col-span-2" />
            {message ? <p className="text-sm text-muted-foreground md:col-span-2">{message}</p> : null}
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={pending || !patientId || !doctorId}>{pending ? "Booking..." : "Create Booking"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <QuickPatientCreateModal
        open={quickOpen}
        onOpenChange={setQuickOpen}
        onCreated={(patient) => {
          setPatientOptions((current) => [{ id: patient.id, label: patient.label, fullName: patient.label, phone: "", email: null }, ...current]);
          setPatientId(patient.id);
        }}
      />
    </>
  );
}
