import { z } from "zod";

export const CulinaryScoreSubmissionSchema = z.object({
  dishId: z.string().uuid(),
  judgeId: z.string().uuid(),
  taste: z.coerce.number().min(0).max(10),
  presentation: z.coerce.number().min(0).max(10),
  creativity: z.coerce.number().min(0).max(10),
  comments: z.string().max(800).optional(),
});

export type CulinaryScoreSubmissionInput = z.infer<typeof CulinaryScoreSubmissionSchema>;
