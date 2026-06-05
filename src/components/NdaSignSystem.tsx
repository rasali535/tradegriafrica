"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  ShieldCheck, FileText, CheckCircle2, ChevronRight, PenTool, 
  Type, Download, Eye, RotateCcw, Mail, Server, Smartphone, Globe, Shield, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NdaSignSystemProps {
  onSignSuccess: (data: any) => void;
  currentUserData?: any;
}

export const NdaSignSystem: React.FC<NdaSignSystemProps> = ({ onSignSuccess, currentUserData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sigType, setSigType] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("font-signature-1");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("farmer");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Botswana");
  const [purpose, setPurpose] = useState("Agribusiness Trading");

  // Agreement Step
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmAuthority, setConfirmAuthority] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [signedNda, setSignedNda] = useState<any>(null);
  const [emailLogs, setEmailLogs] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync with current user data if available
  useEffect(() => {
    if (currentUserData) {
      setFullName(currentUserData.name || "");
      setEmail(currentUserData.email || "");
      setPhone(currentUserData.phone || "");
      setCountry(currentUserData.country || "Botswana");
      setRole(currentUserData.role || "farmer");
      setCompanyName(
        currentUserData.role === "farmer" 
          ? `${currentUserData.name} Farms` 
          : `${currentUserData.name} Co.`
      );
    }
  }, [currentUserData]);

  // Handle Typed Signature Render on Canvas
  useEffect(() => {
    if (sigType === "type" && typedName.trim() !== "") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw typed signature
      ctx.fillStyle = "#10b981"; // Emerald-500
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let fontStyle = "italic 36px 'Georgia', serif";
      if (selectedFont === "font-signature-2") {
        fontStyle = "bold italic 36px 'Brush Script MT', 'cursive', sans-serif";
      } else if (selectedFont === "font-signature-3") {
        fontStyle = "italic 32px 'Times New Roman', serif";
      }

      ctx.font = fontStyle;
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

      // Add a subtle guideline underline
      ctx.beginPath();
      ctx.moveTo(40, canvas.height - 25);
      ctx.lineTo(canvas.width - 40, canvas.height - 25);
      ctx.strokeStyle = "#27272a"; // zinc-800
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [sigType, typedName, selectedFont]);

  // Touch & Mouse Drawing logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (sigType !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#10b981"; // Emerald-500

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || sigType !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTypedName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!agreeTerms || !confirmAuthority) {
      setErrorMsg("Please accept the NDA terms and confirm authority to sign.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if canvas is empty
    const isEmpty = isCanvasBlank(canvas);
    if (isEmpty && sigType === "draw") {
      setErrorMsg("Please provide your hand-drawn signature in the box.");
      return;
    }
    if (sigType === "type" && !typedName.trim()) {
      setErrorMsg("Please type your signature in the box.");
      return;
    }

    const signatureImage = canvas.toDataURL("image/png");

    setIsSubmitting(true);
    setSubmitStep(1); // Hashing signature...

    try {
      // Simulate sequential tracing loading steps
      await new Promise(r => setTimeout(r, 600));
      setSubmitStep(2); // Generating PDF layout...
      
      await new Promise(r => setTimeout(r, 600));
      setSubmitStep(3); // Recording IP & Audit Log...

      await new Promise(r => setTimeout(r, 600));
      setSubmitStep(4); // Securing Escrow Cryptographic Registry...

      // Submit API request
      const response = await fetch("/api/nda/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          company_name: companyName,
          role,
          email,
          phone,
          country,
          purpose,
          signature_data: signatureImage,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to submit signed NDA.");
      }

      await new Promise(r => setTimeout(r, 400));

      setSignedNda(resData.nda);
      setEmailLogs(resData.simulatedEmailDetails);
      localStorage.setItem("pt_nda_signed", "true");
      localStorage.setItem("pt_nda_details", JSON.stringify(resData.nda));
      
      setIsSubmitting(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
      setSubmitStep(0);
    }
  };

  const isCanvasBlank = (canvas: HTMLCanvasElement): boolean => {
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
  };

  const handleDownloadPdf = () => {
    if (!signedNda?.pdf_url) return;
    const link = document.createElement("a");
    link.href = signedNda.pdf_url;
    link.download = `Signed_NDA_PulaTrade_${fullName.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Submit Stepper Loading
  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center justify-center space-y-8 glass-card border border-zinc-900 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
          <h2 className="text-xl font-bold text-zinc-100">Immutable Cryptographic Vault</h2>
          <p className="text-xs text-zinc-500 text-center max-w-sm">
            Encrypting signature records and establishing regional compliance logs.
          </p>
        </div>

        {/* Stepper details */}
        <div className="w-full max-w-md space-y-3">
          {[
            { step: 1, text: "Calculating SHA-256 signature hash validation..." },
            { step: 2, text: "Generating signed A4 PDF document via pdf-lib..." },
            { step: 3, text: "Recording IP audit trail & client device metadata..." },
            { step: 4, text: "Updating SADC secure escrow trade registers..." },
          ].map((item) => {
            const active = submitStep === item.step;
            const completed = submitStep > item.step;
            return (
              <div 
                key={item.step} 
                className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all duration-300 ${
                  active 
                    ? "bg-emerald-950/20 border-emerald-500/80 text-emerald-400 font-bold" 
                    : completed 
                    ? "bg-zinc-900/60 border-zinc-800 text-zinc-400" 
                    : "bg-zinc-950/30 border-zinc-950 text-zinc-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    completed 
                      ? "bg-emerald-900 text-emerald-400 border border-emerald-800" 
                      : active 
                      ? "bg-emerald-500 text-zinc-950 font-extrabold animate-pulse" 
                      : "bg-zinc-900 text-zinc-500 border border-zinc-850"
                  }`}>
                    {completed ? "✓" : item.step}
                  </span>
                  <span>{item.text}</span>
                </div>
                {active && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] animate-pulse">
                    RUNNING
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Success State
  if (signedNda) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-2 z-10">
            <div className="p-2.5 bg-emerald-950 border border-emerald-900/50 rounded-lg w-fit text-emerald-400 mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">NDA Signed & Platform Unlocked</h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Your Mutual Non-Disclosure Agreement has been digitally signed, hashed, and recorded in the SADC regional biosecurity ledger.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 z-10 shrink-0">
            <Button
              onClick={handleDownloadPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs flex items-center gap-1.5 shadow-md h-9"
            >
              <Download className="h-4.5 w-4.5" /> Download Signed PDF
            </Button>
            <Button
              onClick={() => onSignSuccess(signedNda)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold flex items-center gap-1.5 h-9"
            >
              Unlock App Sandbox <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* NDA details verification card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-zinc-900 md:col-span-2">
            <CardHeader className="border-b border-zinc-900/60 pb-3">
              <CardTitle className="text-sm font-bold text-zinc-300">Cryptographic Signing Record</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs text-zinc-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Signee Name</span>
                  <span className="text-zinc-200 font-medium">{fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Company / Entity</span>
                  <span className="text-zinc-200 font-medium">{companyName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Email Address</span>
                  <span className="text-zinc-200 font-medium">{email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Signing Country</span>
                  <span className="text-zinc-200 font-medium">{country}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Governing Law</span>
                  <span className="text-emerald-400 font-semibold">Botswana</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Signature Status</span>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] py-0.5">IMMUTABLE ARCHIVE</Badge>
                </div>
              </div>

              <div className="border-t border-zinc-900/60 pt-3.5">
                <span className="text-[10px] text-zinc-500 font-semibold block uppercase mb-1">SHA-256 Signature Verification Hash</span>
                <code className="block bg-zinc-950 p-2.5 rounded border border-zinc-900 font-mono text-[10px] text-amber-500 break-all select-all">
                  {signedNda.signature_hash}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Verification stamp card */}
          <Card className="glass-card border-zinc-900 flex flex-col justify-between p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 text-[9px] font-mono text-zinc-650">Stamp ID: SADC-{signedNda.id?.substring(0,6).toUpperCase()}</div>
            <div className="space-y-4 pt-4">
              <div className="w-24 h-24 rounded-full border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <div className="text-center font-bold">
                  <div className="text-[9px] tracking-widest text-emerald-500">SADC</div>
                  <div className="text-xs uppercase">Verified</div>
                  <div className="text-[8px] font-mono text-zinc-500 mt-0.5">ECC-256</div>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-200 text-xs">Digital Seal Applied</h4>
                <p className="text-[10px] text-zinc-500 leading-normal px-2">
                  This transaction is anchored in the bilateral agricultural passport protocol. Access is provisioned.
                </p>
              </div>
            </div>
            <div className="text-[9px] text-zinc-600 font-mono pt-4 border-t border-zinc-900/60">
              Timestamp: {new Date(signedNda.signed_at).toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Email Simulation Drawer for proof of features */}
        {emailLogs && (
          <Card className="glass-card border-zinc-900">
            <CardHeader className="border-b border-zinc-900/60 pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-emerald-400" /> Resend Delivery Audit Logs (Simulated)
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Inspect the emails dispatched to the user and admin accounts
                </CardDescription>
              </div>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]">RESEND READY</Badge>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              {/* User Email */}
              <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 space-y-3">
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <div>
                    <span className="text-[9px] text-zinc-500 block">TO: Recipient (User)</span>
                    <strong className="text-zinc-300 text-[11px]">{emailLogs.userEmail.to}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 block">STATUS</span>
                    <span className="text-emerald-400 font-mono text-[10px]">SUCCESS</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 block">SUBJECT:</span>
                  <span className="text-zinc-200 font-medium">{emailLogs.userEmail.subject}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 block">ATTACHMENT:</span>
                  <span className="text-amber-500 font-mono text-[10px] flex items-center gap-1">
                    📎 {emailLogs.userEmail.attachmentName}
                  </span>
                </div>
                <div className="border border-zinc-900 bg-zinc-950 p-2.5 rounded max-h-40 overflow-y-auto text-[10px] text-zinc-400 font-sans leading-normal">
                  <div dangerouslySetInnerHTML={{ __html: emailLogs.userEmail.body }} />
                </div>
              </div>

              {/* Admin Notification */}
              <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 space-y-3">
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <div>
                    <span className="text-[9px] text-zinc-500 block">TO: System Admin</span>
                    <strong className="text-zinc-300 text-[11px]">{emailLogs.adminEmail.to}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 block">STATUS</span>
                    <span className="text-emerald-400 font-mono text-[10px]">DELIVERED</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 block">SUBJECT:</span>
                  <span className="text-zinc-200 font-medium">{emailLogs.adminEmail.subject}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 block">ATTACHMENT:</span>
                  <span className="text-amber-500 font-mono text-[10px] flex items-center gap-1">
                    📎 {emailLogs.adminEmail.attachmentName}
                  </span>
                </div>
                <div className="border border-zinc-900 bg-zinc-950 p-2.5 rounded max-h-40 overflow-y-auto text-[10px] text-zinc-400 font-sans leading-normal">
                  <div dangerouslySetInnerHTML={{ __html: emailLogs.adminEmail.body }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render Signing Form
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Digital NDA Signing Portal
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            You must execute the Mutual Non-Disclosure Agreement in order to gain clearance and unlock the PulaTrade App Sandbox Desk.
          </p>
        </div>
        <Badge className="bg-amber-950/80 text-amber-400 border border-amber-900 z-10">
          Clearance Required
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Intake details */}
          <Card className="glass-card border-zinc-900 p-6 space-y-4">
            <div className="border-b border-zinc-900 pb-2 flex items-center gap-2">
              <span className="p-1 bg-zinc-900 border border-zinc-800 text-emerald-400 rounded-lg"><FileText className="h-4 w-4" /></span>
              <div className="text-left">
                <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wide">NDA Intake Information</h3>
                <p className="text-[10px] text-zinc-500">Your details are bound to the signed document dynamically</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Full Name</label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Company Name</label>
                <Input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. AgriCorp SADC"
                  className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Role/Title</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none h-9 animate-none"
                >
                  <option value="farmer">Farmer / Cooperative</option>
                  <option value="buyer">Procurement Officer / Buyer</option>
                  <option value="transporter">Logistics & Freight Carrier</option>
                  <option value="exporter">Agribusiness Exporter</option>
                  <option value="bank">Structured Trade Banker</option>
                  <option value="government">SADC Border Inspector</option>
                  <option value="admin">Operations Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Email Address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. contact@entity.com"
                  className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Phone Number</label>
                <Input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +267 71 123 456"
                  className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none h-9"
                >
                  <option value="Botswana">Botswana</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Namibia">Namibia</option>
                  <option value="South Africa">South Africa</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Purpose of access</label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none h-9"
                >
                  <option value="Agribusiness Trading">Agribusiness Trading & Marketplace Listing</option>
                  <option value="Logistics Coordination">Logistics Coordination & Corridor Gate Dispatch</option>
                  <option value="Platform Administration">Platform Administration & Audit Verification</option>
                  <option value="Marketplace Auditing">Marketplace Auditing & Biosecurity Inspections</option>
                  <option value="Investor Demo Review">Investor Demonstration & Partner Review</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Interactive Signature Area */}
          <Card className="glass-card border-zinc-900 p-6 space-y-4">
            <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-zinc-900 border border-zinc-800 text-emerald-400 rounded-lg"><PenTool className="h-4 w-4" /></span>
                <div className="text-left">
                  <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wide">Digital Signature Pad</h3>
                  <p className="text-[10px] text-zinc-500">Sign directly on screen to bind your execution authority</p>
                </div>
              </div>
              
              {/* Type/Draw Toggles */}
              <div className="flex bg-zinc-950 border border-zinc-900 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setSigType("draw");
                    clearSignature();
                  }}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                    sigType === "draw" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60" : "text-zinc-500"
                  }`}
                >
                  <PenTool className="h-3 w-3" /> Draw
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSigType("type");
                    clearSignature();
                  }}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                    sigType === "type" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60" : "text-zinc-500"
                  }`}
                >
                  <Type className="h-3 w-3" /> Type
                </button>
              </div>
            </div>

            {/* Signature Draw Pad */}
            <div className="space-y-3">
              {sigType === "type" && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] text-zinc-500 block uppercase">Type Full Name</label>
                    <Input
                      type="text"
                      value={typedName}
                      onChange={e => setTypedName(e.target.value)}
                      placeholder="Type signature name..."
                      className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block uppercase">Select Style</label>
                    <select
                      value={selectedFont}
                      onChange={e => setSelectedFont(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-1.5 text-zinc-300 focus:border-emerald-800 outline-none h-8 font-sans"
                    >
                      <option value="font-signature-1">Georgia Italic</option>
                      <option value="font-signature-2">Brush Script</option>
                      <option value="font-signature-3">Times Roman</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="relative border border-zinc-900 bg-zinc-950 rounded-xl p-2 h-44 flex items-center justify-center select-none overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className={`bg-zinc-950 w-full h-full rounded-lg cursor-crosshair ${
                    sigType === "type" ? "pointer-events-none" : ""
                  }`}
                />
                
                {sigType === "draw" && (
                  <div className="absolute top-2 right-2 text-[8px] text-zinc-600 bg-zinc-950/60 px-1.5 py-0.5 rounded border border-zinc-900 font-mono">
                    DRAW ZONE
                  </div>
                )}
                {sigType === "type" && !typedName && (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-[11px] pointer-events-none italic">
                    Type your name above to generate signature stamp
                  </div>
                )}
              </div>

              {/* Clear Canvas */}
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-zinc-500 hover:text-zinc-350 flex items-center gap-1 transition-colors text-[10px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Clear Signature
                </button>
                <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                  <Server className="h-3 w-3 text-emerald-500/80" /> Vault Anchored ECC-256
                </div>
              </div>
            </div>

            {/* Verification details checkboxes */}
            <div className="space-y-3.5 pt-4 border-t border-zinc-900/60">
              <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 h-4 w-4 rounded bg-zinc-950 border-zinc-900 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span>
                  I agree to the PulaTrade Platform Mutual NDA terms, confidentiality constraints, IP protection clauses, and governing laws.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmAuthority}
                  onChange={e => setConfirmAuthority(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 h-4 w-4 rounded bg-zinc-950 border-zinc-900 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span>
                  I confirm that I possess the legal execution authority to sign on behalf of the registered business or cooperative entity listed.
                </span>
              </label>
            </div>
            
            {errorMsg && (
              <p className="text-[10px] text-red-400 mt-2 font-semibold bg-red-950/20 p-2 rounded border border-red-900/40">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* Submit btn */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={!agreeTerms || !confirmAuthority}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold border border-emerald-500 shadow-md text-xs py-2.5 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:hover:bg-emerald-600 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="h-4.5 w-4.5" /> Sign & Continue
              </Button>
            </div>
          </Card>
        </form>

        {/* Right Preview of legal texts (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <Card className="glass-card border-zinc-900 flex-1 flex flex-col">
            <CardHeader className="border-b border-zinc-900/60 pb-3">
              <CardTitle className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-500" /> Mutual NDA Terms Preview
              </CardTitle>
            </CardHeader>
            <div className="p-4 overflow-y-auto max-h-[580px] text-[10.5px] text-zinc-400 space-y-3.5 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-zinc-900">
              <h3 className="font-extrabold text-zinc-200 text-center uppercase tracking-wide">
                MUTUAL NON-DISCLOSURE AGREEMENT
              </h3>
              
              <div className="space-y-2 text-[10px]">
                <p>
                  <strong>EFFECTIVE DATE:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p>
                  <strong>GOVERNING JURISDICTION:</strong> Republic of Botswana (Gaborone)
                </p>
                <p>
                  This Mutual Non-Disclosure Agreement (the "Agreement") is entered into by and between PulaTrade Technologies Inc. and the registered Signatory Representative representing the registered Cooperative, Transporter, Buyer, or Agribusiness entity (the "Recipient").
                </p>
              </div>

              <div className="border-b border-zinc-900 my-2"></div>

              <div>
                <strong className="text-zinc-200 block mb-1 uppercase tracking-wide text-[9.5px]">
                  1. Confidential Information
                </strong>
                <p>
                  "Confidential Information" refers to any proprietary, sensitive, trade, or technical data disclosed by PulaTrade, including agricultural demand matrices, transaction escrows, regional price listings, cross-border custom certificates, multimodal freight volumes, and AI agent orchestrator schemas. The Recipient agrees to restrict access to employees on a strict "need-to-know" basis.
                </p>
              </div>

              <div>
                <strong className="text-zinc-200 block mb-1 uppercase tracking-wide text-[9.5px]">
                  2. Intellectual Property (IP)
                </strong>
                <p>
                  All rights, titles, and interests in the platform’s structural codebase, custom APIs, regional biosecurity filters, database layouts, visual dashboard assets, and trade-negotiation workflows are reserved exclusively by PulaTrade. Platform access grants a non-exclusive, revocable, and limited evaluation license. Copying, reverse-engineering, or replicating any architecture is strictly prohibited.
                </p>
              </div>

              <div>
                <strong className="text-zinc-200 block mb-1 uppercase tracking-wide text-[9.5px]">
                  3. Non-Circumvention
                </strong>
                <p>
                  The Recipient covenants that they shall not directly bypass or circumvent the platform to negotiate, structure, or conclude business transactions (produce buying/selling, cargo transport, or trade credit financing) with any counterparty, grower, cooperative, or logistics operator introduced through the platform network. All transaction clearing must utilize the PulaTrade Secure Escrow.
                </p>
              </div>

              <div>
                <strong className="text-zinc-200 block mb-1 uppercase tracking-wide text-[9.5px]">
                  4. Non-Use Restrictions
                </strong>
                <p>
                  Confidential Information shall not be utilized for any speculative commercial actions, competitive development of alternative trade matching systems, or any purposes detrimental to the operations, pricing integrity, and security of the PulaTrade regional agricultural corridor.
                </p>
              </div>

              <div>
                <strong className="text-zinc-200 block mb-1 uppercase tracking-wide text-[9.5px]">
                  5. Governing Law & Dispute Resolution
                </strong>
                <p>
                  This Agreement shall be interpreted and governed in accordance with the laws of the Republic of Botswana. Any dispute, arbitration, or litigation arising out of platform access, compliance breaches, or non-circumvention violations shall be submitted exclusively to the competent courts of Gaborone, Botswana.
                </p>
              </div>
            </div>
            <div className="p-3 border-t border-zinc-900 bg-zinc-950/60 text-[9px] text-zinc-550 text-center font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Standard SADC Regulatory Framework
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
