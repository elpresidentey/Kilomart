-- Sample warehouses data
INSERT INTO warehouses (name, location, capacity_kg, available_space_kg, status, contact_phone) VALUES
('Central Storage Hub', 'Kano, Kano State', 50000, 32000, 'active', '+234 80 123 4567'),
('Northern Depot', 'Kano, Kano State', 35000, 18000, 'active', '+234 80 234 5678'),
('Eastern Warehouse', 'Enugu, Enugu State', 25000, 15000, 'active', '+234 80 345 6789'),
('Western Distribution Center', 'Ibadan, Oyo State', 40000, 28000, 'active', '+234 80 456 7890'),
('Lagos Logistics Point', 'Lagos, Lagos State', 30000, 10000, 'active', '+234 80 567 8901')
ON CONFLICT DO NOTHING;

-- Sample inventory data
INSERT INTO inventory (warehouse_id, farmer_id, product_name, quantity_kg, quality_grade, status, stored_at, expires_at)
SELECT 
  w.id,
  (SELECT id FROM users WHERE role = 'farmer' LIMIT 1),
  'Plantains',
  2500,
  'A',
  'in_storage',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days'
FROM warehouses w WHERE w.name = 'Central Storage Hub' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inventory (warehouse_id, farmer_id, product_name, quantity_kg, quality_grade, status, stored_at, expires_at)
SELECT 
  w.id,
  (SELECT id FROM users WHERE role = 'farmer' LIMIT 1),
  'Fresh Pepper',
  800,
  'A',
  'in_storage',
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '7 days'
FROM warehouses w WHERE w.name = 'Northern Depot' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inventory (warehouse_id, farmer_id, product_name, quantity_kg, quality_grade, status, stored_at, expires_at)
SELECT 
  w.id,
  (SELECT id FROM users WHERE role = 'farmer' LIMIT 1),
  'Cassava',
  5000,
  'B',
  'in_storage',
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '50 days'
FROM warehouses w WHERE w.name = 'Eastern Warehouse' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inventory (warehouse_id, farmer_id, product_name, quantity_kg, quality_grade, status, stored_at, expires_at)
SELECT 
  w.id,
  (SELECT id FROM users WHERE role = 'farmer' LIMIT 1),
  'Tomatoes',
  1200,
  'A',
  'in_storage',
  CURRENT_DATE - INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '5 days'
FROM warehouses w WHERE w.name = 'Western Distribution Center' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inventory (warehouse_id, farmer_id, product_name, quantity_kg, quality_grade, status, stored_at, expires_at)
SELECT 
  w.id,
  (SELECT id FROM users WHERE role = 'farmer' LIMIT 1),
  'Maize',
  10000,
  'A',
  'in_storage',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '90 days'
FROM warehouses w WHERE w.name = 'Lagos Logistics Point' LIMIT 1
ON CONFLICT DO NOTHING;
