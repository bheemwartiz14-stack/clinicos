import { connection } from "next/server";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
  usersPageController,
} from "@/modules/setting/users";
import type { UsersPageSearchParams } from "@/modules/setting/users";
import { UsersView } from "@/modules/setting/users/views/users.view";

type UsersPageProps = {
  searchParams: Promise<UsersPageSearchParams>;
};

export default async function UserManagementPage({ searchParams }: UsersPageProps) {
  await connection();
  const model = await usersPageController(searchParams);
  return (
    <UsersView
      {...model}
      createAction={createUserAction}
      updateAction={updateUserAction}
      deleteAction={deleteUserAction}
    />
  );
}
