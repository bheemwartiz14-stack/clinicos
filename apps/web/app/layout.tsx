import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";
import { ServiceWorkerCleanup } from "@/components/service-worker-cleanup";
import { ToastListener } from "@/components/toast-listener";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Clinicos",
    template: "%s | Clinicos",
  },
  description: "Enterprise AI-ready clinic management system.",
  applicationName: "Clinicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
      lang="en"
      className="font-sans"
    >
      <body suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>

        <ServiceWorkerCleanup />
        <ToastListener />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}