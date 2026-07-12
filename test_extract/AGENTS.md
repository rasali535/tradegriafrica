<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 TradeGrid Africa AI Agents System Documentation

This repository has been upgraded with a **modular AI agent business workflow engine** designed to autonomously manage cross-border agribusiness exports within the SADC region.

## 🧠 System Architecture

The AI trade system is composed of five specialized agents, controlled by a centralized orchestrator layer and exposed through REST APIs:

```
                                  [ User Command / Query ]
                                             │
                                             ▼
                                  ┌────────────────────┐
                                  │    Orchestrator    │
                                  └──────────┬─────────┘
                                             │
      ┌──────────────────────┬───────────────┼───────────────┬──────────────────────┐
      │                      │               │               │                      │
      ▼                      ▼               ▼               ▼                      ▼
┌───────────┐          ┌───────────┐   ┌───────────┐   ┌───────────┐          ┌───────────┐
│ Discovery │          │Compliance │   │ Logistics │   │ Document  │          │   Deal    │
│   Agent   ├─────────►│   Agent   ├──►│   Agent   ├──►│ Compiler  ├─────────►│  Closing  │
└───────────┘          └───────────┘   └───────────┘   └───────────┘          └───────────┘
```

---

## 🛠️ Implemented API Endpoints

### 1. **Trade Discovery Agent**
- **Endpoint:** `/api/agents/tradeDiscoveryAgent`
- **Function:** Analyzes regional SADC demand matrices, finds agricultural buyers, checks historical prices, and recommends export corridors.
- **Input:** `{ "product": "maize", "quantity": 10, "origin_country": "Botswana" }`

### 2. **Compliance Agent**
- **Endpoint:** `/api/agents/complianceAgent`
- **Function:** Checks regional/international trade treaties, determines tariffs, validates biosecurity/Phytosanitary clearances, and list required documents.
- **Input:** `{ "product": "maize", "origin_country": "Botswana", "destination_country": "South Africa" }`

### 3. **Logistics Agent**
- **Endpoint:** `/api/agents/logisticsAgent`
- **Function:** Formulates multimodal transport routing plans (road, rail, sea), tracks border gate queue delays, and estimates cargo transit costs.
- **Input:** `{ "origin": "Botswana", "destination": "South Africa", "cargo_type": "agricultural", "weight_tons": 10 }`

### 4. **Documentation Agent**
- **Endpoint:** `/api/agents/documentationAgent`
- **Function:** Structures dynamic trade documents and points to rendering handlers for immediate print/export.
- **Input:** `{ "seller": "ABC Farmers Co-op", "buyer": "Dubai Foods LLC", "product": "maize", "quantity": 10, "price_per_ton": 320 }`

### 5. **Deal Closing Agent**
- **Endpoint:** `/api/agents/dealClosingAgent`
- **Function:** Drafts binding legal bilateral treaties, sets up automated digital escrow milestones, and generates negotiation workflows.
- **Input:** `{ "buyer": "Dubai Foods LLC", "seller": "ABC Farmers Co-op", "product": "maize", "price": 320 }`

### 6. **Workflow Orchestrator**
- **Endpoint:** `/api/agents/orchestrator`
- **Function:** Sequentially coordinates parameters across all five agents, enabling end-to-end agribusiness operations directly from user prompt queries.
- **Input:** `{ "query": "I want to export 12 tons of maize from Botswana to South Africa" }`

---

## 📄 Dynamic Document Generation Registry
Standard template rendering endpoints have been created to provide print-ready, official-looking, Tailwind-styled SADC documentation with digital stamp clearances:
- `/api/documents/invoice` - Commercial Invoice
- `/api/documents/packing_list` - Packing List
- `/api/documents/certificate_of_origin` - SADC Certificate of Origin (Form 61)
- `/api/documents/contract` - Bilateral Trade & Purchase Agreement

---

## 🖥️ AI Agent Control Tower (UI)
The new **AI Agent Center** is fully integrated inside the **App Sandbox Desk**. It includes:
- **Interactive Prompt Command Area:** Choose from agricultural presets or submit custom instructions.
- **Sequential Trace visualizer:** Blinks and animates as agents resolve, showing real-time latencies, trust metrics, and data structures.
- **Live Document Drawer:** Instant download/print links for SADC certifications.
- **Interactive Deal Confirmation:** Triggers TradeGridAfrica's digital escrow system to lock funds in global banking databases and update application context state.
- **Audit Ledger:** Collapsible developer consoles listing request/response payloads for judges/inspectors.
