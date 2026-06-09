import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const searchParams = request.nextUrl.searchParams;
  
  const seller = searchParams.get("seller") || "ABC Farmers Co-op";
  const buyer = searchParams.get("buyer") || "Dubai Foods LLC";
  const product = searchParams.get("product") || "Maize";
  const quantity = searchParams.get("quantity") || "10";
  const price = searchParams.get("price") || "320";

  const numQty = parseFloat(quantity) || 10;
  const numPrice = parseFloat(price) || 320;
  const total = numQty * numPrice;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const serialNo = "SADC-" + Math.random().toString(36).substring(3, 9).toUpperCase();

  let title = "Document";
  let documentContent = "";

  if (type === "invoice") {
    title = "Commercial Invoice";
    documentContent = `
      <div class="border-b-2 border-zinc-800 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight uppercase">${title}</h1>
          <p class="text-xs text-zinc-500 font-mono mt-1">Serial No: ${serialNo} | Date: ${date}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">PAID VIA ESCROW</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 mb-8 text-xs text-zinc-700">
        <div>
          <h2 class="font-bold text-zinc-900 uppercase tracking-wide mb-2 text-[10px]">Seller / Exporter</h2>
          <p class="font-bold text-zinc-900">${seller}</p>
          <p>SADC Agricultural Corridor Gate 4</p>
          <p>Botswana Agricultural Trust</p>
          <p class="mt-1">Reg Ref: BW-AGR-90211</p>
        </div>
        <div>
          <h2 class="font-bold text-zinc-900 uppercase tracking-wide mb-2 text-[10px]">Buyer / Importer</h2>
          <p class="font-bold text-zinc-900">${buyer}</p>
          <p>Global Foods Logistics hub</p>
          <p>Jebel Ali Freezone, UAE</p>
          <p class="mt-1">Import ID: UAE-IMP-44820</p>
        </div>
      </div>

      <table class="w-full text-left border-collapse mb-8">
        <thead>
          <tr class="border-b border-zinc-850 text-zinc-500 uppercase tracking-wider text-[9px] font-bold">
            <th class="py-3">Description</th>
            <th class="py-3 text-right">Quantity</th>
            <th class="py-3 text-right">Unit Price</th>
            <th class="py-3 text-right">Total (USD)</th>
          </tr>
        </thead>
        <tbody class="text-xs text-zinc-800 divide-y divide-zinc-200">
          <tr>
            <td class="py-4">
              <span class="font-bold text-zinc-900">${product}</span>
              <p class="text-[10px] text-zinc-500 mt-0.5">High-grade agricultural commodity for regional export. Phytosanitary certified.</p>
              <p class="text-[10px] text-zinc-500 mt-1">Incoterms: <strong>DAP (Delivered at Place)</strong></p>
            </td>
            <td class="py-4 text-right font-mono">${numQty} Tons</td>
            <td class="py-4 text-right font-mono">$${numPrice.toLocaleString()}</td>
            <td class="py-4 text-right font-mono font-bold text-zinc-900">$${total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-between items-start mb-12">
        <div class="w-1/2 p-4 bg-zinc-50 border border-zinc-200 rounded text-xs">
          <h3 class="font-bold text-zinc-900 mb-2 uppercase text-[10px]">Logistics & Tracking</h3>
          <p class="text-zinc-600 mb-1"><span class="font-semibold">Carrier:</span> TradeGridAfrica Multimodal</p>
          <p class="text-zinc-600 mb-1"><span class="font-semibold">Waybill / Tracking No:</span> <span class="font-mono text-emerald-600 font-bold">TGA-TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}</span></p>
          <p class="text-zinc-500 text-[10px] mt-2 italic">Live GPS tracking active via SADC Trade Corridors.</p>
        </div>
        <div class="w-64 text-xs space-y-2 border-t border-zinc-200 pt-4">
          <div class="flex justify-between">
            <span class="text-zinc-500">Subtotal:</span>
            <span class="font-mono">$${total.toLocaleString()}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">Tariff Duty (0% SACU):</span>
            <span class="font-mono">$0.00</span>
          </div>
          <div class="flex justify-between border-t border-zinc-850 pt-2 font-bold text-zinc-950">
            <span>Total Value:</span>
            <span class="font-mono text-sm">$${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  } else if (type === "packing_list") {
    title = "Packing List";
    documentContent = `
      <div class="border-b-2 border-zinc-800 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight uppercase">${title}</h1>
          <p class="text-xs text-zinc-500 font-mono mt-1">Serial No: ${serialNo} | Date: ${date}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200 rounded">AGRICULTURAL CARGO</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 mb-8 text-xs text-zinc-700">
        <div>
          <h2 class="font-bold text-zinc-900 uppercase tracking-wide mb-2 text-[10px]">Consignor</h2>
          <p class="font-bold text-zinc-900">${seller}</p>
          <p>SADC Agricultural Corridor Gate 4</p>
        </div>
        <div>
          <h2 class="font-bold text-zinc-900 uppercase tracking-wide mb-2 text-[10px]">Consignee</h2>
          <p class="font-bold text-zinc-900">${buyer}</p>
          <p>Global Foods Logistics hub</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 mb-8 text-xs text-zinc-700 bg-zinc-50 p-4 border border-zinc-200 rounded">
        <div>
          <p><strong>Cargo Type:</strong> Bulk Agricultural Produce</p>
          <p><strong>Total Weight:</strong> ${numQty} Metric Tons</p>
          <p class="mt-2 text-[10px] text-zinc-500"><strong class="text-zinc-700">Logistics Tracking No:</strong> <span class="font-mono text-emerald-600 bg-emerald-50 px-1 rounded">TGA-TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}</span></p>
        </div>
        <div>
          <p><strong>Packaging:</strong> 50kg export-grade polypropylene sacks</p>
          <p><strong>Container Load:</strong> Multimodal logistics container</p>
          <p class="mt-2 text-[10px] text-zinc-500"><strong class="text-zinc-700">Customs Seal No:</strong> <span class="font-mono">SADC-SL-${Math.floor(100000 + Math.random() * 900000)}</span></p>
        </div>
      </div>

      <table class="w-full text-left border-collapse mb-12">
        <thead>
          <tr class="border-b border-zinc-850 text-zinc-500 uppercase tracking-wider text-[9px] font-bold">
            <th class="py-3">Package Markings</th>
            <th class="py-3 text-right">Quantity</th>
            <th class="py-3 text-right">Gross Weight (kg)</th>
            <th class="py-3 text-right">Net Weight (kg)</th>
          </tr>
        </thead>
        <tbody class="text-xs text-zinc-800 divide-y divide-zinc-200">
          <tr>
            <td class="py-4">
              <span class="font-bold text-zinc-900">SADC-AGRI-${product.toUpperCase()}</span>
              <p class="text-[10px] text-zinc-500 mt-0.5">Origin code verified. Moisture content below 12.5%.</p>
              <p class="text-[10px] text-zinc-500 mt-0.5">GPS Tracking enabled on all pallets.</p>
            </td>
            <td class="py-4 text-right font-mono">${(numQty * 20).toLocaleString()} bags</td>
            <td class="py-4 text-right font-mono">${(numQty * 1005).toLocaleString()}</td>
            <td class="py-4 text-right font-mono font-bold text-zinc-900">${(numQty * 1000).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (type === "certificate_of_origin") {
    title = "SADC Preferential Certificate of Origin";
    documentContent = `
      <div class="border-b-2 border-zinc-800 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight uppercase">${title}</h1>
          <p class="text-xs text-zinc-500 font-mono mt-1">SADC Certificate No: ${serialNo} | Form 61</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded">ORIGIN FORM 61</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 mb-8 text-xs text-zinc-700">
        <div>
          <h2 class="font-bold text-zinc-900 uppercase tracking-wide mb-2 text-[10px]">Exporter (Name, Address, Country)</h2>
          <p class="font-bold text-zinc-900">${seller}</p>
          <p>SADC Agricultural Corridor Gate 4</p>
          <p>Botswana</p>
        </div>
        <div>
          <h2 class="font-bold text-zinc-900 uppercase tracking-wide mb-2 text-[10px]">Consignee (Name, Address, Country)</h2>
          <p class="font-bold text-zinc-900">${buyer}</p>
          <p>Global Foods Logistics hub</p>
          <p>United Arab Emirates</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 mb-8 text-xs text-zinc-700 bg-zinc-50 p-4 border border-zinc-200 rounded">
        <div>
          <p><strong>Transport Mode:</strong> Road/Rail Multimodal</p>
          <p><strong>Vehicle/Wagon No:</strong> <span class="font-mono">TGA-FRT-${Math.floor(1000 + Math.random() * 9000)}</span></p>
        </div>
        <div>
          <p><strong>Port of Loading:</strong> Gaborone Dry Port, Botswana</p>
          <p><strong>Port of Discharge:</strong> Destination Hub, SADC Region</p>
        </div>
      </div>

      <div class="p-4 border border-emerald-900/20 bg-emerald-50 text-xs text-emerald-950 rounded mb-8 space-y-2">
        <p class="font-bold flex items-center gap-1">
          ✓ Certified Origin Status: SADC Origin Rules Compliant
        </p>
        <p class="text-zinc-650 leading-relaxed text-[11px]">
          It is hereby certified that the goods described below are of Botswana origin and comply with the rules of origin governing the Southern African Development Community (SADC) Preferential Trade Protocol.
        </p>
      </div>

      <table class="w-full text-left border-collapse mb-8">
        <thead>
          <tr class="border-b border-zinc-850 text-zinc-500 uppercase tracking-wider text-[9px] font-bold">
            <th class="py-3">Description of Goods</th>
            <th class="py-3 text-right">Harmonized Tariff (HS Code)</th>
            <th class="py-3 text-right">Quantity</th>
            <th class="py-3 text-right">Origin Criteria</th>
          </tr>
        </thead>
        <tbody class="text-xs text-zinc-800 divide-y divide-zinc-200">
          <tr>
            <td class="py-4">
              <span class="font-bold text-zinc-900">${product} (Bulk)</span>
              <p class="text-[10px] text-zinc-500 mt-0.5">Agricultural crop harvested within regional borders.</p>
            </td>
            <td class="py-4 text-right font-mono">1005.90.00</td>
            <td class="py-4 text-right font-mono">${numQty} Tons</td>
            <td class="py-4 text-right font-bold text-emerald-800">Wholly Obtained (WO)</td>
          </tr>
        </tbody>
      </table>

      <div class="border-t border-zinc-200 pt-6 mt-8 flex justify-between text-[10px] text-zinc-600">
        <div class="w-1/2 pr-4">
          <p class="font-bold text-zinc-800 uppercase tracking-wide mb-2">11. Customs Declaration</p>
          <p>I declare that the above details are true and correct.</p>
          <div class="border-b border-zinc-400 h-8 mt-4 mb-2 w-48"></div>
          <p>Signature of Exporter / Authorized Agent</p>
        </div>
        <div class="w-1/2 pl-4 border-l border-zinc-200">
          <p class="font-bold text-zinc-800 uppercase tracking-wide mb-2">12. Certificate of Customs Authority</p>
          <p>Verification of origin in accordance with Protocol on Trade.</p>
          <div class="w-24 h-24 border-2 border-emerald-800/30 rounded-full flex items-center justify-center text-emerald-800/20 font-bold transform -rotate-12 mt-2">
            OFFICIAL<br>STAMP
          </div>
        </div>
      </div>
    `;
  } else if (type === "contract") {
    title = "Bilateral Trade & Purchase Agreement";
    documentContent = `
      <div class="border-b-2 border-zinc-800 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight uppercase">${title}</h1>
          <p class="text-xs text-zinc-500 font-mono mt-1">Contract Agreement No: ${serialNo}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 text-xs font-mono font-bold bg-zinc-900 text-zinc-100 border border-zinc-800 rounded">ESCROW SECURED</span>
        </div>
      </div>

      <div class="space-y-4 text-xs text-zinc-700 leading-relaxed mb-8">
        <p>This bilateral agreement is made and entered into on this ${date} by and between:</p>
        <p><strong>THE SELLER:</strong> ${seller}, located in Botswana (hereafter "Consignor").</p>
        <p><strong>THE BUYER:</strong> ${buyer}, located in Dubai, UAE (hereafter "Consignee").</p>
        
        <h3 class="font-bold text-zinc-900 uppercase tracking-wide text-[10px] mt-4">1. SUBJECT MATTER & INCOTERMS</h3>
        <p>The Seller agrees to sell, and the Buyer agrees to purchase ${numQty} Tons of ${product} at a purchase price of $${numPrice} per ton, representing a total contract valuation of $${total.toLocaleString()} USD. Delivery shall be executed under <strong>DAP (Delivered at Place)</strong> Incoterms 2020.</p>
        
        <h3 class="font-bold text-zinc-900 uppercase tracking-wide text-[10px] mt-4">2. PAYMENT TERMS & SMART ESCROW TIMELINES</h3>
        <p>Payment shall be locked in the TradeGridAfrica Digital Escrow Registry immediately upon execution of this contract. The holding bank will release funds to the Seller's account within 24 hours of receiving cryptographic proof of border crossing verification and custom biosecurity phytosanitary clearance.</p>

        <h3 class="font-bold text-zinc-900 uppercase tracking-wide text-[10px] mt-4">3. LOGISTICS TRACKING & DELIVERY</h3>
        <p>The Seller shall initiate shipment via TradeGridAfrica Multimodal Logistics within 5 business days. A dedicated GPS Tracking ID will be provided to the Buyer. Title and risk of loss pass to the Buyer upon physical delivery at the agreed destination hub.</p>

        <h3 class="font-bold text-zinc-900 uppercase tracking-wide text-[10px] mt-4">4. GOVERNING LAW, BIOCLEARANCE, & DISPUTES</h3>
        <p>The contract is governed by standard SADC Agribusiness Trade protocols. The Seller guarantees the cargo complies with target border biosecurity rules (including FMD movement restrictions) and has been tested for standard contaminants. Any disputes shall be resolved via binding arbitration under the rules of the SADC Commercial Tribunal.</p>
      </div>

      <div class="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-zinc-200 text-xs">
        <div class="space-y-4">
          <p class="text-zinc-400">For Seller:</p>
          <div class="border-b border-zinc-800 h-10 w-48"></div>
          <p class="font-bold text-zinc-900">${seller}</p>
        </div>
        <div class="space-y-4">
          <p class="text-zinc-400">For Buyer:</p>
          <div class="border-b border-zinc-800 h-10 w-48"></div>
          <p class="font-bold text-zinc-900">${buyer}</p>
        </div>
      </div>
    `;
  } else {
    title = "Official Document";
    documentContent = `<p class="text-center py-20 text-zinc-500">Document registry index error. Unknown type.</p>`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>TradeGridAfrica Document Registry - ${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @media print {
          .no-print { display: none; }
          body { background-color: white; color: black; padding: 0; }
          .print-container { border: none; box-shadow: none; max-width: 100%; width: 100%; margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body class="bg-zinc-100 text-zinc-900 p-8 min-h-screen flex flex-col items-center">
      <div class="w-full max-w-4xl flex justify-between items-center mb-6 no-print">
        <a href="/sandbox?role=exporter" class="text-xs font-semibold text-zinc-650 hover:text-zinc-900 flex items-center gap-1.5 transition-colors">
          ← Back to App Console
        </a>
        <button onclick="window.print()" class="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md border border-emerald-500 transition-colors">
          Print / Save PDF
        </button>
      </div>

      <div class="print-container w-full max-w-4xl bg-white border border-zinc-300 shadow-xl rounded-xl p-12 relative overflow-hidden flex-1">
        <!-- Official Watermark Background -->
        <div class="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-[500px] h-[500px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        ${documentContent}

        <!-- Footer -->
        <div class="border-t border-zinc-200 pt-8 mt-12 text-[10px] text-zinc-400 flex justify-between items-center font-mono">
          <span>TradeGridAfrica Regional Trust Registry</span>
          <span>Security Protocol: ECC-256-SADC</span>
        </div>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html"
    }
  });
}
