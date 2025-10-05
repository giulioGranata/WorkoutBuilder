"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { signOutAllSessionsAction } from "./actions";

export default function SessionsSection() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const result = await signOutAllSessionsAction();

      if (result.success) {
        toast({
          title: "Signed out",
          description: "All active sessions were revoked.",
        });
      } else {
        toast({
          title: "Failed to sign out",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <section className="rounded-3xl border -[--border] bg-[--card] p-8 shadow-[--shadow-card]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sessions</h2>
          <p className="text-sm text-[--text-secondary]">
            Force a sign out on every device connected to your account.
          </p>
        </div>
        <Button onClick={handleSignOut} disabled={isPending} variant="outline">
          {isPending ? "Signing out..." : "Sign out from all devices"}
        </Button>
      </div>
    </section>
  );
}
