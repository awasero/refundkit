import { Header } from '@/components/dashboard/header';

const MOCK_LOGS = [
  { method: 'POST', path: '/v1/refunds', status: 201, duration: 245, date: '2024-01-15T10:30:00Z' },
  { method: 'GET', path: '/v1/refunds?status=pending', status: 200, duration: 32, date: '2024-01-15T10:29:55Z' },
  { method: 'GET', path: '/v1/refunds/ref_a1b2c3d4', status: 200, duration: 18, date: '2024-01-15T10:28:00Z' },
  { method: 'POST', path: '/v1/policies/check', status: 200, duration: 56, date: '2024-01-15T10:25:00Z' },
  { method: 'POST', path: '/v1/refunds/ref_old123/cancel', status: 400, duration: 12, date: '2024-01-15T10:20:00Z' },
  { method: 'GET', path: '/v1/refunds', status: 200, duration: 28, date: '2024-01-15T10:15:00Z' },
];

function StatusCode({ code }: { code: number }) {
  const color = code < 300 ? 'text-success' : code < 400 ? 'text-warning' : 'text-danger';
  return <span className={`font-mono ${color}`}>{code}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'text-blue-400 bg-blue-400/10',
    POST: 'text-accent bg-accent/10',
    PUT: 'text-warning bg-warning/10',
    DELETE: 'text-danger bg-danger/10',
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-mono font-medium ${colors[method] ?? 'text-zinc-400 bg-zinc-400/10'}`}>
      {method}
    </span>
  );
}

export default function LogsPage() {
  return (
    <>
      <Header title="API Logs" />
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-sm text-text-secondary">
          Recent API requests to your RefundKit endpoints.
        </p>

        <div className="mt-6 rounded-xl border border-white/5 bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-sm text-text-secondary">
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Path</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_LOGS.map((log, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3"><MethodBadge method={log.method} /></td>
                  <td className="px-4 py-3 font-mono text-text-primary">{log.path}</td>
                  <td className="px-4 py-3"><StatusCode code={log.status} /></td>
                  <td className="px-4 py-3 text-text-secondary">{log.duration}ms</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(log.date).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
