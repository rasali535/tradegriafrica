-- TradeGrid Africa canonical production backend
-- This is the authoritative schema for the dedicated TradeGrid Supabase project.
-- Historical schema.sql/schema_v2.sql are reference-only and are not migration inputs.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('buyer','supplier','transporter','cooperative','exporter','government','bank','admin','both')),
  country text not null,
  registration_number text,
  region text,
  industry text,
  verification_status text not null default 'Pending' check (verification_status in ('Pending','Verified','Rejected')),
  trust_score numeric not null default 50 check (trust_score >= 0 and trust_score <= 100),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('supplier','buyer','transporter','cooperative','exporter','admin','government','bank')),
  email text not null,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_unique on public.users (lower(email));
create index if not exists users_org_id_idx on public.users(org_id);
create index if not exists organizations_created_by_idx on public.organizations(created_by);

create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null default '',
  industry text not null default 'General',
  required_quantity numeric not null default 0 check (required_quantity >= 0),
  unit text not null default 'Units',
  delivery_location text not null default '',
  deadline timestamptz not null,
  status text not null default 'open' check (status in ('open','closed','awarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rfqs_buyer_org_idx on public.rfqs(buyer_org_id);
create index if not exists rfqs_status_deadline_idx on public.rfqs(status, deadline);

create table if not exists public.rfq_bids (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_org_id uuid not null references public.organizations(id) on delete cascade,
  amount numeric not null default 0 check (amount >= 0),
  price_per_unit numeric not null default 0 check (price_per_unit >= 0),
  total_price numeric not null default 0 check (total_price >= 0),
  estimated_delivery_days integer not null default 0 check (estimated_delivery_days >= 0),
  status text not null default 'submitted' check (status in ('submitted','under_review','accepted','rejected','negotiation')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rfq_bids_rfq_idx on public.rfq_bids(rfq_id);
create index if not exists rfq_bids_supplier_org_idx on public.rfq_bids(supplier_org_id);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null unique references public.rfq_bids(id) on delete cascade,
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
create index if not exists shipments_buyer_org_idx on public.shipments(buyer_org_id);
create index if not exists shipments_supplier_org_idx on public.shipments(supplier_org_id);
create index if not exists shipments_transporter_org_idx on public.shipments(transporter_org_id);
create index if not exists shipments_status_idx on public.shipments(status);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null unique references public.rfq_bids(id) on delete cascade,
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  supplier_org_id uuid not null references public.organizations(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','released','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_buyer_org_idx on public.payments(buyer_org_id);
create index if not exists payments_supplier_org_idx on public.payments(supplier_org_id);

create table if not exists public.trade_exports (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null unique references public.rfq_bids(id) on delete cascade,
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  supplier_org_id uuid not null references public.organizations(id) on delete cascade,
  country text not null default 'SADC',
  readiness_score numeric not null default 0 check (readiness_score >= 0 and readiness_score <= 100),
  status text not null default 'incomplete' check (status in ('incomplete','pending_approval','approved','rejected')),
  missing_requirements text[] not null default '{}',
  certificates jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists trade_exports_buyer_org_idx on public.trade_exports(buyer_org_id);
create index if not exists trade_exports_supplier_org_idx on public.trade_exports(supplier_org_id);

create table if not exists public.shipment_documents (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  bid_id uuid not null references public.rfq_bids(id) on delete cascade,
  type text not null check (type in ('invoice','packing_list','certificate_of_origin','contract')),
  title text not null,
  status text not null default 'required' check (status in ('required','generated','verified')),
  url text not null,
  created_at timestamptz not null default now(),
  unique (shipment_id, type)
);
create index if not exists shipment_documents_shipment_idx on public.shipment_documents(shipment_id);
create index if not exists shipment_documents_bid_idx on public.shipment_documents(bid_id);

create table if not exists public.shipment_telemetry (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  gps jsonb not null,
  temperature_c numeric not null,
  humidity_pct numeric not null,
  shock_g numeric not null default 0,
  door_open boolean not null default false,
  alerts text[] not null default '{}'
);
create index if not exists shipment_telemetry_shipment_time_idx on public.shipment_telemetry(shipment_id, recorded_at desc);

create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists event_logs_org_time_idx on public.event_logs(organization_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at before update on public.organizations
for each row execute function private.set_updated_at();
drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
for each row execute function private.set_updated_at();
drop trigger if exists rfqs_set_updated_at on public.rfqs;
create trigger rfqs_set_updated_at before update on public.rfqs
for each row execute function private.set_updated_at();
drop trigger if exists rfq_bids_set_updated_at on public.rfq_bids;
create trigger rfq_bids_set_updated_at before update on public.rfq_bids
for each row execute function private.set_updated_at();
drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at before update on public.shipments
for each row execute function private.set_updated_at();
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments
for each row execute function private.set_updated_at();
drop trigger if exists trade_exports_set_updated_at on public.trade_exports;
create trigger trade_exports_set_updated_at before update on public.trade_exports
for each row execute function private.set_updated_at();

create or replace function private.sync_shipment_execution()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if old.transporter_org_id is null and new.transporter_org_id is not null then
    update public.shipment_documents
      set status = 'verified'
      where shipment_id = new.id;

    update public.trade_exports
      set readiness_score = greatest(readiness_score, 85),
          status = case when status = 'rejected' then status else 'pending_approval' end,
          missing_requirements = array_remove(
            array_remove(
              array_remove(missing_requirements, 'Commercial Invoice'),
              'Packing List'
            ),
            'SADC Certificate of Origin'
          ),
          certificates = certificates || jsonb_build_object(
            'logistics_assignment', 'VERIFIED',
            'document_pack', 'VERIFIED'
          )
      where bid_id = new.bid_id;
  end if;

  if old.status is distinct from 'delivered' and new.status = 'delivered' then
    update public.payments
      set status = 'released'
      where bid_id = new.bid_id and status = 'pending';

    update public.trade_exports
      set readiness_score = 100,
          status = 'approved',
          missing_requirements = '{}',
          certificates = certificates || jsonb_build_object(
            'delivery_confirmation', 'VERIFIED',
            'customs_clearance', 'ISSUED'
          )
      where bid_id = new.bid_id;

    update public.shipment_documents
      set status = 'verified'
      where shipment_id = new.id;
  end if;

  return new;
end;
$$;
revoke all on function private.sync_shipment_execution() from public, anon, authenticated;

drop trigger if exists shipments_sync_execution on public.shipments;
create trigger shipments_sync_execution
after update of transporter_org_id, status on public.shipments
for each row execute function private.sync_shipment_execution();

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_bids enable row level security;
alter table public.shipments enable row level security;
alter table public.payments enable row level security;
alter table public.trade_exports enable row level security;
alter table public.shipment_documents enable row level security;
alter table public.shipment_telemetry enable row level security;
alter table public.event_logs enable row level security;

revoke all on public.organizations, public.users, public.rfqs, public.rfq_bids, public.shipments,
  public.payments, public.trade_exports, public.shipment_documents, public.shipment_telemetry, public.event_logs
from anon, authenticated;

grant select, insert on public.organizations to authenticated;
grant update (name, type, country, registration_number, region, industry) on public.organizations to authenticated;

grant select, insert on public.users to authenticated;
grant update (first_name, last_name, phone) on public.users to authenticated;

grant select, insert on public.rfqs to authenticated;
grant update (status) on public.rfqs to authenticated;

grant select, insert on public.rfq_bids to authenticated;
grant update (status) on public.rfq_bids to authenticated;

grant select, insert on public.shipments to authenticated;
grant update (transporter_org_id, status, gps, updated_at) on public.shipments to authenticated;

grant select, insert on public.payments to authenticated;
grant update (status) on public.payments to authenticated;

grant select, insert on public.trade_exports to authenticated;
grant update (status, readiness_score, missing_requirements, certificates) on public.trade_exports to authenticated;

grant select, insert on public.shipment_documents to authenticated;
grant update (status) on public.shipment_documents to authenticated;

grant select, insert on public.shipment_telemetry to authenticated;
grant select, insert on public.event_logs to authenticated;

create policy "organizations_select_members"
on public.organizations for select
to authenticated
using (
  created_by = (select auth.uid())
  or id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "organizations_insert_owner"
on public.organizations for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy "organizations_update_members"
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

create policy "users_select_self"
on public.users for select
to authenticated
using (id = (select auth.uid()));

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

create policy "users_update_self"
on public.users for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "rfqs_select_marketplace"
on public.rfqs for select
to authenticated
using (
  status = 'open'
  or buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "rfqs_insert_buyer"
on public.rfqs for insert
to authenticated
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "rfqs_update_buyer"
on public.rfqs for update
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
)
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "rfq_bids_select_parties"
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

create policy "rfq_bids_insert_supplier"
on public.rfq_bids for insert
to authenticated
with check (
  supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  and exists (select 1 from public.rfqs r where r.id = rfq_id and r.status = 'open')
);

create policy "rfq_bids_update_parties"
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

create policy "shipments_select_parties"
on public.shipments for select
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "shipments_insert_award_parties"
on public.shipments for insert
to authenticated
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "shipments_update_parties"
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

create policy "payments_select_parties"
on public.payments for select
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "payments_insert_buyer"
on public.payments for insert
to authenticated
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "payments_update_buyer"
on public.payments for update
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
)
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "trade_exports_select_parties"
on public.trade_exports for select
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or exists (
    select 1 from public.shipments s
    where s.bid_id = trade_exports.bid_id
      and s.transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  )
);

create policy "trade_exports_insert_buyer"
on public.trade_exports for insert
to authenticated
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "trade_exports_update_parties"
on public.trade_exports for update
to authenticated
using (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
)
with check (
  buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  or supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "shipment_documents_select_parties"
on public.shipment_documents for select
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and (
        s.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
      )
  )
);

create policy "shipment_documents_insert_buyer"
on public.shipment_documents for insert
to authenticated
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and s.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  )
);

create policy "shipment_documents_update_parties"
on public.shipment_documents for update
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and (
        s.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
      )
  )
)
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and (
        s.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
      )
  )
);

create policy "shipment_telemetry_select_parties"
on public.shipment_telemetry for select
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and (
        s.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
      )
  )
);

create policy "shipment_telemetry_insert_parties"
on public.shipment_telemetry for insert
to authenticated
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and (
        s.buyer_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.supplier_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
        or s.transporter_org_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
      )
  )
);

create policy "event_logs_select_org"
on public.event_logs for select
to authenticated
using (
  organization_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
);

create policy "event_logs_insert_org"
on public.event_logs for insert
to authenticated
with check (
  organization_id in (select u.org_id from public.users u where u.id = (select auth.uid()))
  and actor_user_id = (select auth.uid())
);
