import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

const MOCK_NDAS_FILE = path.join(process.cwd(), "src", "app", "api", "nda", "mock_ndas_db.json");
const MOCK_LOGS_FILE = path.join(process.cwd(), "src", "app", "api", "nda", "mock_access_logs_db.json");

export async function GET(request: NextRequest) {
  try {
    let ndas = [];
    let logs = [];
    let source = "mock";

    // 1. Try reading from PostgreSQL (Supabase)
    if (supabase) {
      try {
        const { data: ndaData, error: ndaErr } = await supabase
          .from("ndas")
          .select("*")
          .order("signed_at", { ascending: false });

        const { data: logData, error: logErr } = await supabase
          .from("access_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (!ndaErr && !logErr) {
          ndas = ndaData || [];
          logs = logData || [];
          source = "postgres";
        }
      } catch (dbErr) {
        console.error("Supabase read error, falling back to mock files:", dbErr);
      }
    }

    // 2. If no postgres data, read from mock files
    if (source === "mock") {
      if (fs.existsSync(MOCK_NDAS_FILE)) {
        ndas = JSON.parse(fs.readFileSync(MOCK_NDAS_FILE, "utf-8"));
      }
      if (fs.existsSync(MOCK_LOGS_FILE)) {
        logs = JSON.parse(fs.readFileSync(MOCK_LOGS_FILE, "utf-8"));
      }
    }

    return NextResponse.json({
      success: true,
      source,
      ndas,
      logs
    });
  } catch (error: any) {
    console.error("NDA Status Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in NDA Status API: " + error.message },
      { status: 500 }
    );
  }
}

// Enable logging a custom action (like PLATFORM_ACCESS_ATTEMPT) from the frontend
export async function POST(request: NextRequest) {
  try {
    const { email, action, ip, details } = await request.json();
    if (!email || !action) {
      return NextResponse.json({ error: "Missing email or action" }, { status: 400 });
    }

    const ip_address = ip || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown Device";
    
    const device_metadata = {
      userAgent,
      details,
      timestamp: new Date().toISOString()
    };

    const newLog = {
      id: Math.random().toString(36).substring(2, 15),
      user_email: email,
      ip_address,
      device_metadata,
      action,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase
          .from("access_logs")
          .insert({
            user_email: email,
            ip_address,
            device_metadata,
            action
          });
      } catch (dbErr) {
        console.error("Supabase insert log error:", dbErr);
      }
    }

    try {
      const dir = path.dirname(MOCK_LOGS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (!fs.existsSync(MOCK_LOGS_FILE)) {
        fs.writeFileSync(MOCK_LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
      }
      const logsData = JSON.parse(fs.readFileSync(MOCK_LOGS_FILE, "utf-8"));
      logsData.unshift(newLog);
      fs.writeFileSync(MOCK_LOGS_FILE, JSON.stringify(logsData, null, 2), "utf-8");
    } catch (fsErr) {
      console.error("Failed to write mock log:", fsErr);
    }

    return NextResponse.json({ success: true, log: newLog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
