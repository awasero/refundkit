'use client';

import { Card } from '@/components/ui/card';
import { Check, X, ArrowUpRight, Clock } from 'lucide-react';

const MOCK_APPROVALS = [
  { id: 'apr_1a2b3c', refundId: 'ref_x1y2z3a4', amount: 15000, currency: 'usd', riskScore: 72, status: 'pending', thresholdRule: 'amount_above_10000', reason: 'Product defective — high value item', createdAt: '2026-02-23T09:15:00Z' },
  { id: 'apr_4d5e6f', refundId: 'ref_b5c6d7e8', amount: 8500, currency: 'usd', riskScore: 45, status: 'pending', thresholdRule: 'risk_score_above_40', reason: 'Duplicate charge — flagged by risk engine', createdAt: '2026-02-23T08:30:00Z' },
  { id: 'apr_7g8h9i', refundId: 'ref_f9g0h1i2', amount: 25000, currency: 'usd', riskScore: 88, status: 'pending', thresholdRule: 'amount_above_20000', reason: 'Wrong product — customer requesting full refund', createdAt: '2026-02-22T16:00:00Z' },
  { id: 'apr_j0k1l2', refundId: 'ref_m3n4o5p6', amount: 3200, currency: 'usd', riskScore: 65, status: 'approved', thresholdRule: 'risk_score_above_40', reason: 'Subscription cancelled — moderate risk', decidedAt: '2026-02-22T14:00:00Z', createdAt: '2026-02-22T10:00:00Z' },
  { id: 'apr_q3r4s5', refundId: 'ref_t6u7v8w9', amount: 50000, currency: 'usd', riskScore: 92, status: 'rejected', thresholdRule: 'amount_above_20000', reason: 'Suspicious pattern — multiple high-value refunds', decidedAt: '2026-02-21T11:00:00Z', createdAt: '2026-02-21T09:00:00Z' },
];

function riskColor(score: number): string {
  if (score >= 75) return 'text-red-400';
  if (score >= 50) return 'text-orange-400';
  if (score >= 25) return 'text-yellow-400';
  return 'text-emerald-400';
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    escalated: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return styles[status] ?? '';
}

export default function ApprovalsPage() {
  const pending = MOCK_APPROVALS.filter(a => a.status === 'pending');
  const decided = MOCK_APPROVALS.filter(a => a.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Approval Queue</h1>
          <p className="text-sm text-text-muted mt-1">{pending.length} pending approvals require your review</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{pending.length}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{MOCK_APPROVALS.filter(a => a.status === 'approved').length}</p>
              <p className="text-xs text-text-muted">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{MOCK_APPROVALS.filter(a => a.status === 'rejected').length}</p>
              <p className="text-xs text-text-muted">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Requires Action</h2>
          {pending.map((approval) => (
            <Card key={approval.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-text-primary">{approval.refundId}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge(approval.status)}`}>
                      {approval.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">{approval.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>Amount: <span className="text-text-primary font-medium">${(approval.amount / 100).toFixed(2)}</span></span>
                    <span>Risk: <span className={`font-medium ${riskColor(approval.riskScore)}`}>{approval.riskScore}/100</span></span>
                    <span>Rule: {approval.thresholdRule.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Escalate
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recent decisions */}
      {decided.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Recent Decisions</h2>
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Refund ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Decision</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Decided</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {decided.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-text-primary">{a.refundId}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">${(a.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm"><span className={riskColor(a.riskScore)}>{a.riskScore}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{a.decidedAt ? new Date(a.decidedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
