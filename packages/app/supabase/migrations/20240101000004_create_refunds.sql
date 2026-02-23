-- Create refunds table
create table refunds (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  external_refund_id text,
  transaction_id text not null,
  amount integer not null,
  currency text not null default 'usd',
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processor text not null,
  metadata jsonb,
  initiated_by text not null check (initiated_by in ('api', 'dashboard', 'mcp')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table refunds enable row level security;

-- Index on org_id for filtering refunds by organization
create index idx_refunds_org_id on refunds (org_id);

-- Index on status for filtering by refund status
create index idx_refunds_status on refunds (status);

-- Index on transaction_id for looking up refunds by original transaction
create index idx_refunds_transaction_id on refunds (transaction_id);

-- RLS policy: org members can view their org's refunds
create policy "org members can view refunds"
  on refunds
  for select
  using (
    exists (
      select 1
      from users_organizations
      where users_organizations.organization_id = refunds.org_id
        and users_organizations.user_id = auth.uid()
    )
  );
