import { Header } from '@/components/dashboard/header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const STATUSES = ['all', 'pending', 'processing', 'completed', 'failed', 'cancelled'] as const;

const MOCK_REFUNDS = [
  { id: 'ref_a1b2c3d4', txn: 'txn_stripe_001', amount: 2999, currency: 'usd', status: 'completed', reason: 'product_not_received', source: 'api', date: '2024-01-15T10:30:00Z' },
  { id: 'ref_e5f6g7h8', txn: 'txn_stripe_002', amount: 14900, currency: 'usd', status: 'pending', reason: 'product_defective', source: 'dashboard', date: '2024-01-15T08:15:00Z' },
  { id: 'ref_i9j0k1l2', txn: 'txn_stripe_003', amount: 999, currency: 'usd', status: 'failed', reason: 'duplicate_charge', source: 'mcp', date: '2024-01-14T22:00:00Z' },
  { id: 'ref_m3n4o5p6', txn: 'txn_stripe_004', amount: 4999, currency: 'usd', status: 'processing', reason: 'wrong_product', source: 'api', date: '2024-01-14T18:45:00Z' },
  { id: 'ref_q7r8s9t0', txn: 'txn_stripe_005', amount: 7500, currency: 'usd', status: 'cancelled', reason: 'other', source: 'dashboard', date: '2024-01-14T14:20:00Z' },
];

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'warning' | 'info' | 'destructive' | 'secondary'> = {
  completed: 'default',
  pending: 'warning',
  processing: 'info',
  failed: 'destructive',
  cancelled: 'secondary',
};

export default function RefundsPage() {
  return (
    <>
      <Header title="Refunds" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            {STATUSES.map((s) => (
              <Button
                key={s}
                variant={s === 'all' ? 'secondary' : 'outline'}
                size="sm"
                className="rounded-full capitalize"
              >
                {s}
              </Button>
            ))}
          </div>

          {/* Refunds table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REFUNDS.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-text-primary">{r.id}</TableCell>
                    <TableCell className="font-mono text-text-muted">{r.txn}</TableCell>
                    <TableCell className="text-text-primary">{formatAmount(r.amount, r.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[r.status] ?? 'secondary'}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">{r.reason.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.source}</Badge>
                    </TableCell>
                    <TableCell className="text-text-muted">{new Date(r.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}
