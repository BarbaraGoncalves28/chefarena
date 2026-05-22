type RankingSeasonFilterProps = {
  seasons: Array<{ id: string; name: string; status: string }>;
  seasonId: string;
};

export function RankingSeasonFilter({ seasons, seasonId }: RankingSeasonFilterProps) {
  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <label className="grid gap-2 text-sm font-medium text-zinc-700 md:max-w-sm">
        Season
        <select name="seasonId" defaultValue={seasonId} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name} ({season.status})
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
