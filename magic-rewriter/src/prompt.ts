export function buildRewritePrompt(input: string, tone: string) {
  return {
    system: [
      "You are a rewriting assistant.",
      "Preserve meaning.",
      "Do not add facts or URLs not present in the input.",
      "Keep the same language as the input.",
      `Adjust the tone to: ${tone}.`,
      "Output plain text only."
    ].join(" "),
    user: input
  };
}
