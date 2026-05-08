import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { AppProviders } from "@/components/providers/app-providers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

import "../globals.css";
import { Geist } from "next/font/google";
import { cn } from "@mediclinicpro/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MediClinic Pro",
  description: "Enterprise AI-ready clinic management system",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground antialiased"
      >
        <AppProviders>
          <Suspense fallback={null}>{children}</Suspense>
          <ServiceWorkerRegister />
        </AppProviders>
      </body>
    </html>
  );
}