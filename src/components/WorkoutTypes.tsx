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
    <div className="mt-8 rounded-2xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
      <div className="flex items-center mb-4">
        <div className="w-5 h-5 bg-[--phase-warmup] rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <h3 className="text-base md:text-lg font-semibold text-[--text-primary]">
          Workout Types Explained
        </h3>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {(Object.keys(WORKOUT_TYPES) as WorkoutType[]).map((key) => {
          const type = WORKOUT_TYPES[key];
          return (
            <div key={key} className="bg-[--muted]/30 rounded-lg p-4 space-y-2">
              <div className="flex flex-col items-start">
                <div className="flex items-center mb-2 gap-2 flex-wrap md:flex-nowrap">
                  <div className="font-medium text-[--text-primary] ">
                    {type.label}
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ZONE_COLORS[key] }}
                  />
                </div>
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: ZONE_COLORS[key],
                    color: "white",
                    borderColor: "transparent",
                  }}
                >
                  <span className="rounded-full text-xs font-medium">
                    {DIFFICULTY[key]}
                  </span>
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
