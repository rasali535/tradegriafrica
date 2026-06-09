import { NextRequest } from "next/server";
import { callGemini } from "@/lib/gemini";

// Helper to run Trade Discovery logic
async function runTradeDiscovery(product: string, quantity: number, origin: string) {
  const prompt = `You are the Trade Discovery Agent inside an AI-powered export platform for African SMEs.
Your job is to identify REAL international buyers, markets, and pricing opportunities for agricultural and commodity exports.
You MUST pull information from live commodity exchanges and use REAL data, REAL corporate buyer names, and REAL current market prices. Avoid generic names like 'Dubai Foods LLC'. Provide actual corporations that import these goods.

INPUT:
${JSON.stringify({ product, quantity: quantity.toString(), origin_country: origin }, null, 2)}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "buyers": [
    {
      "country": "string",
      "buyer_name": "string (REAL company name)",
      "estimated_price_per_unit": number,
      "currency": "USD",
      "demand_strength": "low" | "medium" | "high"
    }
  ],
  "recommended_markets": ["string"],
  "pricing_insight": "string",
  "best_export_windows": "string",
  "risks": ["string"],
  "confidence_score": number (0.0 to 1.0)
}`;

  const fallback = {
    buyers: [
      { country: "South Africa", buyer_name: "Tiger Brands Ltd", estimated_price_per_unit: 320, currency: "USD", demand_strength: "high" },
      { country: "Namibia", buyer_name: "Namib Mills", estimated_price_per_unit: 340, currency: "USD", demand_strength: "medium" }
    ],
    recommended_markets: ["South Africa", "Namibia", "Zimbabwe"],
    pricing_insight: "Prices are stable with slight upward pressure.",
    best_export_windows: "Q3 2026",
    risks: ["Plumtree border post backlog"],
    confidence_score: 0.94
  };

  return callGemini(prompt, fallback);
}

// Helper to run Compliance logic
async function runCompliance(product: string, origin: string, destination: string) {
  const prompt = `You are the Trade Compliance Agent for an international export platform.
Your role is to ensure that any cross-border trade complies with import/export regulations, agricultural and sanitary rules, tariffs, and trade agreements.

INPUT:
${JSON.stringify({ product, origin_country: origin, destination_country: destination }, null, 2)}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "required_documents": ["string"],
  "tariffs_estimate": "string",
  "sps_requirements": ["string"],
  "restricted": boolean,
  "risk_summary": "string",
  "confidence_score": number (0.0 to 1.0)
}`;

  const fallback = {
    required_documents: ["Phytosanitary Certificate", "Commercial Invoice", "SADC Certificate of Origin (Form 61)", "Bilateral Import Permit"],
    tariffs_estimate: "0% Preferential SADC Tariff Rate",
    sps_requirements: ["Aflatoxin limit validation"],
    restricted: false,
    risk_summary: "Low regulatory restrictions, standard border checks apply.",
    confidence_score: 0.96
  };

  return callGemini(prompt, fallback);
}

// Helper to run Logistics logic
async function runLogistics(origin: string, destination: string, weight: number) {
  const prompt = `You are the Logistics Optimization Agent for global commodity trade.
You design shipping routes, estimate costs, and evaluate logistics feasibility.

INPUT:
${JSON.stringify({ origin, destination, cargo_type: "agricultural", weight_tons: weight }, null, 2)}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "routes": [
    {
      "route": "string",
      "estimated_cost_usd": "string",
      "transit_time_days": "string",
      "mode": "sea" | "road" | "rail" | "air" | "multimodal"
    }
  ],
  "recommended_port": "string",
  "logistics_risks": ["string"],
  "confidence_score": number (0.0 to 1.0)
}`;

  const fallback = {
    routes: [
      { route: "Gaborone to Johannesburg via Pioneer Gate (Trans-Kalahari Corridor)", estimated_cost_usd: "3500", transit_time_days: "4", mode: "road" }
    ],
    recommended_port: "Durban Port",
    logistics_risks: ["Pioneer Gate border queue congestion"],
    confidence_score: 0.95
  };

  return callGemini(prompt, fallback);
}

// Helper to run Documentation logic
async function runDocumentation(seller: string, buyer: string, product: string, quantity: number, price: number) {
  const prompt = `You are the Trade Documentation Agent.
You generate structured export documents used in international trade transactions.

INPUT:
${JSON.stringify({ seller, buyer, product, quantity: quantity.toString(), price_per_unit: price.toString() }, null, 2)}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "commercial_invoice": {
    "seller": "string",
    "buyer": "string",
    "product": "string",
    "quantity": number,
    "unit_price": number,
    "total_value": number,
    "currency": "USD"
  },
  "packing_list": {
    "items": [
      {
        "item_name": "string",
        "quantity": "string",
        "package_type": "string"
      }
    ],
    "weight_estimate": "string"
  },
  "certificate_of_origin": {
    "origin_country": "string",
    "certification_note": "string"
  },
  "document_status": "generated"
}`;

  const fallback = {
    commercial_invoice: {
      seller,
      buyer,
      product,
      quantity,
      unit_price: price,
      total_value: quantity * price,
      currency: "USD"
    },
    packing_list: {
      items: [{ item_name: product, quantity: `${quantity} Tons`, package_type: "50kg Polypropylene bags" }],
      weight_estimate: `${quantity} metric tons`
    },
    certificate_of_origin: {
      origin_country: "Botswana",
      certification_note: "Generated for export facilitation under SADC Rules of Origin"
    },
    document_status: "generated"
  };

  return callGemini(prompt, fallback);
}

// Helper to run Deal Closing logic
async function runDealClosing(buyer: string, seller: string, product: string, price: number) {
  const prompt = `You are the Deal Closing Agent in an AI-powered export platform.
Your job is to convert trade opportunities into structured business deals.

INPUT:
${JSON.stringify({ buyer, seller, product, price_per_unit: price }, null, 2)}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "negotiation_message": "string",
  "deal_summary": {
    "buyer": "string",
    "seller": "string",
    "product": "string",
    "agreed_price": number,
    "status": "draft" | "negotiation" | "ready" | "closed"
  },
  "next_steps": ["string"],
  "deal_readiness_score": number (0.0 to 1.0)
}`;

  const fallback = {
    negotiation_message: `Deal Closing Agent has drafted contract at $${price}/ton.`,
    deal_summary: {
      buyer,
      seller,
      product,
      agreed_price: price,
      status: "ready"
    },
    next_steps: ["Confirm contract terms with buyer", "Setup escrow in SADC registry"],
    deal_readiness_score: 0.95
  };

  return callGemini(prompt, fallback);
}

// Helper to run Customs/BESW Filing logic
async function runCustomsClearance(origin: string, destination: string, product: string, price: number, quantity: number) {
  const isBotswana = origin.toLowerCase().includes("botswana");

  const prompt = `You are the Official Customs Integration Agent for TradeGrid Africa.
Your job is to generate a simulated electronic customs declaration (SAD500) and regulatory clearance payload for cross-border SADC trade.

${isBotswana ? 
`CRITICAL BOTSWANA RULES:
1. Botswana uses the BESW (Botswana Electronic Single Window) portal via BURS (ecustoms.burs.org.bw).
2. BESW acts as a central router for Other Government Agencies (OGAs).
3. The Botswana Bureau of Standards (BOBS) mandates all import/export permits go strictly through this platform.
4. Your payload must simulate mapping the SAD 500 schema and packaging digitized SCO, ICPO, and TSA documents for concurrent BOBS compliance risk assessment.
5. Provide a BESW/BOBS specific assessment ID.` 
: 
`CRITICAL RULES:
1. Use standard ASYCUDA World protocols for SADC electronic lodging.`}

INPUT:
${JSON.stringify({ origin, destination, product, total_value_usd: price * quantity }, null, 2)}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "system_used": "string (e.g. 'BESW / BURS (Botswana)' or 'ASYCUDA World')",
  "assessment_id": "string",
  "sad500_registration_no": "string",
  "office_of_clearance": "string",
  "duty_taxes_calculated": "string",
  "oga_routing_status": "string (e.g. 'BOBS Compliance Risk Assessment: Concurrent Clearance Active')",
  "status": "cleared" | "pending_inspection",
  "confidence_score": number (0.0 to 1.0)
}`;

  const fallback = {
    system_used: isBotswana ? "BESW / BURS (Botswana Electronic Single Window)" : "ASYCUDA World",
    assessment_id: isBotswana ? "BESW-" + Math.floor(100000 + Math.random() * 900000) : "ASY-" + Math.floor(100000 + Math.random() * 900000),
    sad500_registration_no: "SAD" + Math.floor(10000 + Math.random() * 90000) + "BW",
    office_of_clearance: "Plumtree/Ramokgwebana Border Post",
    duty_taxes_calculated: "$0.00 (SACU Zero Tariff)",
    oga_routing_status: isBotswana ? "BOBS Compliance Risk Assessment: Concurrent Clearance Active. SCO/ICPO/TSA digitized payload verified." : "Standard SADC Clearance",
    status: "cleared",
    confidence_score: 0.99
  };

  return callGemini(prompt, fallback);
}
// Helper to run Regulatory Inquiry logic
async function runRegulatoryInquiry(query: string) {
  const prompt = `You are the Regulatory Inquiry Agent for TradeGrid Africa.
Your job is to answer specific questions about SADC laws, cross-border movement bans (e.g. Foot-and-Mouth Disease outbreaks), phytosanitary requirements, and general customs protocols.

INPUT QUERY:
"${query}"

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "answer": "string (A detailed, professional response to the query)",
  "sources": ["string (e.g. 'SADC Protocol on Trade, Article 4', 'Botswana Meat Commission')"],
  "confidence_score": number (0.0 to 1.0)
}`;

  const fallback = {
    answer: "Based on current SADC regulations, there may be specific movement restrictions or phytosanitary requirements for this commodity. Please consult the local Ministry of Agriculture for real-time updates on cross-border disease control zones.",
    sources: ["SADC Protocol on Trade", "Regional Sanitary and Phytosanitary Guidelines"],
    confidence_score: 0.85
  };

  return callGemini(prompt, fallback);
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

  // Parse natural language command for Intent and parameters
  const parsePrompt = `You are the Pula Orchestration Engine. Parse this natural language trade request:
"${query}"

Classify the intent as either "transaction" (booking/exporting a trade) or "inquiry" (asking about laws, bans, regulations, or rules).

Extract parameters if applicable:
- Product (e.g. maize, beef, sorghum, horticulture)
- Quantity (default to 10 if not mentioned)
- Origin Country (default to Botswana if not mentioned)
- Destination Country (if not mentioned, suggest South Africa)

Return ONLY a JSON object:
{
  "intent": "transaction" | "inquiry",
  "product": "string",
  "quantity": number,
  "origin_country": "string",
  "destination_country": "string"
}`;

  const parseFallback = {
    intent: "transaction",
    product: "maize",
    quantity: 10,
    origin_country: "Botswana",
    destination_country: "South Africa"
  };

  try {
    const parseResult = await callGemini(parsePrompt, parseFallback);
    const parsed = parseResult.data || parseFallback;

    // Check intent
    if (parsed.intent === "inquiry") {
      const inquiryStartTime = Date.now();
      const inquiryResult = await runRegulatoryInquiry(query);
      const inquiryLatency = Date.now() - inquiryStartTime;

      return Response.json({
        intent: "inquiry",
        parsed_request: parsed,
        inquiry_response: inquiryResult.data,
        pipeline_logs: [
          {
            agent: "regulatoryInquiryAgent",
            input: { query },
            output: inquiryResult.data,
            latency_ms: inquiryResult.latency_ms || inquiryLatency,
            confidence_score: inquiryResult.data?.confidence_score || inquiryResult.confidence_score,
            timestamp: new Date().toISOString()
          }
        ],
        timestamp
      });
    }

    // Run Step 1: Trade Discovery (if intent === "transaction")
    const discoveryStartTime = Date.now();
    const discoveryResult = await runTradeDiscovery(parsed.product, parsed.quantity, parsed.origin_country);
    const discoveryLatency = Date.now() - discoveryStartTime;

    const primaryBuyer = discoveryResult.data?.buyers?.[0] || {};
    const buyerName = primaryBuyer.buyer_name || primaryBuyer.buyer_type || "Tiger Brands Group";
    const sellerName = `${parsed.origin_country} National Agricultural Cooperative`;
    const pricePerUnit = primaryBuyer.estimated_price_per_unit || 320;
    const targetDestination = primaryBuyer.country || "South Africa";

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
      sellerName,
      buyerName,
      parsed.product,
      parsed.quantity,
      pricePerUnit
    );
    const docLatency = Date.now() - docStartTime;

    // Run Step 5: Deal Closing
    const closingStartTime = Date.now();
    const closingResult = await runDealClosing(
      buyerName,
      sellerName,
      parsed.product,
      pricePerUnit
    );
    const closingLatency = Date.now() - closingStartTime;

    // Run Step 6: Customs/BESW Filing
    const customsStartTime = Date.now();
    const customsResult = await runCustomsClearance(
      parsed.origin_country,
      targetDestination,
      parsed.product,
      pricePerUnit,
      parsed.quantity
    );
    const customsLatency = Date.now() - customsStartTime;

    // Compile logs matching the agent outputs
    const logs = [
      {
        agent: "tradeDiscoveryAgent",
        input: { product: parsed.product, quantity: parsed.quantity.toString(), origin_country: parsed.origin_country },
        output: discoveryResult.data,
        latency_ms: discoveryResult.latency_ms || discoveryLatency,
        confidence_score: discoveryResult.data?.confidence_score || discoveryResult.confidence_score,
        timestamp: new Date().toISOString()
      },
      {
        agent: "complianceAgent",
        input: { product: parsed.product, origin_country: parsed.origin_country, destination_country: targetDestination },
        output: complianceResult.data,
        latency_ms: complianceResult.latency_ms || complianceLatency,
        confidence_score: complianceResult.data?.confidence_score || complianceResult.confidence_score,
        timestamp: new Date().toISOString()
      },
      {
        agent: "logisticsAgent",
        input: { origin: parsed.origin_country, destination: targetDestination, cargo_type: "agricultural", weight_tons: parsed.quantity },
        output: logisticsResult.data,
        latency_ms: logisticsResult.latency_ms || logisticsLatency,
        confidence_score: logisticsResult.data?.confidence_score || logisticsResult.confidence_score,
        timestamp: new Date().toISOString()
      },
      {
        agent: "documentationAgent",
        input: { seller: sellerName, buyer: buyerName, product: parsed.product, quantity: parsed.quantity.toString(), price_per_unit: pricePerUnit.toString() },
        output: docResult.data,
        latency_ms: docLatency,
        confidence_score: docResult.confidence_score,
        timestamp: new Date().toISOString()
      },
      {
        agent: "dealClosingAgent",
        input: { buyer: buyerName, seller: sellerName, product: parsed.product, price_per_unit: pricePerUnit },
        output: closingResult.data,
        latency_ms: closingLatency,
        confidence_score: closingResult.data?.deal_readiness_score || closingResult.confidence_score,
        timestamp: new Date().toISOString()
      },
      {
        agent: "customsFilingAgent",
        input: { origin: parsed.origin_country, destination: targetDestination, product: parsed.product, value: pricePerUnit * parsed.quantity, digitized_documents: ["SCO", "ICPO", "TSA"] },
        output: customsResult.data,
        latency_ms: customsLatency,
        confidence_score: customsResult.data?.confidence_score || customsResult.confidence_score,
        timestamp: new Date().toISOString()
      }
    ];

    return Response.json({
      intent: "transaction",
      parsed_request: parsed,
      trade_opportunity: discoveryResult.data,
      compliance: complianceResult.data,
      logistics: logisticsResult.data,
      customs_clearance: customsResult.data,
      documents_ready: true,
      deal_ready: true,
      recommended_next_action: "contact_buyer",
      pipeline_logs: logs,
      timestamp
    });
  } catch (err: any) {
    return Response.json({ error: err.message || "Orchestrator pipeline failed" }, { status: 500 });
  }
}

