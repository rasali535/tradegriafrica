import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai-client';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // Combine recent message history for context, or just pass the latest
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    // Create a textual conversation history (simple way to pass context)
    let prompt = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
    prompt += "\nAI:"; // Prompt the AI to answer

    const response = await callAI(
      prompt,
      "I am currently operating in simulation mode and cannot answer that.", // Fallback
      { 
        isJson: false,
        systemPrompt: "You are a helpful and highly knowledgeable AI assistant for TradeGrid Africa, a platform for cross-border B2B agribusiness and procurement in the SADC region. Provide concise, accurate, and professional answers."
      }
    );

    return NextResponse.json({
      text: response.data,
      latency_ms: response.latency_ms,
      confidence_score: response.confidence_score,
      source: response.source
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
