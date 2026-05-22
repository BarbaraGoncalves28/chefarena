import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { DishForm } from "@/app/(protected)/dishes/_components/DishForm";
import { DishIngredientForm } from "@/app/(protected)/dishes/_components/DishIngredientForm";
import { DishSubmitForm } from "@/app/(protected)/dishes/_components/DishSubmitForm";
import { DishUseCases } from "@/application/dishes/dish-use-cases";
import { getChallengeStatusTone } from "@/domain/challenges/challenge-lifecycle";
import { getDishStatusTone } from "@/domain/dishes/dish-metadata";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function DishDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, dish] = await Promise.all([requireAuthenticatedSession(), DishUseCases.getDishDetail(id)]);

  if (!dish) notFound();

  const canManage = session.user.role === "ADMIN" || session.user.role === "JUDGE";
  const locked = dish.challenge.lifecycleStatus === "SCORING" || dish.challenge.lifecycleStatus === "FINISHED" || dish.dishMetadata.submissionStatus === "SUBMITTED";
  const canSubmit = canManage && !locked && dish.challenge.lifecycleStatus === "ACTIVE";

  return (
    <div className="space-y-8">
      <PageHeader
        title={dish.title}
        description={dish.description ?? "No dish description provided."}
        actions={<DishSubmitForm dishId={dish.id} disabled={!canSubmit} />}
      />

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Status", dish.dishMetadata.submissionStatus],
          ["Challenge", dish.challenge.lifecycleStatus],
          ["Ingredients", dish.history.ingredientCount],
          ["Scores", dish.history.scoreCount],
          ["Avg score", dish.history.averageScore],
        ].map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            {label === "Status" ? (
              <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getDishStatusTone(dish.dishMetadata.submissionStatus)}`}>{value}</span>
            ) : label === "Challenge" ? (
              <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getChallengeStatusTone(dish.challenge.lifecycleStatus)}`}>{value}</span>
            ) : (
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Context</h2>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Contestant owner</dt>
            <dd className="mt-1 font-medium text-zinc-950">{dish.contestant.name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Challenge</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              <Link href={`/challenges/${dish.challenge.id}`} className="hover:text-amber-700">
                {dish.challenge.episode.season.name} · Episode {dish.challenge.episode.sequence}: {dish.challenge.title}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Preparation time</dt>
            <dd className="mt-1 font-medium text-zinc-950">{dish.dishMetadata.preparationTimeMinutes ? `${dish.dishMetadata.preparationTimeMinutes} minutes` : "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Submitted at</dt>
            <dd className="mt-1 font-medium text-zinc-950">{dish.dishMetadata.submittedAt ? new Date(dish.dishMetadata.submittedAt).toLocaleString("en-US") : "Not submitted"}</dd>
          </div>
        </dl>
      </section>

      {canManage ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-950">Edit dish</h2>
          {locked ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">This dish is locked for evaluation or scoring.</div> : <DishForm dish={dish} />}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-950">Ingredients</h2>
        {canManage ? <DishIngredientForm dishId={dish.id} locked={locked} /> : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dish.dishIngredients.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="font-medium text-zinc-950">{entry.ingredient.name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {entry.quantity ? Number(entry.quantity) : "As needed"} {entry.unit ?? ""}
              </p>
            </div>
          ))}
          {dish.dishIngredients.length === 0 ? <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">No ingredients assigned.</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Evaluation history</h2>
        <div className="mt-5 divide-y divide-zinc-100">
          {dish.scores.map((score) => (
            <div key={score.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950">
                  {score.value} points · {score.category}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {score.judge.name}
                  {score.comments ? ` · ${score.comments}` : ""}
                </p>
              </div>
              <span className="text-sm text-zinc-500">{score.recordedAt.toLocaleDateString("en-US")}</span>
            </div>
          ))}
          {dish.scores.length === 0 ? <div className="py-4 text-sm text-zinc-500">No scores recorded. Once submitted, score records are append-only.</div> : null}
        </div>
      </section>
    </div>
  );
}
