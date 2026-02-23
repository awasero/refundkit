'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  RotateCcw,
  Key,
  Plug,
  ScrollText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/refunds', icon: RotateCcw, label: 'Refunds' },
  { href: '/api-keys', icon: Key, label: 'API Keys' },
  { href: '/processors', icon: Plug, label: 'Processors' },
  { href: '/logs', icon: ScrollText, label: 'Logs' },
] as const;

const BOTTOM_ITEMS = [
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[60px] flex-col items-center border-r border-white/5 bg-surface py-4">
      <div className="mb-8 flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
        <span className="text-sm font-bold text-black">RK</span>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                active
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2">
        {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                active
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
