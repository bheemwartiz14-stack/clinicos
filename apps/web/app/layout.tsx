import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ServiceWorkerCleanup } from "@/components/service-worker-cleanup";
import { ToastListener } from "@/components/toast-listener";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "MediClinic Pro",
  description: "Enterprise AI-ready clinic management system for USA clinic workflows",
  applicationName: "MediClinic Pro",
  keywords: ["clinic management", "EHR", "appointments", "billing", "healthcare operations", "RBAC"],
  authors: [{ name: "MediClinic Pro" }],
  creator: "MediClinic Pro",
  publisher: "MediClinic Pro",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "MediClinic Pro",
    description: "Premium clinic operations platform for secure scheduling, patient intake, billing, payroll, and AI workflows.",
    url: "/",
    siteName: "MediClinic Pro",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "MediClinic Pro",
    description: "Enterprise AI-ready clinic management system for USA clinic workflows"
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
