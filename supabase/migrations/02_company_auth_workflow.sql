-- TradeGrid Africa: authenticated company tenancy + persistent RFQ-to-shipment workflow
-- Review-branch migration. Apply to Supabase only after review.

alter table if exists public.organizations
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table if exists public.organizations
  add column if not exists region text,
  add column if not exists industry text,
  add column if not exists verification_status text default 'Pending',
  add column if not exists trust_score numeric default 50;

alter table if exists public.users
  add column if not exists phone text;

alter table if exists public.rfqs
  add column if not exists industry text,
  add column if not exists required_quantity numeric,
  add column if not exists unit text,
  add column if not exists delivery_location text;

alter table if exists public.rfq_bids
  add column if not exists price_per_unit numeric,
  add column if not exists total_price numeric,
  add column if not exists estimated_delivery_days integer,
  add column if not exists notes text;

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.rfq_bids(id) on delete cascade,
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  supplier_org_id uuid not null references public.organizations(id) on delete cascade,
  transporter_org_id uuid references public.organizations(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','transit','delivered')),
  route_from text not null,
  route_to text not null,
  gps jsonb,
  transport_mode text not null default 'Road' check (transport_mode in ('Road','Rail','Air')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_bids enable row level security;
alter table public.shipments enable row level security;

drop policy if exists "organizations_select_company" on public.organizations;
create policy "organizations_select_company"
on public.organizations for select
to authenticated
using (
  created_by = (select auth.uid())
  or id in (
    select u.org_id from public.users u where u.id = (select auth.uid())
  )
);

drop policy if exists "organizations_insert_owner" on public.organizations;
create policy "organizations_insert_owner"
on public.organizations for insert
to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists "organizations_update_company" on public.organizations;
create policy "organizations_update_company"
on public.organizations for update
to authenticated
using (
  created_by = (select auth.uid())
  or id in (select u.org_id from public.users u where u.id = (select auth.uid()))
)
with check (
  created_by = (select auth.uid())
  or id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

drop policy if exists "users_select_self" on public.users;
create policy "users_select_self"
on public.users for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
on public.users for insert
to authenticated
with check (
  id = (select auth.uid())
  and exists (
    select 1 from public.organizations o
    where o.id = org_id and o.created_by = (select auth.uid())
  )
);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
on public.users for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "rfqs_company_read" on public.rfqs;
create policy "rfqs_company_read"
on public.rfqs for select
to authenticated
using (
  status = 'open'
  or buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

drop policy if exists "rfqs_company_insert" on public.rfqs;
create policy "rfqs_company_insert"
on public.rfqs for insert
to authenticated
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

drop policy if exists "rfqs_company_update" on public.rfqs;
create policy "rfqs_company_update"
on public.rfqs for update
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
)
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

drop policy if exists "rfq_bids_company_read" on public.rfq_bids;
create policy "rfq_bids_company_read"
on public.rfq_bids for select
to authenticated
using (
  supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or exists (
    select 1 from public.rfqs r
    where r.id = rfq_id
      and r.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  )
);

drop policy if exists "rfq_bids_company_insert" on public.rfq_bids;
create policy "rfq_bids_company_insert"
on public.rfq_bids for insert
to authenticated
with check (
  supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

drop policy if exists "rfq_bids_company_update" on public.rfq_bids;
create policy "rfq_bids_company_update"
on public.rfq_bids for update
to authenticated
using (
  supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or exists (
    select 1 from public.rfqs r
    where r.id = rfq_id
      and r.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  )
)
with check (
  supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or exists (
    select 1 from public.rfqs r
    where r.id = rfq_id
      and r.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  )
);

drop policy if exists "shipments_company_read" on public.shipments;
create policy "shipments_company_read"
on public.shipments for select
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

drop policy if exists "shipments_company_insert" on public.shipments;
create policy "shipments_company_insert"
on public.shipments for insert
to authenticated
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

drop policy if exists "shipments_company_update" on public.shipments;
create policy "shipments_company_update"
on public.shipments for update
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
)
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

grant select, insert, update on public.organizations to authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update on public.rfqs to authenticated;
grant select, insert, update on public.rfq_bids to authenticated;
grant select, insert, update on public.shipments to authenticated;
