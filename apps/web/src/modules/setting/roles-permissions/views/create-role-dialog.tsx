"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ActionState, PermissionModuleItem } from "../roles-permissions.types";

type CreateRoleAction = (formData: FormData) => Promise<ActionState>;

type CreateRoleDialogProps = {
  action: CreateRoleAction;
  permissionModules: PermissionModuleItem[];
};

const defaultActionState: ActionState = { ok: false, message: "" };

function formatModuleName(module: string) {
  return module
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatActionName(action: string) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function RolesPermissionsToast() {
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

export function CreateRoleDialog({ action, permissionModules }: CreateRoleDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(defaultActionState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [state, router]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create role
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>
            Add a role and choose the permission flags it should receive.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={onSubmit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium" htmlFor="role-name">
              Role name
              <Input id="role-name" name="name" required placeholder="clinic-manager" />
            </label>
            <label
              className="flex items-center gap-2 self-end rounded-lg border p-3 text-sm font-medium"
              htmlFor="role-is-active"
            >
              <Checkbox id="role-is-active" name="isActive" defaultChecked />
              Active role
            </label>
            <label
              className="grid gap-1.5 text-sm font-medium sm:col-span-2"
              htmlFor="role-description"
            >
              Description
              <Textarea
                id="role-description"
                name="description"
                rows={3}
                placeholder="Describe what this role can do"
              />
            </label>
          </div>

          <section className="grid gap-3">
            <div>
              <h3 className="font-semibold text-sm">Permissions by Module</h3>
              <p className="text-muted-foreground text-sm">
                Select the module permissions assigned to this role.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {permissionModules.map((module) => (
                <div key={module.module} className="rounded-lg border p-3">
                  <h4 className="font-semibold text-sm">{formatModuleName(module.module)}</h4>
                  <div className="mt-3 grid gap-2">
                    {module.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-muted"
                        htmlFor={`permission-${permission.id}`}
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          name="permissionIds"
                          value={permission.id}
                        />
                        <span>
                          <span className="block font-medium">
                            {formatActionName(permission.action)}
                          </span>
                          <span className="block text-muted-foreground text-xs">
                            {permission.name}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
