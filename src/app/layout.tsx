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
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
