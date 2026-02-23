import { Header } from '@/components/dashboard/header';

const MOCK_EVENTS = [
  { type: 'refund.created', details: 'Refund initiated via API', date: '2024-01-15T10:30:00Z' },
  { type: 'refund.processing', details: 'Sent to Stripe for processing', date: '2024-01-15T10:30:05Z' },
  { type: 'refund.completed', details: 'Stripe confirmed refund re_abc123', date: '2024-01-15T10:31:12Z' },
];

export default async function RefundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Header title={`Refund ${id}`} />
      <div className="mx-auto max-w-4xl p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/5 bg-surface p-6">
              <h2 className="text-lg font-semibold text-text-primary">Details</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-text-secondary">Refund ID</dt>
                  <dd className="mt-1 font-mono text-text-primary">{id}</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Transaction ID</dt>
                  <dd className="mt-1 font-mono text-text-primary">txn_stripe_001</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Amount</dt>
                  <dd className="mt-1 text-text-primary">$29.99</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Status</dt>
                  <dd className="mt-1">
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">completed</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Reason</dt>
                  <dd className="mt-1 text-text-primary">Product not received</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Processor</dt>
                  <dd className="mt-1 text-text-primary">Stripe</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Initiated By</dt>
                  <dd className="mt-1">
                    <span className="rounded-full border border-accent/30 px-2 py-0.5 text-xs text-accent">api</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Created</dt>
                  <dd className="mt-1 text-text-primary">Jan 15, 2024 10:30 AM</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-white/5 bg-surface p-6">
              <h2 className="text-lg font-semibold text-text-primary">Timeline</h2>
              <div className="mt-4 space-y-4">
                {MOCK_EVENTS.map((event, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-accent" />
                    {i < MOCK_EVENTS.length - 1 && (
                      <div className="absolute left-[3px] top-3.5 h-full w-px bg-white/10" />
                    )}
                    <p className="text-sm font-medium text-text-primary">{event.type}</p>
                    <p className="text-xs text-text-secondary">{event.details}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
