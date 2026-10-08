-- Harden TradeGrid admin organization review path
-- Use SECURITY INVOKER + RLS instead of an exposed SECURITY DEFINER RPC.

grant update (verification_status, trust_score, updated_at)
on public.organizations to authenticated;

create policy "organizations_update_platform_admin"
on public.organizations for update
to authenticated
using (private.is_platform_admin((select auth.uid())))
with check (private.is_platform_admin((select auth.uid())));

create or replace function public.admin_review_organization(
  p_org_id uuid,
  p_status text,
  p_trust_score numeric default null
)
returns public.organizations
language plpgsql
security invoker
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
