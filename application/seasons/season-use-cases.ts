import { SeasonPolicy } from "@/services/seasons/season-policy";
import { SeasonRepository } from "@/infrastructure/repositories/season-repository";

const repository = new SeasonRepository();

export type SeasonFormInput = {
  name: string;
  slug: string;
  startDate?: Date;
  endDate?: Date;
};

export class SeasonUseCases {
  static async listSeasons() {
    return repository.listSeasons();
  }

  static async getSeasonDetail(id: string) {
    return repository.getSeasonDetail(id);
  }

  static async listAssignableContestants(seasonId: string) {
    return repository.listAssignableContestants(seasonId);
  }

  static async listAssignableJudges() {
    return repository.listAssignableJudges();
  }

  static async createSeason(input: SeasonFormInput) {
    SeasonPolicy.assertCanCreate();
    return repository.createSeason(input);
  }

  static async updateSeason(id: string, input: SeasonFormInput) {
    const season = await repository.getSeasonForPolicy(id);
    if (!season) {
      throw new Error("Season not found.");
    }

    SeasonPolicy.assertCanEdit(season.lifecycleStatus);
    return repository.updateSeason(id, {
      name: input.name,
      slug: input.slug,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
    });
  }

  static async startSeason(id: string) {
    const [season, activeSeasonId] = await Promise.all([repository.getSeasonForPolicy(id), repository.getActiveSeasonId()]);
    if (!season) {
      throw new Error("Season not found.");
    }

    SeasonPolicy.assertCanStart({
      status: season.lifecycleStatus,
      seasonId: season.id,
      hasActiveSeason: Boolean(activeSeasonId),
      activeSeasonId,
    });

    return repository.setStatus(id, "ACTIVE");
  }

  static async finishSeason(id: string) {
    const season = await repository.getSeasonForPolicy(id);
    if (!season) {
      throw new Error("Season not found.");
    }

    SeasonPolicy.assertCanFinish(season.lifecycleStatus);
    return repository.setStatus(id, "FINISHED", new Date());
  }

  static async assignContestant(seasonId: string, contestantId: string) {
    const season = await repository.getSeasonForPolicy(seasonId);
    if (!season) {
      throw new Error("Season not found.");
    }

    SeasonPolicy.assertSeasonIsUnlocked(season.lifecycleStatus);
    return repository.assignContestant(seasonId, contestantId);
  }

  static async assignJudges(seasonId: string, judgeIds: string[], actorId: string) {
    const season = await repository.getSeasonForPolicy(seasonId);
    if (!season) {
      throw new Error("Season not found.");
    }

    SeasonPolicy.assertSeasonIsUnlocked(season.lifecycleStatus);
    return repository.recordSeasonJudgeAssignment(seasonId, judgeIds, actorId);
  }

  static async initializeStructure(seasonId: string, episodeCount: number, challengesPerEpisode: number) {
    const season = await repository.getSeasonForPolicy(seasonId);
    if (!season) {
      throw new Error("Season not found.");
    }

    SeasonPolicy.assertSeasonIsUnlocked(season.lifecycleStatus);
    return repository.initializeStructure(seasonId, episodeCount, challengesPerEpisode);
  }
}
