// src/modules/dashboard/dashboard.model.ts

import type { DashboardPageModel } from "./dashboard.types";

type DashboardModelInput = {
  totalPatients: number;
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
};

export function getDashboardPageModel(
  input: DashboardModelInput,
): DashboardPageModel {
  return {
    title: "Dashboard",

    description: "Welcome back. Here’s your clinic overview.",

    breadcrumb: ["Workspace", "Dashboard"],

    stats: [
      {
        title: "Total Patients",
        value: String(input.totalPatients),
      },

      {
        title: "Users",
        value: String(input.totalUsers),
      },

      {
        title: "Roles",
        value: String(input.totalRoles),
      },

      {
        title: "Permissions",
        value: String(input.totalPermissions),
      },
    ],

    todayAppointments: [],

    aiInsights: [
      {
        text: `You have ${input.totalPatients} patients in the system.`,
      },

      {
        text: `You have ${input.totalUsers} registered users.`,
      },

      {
        text: `RBAC contains ${input.totalRoles} roles and ${input.totalPermissions} permissions.`,
      },
    ],
  };
}