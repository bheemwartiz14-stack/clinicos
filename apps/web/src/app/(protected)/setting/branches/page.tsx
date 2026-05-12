import { connection } from "next/server";
import type { BranchesPageSearchParams } from "@/modules/setting/branches";
import {
  branchesPageController,
  createBranchAction,
  deleteBranchAction,
  updateBranchAction,
} from "@/modules/setting/branches";
import { BranchesView } from "@/modules/setting/branches/views/branches.view";

type BranchesPageProps = {
  searchParams: Promise<BranchesPageSearchParams>;
};

export default async function BranchesPage({ searchParams }: BranchesPageProps) {
  await connection();
  const model = await branchesPageController(searchParams);

  return (
    <BranchesView
      {...model}
      createAction={createBranchAction}
      updateAction={updateBranchAction}
      deleteAction={deleteBranchAction}
    />
  );
}
