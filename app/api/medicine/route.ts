import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const prompt = `You are a medicine database for India. The user searched for: "${query}".

Return a JSON array of up to 8 matching Indian brand medicines.

Each result must have:
- name: brand name (string)
- salt: active ingredient / salt composition (string)
- manufacturer: company name (string)
- price: approximate Indian MRP in rupees for standard strip (number)
- type: e.g. "Tablet", "Syrup", "Capsule", "Injection" (string)
- dosage: typical adult dosage e.g. "1 tablet twice daily after meals" (string)
- uses: what it treats, 1 short sentence e.g. "Used for fever, headache and mild pain" (string)

Rules:
- Prioritize exact match first, then same-salt cheaper alternatives
- Use realistic Indian MRP prices
- If query is a salt name, return multiple brand alternatives
- If nothing matches, return []
- Return ONLY a raw JSON array. No markdown, no explanation, no code fences.

Example:
[{"name":"Crocin","salt":"Paracetamol 500mg","manufacturer":"GSK","price":30,"type":"Tablet","dosage":"1-2 tablets every 4-6 hours","uses":"Relief from fever, headache and mild to moderate pain"}]`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 2048,
        messages: [
          {
            role: "system",
            content: "You are a medicine database for India. Always respond with only a raw JSON array, no explanation, no markdown, no code fences.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ results: [] });

    const results = JSON.parse(match[0]);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Medicine API error:", err);
    return NextResponse.json({ results: [], error: "Failed" }, { status: 500 });
  }
}
