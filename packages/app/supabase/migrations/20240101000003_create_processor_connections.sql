-- Create processor_connections table
create table processor_connections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  processor text not null,
  credentials_encrypted text not null,
  status text not null check (status in ('active', 'inactive', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Each org can only have one connection per processor
  unique (org_id, processor)
);

alter table processor_connections enable row level security;

-- RLS policy: org members can view their org's processor connections
create policy "org members can view processor connections"
  on processor_connections
  for select
  using (
    exists (
      select 1
      from users_organizations
      where users_organizations.organization_id = processor_connections.org_id
        and users_organizations.user_id = auth.uid()
    )
  );
