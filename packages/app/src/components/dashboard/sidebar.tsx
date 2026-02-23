'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Search,
  RotateCcw,
  PackageCheck,
  ShieldCheck,
  Scale,
  AlertTriangle,
  KeyRound,
  Cpu,
  FileText,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/refunds', icon: RotateCcw, label: 'Refunds' },
  { href: '/returns', icon: PackageCheck, label: 'Returns' },
  { href: '/approvals', icon: ShieldCheck, label: 'Approvals' },
  { href: '/policies', icon: Scale, label: 'Policies' },
  { href: '/disputes', icon: AlertTriangle, label: 'Disputes' },
  { href: '/api-keys', icon: KeyRound, label: 'API Keys' },
  { href: '/processors', icon: Cpu, label: 'Processors' },
  { href: '/logs', icon: FileText, label: 'Logs' },
] as const;

const BOTTOM_ITEMS = [
  { href: '/help', icon: HelpCircle, label: 'Help' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[60px] flex-col items-center bg-background py-5">
      {/* Brand logo */}
      <Link href="/" className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
        <span className="text-[13px] font-bold leading-none text-black tracking-tight">RK</span>
      </Link>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col items-center gap-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                active
                  ? 'bg-accent text-black shadow-lg shadow-accent/20'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text-secondary',
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-1.5">
        {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'group flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                active
                  ? 'bg-accent text-black shadow-lg shadow-accent/20'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text-secondary',
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
            </Link>
          );
        })}

        {/* User avatar */}
        <div className="mt-4 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent/60 to-accent/20">
          <span className="text-[11px] font-semibold text-white">U</span>
        </div>
      </div>
    </aside>
  );
}
