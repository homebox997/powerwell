-- PawWell / AU minimal Supabase schema
-- Project region: create the Supabase project in an Australia region before running this SQL.
-- Country expansion rule: add new country values in data only; do not change table structure.

create extension if not exists pgcrypto;

create schema if not exists app_api;

create table if not exists public.blog_articles (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  country text not null default 'Australia'
);

create table if not exists public.disease_articles (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  country text not null default 'Australia'
);

create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  country text not null default 'Australia'
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  country text not null default 'Australia'
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  country text not null default 'Australia'
);

create table if not exists public.interface_events (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  country text not null default 'Australia'
);

create index if not exists blog_articles_country_created_idx
  on public.blog_articles (country, created_at desc);

create index if not exists disease_articles_country_created_idx
  on public.disease_articles (country, created_at desc);

create index if not exists assessment_submissions_country_created_idx
  on public.assessment_submissions (country, created_at desc);

create index if not exists community_posts_country_created_idx
  on public.community_posts (country, created_at desc);

create index if not exists community_comments_country_created_idx
  on public.community_comments (country, created_at desc);

create index if not exists interface_events_country_created_idx
  on public.interface_events (country, created_at desc);

alter table public.blog_articles enable row level security;
alter table public.disease_articles enable row level security;
alter table public.assessment_submissions enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.interface_events enable row level security;

-- Block direct table access from client roles. Third parties should call only the app_api RPC functions.
revoke all on table public.blog_articles from anon, authenticated;
revoke all on table public.disease_articles from anon, authenticated;
revoke all on table public.assessment_submissions from anon, authenticated;
revoke all on table public.community_posts from anon, authenticated;
revoke all on table public.community_comments from anon, authenticated;
revoke all on table public.interface_events from anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_articles_touch_updated_at on public.blog_articles;
create trigger blog_articles_touch_updated_at
before update on public.blog_articles
for each row execute function public.touch_updated_at();

drop trigger if exists disease_articles_touch_updated_at on public.disease_articles;
create trigger disease_articles_touch_updated_at
before update on public.disease_articles
for each row execute function public.touch_updated_at();

drop trigger if exists assessment_submissions_touch_updated_at on public.assessment_submissions;
create trigger assessment_submissions_touch_updated_at
before update on public.assessment_submissions
for each row execute function public.touch_updated_at();

drop trigger if exists community_posts_touch_updated_at on public.community_posts;
create trigger community_posts_touch_updated_at
before update on public.community_posts
for each row execute function public.touch_updated_at();

drop trigger if exists community_comments_touch_updated_at on public.community_comments;
create trigger community_comments_touch_updated_at
before update on public.community_comments
for each row execute function public.touch_updated_at();

drop trigger if exists interface_events_touch_updated_at on public.interface_events;
create trigger interface_events_touch_updated_at
before update on public.interface_events
for each row execute function public.touch_updated_at();

create or replace function app_api.get_blog_articles(
  p_category text default null,
  p_country text default 'Australia'
)
returns table (
  id uuid,
  content jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  country text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select ba.id, ba.content, ba.created_at, ba.updated_at, ba.country
  from public.blog_articles ba
  where ba.country = coalesce(nullif(p_country, ''), 'Australia')
    and (
      p_category is null
      or ba.content->>'category' = p_category
    )
  order by ba.created_at desc;
$$;

create or replace function app_api.get_disease_article(
  p_slug text,
  p_country text default 'Australia'
)
returns table (
  id uuid,
  content jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  country text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select da.id, da.content, da.created_at, da.updated_at, da.country
  from public.disease_articles da
  where da.country = coalesce(nullif(p_country, ''), 'Australia')
    and da.content->>'slug' = p_slug
  order by da.created_at desc
  limit 1;
$$;

create or replace function app_api.submit_assessment(
  p_payload jsonb,
  p_country text default 'Australia'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  insert into public.assessment_submissions (content, country)
  values (coalesce(p_payload, '{}'::jsonb), coalesce(nullif(p_country, ''), 'Australia'))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function app_api.get_community_posts(
  p_country text default 'Australia'
)
returns table (
  id uuid,
  content jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  country text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select cp.id, cp.content, cp.created_at, cp.updated_at, cp.country
  from public.community_posts cp
  where cp.country = coalesce(nullif(p_country, ''), 'Australia')
  order by cp.created_at desc;
$$;

create or replace function app_api.create_community_post(
  p_payload jsonb,
  p_country text default 'Australia'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  insert into public.community_posts (content, country)
  values (coalesce(p_payload, '{}'::jsonb), coalesce(nullif(p_country, ''), 'Australia'))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function app_api.create_community_comment(
  p_payload jsonb,
  p_country text default 'Australia'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  insert into public.community_comments (content, country)
  values (coalesce(p_payload, '{}'::jsonb), coalesce(nullif(p_country, ''), 'Australia'))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function app_api.record_interface_event(
  p_payload jsonb,
  p_country text default 'Australia'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  insert into public.interface_events (content, country)
  values (coalesce(p_payload, '{}'::jsonb), coalesce(nullif(p_country, ''), 'Australia'))
  returning id into v_id;

  return v_id;
end;
$$;

grant usage on schema app_api to anon, authenticated;
grant execute on function app_api.get_blog_articles(text, text) to anon, authenticated;
grant execute on function app_api.get_disease_article(text, text) to anon, authenticated;
grant execute on function app_api.submit_assessment(jsonb, text) to anon, authenticated;
grant execute on function app_api.get_community_posts(text) to anon, authenticated;
grant execute on function app_api.create_community_post(jsonb, text) to anon, authenticated;
grant execute on function app_api.create_community_comment(jsonb, text) to anon, authenticated;
grant execute on function app_api.record_interface_event(jsonb, text) to anon, authenticated;

