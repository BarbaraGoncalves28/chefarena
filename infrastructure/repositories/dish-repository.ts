import { parseDishMetadata, type DishMetadata } from "@/domain/dishes/dish-metadata";
import { toDomainChallengeStatus } from "@/domain/challenges/challenge-lifecycle";
import { toDomainChallengeType } from "@/domain/challenges/challenge-type";
import { prisma } from "@/lib/prisma";

function mapDish<T extends { metadata: unknown }>(dish: T) {
  return {
    ...dish,
    dishMetadata: parseDishMetadata(dish.metadata),
  };
}

function toJsonMetadata(metadata: DishMetadata) {
  const json: Record<string, string | number> = {
    submissionStatus: metadata.submissionStatus,
  };

  if (typeof metadata.preparationTimeMinutes === "number") {
    json.preparationTimeMinutes = metadata.preparationTimeMinutes;
  }

  if (metadata.submittedAt) {
    json.submittedAt = metadata.submittedAt;
  }

  return json;
}

export class DishRepository {
  async listDishes() {
    const dishes = await prisma.dish.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        title: true,
        description: true,
        metadata: true,
        createdAt: true,
        contestant: { select: { id: true, name: true, status: true } },
        challenge: {
          select: {
            id: true,
            title: true,
            status: true,
            type: true,
            isElimination: true,
            scoringRules: true,
            episode: {
              select: {
                title: true,
                sequence: true,
                season: { select: { id: true, name: true } },
              },
            },
          },
        },
        dishIngredients: { select: { id: true } },
        scores: { where: { deletedAt: null }, select: { id: true, value: true } },
      },
    });

    return dishes.map((dish) => ({
      ...mapDish(dish),
      challenge: {
        ...dish.challenge,
        lifecycleStatus: toDomainChallengeStatus(dish.challenge.status),
        gameplayType: toDomainChallengeType(dish.challenge.type, dish.challenge.isElimination, dish.challenge.scoringRules),
      },
    }));
  }

  async listChallengeOptions() {
    return prisma.challenge.findMany({
      where: {
        deletedAt: null,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        episode: {
          select: {
            title: true,
            sequence: true,
            season: {
              select: {
                id: true,
                name: true,
                seasonContestants: {
                  where: { leftAt: null },
                  select: { contestant: { select: { id: true, name: true, status: true } } },
                },
              },
            },
          },
        },
      },
    });
  }

  async getDishDetail(id: string) {
    const dish = await prisma.dish.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        contestant: { select: { id: true, name: true, status: true } },
        challenge: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            type: true,
            isElimination: true,
            scoringRules: true,
            episode: {
              select: {
                id: true,
                title: true,
                sequence: true,
                season: { select: { id: true, name: true } },
              },
            },
          },
        },
        dishIngredients: {
          select: {
            id: true,
            quantity: true,
            unit: true,
            ingredient: { select: { id: true, name: true, description: true } },
          },
          orderBy: { ingredient: { name: "asc" } },
        },
        scores: {
          where: { deletedAt: null },
          orderBy: { recordedAt: "desc" },
          select: {
            id: true,
            value: true,
            category: true,
            comments: true,
            recordedAt: true,
            judge: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!dish) return null;

    return {
      ...mapDish(dish),
      challenge: {
        ...dish.challenge,
        lifecycleStatus: toDomainChallengeStatus(dish.challenge.status),
        gameplayType: toDomainChallengeType(dish.challenge.type, dish.challenge.isElimination, dish.challenge.scoringRules),
      },
    };
  }

  async getDishForPolicy(id: string) {
    const dish = await prisma.dish.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        metadata: true,
        challenge: { select: { id: true, status: true } },
      },
    });

    return dish
      ? {
          ...dish,
          dishMetadata: parseDishMetadata(dish.metadata),
          challengeStatus: toDomainChallengeStatus(dish.challenge.status),
        }
      : null;
  }

  async getChallengeForDishCreation(challengeId: string) {
    const challenge = await prisma.challenge.findFirst({
      where: { id: challengeId, deletedAt: null },
      select: { id: true, status: true },
    });

    return challenge ? { ...challenge, lifecycleStatus: toDomainChallengeStatus(challenge.status) } : null;
  }

  async createDish(data: {
    challengeId: string;
    contestantId: string;
    title: string;
    description?: string | null;
    metadata: DishMetadata;
  }) {
    const existingDish = await prisma.dish.findFirst({
      where: {
        challengeId: data.challengeId,
        contestantId: data.contestantId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingDish) {
      return prisma.dish.update({
        where: { id: existingDish.id },
        data: {
          title: data.title,
          description: data.description,
          metadata: toJsonMetadata(data.metadata),
        },
      });
    }

    return prisma.dish.create({
      data: {
        challengeId: data.challengeId,
        contestantId: data.contestantId,
        title: data.title,
        description: data.description,
        metadata: toJsonMetadata(data.metadata),
      },
    });
  }

  async updateDish(id: string, data: { title: string; description?: string | null; metadata: DishMetadata }) {
    return prisma.dish.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        metadata: toJsonMetadata(data.metadata),
      },
    });
  }

  async submitDish(id: string, metadata: DishMetadata) {
    return prisma.dish.update({
      where: { id },
      data: { metadata: toJsonMetadata(metadata) },
    });
  }

  async addIngredient(data: {
    dishId: string;
    name: string;
    quantity?: number | null;
    unit?: string | null;
  }) {
    const ingredient = await prisma.ingredient.upsert({
      where: { name: data.name },
      update: {},
      create: { name: data.name },
      select: { id: true },
    });

    return prisma.dishIngredient.upsert({
      where: {
        dishId_ingredientId: {
          dishId: data.dishId,
          ingredientId: ingredient.id,
        },
      },
      update: {
        quantity: data.quantity,
        unit: data.unit,
      },
      create: {
        dishId: data.dishId,
        ingredientId: ingredient.id,
        quantity: data.quantity,
        unit: data.unit,
      },
    });
  }
}
