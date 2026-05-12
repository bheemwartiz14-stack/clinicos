"use client";

import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
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
import type { ActionState, BranchListItem } from "../branches.types";

type BranchAction = (formData: FormData) => Promise<ActionState>;

type BranchFormProps = {
  action: BranchAction;
  branch?: BranchListItem;
  mode?: "create" | "edit";
  trigger?: React.ReactNode;
};

const defaultActionState: ActionState = { ok: false, message: "" };

function generateBranchCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function BranchesToast() {
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

export function BranchForm({ action, branch, mode = "create", trigger }: BranchFormProps) {
  const router = useRouter();
  const reactId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(defaultActionState);
  const [name, setName] = useState(branch?.name ?? "");
  const [code, setCode] = useState(branch?.code ?? "");
  const [isCodeEdited, setIsCodeEdited] = useState(Boolean(branch?.code));
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";
  const fieldId = `${mode}-${branch?.id ?? "new"}-${reactId}`;

  const defaultTrigger = useMemo(
    () => (
      <Button type="button" className="gap-2">
        <Plus className="size-4" />
        Add branch
      </Button>
    ),
    [],
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      if (!isEdit) formRef.current?.reset();
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [state, router, isEdit]);

  useEffect(() => {
    if (!open) return;

    setName(branch?.name ?? "");
    setCode(branch?.code ?? "");
    setIsCodeEdited(Boolean(branch?.code));

    if (!branch) formRef.current?.reset();
  }, [open, branch]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
    });
  }

  function onNameChange(value: string) {
    setName(value);
    if (!isCodeEdited) {
      setCode(generateBranchCode(value));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

      <DialogContent className="p-0 sm:max-w-3xl">
        <div className="bg-gradient-to-br from-primary/15 via-background to-background p-6 pb-4">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              {isEdit ? <Pencil className="size-5" /> : <Building2 className="size-5" />}
            </div>
            <DialogTitle className="text-2xl">{isEdit ? "Edit branch" : "Add branch"}</DialogTitle>
            <DialogDescription>
              Configure clinic branch identity, contact details, and location.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          ref={formRef}
          action={onSubmit}
          className="grid max-h-[70vh] gap-5 overflow-y-auto px-6 pb-6"
        >
          {branch ? <input type="hidden" name="id" value={branch.id} /> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-name`}>
              Branch name
              <Input
                id={`${fieldId}-name`}
                name="name"
                required
                maxLength={180}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-code`}>
              Code
              <Input
                id={`${fieldId}-code`}
                name="code"
                required
                maxLength={60}
                value={code}
                onChange={(event) => {
                  setIsCodeEdited(true);
                  setCode(generateBranchCode(event.target.value));
                }}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-type`}>
              Type
              <Input id={`${fieldId}-type`} name="type" defaultValue={branch?.type ?? "clinic"} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-email`}>
              Support email
              <Input
                id={`${fieldId}-email`}
                name="supportEmail"
                type="email"
                defaultValue={branch?.supportEmail ?? ""}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-phone`}>
              Support phone
              <Input
                id={`${fieldId}-phone`}
                name="supportPhone"
                defaultValue={branch?.supportPhone ?? ""}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-address1`}>
              Address line 1
              <Input
                id={`${fieldId}-address1`}
                name="addressLine1"
                defaultValue={branch?.address?.addressLine1 ?? ""}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-address2`}>
              Address line 2
              <Input
                id={`${fieldId}-address2`}
                name="addressLine2"
                defaultValue={branch?.address?.addressLine2 ?? ""}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-city`}>
              City
              <Input id={`${fieldId}-city`} name="city" defaultValue={branch?.address?.city ?? ""} />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-state`}>
              State
              <Input
                id={`${fieldId}-state`}
                name="state"
                defaultValue={branch?.address?.state ?? ""}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-country`}>
              Country
              <Input
                id={`${fieldId}-country`}
                name="country"
                defaultValue={branch?.address?.country ?? ""}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-postal`}>
              Postal code
              <Input
                id={`${fieldId}-postal`}
                name="postalCode"
                defaultValue={branch?.address?.postalCode ?? ""}
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-notes`}>
            Notes
            <Textarea
              id={`${fieldId}-notes`}
              name="notes"
              rows={3}
              defaultValue={branch?.notes ?? ""}
            />
          </label>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                name="isMain"
                type="checkbox"
                defaultChecked={branch?.isMain ?? false}
                className="size-4 rounded border-input"
              />
              Main branch
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={branch?.isActive ?? true}
                className="size-4 rounded border-input"
              />
              Active branch
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Update branch" : "Save branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditBranchButton({
  action,
  branch,
}: {
  action: BranchAction;
  branch: BranchListItem;
}) {
  return (
    <BranchForm
      action={action}
      mode="edit"
      branch={branch}
      trigger={
        <Button type="button" size="icon" variant="ghost" aria-label={`Edit ${branch.name}`}>
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}

export function DeleteBranchButton({
  action,
  branch,
}: {
  action: BranchAction;
  branch: BranchListItem;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm(`Delete ${branch.name}?`)) return;

    const formData = new FormData();
    formData.set("id", branch.id);

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
      aria-label={`Delete ${branch.name}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
