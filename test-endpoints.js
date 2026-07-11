const fs = require('fs');

async function testConnections() {
  console.log("=== Testing AMD Developer Cloud (AnruiCloud) ===");
  try {
    const res = await fetch("https://radeon-global.anruicloud.com/instances/hf-347-f5fd805f/proxy/8000/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ollama"
      },
      body: JSON.stringify({
        model: "gemma4",
        messages: [{ role: "user", content: "Say hello!" }],
        max_tokens: 10
      })
    });
    console.log(`AMD Status: ${res.status}`);
    const text = await res.text();
    console.log(`AMD Response: ${text.substring(0, 200)}`);
  } catch (e) {
    console.error("AMD Error:", e.message);
  }

  console.log("\n=== Testing Fireworks AI ===");
  try {
    const res = await fetch("https://api.fireworks.ai/inference/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer fw_9aDUQSJFE5WMLZiGTx1vAH"
      }
    });
    console.log(`Fireworks Status: ${res.status}`);
    const data = await res.json();
    console.log(`Fireworks Models count: ${data.data?.length || 0}`);
    console.log(`Available Models: ${data.data?.map(m => m.id).join(', ')}`);
  } catch (e) {
    console.error("Fireworks Error:", e.message);
  }
}

testConnections();
