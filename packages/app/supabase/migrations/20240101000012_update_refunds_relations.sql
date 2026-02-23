-- Add relation columns to refunds table for cross-entity references
ALTER TABLE refunds
  ADD COLUMN IF NOT EXISTS return_id UUID REFERENCES returns(id),
  ADD COLUMN IF NOT EXISTS approval_id UUID REFERENCES approvals(id),
  ADD COLUMN IF NOT EXISTS dispute_risk_score INTEGER,
  ADD COLUMN IF NOT EXISTS split_from_id UUID REFERENCES refunds(id),
  ADD COLUMN IF NOT EXISTS store_credit_id UUID REFERENCES store_credits(id);

CREATE INDEX IF NOT EXISTS idx_refunds_return_id ON refunds(return_id);
CREATE INDEX IF NOT EXISTS idx_refunds_approval_id ON refunds(approval_id);
CREATE INDEX IF NOT EXISTS idx_refunds_split_from ON refunds(split_from_id);
CREATE INDEX IF NOT EXISTS idx_refunds_store_credit ON refunds(store_credit_id);

-- Add composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_refunds_org_status_created
  ON refunds(organization_id, status, created_at DESC);
