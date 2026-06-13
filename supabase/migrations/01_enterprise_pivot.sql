-- TradeGrid Africa - Enterprise Pivot Schema Migration
-- Adds multi-sector categories, verifications, tenders, and analytics.

-- INDUSTRIES TABLE
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- SEED INDUSTRIES
INSERT INTO public.industries (name, description) VALUES
    ('Agriculture', 'Agricultural products, farming equipment, and produce.'),
    ('Mining', 'Mineral extraction, mining machinery, and refined resources.'),
    ('Construction', 'Building materials, heavy equipment, and infrastructure services.'),
    ('Logistics', 'Freight forwarding, warehousing, and transportation services.'),
    ('Manufacturing', 'Industrial goods, processing plants, and consumer goods.'),
    ('ICT & Technology', 'Software, hardware, telecommunications, and digital services.'),
    ('Healthcare', 'Medical devices, pharmaceuticals, and health infrastructure.'),
    ('Government', 'Public sector procurement and municipal sourcing.')
ON CONFLICT (name) DO NOTHING;

-- SUPPLIER VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.supplier_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    tax_doc_url TEXT,
    reg_doc_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID REFERENCES public.users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPPLIER CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.supplier_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    cert_name TEXT NOT NULL,
    cert_body TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    document_url TEXT
);

-- TENDERS (Public / Private)
CREATE TABLE IF NOT EXISTS public.tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    visibility TEXT DEFAULT 'public', -- public, private, invited
    budget_range TEXT,
    industry_id UUID REFERENCES public.industries(id),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQ MATCHES (AI Recommendations)
CREATE TABLE IF NOT EXISTS public.rfq_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2), -- e.g. 98.50
    status TEXT DEFAULT 'recommended', -- recommended, invited, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPPLIER SCORES (AI Generated)
CREATE TABLE IF NOT EXISTS public.supplier_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    performance_kpi NUMERIC(5,2) DEFAULT 0.0,
    reliability_kpi NUMERIC(5,2) DEFAULT 0.0,
    financial_health_score NUMERIC(5,2) DEFAULT 0.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROCUREMENT ANALYTICS
CREATE TABLE IF NOT EXISTS public.procurement_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    total_spend NUMERIC DEFAULT 0.0,
    active_suppliers INTEGER DEFAULT 0,
    avg_discount_secured NUMERIC(5,2) DEFAULT 0.0,
    month_year TEXT NOT NULL -- e.g., '2026-06'
);

-- ENABLE RLS
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_analytics ENABLE ROW LEVEL SECURITY;
