import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ServiceWorkerCleanup } from "@/components/service-worker-cleanup";
import { ToastListener } from "@/components/toast-listener";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "Clinicos", template: "%s | Clinicos" },
  description: "Enterprise AI-ready clinic management system.",
  applicationName: "Clinicos",
  keywords: ["clinic management", "EHR", "appointments", "billing", "healthcare operations", "RBAC"],
  authors: [{ name: "Clinicos" }],
  creator: "Clinicos",
  publisher: "Clinicos",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Clinicos" },
  formatDetection: { telephone: true },
  openGraph: {
    title: "Clinicos",
    description: "Enterprise AI-ready clinic management system.",
    url: "/",
    siteName: "Clinicos",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Clinicos",
    description: "Enterprise AI-ready clinic management system."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body suppressHydrationWarning>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
        <ServiceWorkerCleanup />
        <Toaster richColors position="top-right" />
        <ToastListener />
      </body>
    </html>
  );
}
