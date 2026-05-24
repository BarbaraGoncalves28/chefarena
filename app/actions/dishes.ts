"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DishUseCases } from "@/application/dishes/dish-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

const dishSchema = z.object({
  challengeId: z.string().uuid(),
  contestantId: z.string().uuid(),
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
  preparationTimeMinutes: z.coerce.number().int().min(1).max(1440).optional(),
});

const dishUpdateSchema = z.object({
  dishId: z.string().uuid(),
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
  preparationTimeMinutes: z.coerce.number().int().min(1).max(1440).optional(),
});

export async function createDishAction(formData: FormData) {
  await requireRole(["ADMIN", "JUDGE"]);
  const parsed = dishSchema.parse({
    challengeId: formData.get("challengeId"),
    contestantId: formData.get("contestantId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    preparationTimeMinutes: formData.get("preparationTimeMinutes") || undefined,
  });

  const dish = await DishUseCases.createDish({
    ...parsed,
    description: parsed.description ?? null,
  });

  redirect(`/dishes/${dish.id}`);
}

export async function updateDishAction(formData: FormData) {
  await requireRole(["ADMIN", "JUDGE"]);
  const parsed = dishUpdateSchema.parse({
    dishId: formData.get("dishId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    preparationTimeMinutes: formData.get("preparationTimeMinutes") || undefined,
  });

  await DishUseCases.updateDish(parsed.dishId, {
    title: parsed.title,
    description: parsed.description ?? null,
    preparationTimeMinutes: parsed.preparationTimeMinutes,
  });

  revalidatePath("/dishes");
  revalidatePath(`/dishes/${parsed.dishId}`);

  return { success: true };
}

export async function addDishIngredientAction(formData: FormData) {
  await requireRole(["ADMIN", "JUDGE"]);
  const dishId = z.string().uuid().parse(formData.get("dishId"));
  const name = z.string().trim().min(2).parse(formData.get("name"));
  const quantityValue = formData.get("quantity");
  const quantity =
  quantityValue && quantityValue.toString().trim() !== ""
    ? Number(quantityValue)
    : null;
  const unit = z.string().trim().optional().parse(formData.get("unit") || undefined) ?? null;

  await DishUseCases.addIngredient({
    dishId,
    name,
    quantity,
    unit,
  });

  revalidatePath("/dishes");
  revalidatePath(`/dishes/${dishId}`);
  return { success: true };
}

export async function submitDishAction(formData: FormData) {
  await requireRole(["ADMIN", "JUDGE"]);
  const dishId = z.string().uuid().parse(formData.get("dishId"));

  await DishUseCases.submitDish(dishId);

  revalidatePath("/dishes");
  revalidatePath(`/dishes/${dishId}`);

  return { success: true };
}
