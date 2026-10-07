import { NextRequest } from "next/server";

function jitter(seed: number, amount: number) {
  const x = Math.sin(seed) * 10000;
  return (x - Math.floor(x) - 0.5) * amount;
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const shipmentId = String(body.shipment_id || "shipment");
  const baseLat = Number(body.lat ?? -24.6282);
  const baseLng = Number(body.lng ?? 25.9231);
  const status = String(body.status || "pending");
  const tick = Math.floor(Date.now() / 5000);
  const seed = shipmentId.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) + tick;

  const moving = status === "transit";
  const shock = moving && Math.abs(jitter(seed + 4, 1)) > 0.45 ? Number((2.5 + Math.abs(jitter(seed + 5, 4))).toFixed(1)) : 0.1;
  const temperature = Number((22.5 + jitter(seed + 1, 3)).toFixed(1));
  const humidity = Number((48 + jitter(seed + 2, 8)).toFixed(1));
  const doorOpen = moving && Math.abs(jitter(seed + 3, 1)) > 0.48;

  return Response.json({
    shipment_id: shipmentId,
    timestamp: new Date().toISOString(),
    gps: {
      lat: Number((baseLat + (moving ? jitter(seed + 6, 0.02) : 0)).toFixed(6)),
      lng: Number((baseLng + (moving ? jitter(seed + 7, 0.02) : 0)).toFixed(6)),
    },
    telemetry: {
      temperature_c: temperature,
      humidity_pct: humidity,
      shock_g: shock,
      door_open: doorOpen,
    },
    alerts: [
      ...(temperature > 25 ? ["temperature_excursion"] : []),
      ...(shock > 2 ? ["shock_event"] : []),
      ...(doorOpen ? ["door_open"] : []),
    ],
    source: "gridai-edge-simulator",
  });
}
