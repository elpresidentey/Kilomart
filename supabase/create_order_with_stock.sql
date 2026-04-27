-- Atomic stock enforcement RPC
-- This function locks the listing row and decrements stock atomically
-- Prevents overselling when multiple orders come in simultaneously
CREATE OR REPLACE FUNCTION create_order_with_stock(
  p_listing_id UUID,
  p_quantity_kg DECIMAL(10,2),
  p_buyer_id UUID,
  p_seller_id UUID,
  p_price_per_kg DECIMAL(10,2),
  p_delivery_fee DECIMAL(10,2),
  p_delivery_address JSONB,
  p_payment_method TEXT,
  p_status TEXT DEFAULT 'pending',
  p_provider_reference TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_current_stock DECIMAL(10,2);
  v_order_number TEXT;
  v_subtotal DECIMAL(10,2);
  v_total_amount DECIMAL(10,2);
BEGIN
  IF auth.uid() IS DISTINCT FROM p_buyer_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Lock the listing row for update to prevent concurrent modifications
  SELECT available_quantity INTO v_current_stock
  FROM produce_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  -- Check if sufficient stock exists
  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF v_current_stock < p_quantity_kg THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_current_stock, p_quantity_kg;
  END IF;

  -- Calculate totals
  v_subtotal := p_price_per_kg * p_quantity_kg;
  v_total_amount := v_subtotal + p_delivery_fee;

  -- Generate order number
  v_order_number := 'ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || 
    SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6);

  -- Insert order
  INSERT INTO orders (
    order_number,
    buyer_id,
    seller_id,
    listing_id,
    quantity_kg,
    price_per_kg,
    subtotal,
    delivery_fee,
    total_amount,
    delivery_address,
    status
  )
  VALUES (
    v_order_number,
    p_buyer_id,
    p_seller_id,
    p_listing_id,
    p_quantity_kg,
    p_price_per_kg,
    v_subtotal,
    p_delivery_fee,
    v_total_amount,
    p_delivery_address,
    p_status
  )
  RETURNING id INTO v_order_id;

  -- Decrement stock atomically
  UPDATE produce_listings
  SET available_quantity = available_quantity - p_quantity_kg,
      status = CASE
        WHEN available_quantity - p_quantity_kg <= 0 THEN 'sold_out'
        ELSE status
      END,
      updated_at = NOW()
  WHERE id = p_listing_id;

  -- Create payment record
  INSERT INTO payments (
    order_id,
    payer_id,
    payee_id,
    amount,
    currency,
    payment_method,
    provider,
    provider_reference,
    status
  )
  VALUES (
    v_order_id,
    p_buyer_id,
    p_seller_id,
    v_total_amount,
    'NGN',
    p_payment_method,
    CASE WHEN p_payment_method = 'paystack' THEN 'paystack' ELSE NULL END,
    p_provider_reference,
    CASE WHEN p_payment_method = 'paystack' THEN 'completed' ELSE 'pending' END
  );

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
