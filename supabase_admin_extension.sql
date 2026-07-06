-- PowerWell independent admin extension
-- Run after supabase_au_minimal_schema.sql.

create extension if not exists pgcrypto;
create schema if not exists app_api;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('viewer', 'editor', 'admin')),
  country text not null default 'Australia',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_operation_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  actor_role text,
  action text not null,
  target_table text,
  target_id uuid,
  country text,
  payload jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_operation_logs enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.admin_operation_logs from anon, authenticated;

create or replace function app_api.current_admin_role()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
  v_role text;
begin
  v_email := nullif(auth.jwt()->>'email', '');

  if v_email is null then
    raise exception 'Admin authentication required';
  end if;

  select role
  into v_role
  from public.admin_users
  where email = v_email
    and is_active = true
  limit 1;

  if v_role is null then
    raise exception 'Admin user is not allowed';
  end if;

  return v_role;
end;
$$;

create or replace function app_api.require_admin_role(p_allowed text[])
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
begin
  v_role := app_api.current_admin_role();

  if not v_role = any(p_allowed) then
    raise exception 'Admin role % is not allowed for this operation', v_role;
  end if;

  return v_role;
end;
$$;

create or replace function app_api.is_admin_table_allowed(p_table text)
returns boolean
language sql
stable
as $$
  select p_table = any(array[
    'blog_articles',
    'disease_articles',
    'assessment_submissions',
    'community_posts',
    'community_comments',
    'interface_events'
  ]);
$$;

create or replace function app_api.write_admin_log(
  p_action text,
  p_target_table text,
  p_target_id uuid,
  p_country text,
  p_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := nullif(auth.jwt()->>'email', '');
  v_role text;
begin
  select role
  into v_role
  from public.admin_users
  where email = v_email
    and is_active = true
  limit 1;

  insert into public.admin_operation_logs (
    actor_email,
    actor_role,
    action,
    target_table,
    target_id,
    country,
    payload
  )
  values (
    v_email,
    v_role,
    p_action,
    p_target_table,
    p_target_id,
    p_country,
    coalesce(p_payload, '{}'::jsonb)
  );
end;
$$;

create or replace function app_api.admin_list_records(
  p_table text,
  p_country text default 'Australia',
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  id uuid,
  content jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  country text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
begin
  v_role := app_api.require_admin_role(array['viewer', 'editor', 'admin']);

  if not app_api.is_admin_table_allowed(p_table) then
    raise exception 'Table % is not allowed', p_table;
  end if;

  perform app_api.write_admin_log('read', p_table, null, coalesce(nullif(p_country, ''), 'Australia'), jsonb_build_object('limit', p_limit, 'offset', p_offset));

  return query execute format(
    'select id, content, created_at, updated_at, country
       from public.%I
      where country = $1
      order by created_at desc
      limit $2 offset $3',
    p_table
  )
  using coalesce(nullif(p_country, ''), 'Australia'), greatest(p_limit, 1), greatest(p_offset, 0);
end;
$$;

create or replace function app_api.admin_upsert_record(
  p_table text,
  p_id uuid,
  p_content jsonb,
  p_country text default 'Australia'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_id uuid;
  v_country text := coalesce(nullif(p_country, ''), 'Australia');
begin
  v_role := app_api.require_admin_role(array['editor', 'admin']);

  if not app_api.is_admin_table_allowed(p_table) then
    raise exception 'Table % is not allowed', p_table;
  end if;

  if p_id is null then
    execute format(
      'insert into public.%I (content, country) values ($1, $2) returning id',
      p_table
    )
    into v_id
    using coalesce(p_content, '{}'::jsonb), v_country;

    perform app_api.write_admin_log('create', p_table, v_id, v_country, coalesce(p_content, '{}'::jsonb));
  else
    execute format(
      'update public.%I set content = $1, country = $2 where id = $3 returning id',
      p_table
    )
    into v_id
    using coalesce(p_content, '{}'::jsonb), v_country, p_id;

    if v_id is null then
      raise exception 'Record % not found in %', p_id, p_table;
    end if;

    perform app_api.write_admin_log('update', p_table, v_id, v_country, coalesce(p_content, '{}'::jsonb));
  end if;

  return v_id;
end;
$$;

create or replace function app_api.admin_delete_record(
  p_table text,
  p_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_country text;
begin
  v_role := app_api.require_admin_role(array['admin']);

  if not app_api.is_admin_table_allowed(p_table) then
    raise exception 'Table % is not allowed', p_table;
  end if;

  execute format('select country from public.%I where id = $1', p_table)
  into v_country
  using p_id;

  execute format('delete from public.%I where id = $1', p_table)
  using p_id;

  perform app_api.write_admin_log('delete', p_table, p_id, v_country, '{}'::jsonb);
end;
$$;

create or replace function app_api.admin_list_operation_logs(
  p_limit integer default 200,
  p_offset integer default 0
)
returns table (
  id uuid,
  actor_email text,
  actor_role text,
  action text,
  target_table text,
  target_id uuid,
  country text,
  payload jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
begin
  v_role := app_api.require_admin_role(array['admin']);

  return query
  select l.id, l.actor_email, l.actor_role, l.action, l.target_table, l.target_id, l.country, l.payload, l.created_at
  from public.admin_operation_logs l
  order by l.created_at desc
  limit greatest(p_limit, 1) offset greatest(p_offset, 0);
end;
$$;

grant execute on function app_api.current_admin_role() to authenticated;
grant execute on function app_api.admin_list_records(text, text, integer, integer) to authenticated;
grant execute on function app_api.admin_upsert_record(text, uuid, jsonb, text) to authenticated;
grant execute on function app_api.admin_delete_record(text, uuid) to authenticated;
grant execute on function app_api.admin_list_operation_logs(integer, integer) to authenticated;

-- First admin seed example. Run with a real email, then remove or change this line.
-- insert into public.admin_users (email, role, country) values ('admin@example.com', 'admin', 'Australia');

