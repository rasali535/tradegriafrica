const fs = require('fs');

async function testConnections() {
  console.log("=== Testing AI/ML API Chat ===");
  try {
    const res = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 55ae78fd34bb64d7947805de863e97ab"
      },
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it",
        messages: [{ role: "user", content: "Say hello!" }],
        max_tokens: 10
      })
    });
    console.log(`AI/ML API Status: ${res.status}`);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testConnections();
