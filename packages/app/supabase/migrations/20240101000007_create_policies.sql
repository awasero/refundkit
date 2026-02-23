-- Create policies table for merchant refund policy configuration
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  return_window_days INTEGER NOT NULL DEFAULT 30,
  restocking_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_sale BOOLEAN NOT NULL DEFAULT false,
  exchange_only BOOLEAN NOT NULL DEFAULT false,
  category_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  per_customer_limits JSONB,
  auto_approve_threshold INTEGER,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_policies_org_id ON policies(organization_id);
CREATE INDEX idx_policies_active ON policies(organization_id, active);
CREATE INDEX idx_policies_rules ON policies USING GIN (rules);

-- RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization policies"
  ON policies FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage their organization policies"
  ON policies FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
