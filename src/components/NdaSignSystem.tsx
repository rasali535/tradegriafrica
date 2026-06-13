"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  ShieldCheck, FileText, CheckCircle2, ChevronRight, PenTool, 
  Type, Download, RotateCcw, Mail, Shield, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NdaSignSystemProps {
  onSignSuccess: (data: any) => void;
  currentUserData?: any;
  onCancel?: () => void;
}

export const NdaSignSystem: React.FC<NdaSignSystemProps> = ({ onSignSuccess, currentUserData, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sigType, setSigType] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("font-signature-1");
  const agreementType = "nda";

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Botswana");
  const [purpose, setPurpose] = useState("Investor Review");

  // Agreement Declarations (TradeGrid Africa style)
  const [decConfidential, setDecConfidential] = useState(false);
  const [decIp, setDecIp] = useState(false);
  const [decAuthority, setDecAuthority] = useState(false);
  const [decAudit, setDecAudit] = useState(false);
  const [decBinding, setDecBinding] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [signedNda, setSignedNda] = useState<any>(null);
  const [emailLogs, setEmailLogs] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [secHash, setSecHash] = useState("SHA-256 ACTIVE");

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSecHash("PT-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-ECC");
  }, []);

  // Sync with current user data if available
  useEffect(() => {
    if (currentUserData) {
      setFullName(currentUserData.name || "");
      setEmail(currentUserData.email || "");
      setPhone(currentUserData.phone || "");
      setCountry(currentUserData.country || "Botswana");
      setRole(currentUserData.role || "admin");
      setCompanyName(
        currentUserData.role === "admin" 
          ? "TradeGridAfrica Operations" 
          : `${currentUserData.name} Group`
      );
      setPurpose(
        currentUserData.role === "admin" 
          ? "System Admin Operations"
          : currentUserData.role === "bank"
          ? "API Integration"
          : "Biosecurity Inspector Clearance"
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

    if (!decConfidential || !decIp || !decAuthority || !decAudit || !decBinding) {
      setErrorMsg("Please accept all legal declarations before executing.");
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
      setSubmitStep(4); // Securing Digital Deal Framework...

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
          agreement_type: agreementType,
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
      onSignSuccess(resData.nda);
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
    link.download = `Signed_NDA_TradeGridAfrica_${fullName.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Submit Stepper Loading
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="max-w-2xl w-full py-16 px-4 flex flex-col items-center justify-center space-y-8 bg-zinc-950 border border-zinc-900 rounded shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col items-center space-y-3">
            <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
            <h2 className="text-xl font-bold text-zinc-100 font-mono">Immutable Cryptographic Vault</h2>
            <p className="text-xs text-zinc-500 text-center max-w-sm font-sans">
              Encrypting signature records and establishing regional compliance logs.
            </p>
          </div>

          {/* Stepper details */}
          <div className="w-full max-w-md space-y-3 font-mono">
            {[
              { step: 1, text: "Calculating SHA-256 signature hash validation..." },
              { step: 2, text: "Generating signed A4 PDF document via pdf-lib..." },
              { step: 3, text: "Recording IP audit trail & client device metadata..." },
              { step: 4, text: "Updating B2B Trade Compliance Registers..." },
            ].map((item) => {
              const active = submitStep === item.step;
              const completed = submitStep > item.step;
              return (
                <div 
                  key={item.step} 
                  className={`p-3 rounded border text-xs flex items-center justify-between transition-all duration-300 ${
                    active 
                      ? "bg-emerald-950/20 border-emerald-500/80 text-emerald-400 font-bold" 
                      : completed 
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-400" 
                      : "bg-zinc-950/30 border-zinc-950 text-zinc-650"
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
      </div>
    );
  }

  // Render Success State
  if (signedNda) {
    return (
      <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-900 p-6 rounded shadow-2xl relative my-8 overflow-y-auto max-h-[90vh]">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="p-8 rounded-lg bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="space-y-2 z-10">
              <div className="p-2.5 bg-emerald-950 border border-emerald-900/50 rounded-lg w-fit text-emerald-400 mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 font-mono">NDA Signed & Platform Unlocked</h2>
              <p className="text-xs text-zinc-400 max-w-xl font-sans">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono mt-6">
            <Card className="bg-zinc-950 border-zinc-900 md:col-span-2 text-xs">
              <CardHeader className="border-b border-zinc-900/60 pb-3">
                <CardTitle className="text-sm font-bold text-zinc-300">Cryptographic Signing Record</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5 text-xs text-zinc-400">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-555 font-semibold block uppercase">Signee Name</span>
                    <span className="text-zinc-200 font-medium font-sans">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-555 font-semibold block uppercase">Company / Entity</span>
                    <span className="text-zinc-200 font-medium font-sans">{companyName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-555 font-semibold block uppercase">Email Address</span>
                    <span className="text-zinc-200 font-medium font-sans">{email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-555 font-semibold block uppercase">Signing Country</span>
                    <span className="text-zinc-200 font-medium font-sans">{country}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-555 font-semibold block uppercase">Governing Law</span>
                    <span className="text-emerald-400 font-semibold">Botswana</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-555 font-semibold block uppercase">Signature Status</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] py-0.5">IMMUTABLE ARCHIVE</Badge>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 pt-3.5">
                  <span className="text-[10px] text-zinc-555 font-semibold block uppercase mb-1">SHA-256 Signature Verification Hash</span>
                  <code className="block bg-zinc-950 p-2.5 rounded border border-zinc-900 font-mono text-[10px] text-amber-500 break-all select-all">
                    {signedNda.signature_hash}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Verification stamp card */}
            <Card className="bg-zinc-950 border-zinc-900 flex flex-col justify-between p-5 text-center relative overflow-hidden">
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
                  <p className="text-[10px] text-zinc-555 leading-normal px-2 font-sans">
                    This transaction is anchored in the bilateral enterprise trade protocol. Access is provisioned.
                  </p>
                </div>
              </div>
              <div className="text-[9px] text-zinc-650 font-mono pt-4 border-t border-zinc-900/60">
                Timestamp: {new Date(signedNda.signed_at).toLocaleString()}
              </div>
            </Card>
          </div>

          {/* Email Simulation Drawer for proof of features */}
          {emailLogs && (
            <Card className="bg-zinc-950 border-zinc-900 mt-6">
              <CardHeader className="border-b border-zinc-900/60 pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                    <Mail className="h-4 w-4 text-emerald-400" /> Resend Delivery Audit Logs (Simulated)
                  </CardTitle>
                </div>
                <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]">RESEND READY</Badge>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* User Email */}
                <div className="border border-zinc-900 bg-zinc-950/40 rounded p-4 space-y-3">
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <div>
                      <span className="text-[9px] text-zinc-555 block">TO: Recipient (User)</span>
                      <strong className="text-zinc-300 text-[11px] font-sans">{emailLogs.userEmail.to}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-555 block">STATUS</span>
                      <span className="text-emerald-400 font-mono text-[10px]">SUCCESS</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-555 block">SUBJECT:</span>
                    <span className="text-zinc-200 font-medium font-sans">{emailLogs.userEmail.subject}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-555 block">ATTACHMENT:</span>
                    <span className="text-amber-500 font-mono text-[10px] flex items-center gap-1">
                      📎 {emailLogs.userEmail.attachmentName}
                    </span>
                  </div>
                  <div className="border border-zinc-900 bg-zinc-950 p-2.5 rounded max-h-40 overflow-y-auto text-[10px] text-zinc-400 font-sans leading-normal">
                    <div dangerouslySetInnerHTML={{ __html: emailLogs.userEmail.body }} />
                  </div>
                </div>

                {/* Admin Notification */}
                <div className="border border-zinc-900 bg-zinc-950/40 rounded p-4 space-y-3">
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <div>
                      <span className="text-[9px] text-zinc-555 block">TO: System Admin</span>
                      <strong className="text-zinc-300 text-[11px] font-sans">{emailLogs.adminEmail.to}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-555 block">STATUS</span>
                      <span className="text-emerald-400 font-mono text-[10px]">DELIVERED</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-555 block">SUBJECT:</span>
                    <span className="text-zinc-200 font-medium font-sans">{emailLogs.adminEmail.subject}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-555 block">ATTACHMENT:</span>
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
      </div>
    );
  }

  // Render Signing Form (2-column layout matching screenshot)
  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#090d16]/95 border border-[#0091ff]/35 shadow-[0_0_25px_rgba(0,145,255,0.2)] rounded-lg p-6 relative my-8 max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 text-zinc-100 font-mono">
        
        {/* Terminal Header spanning both columns */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-6 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0091ff] animate-pulse"></span>
            <span>TradeGridAfrica Access Gate: Execute Mutual NCNDA to unlock App Sandbox Desk.</span>
          </div>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer select-none transition-colors border border-zinc-900 px-2 py-0.5 rounded bg-zinc-950 text-[10px]"
            >
              Go Back
            </button>
          ) : (
            <span className="text-zinc-500 text-[10px]">Admin Sign In</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Investor Profile */}
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="text-[10px] text-[#0091ff] font-bold uppercase tracking-widest mb-1">Step 1 of 2</div>
              <h2 className="text-xl font-bold text-zinc-100 font-sans tracking-wide">Investor Profile</h2>
              <p className="text-[10.5px] text-zinc-400 font-sans mt-1 mb-6 leading-relaxed">
                Declare your credentials to begin compliance onboarding. All entities are cross-checked via legal identity networks.
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Full Name</label>
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. David E. Shaw"
                    className="bg-[#030712] border-zinc-900 focus:border-[#0091ff] text-zinc-100 rounded-md h-9 font-sans text-xs focus:ring-0 focus:ring-offset-0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Company / Fund Name</label>
                  <Input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. D. E. Shaw & Co."
                    className="bg-[#030712] border-zinc-900 focus:border-[#0091ff] text-zinc-100 rounded-md h-9 font-sans text-xs focus:ring-0 focus:ring-offset-0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Position / Title</label>
                  <Input
                    type="text"
                    required
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="bg-[#030712] border-zinc-900 focus:border-[#0091ff] text-zinc-100 rounded-md h-9 font-sans text-xs focus:ring-0 focus:ring-offset-0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Authorized Email</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. partner@deshaw.com"
                    className="bg-[#030712] border-zinc-900 focus:border-[#0091ff] text-zinc-100 rounded-md h-9 font-sans text-xs focus:ring-0 focus:ring-offset-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Country</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-[#030712] border border-zinc-900 rounded-md text-xs p-2 text-zinc-100 focus:border-[#0091ff] outline-none h-9 font-sans"
                    >
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Albania">Albania</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Andorra">Andorra</option>
                      <option value="Angola">Angola</option>
                      <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Armenia">Armenia</option>
                      <option value="Australia">Australia</option>
                      <option value="Austria">Austria</option>
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Belarus">Belarus</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Belize">Belize</option>
                      <option value="Benin">Benin</option>
                      <option value="Bhutan">Bhutan</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Brunei">Brunei</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Cabo Verde">Cabo Verde</option>
                      <option value="Cambodia">Cambodia</option>
                      <option value="Cameroon">Cameroon</option>
                      <option value="Canada">Canada</option>
                      <option value="Central African Republic">Central African Republic</option>
                      <option value="Chad">Chad</option>
                      <option value="Chile">Chile</option>
                      <option value="China">China</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Comoros">Comoros</option>
                      <option value="Congo (Congo-Brazzaville)">Congo (Congo-Brazzaville)</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Cuba">Cuba</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Dominica">Dominica</option>
                      <option value="Dominican Republic">Dominican Republic</option>
                      <option value="DR Congo">DR Congo</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Egypt">Egypt</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Equatorial Guinea">Equatorial Guinea</option>
                      <option value="Eritrea">Eritrea</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Eswatini">Eswatini</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Fiji">Fiji</option>
                      <option value="Finland">Finland</option>
                      <option value="France">France</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Gambia">Gambia</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Germany">Germany</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Greece">Greece</option>
                      <option value="Grenada">Grenada</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Guinea">Guinea</option>
                      <option value="Guinea-Bissau">Guinea-Bissau</option>
                      <option value="Guyana">Guyana</option>
                      <option value="Haiti">Haiti</option>
                      <option value="Honduras">Honduras</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Iceland">Iceland</option>
                      <option value="India">India</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Iran">Iran</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Israel">Israel</option>
                      <option value="Italy">Italy</option>
                      <option value="Ivory Coast">Ivory Coast</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Japan">Japan</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Kazakhstan">Kazakhstan</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Kyrgyzstan">Kyrgyzstan</option>
                      <option value="Laos">Laos</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Liberia">Liberia</option>
                      <option value="Libya">Libya</option>
                      <option value="Liechtenstein">Liechtenstein</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Mali">Mali</option>
                      <option value="Malta">Malta</option>
                      <option value="Marshall Islands">Marshall Islands</option>
                      <option value="Mauritania">Mauritania</option>
                      <option value="Mauritius">Mauritius</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Micronesia">Micronesia</option>
                      <option value="Moldova">Moldova</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Mongolia">Mongolia</option>
                      <option value="Montenegro">Montenegro</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Myanmar">Myanmar</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Nepal">Nepal</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Niger">Niger</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="North Korea">North Korea</option>
                      <option value="North Macedonia">North Macedonia</option>
                      <option value="Norway">Norway</option>
                      <option value="Oman">Oman</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Palau">Palau</option>
                      <option value="Panama">Panama</option>
                      <option value="Papua New Guinea">Papua New Guinea</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Peru">Peru</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Romania">Romania</option>
                      <option value="Russia">Russia</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                      <option value="Saint Lucia">Saint Lucia</option>
                      <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                      <option value="Samoa">Samoa</option>
                      <option value="San Marino">San Marino</option>
                      <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Senegal">Senegal</option>
                      <option value="Serbia">Serbia</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Solomon Islands">Solomon Islands</option>
                      <option value="Somalia">Somalia</option>
                      <option value="South Africa">South Africa</option>
                      <option value="South Korea">South Korea</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="Spain">Spain</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Sudan">Sudan</option>
                      <option value="Suriname">Suriname</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Syria">Syria</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="Tajikistan">Tajikistan</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Timor-Leste">Timor-Leste</option>
                      <option value="Togo">Togo</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Turkmenistan">Turkmenistan</option>
                      <option value="Tuvalu">Tuvalu</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Uzbekistan">Uzbekistan</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="Vatican City">Vatican City</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Yemen">Yemen</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Phone (Optional)</label>
                    <Input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +1 (212) 555-0100"
                      className="bg-[#030712] border-zinc-900 focus:border-[#0091ff] text-zinc-100 rounded-md h-9 font-sans text-xs focus:ring-0 focus:ring-offset-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security and time tracking stuck to bottom-left */}
            <div className="border-t border-zinc-900 pt-6 space-y-1.5 text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
              <div className="flex justify-between">
                <span>Security Hash:</span>
                <span className="text-zinc-400 font-sans select-all">{secHash}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Time Recording:</span>
                <span className="flex items-center gap-1.5 text-zinc-400 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {elapsedSeconds}s elapsed
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: NCNDA scroll, declarations, signature and execute */}
          <div className="space-y-5">
            {/* Scrollable NCNDA */}
            <div className="border border-zinc-900 bg-[#030712] rounded-md flex flex-col">
              <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-2 flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0091ff]" />
                  Mutual NCNDA Agreement (v1.0)
                </span>
                <span className="text-[9px] text-amber-500 uppercase tracking-wide">Scroll to bottom to unlock</span>
              </div>
              
              <div className="p-4 overflow-y-auto h-48 text-[10.5px] text-zinc-400 space-y-3 font-sans leading-relaxed scrollbar-thin scrollbar-thumb-zinc-900">
                <h3 className="font-extrabold text-zinc-200 text-center uppercase tracking-wide text-[11px] mb-2">
                  NON-DISCLOSURE & NON-CIRCUMVENTION AGREEMENT (NCNDA)
                </h3>
                <h4 className="text-zinc-300 font-semibold text-center text-[9.5px] mb-3">
                  TRADEGRID AFRICA PLATFORM - A PROPERTY OF PAMELTECH LABS
                </h4>
                
                <p className="text-[10px]">
                  This Non-Disclosure and Non-Circumvention Agreement (&quot;Agreement&quot;) is entered into by and between Pameltech Labs, the owner and operator of the TradeGrid Africa platform (&quot;Company&quot;), and the undersigned investor, individual, or entity (&quot;Recipient&quot;). Collectively referred to as the &quot;Parties.&quot;
                </p>

                <div className="border-b border-zinc-900 my-2"></div>

                <div className="space-y-3 text-[10px]">
                  <div>
                    <strong className="text-zinc-300 block mb-1 uppercase tracking-wide">1. PURPOSE</strong>
                    <p>
                      The Recipient acknowledges that they may be granted access to confidential, proprietary, and commercially sensitive information relating to TradeGrid Africa, a digital platform owned by Pameltech Labs, for the sole purpose of evaluating a potential investment, partnership, or business relationship.
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block mb-1 uppercase tracking-wide">2. CONFIDENTIAL INFORMATION</strong>
                    <p>
                      &quot;Confidential Information&quot; includes but is not limited to: business plans and strategies, technical architecture and system design, source code, algorithms, software logic, financial information and projections, investor materials and pitch decks, customer, partner, and supplier information, trade secrets, processes, and methodologies, and any non-public information disclosed through the TradeGrid Africa platform.
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block mb-1 uppercase tracking-wide">3. NON-DISCLOSURE OBLIGATIONS</strong>
                    <p>
                      The Recipient agrees to: keep all Confidential Information strictly confidential; not disclose, share, or publish any Confidential Information to any third party; take reasonable security measures to protect such information; and limit access strictly to authorized internal decision-makers (if applicable).
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block mb-1 uppercase tracking-wide">4. NON-CIRCUMVENTION</strong>
                    <p>
                      The Recipient agrees not to: bypass, avoid, or circumvent Pameltech Labs in any business opportunity introduced through TradeGrid Africa; contact, engage, or contract with any partners, stakeholders, or opportunities disclosed through the platform without written consent; or use Confidential Information to compete with or replicate the TradeGrid Africa platform or its underlying business model.
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block mb-1 uppercase tracking-wide">5. INTELLECTUAL PROPERTY OWNERSHIP</strong>
                    <p>
                      All intellectual property, including but not limited to software systems, technical processes, business methodologies, designs, workflows, documentation, and brand assets remain the exclusive property of Pameltech Labs. No rights or licenses are granted except for limited evaluation purposes under this Agreement.
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block mb-1 uppercase tracking-wide">6. NO LICENSE & REMEDIES</strong>
                    <p>
                      Nothing in this Agreement shall be interpreted as granting any license or ownership rights to the Recipient in relation to the Confidential Information. The Recipient acknowledges that unauthorized disclosure or misuse of Confidential Information may cause irreparable harm to Pameltech Labs, and the Company shall be entitled to injunctive relief, damages, and recovery of legal costs.
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block mb-1 uppercase tracking-wide">7. GOVERNING LAW & TERM</strong>
                    <p>
                      This Agreement shall be governed by and interpreted in accordance with the laws applicable to the jurisdiction of Pameltech Labs’ registered operations (Republic of Botswana). This Agreement shall remain in effect from the moment of electronic acceptance indefinitely, and confidentiality obligations shall survive termination.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Declarations */}
            <div className="space-y-2.5 bg-[#030712] p-4 border border-zinc-900 rounded-md font-sans text-xs text-zinc-400">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono mb-2">Legal Declarations</div>
              
              <label className="flex items-start gap-3.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={decConfidential}
                  onChange={e => setDecConfidential(e.target.checked)}
                  className="mt-0.5 accent-[#0091ff] h-4 w-4 rounded bg-zinc-950 border-zinc-850 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span>I agree to keep confidential all industrial trade demand matrices and pricing.</span>
              </label>

              <label className="flex items-start gap-3.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={decIp}
                  onChange={e => setDecIp(e.target.checked)}
                  className="mt-0.5 accent-[#0091ff] h-4 w-4 rounded bg-zinc-950 border-zinc-850 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span>I acknowledge that all proprietary IP belongs solely to Pameltech Labs.</span>
              </label>

              <label className="flex items-start gap-3.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={decAuthority}
                  onChange={e => setDecAuthority(e.target.checked)}
                  className="mt-0.5 accent-[#0091ff] h-4 w-4 rounded bg-zinc-950 border-zinc-850 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span>I declare I have corporate authority to sign this binding NCNDA.</span>
              </label>

              <label className="flex items-start gap-3.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={decAudit}
                  onChange={e => setDecAudit(e.target.checked)}
                  className="mt-0.5 accent-[#0091ff] h-4 w-4 rounded bg-zinc-950 border-zinc-850 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span>I consent to the logging of my IP and compliance audit trails.</span>
              </label>

              <label className="flex items-start gap-3.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={decBinding}
                  onChange={e => setDecBinding(e.target.checked)}
                  className="mt-0.5 accent-[#0091ff] h-4 w-4 rounded bg-zinc-950 border-zinc-850 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span>I agree this digital signature constitutes a binding agreement.</span>
              </label>
            </div>

            {/* Canvas signature pad */}
            <div className="space-y-2 bg-[#030712] p-4 border border-zinc-900 rounded-md">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                <span>Draw Your Official Signature</span>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-red-500 hover:text-red-400 cursor-pointer transition-all flex items-center gap-1 font-mono text-[9px]"
                >
                  <RotateCcw className="h-3 w-3" /> Clear
                </button>
              </div>
              
              <div className="relative border border-zinc-900 bg-zinc-950 rounded h-28 flex items-center justify-center select-none overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  width={450}
                  height={100}
                  className="w-full h-full cursor-crosshair bg-transparent relative z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-800 text-[10px] font-sans opacity-45">
                  Draw signature here
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-400 font-semibold font-sans bg-red-950/20 border border-red-900/40 p-2.5 rounded">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* Execute NCNDA Button */}
            <Button
              type="submit"
              disabled={!decConfidential || !decIp || !decAuthority || !decAudit || !decBinding || isSubmitting}
              className="w-full bg-[#0091ff] hover:bg-[#0082e6] text-white font-bold py-3 text-xs tracking-widest rounded border border-[#0091ff]/85 transition-colors uppercase cursor-pointer"
            >
              {isSubmitting ? "Executing NCNDA..." : "Execute NCNDA & Request Verification"}
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
};
