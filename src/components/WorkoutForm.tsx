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
import { usePatternLibrary } from "@/hooks/usePatternLibrary";
import { generateWorkout } from "@/lib/generator";
import { readFtp, writeFtp } from "@/lib/storage";
import {
  DurationRangeValue,
  Workout,
  WORKOUT_TYPES,
  WorkoutFormData,
} from "@/lib/types";
import { getCurrentUrl, getParamInt, setParam } from "@/lib/url";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Play, Settings, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  ftp: z
    .number()
    .min(50, "FTP must be at least 50 watts")
    .max(500, "FTP must be at most 500 watts"),
  durationRange: z.enum(["30-45", "45-60", "60-75", "75-90", "90-plus"]),
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
  onWorkoutGenerated: (workout: Workout | null) => void;
  hasWorkout: boolean;
}

export function WorkoutForm({
  onWorkoutGenerated,
  hasWorkout,
}: WorkoutFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | undefined>();
  const { patterns } = usePatternLibrary();

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ftp: 250, durationRange: "60-75", type: "threshold" },
    mode: "onChange",
  });

  const ftp = form.watch("ftp");
  const typeWatch = form.watch("type");

  // Load persisted/URL params on mount and sync FTP changes across tabs
  useEffect(() => {
    const url = getCurrentUrl();
    if (!url) return;

    const urlFtp = getParamInt(url, "ftp");
    const urlDurRange = url.searchParams.get(
      "durRange"
    ) as DurationRangeValue | null;
    const urlType = url.searchParams.get("type");

    if (urlFtp !== null && urlFtp >= 50 && urlFtp <= 500) {
      form.setValue("ftp", urlFtp, { shouldDirty: false });
    } else {
      const stored = readFtp();
      if (stored !== null && stored >= 50 && stored <= 500) {
        form.setValue("ftp", stored, { shouldDirty: false });
      }
    }

    const allowed: DurationRangeValue[] = [
      "30-45",
      "45-60",
      "60-75",
      "75-90",
      "90-plus",
    ];
    if (urlDurRange && (allowed as string[]).includes(urlDurRange)) {
      form.setValue("durationRange", urlDurRange, { shouldDirty: false });
    }

    if (urlType && urlType in WORKOUT_TYPES) {
      form.setValue("type", urlType as keyof typeof WORKOUT_TYPES, {
        shouldDirty: false,
      });
    }

    // Auto-generate only if ALL three query params are present and valid
    const validFtp = urlFtp !== null && urlFtp >= 50 && urlFtp <= 500;
    const validDur = !!(
      urlDurRange && (allowed as string[]).includes(urlDurRange)
    );
    const validType = !!(urlType && urlType in WORKOUT_TYPES);
    const hasAllQuery = validFtp && validDur && validType;
    if (hasAllQuery) {
      const payload: WorkoutFormData = {
        ftp: urlFtp!,
        durationRange: urlDurRange as DurationRangeValue,
        type: urlType as keyof typeof WORKOUT_TYPES,
      };

      // Defer to ensure form state has applied updates
      setTimeout(() => {
        onSubmit(payload);
      }, 0);
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
      const workout = generateWorkout(data, lastSignature, patterns);
      const url = getCurrentUrl();
      if (url) {
        setParam(url, "ftp", data.ftp);
        setParam(url, "durRange", data.durationRange);
        setParam(url, "type", data.type);
      }
      onWorkoutGenerated(workout);
      setLastSignature(workout?.signature);
      form.reset(data);
    } catch (error) {
      console.error("Error generating workout:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    setLastSignature(undefined);
  }, [typeWatch]);

  return (
    <div className="rounded-3xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
      <div className="flex items-center mb-6">
        <Settings className="text-[--accent] opacity-90 mr-3 h-5 w-5" />
        <h2 className="text-lg font-semibold text-[--text-primary]">
          Workout Configuration
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          data-testid="workout-form"
        >
          {/* FTP Input */}
          <FormField
            control={form.control}
            name="ftp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[--text-secondary]">
                  <div className="flex flex-row items-center gap-2">
                    <Zap className="h-4 w-4 text-[--accent] opacity-90" />
                    FTP (Functional Threshold Power)
                  </div>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      inputMode="numeric"
                      min={50}
                      max={500}
                      required
                      placeholder="250"
                      className={`w-full rounded-lg px-3 py-2 bg-[--muted] text-[--text-primary] border ${
                        form.formState.errors.ftp
                          ? "border-[--error]"
                          : "border-[--border]"
                      } focus:border-[--accent]`}
                      data-testid="input-ftp"
                      {...field}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                <FormMessage className="text-[--error] text-sm mt-1" />{" "}
              </FormItem>
            )}
          />

          {/* Duration Range Select */}
          <FormField
            control={form.control}
            name="durationRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[--text-secondary]">
                  <div className="flex flex-row items-center gap-2">
                    <Clock className="h-4 w-4 text-[--accent] opacity-90" />
                    Duration
                  </div>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  data-testid="select-duration-range"
                >
                  <FormControl>
                    <SelectTrigger
                      className={`w-full rounded-lg px-3 py-2 bg-[--muted] text-[--text-primary] border ${
                        form.formState.errors.durationRange
                          ? "border-[--error]"
                          : "border-[--border]"
                      } focus:border-[--accent]`}
                    >
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[--muted] border border-[--border]">
                    <SelectItem
                      value="30-45"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      30-45 minutes
                    </SelectItem>
                    <SelectItem
                      value="45-60"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      45-60 minutes
                    </SelectItem>
                    <SelectItem
                      value="60-75"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      60-75 minutes
                    </SelectItem>
                    <SelectItem
                      value="75-90"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      75-90 minutes
                    </SelectItem>
                    <SelectItem
                      value="90-plus"
                      className="text-[--text-primary] hover:bg-[--border]"
                    >
                      90+ minutes
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                  <div className="flex flex-row items-center gap-2">
                    <Target className="h-4 w-4 text-[--accent] opacity-90" />
                    Workout Type
                  </div>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  data-testid="select-workout-type"
                >
                  <FormControl>
                    <SelectTrigger
                      className={`w-full rounded-lg px-3 py-2 bg-[--muted] text-[--text-primary] border ${
                        form.formState.errors.type
                          ? "border-[--error]"
                          : "border-[--border]"
                      } focus:border-[--accent]`}
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
            disabled={
              isGenerating ||
              !form.formState.isValid ||
              (hasWorkout && !form.formState.isDirty)
            }
            className="w-full !mt-14 inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-0 bg-[--accent] text-[--accent-foreground] hover:bg-[--accent-hover] active:bg-[--accent-pressed]"
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
