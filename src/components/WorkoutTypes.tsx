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
    <div className="mt-6 md:mt-8 rounded-2xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
      <div className="flex items-center mb-4">
        <div className="w-5 h-5 bg-[--muted] rounded-full flex items-center justify-center mr-3">
          <span className="text-[--text-primary] text-xs font-bold">i</span>
        </div>
        <h3 className="text-base md:text-lg font-semibold text-[--text-primary] underline decoration-[--accent]/40">
          Workout Types Explained
        </h3>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 text-sm">
        {(Object.keys(WORKOUT_TYPES) as WorkoutType[]).map((key, idx) => {
          const type = WORKOUT_TYPES[key];
          const classes = [
            "px-4 py-4 space-y-1",
            idx > 0 ? "border-t hairline border-white/10 md:border-t-0" : "",
            idx % 2 === 1 ? "md:border-l hairline border-white/10" : "",
            idx % 3 !== 0
              ? "lg:border-l hairline border-white/10"
              : "lg:border-l-0",
          ].join(" ");
          return (
            <div key={key} className={classes}>
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                  <div className="font-medium text-[--text-primary]">
                    {type.label}
                  </div>
                  <span
                    className="w-2 h-2 rounded-full ring-1 ring-inset ring-white/20"
                    style={{ backgroundColor: ZONE_COLORS[key] }}
                  />
                </div>
                <Badge
                  variant="difficulty"
                  className="opacity-90 text-white"
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
