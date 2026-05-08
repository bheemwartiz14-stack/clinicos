import type { Role } from "@mediclinicpro/types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type LoginInput = {
  email: string;
  password: string;
};
