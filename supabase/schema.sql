begin;
create table if not exists public.invest_flow_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  title text not null check (length(trim(title)) between 2 and 100),
  city text not null check (length(trim(city)) between 2 and 80),
  company text not null check (length(trim(company)) between 2 and 100),
  kind text not null check (kind in ('residential','office','hotel')),
  stage text not null check (stage in ('land','concept','design')),
  min_rub integer not null check (min_rub > 0),
  term_months integer not null check (term_months between 1 and 240),
  description text not null check (length(trim(description)) between 20 and 1800),
  contact_email text not null check (length(contact_email) <= 254 and contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')
);
create index if not exists invest_flow_projects_created_at_idx on public.invest_flow_projects (created_at desc);
create index if not exists invest_flow_projects_owner_idx on public.invest_flow_projects (owner_id);
create table if not exists public.invest_flow_premium_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.invest_flow_projects enable row level security;
alter table public.invest_flow_premium_requests enable row level security;
revoke all on public.invest_flow_projects, public.invest_flow_premium_requests from public, anon, authenticated;
grant select (id,created_at,title,city,company,kind,stage,min_rub,term_months,description,contact_email) on public.invest_flow_projects to anon,authenticated;
grant insert (owner_id,title,city,company,kind,stage,min_rub,term_months,description,contact_email) on public.invest_flow_projects to authenticated;
grant insert (user_id) on public.invest_flow_premium_requests to authenticated;
grant select on public.invest_flow_premium_requests to authenticated;
drop policy if exists "Public catalogue" on public.invest_flow_projects;
create policy "Public catalogue" on public.invest_flow_projects for select to anon,authenticated using (true);
drop policy if exists "Publish own project" on public.invest_flow_projects;
create policy "Publish own project" on public.invest_flow_projects for insert to authenticated with check ((select auth.uid())=owner_id and ((select auth.jwt())->>'client_id') is null);
drop policy if exists "Request own premium" on public.invest_flow_premium_requests;
create policy "Request own premium" on public.invest_flow_premium_requests for insert to authenticated with check ((select auth.uid())=user_id and ((select auth.jwt())->>'client_id') is null);
drop policy if exists "Read own request" on public.invest_flow_premium_requests;
create policy "Read own request" on public.invest_flow_premium_requests for select to authenticated using ((select auth.uid())=user_id and ((select auth.jwt())->>'client_id') is null);
commit;
