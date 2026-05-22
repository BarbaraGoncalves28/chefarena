import { JudgeBehaviorService } from "@/services/judges/judge-behavior-service";
import { JudgePolicy } from "@/services/judges/judge-policy";
import { JudgeRepository } from "@/infrastructure/repositories/judge-repository";

const repository = new JudgeRepository();

export type JudgeFormInput = {
  name: string;
  expertise?: string | null;
};

export class JudgeUseCases {
  static async listJudges() {
    const judges = await repository.listJudges();
    return judges.map((judge) => ({
      ...judge,
      behavior: JudgeBehaviorService.buildScoreSummary(judge.scores),
    }));
  }

  static async listAssignableSeasons() {
    return repository.listAssignableSeasons();
  }

  static async getJudgeProfile(id: string) {
    const judge = await repository.getJudgeProfile(id);
    if (!judge) return null;

    return {
      ...judge,
      behavior: JudgeBehaviorService.buildScoreSummary(judge.scores),
    };
  }

  static async getJudgeForEdit(id: string) {
    return repository.getJudgeForEdit(id);
  }

  static async createJudge(input: JudgeFormInput) {
    JudgePolicy.assertCanManage();
    return repository.createJudge(input);
  }

  static async updateJudge(id: string, input: JudgeFormInput) {
    JudgePolicy.assertCanManage();
    return repository.updateJudge(id, input);
  }

  static async deleteJudge(id: string) {
    JudgePolicy.assertCanManage();
    return repository.softDeleteJudge(id);
  }

  static async assignToSeason(input: { judgeId: string; seasonId: string; actorId: string }) {
    JudgePolicy.assertCanManage();
    return repository.assignToSeason(input);
  }

  static async assertJudgeCanScoreSeason(judgeId: string, seasonId: string) {
    const isAssigned = await repository.isJudgeAssignedToSeason(judgeId, seasonId);
    JudgePolicy.assertCanScoreAssignedSeason(isAssigned);
  }
}
