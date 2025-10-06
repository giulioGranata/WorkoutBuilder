"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string) {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error(`${component} must be used within a DropdownMenu`);
  }

  return context;
}

function useMergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return React.useCallback(
    (value: T) => {
      for (const ref of refs) {
        if (!ref) continue;

        if (typeof ref === "function") {
          ref(value);
        } else {
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      }
    },
    [refs],
  );
}

export type DropdownMenuProps = {
  children: React.ReactNode;
  className?: string;
};

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const triggerEl = triggerRef.current;
      const contentEl = contentRef.current;

      if (triggerEl?.contains(target)) return;
      if (contentEl?.contains(target)) return;

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
    }),
    [open],
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <div className={cn("relative inline-flex", className)}>{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export type DropdownMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, onClick, onKeyDown, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownMenuContext("DropdownMenuTrigger");
    const mergedRef = useMergeRefs(ref, triggerRef);

    return (
      <button
        {...props}
        ref={mergedRef}
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented) return;

          setOpen(!open);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          if (event.defaultPrevented) return;

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(!open);
          }
        }}
      />
    );
  },
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end";
};

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "end", children, ...props }, ref) => {
    const { open, contentRef, setOpen } = useDropdownMenuContext("DropdownMenuContent");
    const mergedRef = useMergeRefs(ref, contentRef);

    React.useEffect(() => {
      if (!open) return;

      const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      firstFocusable?.focus();
    }, [open, contentRef]);

    if (!open) return null;

    const alignmentClass = align === "start" ? "left-0" : "right-0";

    return (
      <div
        {...props}
        ref={mergedRef}
        role="menu"
        tabIndex={-1}
        className={cn(
          "absolute top-full z-50 mt-2 min-w-[12rem] rounded-xl border border-[--border] bg-[color:var(--card)] p-1 text-sm text-[--text-primary] shadow-xl outline-none backdrop-blur-sm",
          alignmentClass,
          className,
        )}
        data-state={open ? "open" : "closed"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
      >
        {children}
      </div>
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export type DropdownMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  inset?: boolean;
};

export const dropdownMenuItemClass =
  "flex w-full select-none items-center rounded-lg px-3 py-2 text-sm text-[--text-secondary] motion-safe:transition-colors motion-safe:duration-200 hover:bg-[color:var(--color-surface-muted)] hover:text-[--text-primary] focus-ring";

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, onClick, type, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext("DropdownMenuItem");
    const buttonType = type ?? "button";

    return (
      <button
        {...props}
        ref={ref}
        role="menuitem"
        type={buttonType}
        className={cn(dropdownMenuItemClass, inset && "pl-9", className)}
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented) return;

          if (buttonType === "submit") {
            requestAnimationFrame(() => setOpen(false));
            return;
          }

          setOpen(false);
        }}
      />
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenuItem";
