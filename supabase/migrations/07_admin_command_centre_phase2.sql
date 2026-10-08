-- TradeGrid Admin Command Centre Phase 2
-- User access controls, admin cases/disputes, guarded operational intervention and active-user enforcement.

alter table public.users
  add column if not exists account_status text not null default 'active'
  check (account_status in ('active','review','suspended'));

create table if not exists public.admin_cases (
  id uuid primary key default gen_random_uuid(),
  case_type text not null check (case_type in ('dispute','fraud','compliance','payment','shipment','account','other')),
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','in_review','resolved','dismissed')),
  title text not null,
  description text not null default '',
  target_type text not null check (target_type in ('user','organization','rfq','bid','shipment','payment','export','platform')),
  target_id text not null,
  resolution_notes text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists admin_cases_status_created_idx
  on public.admin_cases(status, created_at desc);
create index if not exists admin_cases_target_idx
  on public.admin_cases(target_type, target_id);

alter table public.admin_cases enable row level security;

revoke all on public.admin_cases from anon, authenticated;
grant select, insert on public.admin_cases to authenticated;
grant update (status, severity, description, resolution_notes, assigned_to, updated_at, resolved_at)
  on public.admin_cases to authenticated;

create policy "admin_cases_admin_select"
on public.admin_cases for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "admin_cases_admin_insert"
on public.admin_cases for insert
to authenticated
with check (
  private.is_platform_admin((select auth.uid()))
  and created_by = (select auth.uid())
);

create policy "admin_cases_admin_update"
on public.admin_cases for update
to authenticated
using (private.is_platform_admin((select auth.uid())))
with check (private.is_platform_admin((select auth.uid())));

-- Allow admins to update account status, while blocking users from changing their own sensitive fields.
grant update (account_status) on public.users to authenticated;

create policy "users_update_platform_admin"
on public.users for update
to authenticated
using (private.is_platform_admin((select auth.uid())))
with check (private.is_platform_admin((select auth.uid())));

create or replace function private.enforce_user_sensitive_update()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
begin
  if (
    new.role is distinct from old.role
    or new.org_id is distinct from old.org_id
    or new.account_status is distinct from old.account_status
  ) and not private.is_platform_admin((select auth.uid())) then
    raise exception 'platform admin access required for sensitive user fields';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_user_sensitive_update() from public, anon, authenticated;

drop trigger if exists users_sensitive_update_guard on public.users;
create trigger users_sensitive_update_guard
before update on public.users
for each row execute function private.enforce_user_sensitive_update();

-- Admin status intervention policies. Column grants already constrain what can change.
create policy "rfqs_update_platform_admin"
on public.rfqs for update
to authenticated
using (private.is_platform_admin((select auth.uid())))
with check (private.is_platform_admin((select auth.uid())));

create policy "shipments_update_platform_admin"
on public.shipments for update
to authenticated
using (private.is_platform_admin((select auth.uid())))
with check (private.is_platform_admin((select auth.uid())));

create policy "payments_update_platform_admin"
on public.payments for update
to authenticated
using (private.is_platform_admin((select auth.uid())))
with check (private.is_platform_admin((select auth.uid())));

create policy "trade_exports_update_platform_admin"
on public.trade_exports for update
to authenticated
using (private.is_platform_admin((select auth.uid())))
with check (private.is_platform_admin((select auth.uid())));

-- Active-user gate: suspended/review accounts cannot operate the platform.
create or replace function private.is_active_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = p_user_id
      and u.account_status = 'active'
  );
$$;

revoke all on function private.is_active_user(uuid) from public, anon;
grant execute on function private.is_active_user(uuid) to authenticated;

-- Restrictive policies are ANDed with existing tenant/admin policies.
create policy "organizations_active_user_gate"
on public.organizations as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "users_active_user_gate"
on public.users as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "rfqs_active_user_gate"
on public.rfqs as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "rfq_bids_active_user_gate"
on public.rfq_bids as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "shipments_active_user_gate"
on public.shipments as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "payments_active_user_gate"
on public.payments as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "trade_exports_active_user_gate"
on public.trade_exports as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "shipment_documents_active_user_gate"
on public.shipment_documents as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "shipment_telemetry_active_user_gate"
on public.shipment_telemetry as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "event_logs_active_user_gate"
on public.event_logs as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));

create policy "admin_cases_active_user_gate"
on public.admin_cases as restrictive for all
to authenticated
using (private.is_active_user((select auth.uid())))
with check (private.is_active_user((select auth.uid())));
