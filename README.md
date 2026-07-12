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
- **Frontend/Backend**: Next.js 14 (App Router), React, TailwindCSS
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
   ```

3. Spin up the application:
   ```bash
   docker compose up --build -d
   ```

4. Access the platform at `http://localhost:7501`.

## 📈 The Market Opportunity (Track 3 Focus)
Sub-Saharan Africa possesses massive industrial potential, yet cross-border distribution remains bottlenecked by paper-based processes. TradeGrid Africa unlocks a **$300B+ enterprise sector** by digitizing compliance and providing real-time AI trade intelligence.

## 🎥 Video Demo
[Insert Link to YouTube/Vimeo Demo Here]

---
*Built with ❤️ for the AMD Developer Hackathon.*
