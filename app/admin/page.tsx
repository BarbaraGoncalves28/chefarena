import { RankingPanel } from "@/app/components/RankingPanel";
import { ScoreForm } from "@/app/components/ScoreForm";

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10 text-zinc-900">
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Competition operations center</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
          This admin dashboard models event-driven workflows, weighted score capture, live ranking refresh, and soft-delete-ready audit tracking.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(420px,_1fr)_minmax(420px,_1fr)]">
        <ScoreForm />
        <RankingPanel seasonId="" />
      </div>
    </main>
  );
}
