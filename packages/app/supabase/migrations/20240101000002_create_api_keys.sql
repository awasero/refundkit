-- Create api_keys table
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  key_hash text not null unique,
  key_prefix text not null,
  name text not null,
  environment text not null check (environment in ('live', 'test')),
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table api_keys enable row level security;

-- Index on key_hash for fast lookups during API authentication
create index idx_api_keys_key_hash on api_keys (key_hash);

-- RLS policy: org members can view their org's API keys
create policy "org members can view api keys"
  on api_keys
  for select
  using (
    exists (
      select 1
      from users_organizations
      where users_organizations.organization_id = api_keys.org_id
        and users_organizations.user_id = auth.uid()
    )
  );
