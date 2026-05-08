import { Badge } from "@mediclinicpro/ui/components/badge";
import { Button } from "@mediclinicpro/ui/components/button";
import { Input } from "@mediclinicpro/ui/components/input";
import { Table, TableCell, TableHead, TableRow } from "@mediclinicpro/ui/components/table";
import { Mail, Save, UserRound } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { AuthUser } from "@/modules/auth/auth.types";
import type { UserListItem } from "./users.types";

type ProfileViewProps = {
  user: AuthUser;
  updated: boolean;
  action: (formData: FormData) => Promise<void>;
};

export function ProfileView({ user, updated, action }: ProfileViewProps) {
  return (
    <DashboardShell
      activeHref="/dashboard/profile"
      title="Edit Profile"
      breadcrumb={["Workspace", "Admin", "Edit Profile"]}
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <form action={action} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Profile details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the admin name and email shown across the workspace.
              </p>
            </div>
            {updated ? <Badge className="bg-teal-50 text-teal-700">Saved</Badge> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="name">
              Full name
              <Input
                className="mt-1"
                defaultValue={user.name}
                id="name"
                name="name"
                required
                type="text"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email address
              <Input
                className="mt-1"
                defaultValue={user.email}
                id="email"
                name="email"
                required
                type="email"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit">
              <Save size={16} />
              Save profile
            </Button>
          </div>
        </form>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-teal-50 text-teal-700">
            <UserRound size={24} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-950">{user.name}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Mail size={15} />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="mt-4">
            <Badge className="capitalize">{user.role}</Badge>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}

export function UsersView({ users }: { users: UserListItem[] }) {
  return (
    <DashboardShell
      activeHref="/admin/users"
      title="Users"
      breadcrumb={["Workspace", "Admin", "Users"]}
    >
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-base font-semibold text-slate-950">Workspace users</h2>
          <p className="mt-1 text-sm text-slate-500">Accounts provisioned for this clinic.</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </thead>
            <tbody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      </section>
    </DashboardShell>
  );
}
