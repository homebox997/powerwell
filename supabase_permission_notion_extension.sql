-- PowerWell permission, invitation, lockout and Notion workflow extension.
-- Run after supabase_au_minimal_schema.sql. This file supersedes the simpler admin extension.

create extension if not exists pgcrypto;
create schema if not exists app_api;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  role text not null check (role in (
    'super_admin',
    'admin',
    'employee_viewer',
    'employee_reviewer',
    'employee_editor'
  )),
  permission_scopes text[] not null default '{}',
  country text not null default 'Australia',
  invited_by uuid references public.admin_users(id),
  activated_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  employee_email text not null,
  role text not null check (role in ('employee_viewer', 'employee_reviewer', 'employee_editor')),
  permission_scopes text[] not null default '{}',
  invitation_token_hash text not null unique,
  invited_by uuid not null references public.admin_users(id),
  status text not null default 'pending' check (status in ('pending', 'activated', 'expired', 'revoked')),
  expires_at timestamptz not null default now() + interval '7 days',
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.permission_change_requests (
  id uuid primary key default gen_random_uuid(),
  employee_email text not null,
  current_role text,
  requested_role text not null,
  reason text,
  requested_by uuid not null references public.admin_users(id),
  reviewed_by uuid references public.admin_users(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requires_super_admin boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_lockouts (
  id uuid primary key default gen_random_uuid(),
  email text,
  ip_address inet not null,
  failed_attempts integer not null default 1,
  locked_until timestamptz,
  last_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (ip_address)
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

create table if not exists public.notion_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_name text not null,
  data_source_id text not null,
  api_key_ciphertext text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'key_invalid')),
  configured_by uuid not null references public.admin_users(id),
  configured_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notion_field_mappings (
  id uuid primary key default gen_random_uuid(),
  notion_property text not null,
  backend_field text not null,
  transform_rule text,
  is_required boolean not null default false,
  created_at timestamptz not null default now(),
  unique (notion_property)
);

insert into public.notion_field_mappings (notion_property, backend_field, transform_rule, is_required)
values
  ('标题', 'content_title', 'title', true),
  ('正文', 'content_body', 'rich_text_or_blocks_to_html', true),
  ('标签', 'content_tag', 'multi_select_to_array', false),
  ('同步状态', 'sync_status', 'status_select', true)
on conflict (notion_property) do update
set backend_field = excluded.backend_field,
    transform_rule = excluded.transform_rule,
    is_required = excluded.is_required;

create table if not exists public.notion_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  trigger_type text not null check (trigger_type in ('scheduled_0800', 'scheduled_2000', 'manual')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'paused')),
  started_at timestamptz,
  finished_at timestamptz,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.notion_review_pool (
  id uuid primary key default gen_random_uuid(),
  notion_page_id text not null unique,
  notion_url text,
  content_title text,
  content_body text,
  content_tag text[] not null default '{}',
  attachment_links jsonb not null default '[]'::jsonb,
  normalized_content jsonb not null default '{}'::jsonb,
  status text not null default 'pending_review' check (status in (
    'pending_review',
    'approved',
    'rejected',
    'sync_failed',
    'notion_comment_pending',
    'synced'
  )),
  target_table text,
  target_record_id uuid,
  rejection_reason text,
  reviewed_by uuid references public.admin_users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_events (
  id uuid primary key default gen_random_uuid(),
  severity text not null check (severity in ('info', 'warning', 'error', 'critical')),
  source text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.permission_change_requests enable row level security;
alter table public.auth_lockouts enable row level security;
alter table public.admin_operation_logs enable row level security;
alter table public.notion_connections enable row level security;
alter table public.notion_field_mappings enable row level security;
alter table public.notion_sync_jobs enable row level security;
alter table public.notion_review_pool enable row level security;
alter table public.system_events enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.admin_invitations from anon, authenticated;
revoke all on table public.permission_change_requests from anon, authenticated;
revoke all on table public.auth_lockouts from anon, authenticated;
revoke all on table public.admin_operation_logs from anon, authenticated;
revoke all on table public.notion_connections from anon, authenticated;
revoke all on table public.notion_field_mappings from anon, authenticated;
revoke all on table public.notion_sync_jobs from anon, authenticated;
revoke all on table public.notion_review_pool from anon, authenticated;
revoke all on table public.system_events from anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_touch_updated_at on public.admin_users;
create trigger admin_users_touch_updated_at
before update on public.admin_users
for each row execute function public.touch_updated_at();

drop trigger if exists notion_connections_touch_updated_at on public.notion_connections;
create trigger notion_connections_touch_updated_at
before update on public.notion_connections
for each row execute function public.touch_updated_at();

drop trigger if exists notion_review_pool_touch_updated_at on public.notion_review_pool;
create trigger notion_review_pool_touch_updated_at
before update on public.notion_review_pool
for each row execute function public.touch_updated_at();

create or replace function app_api.current_admin_user()
returns table (
  admin_id uuid,
  email text,
  role text,
  permission_scopes text[],
  country text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
begin
  v_email := nullif(auth.jwt()->>'email', '');
  if v_email is null then
    raise exception 'Admin authentication required';
  end if;

  return query
  select u.id, u.email, u.role, u.permission_scopes, u.country
  from public.admin_users u
  where u.email = v_email
    and u.is_active = true
    and u.activated_at is not null
  limit 1;

  if not found then
    raise exception 'Admin user is not invited or not active';
  end if;
end;
$$;

create or replace function app_api.require_admin_role(p_allowed text[])
returns public.admin_users
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := nullif(auth.jwt()->>'email', '');
  v_user public.admin_users;
begin
  select *
  into v_user
  from public.admin_users
  where email = v_email
    and is_active = true
    and activated_at is not null
  limit 1;

  if v_user.id is null then
    raise exception 'Admin user is not invited or not active';
  end if;

  if not v_user.role = any(p_allowed) then
    raise exception 'Role % is not allowed for this operation', v_user.role;
  end if;

  return v_user;
end;
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
  v_user public.admin_users;
begin
  select *
  into v_user
  from public.admin_users
  where email = nullif(auth.jwt()->>'email', '')
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
    v_user.email,
    v_user.role,
    p_action,
    p_target_table,
    p_target_id,
    p_country,
    coalesce(p_payload, '{}'::jsonb)
  );
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

create or replace function app_api.admin_invite_employee(
  p_name text,
  p_email text,
  p_role text,
  p_permission_scopes text[] default '{}'
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
  v_token text := encode(gen_random_bytes(24), 'hex');
begin
  v_actor := app_api.require_admin_role(array['super_admin', 'admin']);

  if p_role not in ('employee_viewer', 'employee_reviewer', 'employee_editor') then
    raise exception 'Admins may only invite employee roles';
  end if;

  insert into public.admin_users (name, email, role, permission_scopes, country, invited_by, is_active)
  values (p_name, lower(p_email), p_role, coalesce(p_permission_scopes, '{}'), v_actor.country, v_actor.id, false)
  on conflict (email) do update
  set name = excluded.name,
      role = excluded.role,
      permission_scopes = excluded.permission_scopes,
      invited_by = excluded.invited_by,
      updated_at = now();

  insert into public.admin_invitations (
    employee_name,
    employee_email,
    role,
    permission_scopes,
    invitation_token_hash,
    invited_by
  )
  values (
    p_name,
    lower(p_email),
    p_role,
    coalesce(p_permission_scopes, '{}'),
    encode(digest(v_token, 'sha256'), 'hex'),
    v_actor.id
  );

  perform app_api.write_admin_log('employee.invite', 'admin_invitations', null, v_actor.country, jsonb_build_object('email', lower(p_email), 'role', p_role));
  return v_token;
end;
$$;

create or replace function app_api.admin_activate_invitation(
  p_token text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash text := encode(digest(p_token, 'sha256'), 'hex');
  v_inv public.admin_invitations;
begin
  select *
  into v_inv
  from public.admin_invitations
  where invitation_token_hash = v_hash
    and status = 'pending'
    and expires_at > now()
  limit 1;

  if v_inv.id is null then
    raise exception 'Invitation is invalid or expired';
  end if;

  update public.admin_invitations
  set status = 'activated',
      activated_at = now()
  where id = v_inv.id;

  update public.admin_users
  set is_active = true,
      activated_at = now(),
      role = v_inv.role,
      permission_scopes = v_inv.permission_scopes,
      updated_at = now()
  where email = v_inv.employee_email;
end;
$$;

create or replace function app_api.admin_request_permission_change(
  p_employee_email text,
  p_requested_role text,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
  v_employee public.admin_users;
  v_id uuid;
  v_requires_super boolean;
begin
  v_actor := app_api.require_admin_role(array['super_admin', 'admin']);

  select *
  into v_employee
  from public.admin_users
  where email = lower(p_employee_email)
  limit 1;

  v_requires_super := p_requested_role in ('admin', 'super_admin') or v_actor.role <> 'super_admin';

  insert into public.permission_change_requests (
    employee_email,
    current_role,
    requested_role,
    reason,
    requested_by,
    requires_super_admin
  )
  values (
    lower(p_employee_email),
    v_employee.role,
    p_requested_role,
    p_reason,
    v_actor.id,
    v_requires_super
  )
  returning id into v_id;

  perform app_api.write_admin_log('permission.request', 'permission_change_requests', v_id, v_actor.country, jsonb_build_object('employee_email', lower(p_employee_email), 'requested_role', p_requested_role));
  return v_id;
end;
$$;

create or replace function app_api.admin_approve_permission_change(
  p_request_id uuid,
  p_approve boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
  v_req public.permission_change_requests;
begin
  select *
  into v_req
  from public.permission_change_requests
  where id = p_request_id
  limit 1;

  if v_req.id is null then
    raise exception 'Permission request not found';
  end if;

  if v_req.requires_super_admin then
    v_actor := app_api.require_admin_role(array['super_admin']);
  else
    v_actor := app_api.require_admin_role(array['super_admin', 'admin']);
  end if;

  update public.permission_change_requests
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_by = v_actor.id,
      reviewed_at = now()
  where id = p_request_id;

  if p_approve then
    update public.admin_users
    set role = v_req.requested_role,
        updated_at = now()
    where email = v_req.employee_email;
  end if;

  perform app_api.write_admin_log('permission.review', 'permission_change_requests', p_request_id, v_actor.country, jsonb_build_object('approved', p_approve));
end;
$$;

create or replace function app_api.admin_register_login_attempt(
  p_email text,
  p_ip_address inet,
  p_success boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_is_authorized boolean;
begin
  select exists(
    select 1 from public.admin_users
    where email = lower(p_email)
      and is_active = true
      and activated_at is not null
  )
  into v_is_authorized;

  if p_success and v_is_authorized then
    delete from public.auth_lockouts where ip_address = p_ip_address;
    return;
  end if;

  insert into public.auth_lockouts (email, ip_address, failed_attempts, locked_until, last_attempt_at)
  values (
    lower(p_email),
    p_ip_address,
    1,
    case when not v_is_authorized then now() + interval '15 minutes' else null end,
    now()
  )
  on conflict (ip_address) do update
  set email = excluded.email,
      failed_attempts = public.auth_lockouts.failed_attempts + 1,
      locked_until = case
        when public.auth_lockouts.failed_attempts + 1 >= 3 or not v_is_authorized
          then now() + interval '15 minutes'
        else public.auth_lockouts.locked_until
      end,
      last_attempt_at = now();

  insert into public.system_events (severity, source, message, payload)
  values ('warning', 'auth', 'Unauthorized or failed admin login attempt', jsonb_build_object('email', lower(p_email), 'ip_address', p_ip_address));
end;
$$;

create or replace function app_api.admin_configure_notion_connection(
  p_workspace_name text,
  p_data_source_id text,
  p_api_key_ciphertext text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
  v_id uuid;
begin
  v_actor := app_api.require_admin_role(array['super_admin']);

  insert into public.notion_connections (
    workspace_name,
    data_source_id,
    api_key_ciphertext,
    configured_by
  )
  values (
    p_workspace_name,
    p_data_source_id,
    p_api_key_ciphertext,
    v_actor.id
  )
  returning id into v_id;

  perform app_api.write_admin_log('notion.configure', 'notion_connections', v_id, v_actor.country, jsonb_build_object('workspace_name', p_workspace_name, 'data_source_id', p_data_source_id));
  return v_id;
end;
$$;

create or replace function app_api.admin_enqueue_notion_sync(
  p_trigger_type text default 'manual'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
  v_id uuid;
begin
  v_actor := app_api.require_admin_role(array['super_admin', 'admin']);

  insert into public.notion_sync_jobs (trigger_type)
  values (p_trigger_type)
  returning id into v_id;

  perform app_api.write_admin_log('notion.sync.enqueue', 'notion_sync_jobs', v_id, v_actor.country, jsonb_build_object('trigger_type', p_trigger_type));
  return v_id;
end;
$$;

create or replace function app_api.admin_list_notion_review_pool(
  p_status text default 'pending_review',
  p_limit integer default 50
)
returns table (
  id uuid,
  notion_page_id text,
  notion_url text,
  content_title text,
  content_body text,
  content_tag text[],
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
begin
  v_actor := app_api.require_admin_role(array['super_admin', 'admin', 'employee_reviewer'));

  return query
  select r.id, r.notion_page_id, r.notion_url, r.content_title, r.content_body, r.content_tag, r.status, r.created_at
  from public.notion_review_pool r
  where r.status = p_status
  order by r.created_at desc
  limit greatest(p_limit, 1);
end;
$$;

create or replace function app_api.admin_approve_notion_item(
  p_item_id uuid,
  p_target_table text default 'blog_articles'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
  v_item public.notion_review_pool;
  v_record_id uuid;
begin
  v_actor := app_api.require_admin_role(array['super_admin', 'admin'));

  if not app_api.is_admin_table_allowed(p_target_table) then
    raise exception 'Target table % is not allowed', p_target_table;
  end if;

  select *
  into v_item
  from public.notion_review_pool
  where id = p_item_id
    and status = 'pending_review'
  limit 1;

  if v_item.id is null then
    raise exception 'Review item is not pending';
  end if;

  execute format('insert into public.%I (content, country) values ($1, $2) returning id', p_target_table)
  into v_record_id
  using v_item.normalized_content, 'Australia';

  update public.notion_review_pool
  set status = 'approved',
      target_table = p_target_table,
      target_record_id = v_record_id,
      reviewed_by = v_actor.id,
      reviewed_at = now()
  where id = p_item_id;

  perform app_api.write_admin_log('notion.review.approve', 'notion_review_pool', p_item_id, 'Australia', jsonb_build_object('target_table', p_target_table, 'target_record_id', v_record_id));
  return v_record_id;
end;
$$;

create or replace function app_api.admin_reject_notion_item(
  p_item_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
begin
  v_actor := app_api.require_admin_role(array['super_admin', 'admin'));

  update public.notion_review_pool
  set status = 'notion_comment_pending',
      rejection_reason = p_reason,
      reviewed_by = v_actor.id,
      reviewed_at = now()
  where id = p_item_id
    and status = 'pending_review';

  perform app_api.write_admin_log('notion.review.reject', 'notion_review_pool', p_item_id, 'Australia', jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function app_api.admin_list_system_events(
  p_limit integer default 100
)
returns table (
  id uuid,
  severity text,
  source text,
  message text,
  payload jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor public.admin_users;
begin
  v_actor := app_api.require_admin_role(array['super_admin', 'admin'));

  return query
  select e.id, e.severity, e.source, e.message, e.payload, e.created_at
  from public.system_events e
  order by e.created_at desc
  limit greatest(p_limit, 1);
end;
$$;

grant execute on function app_api.current_admin_user() to authenticated;
grant execute on function app_api.admin_invite_employee(text, text, text, text[]) to authenticated;
grant execute on function app_api.admin_activate_invitation(text) to authenticated;
grant execute on function app_api.admin_request_permission_change(text, text, text) to authenticated;
grant execute on function app_api.admin_approve_permission_change(uuid, boolean) to authenticated;
grant execute on function app_api.admin_register_login_attempt(text, inet, boolean) to anon, authenticated;
grant execute on function app_api.admin_configure_notion_connection(text, text, text) to authenticated;
grant execute on function app_api.admin_enqueue_notion_sync(text) to authenticated;
grant execute on function app_api.admin_list_notion_review_pool(text, integer) to authenticated;
grant execute on function app_api.admin_approve_notion_item(uuid, text) to authenticated;
grant execute on function app_api.admin_reject_notion_item(uuid, text) to authenticated;
grant execute on function app_api.admin_list_system_events(integer) to authenticated;

-- Founder bootstrap example. Run once with the founder email, then keep this file in source control without real emails.
-- insert into public.admin_users (name, email, role, permission_scopes, country, activated_at, is_active)
-- values ('Founder', 'founder@example.com', 'super_admin', array['*'], 'Australia', now(), true);

