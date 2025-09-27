import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import { PatternLibraryProvider } from "@/hooks/usePatternLibrary";
import { FALLBACK_PATTERNS } from "@/lib/patterns";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

type WrapperProps = {
  children: ReactNode;
};

export function renderWithPatternLibrary(
  ui: ReactElement,
  options?: RenderOptions,
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <PatternLibraryProvider
          initialData={{ version: "test", patterns: FALLBACK_PATTERNS }}
        >
          {children}
        </PatternLibraryProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
