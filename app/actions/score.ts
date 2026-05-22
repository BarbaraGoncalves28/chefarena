"use server";

import { revalidatePath } from "next/cache";
import { CulinaryScoreSubmissionSchema } from "@/application/scoring/scoring-command";
import { ScoringUseCases } from "@/application/scoring/scoring-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

export async function recordScoreAction(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const session = await requireRole(["ADMIN", "JUDGE"]);
  const parsed = CulinaryScoreSubmissionSchema.parse(values);
  await ScoringUseCases.submitScore(parsed, session.user.id);

  revalidatePath("/dishes");
  revalidatePath(`/dishes/${parsed.dishId}`);
  revalidatePath("/rankings");
}

export async function updateScoreAction(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const session = await requireRole(["ADMIN", "JUDGE"]);
  const parsed = CulinaryScoreSubmissionSchema.parse(values);
  await ScoringUseCases.updateScore(parsed, session.user.id);

  revalidatePath("/dishes");
  revalidatePath(`/dishes/${parsed.dishId}`);
  revalidatePath("/rankings");
}
