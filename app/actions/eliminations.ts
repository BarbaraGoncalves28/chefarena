"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EliminationUseCases } from "@/application/eliminations/elimination-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

export async function runAutomaticEliminationAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "JUDGE"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));
  const episodeIdValue = formData.get("episodeId");
  const episodeId = episodeIdValue ? z.string().uuid().parse(episodeIdValue) : undefined;

  await EliminationUseCases.runAutomatic({
    seasonId,
    episodeId,
    actorId: session.user.id,
  });

  revalidatePath("/eliminations");
  revalidatePath(`/seasons/${seasonId}`);
  revalidatePath("/rankings");
}

export async function manualEliminationOverrideAction(formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));
  const contestantId = z.string().uuid().parse(formData.get("contestantId"));
  const reason = z.string().trim().min(8).parse(formData.get("reason"));

  await EliminationUseCases.manualOverride({
    seasonId,
    contestantId,
    reason,
    actorId: session.user.id,
  });

  revalidatePath("/eliminations");
  revalidatePath(`/seasons/${seasonId}`);
  revalidatePath("/rankings");
}

export async function createJudgeTieBreakVoteAction(formData: FormData) {
  await requireRole(["ADMIN", "JUDGE"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));
  const contestantId = z.string().uuid().parse(formData.get("contestantId"));
  const judgeId = z.string().uuid().parse(formData.get("judgeId"));
  const value = z.coerce.number().int().min(1).max(10).parse(formData.get("value"));

  await EliminationUseCases.createJudgeTieBreakVote({
    seasonId,
    contestantId,
    judgeId,
    value,
  });

  revalidatePath("/eliminations");
}
