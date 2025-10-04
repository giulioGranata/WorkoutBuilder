"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { useSupabase } from "@/components/SupabaseProvider";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect_to");
  const redirectPath = useMemo(() => {
    if (redirectParam && redirectParam.startsWith("/")) {
      return redirectParam;
    }
    return "/";
  }, [redirectParam]);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      router.replace(redirectPath as Route);
    }
  }, [session, redirectPath, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const emailRedirectTo = `${window.location.origin}${redirectPath}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  };

  return (
    <main className="min-h-screen bg-[--bg] px-6 py-16 text-[--text-primary]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-[--border] bg-[--card] p-8 shadow-lg">
        <div>
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-[--text-secondary]">
            Enter your email address and we will send you a magic link to sign in.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-[--text-primary]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-[--border] bg-[--bg] px-4 py-2 text-[--text-primary] focus:border-[--accent] focus:outline-none focus:ring-2 focus:ring-[--accent]/20"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "sent"}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-[--accent] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Sending magic link..." : status === "sent" ? "Link sent" : "Send magic link"}
          </button>
        </form>
        {errorMessage ? (
          <p className="text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {status === "sent" ? (
          <div className="rounded-lg bg-[--bg] p-4 text-sm text-[--text-secondary]">
            Check your email for a message from Supabase. Open the link on this device to finish signing in.
          </div>
        ) : null}
        <div className="text-sm text-[--text-secondary]">
          <p>
            Having trouble? Ensure your Supabase project has <strong>Email OTP</strong> enabled and that emails are being delivered.
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-[--accent] hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
