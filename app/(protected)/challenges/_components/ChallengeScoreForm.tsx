import { recordScoreAction } from "@/app/actions/score";

type ChallengeScoreFormProps = {
  disabled: boolean;
  dishes: Array<{ id: string; title: string; contestant: { id: string; name: string } }>;
  judges: Array<{ id: string; name: string }>;
};

export function ChallengeScoreForm({ disabled, dishes, judges }: ChallengeScoreFormProps) {
  if (disabled) {
    return <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500 shadow-sm">Scoring opens only after the challenge enters the SCORING phase.</div>;
  }

  return (
    <form action={recordScoreAction} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Record score</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <select name="judgeId" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
          <option value="">Judge</option>
          {judges.map((judge) => (
            <option key={judge.id} value={judge.id}>
              {judge.name}
            </option>
          ))}
        </select>
        <select name="dishId" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
          <option value="">Dish</option>
          {dishes.map((dish) => (
            <option key={dish.id} value={dish.id}>
              {dish.title} - {dish.contestant.name}
            </option>
          ))}
        </select>
        <input name="taste" type="number" min={0} max={10} step="0.1" defaultValue={8} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Taste 0-10" />
        <input name="presentation" type="number" min={0} max={10} step="0.1" defaultValue={8} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Presentation 0-10" />
        <input name="creativity" type="number" min={0} max={10} step="0.1" defaultValue={8} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Creativity 0-10" />
      </div>

      <textarea name="comments" className="min-h-20 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950" placeholder="Scoring notes" />

      <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
        Submit final score
      </button>
    </form>
  );
}
