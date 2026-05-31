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

  const buyer = input.buyer || "Dubai Foods LLC";
  const seller = input.seller || "ABC Farmers Co-op";
  const product = input.product || "maize";
  const price = input.price || 320;

  const query = `?buyer=${encodeURIComponent(buyer)}&seller=${encodeURIComponent(seller)}&product=${encodeURIComponent(product)}&price=${price}`;

  const fallbackOutput = {
    contract_draft: `/api/documents/contract${query}`,
    negotiation_message: `Deal Closing Agent has drafted the bilateral trade contract. Recommended terms: $${price}/ton under SADC preferential terms, payment secured via PulaTrade Digital Escrow.`,
    deal_status: "pending",
    next_steps: [
      "Confirm contract terms with buyer",
      "Setup digital escrow in standard registry",
      "Assign biosecurity inspection corridor"
    ]
  };

  const prompt = `You are the Pula Deal Closing Agent. Your purpose is to convert trade opportunities into binding legal transactions.
Given the input:
Buyer: ${buyer}
Seller: ${seller}
Product: ${product}
Price: ${price}

Formulate the contract status, negotiation message, and next steps for both parties.
Recommend the contract draft endpoint: /api/documents/contract${query}
Return ONLY a JSON object of the format:
{
  "contract_draft": "string",
  "negotiation_message": "string",
  "deal_status": "pending" | "signed" | "approved",
  "next_steps": ["string"]
}`;

  const result = await callGemini(prompt, fallbackOutput);

  // Normalize structure
  const data = result.data;
  data.contract_draft = `/api/documents/contract${query}`;
  if (!data.deal_status) data.deal_status = "pending";

  return Response.json({
    input,
    output: data,
    confidence_score: result.confidence_score,
    sources: [result.source, "SADC Bilateral Trade Contract Template 2026", "LMA Trade Guidelines"],
    timestamp
  });
}
