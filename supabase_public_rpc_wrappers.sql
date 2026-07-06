-- Public RPC compatibility wrappers.
-- Run after supabase_au_minimal_schema.sql and supabase_permission_notion_extension.sql.
-- These expose only RPC entry points through the default Supabase REST schema.

create or replace function public.get_blog_articles(p_category text default null, p_country text default 'Australia')
returns table (id uuid, content jsonb, created_at timestamptz, updated_at timestamptz, country text)
language sql
security definer
set search_path = public, pg_temp
as $$ select * from app_api.get_blog_articles(p_category, p_country); $$;

create or replace function public.get_disease_article(p_slug text, p_country text default 'Australia')
returns table (id uuid, content jsonb, created_at timestamptz, updated_at timestamptz, country text)
language sql
security definer
set search_path = public, pg_temp
as $$ select * from app_api.get_disease_article(p_slug, p_country); $$;

create or replace function public.submit_assessment(p_payload jsonb, p_country text default 'Australia')
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.submit_assessment(p_payload, p_country); $$;

create or replace function public.get_community_posts(p_country text default 'Australia')
returns table (id uuid, content jsonb, created_at timestamptz, updated_at timestamptz, country text)
language sql
security definer
set search_path = public, pg_temp
as $$ select * from app_api.get_community_posts(p_country); $$;

create or replace function public.create_community_post(p_payload jsonb, p_country text default 'Australia')
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.create_community_post(p_payload, p_country); $$;

create or replace function public.create_community_comment(p_payload jsonb, p_country text default 'Australia')
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.create_community_comment(p_payload, p_country); $$;

create or replace function public.record_interface_event(p_payload jsonb, p_country text default 'Australia')
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.record_interface_event(p_payload, p_country); $$;

create or replace function public.current_admin_user()
returns table (admin_id uuid, email text, role text, permission_scopes text[], country text)
language sql
security definer
set search_path = public, pg_temp
as $$ select * from app_api.current_admin_user(); $$;

create or replace function public.admin_list_records(p_table text, p_country text default 'Australia', p_limit integer default 100, p_offset integer default 0)
returns table (id uuid, content jsonb, created_at timestamptz, updated_at timestamptz, country text)
language sql
security definer
set search_path = public, pg_temp
as $$ select * from app_api.admin_list_records(p_table, p_country, p_limit, p_offset); $$;

create or replace function public.admin_upsert_record(p_table text, p_id uuid, p_content jsonb, p_country text default 'Australia')
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_upsert_record(p_table, p_id, p_content, p_country); $$;

create or replace function public.admin_delete_record(p_table text, p_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_delete_record(p_table, p_id); $$;

create or replace function public.admin_invite_employee(p_name text, p_email text, p_role text, p_permission_scopes text[] default '{}')
returns text
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_invite_employee(p_name, p_email, p_role, p_permission_scopes); $$;

create or replace function public.admin_activate_invitation(p_token text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_activate_invitation(p_token); $$;

create or replace function public.admin_request_permission_change(p_employee_email text, p_requested_role text, p_reason text default null)
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_request_permission_change(p_employee_email, p_requested_role, p_reason); $$;

create or replace function public.admin_approve_permission_change(p_request_id uuid, p_approve boolean)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_approve_permission_change(p_request_id, p_approve); $$;

create or replace function public.admin_register_login_attempt(p_email text, p_ip_address inet, p_success boolean)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_register_login_attempt(p_email, p_ip_address, p_success); $$;

create or replace function public.admin_configure_notion_connection(p_workspace_name text, p_data_source_id text, p_api_key_ciphertext text)
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_configure_notion_connection(p_workspace_name, p_data_source_id, p_api_key_ciphertext); $$;

create or replace function public.admin_enqueue_notion_sync(p_trigger_type text default 'manual')
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_enqueue_notion_sync(p_trigger_type); $$;

create or replace function public.admin_list_notion_review_pool(p_status text default 'pending_review', p_limit integer default 50)
returns table (id uuid, notion_page_id text, notion_url text, content_title text, content_body text, content_tag text[], status text, created_at timestamptz)
language sql
security definer
set search_path = public, pg_temp
as $$ select * from app_api.admin_list_notion_review_pool(p_status, p_limit); $$;

create or replace function public.admin_approve_notion_item(p_item_id uuid, p_target_table text default 'blog_articles')
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_approve_notion_item(p_item_id, p_target_table); $$;

create or replace function public.admin_reject_notion_item(p_item_id uuid, p_reason text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$ select app_api.admin_reject_notion_item(p_item_id, p_reason); $$;

create or replace function public.admin_list_system_events(p_limit integer default 100)
returns table (id uuid, severity text, source text, message text, payload jsonb, created_at timestamptz)
language sql
security definer
set search_path = public, pg_temp
as $$ select * from app_api.admin_list_system_events(p_limit); $$;

grant execute on function public.get_blog_articles(text, text) to anon, authenticated;
grant execute on function public.get_disease_article(text, text) to anon, authenticated;
grant execute on function public.submit_assessment(jsonb, text) to anon, authenticated;
grant execute on function public.get_community_posts(text) to anon, authenticated;
grant execute on function public.create_community_post(jsonb, text) to anon, authenticated;
grant execute on function public.create_community_comment(jsonb, text) to anon, authenticated;
grant execute on function public.record_interface_event(jsonb, text) to anon, authenticated;
grant execute on function public.current_admin_user() to authenticated;
grant execute on function public.admin_list_records(text, text, integer, integer) to authenticated;
grant execute on function public.admin_upsert_record(text, uuid, jsonb, text) to authenticated;
grant execute on function public.admin_delete_record(text, uuid) to authenticated;
grant execute on function public.admin_invite_employee(text, text, text, text[]) to authenticated;
grant execute on function public.admin_activate_invitation(text) to authenticated;
grant execute on function public.admin_request_permission_change(text, text, text) to authenticated;
grant execute on function public.admin_approve_permission_change(uuid, boolean) to authenticated;
grant execute on function public.admin_register_login_attempt(text, inet, boolean) to anon, authenticated;
grant execute on function public.admin_configure_notion_connection(text, text, text) to authenticated;
grant execute on function public.admin_enqueue_notion_sync(text) to authenticated;
grant execute on function public.admin_list_notion_review_pool(text, integer) to authenticated;
grant execute on function public.admin_approve_notion_item(uuid, text) to authenticated;
grant execute on function public.admin_reject_notion_item(uuid, text) to authenticated;
grant execute on function public.admin_list_system_events(integer) to authenticated;
