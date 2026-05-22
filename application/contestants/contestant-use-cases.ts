import { ContestantPerformanceService } from "@/services/contestants/contestant-performance-service";
import { ContestantPolicy } from "@/services/contestants/contestant-policy";
import { ContestantRepository, type ContestantListFilters } from "@/infrastructure/repositories/contestant-repository";

const repository = new ContestantRepository();

export type ContestantFormInput = {
  name: string;
  bio?: string | null;
  status?: "ACTIVE" | "ELIMINATED" | "WITHDRAWN";
};

export class ContestantUseCases {
  static async listContestants(filters: ContestantListFilters) {
    return repository.listContestants(filters);
  }

  static async listSeasonFilters() {
    return repository.listSeasonFilters();
  }

  static async getContestantForEdit(id: string) {
    return repository.getContestantForEdit(id);
  }

  static async getContestantProfile(id: string) {
    const contestant = await repository.getContestantProfile(id);
    if (!contestant) return null;

    const rankingHistory = ContestantPerformanceService.buildSeasonMetrics(contestant.id, contestant.scores, contestant.eliminations);
    const wins = rankingHistory.reduce((total, metric) => total + metric.wins, 0);
    const losses = rankingHistory.reduce((total, metric) => total + metric.losses, 0);
    const averageScore = rankingHistory.length
      ? Number((rankingHistory.reduce((total, metric) => total + metric.averageScore, 0) / rankingHistory.length).toFixed(2))
      : 0;

    return {
      ...contestant,
      rankingHistory,
      performance: {
        wins,
        losses,
        averageScore,
        seasonsCount: contestant.seasons.length,
        dishesCount: contestant.dishes.length,
      },
    };
  }

  static async createContestant(input: ContestantFormInput) {
    ContestantPolicy.assertCanCreate();
    return repository.createContestant({
      name: input.name,
      bio: input.bio,
    });
  }

  static async updateContestant(id: string, input: ContestantFormInput) {
    ContestantPolicy.assertCanEdit();
    return repository.updateContestant(id, {
      name: input.name,
      bio: input.bio,
      status: input.status ?? "ACTIVE",
    });
  }

  static async assignToSeason(input: { contestantId: string; seasonId: string; initialSeed?: number | null }) {
    const season = await repository.getSeasonForAssignment(input.seasonId);
    if (!season) {
      throw new Error("Season not found.");
    }

    ContestantPolicy.assertCanAssignToSeason(season.lifecycleStatus);
    return repository.assignToSeason(input);
  }
}
