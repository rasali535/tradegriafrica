# TradeGrid Africa 🌍🚀
**Transforming Cross-Border Enterprise Trade in the SADC Region with AMD Generative AI**

[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by AMD](https://img.shields.io/badge/Powered_by-AMD_MI300X-red?style=for-the-badge&logo=amd)](https://amd.com)
[![AI Model](https://img.shields.io/badge/AI-Gemma_4-blue?style=for-the-badge)](https://ai.google.dev/gemma)
[![Deployment](https://img.shields.io/badge/Hosted_on-Hostinger-purple?style=for-the-badge)](https://magenta-termite-395904.hostingersite.com/)

TradeGrid Africa is a multi-agent B2B procurement platform designed to eliminate the bottlenecks of cross-border trade within the Southern African Development Community (SADC). 

This project was built for the **AMD Developer Hackathon Act II (Track 3: Unicorn Track)**.

## 🧠 AMD AI Architecture & High-Availability Pipeline
To handle complex enterprise logistics, compliance checking, and contract generation, TradeGrid Africa utilizes a **Multi-Agent Orchestrator** powered by Google's **Gemma 4**.

We leverage the extreme high-throughput of **AMD MI300X accelerators** (via the AMD Developer Cloud) to run our agents **concurrently**. Instead of sequential AI processing, our system fires parallel inference requests for Supplier Discovery, RFQ Intelligence, Trade Compliance, and Logistics Routing. 

### Robust 3-Tier AI Fallback Mechanism
For enterprise reliability during live pitches and production deployments, we engineered a custom 3-tier ultra-fast failover strategy:
1. **Primary**: **AMD Developer Cloud** (Powered by AMD Instinct GPUs running `gemma2-9b-it`).
2. **Secondary Fallback**: **Fireworks AI** Custom Deployment (Gemma 4).
3. **Tertiary Fallback**: **AI/ML API** (`google/gemma-4-26b-a4b-it`).

*Note: The platform features aggressive micro-timeouts to immediately reroute traffic to healthy endpoints if an AI node scales down or goes offline, ensuring the AI Agent Center is always responsive.*

## 🛠️ Tech Stack
- **Frontend/Backend**: Next.js 16 (App Router), React 19, TailwindCSS
- **AI Infrastructure**: Gemma 4 (AMD Cloud / Fireworks AI / AI/ML API)
- **Deployment**: Live on **Hostinger** (`magenta-termite-395904.hostingersite.com`) and fully Dockerized (`standalone` mode).

## 🚀 Getting Started

You can test the live application at our Hostinger deployment:
**[TradeGrid Africa Live Demo](http://magenta-termite-395904.hostingersite.com/)**

Or run the complete Dockerized environment locally:

### Prerequisites
- Docker and Docker Compose installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/rasali535/Pula-Trade.git
   cd Pula-Trade
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   # AI Inference
   AI_MODEL_ENDPOINT=https://fresh-paws-lick.loca.lt/v1/chat/completions
   AI_API_KEY=ollama
   
   # Fallback Endpoints
   FIREWORKS_API_KEY=your_fireworks_key
   AIML_API_KEY=your_aiml_key

   # Dedicated TradeGrid Supabase project
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
   ```

3. Apply the canonical database migration from `supabase/migrations/03_production_backend.sql` to the dedicated TradeGrid Supabase project.

4. Build the application with the public Supabase values available during the Next.js build. When using Docker directly:
   ```bash
   docker build \
     --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
     --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
     -t tradegrid-africa .
   docker run -p 7501:7501 tradegrid-africa
   ```

   If Hostinger manages the build, configure these as build environment variables before redeploying.

5. Access the platform at `http://localhost:7501`.

## 📈 The Market Opportunity (Track 3 Focus)
Sub-Saharan Africa possesses massive industrial potential, yet cross-border distribution remains bottlenecked by paper-based processes. TradeGrid Africa unlocks a **$300B+ enterprise sector** by digitizing compliance and providing real-time AI trade intelligence.

## 🎥 Video Demo
[Insert Link to YouTube/Vimeo Demo Here]

---
*Built with ❤️ for the AMD Developer Hackathon.*
