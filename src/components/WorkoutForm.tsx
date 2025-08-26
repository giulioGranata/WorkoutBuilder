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
import { generateWorkout } from "@/lib/generator";
import { Workout, WORKOUT_TYPES, WorkoutFormData } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Play, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { readFtp, writeFtp } from "@/lib/storage";

const formSchema = z.object({
  ftp: z
    .number()
    .min(50, "FTP must be at least 50 watts")
    .max(500, "FTP must be at most 500 watts"),
  durationMin: z
    .number()
    .min(20, "Duration must be at least 20 minutes")
    .max(180, "Duration must be at most 180 minutes"),
  type: z.enum([
    "recovery",
    "endurance",
    "tempo",
    "threshold",
    "vo2max",
    "anaerobic",
  ]),
});

interface WorkoutFormProps {
  onWorkoutGenerated: (workout: Workout) => void;
}

export function WorkoutForm({ onWorkoutGenerated }: WorkoutFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ftp: 250, durationMin: 60, type: "threshold" },
    mode: "onChange",
  });

  const ftp = form.watch("ftp");

  // Load persisted FTP on mount and sync changes across tabs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = readFtp();
    if (stored !== null && stored >= 50 && stored <= 500) {
      form.setValue("ftp", stored, { shouldDirty: false });
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "wg:ftp") {
        const val = readFtp();
        if (val !== null && val >= 50 && val <= 500) {
          form.setValue("ftp", val, { shouldDirty: false });
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [form]);

  // Persist FTP changes when valid
  useEffect(() => {
    if (ftp >= 50 && ftp <= 500) {
      writeFtp(ftp);
    }
  }, [ftp]);

  const onSubmit = async (data: WorkoutFormData) => {
    setIsGenerating(true);
    try {
      const workout = generateWorkout(data);
      onWorkoutGenerated(workout);
    } catch (error) {
      console.error("Error generating workout:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
      <div className="flex items-center mb-6">
        <Settings className="text-[--accent-solid] mr-3 h-5 w-5" />
        <h2 className="text-xl font-semibold text-[--text-primary]">
          Workout Configuration
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          data-testid="workout-form"
        >
          {/* FTP Input */}
          <FormField
            control={form.control}
            name="ftp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[--text-secondary]">
                  FTP (Functional Threshold Power)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      inputMode="numeric"
                      min={50}
                      max={500}
                      required
                      placeholder="250"
                      className={`w-full rounded-xl px-3 py-2 bg-[--muted] text-[--text-primary] border ${
                        form.formState.errors.ftp
                          ? "border-[--error]"
                          : "border-[--border]"
                      } focus:border-[--accent-solid]`}
                      data-testid="input-ftp"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-[--text-tertiary] text-sm tabular-nums">
                        watts
                      </span>
                    </div>
                  </div>
                </FormControl>
                <p className="text-xs text-[--text-tertiary]">
                  Your maximum sustainable power for 1 hour
                </p>
                <FormMessage className="text-[--error] text-sm mt-1" />{" "}
              </FormItem>
            )}
          />

          {/* Duration Input */}
          <FormField
            control={form.control}
            name="durationMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[--text-secondary]">
                  Duration
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      inputMode="numeric"
                      min={20}
                      max={180}
                      required
                      placeholder="60"
                      className={`w-full rounded-xl px-3 py-2 bg-[--muted] text-[--text-primary] border ${
                        form.formState.errors.durationMin
                          ? "border-[--error]"
                          : "border-[--border]"
                      } focus:border-[--accent-solid]`}
                      data-testid="input-duration"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-[--text-tertiary] text-sm tabular-nums">
                        minutes
                      </span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-[--error] text-sm mt-1" />
              </FormItem>
            )}
          />

          {/* Workout Type Selection */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[--text-secondary]">
                  Workout Type
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  data-testid="select-workout-type"
                >
                  <FormControl>
                    <SelectTrigger
                      className={`w-full rounded-xl px-3 py-2 bg-[--muted] text-[--text-primary] border ${
                        form.formState.errors.type
                          ? "border-[--error]"
                          : "border-[--border]"
                      } focus:border-[--accent-solid]`}
                    >
                      <SelectValue placeholder="Select workout type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[--muted] border border-[--border]">
                    <SelectItem
                      value="recovery"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      {WORKOUT_TYPES["recovery"].label}
                    </SelectItem>
                    <SelectItem
                      value="endurance"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      {WORKOUT_TYPES["endurance"].label}
                    </SelectItem>
                    <SelectItem
                      value="tempo"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      {WORKOUT_TYPES["tempo"].label}
                    </SelectItem>
                    <SelectItem
                      value="threshold"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      {WORKOUT_TYPES["threshold"].label}
                    </SelectItem>
                    <SelectItem
                      value="vo2max"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      {WORKOUT_TYPES["vo2max"].label}
                    </SelectItem>
                    <SelectItem
                      value="anaerobic"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      {WORKOUT_TYPES["anaerobic"].label}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[--error] text-sm mt-1" />{" "}
              </FormItem>
            )}
          />

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={isGenerating || !form.formState.isValid}
            className="w-full !mt-10 inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--accent-solid] text-[--text-primary] hover:bg-[--accent-solidHover]"
            data-testid="button-generate"
          >
            <Play className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Workout"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
