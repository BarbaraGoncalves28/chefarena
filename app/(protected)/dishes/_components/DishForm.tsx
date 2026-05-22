import { createDishAction, updateDishAction } from "@/app/actions/dishes";

type ChallengeOption = {
  id: string;
  title: string;
  status: string;
  episode: {
    title: string;
    sequence: number;
    season: {
      name: string;
      seasonContestants: Array<{ contestant: { id: string; name: string; status: string } }>;
    };
  };
};

type DishFormProps = {
  challenges?: ChallengeOption[];
  dish?: {
    id: string;
    title: string;
    description: string | null;
    dishMetadata: { preparationTimeMinutes?: number };
  };
};

export function DishForm({ challenges = [], dish }: DishFormProps) {
  const action = dish ? updateDishAction : createDishAction;

  return (
    <form action={action} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      {dish ? <input type="hidden" name="dishId" value={dish.id} /> : null}

      {!dish ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            Challenge
            <select name="challengeId" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
              <option value="">Select challenge</option>
              {challenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.episode.season.name} - Episode {challenge.episode.sequence}: {challenge.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            Contestant
            <select name="contestantId" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
              <option value="">Select contestant</option>
              {challenges.flatMap((challenge) =>
                challenge.episode.season.seasonContestants.map(({ contestant }) => (
                  <option key={`${challenge.id}-${contestant.id}`} value={contestant.id}>
                    {contestant.name} ({challenge.episode.season.name})
                  </option>
                )),
              )}
            </select>
          </label>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Dish name
          <input name="title" required minLength={2} defaultValue={dish?.title} className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" placeholder="Smoked tucupi risotto" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Prep time
          <input name="preparationTimeMinutes" type="number" min={1} max={1440} defaultValue={dish?.dishMetadata.preparationTimeMinutes} className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" placeholder="Minutes" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Description
        <textarea name="description" defaultValue={dish?.description ?? ""} className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" placeholder="Plate concept, technique, and tasting notes." />
      </label>

      <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
        {dish ? "Save dish" : "Create dish"}
      </button>
    </form>
  );
}
