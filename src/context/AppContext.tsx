"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Database Entity Types
export interface User {
  id: string;
  role: 'farmer' | 'buyer' | 'transporter' | 'cooperative' | 'exporter' | 'admin' | 'government' | 'bank';
  name: string;
  email: string;
  phone: string;
  country: 'Botswana' | 'Zimbabwe' | 'Zambia' | 'Namibia' | 'South Africa' | 'Mozambique';
  kyc_status?: 'pending' | 'approved' | 'rejected';
  document_name?: string;
  document_ref?: string;
  document_url?: string;
}

export interface Cooperative {
  id: string;
  name: string;
  members: string[]; // User IDs
  total_output: number; // in tons
  country: string;
}

export interface FinancingRequest {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  risk_score: number; // 0 - 100
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  role: string;
  created_at: string;
}

export interface EventLog {
  id: string;
  event: string;
  payload: any;
  created_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  company_name: string;
  industry: string;
  country: string;
  region: string;
  registration_number: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  trust_score: number;
}

export interface Rfq {
  id: string;
  buyer_company_id: string;
  title: string;
  description: string;
  industry: string;
  required_quantity: number;
  unit: string;
  delivery_location: string;
  deadline: string;
  status: 'open' | 'closed' | 'awarded';
  created_at: string;
}

export interface Bid {
  id: string;
  rfq_id: string;
  supplier_company_id: string;
  price_per_unit: number;
  total_price: number;
  estimated_delivery_days: number;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiation';
  notes: string;
  created_at: string;
}

export interface GPSData {
  lat: number;
  lng: number;
  speed?: number;
  bearing?: number;
}

export interface Shipment {
  id: string;
  bid_id: string;
  transporter_id: string | null;
  status: 'pending' | 'transit' | 'delivered';
  route_from: string;
  route_to: string;
  gps: GPSData | null;
  transport_mode: 'Road' | 'Rail' | 'Air';
  created_at: string;
}

export interface Payment {
  id: string;
  bid_id: string;
  amount: number;
  status: 'pending' | 'released' | 'refunded';
  created_at: string;
}

export interface Export {
  id: string;
  bid_id: string;
  country: string;
  readiness_score: number;
  status: 'incomplete' | 'pending_approval' | 'approved' | 'rejected';
  missing_requirements: string[];
  certificates: Record<string, string>;
  created_at: string;
}

export interface TradeAgreement {
  id: string;
  agreement_name: string;
  origin_country: string;
  destination_country: string;
  commodity: string;
  documents_required: string[];
  tariff_type: string;
  certificate_required: boolean;
  permit_required: boolean;
  veterinary_required: boolean;
  phytosanitary_required: boolean;
  local_content_min_pct?: number;
  customs_notes: string;
}

export interface TradeCorridor {
  id: string;
  name: string;
  origin: string;
  destination: string;
  border_checkpoint: string;
  queue_delay_hours: number;
  transit_efficiency: number;
  active_transport_lines: number;
  biosecurity_status: 'Active' | 'Standard' | 'Alert';
}

interface AppContextType {
  users: User[];
  companies: Company[];
  rfqs: Rfq[];
  bids: Bid[];
  shipments: Shipment[];
  payments: Payment[];
  exports: Export[];
  cooperatives: Cooperative[];
  financingRequests: FinancingRequest[];
  webhooks: Webhook[];
  apiKeys: ApiKey[];
  eventLogs: EventLog[];
  tradeAgreements: TradeAgreement[];
  tradeCorridors: TradeCorridor[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  // Actions
  createRfq: (rfq: Omit<Rfq, 'id' | 'created_at'>) => Rfq;
  updateRfqStatus: (id: string, status: Rfq['status']) => void;
  submitBid: (bid: Omit<Bid, 'id' | 'created_at'>) => Bid;
  updateBidStatus: (bidId: string, status: Bid['status']) => void;
  assignTransporter: (shipmentId: string, transporterId: string) => void;
  updateShipmentStatus: (shipmentId: string, status: Shipment['status'], gps?: GPSData) => void;
  updateExportStatus: (exportId: string, status: Export['status'], readinessScore?: number, missingReqs?: string[]) => void;
  releasePayment: (paymentId: string) => void;
  resetAllData: () => void;
  // Step 5 Actions
  addFinancingRequest: (req: Omit<FinancingRequest, 'id' | 'created_at'>) => FinancingRequest;
  updateFinancingRequest: (id: string, status: FinancingRequest['status']) => void;
  registerWebhook: (webhook: Omit<Webhook, 'id' | 'created_at'>) => Webhook;
  deleteWebhook: (id: string) => void;
  generateApiKey: (name: string, role: string) => ApiKey;
  revokeApiKey: (id: string) => void;
  triggerEvent: (event: string, payload: any) => void;
  addCompany: (company: Omit<Company, 'id'>) => Company;
  registerUser: (user: Omit<User, 'id'>) => User;
  updateUserKycStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
  updateTradeCorridor: (id: string, updates: Partial<TradeCorridor>) => void;
  currency: string;
  setCurrency: (c: string) => void;
  formatCurrency: (amountInUsd: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seed Data for local testing and investor demos
const SEED_USERS: User[] = [
  { id: 'f1000000-0000-0000-0000-000000000001', role: 'farmer', name: 'Tshepo Mokgosi', email: 'tshepo@farmer.com', phone: '+267 7123 4567', country: 'Botswana', kyc_status: 'approved', document_name: 'Botswana Smallholder Agri-Permit', document_ref: 'BW-AGR-4019', document_url: 'tshepo_agri_permit.pdf' },
  { id: 'f1000000-0000-0000-0000-000000000002', role: 'farmer', name: 'Farai Moyo', email: 'farai@farmer.com', phone: '+263 77 123 4567', country: 'Zimbabwe', kyc_status: 'pending', document_name: 'Zimbabwe Biosecurity & Land Certificate', document_ref: 'ZW-BIO-8821', document_url: 'farai_moyo_land_cert.pdf' },
  { id: 'f1000000-0000-0000-0000-000000000003', role: 'farmer', name: 'Mwansa Mwape', email: 'mwansa@farmer.com', phone: '+260 97 123 4567', country: 'Zambia', kyc_status: 'approved', document_name: 'Zambia Cooperative Produce Code', document_ref: 'ZM-COOP-1029', document_url: 'mwansa_coop_code.pdf' },
  { id: 'f1000000-0000-0000-0000-000000000004', role: 'farmer', name: 'Ndapewa Shivute', email: 'ndapewa@farmer.com', phone: '+264 81 123 4567', country: 'Namibia', kyc_status: 'pending', document_name: 'Namibia Livestock Brand Registry', document_ref: 'NM-LBR-8832', document_url: 'ndapewa_livestock_brand.pdf' },
  { id: 'f1000000-0000-0000-0000-000000000005', role: 'farmer', name: 'Johan Pretorius', email: 'johan@farmer.com', phone: '+27 82 123 4567', country: 'South Africa', kyc_status: 'approved', document_name: 'SA Grain Export License', document_ref: 'ZA-GEL-9821', document_url: 'johan_grain_license.pdf' },
  
  { id: 'b2000000-0000-0000-0000-000000000001', role: 'buyer', name: 'SADC Food Distributors', email: 'orders@sadcfood.com', phone: '+27 11 987 6543', country: 'South Africa', kyc_status: 'approved', document_name: 'SADC Corporate Import Passport', document_ref: 'SADC-BUY-9021', document_url: 'sadc_food_dist_passport.pdf' },
  { id: 'b2000000-0000-0000-0000-000000000002', role: 'buyer', name: 'Botswana Milling Co.', email: 'info@botmilling.co.bw', phone: '+267 391 2345', country: 'Botswana', kyc_status: 'approved', document_name: 'BW Agribusiness Buying License', document_ref: 'BW-ABL-2291', document_url: 'bot_milling_license.pdf' },
  { id: 'b2000000-0000-0000-0000-000000000003', role: 'buyer', name: 'Zambezi Grain Millers', email: 'purchase@zambezigrain.co.zm', phone: '+260 211 987654', country: 'Zambia', kyc_status: 'pending', document_name: 'Zambia Import/Export License', document_ref: 'ZM-IEL-4481', document_url: 'zambezi_grain_license.pdf' },
  { id: 'b2000000-0000-0000-0000-000000000004', role: 'buyer', name: 'Namibia Agronomic Distributors', email: 'procure@nad.com.na', phone: '+264 61 300 4567', country: 'Namibia', kyc_status: 'approved', document_name: 'Namibia Agronomic Board Registry', document_ref: 'NM-NAB-7719', document_url: 'nam_agronomic_registry.pdf' },
  
  { id: 't3000000-0000-0000-0000-000000000001', role: 'transporter', name: 'Kalahari Express Logistics', email: 'ops@kalahari-express.com', phone: '+267 7234 5678', country: 'Botswana', kyc_status: 'approved', document_name: 'SADC Multi-corridor Carrier Permit', document_ref: 'SADC-LOG-9021', document_url: 'kalahari_express_permit.pdf' },
  { id: 't3000000-0000-0000-0000-000000000002', role: 'transporter', name: 'Limpopo Corridor Freighters', email: 'bookings@limpopofreight.co.za', phone: '+27 15 516 1234', country: 'South Africa', kyc_status: 'pending', document_name: 'Cross-Border Carrier Permit', document_ref: 'RSA-CBP-3392', document_url: 'limpopo_corridor_freight.pdf' },
  { id: 't3000000-0000-0000-0000-000000000003', role: 'transporter', name: 'Trans-Kalahari Logistics', email: 'ops@transkalahari.com.na', phone: '+264 81 222 3333', country: 'Namibia', kyc_status: 'approved', document_name: 'Namibia Cross-Border Logistics License', document_ref: 'NM-CBL-4432', document_url: 'trans_kalahari_license.pdf' },
  
  { id: 'e4000000-0000-0000-0000-000000000001', role: 'exporter', name: 'AfriTrade Agribusiness Group', email: 'export@afritrade.org', phone: '+263 4 700123', country: 'Zimbabwe', kyc_status: 'approved', document_name: 'AfriTrade Customs Passport', document_ref: 'AFR-CP-1102', document_url: 'afritrade_customs.pdf' },
  { id: 'e4000000-0000-0000-0000-000000000002', role: 'exporter', name: 'Atlantic Trade Linkers', email: 'customs@atlantictrade.co.na', phone: '+264 61 290 1234', country: 'Namibia', kyc_status: 'approved', document_name: 'Atlantic Port clearance Permit', document_ref: 'ATL-PCP-0922', document_url: 'atlantic_clearance.pdf' },
  
  { id: 'g6000000-0000-0000-0000-000000000001', role: 'government', name: 'Ministry of Agriculture (Botswana)', email: 'policy@agric.gov.bw', phone: '+267 368 9000', country: 'Botswana', kyc_status: 'approved' },
  { id: 'g6000000-0000-0000-0000-000000000002', role: 'government', name: 'Ministry of Agriculture (Zambia)', email: 'export@mfl.gov.zm', phone: '+260 211 251379', country: 'Zambia', kyc_status: 'approved' },
  { id: 'g6000000-0000-0000-0000-000000000003', role: 'government', name: 'Ministry of Agriculture, Water & Land Reform (Namibia)', email: 'trade@mawlr.gov.na', phone: '+264 61 208 7111', country: 'Namibia', kyc_status: 'approved' },
  
  { id: 'k7000000-0000-0000-0000-000000000001', role: 'bank', name: 'Standard Bank SADC Trade', email: 'structured.trade@standardbank.co.za', phone: '+27 11 636 9111', country: 'South Africa', kyc_status: 'approved' },
  { id: 'k7000000-0000-0000-0000-000000000002', role: 'bank', name: 'BancABC Trade Finance', email: 'trade.desk@bancabc.co.bw', phone: '+267 367 4300', country: 'Botswana', kyc_status: 'approved' },
  { id: 'k7000000-0000-0000-0000-000000000003', role: 'bank', name: 'Bank Windhoek Trade Finance', email: 'trade.desk@bankwindhoek.com.na', phone: '+264 61 299 1200', country: 'Namibia', kyc_status: 'approved' },
  
  { id: 'a5000000-0000-0000-0000-000000000001', role: 'admin', name: 'TradeGridAfrica Operations', email: 'admin@tradegridafrica.com', phone: '+267 360 1234', country: 'Botswana', kyc_status: 'approved' }
];

const SEED_COMPANIES: Company[] = [
  { id: 'co100000-0000-0000-0000-000000000001', owner_id: 'f1000000-0000-0000-0000-000000000001', company_name: 'Chobe Valley Industrial', industry: 'Manufacturing', country: 'Botswana', region: 'Chobe District', registration_number: 'BW-10293', verification_status: 'Verified', trust_score: 92 },
  { id: 'co100000-0000-0000-0000-000000000002', owner_id: 'f1000000-0000-0000-0000-000000000002', company_name: 'Mazowe Mining Co.', industry: 'Mining', country: 'Zimbabwe', region: 'Mashonaland Central', registration_number: 'ZW-92812', verification_status: 'Verified', trust_score: 88 },
  { id: 'co100000-0000-0000-0000-000000000003', owner_id: 'f1000000-0000-0000-0000-000000000003', company_name: 'Lusaka South Tech', industry: 'ICT', country: 'Zambia', region: 'Lusaka Province', registration_number: 'ZM-22910', verification_status: 'Pending', trust_score: 45 },
  { id: 'co100000-0000-0000-0000-000000000004', owner_id: 'f1000000-0000-0000-0000-000000000004', company_name: 'Okahandja Logistics', industry: 'Logistics', country: 'Namibia', region: 'Otjozondjupa', registration_number: 'NM-38192', verification_status: 'Verified', trust_score: 95 },
  { id: 'co100000-0000-0000-0000-000000000005', owner_id: 'f1000000-0000-0000-0000-000000000005', company_name: 'Free State Construction', industry: 'Construction', country: 'South Africa', region: 'Free State', registration_number: 'ZA-99120', verification_status: 'Verified', trust_score: 91 }
];

const SEED_COOPERATIVES: Cooperative[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Limpopo Agricultural Cooperative', members: ['f1000000-0000-0000-0000-000000000005'], total_output: 1200, country: 'South Africa' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Chobe Valley Organic Cooperative', members: ['f1000000-0000-0000-0000-000000000001'], total_output: 850, country: 'Botswana' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Mazowe Smallholder Pool', members: ['f1000000-0000-0000-0000-000000000002'], total_output: 600, country: 'Zimbabwe' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Kalahari Agronomic Coop', members: ['f1000000-0000-0000-0000-000000000004'], total_output: 750, country: 'Namibia' }
];

const SEED_FINANCING_REQUESTS: FinancingRequest[] = [
  { id: 'req00000-0000-0000-0000-000000000001', user_id: 'f1000000-0000-0000-0000-000000000001', amount: 15000, purpose: 'Purchase high-grade feed & fertilizer for next sowing cycle', risk_score: 18, status: 'pending', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'req00000-0000-0000-0000-000000000002', user_id: 'f1000000-0000-0000-0000-000000000002', amount: 35000, purpose: 'Borehole drilling & drip irrigation setup', risk_score: 42, status: 'approved', created_at: new Date(Date.now() - 3600000 * 72).toISOString() },
  { id: 'req00000-0000-0000-0000-000000000003', user_id: 'f1000000-0000-0000-0000-000000000003', amount: 8000, purpose: 'Pre-export logistics fees and phytosanitary audit costs', risk_score: 12, status: 'pending', created_at: new Date(Date.now() - 3600000 * 6).toISOString() },
];

const SEED_WEBHOOKS: Webhook[] = [
  { id: 'w1000000-0000-0000-0000-000000000001', url: 'https://sadc-trade.free.beeceptor.com/webhook', events: ['rfq.created', 'bid.submitted'], active: true, created_at: new Date().toISOString() }
];

const SEED_API_KEYS: ApiKey[] = [
  { id: 'key00000-0000-0000-0000-000000000001', name: 'Production Logistics Integration', key: 'sb_pub_live_79a3bc9df1e24bc392', role: 'transporter', created_at: new Date().toISOString() },
  { id: 'key00000-0000-0000-0000-000000000002', name: 'Government Trade Portal API', key: 'sb_pub_live_45f8ac9df1e24bc882', role: 'government', created_at: new Date().toISOString() }
];

const SEED_EVENT_LOGS: EventLog[] = [
  { id: 'ev000000-0000-0000-0000-000000000001', event: 'trade.created', payload: { order_id: 'o0000000-0000-0000-0000-000000000001', amount: 24000, currency: 'USD' }, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'ev000000-0000-0000-0000-000000000002', event: 'bid.submitted', payload: { bid_id: 'b0000000-0000-0000-0000-000000000001', rfq_id: 'r0000000-0000-0000-0000-000000000001' }, created_at: new Date(Date.now() - 3600000 * 1.8).toISOString() },
];


const SEED_RFQS: Rfq[] = [
  {
    id: 'rfq10000-0000-0000-0000-000000000001',
    buyer_company_id: 'co100000-0000-0000-0000-000000000004',
    title: 'Heavy Duty Logistics Contract for Cross-Border Transport',
    description: 'We are seeking a 12-month logistics contract for 500 tons of processed material monthly. Must include cold chain capability.',
    industry: 'Logistics',
    required_quantity: 500,
    unit: 'Tons/Month',
    delivery_location: 'Gaborone, Botswana',
    deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    status: 'open',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'rfq10000-0000-0000-0000-000000000002',
    buyer_company_id: 'co100000-0000-0000-0000-000000000005',
    title: 'Procurement of Construction Grade Steel',
    description: 'Urgent requirement for structural steel for a new commercial development. Must meet SADC quality standards.',
    industry: 'Construction',
    required_quantity: 1200,
    unit: 'Tons',
    delivery_location: 'Johannesburg, South Africa',
    deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    status: 'open',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'rfq10000-0000-0000-0000-000000000003',
    buyer_company_id: 'co100000-0000-0000-0000-000000000001',
    title: 'Bulk Processing Chemicals (Industrial)',
    description: 'Quarterly supply of specialized mining reagents and processing chemicals.',
    industry: 'Mining',
    required_quantity: 15000,
    unit: 'Liters',
    delivery_location: 'Francistown, Botswana',
    deadline: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // Closed yesterday
    status: 'closed',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  }
];

const SEED_BIDS: Bid[] = [
  {
    id: 'bid10000-0000-0000-0000-000000000001',
    rfq_id: 'rfq10000-0000-0000-0000-000000000001',
    supplier_company_id: 'co100000-0000-0000-0000-000000000002',
    price_per_unit: 1450,
    total_price: 1450 * 500,
    estimated_delivery_days: 14,
    status: 'pending',
    notes: 'We have 20 refrigerated trucks available on the requested corridor.',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'bid10000-0000-0000-0000-000000000002',
    rfq_id: 'rfq10000-0000-0000-0000-000000000003',
    supplier_company_id: 'co100000-0000-0000-0000-000000000002',
    price_per_unit: 18.5,
    total_price: 18.5 * 15000,
    estimated_delivery_days: 7,
    status: 'accepted',
    notes: 'Can source directly from our South African processing plant and deliver via road.',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  }
];

const SEED_SHIPMENTS: Shipment[] = [
  { id: 's0000001-0000-0000-0000-000000000001', bid_id: 'bid10000-0000-0000-0000-000000000002', transporter_id: 't3000000-0000-0000-0000-000000000002', status: 'delivered', route_from: 'Windhoek', route_to: 'Johannesburg', gps: { lat: -26.2041, lng: 28.0473, speed: 0, bearing: 0 }, transport_mode: 'Road', created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 's0000001-0000-0000-0000-000000000002', bid_id: 'bid10000-0000-0000-0000-000000000002', transporter_id: 't3000000-0000-0000-0000-000000000001', status: 'delivered', route_from: 'Choma', route_to: 'Gaborone', gps: { lat: -24.6282, lng: 25.9231, speed: 0, bearing: 0 }, transport_mode: 'Road', created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() },
  { id: 's0000001-0000-0000-0000-000000000003', bid_id: 'bid10000-0000-0000-0000-000000000003', transporter_id: 't3000000-0000-0000-0000-000000000002', status: 'transit', route_from: 'Welkom', route_to: 'Johannesburg', gps: { lat: -27.9830, lng: 26.7200, speed: 75, bearing: 45 }, transport_mode: 'Road', created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
  { id: 's0000001-0000-0000-0000-000000000004', bid_id: 'bid10000-0000-0000-0000-000000000004', transporter_id: 't3000000-0000-0000-0000-000000000001', status: 'transit', route_from: 'Maun', route_to: 'Windhoek', gps: { lat: -21.1400, lng: 19.9800, speed: 80, bearing: 280 }, transport_mode: 'Road', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
];

// Fill up to 20 shipments
const fillShipments = (): Shipment[] => {
  const result = [...SEED_SHIPMENTS];
  const transporters = ['t3000000-0000-0000-0000-000000000001', 't3000000-0000-0000-0000-000000000002'];
  const routes = [
    { from: 'Gaborone', to: 'Harare' },
    { from: 'Francistown', to: 'Lusaka' },
    { from: 'Gaborone', to: 'Johannesburg' },
    { from: 'Maun', to: 'Windhoek' }
  ];
  const statuses: Shipment['status'][] = ['delivered', 'transit', 'pending'];

  for (let i = result.length + 1; i <= 20; i++) {
    const bid = SEED_BIDS[i % SEED_BIDS.length];
    const transporterId = transporters[i % transporters.length];
    const route = routes[i % routes.length];
    const status = statuses[i % statuses.length];
    
    result.push({
      id: `s0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      bid_id: bid.id,
      transporter_id: status === 'pending' ? null : transporterId,
      status: status,
      route_from: route.from,
      route_to: route.to,
      gps: status === 'transit' ? { lat: -24.6 + (Math.random() - 0.5) * 4, lng: 25.9 + (Math.random() - 0.5) * 4, speed: 65, bearing: 180 } : null,
      transport_mode: i % 3 === 0 ? 'Rail' : 'Road',
      created_at: new Date(Date.now() - (i % 20 + 2) * 24 * 3600 * 1000).toISOString()
    });
  }
  return result;
};

const FULL_SHIPMENTS = fillShipments();

const SEED_PAYMENTS: Payment[] = [
  { id: 'p0000001-0000-0000-0000-000000000001', bid_id: 'bid10000-0000-0000-0000-000000000001', amount: 186000, status: 'released', created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'p0000001-0000-0000-0000-000000000002', bid_id: 'bid10000-0000-0000-0000-000000000002', amount: 88500, status: 'released', created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() }
];

const fillPayments = (): Payment[] => {
  const result = [...SEED_PAYMENTS];
  for (let i = result.length + 1; i <= 20; i++) {
    const bid = SEED_BIDS[i % SEED_BIDS.length];
    result.push({
      id: `p0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      bid_id: bid.id,
      amount: bid.total_price,
      status: bid.status === 'accepted' ? 'released' : 'pending',
      created_at: new Date(Date.now() - (i % 20 + 2) * 24 * 3600 * 1000).toISOString()
    });
  }
  return result;
};

const FULL_PAYMENTS = fillPayments();

const SEED_EXPORTS: Export[] = [
  { id: 'e0000001-0000-0000-0000-000000000001', bid_id: 'bid10000-0000-0000-0000-000000000001', country: 'South Africa', readiness_score: 100, status: 'approved', missing_requirements: [], certificates: { phytosanitary: 'ISSUED', sabs: 'APPROVED' }, created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'e0000001-0000-0000-0000-000000000002', bid_id: 'bid10000-0000-0000-0000-000000000002', country: 'Botswana', readiness_score: 100, status: 'approved', missing_requirements: [], certificates: { import_permit: 'ISSUED', quality_cert: 'ISSUED' }, created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() }
];

const fillExports = (): Export[] => {
  const result = [...SEED_EXPORTS];
  const countries = ['Botswana', 'Zimbabwe', 'Zambia', 'Namibia', 'South Africa'];
  const statuses: Export['status'][] = ['approved', 'pending_approval', 'incomplete', 'rejected'];

  for (let i = result.length + 1; i <= 20; i++) {
    const bid = SEED_BIDS[i % SEED_BIDS.length];
    const country = countries[i % countries.length];
    const status = statuses[i % statuses.length];
    const score = status === 'approved' ? 100 : status === 'pending_approval' ? 85 : status === 'incomplete' ? 45 : 20;
    const missing = status === 'incomplete' ? ['SADC Customs Dec', 'Quality Standard Verification'] : status === 'rejected' ? ['Phytosanitary Certification Failed'] : [];

    result.push({
      id: `e0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      bid_id: bid.id,
      country: country,
      readiness_score: score,
      status: status,
      missing_requirements: missing,
      certificates: status === 'approved' ? { customs_clearance: 'ISSUED', standard_approval: 'ISSUED' } : {},
      created_at: new Date(Date.now() - (i % 20 + 2) * 24 * 3600 * 1000).toISOString()
    });
  }
  return result;
};

const FULL_EXPORTS = fillExports();

const SEED_TRADE_AGREEMENTS: TradeAgreement[] = [
  {
    id: 'ta100000-0000-0000-0000-000000000001',
    agreement_name: 'SACU + SADC Trade Protocol',
    origin_country: 'Botswana',
    destination_country: 'South Africa',
    commodity: 'All (Beef, Maize, Sorghum, Horticulture)',
    documents_required: ['SADC Certificate of Origin', 'Veterinary Certificate', 'Cold Chain Log Report', 'Transport Manifest', 'SACU Customs declaration'],
    tariff_type: 'Duty-free Movement',
    certificate_required: true,
    permit_required: false,
    veterinary_required: true,
    phytosanitary_required: true,
    customs_notes: 'Common external tariff applies. Livestock/meat require veterinary validation and cold-chain compliance tracking.'
  },
  {
    id: 'ta100000-0000-0000-0000-000000000002',
    agreement_name: 'SACU + SADC Customs Union',
    origin_country: 'Botswana',
    destination_country: 'Namibia',
    commodity: 'Beef & Livestock',
    documents_required: ['Veterinary Compliance Certificate', 'Animal Health Status Report', 'SADC Certificate of Origin', 'Cold-Chain Verification Log'],
    tariff_type: 'Duty-free Movement',
    certificate_required: true,
    permit_required: true,
    veterinary_required: true,
    phytosanitary_required: false,
    customs_notes: 'Livestock and beef movement governed by mutual SACU/DVS health inspection. Requires active ear-tag audit (LITS).'
  },
  {
    id: 'ta100000-0000-0000-0000-000000000003',
    agreement_name: 'Botswana-Zimbabwe Bilateral Trade Agreement (1988)',
    origin_country: 'Botswana',
    destination_country: 'Zimbabwe',
    commodity: 'Maize, Sorghum, Horticulture',
    documents_required: ['SADC Certificate of Origin (Form 61)', 'Local Content Validation Sheet', 'Phytosanitary Permit', 'Bilateral Import Permit'],
    tariff_type: 'Duty-free Preferential Trade',
    certificate_required: true,
    permit_required: true,
    veterinary_required: false,
    phytosanitary_required: true,
    local_content_min_pct: 25,
    customs_notes: 'Requires certificate of origin rules + minimum 25% local content verification to qualify for tariff exemption.'
  },
  {
    id: 'ta100000-0000-0000-0000-000000000004',
    agreement_name: 'Bilateral Trade Protocol + SADC + AfCFTA',
    origin_country: 'Zimbabwe',
    destination_country: 'South Africa',
    commodity: 'Horticulture, Maize, Processed Foods, Livestock',
    documents_required: ['SADC Certificate of Origin', 'CD1 Export Declaration', 'Phytosanitary Clearance', 'Customs Bill of Entry'],
    tariff_type: 'Preferential Tariff Rate',
    certificate_required: true,
    permit_required: true,
    veterinary_required: true,
    phytosanitary_required: true,
    customs_notes: 'High-value ag lane. Subject to Beitbridge border checks. Tracks queue delay and customs manifest clearance.'
  },
  {
    id: 'ta100000-0000-0000-0000-000000000005',
    agreement_name: 'Zimbabwe-Namibia Bilateral Trade Pact',
    origin_country: 'Zimbabwe',
    destination_country: 'Namibia',
    commodity: 'Beef, Horticulture, Grains',
    documents_required: ['SADC Origin Certificate', 'Phytosanitary Permit', 'Namibian Import Permit', 'Bilateral Transport Waiver'],
    tariff_type: 'Preferential Duty-free',
    certificate_required: true,
    permit_required: true,
    veterinary_required: false,
    phytosanitary_required: true,
    customs_notes: 'Bilateral agreement offers duty-free market access. Permits require pre-clearance upload before border arrival.'
  },
  {
    id: 'ta100000-0000-0000-0000-000000000006',
    agreement_name: 'COMESA + SADC + AfCFTA Grain Corridor',
    origin_country: 'Zambia',
    destination_country: 'Zimbabwe',
    commodity: 'Maize & Grains',
    documents_required: ['COMESA Certificate of Origin', 'Food Reserve Agency Quota Clearance', 'Phytosanitary Safety Permit', 'Transport Transit Permit'],
    tariff_type: 'Preferential Trade',
    certificate_required: true,
    permit_required: true,
    veterinary_required: false,
    phytosanitary_required: true,
    customs_notes: 'Major regional grain pipeline. Requires active Food Reserve Agency (FRA) quota approval and mycotoxin/aflatoxin tests.'
  }
];

const SEED_TRADE_CORRIDORS: TradeCorridor[] = [
  {
    id: 'tc100000-0000-0000-0000-000000000001',
    name: 'Botswana-Zimbabwe Corridor',
    origin: 'Botswana',
    destination: 'Zimbabwe',
    border_checkpoint: 'Plumtree Border Post',
    queue_delay_hours: 4.1,
    transit_efficiency: 85,
    active_transport_lines: 38,
    biosecurity_status: 'Standard'
  },
  {
    id: 'tc100000-0000-0000-0000-000000000002',
    name: 'Botswana-SouthAfrica Corridor',
    origin: 'Botswana',
    destination: 'South Africa',
    border_checkpoint: 'Tlokweng / Kopfontein',
    queue_delay_hours: 1.8,
    transit_efficiency: 92,
    active_transport_lines: 54,
    biosecurity_status: 'Standard'
  },
  {
    id: 'tc100000-0000-0000-0000-000000000003',
    name: 'Botswana-Namibia Corridor',
    origin: 'Botswana',
    destination: 'Namibia',
    border_checkpoint: 'Mamuno / Trans-Kalahari',
    queue_delay_hours: 1.2,
    transit_efficiency: 95,
    active_transport_lines: 24,
    biosecurity_status: 'Standard'
  },
  {
    id: 'tc100000-0000-0000-0000-000000000004',
    name: 'Zimbabwe-SouthAfrica Corridor',
    origin: 'Zimbabwe',
    destination: 'South Africa',
    border_checkpoint: 'Beitbridge Border Post',
    queue_delay_hours: 14.5,
    transit_efficiency: 68,
    active_transport_lines: 120,
    biosecurity_status: 'Alert'
  },
  {
    id: 'tc100000-0000-0000-0000-000000000005',
    name: 'Zambia-Zimbabwe Corridor',
    origin: 'Zambia',
    destination: 'Zimbabwe',
    border_checkpoint: 'Chirundu Border Control',
    queue_delay_hours: 5.3,
    transit_efficiency: 82,
    active_transport_lines: 65,
    biosecurity_status: 'Active'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [companies, setCompanies] = useState<Company[]>(SEED_COMPANIES);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exports, setExports] = useState<Export[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [financingRequests, setFinancingRequests] = useState<FinancingRequest[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [tradeAgreements, setTradeAgreements] = useState<TradeAgreement[]>([]);
  const [tradeCorridors, setTradeCorridors] = useState<TradeCorridor[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Currency State
  const [currency, setCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    ZAR: 18.5,
    BWP: 13.5,
    ZMW: 26.0,
    NAD: 18.5
  });

  useEffect(() => {
    // Fetch live exchange rates
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setExchangeRates(prev => ({
            ...prev,
            ...data.rates
          }));
        }
      })
      .catch(err => console.error("Failed to fetch exchange rates", err));
  }, []);

  const formatCurrency = (amountInUsd: number) => {
    const rate = exchangeRates[currency] || 1;
    const converted = amountInUsd * rate;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(converted);
  };

  useEffect(() => {
    const fetchLiveDb = async () => {
      if (!supabase) {
        console.warn("Supabase is not configured. Skipping live data fetch.");
        // Fallback to mock data
        setUsers(SEED_USERS);
        setCompanies(SEED_COMPANIES);
        setRfqs(SEED_RFQS);
        setBids(SEED_BIDS);
        setShipments(FULL_SHIPMENTS);
        setPayments(FULL_PAYMENTS);
        setExports(FULL_EXPORTS);
        setCooperatives(SEED_COOPERATIVES);
        setFinancingRequests(SEED_FINANCING_REQUESTS);
        setWebhooks(SEED_WEBHOOKS);
        setApiKeys(SEED_API_KEYS);
        setEventLogs(SEED_EVENT_LOGS);
        setTradeAgreements(SEED_TRADE_AGREEMENTS);
        setTradeCorridors(SEED_TRADE_CORRIDORS);
        return;
      }
      try {
        // Query v2 tables
        const { data: dbUsers, error: usersErr } = await supabase.from('users').select('*, organizations(*)');
        const { data: dbRfqs, error: rfqsErr } = await supabase.from('rfqs').select('*, organizations(*)');
        const { data: dbContracts, error: contractsErr } = await supabase.from('contracts').select('*');

        if (usersErr) console.error("Error fetching users", usersErr);
        if (rfqsErr) console.error("Error fetching rfqs", rfqsErr);
        if (contractsErr) console.error("Error fetching contracts", contractsErr);

        // If DB is empty (initial run), fallback to mock data so UI doesn't break
        if (!dbUsers || dbUsers.length === 0) {
          console.log("No live data found in Supabase. Falling back to mock data.");
          setUsers(SEED_USERS);
          setCompanies(SEED_COMPANIES);
          setRfqs(SEED_RFQS);
          setBids(SEED_BIDS);
          setShipments(FULL_SHIPMENTS);
          setPayments(FULL_PAYMENTS);
          setExports(FULL_EXPORTS);
          setCooperatives(SEED_COOPERATIVES);
          setFinancingRequests(SEED_FINANCING_REQUESTS);
          setWebhooks(SEED_WEBHOOKS);
          setApiKeys(SEED_API_KEYS);
          setEventLogs(SEED_EVENT_LOGS);
          setTradeAgreements(SEED_TRADE_AGREEMENTS);
          setTradeCorridors(SEED_TRADE_CORRIDORS);

          // Restore previously saved user or use default
          const savedUser = typeof window !== 'undefined' ? localStorage.getItem('pt_current_user') : null;
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
          } else {
            setCurrentUser(SEED_USERS[5]); // Default to buyer
          }
          return;
        }

        // Map live DB Users -> AppContext Users
        const mappedUsers: User[] = dbUsers.map((u: any) => ({
          id: u.id,
          role: u.role || 'buyer',
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          email: u.email,
          phone: '',
          country: u.organizations?.country || 'Botswana',
          kyc_status: 'approved'
        }));

        // Map live RFQs
        const mappedRfqs: Rfq[] = (dbRfqs || []).map((rfq: any) => ({
          id: rfq.id,
          buyer_company_id: rfq.buyer_org_id,
          title: rfq.title || 'Procurement Request',
          description: rfq.description || 'No description',
          industry: rfq.industry || 'Agriculture',
          required_quantity: rfq.required_quantity || 100,
          unit: rfq.unit || 'Tons',
          delivery_location: rfq.delivery_location || 'Gaborone',
          deadline: rfq.deadline,
          status: rfq.status === 'open' ? 'open' : 'closed',
          created_at: rfq.created_at
        }));

        // Map live Contracts -> Bids
        const mappedBids: Bid[] = (dbContracts || []).map((contract: any) => ({
          id: contract.id,
          rfq_id: contract.rfq_id,
          supplier_company_id: contract.supplier_org_id || 'co000',
          price_per_unit: contract.price || 0,
          total_price: (contract.price || 0) * 100,
          estimated_delivery_days: 14,
          status: contract.status === 'active' ? 'accepted' : 'pending',
          notes: '',
          created_at: contract.created_at
        }));

        setUsers(mappedUsers);
        setRfqs(mappedRfqs);
        setBids(mappedBids);

        // Keep static/unmigrated data as mock
        setCompanies(SEED_COMPANIES);
        setShipments(FULL_SHIPMENTS);
        setPayments(FULL_PAYMENTS);
        setExports(FULL_EXPORTS);
        setCooperatives(SEED_COOPERATIVES);
        setFinancingRequests(SEED_FINANCING_REQUESTS);
        setWebhooks(SEED_WEBHOOKS);
        setApiKeys(SEED_API_KEYS);
        setEventLogs(SEED_EVENT_LOGS);
        setTradeAgreements(SEED_TRADE_AGREEMENTS);
        setTradeCorridors(SEED_TRADE_CORRIDORS);

        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('pt_current_user') : null;
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const exists = mappedUsers.find(u => u.id === parsedUser.id);
          setCurrentUser(exists || mappedUsers[0]);
        } else {
          setCurrentUser(mappedUsers[0]);
        }
      } catch (err) {
        console.error("Failed to fetch from live Supabase DB", err);
      }
    };

    fetchLiveDb();
  }, []);

  // Save updates helper
  const saveState = (key: string, data: any, setter: Function) => {
    setter(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const handleSetCurrentUser = (user: User) => {
    saveState('pt_current_user', user, setCurrentUser);
  };

  // ACTIONS IMPLEMENTATION
  const createRfq = (newRfq: Omit<Rfq, 'id' | 'created_at'>) => {
    const created: Rfq = {
      ...newRfq,
      id: `rfq00000-0000-0000-0000-${(rfqs.length + 1).toString().padStart(12, '0')}`,
      created_at: new Date().toISOString()
    };
    const updatedList = [created, ...rfqs];
    saveState('pt_rfqs', updatedList, setRfqs);
    return created;
  };

  const updateRfqStatus = (id: string, status: Rfq['status']) => {
    const updated = rfqs.map(r => r.id === id ? { ...r, status } : r);
    saveState('pt_rfqs', updated, setRfqs);
  };

  const submitBid = (newBid: Omit<Bid, 'id' | 'created_at'>) => {
    const rfq = rfqs.find(r => r.id === newBid.rfq_id);
    if (!rfq) throw new Error("RFQ not found");

    const created: Bid = {
      ...newBid,
      id: `bid00000-0000-0000-0000-${(bids.length + 1).toString().padStart(12, '0')}`,
      created_at: new Date().toISOString()
    };
    const updated = [created, ...bids];
    saveState('pt_bids', updated, setBids);
    triggerEvent('bid.submitted', { id: created.id, rfq_id: rfq.id, amount: created.total_price });
    return created;
  };

  const updateBidStatus = (bidId: string, status: Bid['status']) => {
    const updated = bids.map(b => b.id === bidId ? { ...b, status } : b);
    saveState('pt_bids', updated, setBids);
    const bid = bids.find(b => b.id === bidId);
    if (bid) {
      triggerEvent('bid.status_updated', { id: bidId, status, amount: bid.total_price });
    }
  };

  const assignTransporter = (shipmentId: string, transporterId: string) => {
    const updated = shipments.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          transporter_id: transporterId,
          status: 'transit' as const,
          gps: {
            lat: -24.6282 + (Math.random() - 0.5) * 2,
            lng: 25.9231 + (Math.random() - 0.5) * 2,
            speed: 65,
            bearing: 90
          }
        };
      }
      return s;
    });
    saveState('pt_shipments', updated, setShipments);
  };

  const updateShipmentStatus = (shipmentId: string, status: Shipment['status'], gps?: GPSData) => {
    const updated = shipments.map(s => {
      if (s.id === shipmentId) {
        // If shipment is marked delivered, also complete the order and release payment
        if (status === 'delivered') {
          setTimeout(() => {
            // Completed Order
            const ship = shipments.find(x => x.id === shipmentId);
            if (ship) {
              setBids(prev => {
                const uBids = prev.map(o => o.id === ship.bid_id ? { ...o, status: 'accepted' as const } : o);
                if (typeof window !== 'undefined') localStorage.setItem('pt_bids', JSON.stringify(uBids));
                return uBids;
              });
              setPayments(prev => {
                const uPayments = prev.map(p => p.bid_id === ship.bid_id ? { ...p, status: 'released' as const } : p);
                if (typeof window !== 'undefined') localStorage.setItem('pt_payments', JSON.stringify(uPayments));
                return uPayments;
              });
              setExports(prev => {
                const uExports = prev.map(e => e.bid_id === ship.bid_id ? { ...e, status: 'approved' as const, readiness_score: 100 } : e);
                if (typeof window !== 'undefined') localStorage.setItem('pt_exports', JSON.stringify(uExports));
                return uExports;
              });
            }
          }, 100);
        }

        return {
          ...s,
          status,
          gps: gps || (status === 'delivered' ? null : s.gps)
        };
      }
      return s;
    });
    saveState('pt_shipments', updated, setShipments);
  };

  const updateExportStatus = (exportId: string, status: Export['status'], readinessScore?: number, missingReqs?: string[]) => {
    const updated = exports.map(e => {
      if (e.id === exportId) {
        return {
          ...e,
          status,
          readiness_score: readinessScore !== undefined ? readinessScore : e.readiness_score,
          missing_requirements: missingReqs || e.missing_requirements
        };
      }
      return e;
    });
    saveState('pt_exports', updated, setExports);
  };

  const releasePayment = (paymentId: string) => {
    const updated = payments.map(p => {
      if (p.id === paymentId) {
        return { ...p, status: 'released' as const };
      }
      return p;
    });
    saveState('pt_payments', updated, setPayments);
    const pm = payments.find(p => p.id === paymentId);
    if (pm) {
      triggerEvent('payment.released', { id: paymentId, bid_id: pm.bid_id, amount: pm.amount });
    }
  };

  const addFinancingRequest = (req: Omit<FinancingRequest, 'id' | 'created_at'>) => {
    const created: FinancingRequest = {
      ...req,
      id: `req00000-0000-0000-0000-${(financingRequests.length + 1).toString().padStart(12, '0')}`,
      created_at: new Date().toISOString()
    };
    const updated = [created, ...financingRequests];
    saveState('pt_financing_requests', updated, setFinancingRequests);
    triggerEvent('financing.requested', created);
    return created;
  };

  const updateFinancingRequest = (id: string, status: FinancingRequest['status']) => {
    const updated = financingRequests.map(r => r.id === id ? { ...r, status } : r);
    saveState('pt_financing_requests', updated, setFinancingRequests);
    const req = financingRequests.find(r => r.id === id);
    if (req) {
      triggerEvent('financing.updated', { id, status, amount: req.amount });
    }
  };

  const registerWebhook = (webhook: Omit<Webhook, 'id' | 'created_at'>) => {
    const created: Webhook = {
      ...webhook,
      id: `w1000000-0000-0000-0000-${(webhooks.length + 1).toString().padStart(12, '0')}`,
      created_at: new Date().toISOString()
    };
    const updated = [...webhooks, created];
    saveState('pt_webhooks', updated, setWebhooks);
    return created;
  };

  const deleteWebhook = (id: string) => {
    const updated = webhooks.filter(w => w.id !== id);
    saveState('pt_webhooks', updated, setWebhooks);
  };

  const generateApiKey = (name: string, role: string) => {
    const rawKey = 'sb_pub_live_' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const created: ApiKey = {
      id: `key00000-0000-0000-0000-${(apiKeys.length + 1).toString().padStart(12, '0')}`,
      name,
      key: rawKey,
      role,
      created_at: new Date().toISOString()
    };
    const updated = [...apiKeys, created];
    saveState('pt_api_keys', updated, setApiKeys);
    return created;
  };

  const revokeApiKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    saveState('pt_api_keys', updated, setApiKeys);
  };

  const triggerEvent = (event: string, payload: any) => {
    const log: EventLog = {
      id: `ev000000-0000-0000-0000-${(eventLogs.length + 1).toString().padStart(12, '0')}`,
      event,
      payload,
      created_at: new Date().toISOString()
    };
    const updated = [log, ...eventLogs].slice(0, 100);
    saveState('pt_event_logs', updated, setEventLogs);
  };

  const addCompany = (newCompany: Omit<Company, 'id'>) => {
    const created: Company = {
      ...newCompany,
      id: `co100000-0000-0000-0000-${(companies.length + 1).toString().padStart(12, '0')}`
    };
    const updated = [...companies, created];
    saveState('pt_companies', updated, setCompanies);
    triggerEvent('company.registered', created);
    return created;
  };

  const registerUser = (newUser: Omit<User, 'id'>) => {
    const prefix = newUser.role === 'farmer' ? 'f' : newUser.role === 'buyer' ? 'b' : newUser.role === 'transporter' ? 't' : 'u';
    const created: User = {
      ...newUser,
      kyc_status: (newUser.role === 'farmer' || newUser.role === 'buyer' || newUser.role === 'transporter') 
        ? (newUser.kyc_status || 'pending') 
        : 'approved',
      id: `${prefix}${(users.length + 1).toString().padStart(7, '0')}-0000-0000-0000-000000000001`
    };
    const updated = [...users, created];
    saveState('pt_users', updated, setUsers);
    triggerEvent('user.registered', created);
    return created;
  };

  const updateUserKycStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    const updated = users.map(u => u.id === id ? { ...u, kyc_status: status } : u);
    saveState('pt_users', updated, setUsers);
    const updatedUser = updated.find(u => u.id === id);
    if (updatedUser) {
      triggerEvent('user.kyc_updated', { id, status, name: updatedUser.name, role: updatedUser.role });
    }
  };

  const updateTradeCorridor = (id: string, updates: Partial<TradeCorridor>) => {
    const updated = tradeCorridors.map(c => c.id === id ? { ...c, ...updates } : c);
    saveState('pt_trade_corridors', updated, setTradeCorridors);
    triggerEvent('trade.corridor_updated', { id, ...updates });
  };

  const resetAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pt_users');
      localStorage.removeItem('pt_companies');
      localStorage.removeItem('pt_rfqs');
      localStorage.removeItem('pt_bids');
      localStorage.removeItem('pt_shipments');
      localStorage.removeItem('pt_payments');
      localStorage.removeItem('pt_exports');
      localStorage.removeItem('pt_cooperatives');
      localStorage.removeItem('pt_financingRequests');
      localStorage.removeItem('pt_webhooks');
      localStorage.removeItem('pt_apiKeys');
      localStorage.removeItem('pt_eventLogs');
      localStorage.removeItem('pt_current_user');
      localStorage.removeItem('pt_trade_agreements');
      localStorage.removeItem('pt_trade_corridors');

      setUsers(SEED_USERS);
      setCompanies(SEED_COMPANIES);
      setRfqs(SEED_RFQS);
      setBids(SEED_BIDS);
      setShipments(FULL_SHIPMENTS);
      setPayments(FULL_PAYMENTS);
      setExports(FULL_EXPORTS);
      setCooperatives(SEED_COOPERATIVES);
      setFinancingRequests(SEED_FINANCING_REQUESTS);
      setWebhooks(SEED_WEBHOOKS);
      setApiKeys(SEED_API_KEYS);
      setEventLogs(SEED_EVENT_LOGS);
      setTradeAgreements(SEED_TRADE_AGREEMENTS);
      setTradeCorridors(SEED_TRADE_CORRIDORS);
      setCurrentUser(SEED_USERS[0]);
 
      window.location.reload();
    }
  };
 
  return (
    <AppContext.Provider value={{
      users,
      companies,
      rfqs,
      bids,
      shipments,
      payments,
      exports,
      cooperatives,
      financingRequests,
      webhooks,
      apiKeys,
      eventLogs,
      tradeAgreements,
      tradeCorridors,
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      createRfq,
      updateRfqStatus,
      submitBid,
      updateBidStatus,
      assignTransporter,
      updateShipmentStatus,
      updateExportStatus,
      releasePayment,
      resetAllData,
      addFinancingRequest,
      updateFinancingRequest,
      registerWebhook,
      deleteWebhook,
      generateApiKey,
      revokeApiKey,
      triggerEvent,
      addCompany,
      registerUser,
      updateUserKycStatus,
      updateTradeCorridor,
      currency,
      setCurrency,
      formatCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
