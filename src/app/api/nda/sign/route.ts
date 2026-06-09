import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

// Paths for local mock databases
const MOCK_NDAS_FILE = path.join(process.cwd(), "src", "app", "api", "nda", "mock_ndas_db.json");
const MOCK_LOGS_FILE = path.join(process.cwd(), "src", "app", "api", "nda", "mock_access_logs_db.json");

// Ensure mock directories and files exist helper
function ensureMockFileExists(filePath: string, defaultData: any) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      company_name,
      role,
      email,
      phone,
      country,
      purpose,
      signature_data, // base64 representation
      agreement_type, // "nda" or "terms"
    } = body;

    const agreementType = agreement_type || "nda";

    // Validation
    if (!full_name || !company_name || !role || !email || !phone || !country || !purpose || !signature_data) {
      return NextResponse.json(
        { error: "Missing required fields for signing." },
        { status: 400 }
      );
    }

    // Capture Client Metadata
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown Device";
    
    // Simple device metadata parser
    const isMobile = /mobile/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const deviceType = isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop";
    const osMatch = userAgent.match(/\(([^)]+)\)/);
    const os = osMatch ? osMatch[1].split(";")[0] : "Unknown OS";
    const device_metadata = {
      deviceType,
      os,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    // Calculate cryptographic hash of signature data
    const signature_hash = createHash("sha256").update(signature_data).digest("hex");

    // 1. Generate Signed PDF automatically using pdf-lib
    const pdfDoc = await PDFDocument.create();
    
    // Add first page
    let page = pdfDoc.addPage([595.276, 841.89]); // A4 Size in points
    const { width, height } = page.getSize();
    
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

    // Draw header/border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.062, 0.478, 0.353), // Emerald-700
      borderWidth: 1.5,
    });

    // Decorative top band
    page.drawRectangle({
      x: 31,
      y: height - 60,
      width: width - 62,
      height: 30,
      color: rgb(0.062, 0.478, 0.353),
    });

    page.drawText("TRADEGRID AFRICA REGIONAL TRUST NETWORK", {
      x: 45,
      y: height - 48,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    let yOffset = height - 110;

    // Title & Subtitle based on agreementType
    const titleText = "NON-DISCLOSURE & NON-CIRCUMVENTION AGREEMENT (NCNDA)";
    const subtitleText = "TradeGrid Africa Platform - A Property of Pameltech Labs";

    page.drawText(titleText, {
      x: 45,
      y: yOffset,
      size: 13,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    yOffset -= 20;

    page.drawText(subtitleText, {
      x: 45,
      y: yOffset,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
    yOffset -= 35;

    // Parties intro
    const partiesIntro = "This Non-Disclosure and Non-Circumvention Agreement (\"Agreement\") is entered into by and between Pameltech Labs (\"Company\") and the undersigned:";

    page.drawText(partiesIntro, {
      x: 45,
      y: yOffset,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    yOffset -= 25;

    // Table of Signee Details
    const drawRow = (label: string, value: string) => {
      page.drawText(label, { x: 45, y: yOffset, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(value, { x: 180, y: yOffset, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      yOffset -= 15;
    };

    drawRow("Signatory Full Name:", full_name);
    drawRow("Company/Entity Name:", company_name);
    drawRow("Role/Position:", role);
    drawRow("Email Address:", email);
    drawRow("Contact Phone:", phone);
    drawRow("Country of Operation:", country);
    drawRow("Purpose of Access:", purpose);
    yOffset -= 10;

    // Legal Terms Heading
    page.drawText("TERMS OF AGREEMENT", {
      x: 45,
      y: yOffset,
      size: 11,
      font: fontBold,
      color: rgb(0.062, 0.478, 0.353),
    });
    yOffset -= 20;

    // Legal Clauses text based on user-supplied template
    const legalTexts = [
      "1. PURPOSE: The Recipient acknowledges that they may be granted access to confidential, proprietary, and commercially sensitive information relating to TradeGrid Africa, a digital platform owned by Pameltech Labs, for the sole purpose of evaluating a potential investment, partnership, or business relationship.",
      "2. CONFIDENTIAL INFORMATION: Includes but is not limited to: business plans and strategies, technical architecture and system design, source code, algorithms, software logic, financial projections, investor pitch decks, and any non-public info.",
      "3. NON-DISCLOSURE OBLIGATIONS: The Recipient agrees to keep all Confidential Information strictly confidential, not disclose or share it with any third party, take security measures, and limit access to authorized internal decision-makers.",
      "4. NON-CIRCUMVENTION: The Recipient agrees not to bypass, avoid, or circumvent Pameltech Labs in any business opportunity introduced through TradeGrid Africa; nor contact, engage, or contract with partners or opportunities without written consent.",
      "5. INTELLECTUAL PROPERTY OWNERSHIP: All software systems, technical processes, business methodologies, designs, workflows, and brand assets remain the exclusive property of Pameltech Labs. No rights or licenses are granted.",
      "6. DATA PROTECTION, TERM & REMEDIES: The Recipient agrees not to reverse engineer systems or circumvent access controls. This Agreement remains in effect indefinitely. Unauthorized misuse may cause irreparable harm, entitling Company to injunctive relief and damages."
    ];

    for (const clause of legalTexts) {
      // Manual simple text wrapper
      const words = clause.split(" ");
      let line = "";
      for (const word of words) {
        const testLine = line + word + " ";
        const testWidth = fontRegular.widthOfTextAtSize(testLine, 8.5);
        if (testWidth > width - 110) {
          page.drawText(line.trim(), { x: 45, y: yOffset, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          yOffset -= 12;
          line = word + " ";
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line.trim(), { x: 45, y: yOffset, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        yOffset -= 15;
      }
    }

    yOffset -= 10;

    // Signatures and metadata block
    page.drawText("EXECUTION & IMMUTABLE RECORD", {
      x: 45,
      y: yOffset,
      size: 11,
      font: fontBold,
      color: rgb(0.062, 0.478, 0.353),
    });
    yOffset -= 20;

    // Draw metadata
    page.drawText(`IP Address: ${ip_address}`, { x: 45, y: yOffset, size: 8, font: fontMono, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(`Signing Date: ${new Date().toUTCString()}`, { x: 280, y: yOffset, size: 8, font: fontMono, color: rgb(0.4, 0.4, 0.4) });
    yOffset -= 12;
    page.drawText(`Device/OS: ${deviceType} (${os})`, { x: 45, y: yOffset, size: 8, font: fontMono, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(`Signature Hash (SHA-256):`, { x: 280, y: yOffset, size: 8, font: fontMono, color: rgb(0.4, 0.4, 0.4) });
    yOffset -= 12;
    page.drawText(signature_hash, { x: 280, y: yOffset, size: 7, font: fontMono, color: rgb(0.5, 0.2, 0.2) });

    // Embed Signature Image
    try {
      const base64Image = signature_data.split(",")[1];
      const imageBytes = Buffer.from(base64Image, "base64");
      
      let sigImage;
      if (signature_data.includes("image/png")) {
        sigImage = await pdfDoc.embedPng(imageBytes);
      } else {
        sigImage = await pdfDoc.embedJpg(imageBytes);
      }
      
      // Draw signature image
      page.drawImage(sigImage, {
        x: 45,
        y: yOffset - 75,
        width: 160,
        height: 60,
      });

      // Signature underline
      page.drawLine({
        start: { x: 45, y: yOffset - 80 },
        end: { x: 205, y: yOffset - 80 },
        thickness: 1,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText("Signatory Digital Stamp", {
        x: 45,
        y: yOffset - 92,
        size: 7,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
      });

    } catch (sigErr) {
      // Fallback if image embedding fails
      page.drawText(`[Digitally Signed: ${full_name}]`, {
        x: 45,
        y: yOffset - 40,
        size: 12,
        font: fontMono,
        color: rgb(0.1, 0.4, 0.2),
      });
      page.drawText("Fallback Typed Signature", {
        x: 45,
        y: yOffset - 52,
        size: 7,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Draw stamp icon
    page.drawCircle({
      x: width - 85,
      y: yOffset - 45,
      size: 60,
      borderColor: rgb(0.062, 0.478, 0.353),
      borderWidth: 1.5,
    });
    page.drawText("SADC", { x: width - 100, y: yOffset - 40, size: 9, font: fontBold, color: rgb(0.062, 0.478, 0.353) });
    page.drawText("VERIFIED", { x: width - 107, y: yOffset - 51, size: 8, font: fontBold, color: rgb(0.062, 0.478, 0.353) });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    // 2. Email Notification Sending (using Resend API, or Simulating if key is missing)
    const resendApiKey = process.env.RESEND_API_KEY;
    let emailStatus = "simulated";
    let simulatedEmailDetails: any = null;

    const userEmailHtml = agreementType === "terms"
      ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
        <div style="background-color: #047857; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">TradeGridAfrica Trust Registry</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Terms of Service & Privacy Policy Signed</p>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${full_name}</strong>,</p>
          <p>Thank you for acknowledging and signing the Terms of Service and Data Protection Policy to access the TradeGridAfrica digital agribusiness export desk.</p>
          <p>Your signature has been registered and verified on the SADC regional operations database. Your platform credentials have been authorized.</p>
          
          <table style="width: 100%; font-size: 13px; margin: 20px 0; border-collapse: collapse;">
            <tr style="background-color: #f7fafc;"><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">Entity</td><td style="padding: 8px; border: 1px solid #edf2f7;">${company_name} (${role})</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">IP Address</td><td style="padding: 8px; border: 1px solid #edf2f7; font-family: monospace;">${ip_address}</td></tr>
            <tr style="background-color: #f7fafc;"><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">Timestamp</td><td style="padding: 8px; border: 1px solid #edf2f7;">${new Date().toUTCString()}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">Verification Hash</td><td style="padding: 8px; border: 1px solid #edf2f7; font-family: monospace; font-size: 11px; color: #9b2c2c;">${signature_hash.substring(0, 32)}...</td></tr>
          </table>
          
          <p style="font-size: 12px; color: #718096; line-height: 1.5;">A copy of your signed agreement is attached to this email as a PDF. Please retain this for your files.</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #a0aec0; text-align: center;">
          TradeGridAfrica Inc. • Botswana Agricultural Corridor Corridor Gate 4 • Gaborone, Botswana
        </div>
      </div>
    `
      : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
        <div style="background-color: #047857; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">TradeGridAfrica Trust Registry</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Mutual Non-Disclosure Agreement Executed</p>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${full_name}</strong>,</p>
          <p>Thank you for signing the Mutual Non-Disclosure Agreement (NDA) to access the TradeGridAfrica digital agribusiness export desk.</p>
          <p>Your signature has been registered and verified on the SADC regional operations database. Your platform credentials have been authorized.</p>
          
          <table style="width: 100%; font-size: 13px; margin: 20px 0; border-collapse: collapse;">
            <tr style="background-color: #f7fafc;"><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">Entity</td><td style="padding: 8px; border: 1px solid #edf2f7;">${company_name} (${role})</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">IP Address</td><td style="padding: 8px; border: 1px solid #edf2f7; font-family: monospace;">${ip_address}</td></tr>
            <tr style="background-color: #f7fafc;"><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">Timestamp</td><td style="padding: 8px; border: 1px solid #edf2f7;">${new Date().toUTCString()}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #edf2f7; font-weight: bold;">Verification Hash</td><td style="padding: 8px; border: 1px solid #edf2f7; font-family: monospace; font-size: 11px; color: #9b2c2c;">${signature_hash.substring(0, 32)}...</td></tr>
          </table>
          
          <p style="font-size: 12px; color: #718096; line-height: 1.5;">A copy of your signed agreement is attached to this email as a PDF. Please retain this for your files.</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #a0aec0; text-align: center;">
          TradeGridAfrica Inc. • Botswana Agricultural Corridor Corridor Gate 4 • Gaborone, Botswana
        </div>
      </div>
    `;

    const adminEmailHtml = agreementType === "terms"
      ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
        <div style="background-color: #b45309; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">🛡️ TradeGridAfrica Admin Notification</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">New Terms & Privacy Signoff - Corridor Access Provisioned</p>
        </div>
        <div style="padding: 20px;">
          <p>A new platform agreement (Terms of Service & Data Protection Policy) has been signed and validated on the TradeGrid Africa Platform.</p>
          
          <h3 style="font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Signee Information</h3>
          <table style="width: 100%; font-size: 13px; margin-bottom: 20px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; font-weight: bold; width: 150px;">Full Name:</td><td>${full_name}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Company Name:</td><td>${company_name}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Role/Title:</td><td>${role}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td>${email}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td>${phone}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Country:</td><td>${country}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Purpose:</td><td>${purpose}</td></tr>
          </table>

          <h3 style="font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Audit Trail & Security</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse; font-family: monospace;">
            <tr style="background-color: #f7fafc;"><td style="padding: 6px; border: 1px solid #edf2f7; font-weight: bold; width: 150px;">IP Address:</td><td style="padding: 6px; border: 1px solid #edf2f7;">${ip_address}</td></tr>
            <tr><td style="padding: 6px; border: 1px solid #edf2f7; font-weight: bold;">OS/Device:</td><td style="padding: 6px; border: 1px solid #edf2f7;">${deviceType} (${os})</td></tr>
            <tr style="background-color: #f7fafc;"><td style="padding: 6px; border: 1px solid #edf2f7; font-weight: bold;">Signature Hash:</td><td style="padding: 6px; border: 1px solid #edf2f7; font-size: 10px; color: #9b2c2c;">${signature_hash}</td></tr>
          </table>

          <p style="font-size: 12px; margin-top: 20px;">The signed document PDF has been automatically generated and archived in the database.</p>
        </div>
      </div>
    `
      : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
        <div style="background-color: #b45309; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">🛡️ TradeGridAfrica Admin Notification</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">New NDA Executed - Corridor Access Provisioned</p>
        </div>
        <div style="padding: 20px;">
          <p>A new Mutual NDA has been signed and validated on the TradeGrid Africa Platform.</p>
          
          <h3 style="font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Signee Information</h3>
          <table style="width: 100%; font-size: 13px; margin-bottom: 20px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; font-weight: bold; width: 150px;">Full Name:</td><td>${full_name}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Company Name:</td><td>${company_name}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Role/Title:</td><td>${role}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td>${email}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td>${phone}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Country:</td><td>${country}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Purpose:</td><td>${purpose}</td></tr>
          </table>

          <h3 style="font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Audit Trail & Security</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse; font-family: monospace;">
            <tr style="background-color: #f7fafc;"><td style="padding: 6px; border: 1px solid #edf2f7; font-weight: bold; width: 150px;">IP Address:</td><td style="padding: 6px; border: 1px solid #edf2f7;">${ip_address}</td></tr>
            <tr><td style="padding: 6px; border: 1px solid #edf2f7; font-weight: bold;">OS/Device:</td><td style="padding: 6px; border: 1px solid #edf2f7;">${deviceType} (${os})</td></tr>
            <tr style="background-color: #f7fafc;"><td style="padding: 6px; border: 1px solid #edf2f7; font-weight: bold;">Signature Hash:</td><td style="padding: 6px; border: 1px solid #edf2f7; font-size: 10px; color: #9b2c2c;">${signature_hash}</td></tr>
          </table>

          <p style="font-size: 12px; margin-top: 20px;">The signed document PDF has been automatically generated and archived in the database.</p>
        </div>
      </div>
    `;

    const userSubject = agreementType === "terms"
      ? "Your Signed Terms of Service & Privacy Policy - TradeGrid Africa"
      : "Your Signed Mutual NDA - TradeGrid Africa Platform";
      
    const adminSubject = agreementType === "terms"
      ? `[SECURE] New Terms Executed: ${full_name} (${company_name})`
      : `[SECURE] New NDA Signed: ${full_name} (${company_name})`;

    const attachmentFilename = agreementType === "terms"
      ? `Signed_Terms_Of_Service_${full_name.replace(/\s+/g, "_")}.pdf`
      : `Signed_NDA_${full_name.replace(/\s+/g, "_")}.pdf`;

    const adminAttachmentFilename = agreementType === "terms"
      ? `Signed_Terms_Of_Service_${full_name.replace(/\s+/g, "_")}_Admin.pdf`
      : `Signed_NDA_${full_name.replace(/\s+/g, "_")}_Admin.pdf`;

    if (resendApiKey) {
      try {
        // Send email to User
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "TradeGridAfrica Trust Registry <security@tradegridafrica.com>",
            to: [email],
            subject: userSubject,
            html: userEmailHtml,
            attachments: [
              {
                content: pdfBase64,
                filename: attachmentFilename,
              },
            ],
          }),
        });

        // Send email to Admin
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "TradeGridAfrica Alerts <alerts@tradegridafrica.com>",
            to: ["admin@tradegridafrica.com"],
            subject: adminSubject,
            html: adminEmailHtml,
            attachments: [
              {
                content: pdfBase64,
                filename: adminAttachmentFilename,
              },
            ],
          }),
        });

        emailStatus = "sent_successfully";
      } catch (emailErr) {
        console.error("Resend delivery failed, falling back to simulation:", emailErr);
        emailStatus = "delivery_failed_simulated";
      }
    }

    // Always compile simulation logs for transparency in dashboard
    simulatedEmailDetails = {
      userEmail: {
        to: email,
        from: "security@tradegridafrica.com",
        subject: userSubject,
        attachmentName: attachmentFilename,
        body: userEmailHtml
      },
      adminEmail: {
        to: "admin@tradegridafrica.com",
        from: "alerts@tradegridafrica.com",
        subject: adminSubject,
        attachmentName: adminAttachmentFilename,
        body: adminEmailHtml
      }
    };

    const newNdaRecord = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      full_name,
      company_name,
      role,
      email,
      phone,
      country,
      purpose,
      agreement_type: agreementType,
      signed_at: new Date().toISOString(),
      ip_address,
      device_metadata,
      signature_hash,
      signature_data, // We store the image data URL
      pdf_url: `data:application/pdf;base64,${pdfBase64}`, // Data URL representation for immediate viewing/downloads
    };

    const newAccessLog = {
      id: Math.random().toString(36).substring(2, 15),
      user_email: email,
      ip_address,
      device_metadata,
      action: agreementType === "terms" ? "TERMS_SIGNED" : "NDA_SIGNED",
      created_at: new Date().toISOString()
    };

    // 3. Database Storage (Supabase PostgreSQL / Local File Fallback)
    let dbStatus = "mocked";
    
    if (supabase) {
      try {
        // Find existing user or insert new user
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        let userId = null;
        if (userData) {
          userId = userData.id;
        } else {
          // Create a new user profile
          const { data: newUserProfile, error: newUserErr } = await supabase
            .from("users")
            .insert({
              name: full_name,
              email: email,
              phone: phone,
              country: country === "Mozambique" ? "South Africa" : country, // Ensure compatible country mapping
              role: role.toLowerCase() === "admin" ? "admin" : "buyer" // Default mapping
            })
            .select("id")
            .single();
          
          if (!newUserErr && newUserProfile) {
            userId = newUserProfile.id;
          }
        }

        // Insert NDA record
        const { error: ndaError } = await supabase
          .from("ndas")
          .insert({
            user_id: userId,
            full_name,
            company_name,
            role,
            email,
            phone,
            country,
            purpose,
            agreement_type: agreementType,
            ip_address,
            device_metadata,
            signature_hash,
            signature_data,
            pdf_url: null // Skip saving base64 to postgres, save just reference or leave blank
          });

        // Insert access log
        await supabase
          .from("access_logs")
          .insert({
            user_email: email,
            ip_address,
            device_metadata,
            action: agreementType === "terms" ? "TERMS_SIGNED" : "NDA_SIGNED"
          });

        if (!ndaError) {
          dbStatus = "postgres_saved";
        } else {
          console.error("Supabase NDA insert failed, falling back to mock file:", ndaError);
          dbStatus = "postgres_error_mocked";
        }
      } catch (dbErr) {
        console.error("Supabase operations crashed, falling back to mock file:", dbErr);
        dbStatus = "postgres_crash_mocked";
      }
    }

    // Always write to local JSON file as persistent backup / primary for demo sandbox
    try {
      ensureMockFileExists(MOCK_NDAS_FILE, []);
      ensureMockFileExists(MOCK_LOGS_FILE, []);

      // Update NDAs
      const ndasData = JSON.parse(fs.readFileSync(MOCK_NDAS_FILE, "utf-8"));
      ndasData.unshift(newNdaRecord);
      fs.writeFileSync(MOCK_NDAS_FILE, JSON.stringify(ndasData, null, 2), "utf-8");

      // Update Access Logs
      const logsData = JSON.parse(fs.readFileSync(MOCK_LOGS_FILE, "utf-8"));
      logsData.unshift(newAccessLog);
      fs.writeFileSync(MOCK_LOGS_FILE, JSON.stringify(logsData, null, 2), "utf-8");

    } catch (fsErr) {
      console.error("Failed to write mock files to server filesystem:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "NDA signed successfully.",
      dbStatus,
      emailStatus,
      simulatedEmailDetails,
      nda: {
        id: newNdaRecord.id,
        full_name,
        email,
        signed_at: newNdaRecord.signed_at,
        signature_hash,
        pdf_url: newNdaRecord.pdf_url, // Return the Base64 Data URL so the frontend can download it with NO serverside storage needed!
      }
    });

  } catch (error: any) {
    console.error("NDA Sign Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in NDA Signing API: " + error.message },
      { status: 500 }
    );
  }
}
