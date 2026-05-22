"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ContestantUseCases } from "@/application/contestants/contestant-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

const contestantSchema = z.object({
  name: z.string().trim().min(2),
  bio: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "ELIMINATED", "WITHDRAWN"]).optional(),
});

function parseContestantForm(formData: FormData) {
  const parsed = contestantSchema.parse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    status: formData.get("status") || undefined,
  });

  return {
    name: parsed.name,
    bio: parsed.bio ?? null,
    status: parsed.status,
  };
}

export async function createContestantAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const contestant = await ContestantUseCases.createContestant(parseContestantForm(formData));

  revalidatePath("/contestants");
  redirect(`/contestants/${contestant.id}`);
}

export async function updateContestantAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const contestantId = z.string().uuid().parse(formData.get("contestantId"));

  await ContestantUseCases.updateContestant(contestantId, parseContestantForm(formData));

  revalidatePath("/contestants");
  revalidatePath(`/contestants/${contestantId}`);
  redirect(`/contestants/${contestantId}`);
}

export async function assignContestantToSeasonAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const contestantId = z.string().uuid().parse(formData.get("contestantId"));
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));
  const seedValue = formData.get("initialSeed");
  const initialSeed = seedValue ? z.coerce.number().int().min(1).max(999).parse(seedValue) : null;

  await ContestantUseCases.assignToSeason({
    contestantId,
    seasonId,
    initialSeed,
  });

  revalidatePath("/contestants");
  revalidatePath(`/contestants/${contestantId}`);
  revalidatePath(`/seasons/${seasonId}`);
}
