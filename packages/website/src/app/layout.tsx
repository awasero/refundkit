import type { Metadata } from 'next';
import { SiteHeader } from '@/components/landing/header';
import { SiteFooter } from '@/components/landing/footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'RefundKit — Refund infrastructure for AI agents',
  description:
    'Process, track, and manage refunds programmatically with a TypeScript SDK, MCP server, and REST API. Built for AI agents and modern commerce.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
