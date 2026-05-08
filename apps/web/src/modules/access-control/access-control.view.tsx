"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Role = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type Permission = {
  id: string;
  name: string;
  action: string;
  module: string;
  description: string | null;
  isActive: boolean;
};

type RolePermission = {
  roleId: string;
  roleName: string;
  permissionId: string;
  permissionName: string;
  permissionAction: string;
  permissionModule: string;
};

type AccessControlViewProps = {
  data: {
    roles: Role[];
    permissions: Permission[];
    rolePermissions: RolePermission[];
  };
};

export function AccessControlView({ data }: AccessControlViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

  const [permissionName, setPermissionName] = useState("");
  const [permissionAction, setPermissionAction] = useState("");
  const [permissionModule, setPermissionModule] = useState("");
  const [permissionDescription, setPermissionDescription] = useState("");

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function createRole() {
    await fetch("/api/access-control/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roleName,
        description: roleDescription,
      }),
    });

    setRoleName("");
    setRoleDescription("");
    refresh();
  }

  async function deleteRole(id: string) {
    await fetch(`/api/access-control/roles/${id}`, {
      method: "DELETE",
    });

    refresh();
  }

  async function createPermission() {
    await fetch("/api/access-control/permissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: permissionName,
        action: permissionAction,
        module: permissionModule,
        description: permissionDescription,
      }),
    });

    setPermissionName("");
    setPermissionAction("");
    setPermissionModule("");
    setPermissionDescription("");
    refresh();
  }

  async function deletePermission(id: string) {
    await fetch(`/api/access-control/permissions/${id}`, {
      method: "DELETE",
    });

    refresh();
  }

  async function togglePermission(roleId: string, permissionId: string) {
    const exists = data.rolePermissions.some(
      (item) => item.roleId === roleId && item.permissionId === permissionId
    );

    await fetch("/api/access-control/role-permissions", {
      method: exists ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId,
        permissionId,
      }),
    });

    refresh();
  }

  function hasPermission(roleId: string, permissionId: string) {
    return data.rolePermissions.some(
      (item) => item.roleId === roleId && item.permissionId === permissionId
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Access Control</h1>
        <p className="text-sm text-muted-foreground">
          Manage roles, permissions, and role permission mapping.
        </p>
      </div>

      <section className="grid gap-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Create Role</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Role name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />

          <input
            className="rounded-md border px-3 py-2"
            placeholder="Description"
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
          />

          <button
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            disabled={isPending || !roleName}
            onClick={createRole}
          >
            Create Role
          </button>
        </div>

        <div className="grid gap-2">
          {data.roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{role.name}</p>
                <p className="text-sm text-muted-foreground">
                  {role.description || "No description"}
                </p>
              </div>

              <button
                className="rounded-md border px-3 py-1 text-sm text-red-600"
                onClick={() => deleteRole(role.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Create Permission</h2>

        <div className="grid gap-3 md:grid-cols-5">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Name"
            value={permissionName}
            onChange={(e) => setPermissionName(e.target.value)}
          />

          <input
            className="rounded-md border px-3 py-2"
            placeholder="Action"
            value={permissionAction}
            onChange={(e) => setPermissionAction(e.target.value)}
          />

          <input
            className="rounded-md border px-3 py-2"
            placeholder="Module"
            value={permissionModule}
            onChange={(e) => setPermissionModule(e.target.value)}
          />

          <input
            className="rounded-md border px-3 py-2"
            placeholder="Description"
            value={permissionDescription}
            onChange={(e) => setPermissionDescription(e.target.value)}
          />

          <button
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            disabled={isPending || !permissionName || !permissionAction || !permissionModule}
            onClick={createPermission}
          >
            Create Permission
          </button>
        </div>

        <div className="grid gap-2">
          {data.permissions.map((permission) => (
            <div
              key={permission.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{permission.name}</p>
                <p className="text-sm text-muted-foreground">
                  {permission.module}.{permission.action}
                </p>
              </div>

              <button
                className="rounded-md border px-3 py-1 text-sm text-red-600"
                onClick={() => deletePermission(permission.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Role Permission Matrix</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Permission</th>
                {data.roles.map((role) => (
                  <th key={role.id} className="p-3 text-left">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.permissions.map((permission) => (
                <tr key={permission.id} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{permission.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {permission.module}.{permission.action}
                    </p>
                  </td>

                  {data.roles.map((role) => {
                    const checked = hasPermission(role.id, permission.id);

                    return (
                      <td key={role.id} className="p-3">
                        <button
                          className={[
                            "rounded-md px-3 py-1 text-sm",
                            checked
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500",
                          ].join(" ")}
                          onClick={() =>
                            togglePermission(role.id, permission.id)
                          }
                        >
                          {checked ? "Allowed" : "Denied"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}