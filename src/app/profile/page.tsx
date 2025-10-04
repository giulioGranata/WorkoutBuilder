import type { Metadata } from "next";

import { getProfileAction } from "./actions";
import ProfileForm from "./ProfileForm";
import SessionsSection from "./SessionsSection";
import DataControls from "./DataControls";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, profile } = await getProfileAction();
  const metadata = (user.user_metadata ?? {}) as { full_name?: string; user_name?: string };
  const fallbackName = metadata.full_name ?? metadata.user_name ?? user.email ?? "";
  const initialValues = {
    displayName: profile.displayName || fallbackName,
    ftp: profile.ftp,
    defaultDurationMinutes: profile.defaultDurationMinutes,
    units: profile.units,
  };

  return (
    <main className="min-h-screen bg-[--bg] px-6 py-12 text-[--text-primary]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <div>
          <h1 className="text-3xl font-semibold">Profile</h1>
          <p className="mt-2 text-[--text-secondary]">Manage your account preferences and session security.</p>
        </div>
        <section className="rounded-3xl border border-[--border] bg-[--card] p-8 shadow-lg">
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Account</h2>
            <p className="text-sm text-[--text-secondary]">Update how your name and workout defaults appear across the app.</p>
          </div>
          <ProfileForm
            initialValues={initialValues}
            email={user.email ?? ""}
          />
        </section>
        <SessionsSection />
        <DataControls />
      </div>
    </main>
  );
}
