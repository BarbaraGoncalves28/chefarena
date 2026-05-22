import { PageHeader } from "@/app/components/shell/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function EpisodesPage() {
  const episodes = await prisma.episode.findMany({
    where: { deletedAt: null },
    orderBy: [{ airDate: "desc" }, { sequence: "asc" }],
    take: 20,
    select: { id: true, title: true, sequence: true, airDate: true, season: { select: { name: true } }, _count: { select: { challenges: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Episodes" description="Browse production episodes and drill into the challenges attached to each broadcast." />
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        {episodes.map((episode) => (
          <div key={episode.id} className="grid gap-2 border-b border-zinc-100 p-5 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-semibold text-zinc-950">{episode.title}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {episode.season.name} · Episode {episode.sequence} · {episode._count.challenges} challenges
              </p>
            </div>
            <span className="text-sm text-zinc-500">{episode.airDate ? episode.airDate.toLocaleDateString("en-US") : "Unscheduled"}</span>
          </div>
        ))}
        {episodes.length === 0 ? <div className="p-8 text-sm text-zinc-500">No episodes found.</div> : null}
      </div>
    </div>
  );
}
