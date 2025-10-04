import Link from "next/link";
import type { Metadata } from "next";
import { Dumbbell } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

import { getProfileAction } from "./actions";
import ProfileForm from "./ProfileForm";
import SessionsSection from "./SessionsSection";
import DataControls from "./DataControls";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, profile } = await getProfileAction();
  const userMetadata = (user.user_metadata ?? {}) as { full_name?: string; user_name?: string };
  const fallbackName = userMetadata.full_name ?? userMetadata.user_name ?? user.email ?? "";
  const initialValues = {
    displayName: profile.displayName || fallbackName,
    ftp: profile.ftp,
    defaultDurationMinutes: profile.defaultDurationMinutes,
    units: profile.units,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--bg] text-[--text-primary] font-sans">
      <header className="border-b border-[--border] bg-[--card]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[--accent]">
              <Dumbbell className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[--text-primary] sm:text-3xl">Profile</h1>
              <p className="text-sm text-[--text-secondary]">Manage your account preferences and session security.</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <div className="flex flex-col text-sm text-[--text-secondary]">
              <span className="font-medium text-[--text-primary]">{initialValues.displayName}</span>
              <span className="text-xs text-[--text-tertiary]">{user.email}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <Link
                href="/"
                className="text-sm font-medium text-[--text-primary] transition-colors hover:text-[--accent]"
              >
                Generator
              </Link>
              <form action="/sign-out" method="post">
                <button className="rounded-lg bg-[--accent] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                  Sign out
                </button>
              </form>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
          <section className="rounded-3xl border border-[--border] bg-[--card] p-8 shadow-lg">
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="text-sm text-[--text-secondary]">Update how your name and workout defaults appear across the app.</p>
            </div>
            <ProfileForm initialValues={initialValues} email={user.email ?? ""} />
          </section>
          <SessionsSection />
          <DataControls />
        </div>
      </main>

      <footer className="border-t border-[--border] bg-[--card]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-sm text-[--text-secondary]">
          <span>© {new Date().getFullYear()} Workout Generator</span>
          <span className="text-[--text-tertiary]">Stay consistent, ride smarter.</span>
        </div>
      </footer>
    </div>
  );
}
