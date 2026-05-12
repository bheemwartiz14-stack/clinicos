export type BranchAddress = {
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
};

export type BranchListItem = {
  id: string;
  name: string;
  code: string;
  type: string;
  supportEmail: string | null;
  supportPhone: string | null;
  managerId: string | null;
  managerName: string | null;
  address: BranchAddress | null;
  notes: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BranchStats = {
  totalBranches: number;
  activeBranches: number;
  mainBranches: number;
};

export type BranchesPageSearchParams = {
  q?: string;
};

export type BranchesPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  branches: BranchListItem[];
  stats: BranchStats;
  query: string;
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type BranchInput = {
  name: string;
  code: string;
  type: string;
  supportEmail?: string;
  supportPhone?: string;
  managerId?: string;
  address?: BranchAddress;
  notes?: string;
  isMain: boolean;
  isActive: boolean;
};

export type UpdateBranchInput = BranchInput & {
  id: string;
};
