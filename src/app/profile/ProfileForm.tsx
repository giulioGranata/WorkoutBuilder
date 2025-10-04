"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import {
  saveProfileAction,
  type ProfileFormState,
  type ProfileFormValues,
} from "./actions";

const INITIAL_STATE: ProfileFormState = { success: false };

interface ProfileFormProps {
  initialValues: ProfileFormValues;
  email: string;
}

export default function ProfileForm({ initialValues, email }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(saveProfileAction, INITIAL_STATE);
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  useEffect(() => {
    form.clearErrors();

    if (state.fieldErrors) {
      for (const [key, message] of Object.entries(state.fieldErrors)) {
        if (message) {
          form.setError(key as keyof ProfileFormValues, { message });
        }
      }
    }
  }, [form, state.fieldErrors]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Profile saved",
        description: "Your preferences were updated successfully.",
      });
    } else if (state.error && !state.fieldErrors) {
      toast({
        title: "Failed to save profile",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state.success, state.error, state.fieldErrors, toast]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    formData.set("displayName", values.displayName);
    formData.set("ftp", values.ftp !== null && values.ftp !== undefined ? String(values.ftp) : "");
    formData.set(
      "defaultDurationMinutes",
      values.defaultDurationMinutes !== null && values.defaultDurationMinutes !== undefined
        ? String(values.defaultDurationMinutes)
        : "",
    );
    formData.set("units", values.units);

    formAction(formData);
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-[--text-tertiary]">Email</p>
            <p className="truncate text-sm text-[--text-secondary]" title={email}>
              {email}
            </p>
          </div>
        </div>
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Your name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ftp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FTP</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    type="number"
                    placeholder="250"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                    min={0}
                    max={2000}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultDurationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    type="number"
                    placeholder="60"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                    min={5}
                    max={600}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Units</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="metric">Metric (km, watts)</SelectItem>
                  <SelectItem value="imperial">Imperial (mi, watts)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {state.error && state.fieldErrors && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
