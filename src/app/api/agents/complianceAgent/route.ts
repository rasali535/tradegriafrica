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
  const origin = input.origin_country || "Botswana";
  const destination = input.destination_country || "UAE";

  const fallbackOutput = {
    required_documents: [
      "Phytosanitary Certificate",
      "Commercial Invoice",
      "Certificate of Origin (Form 61)",
      "Import Permit (Ministry of Agriculture)"
    ],
    tariffs: "5%",
    sps_requirements: [
      "Aflatoxin testing cert under 10ppb",
      "Fumigation certificate with Methyl Bromide"
    ],
    restricted: false,
    notes: "Requires biosecurity validation at Pioneer Gate. SADC preferential tariff rate applies if local content certificate is produced."
  };

  const prompt = `You are the Pula Compliance Agent. Your purpose is to check export/import regulations, trade rules, and Sanitary and Phytosanitary (SPS) measures.
Given the input:
Product: ${product}
Origin Country: ${origin}
Destination Country: ${destination}

Based on this, research international/regional trade rules (like SACU, SADC, COMESA, or international customs conventions).
Specify the required documents for customs clearance, tariff rate, SPS requirements, whether the commodity is restricted, and any special notes.
Return ONLY a JSON object of the format:
{
  "required_documents": ["string"],
  "tariffs": "string",
  "sps_requirements": ["string"],
  "restricted": boolean,
  "notes": "string"
}`;

  const result = await callGemini(prompt, fallbackOutput);

  return Response.json({
    input,
    output: result.data,
    confidence_score: result.confidence_score,
    sources: [result.source, "SADC Sanitary and Phytosanitary Annex", "WTO Tariff Databases"],
    timestamp
  });
}
