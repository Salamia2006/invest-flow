begin;
create table if not exists public.projects (
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
create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists projects_owner_idx on public.projects (owner_id);
create table if not exists public.premium_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
alter table public.premium_requests enable row level security;
revoke all on public.projects, public.premium_requests from public, anon, authenticated;
grant select (id,created_at,title,city,company,kind,stage,min_rub,term_months,description,contact_email) on public.projects to anon,authenticated;
grant insert (owner_id,title,city,company,kind,stage,min_rub,term_months,description,contact_email) on public.projects to authenticated;
grant insert (user_id) on public.premium_requests to authenticated;
grant select on public.premium_requests to authenticated;
drop policy if exists "Public catalogue" on public.projects;
create policy "Public catalogue" on public.projects for select to anon,authenticated using (true);
drop policy if exists "Publish own project" on public.projects;
create policy "Publish own project" on public.projects for insert to authenticated with check ((select auth.uid())=owner_id);
drop policy if exists "Request own premium" on public.premium_requests;
create policy "Request own premium" on public.premium_requests for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Read own request" on public.premium_requests;
create policy "Read own request" on public.premium_requests for select to authenticated using ((select auth.uid())=user_id);
commit;
