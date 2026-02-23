-- Create store_credits table for store credit management
CREATE TABLE store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  refund_id UUID REFERENCES refunds(id),
  return_id UUID REFERENCES returns(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  credit_type TEXT NOT NULL
    CHECK (credit_type IN ('refund_conversion', 'goodwill', 'exchange_difference', 'promotional')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'partially_redeemed', 'fully_redeemed', 'expired', 'revoked')),
  redeemed_amount INTEGER NOT NULL DEFAULT 0,
  remaining_amount INTEGER GENERATED ALWAYS AS (amount - redeemed_amount) STORED,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_store_credits_org_id ON store_credits(organization_id);
CREATE INDEX idx_store_credits_customer ON store_credits(organization_id, customer_id);
CREATE INDEX idx_store_credits_refund ON store_credits(refund_id);
CREATE INDEX idx_store_credits_return ON store_credits(return_id);
CREATE INDEX idx_store_credits_active ON store_credits(organization_id) WHERE status = 'active';

-- RLS
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization store credits"
  ON store_credits FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization store credits"
  ON store_credits FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));
