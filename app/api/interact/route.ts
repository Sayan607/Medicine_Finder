import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, language } = await req.json();

  if (!query || query.trim().length < 2) return NextResponse.json({ results: [] });

  const isBengali = language === "bn";

  const prompt = `You are a comprehensive medicine database for India. User searched: "${query}".

This could be a brand name, salt/generic name, symptom, or disease.

Return a JSON array of up to 8 matching Indian medicines. Each object must have ALL fields:

- name: brand name (string)
- salt: active ingredient (string)
- manufacturer: Indian company name (string)
- price: Indian MRP in rupees for standard strip (number)
- type: "Tablet"/"Syrup"/"Capsule"/"Injection"/"Gel"/"Drops" (string)
- uses: what it treats ${isBengali ? "in Bengali" : ""} (string, 1-2 sentences)
- dosage: typical adult dose ${isBengali ? "in Bengali" : ""} (string)
- whenToEat: ONLY one of: "Before food"/"After food"/"With food"/"Empty stomach"/"Any time" ${isBengali ? "- translate to Bengali" : ""} (string)
- sideEffects: array of 3-5 common side effects ${isBengali ? "in Bengali" : ""} (string[])
- warnings: { pregnancy: string, children: string, elderly: string } ${isBengali ? "in Bengali" : ""}
- interactions: array of 2-4 medicines/substances to avoid (string[])
- safetyScore: number from 1-10 (1=completely safe, 10=extremely dangerous) (number)
- safetyVerdict: ONLY one of: "Safe"/"Caution"/"Avoid" (string)
- interactionReason: 2-3 sentences explaining why it is safe or unsafe to take ${isBengali ? "in Bengali" : ""} (string)
- keyPoints: array of 3-5 main highlighted points about safety or caution ${isBengali ? "in Bengali" : ""} (string[])

Rules:
- If query is symptom/disease, return relevant medicines for that condition
- Prioritize exact match first, then same-salt cheaper alternatives
- Use realistic Indian MRP prices
- safetyScore 1-3 = Safe (green), 4-6 = Caution (yellow), 7-10 = Avoid (red)
- Return ONLY raw JSON array. No markdown, no code fences.`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 3000,
        messages: [
          {
            role: "system",
            content: "You are a medicine database for India. Respond with only a raw JSON array.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) return NextResponse.json({ results: [] });

    return NextResponse.json({ results: JSON.parse(match[0]) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ results: [], error: "Failed" }, { status: 500 });
  }
}
