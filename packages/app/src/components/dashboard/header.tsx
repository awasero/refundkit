'use client';

import { Search, Bell, Plus } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 px-6">
      <h1 className="text-xl font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-white/5 bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary">
          <Bell className="h-4 w-4" />
        </button>

        <button className="flex h-9 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-black hover:bg-accent-hover">
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>
    </header>
  );
}
