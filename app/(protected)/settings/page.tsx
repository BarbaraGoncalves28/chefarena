import { PageHeader } from "@/app/components/shell/PageHeader";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function SettingsPage() {
  const session = await requireAuthenticatedSession();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage account preferences, notification routing, and session visibility." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section id="profile" className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Profile</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="mt-1 font-medium text-zinc-950">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Role</dt>
              <dd className="mt-1 font-medium text-zinc-950">{session.user.role}</dd>
            </div>
          </dl>
        </section>
        <section id="notifications" className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Notifications</h2>
          <div className="mt-5 space-y-3 text-sm text-zinc-600">
            <label className="flex items-center justify-between rounded-md border border-zinc-200 p-4">
              <span>Challenge status changes</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-zinc-950" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-zinc-200 p-4">
              <span>Ranking updates</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-zinc-950" />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
