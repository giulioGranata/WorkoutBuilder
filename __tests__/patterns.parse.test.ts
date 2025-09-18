import { describe, expect, it } from "vitest";
import {
  FALLBACK_PATTERNS,
  parsePatternPayload,
  type PatternSet,
} from "@/lib/patterns";

describe("parsePatternPayload", () => {
  it("accepts a valid payload", () => {
    const payload = {
      version: "1.2.3",
      patterns: FALLBACK_PATTERNS,
    } satisfies { version: string; patterns: PatternSet };

    expect(parsePatternPayload(payload)).toEqual(payload);
  });

  it("rejects payloads with invalid steps", () => {
    const invalidRecovery = [
      [
        {
          minutes: -5,
          intensity: 50,
          description: "Negative duration",
          phase: "work",
        },
      ],
    ];

    const payload = {
      version: "broken",
      patterns: {
        ...FALLBACK_PATTERNS,
        recovery: invalidRecovery,
      },
    } as unknown;

    expect(() => parsePatternPayload(payload)).toThrow(
      /Invalid pattern payload/,
    );
  });
});
