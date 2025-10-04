import type { Metadata } from "next";
import Link from "next/link";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Workout Generator Pro",
};

export default async function ProPage() {
  let user: User | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to load Supabase user", error);
    }
  }

  const metadata = (user?.user_metadata ?? {}) as {
    full_name?: string;
    user_name?: string;
  };
  const displayName = metadata.full_name ?? metadata.user_name ?? user?.email ?? "athlete";

  return (
    <main className="min-h-screen bg-[--bg] px-6 py-16 text-[--text-primary]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-[--border] bg-[--card] p-8 shadow-lg">
        <div>
          <h1 className="text-3xl font-semibold">Pro dashboard</h1>
          <p className="mt-2 text-[--text-secondary]">
            Welcome{user ? `, ${displayName}` : ""}! This area is reserved for future premium analytics and planning tools.
          </p>
        </div>
        <div className="rounded-2xl bg-[--bg] p-6">
          <p className="text-[--text-secondary]">
            We are just getting started. Come back soon for advanced workout scheduling, adaptive training insights, and progress tracking tailored to your riding goals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[--accent] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Back to generator
          </Link>
          <span className="text-xs text-[--text-tertiary]">
            Need to manage your account? Use the sign out button in the header.
          </span>
        </div>
      </div>
    </main>
  );
}
