import { Header } from '@/components/dashboard/header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const MOCK_LOGS = [
  { method: 'POST', path: '/v1/refunds', status: 201, duration: 245, date: '2024-01-15T10:30:00Z' },
  { method: 'GET', path: '/v1/refunds?status=pending', status: 200, duration: 32, date: '2024-01-15T10:29:55Z' },
  { method: 'GET', path: '/v1/refunds/ref_a1b2c3d4', status: 200, duration: 18, date: '2024-01-15T10:28:00Z' },
  { method: 'PUT', path: '/v1/refunds/ref_a1b2c3d4', status: 200, duration: 56, date: '2024-01-15T10:25:00Z' },
  { method: 'DELETE', path: '/v1/refunds/ref_old123', status: 400, duration: 12, date: '2024-01-15T10:20:00Z' },
  { method: 'GET', path: '/v1/refunds', status: 200, duration: 28, date: '2024-01-15T10:15:00Z' },
];

const METHOD_VARIANT: Record<string, 'info' | 'default' | 'warning' | 'destructive'> = {
  GET: 'info',
  POST: 'default',
  PUT: 'warning',
  DELETE: 'destructive',
};

function MethodBadge({ method }: { method: string }) {
  return (
    <Badge variant={METHOD_VARIANT[method] ?? 'secondary'} className="font-mono">
      {method}
    </Badge>
  );
}

function StatusCode({ code }: { code: number }) {
  const color =
    code < 300
      ? 'text-success'
      : code < 400
        ? 'text-warning'
        : 'text-danger';
  return <span className={`font-mono text-xs font-medium ${color}`}>{code}</span>;
}

export default function LogsPage() {
  return (
    <>
      <Header title="API Logs" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <p className="text-sm text-text-secondary">
            Recent API requests to your RefundKit endpoints.
          </p>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LOGS.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <MethodBadge method={log.method} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-primary">
                      {log.path}
                    </TableCell>
                    <TableCell>
                      <StatusCode code={log.status} />
                    </TableCell>
                    <TableCell className="text-text-muted">
                      {log.duration}ms
                    </TableCell>
                    <TableCell className="text-text-muted">
                      {new Date(log.date).toLocaleTimeString()}
                    </TableCell>
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
