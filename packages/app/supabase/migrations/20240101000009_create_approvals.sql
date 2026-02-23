-- Create approvals table for human-in-the-loop refund approval workflows
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  refund_id UUID NOT NULL REFERENCES refunds(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  threshold_rule TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  risk_score INTEGER,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  decision_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX idx_approvals_refund_id ON approvals(refund_id);
CREATE INDEX idx_approvals_status ON approvals(organization_id, status);
CREATE INDEX idx_approvals_pending ON approvals(organization_id) WHERE status = 'pending';

-- RLS
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization approvals"
  ON approvals FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage their organization approvals"
  ON approvals FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
