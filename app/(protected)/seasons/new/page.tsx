import { PageHeader } from "@/app/components/shell/PageHeader";
import { SeasonForm } from "@/app/(protected)/seasons/_components/SeasonForm";
import { createSeasonAction } from "@/app/actions/seasons";
import { requireRole } from "@/infrastructure/auth/session";

export default async function NewSeasonPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6">
      <PageHeader title="New season" description="Create an upcoming competition edition. Activation is handled separately so the one-active-season invariant remains explicit." />
      <SeasonForm action={createSeasonAction} submitLabel="Create season" />
    </div>
  );
}
