import { PageHeader } from "@/app/components/shell/PageHeader";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";
import { prisma } from "@/lib/prisma";

async function getDashboardSnapshot() {
  const [activeSeasons, upcomingEpisodes, openChallenges, activeContestants] = await Promise.all([
    prisma.season.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.episode.count({
      where: {
        deletedAt: null,
        airDate: { gte: new Date() },
      },
    }),
    prisma.challenge.count({ where: { status: "OPEN", deletedAt: null } }),
    prisma.contestant.count({ where: { status: "ACTIVE", deletedAt: null } }),
  ]);

  return { activeSeasons, upcomingEpisodes, openChallenges, activeContestants };
}

export default async function DashboardPage() {
  const [session, snapshot] = await Promise.all([requireAuthenticatedSession(), getDashboardSnapshot()]);
  const displayName = session.user.name ?? session.user.email;

  const cards = [
    { label: "Active seasons", value: snapshot.activeSeasons, detail: "Live competition cycles" },
    { label: "Upcoming episodes", value: snapshot.upcomingEpisodes, detail: "Scheduled broadcasts" },
    { label: "Open challenges", value: snapshot.openChallenges, detail: "Ready for scoring" },
    { label: "Active contestants", value: snapshot.activeContestants, detail: "Still in contention" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Your authenticated competition workspace is assembled server-side from the current session, role, and live production data."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <section key={card.label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{card.value}</p>
            <p className="mt-2 text-sm text-zinc-500">{card.detail}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Production pulse</h2>
              <p className="mt-1 text-sm text-zinc-500">A server-rendered overview of the next operational priorities.</p>
            </div>
            <span className="rounded-md bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">{session.user.role}</span>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              "Review open challenge scoring windows",
              "Confirm episode sequencing against active seasons",
              "Monitor ranking movement after confirmed judge scores",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-zinc-200 p-4">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-sm text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
          <h2 className="text-lg font-semibold">Session guardrails</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-zinc-400">Identity</dt>
              <dd className="mt-1 break-all font-medium">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-400">Authorization</dt>
              <dd className="mt-1 font-medium">{session.user.permissions.includes("*") ? "Full platform access" : session.user.permissions.join(", ")}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
