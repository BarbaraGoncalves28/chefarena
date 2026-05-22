import { deleteJudgeAction } from "@/app/actions/judges";

export function JudgeDeleteForm({ judgeId }: { judgeId: string }) {
  return (
    <form action={deleteJudgeAction}>
      <input type="hidden" name="judgeId" value={judgeId} />
      <button type="submit" className="inline-flex h-10 items-center rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50">
        Delete judge
      </button>
    </form>
  );
}
