import { z } from "zod";

export const ScoreInputSchema = z.object({
  seasonId: z.string().uuid(),
  challengeId: z.string().uuid(),
  contestantId: z.string().uuid(),
  judgeId: z.string().uuid(),
  dishId: z.preprocess((value) => (value === "" ? undefined : value), z.string().uuid().optional()),
  value: z.coerce.number().int().min(0).max(100),
  category: z.enum(["TASTE", "PRESENTATION", "CREATIVITY", "TECHNIQUE", "TEAMWORK"]).default("TASTE"),
  comments: z.string().max(800).optional(),
});

export type ScoreSubmission = z.infer<typeof ScoreInputSchema>;
