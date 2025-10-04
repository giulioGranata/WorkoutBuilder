'use client';

import type { Session } from "@supabase/supabase-js";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import { PatternLibraryProvider } from "@/hooks/usePatternLibrary";
import { ThemeProvider } from "@/hooks/useTheme";
import defaultPatternPayload from "../../public/patterns/default.json";
import { parsePatternPayload, type PatternPayload } from "@/lib/patterns";
import { queryClient } from "@/lib/queryClient";

let parsedDefaultPatterns: PatternPayload | undefined;

try {
  parsedDefaultPatterns = parsePatternPayload(defaultPatternPayload);
} catch (error) {
  if (process.env.NODE_ENV !== "production") {
    console.error("Failed to parse default pattern payload", error);
  }
  parsedDefaultPatterns = undefined;
}

export function Providers({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  return (
    <SupabaseProvider initialSession={initialSession}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <PatternLibraryProvider initialData={parsedDefaultPatterns}>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </PatternLibraryProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}
