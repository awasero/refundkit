import type { Metadata } from 'next';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — RefundKit',
  description: 'Simple, transparent pricing for RefundKit. Free tier for testing, usage-based pricing for production.',
};

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals and small projects',
    features: [
      'Live + test API keys',
      '1,000 refunds/month',
      '100 MCP tool calls/day',
      'Community support',
      '3 team members',
      'Webhook notifications',
      'API logs (7-day retention)',
    ],
    cta: 'Get Started',
    accent: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For production applications',
    features: [
      'Live + test API keys',
      '10,000 refunds/month',
      'Unlimited MCP tool calls',
      'Priority support',
      'Up to 10 team members',
      'Webhook notifications',
      'API logs (30-day retention)',
    ],
    cta: 'Start Free Trial',
    accent: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For high-volume operations',
    features: [
      'Unlimited refunds',
      'Unlimited team members',
      'Custom processor integrations',
      'SLA guarantee',
      'Dedicated support',
      'SSO & SAML',
      'Audit logs (unlimited)',
      'Custom contracts',
    ],
    cta: 'Contact Sales',
    accent: false,
  },
];

export default function PricingPage() {
  return (
    <div className="pt-24">
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-text-primary">Simple, transparent pricing</h1>
        <p className="mt-4 text-text-secondary">
          Start free, scale as you grow. No hidden fees.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 text-left ${
                plan.accent
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-white/5 bg-surface'
              }`}
            >
              <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
              <p className="mt-1 text-sm text-text-secondary">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                <span className="text-text-secondary">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-lg py-2 text-sm font-medium ${
                  plan.accent
                    ? 'bg-accent text-black hover:bg-accent-hover'
                    : 'border border-white/10 text-text-secondary hover:border-accent/30 hover:text-accent'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
