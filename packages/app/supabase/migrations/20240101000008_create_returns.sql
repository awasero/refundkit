-- Create returns table for return lifecycle management
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  refund_id UUID REFERENCES refunds(id),
  rma_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'label_generated', 'shipped', 'in_transit', 'delivered', 'inspecting', 'completed', 'rejected')),
  method TEXT DEFAULT 'mail'
    CHECK (method IN ('mail', 'in_store', 'pickup')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipment JSONB,
  customer_email TEXT,
  customer_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_returns_org_id ON returns(organization_id);
CREATE INDEX idx_returns_refund_id ON returns(refund_id);
CREATE INDEX idx_returns_rma ON returns(rma_number);
CREATE INDEX idx_returns_status ON returns(organization_id, status);
CREATE INDEX idx_returns_org_status_created ON returns(organization_id, status, created_at DESC);

-- RLS
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization returns"
  ON returns FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization returns"
  ON returns FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));
