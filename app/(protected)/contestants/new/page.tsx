import { PageHeader } from "@/app/components/shell/PageHeader";
import { ContestantForm } from "@/app/(protected)/contestants/_components/ContestantForm";
import { createContestantAction } from "@/app/actions/contestants";
import { requireRole } from "@/infrastructure/auth/session";

export default async function NewContestantPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6">
      <PageHeader title="New contestant" description="Create a reusable chef profile. Season participation is assigned separately so historical performance remains season-based." />
      <ContestantForm action={createContestantAction} submitLabel="Create contestant" />
    </div>
  );
}
