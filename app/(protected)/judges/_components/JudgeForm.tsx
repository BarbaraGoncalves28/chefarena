type JudgeFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  judge?: {
    id: string;
    name: string;
    expertise: string | null;
  };
};

export function JudgeForm({ action, submitLabel, judge }: JudgeFormProps) {
  return (
    <form action={action} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      {judge ? <input type="hidden" name="judgeId" value={judge.id} /> : null}

      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Judge name
        <input
          name="name"
          required
          minLength={2}
          defaultValue={judge?.name}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
          placeholder="Chef Helena Duarte"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Specialty
        <input
          name="expertise"
          defaultValue={judge?.expertise ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-950"
          placeholder="Pastry, fine dining, regional cuisine..."
        />
      </label>

      <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
        {submitLabel}
      </button>
    </form>
  );
}
