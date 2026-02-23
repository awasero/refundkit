import { Hero } from '@/components/landing/hero';
import { CodeExample } from '@/components/landing/code-example';
import { ValueProps } from '@/components/landing/value-props';
import { softwareApplicationSchema } from '@/lib/structured-data';

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema()) }}
      />
      <Hero />
      <CodeExample />
      <ValueProps />

      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary">MCP server for AI agents</h2>
          <p className="mt-4 text-text-secondary">
            Connect RefundKit to Claude, GPT, or any MCP-compatible agent. Five tools for
            complete refund management — no custom integration code needed.
          </p>

          <div className="mt-8 rounded-xl border border-white/5 bg-surface p-4 text-left">
            <div className="flex items-center gap-2 pb-3 text-xs text-text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
              <span className="ml-2">claude_desktop_config.json</span>
            </div>
            <pre className="overflow-x-auto text-sm leading-relaxed">
              <code className="text-text-secondary">{`{
  "mcpServers": {
    "refundkit": {
      "command": "npx",
      "args": ["@refundkit/sdk", "mcp"],
      "env": {
        "REFUNDKIT_API_KEY": "rk_live_..."
      }
    }
  }
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary">Start processing refunds today</h2>
          <p className="mt-4 text-text-secondary">
            Free to start. No credit card required. Process your first refund in under 5 minutes.
          </p>
          <a
            href="https://app.refundkit.dev/signup"
            className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-black hover:bg-accent-hover"
          >
            Create Free Account
          </a>
        </div>
      </section>
    </>
  );
}
