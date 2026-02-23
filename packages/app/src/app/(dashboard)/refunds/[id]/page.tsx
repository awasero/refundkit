import { Header } from '@/components/dashboard/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MOCK_EVENTS = [
  { type: 'refund.created', details: 'Refund initiated via API', date: '2024-01-15T10:30:00Z' },
  { type: 'refund.processing', details: 'Sent to Stripe for processing', date: '2024-01-15T10:30:05Z' },
  { type: 'refund.completed', details: 'Stripe confirmed refund re_abc123', date: '2024-01-15T10:31:12Z' },
];

export default async function RefundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Header title="Refund Details" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Refund details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Refund Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-text-muted">Refund ID</dt>
                    <dd className="mt-1 font-mono text-text-primary">{id}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Transaction ID</dt>
                    <dd className="mt-1 font-mono text-text-primary">txn_stripe_001</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Amount</dt>
                    <dd className="mt-1 text-text-primary">$29.99</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Status</dt>
                    <dd className="mt-1">
                      <Badge variant="default">completed</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Reason</dt>
                    <dd className="mt-1 text-text-primary">Product not received</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Processor</dt>
                    <dd className="mt-1 text-text-primary">Stripe</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Initiated By</dt>
                    <dd className="mt-1">
                      <Badge variant="outline">api</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Created</dt>
                    <dd className="mt-1 text-text-primary">Jan 15, 2024 10:30 AM</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_EVENTS.map((event, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                      {i < MOCK_EVENTS.length - 1 && (
                        <div className="absolute left-[5px] top-4 h-full w-px bg-border" />
                      )}
                      <p className="text-sm font-medium text-text-primary">{event.type}</p>
                      <p className="text-xs text-text-secondary">{event.details}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
