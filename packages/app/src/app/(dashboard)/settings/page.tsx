import { Header } from '@/components/dashboard/header';

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="mx-auto max-w-4xl p-6">
        <div className="space-y-6">
          <div className="rounded-xl border border-white/5 bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-primary">Organization</h2>
            <p className="mt-1 text-sm text-text-secondary">Manage your organization settings.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-text-secondary">Organization Name</label>
                <input
                  type="text"
                  defaultValue="My Organization"
                  className="mt-1 w-full rounded-lg border border-white/5 bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-primary">Webhooks</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Configure webhook endpoints for real-time refund notifications.
            </p>
            <div className="mt-4">
              <label className="text-xs text-text-secondary">Webhook URL</label>
              <input
                type="url"
                placeholder="https://your-app.com/webhooks/refundkit"
                className="mt-1 w-full rounded-lg border border-white/5 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-danger/20 bg-surface p-6">
            <h2 className="text-lg font-semibold text-danger">Danger Zone</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Irreversible actions for your organization.
            </p>
            <button className="mt-4 rounded-lg border border-danger/30 px-4 py-2 text-sm text-danger hover:bg-danger/10">
              Delete Organization
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
