-- Supabase Schema for Pula Trade v2

-- 1. Organizations (Tenants)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buyer', 'supplier', 'both')),
    country TEXT NOT NULL,
    registration_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    org_id UUID REFERENCES public.organizations(id),
    role TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Supplier Profiles
CREATE TABLE public.supplier_profiles (
    org_id UUID PRIMARY KEY REFERENCES public.organizations(id),
    description TEXT,
    industries TEXT[],
    trust_score NUMERIC DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verifications
CREATE TABLE public.verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id),
    document_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verified_by UUID REFERENCES public.users(id),
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RFQs (Request for Quotations)
CREATE TABLE public.rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_org_id UUID REFERENCES public.organizations(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'awarded')) DEFAULT 'open',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RFQ Bids
CREATE TABLE public.rfq_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES public.rfqs(id),
    supplier_org_id UUID REFERENCES public.organizations(id),
    amount NUMERIC NOT NULL,
    proposal_document_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected')) DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Contracts
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES public.rfqs(id),
    buyer_org_id UUID REFERENCES public.organizations(id),
    supplier_org_id UUID REFERENCES public.organizations(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'signed', 'active', 'completed')) DEFAULT 'draft',
    nda_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Workflows Milestones
CREATE TABLE public.workflows_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Basic examples)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

-- Allow read access to public profiles
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.supplier_profiles FOR SELECT USING (true);

-- Allow users to view their own org's RFQs
CREATE POLICY "Users can view their organization's RFQs" 
ON public.rfqs FOR SELECT USING (
  buyer_org_id IN (
    SELECT org_id FROM public.users WHERE id = auth.uid()
  )
);
