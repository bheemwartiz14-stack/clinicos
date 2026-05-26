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
    module: "specialties",
    action: "view",
    code: "specialties.view",
    description: "View specialties",
  },
  {
    module: "specialties",
    action: "manage",
    code: "specialties.manage",
    description: "Manage specialties",
  },
  {
    module: "rbac",
    action: "manage",
    code: "rbac.manage",
    description: "Manage RBAC",
  },
  {
    module: "settings",
    action: "notifications",
    code: "settings.notifications",
    description: "Manage notification settings",
  },
  {
    module: "notifications",
    action: "view",
    code: "notifications.view",
    description: "View notifications",
  },
  {
    module: "notifications",
    action: "create",
    code: "notifications.create",
    description: "Create notifications",
  },
  {
    module: "notifications",
    action: "edit",
    code: "notifications.edit",
    description: "Edit notifications",
  },
  {
    module: "notifications",
    action: "delete",
    code: "notifications.delete",
    description: "Delete notifications",
  },
  {
    module: "billing",
    action: "manage",
    code: "billing.manage",
    description: "Manage billing",
  },
  {
    module: "payroll",
    action: "view",
    code: "payroll.view",
    description: "View payroll",
  },
  {
    module: "payroll",
    action: "manage",
    code: "payroll.manage",
    description: "Manage payroll",
  },
  {
    module: "payroll",
    action: "approve",
    code: "payroll.approve",
    description: "Approve payroll",
  },
  {
    module: "payroll",
    action: "pay",
    code: "payroll.pay",
    description: "Process payroll payments",
  },
  {
    module: "documents",
    action: "view",
    code: "documents.view",
    description: "View documents",
  },
  {
    module: "documents",
    action: "create",
    code: "documents.create",
    description: "Upload documents",
  },
  {
    module: "documents",
    action: "delete",
    code: "documents.delete",
    description: "Delete documents",
  },
  {
    module: "reports",
    action: "view",
    code: "reports.view",
    description: "View reports",
  },
  {
    module: "reports",
    action: "export",
    code: "reports.export",
    description: "Export reports",
  },
  {
    module: "branches",
    action: "view",
    code: "branches.view",
    description: "View branches",
  },
  {
    module: "branches",
    action: "create",
    code: "branches.create",
    description: "Create branches",
  },
  {
    module: "branches",
    action: "edit",
    code: "branches.edit",
    description: "Edit branches",
  },
  {
    module: "branches",
    action: "delete",
    code: "branches.delete",
    description: "Delete branches",
  },
  {
    module: "ai",
    action: "view",
    code: "ai.view",
    description: "View AI assistant",
  },
  {
    module: "audit",
    action: "view",
    code: "audit.view",
    description: "View audit logs",
  },
  {
    module: "audit",
    action: "export",
    code: "audit.export",
    description: "Export audit logs",
  },
] satisfies Array<{
  module: string;
  action: string;
  code: string;
  description: string | null;
}>;
