import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, UploadCloud, ShieldAlert, FileText } from 'lucide-react';

export function SupplierVerification() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Verification & Compliance</h2>
        <p className="text-sm text-zinc-400">Upload corporate documents to achieve a Premium Verified Badge and increase your trust score.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Registration */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-500" />
              Company Registration
            </CardTitle>
            <CardDescription className="text-zinc-400">Upload your certificate of incorporation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-zinc-950/50">
              <div className="text-xs text-zinc-300">Status: <span className="text-emerald-400 font-semibold">Approved</span></div>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <Button variant="outline" className="w-full text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800">Update Document</Button>
          </CardContent>
        </Card>

        {/* Tax Compliance */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Tax Compliance
            </CardTitle>
            <CardDescription className="text-zinc-400">Valid tax clearance certificate required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-amber-900/50 rounded-lg bg-amber-950/20">
              <div className="text-xs text-zinc-300">Status: <span className="text-amber-500 font-semibold">Pending Review</span></div>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            </div>
            <Button variant="outline" className="w-full text-xs border-amber-900/50 text-amber-500 hover:bg-amber-950/40">View Submission</Button>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Industry Certifications
            </CardTitle>
            <CardDescription className="text-zinc-400">Upload ISO, safety, and operational certs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-zinc-800 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-zinc-950/30 hover:bg-zinc-900/50 transition-colors cursor-pointer">
              <UploadCloud className="h-8 w-8 text-zinc-500 mb-2" />
              <div className="text-xs font-semibold text-zinc-300">Drag & Drop</div>
              <div className="text-[10px] text-zinc-500">or click to browse files</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
