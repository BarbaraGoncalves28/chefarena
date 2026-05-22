import { Search } from "lucide-react";

type ContestantFiltersProps = {
  seasons: Array<{ id: string; name: string; lifecycleStatus: string }>;
  search?: string;
  seasonId?: string;
};

export function ContestantFilters({ seasons, search, seasonId }: ContestantFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_260px_auto]">
      <label className="flex h-10 items-center gap-2 rounded-md border border-zinc-300 px-3 text-sm text-zinc-500">
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Search contestants</span>
        <input name="q" defaultValue={search} className="w-full bg-transparent text-zinc-950 outline-none placeholder:text-zinc-400" placeholder="Search by chef name" />
      </label>

      <label className="sr-only" htmlFor="season-filter">
        Filter by season
      </label>
      <select id="season-filter" name="seasonId" defaultValue={seasonId ?? ""} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
        <option value="">All seasons</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name} ({season.lifecycleStatus})
          </option>
        ))}
      </select>

      <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
        Apply
      </button>
    </form>
  );
}
