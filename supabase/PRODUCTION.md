# TradeGrid Production Backend Rollout

This branch defines the production backend contract for a **dedicated TradeGrid Supabase project**. Do not point TradeGrid at the existing shared Ras Ali Labs production projects.

## Canonical database

Apply only the migrations under `supabase/migrations/`. The historical `schema.sql` and `schema_v2.sql` files are retained for reference and are not authoritative.

The canonical schema is `03_production_backend.sql`, covering:

- organizations and authenticated user profiles
- RFQs and bids
- shipments
- payments
- export/compliance packs
- shipment-linked documents
- telemetry history
- execution event logs
- tenant RLS and least-privilege grants
- delivery/logistics state synchronization

Every exposed table has RLS enabled. The browser uses only the Supabase publishable key; never expose a secret/service-role key.

## Required environment variables

Use:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains a temporary fallback only.

Because these are `NEXT_PUBLIC_` values, they must exist **during the Next.js build**, not only when the container starts.

## Production sequence

1. Create a dedicated Supabase project for TradeGrid.
2. Apply `supabase/migrations/03_production_backend.sql`.
3. Run `supabase/validation/production_backend.sql`.
4. Run Supabase security and performance advisors and clear material findings.
5. Configure Auth Site URL and allowed redirect URLs for the live TradeGrid domain.
6. Put the project URL and publishable key into Hostinger build environment variables.
7. Rebuild/redeploy TradeGrid.
8. Create two real test companies with separate users.
9. Validate cross-company isolation:
   - buyer can create an RFQ
   - supplier can see open RFQ
   - supplier can submit bid
   - unrelated supplier cannot see another supplier's bid
   - buyer can award the bid
   - shipment/payment/export/documents are created
   - transporter assignment advances readiness
   - telemetry records are visible only to shipment parties
   - delivery releases payment and completes export readiness
10. Re-run advisors and CI after final wiring.

## Security boundary

Authorization comes from database membership (`public.users.org_id`) and RLS. User-editable Auth metadata is never used for tenant authorization.

Supabase secret/service-role keys must remain server-side only and are not required by the current browser application.
