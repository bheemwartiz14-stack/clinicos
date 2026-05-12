import { Menu, Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

import { ThemeToggle } from "@/components/theme-toggle";

import { Button, buttonVariants } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { getGeneralSettingsMetadataData } from "@/modules/setting/genral-setting/genral-setting.service";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const socialItems = [
  { label: "Facebook", icon: FaFacebookF },
  { label: "Instagram", icon: FaInstagram },
  { label: "X", icon: FaXTwitter },
  { label: "LinkedIn", icon: FaLinkedinIn },
];

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, user] = await Promise.all([getGeneralSettingsMetadataData(), getCurrentUser()]);
  const title = settings.companyName ?? "";
  const description = settings.tagline ?? "";
  const mainLogo = settings.mainLogo;
  const isLoggedIn = Boolean(user);
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary">
              <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary">
                <Image
                  src={mainLogo || "/logo.png"}
                  alt={title}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold sm:text-lg">{title}</h2>

              <p className="hidden text-xs text-muted-foreground sm:block">{description}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            {isLoggedIn ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>

                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />

            <Sheet>
              <SheetTrigger
                aria-label="Open menu"
                className={buttonVariants({ variant: "outline", size: "icon" })}
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent side="right" className="w-[85vw] max-w-sm">
                <SheetHeader className="sr-only">
                  <SheetTitle>Mobile navigation menu</SheetTitle>

                  <SheetDescription>Navigation links for MediClinic Pro website.</SheetDescription>
                </SheetHeader>

                <div className="flex h-full flex-col gap-8 pt-8">
                  {/* Mobile Logo */}
                  <Link href="/" className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                      <Stethoscope className="size-5" />
                    </div>

                    <div>
                      <h3 className="font-bold">MediClinic Pro</h3>

                      <p className="text-xs text-muted-foreground">AI Clinic Platform</p>
                    </div>
                  </Link>

                  {/* Mobile Nav */}
                  <nav className="grid gap-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Actions */}
                  <div className="mt-auto grid gap-3">
                    {isLoggedIn ? (
                      <Button className="w-full" asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/login">Login</Link>
                        </Button>

                        <Button className="w-full" asChild>
                          <Link href="/register">Get Started</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="min-h-screen">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Stethoscope className="size-5" />
              </div>

              <div>
                <h3 className="font-bold">MediClinic Pro</h3>

                <p className="text-xs text-muted-foreground">Smart Clinic Management</p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Modern AI-powered clinic management platform for appointments, EMR, billing and
              analytics.
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap items-center gap-3">
              {socialItems.map(({ label, icon: Icon }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>

            <div className="space-y-3 text-sm text-muted-foreground">
              <Link href="/about" className="block transition-colors hover:text-foreground">
                About
              </Link>

              <Link href="/blog" className="block transition-colors hover:text-foreground">
                Blog
              </Link>

              <Link href="/contact" className="block transition-colors hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="mb-4 font-semibold">Features</h4>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Appointments</p>
              <p>EMR</p>
              <p>Billing</p>
              <p>AI Chatbot</p>
              <p>Analytics</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>

            <div className="space-y-3 break-words text-sm text-muted-foreground">
              <p>support@mediclinicpro.com</p>
              <p>+91 99999 99999</p>
              <p>Haryana, India</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t px-4 py-5 text-center text-sm text-muted-foreground">
          © 2026 MediClinic Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
