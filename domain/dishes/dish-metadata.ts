export type DishSubmissionStatus = "DRAFT" | "SUBMITTED";

export type DishMetadata = {
  preparationTimeMinutes?: number;
  submissionStatus: DishSubmissionStatus;
  submittedAt?: string;
};

export function parseDishMetadata(metadata: unknown): DishMetadata {
  if (!metadata || typeof metadata !== "object") {
    return { submissionStatus: "DRAFT" };
  }

  const record = metadata as Record<string, unknown>;
  const submissionStatus = record.submissionStatus === "SUBMITTED" ? "SUBMITTED" : "DRAFT";
  const preparationTimeMinutes = typeof record.preparationTimeMinutes === "number" ? record.preparationTimeMinutes : undefined;
  const submittedAt = typeof record.submittedAt === "string" ? record.submittedAt : undefined;

  return {
    preparationTimeMinutes,
    submissionStatus,
    submittedAt,
  };
}

export function buildDishMetadata(input: {
  preparationTimeMinutes?: number;
  submissionStatus?: DishSubmissionStatus;
  submittedAt?: string;
}): DishMetadata {
  return {
    preparationTimeMinutes: input.preparationTimeMinutes,
    submissionStatus: input.submissionStatus ?? "DRAFT",
    submittedAt: input.submittedAt,
  };
}

export function getDishStatusTone(status: DishSubmissionStatus) {
  const tones: Record<DishSubmissionStatus, string> = {
    DRAFT: "bg-zinc-100 text-zinc-700",
    SUBMITTED: "bg-emerald-50 text-emerald-700",
  };

  return tones[status];
}
