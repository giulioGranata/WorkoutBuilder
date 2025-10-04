import type { Metadata } from "next";
import "./globals.css";

import type { Session } from "@supabase/supabase-js";

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
      <body>
        <Providers initialSession={session}>{children}</Providers>
      </body>
    </html>
  );
}
