import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type ProfileUnits = "metric" | "imperial";

export interface UserProfile {
  displayName: string;
  ftp: number | null;
  defaultDurationMinutes: number | null;
  units: ProfileUnits;
}

export interface ProfileWithUser {
  user: User;
  profile: UserProfile;
}

const PROFILE_SELECT = "display_name, ftp, default_duration, units";
const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  ftp: null,
  defaultDurationMinutes: null,
  units: "metric",
};

async function getAuthenticatedClient(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Failed to load Supabase user: ${error.message}`);
  }

  if (!data.user) {
    redirect("/sign-in");
  }

  return { supabase, user: data.user };
}

export async function fetchProfile(): Promise<ProfileWithUser> {
  const { supabase, user } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("user_profile")
    .select(PROFILE_SELECT)
    .eq("user_id", user.id)
    .limit(1);

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  const row = data?.[0];
  const profile: UserProfile = {
    displayName: row?.display_name ?? DEFAULT_PROFILE.displayName,
    ftp: row?.ftp ?? DEFAULT_PROFILE.ftp,
    defaultDurationMinutes:
      row?.default_duration ?? DEFAULT_PROFILE.defaultDurationMinutes,
    units: (row?.units as ProfileUnits | null) ?? DEFAULT_PROFILE.units,
  };

  return { user, profile };
}

export async function upsertProfile(input: UserProfile): Promise<void> {
  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase.from("user_profile").upsert(
    {
      user_id: user.id,
      display_name: input.displayName || null,
      ftp: input.ftp,
      default_duration: input.defaultDurationMinutes,
      units: input.units,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(`Failed to save profile: ${error.message}`);
  }
}

export async function signOutEverywhere(): Promise<void> {
  const { supabase } = await getAuthenticatedClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) {
    throw new Error(`Failed to sign out from all sessions: ${error.message}`);
  }
}

export interface ExportPayload {
  profile: UserProfile | null;
  saved_workouts: unknown[];
}

export async function buildExportPayload(): Promise<ExportPayload> {
  const { supabase, user } = await getAuthenticatedClient();
  const [
    { data: profileRows, error: profileError },
    { data: workoutsData, error: workoutsError },
  ] = await Promise.all([
    supabase
      .from("user_profile")
      .select(PROFILE_SELECT)
      .eq("user_id", user.id)
      .limit(1),
    supabase
      .from("saved_workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  if (profileError) {
    throw new Error(`Failed to load profile: ${profileError.message}`);
  }

  if (workoutsError) {
    throw new Error(`Failed to load saved workouts: ${workoutsError.message}`);
  }

  const profileRow = profileRows?.[0];
  const profile: UserProfile | null = profileRow
    ? {
        displayName: profileRow.display_name ?? DEFAULT_PROFILE.displayName,
        ftp: profileRow.ftp ?? DEFAULT_PROFILE.ftp,
        defaultDurationMinutes:
          profileRow.default_duration ?? DEFAULT_PROFILE.defaultDurationMinutes,
        units:
          (profileRow.units as ProfileUnits | null) ?? DEFAULT_PROFILE.units,
      }
    : null;

  return {
    profile,
    saved_workouts: workoutsData ?? [],
  };
}

export async function deleteAccountAndData(): Promise<void> {
  const { user } = await getAuthenticatedClient();
  const adminClient = createSupabaseServiceRoleClient();

  const [
    { error: workoutsError },
    { error: profileError },
    { error: deleteError },
  ] = await Promise.all([
    adminClient.from("saved_workouts").delete().eq("user_id", user.id),
    adminClient.from("user_profile").delete().eq("user_id", user.id),
    adminClient.auth.admin.deleteUser(user.id),
  ]);

  if (workoutsError) {
    throw new Error(
      `Failed to delete saved workouts: ${workoutsError.message}`
    );
  }

  if (profileError) {
    throw new Error(`Failed to delete profile: ${profileError.message}`);
  }

  if (deleteError) {
    throw new Error(`Failed to delete Supabase user: ${deleteError.message}`);
  }
}
