const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/GEMINI_API_KEY=(.*)/);
process.env.GEMINI_API_KEY = keyMatch ? keyMatch[1] : '';

async function test() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = "gemini-flash-latest";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  console.log("Key:", GEMINI_API_KEY);

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Hello" }] }]
    })
  });
  
  const json = await response.json();
  console.log("Response:", JSON.stringify(json, null, 2));
}
test();
