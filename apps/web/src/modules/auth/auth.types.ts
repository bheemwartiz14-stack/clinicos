import type { Role } from "@mediclinicpro/types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleId: string | null;
  permissions: string[];
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SessionUser = AuthUser & {
  sessionId: string;
  sessionExpiresAt: Date;
};
