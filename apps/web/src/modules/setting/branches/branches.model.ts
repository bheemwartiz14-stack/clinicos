import type { BranchListItem, BranchStats, BranchesPageModel } from "./branches.types";

type BranchesPageModelInput = {
  branches: BranchListItem[];
  query?: string;
  stats: BranchStats;
};

export function getBranchesPageModel({
  branches,
  query = "",
  stats,
}: BranchesPageModelInput): BranchesPageModel {
  return {
    title: "Clinic / Branch Setup",
    description: "Manage clinic locations, branch contact details, and operating status.",
    breadcrumb: ["Workspace", "Settings", "Clinic / Branch Setup"],
    branches,
    stats,
    query,
  };
}
