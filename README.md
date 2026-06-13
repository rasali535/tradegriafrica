# TradeGrid Africa (formerly Pula Trade)

TradeGrid Africa is an AI-powered, multi-agent enterprise B2B procurement and supplier discovery platform. It is designed to optimize cross-border industrial supply chains, logistics, and compliance across Botswana and the SADC (Southern African Development Community) region.

## 🚀 What It Does

The platform acts as a digital trade ecosystem that connects enterprise buyers, industrial suppliers, logistics providers, and regulatory bodies. It streamlines the complex process of cross-border trade by providing:

- **AI-Powered Procurement:** Autonomous AI agents handle market discovery, compliance checking, and logistics planning based on simple user queries.
- **Dynamic RFQ Bidding:** Buyers can post Requests for Quotation (RFQs) and suppliers can submit competitive bids in real time.
- **Multimodal Logistics Dashboard:** Real-time visibility into cross-border friction, including simulated border queue delays, multimodal transport tracking, and live currency conversions (ZAR, BWP, USD).
- **Automated Digital Contracting:** Instant generation of binding digital contracts, commercial invoices, and SADC compliance certificates.

## 🧠 System Architecture

The core of TradeGrid Africa is powered by a modular AI agent business workflow engine. Five specialized agents are controlled by a centralized orchestrator layer to handle end-to-end agribusiness operations directly from user prompt queries.

```text
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

### The 5 Core AI Agents
1. **Trade Discovery Agent (`/api/agents/tradeDiscoveryAgent`)**: Analyzes regional SADC demand matrices, finds industrial suppliers, checks historical prices, and recommends export corridors.
2. **Compliance Agent (`/api/agents/complianceAgent`)**: Evaluates regional trade treaties, determines tariffs, validates safety clearances, and lists required customs documents.
3. **Logistics Agent (`/api/agents/logisticsAgent`)**: Formulates multimodal transport routing plans, tracks border gate queue delays, and estimates cargo transit costs.
4. **Documentation Agent (`/api/agents/documentationAgent`)**: Structures dynamic trade documents (Invoices, Packing Lists, SADC Certificates of Origin).
5. **Deal Closing Agent (`/api/agents/dealClosingAgent`)**: Drafts binding legal bilateral treaties and establishes digital escrow milestones.

## 💻 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Next.js API Routes
- **Database/Auth:** Supabase (PostgreSQL)
- **AI Integration:** OpenAI API (GPT-4o) / Band AI protocol for agent orchestration

## 🛠️ Setup & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/rasali535/Pula-Trade.git
cd "Tradegrid africa"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and configure the following required variables:
```env
# AI Agents
OPENAI_API_KEY=your_openai_api_key

# Supabase Auth & Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server
Start the application locally on port 5000:
```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser to access the TradeGrid Africa platform.

## 📄 Documentation

For the full product specification and deeper architecture details, please refer to the [Product Specification](PULA_TRADE_V2_SPEC.md).
