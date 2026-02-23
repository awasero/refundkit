import Link from 'next/link';

const SECTIONS = [
  {
    title: 'Product',
    links: [
      { label: 'Documentation', href: '/docs/getting-started' },
      { label: 'API Reference', href: '/docs/api-reference/refunds-create' },
      { label: 'MCP Server', href: '/docs/mcp-server' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Quickstart', href: '/docs/getting-started/quickstart' },
      { label: 'SDK Guide', href: '/docs/sdk/installation' },
      { label: 'Error Codes', href: '/docs/errors' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'GitHub', href: 'https://github.com/refundkit' },
      { label: 'Twitter', href: 'https://twitter.com/refundkit' },
      { label: 'Contact', href: 'mailto:hello@refundkit.dev' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
                <span className="text-xs font-bold text-black">RK</span>
              </div>
              <span className="font-semibold text-text-primary">RefundKit</span>
            </div>
            <p className="mt-3 text-sm text-text-secondary">
              Refund infrastructure for AI agents.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-text-primary">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/5 pt-6">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} RefundKit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
