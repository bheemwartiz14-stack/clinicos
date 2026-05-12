"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import type { ActionState, DepartmentListItem } from "../departments.types";

type DepartmentAction = (formData: FormData) => Promise<ActionState>;

type DepartmentFormProps = {
  action: DepartmentAction;
  department?: DepartmentListItem;
  mode?: "create" | "edit";
  trigger?: React.ReactNode;
};

const defaultActionState: ActionState = { ok: false, message: "" };

function generateDepartmentCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

export function DepartmentsToast() {
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

export function DepartmentForm({
  action,
  department,
  mode = "create",
  trigger,
}: DepartmentFormProps) {
  const router = useRouter();
  const reactId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(defaultActionState);
  const [name, setName] = useState(department?.name ?? "");
  const [code, setCode] = useState(department?.code ?? "");
  const [isCodeEdited, setIsCodeEdited] = useState(Boolean(department?.code));
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";
  const fieldId = `${mode}-${department?.id ?? "new"}-${reactId}`;

  const defaultTrigger = useMemo(
    () => (
      <Button type="button" className="gap-2">
        <Plus className="size-4" />
        Add department
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

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(department?.name ?? "");
    setCode(department?.code ?? "");
    setIsCodeEdited(Boolean(department?.code));

    if (!department) {
      formRef.current?.reset();
    }
  }, [open, department]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
    });
  }

  function onNameChange(value: string) {
    setName(value);
    if (!isCodeEdited) {
      setCode(generateDepartmentCode(value));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

      <DialogContent className="p-0 sm:max-w-2xl">
        <div className="bg-gradient-to-br from-primary/15 via-background to-background p-6 pb-4">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              {isEdit ? <Pencil className="size-5" /> : <Building2 className="size-5" />}
            </div>
            <DialogTitle className="text-2xl">
              {isEdit ? "Edit department" : "Add department"}
            </DialogTitle>
            <DialogDescription>
              Maintain department names, short codes, and availability.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form ref={formRef} action={onSubmit} className="grid gap-5 px-6 pb-6">
          {department ? <input type="hidden" name="id" value={department.id} /> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-name`}>
              Name
              <Input
                id={`${fieldId}-name`}
                name="name"
                required
                maxLength={150}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-code`}>
              Code
              <Input
                id={`${fieldId}-code`}
                name="code"
                maxLength={50}
                value={code}
                onChange={(event) => {
                  setIsCodeEdited(true);
                  setCode(generateDepartmentCode(event.target.value));
                }}
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-departmentHead`}>
            Department Head
            <Input
              id={`${fieldId}-departmentHead`}
              name="departmentHead"
              maxLength={150}
              defaultValue={department?.departmentHeadId ?? ""}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-description`}>
            Description
            <Textarea
              id={`${fieldId}-description`}
              name="description"
              rows={4}
              defaultValue={department?.description ?? ""}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={department?.isActive ?? true}
              className="size-4 rounded border-input"
            />
            Active department
          </label>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Update department" : "Save department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditDepartmentButton({
  action,
  department,
}: {
  action: DepartmentAction;
  department: DepartmentListItem;
}) {
  return (
    <DepartmentForm
      action={action}
      mode="edit"
      department={department}
      trigger={
        <Button type="button" size="icon" variant="ghost" aria-label={`Edit ${department.name}`}>
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}

export function DeleteDepartmentButton({
  action,
  department,
}: {
  action: DepartmentAction;
  department: DepartmentListItem;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm(`Delete ${department.name}?`)) {
      return;
    }

    const formData = new FormData();
    formData.set("id", department.id);

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
      aria-label={`Delete ${department.name}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
