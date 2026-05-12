import { Building2, CheckCircle2, Home, Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionState, BranchesPageModel } from "../branches.types";
import { BranchForm, BranchesToast, DeleteBranchButton, EditBranchButton } from "./branches.form";

type BranchAction = (formData: FormData) => Promise<ActionState>;

type BranchesViewProps = BranchesPageModel & {
  createAction: BranchAction;
  updateAction: BranchAction;
  deleteAction: BranchAction;
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatAddress(address: BranchesPageModel["branches"][number]["address"]) {
  if (!address) return "-";

  return [address.addressLine1, address.addressLine2, address.city, address.state, address.country]
    .filter(Boolean)
    .join(", ") || "-";
}

export function BranchesView({
  branches,
  breadcrumb,
  createAction,
  deleteAction,
  description,
  query,
  stats,
  title,
  updateAction,
}: BranchesViewProps) {
  const statCards = [
    { icon: Building2, label: "Total branches", value: stats.totalBranches },
    { icon: CheckCircle2, label: "Active", value: stats.activeBranches },
    { icon: Home, label: "Main branches", value: stats.mainBranches },
  ];

  return (
    <DashboardShell activeHref="/setting/branches" breadcrumb={breadcrumb} title={title}>
      <BranchesToast />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          <BranchForm action={createAction} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Branch list</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Clinic locations sorted by latest activity.
              </p>
            </div>

            <form action="/setting/branches" className="flex w-full gap-2 lg:w-80">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  defaultValue={query}
                  name="q"
                  placeholder="Search branches"
                  type="search"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {branches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{branch.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {branch.code} · {branch.type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="max-w-48 truncate">{branch.supportEmail ?? "-"}</div>
                      <div className="text-xs">{branch.supportPhone ?? ""}</div>
                    </TableCell>
                    <TableCell className="max-w-72 text-muted-foreground text-sm">
                      {formatAddress(branch.address)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={branch.isActive ? "secondary" : "outline"}>
                          {branch.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {branch.isMain ? <Badge>Main</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(branch.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <EditBranchButton action={updateAction} branch={branch} />
                        <DeleteBranchButton action={deleteAction} branch={branch} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <Building2 className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No branches found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a clinic branch or adjust the current search.
                </p>
                <div className="mt-4">
                  <BranchForm action={createAction} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
