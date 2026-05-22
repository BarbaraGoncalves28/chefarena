import { buildDishMetadata } from "@/domain/dishes/dish-metadata";
import { DishHistoryService } from "@/services/dishes/dish-history-service";
import { DishPolicy } from "@/services/dishes/dish-policy";
import { DishRepository } from "@/infrastructure/repositories/dish-repository";

const repository = new DishRepository();

export type DishFormInput = {
  challengeId: string;
  contestantId: string;
  title: string;
  description?: string | null;
  preparationTimeMinutes?: number;
};

export class DishUseCases {
  static async listDishes() {
    const dishes = await repository.listDishes();
    return dishes.map((dish) => ({
      ...dish,
      history: DishHistoryService.summarize(dish.scores, dish.dishIngredients),
    }));
  }

  static async listChallengeOptions() {
    return repository.listChallengeOptions();
  }

  static async getDishDetail(id: string) {
    const dish = await repository.getDishDetail(id);
    if (!dish) return null;

    return {
      ...dish,
      history: DishHistoryService.summarize(dish.scores, dish.dishIngredients),
    };
  }

  static async createDish(input: DishFormInput) {
    const challenge = await repository.getChallengeForDishCreation(input.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found.");
    }

    DishPolicy.assertCanCreate(challenge.lifecycleStatus);
    return repository.createDish({
      ...input,
      metadata: buildDishMetadata({
        preparationTimeMinutes: input.preparationTimeMinutes,
        submissionStatus: "DRAFT",
      }),
    });
  }

  static async updateDish(id: string, input: Omit<DishFormInput, "challengeId" | "contestantId">) {
    const dish = await DishUseCases.getPolicyDish(id);
    DishPolicy.assertCanEdit(dish.challengeStatus, dish.dishMetadata.submissionStatus);

    return repository.updateDish(id, {
      title: input.title,
      description: input.description,
      metadata: buildDishMetadata({
        preparationTimeMinutes: input.preparationTimeMinutes,
        submissionStatus: dish.dishMetadata.submissionStatus,
        submittedAt: dish.dishMetadata.submittedAt,
      }),
    });
  }

  static async addIngredient(input: { dishId: string; name: string; quantity?: number | null; unit?: string | null }) {
    const dish = await DishUseCases.getPolicyDish(input.dishId);
    DishPolicy.assertCanAssignIngredients(dish.challengeStatus, dish.dishMetadata.submissionStatus);
    return repository.addIngredient(input);
  }

  static async submitDish(id: string) {
    const dish = await DishUseCases.getPolicyDish(id);
    DishPolicy.assertCanSubmit(dish.challengeStatus, dish.dishMetadata.submissionStatus);

    return repository.submitDish(
      id,
      buildDishMetadata({
        preparationTimeMinutes: dish.dishMetadata.preparationTimeMinutes,
        submissionStatus: "SUBMITTED",
        submittedAt: new Date().toISOString(),
      }),
    );
  }

  private static async getPolicyDish(id: string) {
    const dish = await repository.getDishForPolicy(id);
    if (!dish) {
      throw new Error("Dish not found.");
    }
    return dish;
  }
}
