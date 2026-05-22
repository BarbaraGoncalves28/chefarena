import { RankingAggregationService } from "@/services/rankings/ranking-aggregation-service";
import { RankingRepository } from "@/infrastructure/repositories/ranking-repository";

const repository = new RankingRepository();

export class RankingUseCases {
  static async listSeasons() {
    return repository.listSeasons();
  }

  static async resolveSeasonId(seasonId?: string) {
    return seasonId ?? (await repository.findDefaultSeasonId());
  }

  static async getLiveRanking(seasonId: string) {
    const contestants = await repository.getSeasonRankingInput(seasonId);
    return RankingAggregationService.buildSnapshot(seasonId, contestants);
  }

  static async getHistoricalSnapshots(seasonId: string) {
    return repository.listHistoricalSnapshots(seasonId);
  }
}
