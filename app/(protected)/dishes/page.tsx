import Link from "next/link";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { DishForm } from "@/app/(protected)/dishes/_components/DishForm";
import { DishUseCases } from "@/application/dishes/dish-use-cases";
import { getChallengeStatusTone } from "@/domain/challenges/challenge-lifecycle";
import { getDishStatusTone } from "@/domain/dishes/dish-metadata";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function DishesPage() {
  const [session, dishes, challenges] = await Promise.all([requireAuthenticatedSession(), DishUseCases.listDishes(), DishUseCases.listChallengeOptions()]);
  const canManage = session.user.role === "ADMIN" || session.user.role === "JUDGE";

  return (
    <div className="space-y-6">
      <PageHeader title="Dishes" description="Dishes are contestant submissions inside challenge context, with ingredients, preparation metadata, and immutable scoring history." />

      {canManage ? (
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Create dish</h2>
            <p className="mt-1 text-sm text-zinc-500">Dish creation is available only before the challenge enters scoring.</p>
          </div>
          <DishForm challenges={challenges} />
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {dishes.map((dish) => (
          <Link key={dish.id} href={`/dishes/${dish.id}`} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zinc-950">{dish.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {dish.contestant.name} · {dish.challenge.episode.season.name} · {dish.challenge.title}
                </p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${getDishStatusTone(dish.dishMetadata.submissionStatus)}`}>{dish.dishMetadata.submissionStatus}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className={`rounded-md px-2 py-1 ${getChallengeStatusTone(dish.challenge.lifecycleStatus)}`}>{dish.challenge.lifecycleStatus}</span>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">{dish.history.ingredientCount} ingredients</span>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">{dish.history.scoreCount} scores</span>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">Avg {dish.history.averageScore}</span>
            </div>
          </Link>
        ))}
        {dishes.length === 0 ? <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">No dishes recorded yet.</div> : null}
      </div>
    </div>
  );
}
