import type { Role } from "@mediclinicpro/types";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: Role | "user";
  createdAt: Date;
};

export type ProfileUpdateInput = {
  name: string;
  email: string;
};
