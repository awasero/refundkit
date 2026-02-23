import { Header } from '@/components/dashboard/header';
import { Check } from 'lucide-react';

const PROCESSORS = [
  {
    name: 'Stripe',
    description: 'Connect your Stripe account to process refunds.',
    status: 'active' as const,
    icon: '💳',
  },
  {
    name: 'PayPal',
    description: 'PayPal refund processing integration.',
    status: 'coming_soon' as const,
    icon: '🅿️',
  },
  {
    name: 'Square',
    description: 'Square payment refund integration.',
    status: 'coming_soon' as const,
    icon: '⬜',
  },
];

export default function ProcessorsPage() {
  return (
    <>
      <Header title="Processors" />
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-text-secondary">
          Connect payment processors to enable refund processing.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESSORS.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-white/5 bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{p.icon}</span>
                {p.status === 'active' ? (
                  <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                    <Check className="h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs text-zinc-400">
                    Coming soon
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-text-primary">{p.name}</h3>
              <p className="mt-1 text-xs text-text-secondary">{p.description}</p>
              {p.status === 'active' ? (
                <button className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-text-secondary hover:border-accent/30 hover:text-accent">
                  Manage
                </button>
              ) : (
                <button
                  disabled
                  className="mt-4 w-full cursor-not-allowed rounded-lg border border-white/5 px-3 py-2 text-sm text-text-muted"
                >
                  Notify me
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
