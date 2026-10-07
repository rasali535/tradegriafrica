-- TradeGrid Africa production backend validation
-- Run after 03_production_backend.sql has been applied.

with expected_tables(name) as (
  values
    ('organizations'),
    ('users'),
    ('rfqs'),
    ('rfq_bids'),
    ('shipments'),
    ('payments'),
    ('trade_exports'),
    ('shipment_documents'),
    ('shipment_telemetry'),
    ('event_logs')
),
present_tables as (
  select table_name as name
  from information_schema.tables
  where table_schema = 'public'
)
select
  e.name as table_name,
  (p.name is not null) as exists
from expected_tables e
left join present_tables p using (name)
order by e.name;

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'organizations','users','rfqs','rfq_bids','shipments',
    'payments','trade_exports','shipment_documents','shipment_telemetry','event_logs'
  )
order by c.relname;

select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'organizations','users','rfqs','rfq_bids','shipments',
    'payments','trade_exports','shipment_documents','shipment_telemetry','event_logs'
  )
order by tablename, cmd, policyname;

select
  routine_schema,
  routine_name,
  security_type
from information_schema.routines
where routine_schema in ('public','private')
  and routine_name in ('set_updated_at','sync_shipment_execution')
order by routine_schema, routine_name;

select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon','authenticated')
  and table_name in (
    'organizations','users','rfqs','rfq_bids','shipments',
    'payments','trade_exports','shipment_documents','shipment_telemetry','event_logs'
  )
order by table_name, grantee, privilege_type;
