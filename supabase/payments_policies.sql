-- Run in Supabase SQL editor if `payments` has RLS enabled but no policies (required for app payment rows).
-- Safe to run multiple times (uses IF NOT EXISTS patterns via drop + create).

drop policy if exists "Users can view payments they are party to" on payments;
create policy "Users can view payments they are party to"
  on payments for select
  to authenticated
  using (payer_id = auth.uid() or payee_id = auth.uid());

drop policy if exists "Buyers can create payments for their orders" on payments;
create policy "Buyers can create payments for their orders"
  on payments for insert
  to authenticated
  with check (
    payer_id = auth.uid()
    and exists (
      select 1 from orders o
      where o.id = order_id
      and o.buyer_id = auth.uid()
    )
  );
