import { WORKOUT_TYPES, WorkoutType } from "@/lib/types";
import { Badge } from "./ui/badge";

const DIFFICULTY: Record<WorkoutType, string> = {
  recovery: "Very Easy",
  endurance: "Easy",
  tempo: "Moderate",
  threshold: "Hard",
  vo2max: "Very Hard",
  anaerobic: "Maximal",
};

const ZONE_COLORS: Record<WorkoutType, string> = {
  recovery: "var(--z1)",
  endurance: "var(--z2)",
  tempo: "var(--z3)",
  threshold: "var(--z4)",
  vo2max: "var(--z5)",
  anaerobic: "var(--z6)",
};

export default function WorkoutTypes() {
  return (
    <div className="mt-6 rounded-2xl border border-[--border] bg-[color:var(--card)] p-6 text-[--text-secondary] md:mt-8">
      <div className="mb-4 flex items-center">
        <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-xs font-semibold text-[--text-primary]">
          i
        </div>
        <h3 className="text-base font-semibold text-[--text-primary] underline decoration-sky-500/40 md:text-lg">
          Workout Types Explained
        </h3>
      </div>
      <div className="grid text-sm md:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(WORKOUT_TYPES) as WorkoutType[]).map((key, idx) => {
          const type = WORKOUT_TYPES[key];
          const classes = [
            "space-y-1 px-4 py-4",
            idx > 0 ? "border-t border-subtle md:border-t-0" : "",
            idx % 2 === 1 ? "md:border-l border-subtle" : "",
            idx % 3 !== 0 ? "lg:border-l border-subtle" : "lg:border-l-0",
          ].join(" ");
          return (
            <div key={key} className={classes}>
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                  <div className="font-semibold text-[--text-primary]">
                    {type.label}
                  </div>
                  <span
                    className="w-2 h-2 rounded-full ring-1 ring-inset ring-white/20"
                    style={{ backgroundColor: ZONE_COLORS[key] }}
                  />
                </div>
                <Badge
                  variant="difficulty"
                  className="text-white opacity-90"
                  style={{ backgroundColor: ZONE_COLORS[key] }}
                >
                  {DIFFICULTY[key]}
                </Badge>
              </div>
              <div className="text-[--text-secondary]">{type.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
