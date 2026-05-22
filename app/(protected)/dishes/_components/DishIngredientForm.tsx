import { addDishIngredientAction } from "@/app/actions/dishes";

export function DishIngredientForm({ dishId, locked }: { dishId: string; locked: boolean }) {
  if (locked) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Ingredients are locked for this dish.</div>;
  }

  return (
    <form action={addDishIngredientAction} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_120px_120px_auto]">
      <input type="hidden" name="dishId" value={dishId} />
      <input name="name" required minLength={2} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Ingredient" />
      <input name="quantity" type="number" min={0} step="0.001" className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Qty" />
      <input name="unit" className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Unit" />
      <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
        Add
      </button>
    </form>
  );
}
