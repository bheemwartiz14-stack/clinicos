import { CalendarDays, Mail, Search, ShieldCheck, UserRound, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionState, UsersPageModel } from "../users.types";
import { DeleteUserButton, EditUserButton, UserAvatar, UsersForm, UsersToast } from "./users.form";

type UserAction = (formData: FormData) => Promise<ActionState>;

type UsersViewProps = UsersPageModel & {
  createAction: UserAction;
  updateAction: UserAction;
  deleteAction: UserAction;
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getPageHref(page: number, query: string, pageSize: number) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  if (pageSize !== 10) {
    params.set("pageSize", String(pageSize));
  }

  const search = params.toString();
  return search ? `/setting/users?${search}` : "/setting/users";
}

function getVisiblePages(page: number, totalPages: number) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function UsersView({
  breadcrumb,
  createAction,
  deleteAction,
  description,
  pagination,
  query,
  departments,
  roles,
  stats,
  title,
  updateAction,
  users,
}: UsersViewProps) {
  const statCards = [
    { icon: Users, label: "Total users", value: stats.totalUsers },
    { icon: ShieldCheck, label: "Verified users", value: stats.verifiedUsers },
    { icon: CalendarDays, label: "Assigned roles", value: stats.withRoles },
  ];

  return (
    <DashboardShell activeHref="/setting/users" breadcrumb={breadcrumb} title={title}>
      <UsersToast />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          <UsersForm action={createAction} departments={departments} roles={roles} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
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
              <h2 className="font-semibold text-foreground">Users</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {users.length} of {pagination.totalItems} users.
              </p>
            </div>

            <form action="/setting/users" className="flex w-full gap-2 lg:w-80">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  defaultValue={query}
                  name="q"
                  placeholder="Search users"
                  type="search"
                />
              </div>

              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {users.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.firstName || user.lastName
                                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                                : "Profile name not set"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="grid gap-1 text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="size-3.5" />
                            {user.email}
                          </span>
                          {user.phone ? <span>{user.phone}</span> : null}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roleName ? (
                            <Badge variant="outline" className="capitalize">
                              {user.roleName}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">No role</span>
                          )}
                          {user.isProtectedSuperAdmin ? (
                            <Badge variant="secondary">Protected</Badge>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={user.emailVerified ? "secondary" : "outline"}>
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(user.updatedAt)}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {user.isProtectedSuperAdmin ? (
                            <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground text-xs">
                              <ShieldCheck className="size-3.5" />
                              Protected
                            </span>
                          ) : (
                            <>
                              <EditUserButton
                                action={updateAction}
                                departments={departments}
                                roles={roles}
                                user={user}
                              />
                              <DeleteUserButton
                                action={deleteAction}
                                user={user}
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>

                <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={getPageHref(
                          Math.max(1, pagination.page - 1),
                          query,
                          pagination.pageSize,
                        )}
                        aria-disabled={!pagination.hasPreviousPage}
                        className={!pagination.hasPreviousPage ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {getVisiblePages(pagination.page, pagination.totalPages).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href={getPageHref(page, query, pagination.pageSize)}
                          isActive={page === pagination.page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href={getPageHref(
                          Math.min(pagination.totalPages, pagination.page + 1),
                          query,
                          pagination.pageSize,
                        )}
                        aria-disabled={!pagination.hasNextPage}
                        className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <UserRound className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No users found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a user or adjust the current search.
                </p>
                <div className="mt-4">
                  <UsersForm action={createAction} departments={departments} roles={roles} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
