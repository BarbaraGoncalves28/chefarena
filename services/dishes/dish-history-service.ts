export class DishHistoryService {
  static summarize(scores: Array<{ value: number }>, ingredients: Array<unknown>) {
    const averageScore = scores.length ? Number((scores.reduce((total, score) => total + score.value, 0) / scores.length).toFixed(2)) : 0;

    return {
      averageScore,
      scoreCount: scores.length,
      ingredientCount: ingredients.length,
    };
  }
}
