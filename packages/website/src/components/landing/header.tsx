import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <span className="text-xs font-bold text-black">RK</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">RefundKit</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/docs/getting-started" className="text-sm text-text-secondary hover:text-text-primary">
            Docs
          </Link>
          <Link href="/blog" className="text-sm text-text-secondary hover:text-text-primary">
            Blog
          </Link>
          <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary">
            Pricing
          </Link>
          <Link href="/changelog" className="text-sm text-text-secondary hover:text-text-primary">
            Changelog
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/refundkit"
            className="text-sm text-text-secondary hover:text-text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <Link
            href="https://app.refundkit.dev"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-black hover:bg-accent-hover"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
