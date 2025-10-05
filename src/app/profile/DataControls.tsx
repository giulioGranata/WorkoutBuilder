"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DataControls() {
  const { toast } = useToast();
  const [isExporting, startExport] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handleExport = () => {
    startExport(async () => {
      try {
        const response = await fetch("/profile/export", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to download data");
        }

        const blob = await response.blob();
        const fileName = `workout-builder-export-${new Date().toISOString()}.json`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Export started",
          description: "Your profile and workouts have been downloaded.",
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Export failed";
        toast({
          title: "Export failed",
          description: message,
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    startDelete(async () => {
      try {
        const response = await fetch("/profile/delete", {
          method: "DELETE",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Failed to delete account");
        }

        toast({
          title: "Account deleted",
          description: "Redirecting you to the sign-in page...",
        });

        window.location.href = "/sign-in";
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete account";
        toast({
          title: "Failed to delete account",
          description: message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <section className="rounded-3xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold">Data & privacy</h2>
          <p className="text-sm text-[--text-secondary]">
            Download your data or permanently remove your account from Workout
            Generator.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
          >
            {isExporting ? "Exporting..." : "Export my data"}
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Delete account"}
          </Button>
        </div>
      </div>
    </section>
  );
}
