import { NextRequest } from "next/server";
import { callGemini } from "@/lib/gemini";

// Helper to run Trade Discovery logic
async function runTradeDiscovery(product: string, quantity: number, origin: string) {
  const prompt = `You are the Pula Trade Discovery Agent. Given the input:
Product: ${product}
Quantity: ${quantity} tons
Origin Country: ${origin}

Research and generate a realistic trade opportunities report. Provide at least 2 potential buyers with their types, estimated price per ton, and demand strength.
Specify recommended markets, best export window, and key risks.
Return ONLY a JSON object:
{
  "buyers": [
    {
      "country": "string",
      "buyer_type": "string",
      "estimated_price_per_ton": number,
      "demand_strength": "high" | "medium" | "low"
    }
  ],
  "recommended_markets": ["string"],
  "best_export_window": "string",
  "risks": ["string"]
}`;

  const fallback = {
    buyers: [
      { country: "South Africa", buyer_type: "food distributor", estimated_price_per_ton: 320, demand_strength: "high" },
      { country: "Zimbabwe", buyer_type: "milling co", estimated_price_per_ton: 310, demand_strength: "medium" }
    ],
    recommended_markets: ["South Africa", "Zimbabwe"],
    best_export_window: "Q3 2026",
    risks: ["Border backlog at Pioneer Gate"]
  };

  return callGemini(prompt, fallback);
}

// Helper to run Compliance logic
async function runCompliance(product: string, origin: string, destination: string) {
  const prompt = `You are the Pula Compliance Agent. Given the input:
Product: ${product}
Origin Country: ${origin}
Destination Country: ${destination}

Research required documents, tariff rate, SPS requirements, whether the commodity is restricted, and any special notes.
Return ONLY a JSON object:
{
  "required_documents": ["string"],
  "tariffs": "string",
  "sps_requirements": ["string"],
  "restricted": boolean,
  "notes": "string"
}`;

  const fallback = {
    required_documents: ["Phytosanitary Certificate", "Commercial Invoice", "Certificate of Origin"],
    tariffs: "0% SADC Preferential",
    sps_requirements: ["Aflatoxin limit validation"],
    restricted: false,
    notes: "Duty free under SADC trade rules."
  };

  return callGemini(prompt, fallback);
}

// Helper to run Logistics logic
async function runLogistics(origin: string, destination: string, weight: number) {
  const prompt = `You are the Pula Logistics Agent. Given the input:
Origin: ${origin}
Destination: ${destination}
Cargo Type: agricultural
Weight: ${weight} tons

Plan at least 2 potential transport routes (multimodal road, rail, and sea). Calculate realistic cost estimates and transit times.
Provide the recommended port for sea shipping and key risk factors.
Return ONLY a JSON object:
{
  "routes": [
    {
      "route": "string",
      "cost_estimate": number,
      "transit_time_days": number
    }
  ],
  "recommended_port": "string",
  "risk_factors": ["string"]
}`;

  const fallback = {
    routes: [
      { route: `${origin} to ${destination} via Trans-Kalahari Corridor`, cost_estimate: 3500, transit_time_days: 4 }
    ],
    recommended_port: "Durban",
    risk_factors: ["Fuel price updates"]
  };

  return callGemini(prompt, fallback);
}

// Helper to run Documentation logic
async function runDocumentation(seller: string, buyer: string, product: string, quantity: number, price: number) {
  const query = `?seller=${encodeURIComponent(seller)}&buyer=${encodeURIComponent(buyer)}&product=${encodeURIComponent(product)}&quantity=${quantity}&price=${price}`;
  return {
    data: {
      documents: {
        invoice: `/api/documents/invoice${query}`,
        packing_list: `/api/documents/packing_list${query}`,
        certificate_of_origin: `/api/documents/certificate_of_origin${query}`
      },
      status: "generated"
    },
    confidence_score: 0.98,
    source: "SADC Document Compiler Agent"
  };
}

// Helper to run Deal Closing logic
async function runDealClosing(buyer: string, seller: string, product: string, price: number) {
  const query = `?buyer=${encodeURIComponent(buyer)}&seller=${encodeURIComponent(seller)}&product=${encodeURIComponent(product)}&price=${price}`;
  return {
    data: {
      contract_draft: `/api/documents/contract${query}`,
      negotiation_message: `Deal Closing Agent has compiled terms: $${price}/ton under PulaTrade Smart Escrow.`,
      deal_status: "pending",
      next_steps: ["Confirm contract terms with buyer", "Setup escrow in SADC registry"]
    },
    confidence_score: 0.95,
    source: "Pula Deal Closing Counsel"
  };
}

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  let body: any = {};
  
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = body.query || "";
  if (!query) {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }

  const parseStartTime = Date.now();
  // Call Gemini to parse parameters
  const parsePrompt = `You are the Pula Orchestration Engine. Parse this natural language trade request:
"${query}"

Extract:
- Product (e.g. maize, beef, sorghum, horticulture)
- Quantity (default to 10 if not mentioned)
- Origin Country (default to Botswana if not mentioned)
- Destination Country (if not mentioned, suggest South Africa)

Return ONLY a JSON object:
{
  "product": "string",
  "quantity": number,
  "origin_country": "string",
  "destination_country": "string"
}`;

  const parseFallback = {
    product: "maize",
    quantity: 10,
    origin_country: "Botswana",
    destination_country: "South Africa"
  };

  const parseResult = await callGemini(parsePrompt, parseFallback);
  const parsed = parseResult.data || parseFallback;

  // Run Step 1: Trade Discovery
  const discoveryStartTime = Date.now();
  const discoveryResult = await runTradeDiscovery(parsed.product, parsed.quantity, parsed.origin_country);
  const discoveryLatency = Date.now() - discoveryStartTime;

  // Identify recommended buyer and destination
  const buyers = discoveryResult.data.buyers || [];
  const primaryBuyer = buyers[0] || { country: parsed.destination_country, buyer_type: "food distributor", estimated_price_per_ton: 320 };
  const targetDestination = primaryBuyer.country || parsed.destination_country;
  const pricePerTon = primaryBuyer.estimated_price_per_ton || 320;

  // Run Step 2: Compliance
  const complianceStartTime = Date.now();
  const complianceResult = await runCompliance(parsed.product, parsed.origin_country, targetDestination);
  const complianceLatency = Date.now() - complianceStartTime;

  // Run Step 3: Logistics
  const logisticsStartTime = Date.now();
  const logisticsResult = await runLogistics(parsed.origin_country, targetDestination, parsed.quantity);
  const logisticsLatency = Date.now() - logisticsStartTime;

  // Run Step 4: Documentation
  const docStartTime = Date.now();
  const docResult = await runDocumentation(
    "ABC Farmers Co-op",
    "Dubai Foods LLC",
    parsed.product,
    parsed.quantity,
    pricePerTon
  );
  const docLatency = Date.now() - docStartTime;

  // Run Step 5: Deal Closing
  const closingStartTime = Date.now();
  const closingResult = await runDealClosing(
    "Dubai Foods LLC",
    "ABC Farmers Co-op",
    parsed.product,
    pricePerTon
  );
  const closingLatency = Date.now() - closingStartTime;

  // Compile full pipeline logs
  const logs = [
    {
      agent: "tradeDiscoveryAgent",
      input: { product: parsed.product, quantity: parsed.quantity, origin_country: parsed.origin_country },
      output: discoveryResult.data,
      latency_ms: discoveryResult.latency_ms || discoveryLatency,
      confidence_score: discoveryResult.confidence_score,
      timestamp: new Date().toISOString()
    },
    {
      agent: "complianceAgent",
      input: { product: parsed.product, origin_country: parsed.origin_country, destination_country: targetDestination },
      output: complianceResult.data,
      latency_ms: complianceResult.latency_ms || complianceLatency,
      confidence_score: complianceResult.confidence_score,
      timestamp: new Date().toISOString()
    },
    {
      agent: "logisticsAgent",
      input: { origin: parsed.origin_country, destination: targetDestination, cargo_type: "agricultural", weight_tons: parsed.quantity },
      output: logisticsResult.data,
      latency_ms: logisticsResult.latency_ms || logisticsLatency,
      confidence_score: logisticsResult.confidence_score,
      timestamp: new Date().toISOString()
    },
    {
      agent: "documentationAgent",
      input: { seller: "ABC Farmers Co-op", buyer: "Dubai Foods LLC", product: parsed.product, quantity: parsed.quantity, price_per_ton: pricePerTon },
      output: docResult.data,
      latency_ms: docLatency,
      confidence_score: docResult.confidence_score,
      timestamp: new Date().toISOString()
    },
    {
      agent: "dealClosingAgent",
      input: { buyer: "Dubai Foods LLC", seller: "ABC Farmers Co-op", product: parsed.product, price: pricePerTon },
      output: closingResult.data,
      latency_ms: closingLatency,
      confidence_score: closingResult.confidence_score,
      timestamp: new Date().toISOString()
    }
  ];

  return Response.json({
    parsed_request: parsed,
    trade_opportunity: discoveryResult.data,
    compliance: complianceResult.data,
    logistics: logisticsResult.data,
    documents_ready: true,
    deal_ready: true,
    recommended_next_action: "contact_buyer",
    pipeline_logs: logs,
    timestamp
  });
}
