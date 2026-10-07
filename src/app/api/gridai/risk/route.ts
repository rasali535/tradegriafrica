import { NextRequest } from "next/server";
import { callAI } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const exportReadiness = Number(body.export_readiness ?? 80);
  const corridorDelay = Number(body.corridor_delay_hours ?? 0);
  const shipmentStatus = String(body.shipment_status ?? "pending");
  const missingDocs = Array.isArray(body.missing_documents) ? body.missing_documents : [];
  const transporterAssigned = Boolean(body.transporter_assigned);

  let score = 10;
  const factors: string[] = [];

  if (exportReadiness < 80) {
    score += Math.min(35, Math.round((80 - exportReadiness) * 0.8));
    factors.push(`Export readiness is ${exportReadiness}%`);
  }
  if (missingDocs.length) {
    score += Math.min(25, missingDocs.length * 8);
    factors.push(`${missingDocs.length} required document(s) missing`);
  }
  if (corridorDelay > 6) {
    score += Math.min(20, Math.round(corridorDelay));
    factors.push(`Corridor delay is ${corridorDelay} hours`);
  }
  if (!transporterAssigned && shipmentStatus !== "delivered") {
    score += 10;
    factors.push("No transporter assigned");
  }
  if (shipmentStatus === "transit") score += 4;

  score = Math.max(0, Math.min(100, score));
  const fallback = {
    score,
    category: score >= 70 ? "high" : score >= 40 ? "medium" : "low",
    delay_probability: Math.min(0.95, score / 110),
    factors,
    recommendation:
      score >= 70
        ? "Hold clearance and resolve compliance or corridor risks before proceeding."
        : score >= 40
          ? "Proceed with enhanced review and active corridor monitoring."
          : "Proceed under normal controls with standard monitoring.",
    confidence_score: 0.9,
  };

  const prompt = `You are GridAi, the trade risk intelligence layer inside TradeGrid Africa.
Assess this trade execution risk. Return strict JSON only.

INPUT:
${JSON.stringify({
    export_readiness: exportReadiness,
    corridor_delay_hours: corridorDelay,
    shipment_status: shipmentStatus,
    missing_documents: missingDocs,
    transporter_assigned: transporterAssigned,
    deterministic_score: score,
  }, null, 2)}

OUTPUT:
{
  "score": number,
  "category": "low" | "medium" | "high",
  "delay_probability": number,
  "factors": ["string"],
  "recommendation": "string",
  "confidence_score": number
}`;

  try {
    const result = await callAI(prompt, fallback);
    return Response.json({
      output: { ...fallback, ...(result.data || {}) },
      source: result.source,
      latency_ms: result.latency_ms,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json({
      output: fallback,
      source: "deterministic-gridai-fallback",
      timestamp: new Date().toISOString(),
    });
  }
}
