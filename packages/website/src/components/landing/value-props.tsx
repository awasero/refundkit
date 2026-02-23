import { Layers, Bot, Activity } from 'lucide-react';

const PROPS = [
  {
    icon: Layers,
    title: 'Multi-processor',
    description:
      'Route refunds through Stripe, PayPal, or any payment processor. One unified API, regardless of where the payment originated.',
  },
  {
    icon: Bot,
    title: 'Agent-ready',
    description:
      'Built-in MCP server with 5 tools for AI agents. Connect to Claude, OpenAI, LangChain, or any MCP-compatible agent framework.',
  },
  {
    icon: Activity,
    title: 'Real-time tracking',
    description:
      'Follow every refund from initiation to completion. Webhooks, event timelines, and API logs give full visibility into every transaction.',
  },
];

export function ValueProps() {
  return (
    <section className="border-t border-white/5 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-text-primary">
          Everything you need for refund automation
        </h2>
        <p className="mt-4 text-center text-text-secondary">
          From SDK to dashboard, RefundKit handles the full refund lifecycle.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PROPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-white/5 bg-surface p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
