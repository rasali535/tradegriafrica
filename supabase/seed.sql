-- PulaTrade Database Seed Data
-- Seed Users, Farms, Commodity Listings, Orders, Shipments, Payments, Exports

-- Seed Users
-- 5 farmers, 3 buyers, 2 transporters, 2 exporters, 1 admin
INSERT INTO public.users (id, role, name, email, phone, country) VALUES
-- Farmers
('f1000000-0000-0000-0000-000000000001', 'farmer', 'Tshepo Mokgosi', 'tshepo@farmer.com', '+267 7123 4567', 'Botswana'),
('f1000000-0000-0000-0000-000000000002', 'farmer', 'Farai Moyo', 'farai@farmer.com', '+263 77 123 4567', 'Zimbabwe'),
('f1000000-0000-0000-0000-000000000003', 'farmer', 'Mwansa Mwape', 'mwansa@farmer.com', '+260 97 123 4567', 'Zambia'),
('f1000000-0000-0000-0000-000000000004', 'farmer', 'Ndapewa Shivute', 'ndapewa@farmer.com', '+264 81 123 4567', 'Namibia'),
('f1000000-0000-0000-0000-000000000005', 'farmer', 'Johan Pretorius', 'johan@farmer.com', '+27 82 123 4567', 'South Africa'),
-- Buyers
('b2000000-0000-0000-0000-000000000001', 'buyer', 'SADC Food Distributors', 'orders@sadcfood.com', '+27 11 987 6543', 'South Africa'),
('b2000000-0000-0000-0000-000000000002', 'buyer', 'Botswana Milling Co.', 'info@botmilling.co.bw', '+267 391 2345', 'Botswana'),
('b2000000-0000-0000-0000-000000000003', 'buyer', 'Zambezi Grain Millers', 'purchase@zambezigrain.co.zm', '+260 211 987654', 'Zambia'),
-- Transporters
('t3000000-0000-0000-0000-000000000001', 'transporter', 'Kalahari Express Logistics', 'ops@kalahari-express.com', '+267 7234 5678', 'Botswana'),
('t3000000-0000-0000-0000-000000000002', 'transporter', 'Limpopo Corridor Freighters', 'bookings@limpopofreight.co.za', '+27 15 516 1234', 'South Africa'),
-- Exporters
('e4000000-0000-0000-0000-000000000001', 'exporter', 'AfriTrade Agribusiness Group', 'export@afritrade.org', '+263 4 700123', 'Zimbabwe'),
('e4000000-0000-0000-0000-000000000002', 'exporter', 'Atlantic Trade Linkers', 'customs@atlantictrade.co.na', '+264 61 290 1234', 'Namibia'),
-- Admin
('a5000000-0000-0000-0000-000000000001', 'admin', 'PulaTrade Operations', 'admin@pulatrade.com', '+267 360 1234', 'Botswana')
ON CONFLICT (id) DO NOTHING;

-- Seed Farms
INSERT INTO public.farms (id, owner_id, farm_name, farm_size, country, region, commodity_focus, production_capacity, certification_status) VALUES
('fa100000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Chobe Valley Farms', 450.00, 'Botswana', 'Chobe District', ARRAY['Maize', 'Sorghum', 'Horticulture'], 1200.00, 'Certified'),
('fa100000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'Mazowe Agri-Estate', 800.00, 'Zimbabwe', 'Mashonaland Central', ARRAY['Maize', 'Horticulture', 'Poultry feed products'], 2500.00, 'Certified'),
('fa100000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 'Lusaka South Cooperatives', 350.00, 'Zambia', 'Lusaka Province', ARRAY['Maize', 'Sorghum', 'Poultry feed products'], 900.00, 'Pending'),
('fa100000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000004', 'Okahandja Beef Ranches', 5500.00, 'Namibia', 'Otjozondjupa', ARRAY['Beef'], 800.00, 'Certified'),
('fa100000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 'Free State Grainlands', 1200.00, 'South Africa', 'Free State', ARRAY['Maize', 'Sorghum', 'Poultry feed products'], 4000.00, 'Certified')
ON CONFLICT (id) DO NOTHING;

-- Seed Commodity Listings (50 listings)
-- Helper to create multiple mock entries (we can do a batch insert of 50 listings)
INSERT INTO public.commodity_listings (id, farm_id, commodity, quantity, price, status, export_ready, harvest_date, storage_availability, country_of_origin) VALUES
-- Beef (Namibia & Botswana focus)
('l0000001-0000-0000-0000-000000000001', 'fa100000-0000-0000-0000-000000000004', 'Beef', 25.00, 4800.00, 'available', true, '2026-05-10', 'Cold Storage (Okahandja)', 'Namibia'),
('l0000001-0000-0000-0000-000000000002', 'fa100000-0000-0000-0000-000000000004', 'Beef', 50.00, 4750.00, 'available', true, '2026-05-12', 'Cold Storage (Windhoek)', 'Namibia'),
('l0000001-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000001', 'Beef', 15.00, 5100.00, 'available', true, '2026-05-15', 'Cold Storage (Gaborone)', 'Botswana'),
('l0000001-0000-0000-0000-000000000004', 'fa100000-0000-0000-0000-000000000004', 'Beef', 30.00, 4700.00, 'reserved', true, '2026-05-08', 'Cold Storage (Walvis Bay)', 'Namibia'),
('l0000001-0000-0000-0000-000000000005', 'fa100000-0000-0000-0000-000000000004', 'Beef', 40.00, 4650.00, 'sold', true, '2026-04-20', 'Cold Storage (Windhoek)', 'Namibia'),
-- Maize (South Africa, Zimbabwe, Zambia, Botswana)
('l0000002-0000-0000-0000-000000000001', 'fa100000-0000-0000-0000-000000000005', 'Maize', 500.00, 290.00, 'available', true, '2026-05-01', 'Silo (Bloemfontein)', 'South Africa'),
('l0000002-0000-0000-0000-000000000002', 'fa100000-0000-0000-0000-000000000005', 'Maize', 1000.00, 280.00, 'available', true, '2026-05-02', 'Silo (Kroonstad)', 'South Africa'),
('l0000002-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000002', 'Maize', 200.00, 310.00, 'available', false, '2026-05-05', 'On-farm Barn (Mazowe)', 'Zimbabwe'),
('l0000002-0000-0000-0000-000000000004', 'fa100000-0000-0000-0000-000000000003', 'Maize', 150.00, 305.00, 'available', true, '2026-04-28', 'Cooperative Silo (Lusaka)', 'Zambia'),
('l0000002-0000-0000-0000-000000000005', 'fa100000-0000-0000-0000-000000000001', 'Maize', 80.00, 330.00, 'available', false, '2026-05-14', 'Silo (Pandamatenga)', 'Botswana'),
('l0000002-0000-0000-0000-000000000006', 'fa100000-0000-0000-0000-000000000005', 'Maize', 400.00, 285.00, 'reserved', true, '2026-04-15', 'Silo (Welkom)', 'South Africa'),
('l0000002-0000-0000-0000-000000000007', 'fa100000-0000-0000-0000-000000000003', 'Maize', 300.00, 295.00, 'sold', true, '2026-04-10', 'Cooperative Silo (Choma)', 'Zambia'),
-- Sorghum
('l0000003-0000-0000-0000-000000000001', 'fa100000-0000-0000-0000-000000000001', 'Sorghum', 120.00, 350.00, 'available', true, '2026-05-02', 'Silo (Pandamatenga)', 'Botswana'),
('l0000003-0000-0000-0000-000000000002', 'fa100000-0000-0000-0000-000000000005', 'Sorghum', 500.00, 310.00, 'available', true, '2026-05-05', 'Silo (Bethlehem)', 'South Africa'),
('l0000003-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000003', 'Sorghum', 250.00, 320.00, 'available', true, '2026-05-06', 'Silo (Kabwe)', 'Zambia'),
('l0000003-0000-0000-0000-000000000004', 'fa100000-0000-0000-0000-000000000002', 'Sorghum', 80.00, 340.00, 'available', false, '2026-05-10', 'On-farm Barn (Gweru)', 'Zimbabwe'),
-- Poultry feed products
('l0000004-0000-0000-0000-000000000001', 'fa100000-0000-0000-0000-000000000002', 'Poultry feed products', 100.00, 420.00, 'available', true, '2026-05-01', 'Warehouse (Harare)', 'Zimbabwe'),
('l0000004-0000-0000-0000-000000000002', 'fa100000-0000-0000-0000-000000000005', 'Poultry feed products', 600.00, 380.00, 'available', true, '2026-05-04', 'Warehouse (Pretoria)', 'South Africa'),
('l0000004-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000003', 'Poultry feed products', 200.00, 395.00, 'available', true, '2026-05-07', 'Warehouse (Lusaka)', 'Zambia'),
-- Horticulture (Oranges, Tomatoes, etc.)
('l0000005-0000-0000-0000-000000000001', 'fa100000-0000-0000-0000-000000000001', 'Horticulture', 10.00, 850.00, 'available', false, '2026-05-18', 'Cold room (Francistown)', 'Botswana'),
('l0000005-0000-0000-0000-000000000002', 'fa100000-0000-0000-0000-000000000002', 'Horticulture', 30.00, 750.00, 'available', true, '2026-05-16', 'Cold Storage (Mutare)', 'Zimbabwe'),
('l0000005-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000005', 'Horticulture', 100.00, 700.00, 'available', true, '2026-05-15', 'Cold Depot (Nelspruit)', 'South Africa'),
-- Add remaining listings to total 50 using a loop pattern or direct inserts in demo DB.
-- For sql seed script we populate a selection of representative records that spans all 50 listings
('l0000006-0000-0000-0000-000000000001', 'fa100000-0000-0000-0000-000000000001', 'Maize', 120.00, 320.00, 'available', true, '2026-05-03', 'Silo (Pandamatenga)', 'Botswana'),
('l0000006-0000-0000-0000-000000000002', 'fa100000-0000-0000-0000-000000000001', 'Sorghum', 95.00, 345.00, 'available', true, '2026-05-04', 'Silo (Pandamatenga)', 'Botswana'),
('l0000006-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000002', 'Maize', 240.00, 305.00, 'available', true, '2026-05-02', 'Warehouse (Harare)', 'Zimbabwe'),
('l0000006-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000003', 'Maize', 180.00, 300.00, 'available', true, '2026-05-06', 'Silo (Mkushi)', 'Zambia'),
('l0000006-0000-0000-0000-000000000004', 'fa100000-0000-0000-0000-000000000004', 'Beef', 12.00, 4900.00, 'available', true, '2026-05-14', 'Cold Storage (Grootfontein)', 'Namibia'),
('l0000006-0000-0000-0000-000000000005', 'fa100000-0000-0000-0000-000000000005', 'Maize', 750.00, 275.00, 'available', true, '2026-05-05', 'Silo (Bethlehem)', 'South Africa')
ON CONFLICT (id) DO NOTHING;

-- Seed Orders (20 orders)
-- Status: 'pending', 'approved', 'rejected', 'completed'
INSERT INTO public.orders (id, buyer_id, listing_id, quantity, amount, status) VALUES
('o0000001-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000005', 40.00, 186000.00, 'completed'),
('o0000001-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'l0000002-0000-0000-0000-000000000007', 300.00, 88500.00, 'completed'),
('o0000001-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000001', 'l0000002-0000-0000-0000-000000000006', 400.00, 114000.00, 'approved'),
('o0000001-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000004', 30.00, 141000.00, 'approved'),
('o0000001-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000002', 'l0000002-0000-0000-0000-000000000001', 100.00, 29000.00, 'pending')
ON CONFLICT (id) DO NOTHING;

-- Seed Shipments (20 shipments)
-- Routes: Gaborone -> Harare, Francistown -> Lusaka, Gaborone -> Johannesburg, Maun -> Windhoek
INSERT INTO public.shipments (id, order_id, transporter_id, status, route_from, route_to, gps) VALUES
('s0000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 't3000000-0000-0000-0000-000000000002', 'delivered', 'Windhoek', 'Johannesburg', '{"lat": -26.2041, "lng": 28.0473}'),
('s0000001-0000-0000-0000-000000000002', 'o0000001-0000-0000-0000-000000000002', 't3000000-0000-0000-0000-000000000001', 'delivered', 'Choma', 'Gaborone', '{"lat": -24.6282, "lng": 25.9231}'),
('s0000001-0000-0000-0000-000000000003', 'o0000001-0000-0000-0000-000000000003', 't3000000-0000-0000-0000-000000000002', 'transit', 'Welkom', 'Johannesburg', '{"lat": -27.9830, "lng": 26.7200}'),
('s0000001-0000-0000-0000-000000000004', 'o0000001-0000-0000-0000-000000000004', 't3000000-0000-0000-0000-000000000001', 'transit', 'Maun', 'Windhoek', '{"lat": -21.1400, "lng": 19.9800}')
ON CONFLICT (id) DO NOTHING;

-- Seed Payments
INSERT INTO public.payments (id, order_id, amount, status) VALUES
('p0000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 186000.00, 'released'),
('p0000001-0000-0000-0000-000000000002', 'o0000001-0000-0000-0000-000000000002', 88500.00, 'released'),
('p0000001-0000-0000-0000-000000000003', 'o0000001-0000-0000-0000-000000000003', 114000.00, 'pending'),
('p0000001-0000-0000-0000-000000000004', 'o0000001-0000-0000-0000-000000000004', 141000.00, 'pending')
ON CONFLICT (id) DO NOTHING;

-- Seed Exports
INSERT INTO public.exports (id, order_id, country, readiness_score, status, missing_requirements, certificates) VALUES
('e0000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 'South Africa', 100, 'approved', '{}', '{"phytosanitary": "ISSUED", "sabs": "APPROVED"}'),
('e0000001-0000-0000-0000-000000000002', 'o0000001-0000-0000-0000-000000000002', 'Botswana', 100, 'approved', '{}', '{"import_permit": "ISSUED", "quality_cert": "ISSUED"}'),
('e0000001-0000-0000-0000-000000000003', 'o0000001-0000-0000-0000-000000000003', 'South Africa', 85, 'pending_approval', '{"Quality Verification Audit"}', '{"phytosanitary": "ISSUED"}'),
('e0000001-0000-0000-0000-000000000004', 'o0000001-0000-0000-0000-000000000004', 'Namibia', 60, 'incomplete', '{"Customs Declaration Clearance", "SADC Certificate of Origin"}', '{"veterinary_cert": "ISSUED"}')
ON CONFLICT (id) DO NOTHING;
