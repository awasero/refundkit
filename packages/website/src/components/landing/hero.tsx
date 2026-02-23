import Link from 'next/link';

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pb-20 pt-32 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-text-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Now in public beta
      </div>

      <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-text-primary md:text-6xl">
        Refund infrastructure for{' '}
        <span className="text-accent">AI agents</span>
      </h1>

      <p className="mt-6 max-w-xl text-lg text-text-secondary">
        Process, track, and manage refunds programmatically. Built for AI agents
        with MCP server support, multi-processor routing, and a TypeScript SDK.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/docs/getting-started/quickstart"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-black hover:bg-accent-hover"
        >
          Get Started
        </Link>
        <Link
          href="/docs/getting-started"
          className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium text-text-secondary hover:border-accent/30 hover:text-accent"
        >
          Read Docs
        </Link>
      </div>
    </section>
  );
}
