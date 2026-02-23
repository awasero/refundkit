import { Header } from '@/components/dashboard/header';
import { StatsCard } from '@/components/dashboard/stats-card';

const QUICK_ACTIONS = [
  'Process Refund',
  'Create API Key',
  'Connect Processor',
  'View Docs',
];

export default function DashboardPage() {
  return (
    <>
      <Header title="Overview" />
      <div className="mx-auto max-w-5xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Refunds"
            value="1,284"
            change="+12% from last month"
            changeType="positive"
          />
          <StatsCard
            title="Pending"
            value="23"
            change="5 new today"
            changeType="neutral"
          />
          <StatsCard
            title="Volume"
            value="$48,290"
            change="+8% from last month"
            changeType="positive"
          />
          <StatsCard
            title="Success Rate"
            value="97.2%"
            change="-0.3% from last month"
            changeType="negative"
          />
        </div>

        <div className="mt-8 rounded-xl border border-white/5 bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">Refund Volume</h2>
          <p className="text-sm text-text-secondary">Last 30 days</p>
          <div className="mt-4 flex h-64 items-center justify-center text-text-muted">
            Chart placeholder — connect Supabase to load real data
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-text-secondary hover:border-accent/30 hover:text-accent"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/5 bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">Recent Refunds</h2>
          <div className="mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left text-sm text-text-secondary">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Processor</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5 hover:bg-surface-hover">
                  <td className="py-3 font-mono text-text-primary">ref_a1b2c3</td>
                  <td className="py-3 text-text-primary">$29.99</td>
                  <td className="py-3">
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">completed</span>
                  </td>
                  <td className="py-3 text-text-secondary">stripe</td>
                  <td className="py-3 text-text-secondary">2 hours ago</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-surface-hover">
                  <td className="py-3 font-mono text-text-primary">ref_d4e5f6</td>
                  <td className="py-3 text-text-primary">$149.00</td>
                  <td className="py-3">
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning">pending</span>
                  </td>
                  <td className="py-3 text-text-secondary">stripe</td>
                  <td className="py-3 text-text-secondary">5 hours ago</td>
                </tr>
                <tr className="hover:bg-surface-hover">
                  <td className="py-3 font-mono text-text-primary">ref_g7h8i9</td>
                  <td className="py-3 text-text-primary">$9.99</td>
                  <td className="py-3">
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">failed</span>
                  </td>
                  <td className="py-3 text-text-secondary">stripe</td>
                  <td className="py-3 text-text-secondary">1 day ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
