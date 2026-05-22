"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ChallengeUseCases } from "@/application/challenges/challenge-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

const challengeSchema = z.object({
  episodeId: z.string().uuid(),
  title: z.string().trim().min(3),
  description: z.string().trim().optional(),
  type: z.enum(["INDIVIDUAL", "TEAM", "ELIMINATION", "PRESSURE_TEST"]),
  weight: z.coerce.number().min(0.1).max(10),
});

export async function createChallengeAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const parsed = challengeSchema.parse({
    episodeId: formData.get("episodeId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    weight: formData.get("weight"),
  });

  const challenge = await ChallengeUseCases.createChallenge({
    ...parsed,
    description: parsed.description ?? null,
  });

  revalidatePath("/challenges");
  redirect(`/challenges/${challenge.id}`);
}

export async function startChallengeAction(formData: FormData) {
  await requireRole(["ADMIN", "JUDGE"]);
  const challengeId = z.string().uuid().parse(formData.get("challengeId"));

  await ChallengeUseCases.startChallenge(challengeId);

  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath(`/challenges/${challengeId}/run`);
}

export async function openChallengeScoringAction(formData: FormData) {
  await requireRole(["ADMIN", "JUDGE"]);
  const challengeId = z.string().uuid().parse(formData.get("challengeId"));

  await ChallengeUseCases.openScoring(challengeId);

  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath(`/challenges/${challengeId}/run`);
}

export async function finishChallengeAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "JUDGE"]);
  const challengeId = z.string().uuid().parse(formData.get("challengeId"));

  await ChallengeUseCases.finishChallenge(challengeId, session.user.id);

  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath(`/challenges/${challengeId}/run`);
  revalidatePath("/rankings");
}

export async function assignChallengeContestantAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const challengeId = z.string().uuid().parse(formData.get("challengeId"));
  const contestantId = z.string().uuid().parse(formData.get("contestantId"));

  await ChallengeUseCases.assignContestant(challengeId, contestantId);

  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath(`/challenges/${challengeId}/run`);
}

export async function assignChallengeTeamsAction(formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const challengeId = z.string().uuid().parse(formData.get("challengeId"));
  const teamIds = formData.getAll("teamIds").map((value) => z.string().uuid().parse(value));

  await ChallengeUseCases.assignTeams(challengeId, teamIds, session.user.id);

  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath(`/challenges/${challengeId}/run`);
}
