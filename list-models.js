const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/GEMINI_API_KEY=(.*)/);
process.env.GEMINI_API_KEY = keyMatch ? keyMatch[1] : '';

async function test() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
  const json = await response.json();
  console.log("Models:", json.models.map(m => m.name));
}
test();
