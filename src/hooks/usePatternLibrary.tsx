import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  FALLBACK_PATTERNS,
  parsePatternPayload,
  type PatternPayload,
  type PatternSet,
} from "@/lib/patterns";
import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

interface PatternLibraryContextValue {
  patterns: PatternSet;
  version: string;
  isFallback: boolean;
  isLoading: boolean;
  error: Error | null;
}

const PatternLibraryContext = createContext<PatternLibraryContextValue | undefined>(
  undefined,
);

interface PatternLibraryProviderProps {
  children: ReactNode;
  initialData?: PatternPayload;
}

export function PatternLibraryProvider({
  children,
  initialData,
}: PatternLibraryProviderProps) {
  const { toast } = useToast();
  const hasWarnedRef = useRef(false);

  const query = useQuery<PatternPayload, Error>({
    queryKey: ["pattern-library"],
    queryFn: async () => {
      const response = await fetch("/patterns/patterns.json");
      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Failed to load pattern catalog (${response.status})`,
        );
      }

      const json = await response.json();
      return parsePatternPayload(json);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    initialData,
    enabled: !initialData,
  });

  const error = query.error ?? null;

  useEffect(() => {
    if (error && !hasWarnedRef.current) {
      toast({
        title: "Using fallback workout patterns",
        description: error.message,
      });
      hasWarnedRef.current = true;
    } else if (!error) {
      hasWarnedRef.current = false;
    }
  }, [error, toast]);

  const patterns = query.data?.patterns ?? FALLBACK_PATTERNS;
  const version = query.data?.version ?? "fallback";
  const isFallback = !query.data;
  const isLoading = query.isPending;

  const value = useMemo<PatternLibraryContextValue>(
    () => ({
      patterns,
      version,
      isFallback,
      isLoading,
      error,
    }),
    [patterns, version, isFallback, isLoading, error],
  );

  return (
    <PatternLibraryContext.Provider value={value}>
      {children}
    </PatternLibraryContext.Provider>
  );
}

export function usePatternLibrary(): PatternLibraryContextValue {
  const context = useContext(PatternLibraryContext);
  if (!context) {
    throw new Error(
      "usePatternLibrary must be used within a PatternLibraryProvider",
    );
  }
  return context;
}
