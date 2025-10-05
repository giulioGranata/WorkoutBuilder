"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Icon
      role="button"
      tabIndex={0}
      onClick={toggleTheme}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleTheme();
        }
      }}
      aria-label={`Switch to ${nextTheme} theme`}
      className="h-4 w-4 cursor-pointer text-[--text-secondary] transition-colors hover:text-[--text-primary] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
    />
  );
}
