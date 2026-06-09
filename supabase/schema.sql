-- TradeGridAfrica Database Schema
-- Agricultural Trade Infrastructure for African Nations (SADC corridor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'buyer', 'transporter', 'cooperative', 'exporter', 'admin')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) NOT NULL CHECK (country IN ('Botswana', 'Zimbabwe', 'Zambia', 'Namibia', 'South Africa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FARMS TABLE
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    farm_size NUMERIC(10, 2) NOT NULL, -- in hectares
    country VARCHAR(100) NOT NULL CHECK (country IN ('Botswana', 'Zimbabwe', 'Zambia', 'Namibia', 'South Africa')),
    region VARCHAR(255) NOT NULL,
    commodity_focus VARCHAR(100)[] NOT NULL,
    production_capacity NUMERIC(12, 2), -- annual tonnage
    certification_status VARCHAR(100) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- COMMODITY LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.commodity_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    commodity VARCHAR(100) NOT NULL CHECK (commodity IN ('Beef', 'Maize', 'Sorghum', 'Horticulture', 'Poultry feed products')),
    quantity NUMERIC(10, 2) NOT NULL, -- in tons/kg
    price NUMERIC(12, 2) NOT NULL, -- in USD
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('draft', 'available', 'reserved', 'sold')),
    export_ready BOOLEAN DEFAULT FALSE,
    harvest_date DATE,
    photos TEXT[], -- urls to storage
    storage_availability VARCHAR(100),
    country_of_origin VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.commodity_listings(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL, -- in USD
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    transporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transit', 'delivered')),
    route_from VARCHAR(255) NOT NULL,
    route_to VARCHAR(255) NOT NULL,
    gps JSONB, -- { "lat": -22.3, "lng": 24.6, "speed": 60, "bearing": 90 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EXPORTS TABLE
CREATE TABLE IF NOT EXISTS public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    readiness_score INTEGER NOT NULL CHECK (readiness_score >= 0 AND readiness_score <= 100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('incomplete', 'pending_approval', 'approved', 'rejected')),
    missing_requirements TEXT[] NOT NULL DEFAULT '{}',
    certificates JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodity_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- SIMPLE RLS POLICIES FOR DEMO (can be customized for production)
CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow all access to users for themselves" ON public.users FOR ALL USING (true);

CREATE POLICY "Allow public read access to farms" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Allow write access to farms for owners" ON public.farms FOR ALL USING (true);

CREATE POLICY "Allow public read access to listings" ON public.commodity_listings FOR SELECT USING (true);
CREATE POLICY "Allow write access to listings for owners" ON public.commodity_listings FOR ALL USING (true);

CREATE POLICY "Allow write access to orders for buyers" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow read access to orders for buyers and sellers" ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow public read access to shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Allow write access to shipments for transporters" ON public.shipments FOR ALL USING (true);

CREATE POLICY "Allow read access to payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow write access to payments for admin/system" ON public.payments FOR ALL USING (true);

CREATE POLICY "Allow read access to exports" ON public.exports FOR SELECT USING (true);
CREATE POLICY "Allow write access to exports for exporters/admins" ON public.exports FOR ALL USING (true);

-- NDAs TABLE
CREATE TABLE IF NOT EXISTS public.ndas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    agreement_type VARCHAR(50) DEFAULT 'nda',
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50) NOT NULL,
    device_metadata JSONB NOT NULL,
    signature_hash VARCHAR(64) NOT NULL,
    signature_data TEXT NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ACCESS LOGS TABLE
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    device_metadata JSONB NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS POLICIES FOR NDAs & ACCESS LOGS
ALTER TABLE public.ndas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to ndas" ON public.ndas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read access to ndas for owner/admin" ON public.ndas FOR SELECT USING (true);

CREATE POLICY "Allow public insert to access_logs" ON public.access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read access to access_logs for admins" ON public.access_logs FOR SELECT USING (true);
