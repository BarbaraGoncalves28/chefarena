import type { ReactNode } from "react";

type SeasonFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  season?: {
    id: string;
    name: string;
    slug: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  footer?: ReactNode;
};

function dateValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function SeasonForm({ action, submitLabel, season, footer }: SeasonFormProps) {
  return (
    <form action={action} className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      {season ? <input type="hidden" name="seasonId" value={season.id} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Season name
          <input
            name="name"
            required
            minLength={3}
            defaultValue={season?.name}
            className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
            placeholder="ChefArena Champions 2026"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          URL slug
          <input
            name="slug"
            required
            minLength={3}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            defaultValue={season?.slug}
            className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
            placeholder="champions-2026"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Start date
          <input
            name="startDate"
            type="date"
            defaultValue={dateValue(season?.startDate)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          End date
          <input
            name="endDate"
            type="date"
            defaultValue={dateValue(season?.endDate)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">New seasons start as UPCOMING. Only admins can activate or finish them.</p>
        <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
          {submitLabel}
        </button>
      </div>

      {footer}
    </form>
  );
}
