import type { Metadata } from "next";
import "./globals.css";

import type { Session } from "@supabase/supabase-js";

import Header from "@/components/Header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Workout Generator",
  description:
    "Generate personalized cycling workouts tailored to your FTP and goals.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: Session | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to load Supabase session", error);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[--bg] text-[--text-primary] font-sans">
        <Providers initialSession={session}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1 flex-col">{children}</div>
            <footer className="mt-12 border-t border-[--border] bg-[--card]">
              <div className="mx-auto max-w-5xl px-4">
                <div className="flex flex-col items-center justify-start sm:flex-row">
                  <div className="mb-4 text-sm text-[--text-secondary] sm:mb-0">
                    © {new Date().getFullYear()} Workout Generator. Built for
                    cyclists, by cyclists.
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
