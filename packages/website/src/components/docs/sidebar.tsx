'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SidebarSection } from '@/lib/docs';

export function DocsSidebar({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="w-64 shrink-0">
      <div className="sticky top-20 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {section.title}
            </h3>
            <ul className="mt-2 space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block rounded-md px-3 py-1.5 text-sm transition-colors',
                      pathname === item.href
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
