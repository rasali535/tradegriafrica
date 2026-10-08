-- TradeGrid Africa production admin portal
-- Adds platform-wide admin read policies and a guarded organization review RPC.

create or replace function private.is_platform_admin(p_user_id uuid)
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
      and u.role = 'admin'
  );
$$;

revoke all on function private.is_platform_admin(uuid) from public, anon, authenticated;
grant execute on function private.is_platform_admin(uuid) to authenticated;

create policy "organizations_select_platform_admin"
on public.organizations for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "users_select_platform_admin"
on public.users for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "rfqs_select_platform_admin"
on public.rfqs for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "rfq_bids_select_platform_admin"
on public.rfq_bids for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "shipments_select_platform_admin"
on public.shipments for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "payments_select_platform_admin"
on public.payments for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "trade_exports_select_platform_admin"
on public.trade_exports for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "shipment_documents_select_platform_admin"
on public.shipment_documents for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "shipment_telemetry_select_platform_admin"
on public.shipment_telemetry for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create policy "event_logs_select_platform_admin"
on public.event_logs for select
to authenticated
using (private.is_platform_admin((select auth.uid())));

create or replace function public.admin_review_organization(
  p_org_id uuid,
  p_status text,
  p_trust_score numeric default null
)
returns public.organizations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_org uuid;
  v_org public.organizations;
begin
  if not private.is_platform_admin((select auth.uid())) then
    raise exception 'platform admin access required';
  end if;

  if p_status not in ('Pending', 'Verified', 'Rejected') then
    raise exception 'invalid verification status';
  end if;

  if p_trust_score is not null and (p_trust_score < 0 or p_trust_score > 100) then
    raise exception 'trust score must be between 0 and 100';
  end if;

  update public.organizations
  set
    verification_status = p_status,
    trust_score = coalesce(p_trust_score, trust_score),
    updated_at = now()
  where id = p_org_id
  returning * into v_org;

  if v_org.id is null then
    raise exception 'organization not found';
  end if;

  select u.org_id into v_actor_org
  from public.users u
  where u.id = (select auth.uid());

  insert into public.event_logs (
    organization_id,
    actor_user_id,
    event,
    payload
  ) values (
    v_actor_org,
    (select auth.uid()),
    'admin.organization_reviewed',
    jsonb_build_object(
      'organization_id', v_org.id,
      'organization_name', v_org.name,
      'verification_status', v_org.verification_status,
      'trust_score', v_org.trust_score
    )
  );

  return v_org;
end;
$$;

revoke all on function public.admin_review_organization(uuid, text, numeric) from public, anon;
grant execute on function public.admin_review_organization(uuid, text, numeric) to authenticated;
