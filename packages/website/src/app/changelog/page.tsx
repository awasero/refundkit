import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — RefundKit',
  description: 'What\'s new in RefundKit. Latest releases, features, and improvements.',
};

const ENTRIES = [
  {
    version: '0.1.0',
    date: 'January 15, 2024',
    title: 'Initial Release',
    changes: [
      'TypeScript SDK with { data, error } pattern',
      'MCP server with 5 refund tools',
      'Stripe processor integration',
      'Dashboard with real-time refund tracking',
      'API key management (rk_live_ / rk_test_)',
      'API logs and event timeline',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="pt-24">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold text-text-primary">Changelog</h1>
        <p className="mt-4 text-text-secondary">New features, improvements, and fixes.</p>

        <div className="mt-12 space-y-12">
          {ENTRIES.map((entry) => (
            <div key={entry.version} className="relative pl-6">
              <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-accent" />
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-sm font-medium text-accent">
                  v{entry.version}
                </span>
                <span className="text-sm text-text-muted">{entry.date}</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-text-primary">{entry.title}</h2>
              <ul className="mt-3 space-y-1">
                {entry.changes.map((change) => (
                  <li key={change} className="text-sm text-text-secondary">
                    — {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
