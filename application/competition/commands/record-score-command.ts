import { z } from "zod";

export const ScoreInputSchema = z.object({
  seasonId: z.string().uuid(),
  challengeId: z.string().uuid(),
  contestantId: z.string().uuid(),
  judgeId: z.string().uuid(),
  dishId: z.string().uuid().optional(),
  value: z.coerce.number().int().min(0).max(100),
  category: z.enum(["TASTE", "PRESENTATION", "TECHNIQUE", "TEAMWORK"]).default("TASTE"),
  comments: z.string().max(800).optional(),
});

export type ScoreSubmission = z.infer<typeof ScoreInputSchema>;
