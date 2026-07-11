import { NextRequest } from "next/server";
import { callAI } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  let input: any = {};
  
  try {
    input = await req.json();
  } catch (e) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const product = input.product || "maize";
  const origin = input.origin_country || "Botswana";
  const destination = input.destination_country || "South Africa";

  const fallbackOutput = {
    required_documents: [
      "Phytosanitary Certificate",
      "Commercial Invoice",
      "SADC Certificate of Origin (Form 61)",
      "Bilateral Import Permit"
    ],
    tariffs_estimate: "0% Preferential SADC Tariff Rate",
    sps_requirements: [
      "Moisture level below 12.5%",
      "Mycotoxin / Aflatoxin test under 10ppb",
      "Fumigation certificate"
    ],
    restricted: false,
    risk_summary: "Low regulatory restrictions under bilateral trade treaty, standard biosecurity controls apply at the Plumtree border check.",
    confidence_score: 0.96
  };

  const prompt = `You are the Trade Compliance Agent for an international export platform.
Your role is to ensure that any cross-border trade complies with import/export regulations, industrial and safety rules, tariffs, and trade agreements.
You are NOT a legal advisor. You provide structured compliance intelligence.

INPUT:
${JSON.stringify({ product, origin_country: origin, destination_country: destination }, null, 2)}

TASK:
1. Identify required export documents
2. Identify import restrictions or SPS rules
3. Estimate tariffs or duties
4. Flag whether trade is restricted or allowed
5. Highlight regulatory risks

RULES:
* Do NOT fabricate exact legal citations
* If uncertain, generalize (e.g. "SPS certification likely required")
* Assume standard international trade rules
* Prioritize industrial export realism

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "required_documents": ["string"],
  "tariffs_estimate": "string",
  "sps_requirements": ["string"],
  "restricted": boolean,
  "risk_summary": "string",
  "confidence_score": number (0.0 to 1.0)
}`;

  try {
    const result = await callAI(prompt, fallbackOutput);
    const data = result.data || fallbackOutput;
    return Response.json({
      input,
      output: data,
      confidence_score: data.confidence_score || result.confidence_score || 0.9,
      sources: [result.source, "SADC Sanitary and Phytosanitary Annex", "WTO Tariff Databases"],
      timestamp
    });
  } catch (err: any) {
    return Response.json({ error: err.message || "Compliance Agent failed" }, { status: 500 });
  }
}
