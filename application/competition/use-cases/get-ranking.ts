import { CompetitionRepository } from "@/infrastructure/repositories/competition-repository";
import { RankingService } from "@/services/competition/ranking-service";

const repository = new CompetitionRepository();

export async function getSeasonRanking(seasonId: string) {
  const contestants = await repository.listSeasonRanking(seasonId);
  const ranking = RankingService.buildSeasonRanking(contestants);
  return { ...ranking, seasonId };
}
