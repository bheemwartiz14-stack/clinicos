import Link from "next/link";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  Menu,
  MessageCircle,
  Stethoscope,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Stethoscope className="size-5" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold sm:text-lg">
                MediClinic Pro
              </h2>

              <p className="hidden text-xs text-muted-foreground sm:block">
                AI Clinic Platform
              </p>
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

            <Link href="/login">
              <Button variant="outline">
                Login
              </Button>
            </Link>

            <Link href="/register">
              <Button>
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[85vw] max-w-sm"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>
                    Mobile navigation menu
                  </SheetTitle>

                  <SheetDescription>
                    Navigation links for MediClinic Pro
                    website.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex h-full flex-col gap-8 pt-8">
                  {/* Mobile Logo */}
                  <Link
                    href="/"
                    className="flex items-center gap-3"
                  >
                    <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                      <Stethoscope className="size-5" />
                    </div>

                    <div>
                      <h3 className="font-bold">
                        MediClinic Pro
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        AI Clinic Platform
                      </p>
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
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full"
                      >
                        Login
                      </Button>
                    </Link>

                    <Link href="/register">
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="min-h-screen">
        {children}
      </main>

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
                <h3 className="font-bold">
                  MediClinic Pro
                </h3>

                <p className="text-xs text-muted-foreground">
                  Smart Clinic Management
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Modern AI-powered clinic management
              platform for appointments, EMR,
              billing and analytics.
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                FacebookIcon,
                InstagramIcon,
                MessageCircle,
                LinkedinIcon,
              ].map((Icon, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                >
                  <Icon className="size-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold">
              Company
            </h4>

            <div className="space-y-3 text-sm text-muted-foreground">
              <Link
                href="/about"
                className="block transition-colors hover:text-foreground"
              >
                About
              </Link>

              <Link
                href="/blog"
                className="block transition-colors hover:text-foreground"
              >
                Blog
              </Link>

              <Link
                href="/contact"
                className="block transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="mb-4 font-semibold">
              Features
            </h4>

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
            <h4 className="mb-4 font-semibold">
              Contact
            </h4>

            <div className="space-y-3 break-words text-sm text-muted-foreground">
              <p>support@mediclinicpro.com</p>
              <p>+91 99999 99999</p>
              <p>Haryana, India</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t px-4 py-5 text-center text-sm text-muted-foreground">
          © 2026 MediClinic Pro. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}