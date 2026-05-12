"use client";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Pencil, Plus, Trash2, UserCog, UserRound } from "lucide-react";
import { CountryStateCitySelects } from "@/components/shared/country-state-city-selects";
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
import type { ActionState, DepartmentOption, RoleOption, UserListItem } from "../users.types";

type UserAction = (formData: FormData) => Promise<ActionState>;

type UsersFormProps = {
  action: UserAction;
  departments: DepartmentOption[];
  mode?: "create" | "edit";
  roles: RoleOption[];
  user?: UserListItem;
  trigger?: React.ReactNode;
};

const defaultActionState: ActionState = { ok: false, message: "" };
const filePondLabel = 'Drag & Drop your image or <span class="filepond--label-action">Browse</span>';

registerPlugin(FilePondPluginImagePreview);

function getRoleFormText(roleName: string | null | undefined) {
  switch (roleName) {
    case "admin":
      return {
        accountDescription: "Create administrator access with broad system permissions.",
        profileTitle: "Administrator profile",
        profileDescription: "Identity and contact details for administrative access.",
        addressDescription: "Optional location details for this administrator.",
      };
    case "doctor":
      return {
        accountDescription: "Create doctor access for clinical workflows and patient care.",
        profileTitle: "Doctor profile",
        profileDescription: "Professional identity and contact details for the doctor.",
        addressDescription: "Location details used for doctor records and clinic operations.",
      };
    case "receptionist":
      return {
        accountDescription: "Create receptionist access for front-desk workflows.",
        profileTitle: "Reception profile",
        profileDescription: "Contact details used by front desk and patient coordination.",
        addressDescription: "Location details used for staff records.",
      };
    default:
      return {
        accountDescription: "Choose a role first, then complete login and profile details.",
        profileTitle: "Profile details",
        profileDescription: "Personal and contact information for this user.",
        addressDescription: "Location details used by clinic operations.",
      };
  }
}

function CurrentUserImagePreview({ src }: { src: string | null | undefined }) {
  if (!src) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-background p-3">
      <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
        <Image src={src} alt="Current account image" width={64} height={64} className="object-cover" />
      </span>
      <span className="min-w-0">
        <span className="block text-muted-foreground text-xs">Current image</span>
        <span className="block break-all text-xs">{src}</span>
      </span>
    </div>
  );
}

export function UsersToast() {
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

export function UsersForm({
  action,
  departments,
  mode = "create",
  roles,
  trigger,
  user,
}: UsersFormProps) {
  const router = useRouter();
  const reactId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(defaultActionState);
  const [selectedRoleId, setSelectedRoleId] = useState(user?.roleId ?? "");
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";
  const fieldId = `${mode}-${user?.id ?? "new"}-${reactId}`;
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const roleFormText = getRoleFormText(selectedRole?.name);

  const defaultTrigger = useMemo(
    () => (
      <Button type="button" className="gap-2">
        <Plus className="size-4" />
        Add user
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

      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="bg-gradient-to-br from-primary/15 via-background to-background p-6 pb-4">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              {isEdit ? <Pencil className="size-5" /> : <UserCog className="size-5" />}
            </div>
            <DialogTitle className="text-2xl">
              {isEdit ? "Edit user" : "Add user"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update login access, profile details, and role assignment."
                : "Create an account with login access, profile details, and a role."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form ref={formRef} action={onSubmit} className="grid gap-5 px-6 pb-6">
          {user ? <input name="id" type="hidden" value={user.id} /> : null}

          <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
            <div>
              <h3 className="font-medium text-foreground">Account access</h3>
              <p className="text-sm text-muted-foreground">
                {roleFormText.accountDescription}
              </p>
            </div>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-roleId`}>
              Role
              <input type="hidden" name="roleName" value={selectedRole?.name ?? ""} readOnly />
              <select
                id={`${fieldId}-roleId`}
                name="roleId"
                required
                value={selectedRoleId}
                onChange={(event) => setSelectedRoleId(event.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-name`}>
                Display name
                <Input id={`${fieldId}-name`} name="name" required defaultValue={user?.name ?? ""} />
              </label>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-email`}>
                Email
                <Input
                  id={`${fieldId}-email`}
                  name="email"
                  required
                  type="email"
                  defaultValue={user?.email ?? ""}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-password`}>
                Password
                <Input
                  id={`${fieldId}-password`}
                  name="password"
                  required={!isEdit}
                  type="password"
                  minLength={8}
                  placeholder={isEdit ? "Leave blank to keep current password" : ""}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium" htmlFor={`${fieldId}-imageFile`}>
                Account image
                <input type="hidden" name="image" defaultValue={user?.image ?? ""} />
                <CurrentUserImagePreview src={user?.image} />
                <FilePond
                  id={`${fieldId}-imageFile`}
                  name="imageFile"
                  acceptedFileTypes={["image/*"]}
                  allowMultiple={false}
                  credits={false}
                  imagePreviewHeight={140}
                  labelIdle={filePondLabel}
                  storeAsFile
                />
              </label>

              <label className="flex items-center gap-2 self-end text-sm font-medium">
                <input
                  name="emailVerified"
                  type="checkbox"
                  defaultChecked={user?.emailVerified ?? false}
                  className="size-4 rounded border-input"
                />
                Email verified
              </label>
            </div>
          </div>

          {selectedRole?.name === "doctor" ? (
            <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
              <div>
                <h3 className="font-medium text-foreground">Doctor Details</h3>
                <p className="text-sm text-muted-foreground">
                  Clinical profile details stored in the doctors table.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-specialization`}
                >
                  Specialization
                  <Input
                    id={`${fieldId}-specialization`}
                    name="specialization"
                    required
                    defaultValue={user?.specialization ?? ""}
                  />
                </label>

                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-qualification`}
                >
                  Qualification
                  <Input
                    id={`${fieldId}-qualification`}
                    name="qualification"
                    defaultValue={user?.qualification ?? ""}
                  />
                </label>

                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-experienceYears`}
                >
                  Experience
                  <Input
                    id={`${fieldId}-experienceYears`}
                    name="experienceYears"
                    type="number"
                    min={0}
                    defaultValue={user?.experienceYears ?? ""}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-consultationFee`}
                >
                  Consultation Fee
                  <Input
                    id={`${fieldId}-consultationFee`}
                    name="consultationFee"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={user?.consultationFee ?? ""}
                  />
                </label>

                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-licenseNumber`}
                >
                  License Number
                  <Input
                    id={`${fieldId}-licenseNumber`}
                    name="licenseNumber"
                    defaultValue={user?.licenseNumber ?? ""}
                  />
                </label>

                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-department`}
                >
                  Department
                  <select
                    id={`${fieldId}-department`}
                    name="department"
                    defaultValue={user?.department ?? ""}
                    required
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.name}>
                        {department.name}
                        {department.code ? ` (${department.code})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          {selectedRole?.name === "receptionist" ? (
            <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
              <div>
                <h3 className="font-medium text-foreground">Receptionist Details</h3>
                <p className="text-sm text-muted-foreground">
                  Front desk details stored in the receptionists table.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-employeeCode`}
                >
                  Employee Code
                  <Input
                    id={`${fieldId}-employeeCode`}
                    name="employeeCode"
                    required
                    defaultValue={user?.employeeCode ?? ""}
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-shift`}>
                  Shift
                  <Input id={`${fieldId}-shift`} name="shift" defaultValue={user?.shift ?? ""} />
                </label>

                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-deskNumber`}
                >
                  Desk Number
                  <Input
                    id={`${fieldId}-deskNumber`}
                    name="deskNumber"
                    defaultValue={user?.deskNumber ?? ""}
                  />
                </label>

                <label
                  className="grid gap-1.5 text-sm font-medium"
                  htmlFor={`${fieldId}-joiningDate`}
                >
                  Joining Date
                  <Input
                    id={`${fieldId}-joiningDate`}
                    name="joiningDate"
                    type="date"
                    defaultValue={user?.joiningDate ?? ""}
                  />
                </label>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
            <div>
              <h3 className="font-medium text-foreground">{roleFormText.profileTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {roleFormText.profileDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-firstName`}>
                First name
                <Input
                  id={`${fieldId}-firstName`}
                  name="firstName"
                  defaultValue={user?.firstName ?? ""}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-lastName`}>
                Last name
                <Input
                  id={`${fieldId}-lastName`}
                  name="lastName"
                  defaultValue={user?.lastName ?? ""}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-phone`}>
                Phone
                <Input
                  id={`${fieldId}-phone`}
                  name="phone"
                  type="tel"
                  defaultValue={user?.phone ?? ""}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-gender`}>
                Gender
                <select
                  id={`${fieldId}-gender`}
                  name="gender"
                  defaultValue={user?.gender ?? ""}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Not set</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-dateOfBirth`}>
                Date of birth
                <Input
                  id={`${fieldId}-dateOfBirth`}
                  name="dateOfBirth"
                  type="date"
                  defaultValue={user?.dateOfBirth ?? ""}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium" htmlFor={`${fieldId}-avatarFile`}>
                Avatar
                <input type="hidden" name="avatarUrl" defaultValue={user?.avatarUrl ?? ""} />
                <CurrentUserImagePreview src={user?.avatarUrl} />
                <FilePond
                  id={`${fieldId}-avatarFile`}
                  name="avatarFile"
                  acceptedFileTypes={["image/*"]}
                  allowMultiple={false}
                  credits={false}
                  imagePreviewHeight={140}
                  labelIdle={filePondLabel}
                  storeAsFile
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border bg-card/70 p-4 shadow-sm">
            <div>
              <h3 className="font-medium text-foreground">Address</h3>
              <p className="text-sm text-muted-foreground">
                {roleFormText.addressDescription}
              </p>
            </div>

            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-address`}>
              Address
              <Textarea
                id={`${fieldId}-address`}
                name="address"
                rows={3}
                defaultValue={user?.address ?? ""}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-4">
              <CountryStateCitySelects
                fieldId={fieldId}
                className="contents"
                defaultValue={{
                  city: user?.city,
                  country: user?.country,
                  state: user?.state,
                }}
              />
              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-postalCode`}>
                Postal code
                <Input
                  id={`${fieldId}-postalCode`}
                  name="postalCode"
                  defaultValue={user?.postalCode ?? ""}
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
              {isEdit ? "Update user" : "Save user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditUserButton({
  action,
  disabledReason,
  departments,
  roles,
  user,
}: {
  action: UserAction;
  departments: DepartmentOption[];
  disabledReason?: string;
  roles: RoleOption[];
  user: UserListItem;
}) {
  if (disabledReason) {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled
        aria-label={`Edit ${user.name}`}
        title={disabledReason}
      >
        <Pencil className="size-4" />
      </Button>
    );
  }

  return (
    <UsersForm
      action={action}
      departments={departments}
      mode="edit"
      roles={roles}
      user={user}
      trigger={
        <Button type="button" size="icon" variant="ghost" aria-label={`Edit ${user.name}`}>
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}

export function DeleteUserButton({
  action,
  disabledReason,
  user,
}: {
  action: UserAction;
  disabledReason?: string;
  user: UserListItem;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (disabledReason) {
      toast.error(disabledReason);
      return;
    }

    if (!window.confirm(`Delete ${user.name}? This will remove the user account and profile.`)) {
      return;
    }

    const formData = new FormData();
    formData.set("id", user.id);

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
      disabled={isPending || Boolean(disabledReason)}
      onClick={onDelete}
      aria-label={`Delete ${user.name}`}
      title={disabledReason}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}

export function UserAvatar({ user }: { user: UserListItem }) {
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
      {initials || <UserRound className="size-4" />}
    </span>
  );
}
