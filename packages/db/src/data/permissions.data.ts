export const permissionsData = [
  {
    module: "dashboard",
    action: "view",
    code: "dashboard.view",
    description: "View dashboard",
  },

  {
    module: "patients",
    action: "view",
    code: "patients.view",
    description: "View patients",
  },

  {
    module: "patients",
    action: "create",
    code: "patients.create",
    description: "Create patient",
  },

  {
    module: "patients",
    action: "edit",
    code: "patients.edit",
    description: "Edit patient",
  },

  {
    module: "patients",
    action: "delete",
    code: "patients.delete",
    description: "Delete patient",
  },

  {
    module: "appointments",
    action: "view",
    code: "appointments.view",
    description: "View appointments",
  },

  {
    module: "appointments",
    action: "create",
    code: "appointments.create",
    description: "Create appointments",
  },

  {
    module: "appointments",
    action: "edit",
    code: "appointments.edit",
    description: "Edit appointments",
  },

  {
    module: "billing",
    action: "view",
    code: "billing.view",
    description: "View billing",
  },

  {
    module: "billing",
    action: "manage",
    code: "billing.manage",
    description: "Manage billing",
  },

  {
    module: "doctors",
    action: "view",
    code: "doctors.view",
    description: "View doctors",
  },

  {
    module: "doctors",
    action: "manage",
    code: "doctors.manage",
    description: "Manage doctors",
  },

  {
    module: "staff",
    action: "manage",
    code: "staff.manage",
    description: "Manage staff users",
  },

  {
    module: "settings",
    action: "profile",
    code: "settings.profile",
    description: "Manage own profile and security settings",
  },

  {
    module: "settings",
    action: "manage",
    code: "settings.manage",
    description: "Manage settings",
  },

  {
    module: "rbac",
    action: "manage",
    code: "rbac.manage",
    description: "Manage RBAC",
  },
] satisfies Array<{
  module: string;
  action: string;
  code: string;
  description: string | null;
}>;
