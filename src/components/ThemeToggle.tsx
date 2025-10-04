"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-muted] text-[--color-text-secondary] transition-colors duration-200 hover:bg-[--color-surface] hover:text-[--color-text-primary] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-surface]"
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "h-4 w-4 transition-all duration-300",
          theme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
