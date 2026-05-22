export type EliminationMode = "AUTOMATIC" | "MANUAL_OVERRIDE";

export type EliminationCandidate = {
  contestantId: string;
  name: string;
  averageScore: number;
  scoreCount: number;
  immunity: boolean;
  alreadyEliminated: boolean;
  judgeVoteCount: number;
};

export type EliminationDecision = {
  mode: EliminationMode;
  contestantId: string;
  reason: string;
  averageScore: number;
  tieResolvedByJudgeVote: boolean;
};
