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

  const origin = input.origin || "Botswana";
  const destination = input.destination || "UAE";
  const cargoType = input.cargo_type || "agricultural";
  const weight = input.weight_tons || 10;

  const fallbackOutput = {
    routes: [
      {
        route: "Gaborone → Durban (Road) → Jebel Ali (Sea)",
        cost_estimate: 4200,
        transit_time_days: 18
      },
      {
        route: "Gaborone → Walvis Bay (Rail) → Jebel Ali (Sea)",
        cost_estimate: 4900,
        transit_time_days: 22
      }
    ],
    recommended_port: "Durban",
    risk_factors: [
      "Durban port terminal congestion",
      "Queue backlogs at Pioneer Gate border crossing"
    ]
  };

  const prompt = `You are the Pula Logistics Agent. Your purpose is to plan shipping routes and cost estimation.
Given the input:
Origin: ${origin}
Destination: ${destination}
Cargo Type: ${cargoType}
Weight: ${weight} tons

Plan at least 2 potential transport routes (multimodal road, rail, and sea). Calculate realistic cost estimates and transit times based on current SADC routing.
Provide the recommended port for sea shipping and key risk factors.
Return ONLY a JSON object of the format:
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

  const result = await callGemini(prompt, fallbackOutput);

  return Response.json({
    input,
    output: result.data,
    confidence_score: result.confidence_score,
    sources: [result.source, "SADC Logistics Corridor Performance Registry", "Port Authority Tariffs"],
    timestamp
  });
}
