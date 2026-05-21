import { redirect } from "next/navigation";

export default function RbacIndexPage() {
  redirect("/rbac/roles");
}
