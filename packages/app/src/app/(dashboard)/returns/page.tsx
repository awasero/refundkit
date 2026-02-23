'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PackageCheck, Search, Filter, ArrowUpDown } from 'lucide-react';

const MOCK_RETURNS = [
  { id: 'ret_a1b2c3d4', rmaNumber: 'RMA-20260220-K8M2N4', refundId: 'ref_x1y2z3a4', status: 'shipped', method: 'mail', items: 2, customerEmail: 'sarah@example.com', createdAt: '2026-02-20T14:30:00Z' },
  { id: 'ret_e5f6g7h8', rmaNumber: 'RMA-20260219-P3Q7R1', refundId: 'ref_b5c6d7e8', status: 'inspecting', method: 'mail', items: 1, customerEmail: 'mike@example.com', createdAt: '2026-02-19T09:15:00Z' },
  { id: 'ret_i9j0k1l2', rmaNumber: 'RMA-20260218-T6U9V2', refundId: 'ref_f9g0h1i2', status: 'completed', method: 'in_store', items: 3, customerEmail: 'alex@example.com', createdAt: '2026-02-18T16:45:00Z' },
  { id: 'ret_m3n4o5p6', rmaNumber: 'RMA-20260217-W5X8Y3', refundId: 'ref_j3k4l5m6', status: 'requested', method: 'pickup', items: 1, customerEmail: 'lisa@example.com', createdAt: '2026-02-17T11:00:00Z' },
  { id: 'ret_q7r8s9t0', rmaNumber: 'RMA-20260216-Z1A4B7', refundId: 'ref_n7o8p9q0', status: 'approved', method: 'mail', items: 2, customerEmail: 'john@example.com', createdAt: '2026-02-16T08:30:00Z' },
];

const statusColor: Record<string, string> = {
  requested: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  label_generated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  in_transit: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  inspecting: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ReturnsPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_RETURNS.filter(r =>
    r.rmaNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Returns</h1>
          <p className="text-sm text-text-muted mt-1">Track and manage return requests</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/90 transition-colors">
          <PackageCheck className="h-4 w-4" />
          New Return
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by RMA number or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-raised py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">RMA Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((ret) => (
              <tr key={ret.id} className="hover:bg-surface-hover transition-colors cursor-pointer">
                <td className="px-4 py-3 text-sm font-mono text-text-primary">{ret.rmaNumber}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor[ret.status] ?? ''}`}>
                    {ret.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted capitalize">{ret.method.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{ret.items}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{ret.customerEmail}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{new Date(ret.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
