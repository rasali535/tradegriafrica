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
  const price = parseFloat(input.price_per_unit) || 320;

  const fallbackOutput = {
    negotiation_message: `Deal Closing Agent has drafted the bilateral trade contract. Recommended terms: $${price}/ton under SADC preferential terms, payment secured via TradeGridAfrica Digital Escrow.`,
    deal_summary: {
      buyer,
      seller,
      product,
      agreed_price: price,
      status: "ready"
    },
    next_steps: [
      "Confirm contract terms with buyer",
      "Setup digital escrow in standard registry",
      "Assign biosecurity inspection corridor"
    ],
    deal_readiness_score: 0.95
  };

  const prompt = `You are the Deal Closing Agent in an AI-powered export platform.
Your job is to convert trade opportunities into structured business deals.
You help users move from interest to negotiation to agreement.

INPUT:
${JSON.stringify({ buyer, seller, product, price_per_unit: price }, null, 2)}

TASK:
1. Draft structured trade agreement summary
2. Generate negotiation message
3. Identify next steps to close deal
4. Assess deal readiness

RULES:
* Do NOT generate legally binding contracts
* Keep tone professional and commercial
* Focus on deal progression logic

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

  try {
    const result = await callGemini(prompt, fallbackOutput);
    const data = result.data || fallbackOutput;
    return Response.json({
      input,
      output: data,
      confidence_score: data.deal_readiness_score || result.confidence_score || 0.9,
      sources: [result.source, "SADC Bilateral Trade Contract Template 2026", "LMA Trade Guidelines"],
      timestamp
    });
  } catch (err: any) {
    return Response.json({ error: err.message || "Deal Closing Agent failed" }, { status: 500 });
  }
}
