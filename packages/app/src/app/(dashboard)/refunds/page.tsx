import { Header } from '@/components/dashboard/header';

const STATUSES = ['all', 'pending', 'processing', 'completed', 'failed', 'cancelled'] as const;

const MOCK_REFUNDS = [
  { id: 'ref_a1b2c3d4', txn: 'txn_stripe_001', amount: 2999, currency: 'usd', status: 'completed', processor: 'stripe', reason: 'product_not_received', date: '2024-01-15T10:30:00Z', initiatedBy: 'api' },
  { id: 'ref_e5f6g7h8', txn: 'txn_stripe_002', amount: 14900, currency: 'usd', status: 'pending', processor: 'stripe', reason: 'product_defective', date: '2024-01-15T08:15:00Z', initiatedBy: 'dashboard' },
  { id: 'ref_i9j0k1l2', txn: 'txn_stripe_003', amount: 999, currency: 'usd', status: 'failed', processor: 'stripe', reason: 'duplicate_charge', date: '2024-01-14T22:00:00Z', initiatedBy: 'mcp' },
  { id: 'ref_m3n4o5p6', txn: 'txn_stripe_004', amount: 4999, currency: 'usd', status: 'processing', processor: 'stripe', reason: 'wrong_product', date: '2024-01-14T18:45:00Z', initiatedBy: 'api' },
  { id: 'ref_q7r8s9t0', txn: 'txn_stripe_005', amount: 7500, currency: 'usd', status: 'cancelled', processor: 'stripe', reason: 'other', date: '2024-01-14T14:20:00Z', initiatedBy: 'dashboard' },
];

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    processing: 'bg-accent/10 text-accent',
    failed: 'bg-danger/10 text-danger',
    cancelled: 'bg-zinc-500/10 text-zinc-400',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${colors[status] ?? 'bg-zinc-500/10 text-zinc-400'}`}>
      {status}
    </span>
  );
}

function InitiatedByBadge({ by }: { by: string }) {
  const colors: Record<string, string> = {
    api: 'border-accent/30 text-accent',
    dashboard: 'border-blue-500/30 text-blue-400',
    mcp: 'border-purple-500/30 text-purple-400',
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${colors[by] ?? 'border-zinc-500/30 text-zinc-400'}`}>
      {by}
    </span>
  );
}

export default function RefundsPage() {
  return (
    <>
      <Header title="Refunds" />
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                className="rounded-full border border-white/10 px-3 py-1 text-sm capitalize text-text-secondary hover:border-accent/30 hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/5 bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-sm text-text-secondary">
                <th className="px-4 py-3 font-medium">Refund ID</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_REFUNDS.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-mono text-text-primary">{r.id}</td>
                  <td className="px-4 py-3 text-text-primary">{formatAmount(r.amount, r.currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-text-secondary">{r.reason.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3"><InitiatedByBadge by={r.initiatedBy} /></td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(r.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
