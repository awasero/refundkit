-- Create api_logs table (request/response audit log)
create table api_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  method text not null,
  path text not null,
  status_code integer not null,
  request_body jsonb,
  response_body jsonb,
  duration_ms integer,
  created_at timestamptz not null default now()
);

alter table api_logs enable row level security;

-- Composite index on org_id and created_at for time-range queries scoped to an org
create index idx_api_logs_org_id_created_at on api_logs (org_id, created_at);

-- RLS policy: org members can view their org's API logs
create policy "org members can view api logs"
  on api_logs
  for select
  using (
    exists (
      select 1
      from users_organizations
      where users_organizations.organization_id = api_logs.org_id
        and users_organizations.user_id = auth.uid()
    )
  );
