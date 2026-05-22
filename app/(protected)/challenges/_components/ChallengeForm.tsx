import { createChallengeAction } from "@/app/actions/challenges";

type ChallengeFormProps = {
  episodes: Array<{
    id: string;
    title: string;
    sequence: number;
    season: { id: string; name: string };
  }>;
};

export function ChallengeForm({ episodes }: ChallengeFormProps) {
  return (
    <form action={createChallengeAction} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Episode
          <select name="episodeId" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
            <option value="">Select episode</option>
            {episodes.map((episode) => (
              <option key={episode.id} value={episode.id}>
                {episode.season.name} - Episode {episode.sequence}: {episode.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Type
          <select name="type" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
            <option value="INDIVIDUAL">Individual</option>
            <option value="TEAM">Team</option>
            <option value="ELIMINATION">Elimination</option>
            <option value="PRESSURE_TEST">Pressure test</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Title
          <input name="title" required minLength={3} className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" placeholder="Mystery pantry challenge" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Weight
          <input name="weight" type="number" min="0.1" max="10" step="0.1" defaultValue="1" className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Description
        <textarea name="description" className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" placeholder="Rules, pantry constraints, time limits, and judging criteria." />
      </label>

      <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
        Create challenge
      </button>
    </form>
  );
}
