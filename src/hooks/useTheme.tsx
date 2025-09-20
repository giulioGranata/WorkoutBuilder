import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSystemPreference: () => void;
}

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return null;
}

function readSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [userPreference, setUserPreference] = useState<Theme | null>(() => {
    return readStoredTheme();
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = readStoredTheme();
    return stored ?? readSystemTheme();
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (userPreference) {
      window.localStorage.setItem(STORAGE_KEY, userPreference);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [userPreference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (userPreference !== null) {
        return;
      }
      setThemeState(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [userPreference]);

  const applyTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setUserPreference(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      setUserPreference(next);
      return next;
    });
  }, []);

  const setSystemPreference = useCallback(() => {
    setUserPreference(null);
    setThemeState(readSystemTheme());
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference: userPreference ?? "system",
      setTheme: applyTheme,
      toggleTheme,
      setSystemPreference,
    }),
    [applyTheme, setSystemPreference, theme, toggleTheme, userPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
