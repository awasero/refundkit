-- Create dispute_signals table for fraud detection and dispute risk tracking
CREATE TABLE dispute_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  refund_id UUID NOT NULL REFERENCES refunds(id),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendation TEXT NOT NULL
    CHECK (recommendation IN ('approve', 'review', 'deny', 'preemptive_refund')),
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dispute_signals_org_id ON dispute_signals(organization_id);
CREATE INDEX idx_dispute_signals_refund ON dispute_signals(refund_id);
CREATE INDEX idx_dispute_signals_flagged ON dispute_signals(organization_id) WHERE flagged = true;
CREATE INDEX idx_dispute_signals_risk ON dispute_signals(organization_id, risk_level);
CREATE INDEX idx_dispute_signals_signals ON dispute_signals USING GIN (signals);

-- RLS
ALTER TABLE dispute_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization dispute signals"
  ON dispute_signals FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage their organization dispute signals"
  ON dispute_signals FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
