-- Create refund_events table (audit trail for refund state changes)
create table refund_events (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references refunds(id) on delete cascade,
  event_type text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table refund_events enable row level security;

-- Index on refund_id for fetching events by refund
create index idx_refund_events_refund_id on refund_events (refund_id);

-- RLS policy: org members can view events for their org's refunds
create policy "org members can view refund events"
  on refund_events
  for select
  using (
    exists (
      select 1
      from refunds
        inner join users_organizations
          on users_organizations.organization_id = refunds.org_id
      where refunds.id = refund_events.refund_id
        and users_organizations.user_id = auth.uid()
    )
  );
