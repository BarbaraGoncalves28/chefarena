import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { ContestantForm } from "@/app/(protected)/contestants/_components/ContestantForm";
import { updateContestantAction } from "@/app/actions/contestants";
import { ContestantUseCases } from "@/application/contestants/contestant-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

export default async function EditContestantPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const contestant = await ContestantUseCases.getContestantForEdit(id);

  if (!contestant) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${contestant.name}`} description="Edit the chef profile. Competition outcomes remain attached to season-specific records." />
      <ContestantForm action={updateContestantAction} submitLabel="Save changes" contestant={contestant} />
    </div>
  );
}
