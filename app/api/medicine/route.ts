import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, language } = await req.json();

  if (!query || query.trim().length < 2) return NextResponse.json({ results: [] });

  const isBengali = language === "bn";

  const prompt = `You are a comprehensive medicine database for India. User searched: "${query}".

This could be a brand name, salt/generic name, symptom, or disease.

SPELLING TOLERANCE RULES:
- If the query has 1-2 spelling mistakes but clearly refers to a real medicine, treat it as that medicine. Example: "Parcetamol" = "Paracetamol", "Atorvasttin" = "Atorvastatin"
- Only return an empty array if the query is completely unrecognizable.
- Always try your best to match to the closest real Indian medicine.

Return a JSON object with a single key "results" containing an array of up to 8 matching Indian medicines. Each object must have ALL fields:

- name: brand name (string)
- salt: active ingredient (string)
- manufacturer: Indian company name (string)
- price: Indian MRP in rupees for standard strip (number)
- type: "Tablet"/"Syrup"/"Capsule"/"Injection"/"Gel"/"Drops" (string)
- uses: what it treats ${isBengali ? "in Bengali" : ""} (string)
- dosage: typical adult dose ${isBengali ? "in Bengali" : ""} (string)
- whenToEat: ONLY one of: "Before food"/"After food"/"With food"/"Empty stomach"/"Any time" ${isBengali ? "- translate to Bengali" : ""} (string)
- sideEffects: array of 3-5 common side effects ${isBengali ? "in Bengali" : ""} (string[])
- warnings: { pregnancy: string, children: string, elderly: string } ${isBengali ? "in Bengali" : ""}
- interactions: array of 2-4 medicines/substances to avoid (string[])
- safetyScore: number from 1-10 (number)
- safetyVerdict: ONLY one of: "Safe"/"Caution"/"Avoid" (string)
- interactionReason: 2-3 sentences explaining why it is safe or unsafe ${isBengali ? "in Bengali" : ""} (string)
- keyPoints: array of 3-5 highlighted main points ${isBengali ? "in Bengali" : ""} (string[])

Rules:
- Prioritize exact match first, then same-salt cheaper alternatives
- Use realistic Indian MRP prices
- Return ONLY a valid JSON object. No markdown, no code fences.`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        temperature: 0.2, 
        max_tokens: 3000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a medicine database for India. Respond with ONLY a valid JSON object containing a 'results' array." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      console.error("Groq API Error:", r.status, errData);
      
      if (r.status === 429) {
         return NextResponse.json({ results: null, error: "Rate limit reached. Please wait a moment." }, { status: 429 });
      }
      return NextResponse.json({ results: null, error: `API Error: ${r.statusText}` }, { status: r.status });
    }

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    return NextResponse.json({ results: parsed.results || [] });

  } catch (err) {
    console.error("Route Error:", err);
    return NextResponse.json({ results: null, error: "Internal Server Error" }, { status: 500 });
  }
}
