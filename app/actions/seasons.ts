"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SeasonUseCases } from "@/application/seasons/season-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

const seasonSchema = z.object({
  name: z.string().trim().min(3),
  slug: z.string().trim().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function optionalDate(value?: string) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000Z`);
}

function parseSeasonForm(formData: FormData) {
  const parsed = seasonSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  return {
    name: parsed.name,
    slug: parsed.slug,
    startDate: optionalDate(parsed.startDate),
    endDate: optionalDate(parsed.endDate),
  };
}

export async function createSeasonAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const season = await SeasonUseCases.createSeason(parseSeasonForm(formData));

  revalidatePath("/seasons");
  redirect(`/seasons/${season.id}`);
}

export async function updateSeasonAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));

  await SeasonUseCases.updateSeason(seasonId, parseSeasonForm(formData));

  revalidatePath("/seasons");
  revalidatePath(`/seasons/${seasonId}`);
  redirect(`/seasons/${seasonId}`);
}

export async function startSeasonAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));

  await SeasonUseCases.startSeason(seasonId);

  revalidatePath("/seasons");
  revalidatePath(`/seasons/${seasonId}`);
}

export async function finishSeasonAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));

  await SeasonUseCases.finishSeason(seasonId);

  revalidatePath("/seasons");
  revalidatePath(`/seasons/${seasonId}`);
}

export async function assignContestantAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));
  const contestantId = z.string().uuid().parse(formData.get("contestantId"));

  await SeasonUseCases.assignContestant(seasonId, contestantId);

  revalidatePath(`/seasons/${seasonId}`);
}

export async function assignJudgesAction(formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));
  const judgeIds = formData.getAll("judgeIds").map((value) => z.string().uuid().parse(value));

  await SeasonUseCases.assignJudges(seasonId, judgeIds, session.user.id);

  revalidatePath(`/seasons/${seasonId}`);
}

export async function initializeSeasonStructureAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));
  const episodeCount = z.coerce.number().int().min(1).max(30).parse(formData.get("episodeCount"));
  const challengesPerEpisode = z.coerce.number().int().min(1).max(6).parse(formData.get("challengesPerEpisode"));

  await SeasonUseCases.initializeStructure(seasonId, episodeCount, challengesPerEpisode);

  revalidatePath(`/seasons/${seasonId}`);
}
