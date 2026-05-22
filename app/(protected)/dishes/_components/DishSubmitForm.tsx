import { submitDishAction } from "@/app/actions/dishes";

export function DishSubmitForm({ dishId, disabled }: { dishId: string; disabled: boolean }) {
  if (disabled) return null;

  return (
    <form action={submitDishAction}>
      <input type="hidden" name="dishId" value={dishId} />
      <button type="submit" className="inline-flex h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500">
        Submit for evaluation
      </button>
    </form>
  );
}
