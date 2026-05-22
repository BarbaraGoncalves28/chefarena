import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { SeasonForm } from "@/app/(protected)/seasons/_components/SeasonForm";
import { updateSeasonAction } from "@/app/actions/seasons";
import { SeasonUseCases } from "@/application/seasons/season-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

export default async function EditSeasonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const season = await SeasonUseCases.getSeasonDetail(id);

  if (!season) notFound();
  if (season.lifecycleStatus === "FINISHED") notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${season.name}`} description="Edit season metadata while the season is still unlocked." />
      <SeasonForm action={updateSeasonAction} submitLabel="Save changes" season={season} />
    </div>
  );
}
