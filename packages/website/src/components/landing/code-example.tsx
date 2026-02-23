export function CodeExample() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">
            Three lines to your first refund
          </h2>
          <p className="mt-4 text-text-secondary">
            Install the SDK, create a client, and process refunds. The{' '}
            <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-accent">
              {'{ data, error }'}
            </code>{' '}
            pattern makes error handling predictable.
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-surface p-4">
          <div className="flex items-center gap-2 pb-3 text-xs text-text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
            <span className="ml-2">refund.ts</span>
          </div>
          <pre className="overflow-x-auto text-sm leading-relaxed">
            <code>
              <span className="text-purple-400">import</span>{' '}
              <span className="text-text-primary">RefundKit</span>{' '}
              <span className="text-purple-400">from</span>{' '}
              <span className="text-accent">{`'@refundkit/sdk'`}</span>
              {'\n\n'}
              <span className="text-purple-400">const</span>{' '}
              <span className="text-text-primary">rk</span>{' '}
              <span className="text-text-muted">=</span>{' '}
              <span className="text-purple-400">new</span>{' '}
              <span className="text-yellow-300">RefundKit</span>
              {'({ '}
              <span className="text-text-primary">apiKey</span>
              {': '}
              <span className="text-accent">{`'rk_live_...'`}</span>
              {' })'}
              {'\n\n'}
              <span className="text-purple-400">const</span>
              {' { '}
              <span className="text-text-primary">data</span>
              {', '}
              <span className="text-text-primary">error</span>
              {' } = '}
              <span className="text-purple-400">await</span>{' '}
              <span className="text-text-primary">rk</span>
              {'.'}
              <span className="text-blue-400">refunds</span>
              {'.'}
              <span className="text-yellow-300">create</span>
              {'({\n'}
              {'  '}
              <span className="text-text-primary">transactionId</span>
              {': '}
              <span className="text-accent">{`'txn_abc123'`}</span>
              {',\n'}
              {'  '}
              <span className="text-text-primary">amount</span>
              {': '}
              <span className="text-orange-400">2999</span>
              {',\n'}
              {'  '}
              <span className="text-text-primary">reason</span>
              {': '}
              <span className="text-accent">{`'product_not_received'`}</span>
              {'\n})'}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
