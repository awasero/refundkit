'use client';

import { Card } from '@/components/ui/card';
import { Scale, Plus, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react';

const MOCK_POLICIES = [
  {
    id: 'pol_1', name: 'Default Return Policy', active: true,
    returnWindowDays: 30, restockingFeePercent: 0, finalSale: false, exchangeOnly: false,
    autoApproveThreshold: 5000, categoryRules: 3,
    updatedAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'pol_2', name: 'Electronics Policy', active: true,
    returnWindowDays: 15, restockingFeePercent: 15, finalSale: false, exchangeOnly: false,
    autoApproveThreshold: 2000, categoryRules: 5,
    updatedAt: '2026-02-18T14:30:00Z',
  },
  {
    id: 'pol_3', name: 'Final Sale Items', active: true,
    returnWindowDays: 0, restockingFeePercent: 0, finalSale: true, exchangeOnly: false,
    autoApproveThreshold: 0, categoryRules: 1,
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'pol_4', name: 'Holiday Extended Returns', active: false,
    returnWindowDays: 60, restockingFeePercent: 0, finalSale: false, exchangeOnly: false,
    autoApproveThreshold: 10000, categoryRules: 2,
    updatedAt: '2026-01-10T12:00:00Z',
  },
];

export default function PoliciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Policies</h1>
          <p className="text-sm text-text-muted mt-1">Configure refund and return policies</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          New Policy
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_POLICIES.map((policy) => (
          <Card key={policy.id} className="p-4 hover:border-border-subtle transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${policy.active ? 'bg-emerald-500/10' : 'bg-zinc-500/10'}`}>
                  <Scale className={`h-5 w-5 ${policy.active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-text-primary">{policy.name}</h3>
                    {policy.active ? (
                      <ToggleRight className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    {policy.finalSale ? (
                      <span className="text-red-400">Final sale — no returns</span>
                    ) : (
                      <>
                        <span>{policy.returnWindowDays}d window</span>
                        {policy.restockingFeePercent > 0 && <span>{policy.restockingFeePercent}% restocking fee</span>}
                        <span>Auto-approve under ${(policy.autoApproveThreshold / 100).toFixed(0)}</span>
                        <span>{policy.categoryRules} category rules</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">Updated {new Date(policy.updatedAt).toLocaleDateString()}</span>
                <ChevronRight className="h-4 w-4 text-text-muted" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
