export const rolesData = [
  {
    name: "Admin",
    code: "admin",
    description: "System administrator with full access",
    isSystem: true,
    createdAt: new Date(),
  },

  {
    name: "Doctor",
    code: "doctor",
    description: "Doctor role",
    isSystem: true,
    createdAt: new Date(),
  },

  {
    name: "Receptionist",
    code: "receptionist",
    description: "Receptionist role",
    isSystem: true,
    createdAt: new Date(),
  },

  {
    name: "Accountant",
    code: "accountant",
    description: "Accountant role",
    isSystem: true,
    createdAt: new Date(),
  },
  {
    name: "Nurse",
    code: "nurse",
    description: "Nurse role",
    isSystem: true,
    createdAt: new Date(),
  },
] satisfies Array<{
  name: string;
  code: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
}>;
