import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { AppProviders } from "@/components/providers/app-providers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { getGeneralSettingsMetadataData } from "@/modules/setting/genral-setting/genral-setting.service";

import "../globals.css";
const defaultTitle = "MediClinic Pro";
const defaultDescription = "Enterprise AI-ready clinic management system";
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getGeneralSettingsMetadataData();
    const title = settings.companyName ?? defaultTitle;
    const description = settings.tagline ?? defaultDescription;
    const favicon = settings.favicon;
    const mainLogo = settings.mainLogo;
    return {
      title,
      description,
      manifest: "/manifest.webmanifest",
      icons: {
        icon: favicon ? [{ url: favicon }] : undefined,
        apple: mainLogo ? [{ url: mainLogo }] : undefined,
      },
    };
  } catch (error) {
    return {
      title: defaultTitle,
      description: defaultDescription,
    };
  }
}

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
    <html lang="en" suppressHydrationWarning className="font-sans">
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