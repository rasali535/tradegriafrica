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

export interface Farm {
  id: string;
  owner_id: string;
  farm_name: string;
  farm_size: number;
  country: string;
  region: string;
  commodity_focus: string[];
  production_capacity: number;
  certification_status: string;
}

export interface CommodityListing {
  id: string;
  farm_id: string;
  commodity: 'Beef' | 'Maize' | 'Sorghum' | 'Horticulture' | 'Poultry feed products';
  quantity: number;
  price: number;
  status: 'draft' | 'available' | 'reserved' | 'sold';
  export_ready: boolean;
  harvest_date: string;
  photos: string[];
  storage_availability: string;
  country_of_origin: string;
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  listing_id: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
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
  order_id: string;
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
  order_id: string;
  amount: number;
  status: 'pending' | 'released' | 'refunded';
  created_at: string;
}

export interface Export {
  id: string;
  order_id: string;
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
  farms: Farm[];
  listings: CommodityListing[];
  orders: Order[];
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
  addListing: (listing: Omit<CommodityListing, 'id' | 'created_at'>) => CommodityListing;
  updateListing: (id: string, updates: Partial<CommodityListing>) => void;
  placeOrder: (listingId: string, quantity: number) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
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
  addFarm: (farm: Omit<Farm, 'id'>) => Farm;
  registerUser: (user: Omit<User, 'id'>) => User;
  updateUserKycStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
  updateTradeCorridor: (id: string, updates: Partial<TradeCorridor>) => void;
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

const SEED_FARMS: Farm[] = [
  { id: 'fa100000-0000-0000-0000-000000000001', owner_id: 'f1000000-0000-0000-0000-000000000001', farm_name: 'Chobe Valley Farms', farm_size: 450, country: 'Botswana', region: 'Chobe District', commodity_focus: ['Maize', 'Sorghum', 'Horticulture'], production_capacity: 1200, certification_status: 'Certified' },
  { id: 'fa100000-0000-0000-0000-000000000002', owner_id: 'f1000000-0000-0000-0000-000000000002', farm_name: 'Mazowe Agri-Estate', farm_size: 800, country: 'Zimbabwe', region: 'Mashonaland Central', commodity_focus: ['Maize', 'Horticulture', 'Poultry feed products'], production_capacity: 2500, certification_status: 'Certified' },
  { id: 'fa100000-0000-0000-0000-000000000003', owner_id: 'f1000000-0000-0000-0000-000000000003', farm_name: 'Lusaka South Cooperatives', farm_size: 350, country: 'Zambia', region: 'Lusaka Province', commodity_focus: ['Maize', 'Sorghum', 'Poultry feed products'], production_capacity: 900, certification_status: 'Pending' },
  { id: 'fa100000-0000-0000-0000-000000000004', owner_id: 'f1000000-0000-0000-0000-000000000004', farm_name: 'Okahandja Beef Ranches', farm_size: 5500, country: 'Namibia', region: 'Otjozondjupa', commodity_focus: ['Beef'], production_capacity: 800, certification_status: 'Certified' },
  { id: 'fa100000-0000-0000-0000-000000000005', owner_id: 'f1000000-0000-0000-0000-000000000005', farm_name: 'Free State Grainlands', farm_size: 1200, country: 'South Africa', region: 'Free State', commodity_focus: ['Maize', 'Sorghum', 'Poultry feed products'], production_capacity: 4000, certification_status: 'Certified' }
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
  { id: 'w1000000-0000-0000-0000-000000000001', url: 'https://sadc-trade.free.beeceptor.com/webhook', events: ['trade.created', 'payment.escrowed'], active: true, created_at: new Date().toISOString() }
];

const SEED_API_KEYS: ApiKey[] = [
  { id: 'key00000-0000-0000-0000-000000000001', name: 'Production Logistics Integration', key: 'sb_pub_live_79a3bc9df1e24bc392', role: 'transporter', created_at: new Date().toISOString() },
  { id: 'key00000-0000-0000-0000-000000000002', name: 'Government Trade Portal API', key: 'sb_pub_live_45f8ac9df1e24bc882', role: 'government', created_at: new Date().toISOString() }
];

const SEED_EVENT_LOGS: EventLog[] = [
  { id: 'ev000000-0000-0000-0000-000000000001', event: 'trade.created', payload: { order_id: 'o0000000-0000-0000-0000-000000000001', amount: 24000, currency: 'USD' }, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'ev000000-0000-0000-0000-000000000002', event: 'payment.escrowed', payload: { payment_id: 'p0000000-0000-0000-0000-000000000001', order_id: 'o0000000-0000-0000-0000-000000000001' }, created_at: new Date(Date.now() - 3600000 * 1.8).toISOString() },
];


// Generate 50 realistic listings
const generateListings = (): CommodityListing[] => {
  const result: CommodityListing[] = [
    {
      id: 'l0000001-0000-0000-0000-000000000001',
      farm_id: 'fa100000-0000-0000-0000-000000000004',
      commodity: 'Beef',
      quantity: 25,
      price: 4800,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-10',
      photos: ['/beef.png'],
      storage_availability: 'Cold Storage (Okahandja)',
      country_of_origin: 'Namibia',
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000001-0000-0000-0000-000000000002',
      farm_id: 'fa100000-0000-0000-0000-000000000004',
      commodity: 'Beef',
      quantity: 50,
      price: 4750,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-12',
      photos: ['/beef.png'],
      storage_availability: 'Cold Storage (Windhoek)',
      country_of_origin: 'Namibia',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000001-0000-0000-0000-000000000003',
      farm_id: 'fa100000-0000-0000-0000-000000000001',
      commodity: 'Beef',
      quantity: 15,
      price: 5100,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-15',
      photos: ['/beef.png'],
      storage_availability: 'Cold Storage (Gaborone)',
      country_of_origin: 'Botswana',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000001-0000-0000-0000-000000000004',
      farm_id: 'fa100000-0000-0000-0000-000000000004',
      commodity: 'Beef',
      quantity: 30,
      price: 4700,
      status: 'reserved',
      export_ready: true,
      harvest_date: '2026-05-08',
      photos: ['/beef.png'],
      storage_availability: 'Cold Storage (Walvis Bay)',
      country_of_origin: 'Namibia',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000001-0000-0000-0000-000000000005',
      farm_id: 'fa100000-0000-0000-0000-000000000004',
      commodity: 'Beef',
      quantity: 40,
      price: 4650,
      status: 'sold',
      export_ready: true,
      harvest_date: '2026-04-20',
      photos: ['/beef.png'],
      storage_availability: 'Cold Storage (Windhoek)',
      country_of_origin: 'Namibia',
      created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000002-0000-0000-0000-000000000001',
      farm_id: 'fa100000-0000-0000-0000-000000000005',
      commodity: 'Maize',
      quantity: 500,
      price: 290,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-01',
      photos: ['/maize.png'],
      storage_availability: 'Silo (Bloemfontein)',
      country_of_origin: 'South Africa',
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000002-0000-0000-0000-000000000002',
      farm_id: 'fa100000-0000-0000-0000-000000000005',
      commodity: 'Maize',
      quantity: 1000,
      price: 280,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-02',
      photos: ['/maize.png'],
      storage_availability: 'Silo (Kroonstad)',
      country_of_origin: 'South Africa',
      created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000002-0000-0000-0000-000000000003',
      farm_id: 'fa100000-0000-0000-0000-000000000002',
      commodity: 'Maize',
      quantity: 200,
      price: 310,
      status: 'available',
      export_ready: false,
      harvest_date: '2026-05-05',
      photos: ['/maize.png'],
      storage_availability: 'On-farm Barn (Mazowe)',
      country_of_origin: 'Zimbabwe',
      created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000002-0000-0000-0000-000000000004',
      farm_id: 'fa100000-0000-0000-0000-000000000003',
      commodity: 'Maize',
      quantity: 150,
      price: 305,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-04-28',
      photos: ['/maize.png'],
      storage_availability: 'Cooperative Silo (Lusaka)',
      country_of_origin: 'Zambia',
      created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000002-0000-0000-0000-000000000005',
      farm_id: 'fa100000-0000-0000-0000-000000000001',
      commodity: 'Maize',
      quantity: 80,
      price: 330,
      status: 'available',
      export_ready: false,
      harvest_date: '2026-05-14',
      photos: ['/maize.png'],
      storage_availability: 'Silo (Pandamatenga)',
      country_of_origin: 'Botswana',
      created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000002-0000-0000-0000-000000000006',
      farm_id: 'fa100000-0000-0000-0000-000000000005',
      commodity: 'Maize',
      quantity: 400,
      price: 285,
      status: 'reserved',
      export_ready: true,
      harvest_date: '2026-04-15',
      photos: ['/maize.png'],
      storage_availability: 'Silo (Welkom)',
      country_of_origin: 'South Africa',
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000002-0000-0000-0000-000000000007',
      farm_id: 'fa100000-0000-0000-0000-000000000003',
      commodity: 'Maize',
      quantity: 300,
      price: 295,
      status: 'sold',
      export_ready: true,
      harvest_date: '2026-04-10',
      photos: ['/maize.png'],
      storage_availability: 'Cooperative Silo (Choma)',
      country_of_origin: 'Zambia',
      created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000003-0000-0000-0000-000000000001',
      farm_id: 'fa100000-0000-0000-0000-000000000001',
      commodity: 'Sorghum',
      quantity: 120,
      price: 350,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-02',
      photos: ['/sorghum.png'],
      storage_availability: 'Silo (Pandamatenga)',
      country_of_origin: 'Botswana',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000003-0000-0000-0000-000000000002',
      farm_id: 'fa100000-0000-0000-0000-000000000005',
      commodity: 'Sorghum',
      quantity: 500,
      price: 310,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-05',
      photos: ['/sorghum.png'],
      storage_availability: 'Silo (Bethlehem)',
      country_of_origin: 'South Africa',
      created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000003-0000-0000-0000-000000000003',
      farm_id: 'fa100000-0000-0000-0000-000000000003',
      commodity: 'Sorghum',
      quantity: 250,
      price: 320,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-06',
      photos: ['/sorghum.png'],
      storage_availability: 'Silo (Kabwe)',
      country_of_origin: 'Zambia',
      created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000003-0000-0000-0000-000000000004',
      farm_id: 'fa100000-0000-0000-0000-000000000002',
      commodity: 'Sorghum',
      quantity: 80,
      price: 340,
      status: 'available',
      export_ready: false,
      harvest_date: '2026-05-10',
      photos: ['/sorghum.png'],
      storage_availability: 'On-farm Barn (Gweru)',
      country_of_origin: 'Zimbabwe',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000004-0000-0000-0000-000000000001',
      farm_id: 'fa100000-0000-0000-0000-000000000002',
      commodity: 'Poultry feed products',
      quantity: 100,
      price: 420,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-01',
      photos: ['/poultry_feed.png'],
      storage_availability: 'Warehouse (Harare)',
      country_of_origin: 'Zimbabwe',
      created_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000004-0000-0000-0000-000000000002',
      farm_id: 'fa100000-0000-0000-0000-000000000005',
      commodity: 'Poultry feed products',
      quantity: 600,
      price: 380,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-04',
      photos: ['/poultry_feed.png'],
      storage_availability: 'Warehouse (Pretoria)',
      country_of_origin: 'South Africa',
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000004-0000-0000-0000-000000000003',
      farm_id: 'fa100000-0000-0000-0000-000000000003',
      commodity: 'Poultry feed products',
      quantity: 200,
      price: 395,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-07',
      photos: ['/poultry_feed.png'],
      storage_availability: 'Warehouse (Lusaka)',
      country_of_origin: 'Zambia',
      created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000005-0000-0000-0000-000000000001',
      farm_id: 'fa100000-0000-0000-0000-000000000001',
      commodity: 'Horticulture',
      quantity: 10,
      price: 850,
      status: 'available',
      export_ready: false,
      harvest_date: '2026-05-18',
      photos: ['/horticulture.png'],
      storage_availability: 'Cold room (Francistown)',
      country_of_origin: 'Botswana',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000005-0000-0000-0000-000000000002',
      farm_id: 'fa100000-0000-0000-0000-000000000002',
      commodity: 'Horticulture',
      quantity: 30,
      price: 750,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-16',
      photos: ['/horticulture.png'],
      storage_availability: 'Cold Storage (Mutare)',
      country_of_origin: 'Zimbabwe',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'l0000005-0000-0000-0000-000000000003',
      farm_id: 'fa100000-0000-0000-0000-000000000005',
      commodity: 'Horticulture',
      quantity: 100,
      price: 700,
      status: 'available',
      export_ready: true,
      harvest_date: '2026-05-15',
      photos: ['/horticulture.png'],
      storage_availability: 'Cold Depot (Nelspruit)',
      country_of_origin: 'South Africa',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    }
  ];

  // Dynamically generate the remaining listings up to 50
  const commodities: Array<'Beef' | 'Maize' | 'Sorghum' | 'Horticulture' | 'Poultry feed products'> = [
    'Beef', 'Maize', 'Sorghum', 'Horticulture', 'Poultry feed products'
  ];
  const countries = ['Botswana', 'Zimbabwe', 'Zambia', 'Namibia', 'South Africa'];
  const farmIds = [
    'fa100000-0000-0000-0000-000000000001',
    'fa100000-0000-0000-0000-000000000002',
    'fa100000-0000-0000-0000-000000000003',
    'fa100000-0000-0000-0000-000000000004',
    'fa100000-0000-0000-0000-000000000005'
  ];
  const images = {
    Beef: '/beef.png',
    Maize: '/maize.png',
    Sorghum: '/sorghum.png',
    Horticulture: '/horticulture.png',
    'Poultry feed products': '/poultry_feed.png'
  };

  for (let i = result.length + 1; i <= 50; i++) {
    const commodity = commodities[i % commodities.length];
    const country = countries[i % countries.length];
    const farmId = farmIds[i % farmIds.length];
    const qty = Math.floor(Math.random() * 450) + 10;
    const price = commodity === 'Beef' 
      ? Math.floor(Math.random() * 800) + 4200
      : Math.floor(Math.random() * 150) + 250;

    result.push({
      id: `l0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      farm_id: farmId,
      commodity: commodity,
      quantity: qty,
      price: price,
      status: 'available',
      export_ready: Math.random() > 0.3,
      harvest_date: `2026-05-${(i % 28 + 1).toString().padStart(2, '0')}`,
      photos: [images[commodity]],
      storage_availability: `Regional Storage Facility`,
      country_of_origin: country,
      created_at: new Date(Date.now() - (i % 30 + 1) * 24 * 3600 * 1000).toISOString()
    });
  }

  return result;
};

const SEED_LISTINGS = generateListings();

const SEED_ORDERS: Order[] = [
  { id: 'o0000001-0000-0000-0000-000000000001', buyer_id: 'b2000000-0000-0000-0000-000000000001', listing_id: 'l0000001-0000-0000-0000-000000000005', quantity: 40, amount: 186000, status: 'completed', created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'o0000001-0000-0000-0000-000000000002', buyer_id: 'b2000000-0000-0000-0000-000000000002', listing_id: 'l0000002-0000-0000-0000-000000000007', quantity: 300, amount: 88500, status: 'completed', created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() },
  { id: 'o0000001-0000-0000-0000-000000000003', buyer_id: 'b2000000-0000-0000-0000-000000000001', listing_id: 'l0000002-0000-0000-0000-000000000006', quantity: 400, amount: 114000, status: 'approved', created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
  { id: 'o0000001-0000-0000-0000-000000000004', buyer_id: 'b2000000-0000-0000-0000-000000000003', listing_id: 'l0000001-0000-0000-0000-000000000004', quantity: 30, amount: 141000, status: 'approved', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  { id: 'o0000001-0000-0000-0000-000000000005', buyer_id: 'b2000000-0000-0000-0000-000000000002', listing_id: 'l0000002-0000-0000-0000-000000000001', quantity: 100, amount: 29000, status: 'pending', created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() }
];

// Add dummy orders to reach 20 orders total
const fillOrders = (): Order[] => {
  const result = [...SEED_ORDERS];
  const buyers = ['b2000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000003'];
  const statuses: Order['status'][] = ['completed', 'approved', 'pending', 'rejected'];

  for (let i = result.length + 1; i <= 20; i++) {
    const listing = SEED_LISTINGS[i % SEED_LISTINGS.length];
    const buyerId = buyers[i % buyers.length];
    const qty = Math.floor(listing.quantity * 0.5) || 5;
    const amount = qty * listing.price;
    const status = statuses[i % statuses.length];

    result.push({
      id: `o0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      buyer_id: buyerId,
      listing_id: listing.id,
      quantity: qty,
      amount: amount,
      status: status,
      created_at: new Date(Date.now() - (i % 20 + 2) * 24 * 3600 * 1000).toISOString()
    });
  }
  return result;
};

const FULL_ORDERS = fillOrders();

const SEED_SHIPMENTS: Shipment[] = [
  { id: 's0000001-0000-0000-0000-000000000001', order_id: 'o0000001-0000-0000-0000-000000000001', transporter_id: 't3000000-0000-0000-0000-000000000002', status: 'delivered', route_from: 'Windhoek', route_to: 'Johannesburg', gps: { lat: -26.2041, lng: 28.0473, speed: 0, bearing: 0 }, transport_mode: 'Road', created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 's0000001-0000-0000-0000-000000000002', order_id: 'o0000001-0000-0000-0000-000000000002', transporter_id: 't3000000-0000-0000-0000-000000000001', status: 'delivered', route_from: 'Choma', route_to: 'Gaborone', gps: { lat: -24.6282, lng: 25.9231, speed: 0, bearing: 0 }, transport_mode: 'Road', created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() },
  { id: 's0000001-0000-0000-0000-000000000003', order_id: 'o0000001-0000-0000-0000-000000000003', transporter_id: 't3000000-0000-0000-0000-000000000002', status: 'transit', route_from: 'Welkom', route_to: 'Johannesburg', gps: { lat: -27.9830, lng: 26.7200, speed: 75, bearing: 45 }, transport_mode: 'Road', created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
  { id: 's0000001-0000-0000-0000-000000000004', order_id: 'o0000001-0000-0000-0000-000000000004', transporter_id: 't3000000-0000-0000-0000-000000000001', status: 'transit', route_from: 'Maun', route_to: 'Windhoek', gps: { lat: -21.1400, lng: 19.9800, speed: 80, bearing: 280 }, transport_mode: 'Road', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
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
    const order = FULL_ORDERS[i % FULL_ORDERS.length];
    const transporterId = transporters[i % transporters.length];
    const route = routes[i % routes.length];
    const status = statuses[i % statuses.length];
    
    result.push({
      id: `s0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      order_id: order.id,
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
  { id: 'p0000001-0000-0000-0000-000000000001', order_id: 'o0000001-0000-0000-0000-000000000001', amount: 186000, status: 'released', created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'p0000001-0000-0000-0000-000000000002', order_id: 'o0000001-0000-0000-0000-000000000002', amount: 88500, status: 'released', created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() },
  { id: 'p0000001-0000-0000-0000-000000000003', order_id: 'o0000001-0000-0000-0000-000000000003', amount: 114000, status: 'pending', created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
  { id: 'p0000001-0000-0000-0000-000000000004', order_id: 'o0000001-0000-0000-0000-000000000004', amount: 141000, status: 'pending', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
];

const fillPayments = (): Payment[] => {
  const result = [...SEED_PAYMENTS];
  for (let i = result.length + 1; i <= 20; i++) {
    const order = FULL_ORDERS[i % FULL_ORDERS.length];
    result.push({
      id: `p0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      order_id: order.id,
      amount: order.amount,
      status: order.status === 'completed' ? 'released' : 'pending',
      created_at: new Date(Date.now() - (i % 20 + 2) * 24 * 3600 * 1000).toISOString()
    });
  }
  return result;
};

const FULL_PAYMENTS = fillPayments();

const SEED_EXPORTS: Export[] = [
  { id: 'e0000001-0000-0000-0000-000000000001', order_id: 'o0000001-0000-0000-0000-000000000001', country: 'South Africa', readiness_score: 100, status: 'approved', missing_requirements: [], certificates: { phytosanitary: 'ISSUED', sabs: 'APPROVED' }, created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'e0000001-0000-0000-0000-000000000002', order_id: 'o0000001-0000-0000-0000-000000000002', country: 'Botswana', readiness_score: 100, status: 'approved', missing_requirements: [], certificates: { import_permit: 'ISSUED', quality_cert: 'ISSUED' }, created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() },
  { id: 'e0000001-0000-0000-0000-000000000003', order_id: 'o0000001-0000-0000-0000-000000000003', country: 'South Africa', readiness_score: 85, status: 'pending_approval', missing_requirements: ['Quality Verification Audit'], certificates: { phytosanitary: 'ISSUED' }, created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
  { id: 'e0000001-0000-0000-0000-000000000004', order_id: 'o0000001-0000-0000-0000-000000000004', country: 'Namibia', readiness_score: 60, status: 'incomplete', missing_requirements: ['Customs Declaration Clearance', 'SADC Certificate of Origin'], certificates: { veterinary_cert: 'ISSUED' }, created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
];

const fillExports = (): Export[] => {
  const result = [...SEED_EXPORTS];
  const countries = ['Botswana', 'Zimbabwe', 'Zambia', 'Namibia', 'South Africa'];
  const statuses: Export['status'][] = ['approved', 'pending_approval', 'incomplete', 'rejected'];

  for (let i = result.length + 1; i <= 20; i++) {
    const order = FULL_ORDERS[i % FULL_ORDERS.length];
    const country = countries[i % countries.length];
    const status = statuses[i % statuses.length];
    const score = status === 'approved' ? 100 : status === 'pending_approval' ? 85 : status === 'incomplete' ? 45 : 20;
    const missing = status === 'incomplete' ? ['SADC Customs Dec', 'Quality Standard Verification'] : status === 'rejected' ? ['Phytosanitary Certification Failed'] : [];

    result.push({
      id: `e0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`,
      order_id: order.id,
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
  const [farms, setFarms] = useState<Farm[]>(SEED_FARMS);
  const [listings, setListings] = useState<CommodityListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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

  useEffect(() => {
    const fetchLiveDb = async () => {
      if (!supabase) {
        console.warn("Supabase is not configured. Skipping live data fetch.");
        // Fallback to mock data
        setUsers(SEED_USERS);
        setFarms(SEED_FARMS);
        setListings(SEED_LISTINGS);
        setOrders(FULL_ORDERS);
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
          setFarms(SEED_FARMS);
          setListings(SEED_LISTINGS);
          setOrders(FULL_ORDERS);
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

        // Map live RFQs -> CommodityListing (temporary bridge)
        const mappedListings: CommodityListing[] = (dbRfqs || []).map((rfq: any) => ({
          id: rfq.id,
          farm_id: rfq.buyer_org_id,
          commodity: rfq.title as any || 'Maize',
          quantity: 100, // mock mapping
          price: 300,
          status: rfq.status === 'open' ? 'available' : 'sold',
          export_ready: true,
          harvest_date: rfq.deadline,
          photos: ['/maize.png'],
          storage_availability: 'Regional Storage',
          country_of_origin: rfq.organizations?.country || 'Botswana',
          created_at: rfq.created_at
        }));

        // Map live Contracts -> Orders
        const mappedOrders: Order[] = (dbContracts || []).map((contract: any) => ({
          id: contract.id,
          buyer_id: contract.buyer_org_id,
          listing_id: contract.rfq_id,
          quantity: 100,
          amount: 30000,
          status: contract.status === 'active' ? 'approved' : contract.status === 'completed' ? 'completed' : 'pending',
          created_at: contract.created_at
        }));

        setUsers(mappedUsers);
        setListings(mappedListings);
        setOrders(mappedOrders);

        // Keep static/unmigrated data as mock
        setFarms(SEED_FARMS);
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
  const addListing = (newListing: Omit<CommodityListing, 'id' | 'created_at'>) => {
    const created: CommodityListing = {
      ...newListing,
      id: `l0000000-0000-0000-0000-${(listings.length + 1).toString().padStart(12, '0')}`,
      created_at: new Date().toISOString()
    };
    const updatedList = [created, ...listings];
    saveState('pt_listings', updatedList, setListings);
    return created;
  };

  const updateListing = (id: string, updates: Partial<CommodityListing>) => {
    const updated = listings.map(l => l.id === id ? { ...l, ...updates } : l);
    saveState('pt_listings', updated, setListings);
  };

  const placeOrder = (listingId: string, quantity: number) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) throw new Error("Listing not found");

    const amount = quantity * listing.price;
    const newOrder: Order = {
      id: `o0000000-0000-0000-0000-${(orders.length + 1).toString().padStart(12, '0')}`,
      buyer_id: currentUser?.id || 'b2000000-0000-0000-0000-000000000001',
      listing_id: listingId,
      quantity,
      amount,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Update listing status or decrease quantity
    const updatedListings = listings.map(l => {
      if (l.id === listingId) {
        const remaining = l.quantity - quantity;
        return {
          ...l,
          quantity: remaining > 0 ? remaining : 0,
          status: remaining <= 0 ? 'sold' : 'reserved' as any
        };
      }
      return l;
    });

    // Create payment entry
    const newPayment: Payment = {
      id: `p0000000-0000-0000-0000-${(payments.length + 1).toString().padStart(12, '0')}`,
      order_id: newOrder.id,
      amount,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Create export entry
    const newExport: Export = {
      id: `e0000000-0000-0000-0000-${(exports.length + 1).toString().padStart(12, '0')}`,
      order_id: newOrder.id,
      country: currentUser?.country || 'South Africa',
      readiness_score: listing.export_ready ? 85 : 45,
      status: listing.export_ready ? 'pending_approval' : 'incomplete',
      missing_requirements: listing.export_ready 
        ? ['Quality Verification Audit'] 
        : ['SADC Certificate of Origin', 'Phytosanitary Certification', 'Quality Verification Audit'],
      certificates: {},
      created_at: new Date().toISOString()
    };

    // Create empty shipment entry (pending assignment)
    const newShipment: Shipment = {
      id: `s0000000-0000-0000-0000-${(shipments.length + 1).toString().padStart(12, '0')}`,
      order_id: newOrder.id,
      transporter_id: null,
      status: 'pending',
      route_from: listing.storage_availability.includes('(') 
        ? listing.storage_availability.split('(')[1].replace(')', '') 
        : listing.country_of_origin,
      route_to: currentUser?.country || 'South Africa',
      gps: null,
      transport_mode: 'Road',
      created_at: new Date().toISOString()
    };

    saveState('pt_listings', updatedListings, setListings);
    saveState('pt_orders', [newOrder, ...orders], setOrders);
    saveState('pt_payments', [newPayment, ...payments], setPayments);
    saveState('pt_exports', [newExport, ...exports], setExports);
    saveState('pt_shipments', [newShipment, ...shipments], setShipments);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    saveState('pt_orders', updated, setOrders);
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
              setOrders(prev => {
                const uOrders = prev.map(o => o.id === ship.order_id ? { ...o, status: 'completed' as const } : o);
                if (typeof window !== 'undefined') localStorage.setItem('pt_orders', JSON.stringify(uOrders));
                return uOrders;
              });
              setPayments(prev => {
                const uPayments = prev.map(p => p.order_id === ship.order_id ? { ...p, status: 'released' as const } : p);
                if (typeof window !== 'undefined') localStorage.setItem('pt_payments', JSON.stringify(uPayments));
                return uPayments;
              });
              setExports(prev => {
                const uExports = prev.map(e => e.order_id === ship.order_id ? { ...e, status: 'approved' as const, readiness_score: 100 } : e);
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
      triggerEvent('payment.released', { id: paymentId, order_id: pm.order_id, amount: pm.amount });
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

  const addFarm = (newFarm: Omit<Farm, 'id'>) => {
    const created: Farm = {
      ...newFarm,
      id: `fa100000-0000-0000-0000-${(farms.length + 1).toString().padStart(12, '0')}`
    };
    const updated = [...farms, created];
    saveState('pt_farms', updated, setFarms);
    triggerEvent('farm.registered', created);
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
      localStorage.removeItem('pt_farms');
      localStorage.removeItem('pt_listings');
      localStorage.removeItem('pt_orders');
      localStorage.removeItem('pt_shipments');
      localStorage.removeItem('pt_payments');
      localStorage.removeItem('pt_exports');
      localStorage.removeItem('pt_cooperatives');
      localStorage.removeItem('pt_financing_requests');
      localStorage.removeItem('pt_webhooks');
      localStorage.removeItem('pt_api_keys');
      localStorage.removeItem('pt_event_logs');
      localStorage.removeItem('pt_current_user');
      localStorage.removeItem('pt_trade_agreements');
      localStorage.removeItem('pt_trade_corridors');
      localStorage.removeItem('pt_nda_signed');
      localStorage.removeItem('pt_nda_details');
      localStorage.removeItem('pt_terms_signed');
      localStorage.removeItem('pt_terms_details');
 
      setUsers(SEED_USERS);
      setFarms(SEED_FARMS);
      setListings(SEED_LISTINGS);
      setOrders(FULL_ORDERS);
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
      farms,
      listings,
      orders,
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
      addListing,
      updateListing,
      placeOrder,
      updateOrderStatus,
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
      addFarm,
      registerUser,
      updateUserKycStatus,
      updateTradeCorridor
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
