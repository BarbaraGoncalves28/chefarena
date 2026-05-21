"use server";

import { recordScore } from "@/application/competition/use-cases/record-score";
import { ScoreInputSchema } from "@/application/competition/commands/record-score-command";

export async function recordScoreAction(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = ScoreInputSchema.parse(values);
  await recordScore(parsed, "server-action");
}
