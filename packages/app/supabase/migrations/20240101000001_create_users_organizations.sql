-- Create users_organizations join table (many-to-many with roles)
create table users_organizations (
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),

  primary key (user_id, organization_id)
);

alter table users_organizations enable row level security;

-- Users can see their own memberships
create policy "users can view own memberships"
  on users_organizations
  for select
  using (auth.uid() = user_id);
