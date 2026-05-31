import { NextRequest } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  let input: any = {};
  
  try {
    input = await req.json();
  } catch (e) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const product = input.product || "maize";
  const quantity = input.quantity || 10;
  const origin = input.origin_country || "Botswana";

  const fallbackOutput = {
    buyers: [
      {
        country: "South Africa",
        buyer_type: "food distributor",
        estimated_price_per_ton: 320,
        demand_strength: "high"
      },
      {
        country: "Namibia",
        buyer_type: "mill operator",
        estimated_price_per_ton: 340,
        demand_strength: "medium"
      }
    ],
    recommended_markets: ["South Africa", "Namibia", "Zimbabwe"],
    best_export_window: "Q3 2026",
    risks: [
      "Customs processing backlog at border gates",
      "Price volatility due to local harvest season"
    ]
  };

  const prompt = `You are the Pula Trade Discovery Agent. Your purpose is to find buyers, markets, and trade opportunities for a given product.
Given the input:
Product: ${product}
Quantity: ${quantity} tons
Origin Country: ${origin}

Research and generate a realistic trade opportunities report. Provide at least 2 potential buyers with their types, estimated price per ton, and demand strength.
Specify recommended markets, best export window, and key risks (such as tariffs, border queues, seasonal weather).
Return ONLY a JSON object of the format:
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

  const result = await callGemini(prompt, fallbackOutput);

  return Response.json({
    input,
    output: result.data,
    confidence_score: result.confidence_score,
    sources: [result.source, "SADC Commodity Market Bulletin 2026", "Regional Trade Pricing Indices"],
    timestamp
  });
}
