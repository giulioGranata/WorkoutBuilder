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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  difficulty: z.enum(["easy", "standard", "hard"]).default("standard"),
});

interface WorkoutFormProps {
  onWorkoutGenerated: (workout: Workout) => void;
}

export function WorkoutForm({ onWorkoutGenerated }: WorkoutFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ftp: 250,
      durationMin: 60,
      type: "threshold",
      difficulty: "standard",
    },
  });

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
    <div className="bg-gray-850 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <Settings className="text-emerald-500 mr-3 h-5 w-5" />
        <h2 className="text-xl font-semibold text-white">
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
                <FormLabel className="text-sm font-medium text-gray-300">
                  FTP (Functional Threshold Power)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="250"
                      className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 pr-16"
                      data-testid="input-ftp"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">watts</span>
                    </div>
                  </div>
                </FormControl>
                <p className="text-xs text-gray-500">
                  Your maximum sustainable power for 1 hour
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration Input */}
          <FormField
            control={form.control}
            name="durationMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-300">
                  Duration
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="60"
                      className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 pr-20"
                      data-testid="input-duration"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">minutes</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Workout Type Selection */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-300">
                  Workout Type
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  data-testid="select-workout-type"
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-gray-700 border border-gray-600 text-white">
                      <SelectValue placeholder="Select workout type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700 border border-gray-600">
                    <SelectItem
                      value="recovery"
                      className="text-white hover:bg-gray-600"
                    >
                      {WORKOUT_TYPES["recovery"].label}
                    </SelectItem>
                    <SelectItem
                      value="endurance"
                      className="text-white hover:bg-gray-600"
                    >
                      {WORKOUT_TYPES["endurance"].label}
                    </SelectItem>
                    <SelectItem
                      value="tempo"
                      className="text-white hover:bg-gray-600"
                    >
                      {WORKOUT_TYPES["tempo"].label}
                    </SelectItem>
                    <SelectItem
                      value="threshold"
                      className="text-white hover:bg-gray-600"
                    >
                      {WORKOUT_TYPES["threshold"].label}
                    </SelectItem>
                    <SelectItem
                      value="vo2max"
                      className="text-white hover:bg-gray-600"
                    >
                      {WORKOUT_TYPES["vo2max"].label}
                    </SelectItem>
                    <SelectItem
                      value="anaerobic"
                      className="text-white hover:bg-gray-600"
                    >
                      {WORKOUT_TYPES["anaerobic"].label}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty Selection */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-300 mb-3">
                  Difficulty Level
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-3 gap-3"
                    data-testid="radio-difficulty"
                  >
                    <div className="relative">
                      <RadioGroupItem
                        value="easy"
                        id="easy"
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="easy"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-center cursor-pointer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 peer-checked:text-white transition-colors block"
                      >
                        <div className="text-sm font-medium">Easy</div>
                        <div className="text-xs text-gray-400 peer-checked:text-emerald-100">
                          -5% FTP
                        </div>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem
                        value="standard"
                        id="standard"
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="standard"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-center cursor-pointer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 peer-checked:text-white transition-colors block"
                      >
                        <div className="text-sm font-medium">Standard</div>
                        <div className="text-xs text-gray-400 peer-checked:text-emerald-100">
                          Base FTP
                        </div>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem
                        value="hard"
                        id="hard"
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="hard"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-center cursor-pointer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 peer-checked:text-white transition-colors block"
                      >
                        <div className="text-sm font-medium">Hard</div>
                        <div className="text-xs text-gray-400 peer-checked:text-emerald-100">
                          +5% FTP
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
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
