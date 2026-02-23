'use client';

import { Search, Share2, UserPlus, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <h1 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search something"
            className="h-9 w-56 rounded-lg border border-border bg-transparent pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent/40 focus:outline-none"
          />
        </div>

        {/* Action icons */}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-text-muted hover:text-text-secondary">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-text-muted hover:text-text-secondary">
          <UserPlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-text-muted hover:text-text-secondary">
          <Bell className="h-4 w-4" />
        </Button>

        {/* CTA */}
        <Button className="ml-1 h-9 gap-1.5 rounded-full px-4 text-sm font-medium">
          <Plus className="h-3.5 w-3.5" />
          New Refund
        </Button>
      </div>
    </header>
  );
}
