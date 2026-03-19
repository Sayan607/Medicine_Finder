import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, language } = await req.json();
  if (!query || query.trim().length < 2) return NextResponse.json({ results: [] });

  const isBengali = language === "bn";

  const prompt = `You are a comprehensive medicine database for India. User searched: "${query}".
This could be a medicine name, salt/generic name, symptom, or disease.

Return a JSON array of up to 8 matching Indian medicines. Each object must have ALL these fields:
- name: brand name (string)
- salt: active ingredient (string)
- manufacturer: Indian company name (string)
- price: Indian MRP in rupees for standard strip (number)
- type: "Tablet"/"Syrup"/"Capsule"/"Injection"/"Drops" (string)
- uses: what it treats, 1-2 sentences ${isBengali ? "in Bengali" : "in English"} (string)
- dosage: typical adult dose e.g. "1 tablet twice daily" ${isBengali ? "in Bengali" : ""} (string)
- whenToEat: ONLY one of: "Before food" / "After food" / "With food" / "Empty stomach" / "Any time" ${isBengali ? "- translate to Bengali" : ""} (string)
- sideEffects: array of 3-5 common side effects ${isBengali ? "in Bengali" : "in English"} (string[])
- warnings: object with keys pregnancy, children, elderly - each a short string ${isBengali ? "in Bengali" : "in English"}
- interactions: array of 2-4 medicine/substance names to avoid with this (string[])

Rules:
- If query is a symptom/disease (fever, headache, diabetes), return relevant medicines
- Use realistic Indian MRP prices
- Return ONLY raw JSON array. No markdown, no code fences, no explanation.

Example:
[{"name":"Crocin","salt":"Paracetamol 500mg","manufacturer":"GSK","price":30,"type":"Tablet","uses":"Relieves fever and mild to moderate pain including headache","dosage":"1-2 tablets every 4-6 hours, max 8/day","whenToEat":"After food","sideEffects":["Nausea","Skin rash","Liver damage in overdose"],"warnings":{"pregnancy":"Safe in recommended doses","children":"Use pediatric dosage","elderly":"Reduce dose if kidney issues"},"interactions":["Warfarin","Alcohol","Other paracetamol products"]}]`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, max_tokens: 3000,
        messages: [
          { role: "system", content: "You are a medicine database for India. Respond with only a raw JSON array." },
          { role: "user", content: prompt }
        ],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ results: [] });
    return NextResponse.json({ results: JSON.parse(match[0]) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ results: [], error: "Failed" }, { status: 500 });
  }
}
