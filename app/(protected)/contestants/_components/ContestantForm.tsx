type ContestantFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  contestant?: {
    id: string;
    name: string;
    bio: string | null;
    status: "ACTIVE" | "ELIMINATED" | "WITHDRAWN";
  };
};

export function ContestantForm({ action, submitLabel, contestant }: ContestantFormProps) {
  return (
    <form action={action} className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      {contestant ? <input type="hidden" name="contestantId" value={contestant.id} /> : null}

      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Chef name
        <input
          name="name"
          required
          minLength={2}
          defaultValue={contestant?.name}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
          placeholder="Ana Silva"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Biography
        <textarea
          name="bio"
          defaultValue={contestant?.bio ?? ""}
          className="min-h-36 rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
          placeholder="Culinary background, signature style, hometown, and competitive story."
        />
      </label>

      {contestant ? (
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Global contestant status
          <select name="status" defaultValue={contestant.status} className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950">
            <option value="ACTIVE">Active</option>
            <option value="ELIMINATED">Eliminated</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </label>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">Season participation and elimination history are managed as season-scoped records.</p>
        <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
