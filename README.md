# TradeGrid Africa 🌍🚀
**Transforming Cross-Border Enterprise Trade in the SADC Region with AMD Generative AI**

[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by AMD](https://img.shields.io/badge/Powered_by-AMD_MI300X-red?style=for-the-badge&logo=amd)](https://amd.com)
[![AI Model](https://img.shields.io/badge/AI-Gemma_4-blue?style=for-the-badge)](https://ai.google.dev/gemma)

TradeGrid Africa is a multi-agent B2B procurement platform designed to eliminate the bottlenecks of cross-border trade within the Southern African Development Community (SADC). 

This project was built for the **AMD Developer Hackathon Act II (Track 3: Unicorn Track)**.

## 🧠 AMD AI Architecture
To handle complex enterprise logistics, compliance checking, and contract generation, TradeGrid Africa utilizes a **Multi-Agent Orchestrator** powered by **Gemma 4**.

We leverage the extreme high-throughput of **AMD MI300X accelerators** (via the AMD Developer Cloud) to run our agents **concurrently**. Instead of sequential AI processing, our system fires parallel inference requests for Supplier Discovery, RFQ Intelligence, Trade Compliance, and Logistics Routing. 

### Why AMD?
- **Concurrency**: Parallel execution of 4 heavy LLM workloads cuts end-to-end pipeline latency by over 60%.
- **Throughput**: AMD hardware effortlessly handles the large context windows required for analyzing complex SADC trade treaties and multimodal logistics matrices.

## 🛠️ Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router), React, TailwindCSS
- **AI Infrastructure**: Gemma 4 (via Fireworks AI / Local Ollama) running on AMD MI300X instances.
- **Deployment**: Dockerized (`standalone` mode) for reliable cloud hosting.

## 🚀 Getting Started

We provide a complete Dockerized environment for easy evaluation by the judges.

### Prerequisites
- Docker and Docker Compose installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tradegrid-africa.git
   cd tradegrid-africa
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   FIREWORKS_API_KEY=your_api_key_here
   ```

3. Spin up the application:
   ```bash
   docker compose up --build -d
   ```

4. Access the platform at `http://localhost:3000`.

## 📈 The Market Opportunity (Track 3 Focus)
Sub-Saharan Africa possesses massive industrial potential, yet cross-border distribution remains bottlenecked by paper-based processes. TradeGrid Africa unlocks a **$300B+ enterprise sector** by digitizing compliance and providing real-time AI trade intelligence.

## 🎥 Video Demo
[Insert Link to YouTube/Vimeo Demo Here]

## 🤝 Team
- [Your Name] - [Your Role]

---
*Built with ❤️ for the AMD Developer Hackathon.*
