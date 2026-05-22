import { PageHeader } from "@/app/components/shell/PageHeader";
import { RankingPanel } from "@/app/components/RankingPanel";
import { ScoreForm } from "@/app/components/ScoreForm";
import { requireRole } from "@/infrastructure/auth/session";

export default async function AdminPage() {
  const session = await requireRole(["ADMIN", "JUDGE"]);
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAdmin ? "Admin panel" : "Scoring workspace"}
        description={
          isAdmin
            ? "Manage production operations, scoring controls, rankings, and privileged workflows."
            : "Record dish scores and review challenge outcomes available to judges."
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(360px,_1fr)_minmax(360px,_1fr)]">
        <ScoreForm />
        <RankingPanel seasonId="" />
      </div>
    </div>
  );
}
