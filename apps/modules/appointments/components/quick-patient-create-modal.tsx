"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { quickCreatePatientAction } from "../actions/appointment.actions";
import { FormField } from "@/components/form-controls";

function generatePatientCode() {
  return `PT-${Date.now().toString().slice(-6)}`;
}

export function QuickPatientCreateModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (patient: { id: string; label: string }) => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const patientCode = useMemo(() => {
    return generatePatientCode();
  }, []);

  function submit(formData: FormData) {
    startTransition(() => {
      void quickCreatePatientAction(formData).then((result) => {
        setMessage(result.message);

        if (result.ok && result.patient) {
          onCreated(result.patient);
          onOpenChange(false);
        }
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>

        <form action={submit} className="grid gap-4">
          <FormField
            label="Patient Code"
            name="patientCode"
            value={patientCode}
            readOnly
          />

          <Input
            name="fullName"
            placeholder="Full name"
            required
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
          />

          <Input
            name="dateOfBirth"
            type="date"
            required
          />

          <Input
            name="gender"
            placeholder="Gender"
          />

          <Input
            name="bloodGroup"
            placeholder="Blood group"
          />

          <Input
            name="maritalStatus"
            placeholder="Marital status"
          />

          <Input
            name="phone"
            placeholder="Phone"
            required
          />

          {message ? (
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create Patient"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}