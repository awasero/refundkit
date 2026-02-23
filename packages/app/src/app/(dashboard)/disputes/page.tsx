'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle, Shield, Ban, RefreshCw } from 'lucide-react';

const MOCK_DISPUTES = [
  { id: 'dsp_1', refundId: 'ref_x1y2z3a4', transactionId: 'txn_abc123', riskScore: 92, riskLevel: 'critical', recommendation: 'deny', signals: ['velocity_spike', 'amount_anomaly', 'pattern_match'], flagged: true, amount: 45000, evaluatedAt: '2026-02-23T09:00:00Z' },
  { id: 'dsp_2', refundId: 'ref_b5c6d7e8', transactionId: 'txn_def456', riskScore: 71, riskLevel: 'high', recommendation: 'review', signals: ['velocity_spike', 'customer_history'], flagged: true, amount: 12000, evaluatedAt: '2026-02-23T08:45:00Z' },
  { id: 'dsp_3', refundId: 'ref_f9g0h1i2', transactionId: 'txn_ghi789', riskScore: 45, riskLevel: 'medium', recommendation: 'review', signals: ['amount_anomaly'], flagged: false, amount: 8500, evaluatedAt: '2026-02-22T16:30:00Z' },
  { id: 'dsp_4', refundId: 'ref_j3k4l5m6', transactionId: 'txn_jkl012', riskScore: 18, riskLevel: 'low', recommendation: 'approve', signals: [], flagged: false, amount: 2500, evaluatedAt: '2026-02-22T14:00:00Z' },
  { id: 'dsp_5', refundId: 'ref_n7o8p9q0', transactionId: 'txn_mno345', riskScore: 85, riskLevel: 'critical', recommendation: 'preemptive_refund', signals: ['velocity_spike', 'amount_anomaly', 'customer_history'], flagged: true, amount: 32000, evaluatedAt: '2026-02-22T11:00:00Z' },
];

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export default function DisputesPage() {
  const flagged = MOCK_DISPUTES.filter(d => d.flagged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Dispute Risk</h1>
          <p className="text-sm text-text-muted mt-1">Monitor and prevent chargebacks</p>
        </div>
      </div>

      {/* Risk distribution */}
      <div className="grid grid-cols-4 gap-4">
        {(['low', 'medium', 'high', 'critical'] as const).map(level => {
          const count = MOCK_DISPUTES.filter(d => d.riskLevel === level).length;
          const colors = riskColors[level];
          return (
            <Card key={level} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                  <AlertTriangle className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-text-primary">{count}</p>
                  <p className={`text-xs capitalize ${colors.text}`}>{level} risk</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Flagged items */}
      {flagged.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Flagged Transactions</h2>
          {flagged.map(d => {
            const colors = riskColors[d.riskLevel];
            return (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-text-primary">{d.transactionId}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
                        {d.riskLevel} — {d.riskScore}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>Amount: ${(d.amount / 100).toFixed(2)}</span>
                      <span>·</span>
                      <span>Signals: {d.signals.join(', ').replace(/_/g, ' ') || 'none'}</span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Recommendation: <span className={`font-medium ${colors.text}`}>{d.recommendation.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <Shield className="h-3.5 w-3.5" />
                      Accept
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                      <Ban className="h-3.5 w-3.5" />
                      Block
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Pre-empt
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* All disputes table */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">All Assessments</h2>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Transaction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Recommendation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Evaluated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_DISPUTES.map(d => {
                const colors = riskColors[d.riskLevel];
                return (
                  <tr key={d.id} className="hover:bg-surface-hover transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-text-primary">{d.transactionId}</td>
                    <td className="px-4 py-3 text-sm"><span className={`font-medium ${colors.text}`}>{d.riskScore}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${colors.bg} ${colors.text} ${colors.border}`}>{d.riskLevel}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted capitalize">{d.recommendation.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">${(d.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{new Date(d.evaluatedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
