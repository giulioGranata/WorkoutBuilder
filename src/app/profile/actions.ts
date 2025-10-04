"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  fetchProfile,
  signOutEverywhere,
  upsertProfile,
  type ProfileWithUser,
  type UserProfile,
} from "./profile-service";

const displayNameSchema = z
  .string()
  .trim()
  .max(120, "Display name must be 120 characters or fewer");

const nullableNumber = (params: { min?: number; max?: number; field: string }) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .refine((value) => value === null || !Number.isNaN(value), {
      message: `${params.field} must be a valid number`,
    })
    .refine((value) => value === null || params.min === undefined || value >= params.min, {
      message:
        params.min !== undefined
          ? `${params.field} must be greater than or equal to ${params.min}`
          : `${params.field} is invalid`,
    })
    .refine((value) => value === null || params.max === undefined || value <= params.max, {
      message:
        params.max !== undefined
          ? `${params.field} must be less than or equal to ${params.max}`
          : `${params.field} is invalid`,
    });

const profileSchema = z.object({
  displayName: displayNameSchema,
  ftp: nullableNumber({ min: 0, max: 2000, field: "FTP" }),
  defaultDurationMinutes: nullableNumber({ min: 5, max: 600, field: "Default duration" }),
  units: z.enum(["metric", "imperial"], { required_error: "Units are required" }),
});

export interface ProfileFormState {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof ProfileFormValues, string>>;
}

export type ProfileFormValues = z.infer<typeof profileSchema>;

export async function getProfileAction(): Promise<ProfileWithUser> {
  return fetchProfile();
}

export async function signOutAllSessionsAction(): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await signOutEverywhere();
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign out";
    return { success: false, error: message };
  }
}

export async function saveProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName") ?? "",
    ftp: formData.get("ftp") ?? "",
    defaultDurationMinutes: formData.get("defaultDurationMinutes") ?? "",
    units: formData.get("units"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.formErrors.fieldErrors;
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: {
        displayName: fieldErrors.displayName?.[0],
        ftp: fieldErrors.ftp?.[0],
        defaultDurationMinutes: fieldErrors.defaultDurationMinutes?.[0],
        units: fieldErrors.units?.[0],
      },
    };
  }

  const values: UserProfile = {
    displayName: parsed.data.displayName,
    ftp: parsed.data.ftp,
    defaultDurationMinutes: parsed.data.defaultDurationMinutes,
    units: parsed.data.units,
  };

  try {
    await upsertProfile(values);
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save profile";
    return { success: false, error: message };
  }
}
