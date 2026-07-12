-- Pula Trade v2 Schema MVP
-- Removes escrow, focuses on procurement & supplier matching

CREATE TYPE user_role AS ENUM ('admin', 'buyer', 'supplier');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'supplier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active'
);

-- COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    registration_number TEXT,
    tax_number TEXT,
    country TEXT NOT NULL,
    verified_status BOOLEAN DEFAULT false,
    industry TEXT
);

-- SUPPLIER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.supplier_profiles (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    portfolio_url TEXT,
    capabilities JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    risk_score INTEGER DEFAULT 100,
    rating NUMERIC(2,1) DEFAULT 0.0
);

-- PRODUCTS & SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.products_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price_range TEXT
);

-- RFQs (Request for Quotations)
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    budget_range TEXT,
    required_certifications JSONB DEFAULT '[]',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BIDS
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    proposal_text TEXT NOT NULL,
    price NUMERIC,
    status bid_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTRACTS
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES public.bids(id),
    buyer_id UUID REFERENCES public.users(id),
    supplier_id UUID REFERENCES public.companies(id),
    document_url TEXT,
    status TEXT DEFAULT 'draft',
    signed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security) - Basic Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
