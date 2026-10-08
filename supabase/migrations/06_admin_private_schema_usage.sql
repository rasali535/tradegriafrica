-- Allow authenticated policies/RPCs to call the private admin predicate.
grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin(uuid) to authenticated;
