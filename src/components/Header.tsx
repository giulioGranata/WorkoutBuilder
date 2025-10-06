"use client";

import type { Session } from "@supabase/supabase-js";
import { Dumbbell, Menu, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useSupabase } from "@/components/SupabaseProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  dropdownMenuItemClass,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS: Array<{ label: string; href: Route }> = [
  { label: "Generator", href: "/" },
  { label: "Pro", href: "/pro" },
];

function getDisplayName(session: Session | null) {
  const metadata = (session?.user?.user_metadata ?? {}) as {
    full_name?: string;
    user_name?: string;
  };

  return metadata.full_name ?? metadata.user_name ?? session?.user?.email ?? "";
}

function getInitials(input: string) {
  if (!input) return "WG";

  const tokens = input
    .split(/[\s@._-]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return input.slice(0, 2).toUpperCase();
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase();
}

export function Header() {
  const { session } = useSupabase();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isProfile = pathname?.startsWith("/profile");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const displayName = useMemo(() => getDisplayName(session), [session]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  return (
    <header className="sticky top-0 z-40 border-b border-[--border] surface-glass">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-90"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[--accent] text-[--accent-foreground] shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
              <Dumbbell className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight text-[--text-primary]">
              Workout Generator
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;

              if (active && item.label !== "Pro") {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-[--text-secondary] motion-safe:transition-colors motion-safe:duration-200 hover:text-[--text-primary] focus-visible:outline-none focus-visible:text-[--text-primary]",
                    active
                      ? "text-sky-400 underline underline-offset-4 decoration-sky-400/40"
                      : undefined,
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <DropdownMenu className="hidden md:inline-flex">
              <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full border border-[--border] bg-[color:var(--color-surface-muted)] text-sm font-medium uppercase text-[--text-primary] motion-safe:transition-colors motion-safe:duration-200 hover:bg-[color:var(--color-surface)] focus-ring btn-press">
                {initials}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border border-[--border] bg-[color:var(--card)] text-[--text-primary] backdrop-blur-sm shadow-xl">
                <div className="px-3 pb-2 pt-3">
                  <p className="text-xs uppercase tracking-wide text-[--text-tertiary]">
                    Signed in
                  </p>
                  <p className="truncate text-sm text-[--text-secondary]">
                    {displayName || session.user?.email}
                  </p>
                </div>
                <div className="my-1 h-px bg-[--border]" />
                {!isProfile ? (
                  <Link href="/profile" className={dropdownMenuItemClass}>
                    Profile
                  </Link>
                ) : null}
                <form action="/sign-out" method="post" className="contents">
                  <DropdownMenuItem type="submit">Sign out</DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="primary"
              size="sm"
              className="hidden rounded-full md:inline-flex"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[--text-secondary] md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className={cn("md:hidden", menuOpen ? "block" : "hidden")}>
        <div className="border-t border-[--border] surface-glass px-4 py-3">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;

              if (active && item.label !== "Pro") {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium text-[--text-secondary] motion-safe:transition-colors motion-safe:duration-200 hover:bg-[color:var(--color-surface-muted)] hover:text-[--text-primary] focus-ring",
                    active
                      ? "text-sky-400 underline underline-offset-4 decoration-sky-400/40"
                      : undefined,
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 border-t border-[--border] pt-3">
            {session ? (
              <div className="flex flex-col gap-2">
                {!isProfile ? (
                  <Link
                    href="/profile"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[--text-secondary] motion-safe:transition-colors motion-safe:duration-200 hover:bg-[color:var(--color-surface-muted)] hover:text-[--text-primary] focus-ring"
                  >
                    Profile
                  </Link>
                ) : null}
                <form action="/sign-out" method="post">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start text-[--text-secondary]"
                  >
                    Sign out
                  </Button>
                </form>
              </div>
            ) : (
              <Button
                asChild
                variant="primary"
                size="sm"
                className="w-full rounded-full"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
