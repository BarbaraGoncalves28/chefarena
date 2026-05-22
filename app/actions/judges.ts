"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { JudgeUseCases } from "@/application/judges/judge-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

const judgeSchema = z.object({
  name: z.string().trim().min(2),
  expertise: z.string().trim().optional(),
});

function parseJudgeForm(formData: FormData) {
  const parsed = judgeSchema.parse({
    name: formData.get("name"),
    expertise: formData.get("expertise") || undefined,
  });

  return {
    name: parsed.name,
    expertise: parsed.expertise ?? null,
  };
}

export async function createJudgeAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const judge = await JudgeUseCases.createJudge(parseJudgeForm(formData));

  revalidatePath("/judges");
  redirect(`/judges/${judge.id}`);
}

export async function updateJudgeAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const judgeId = z.string().uuid().parse(formData.get("judgeId"));

  await JudgeUseCases.updateJudge(judgeId, parseJudgeForm(formData));

  revalidatePath("/judges");
  revalidatePath(`/judges/${judgeId}`);
  redirect(`/judges/${judgeId}`);
}

export async function deleteJudgeAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const judgeId = z.string().uuid().parse(formData.get("judgeId"));

  await JudgeUseCases.deleteJudge(judgeId);

  revalidatePath("/judges");
  redirect("/judges");
}

export async function assignJudgeToSeasonAction(formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const judgeId = z.string().uuid().parse(formData.get("judgeId"));
  const seasonId = z.string().uuid().parse(formData.get("seasonId"));

  await JudgeUseCases.assignToSeason({
    judgeId,
    seasonId,
    actorId: session.user.id,
  });

  revalidatePath("/judges");
  revalidatePath(`/judges/${judgeId}`);
  revalidatePath(`/seasons/${seasonId}`);
}
