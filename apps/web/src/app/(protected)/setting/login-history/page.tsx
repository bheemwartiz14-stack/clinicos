import { loginHistoryPageController, LoginHistoryPageSearchParams } from "@/modules/setting/login-history";
import { LoginHistoryView } from "@/modules/setting/login-history/views/login-history.view";

type LoginHistoryPageProps = {
  searchParams: Promise<LoginHistoryPageSearchParams>;
};

export default async function LoginHistoryPage({ searchParams }: LoginHistoryPageProps) {
  const pageData = await loginHistoryPageController(searchParams);

  return <LoginHistoryView {...pageData} />;
}
