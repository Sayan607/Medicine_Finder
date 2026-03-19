import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { medicines, language } = await req.json();
  if (!medicines || medicines.length < 2) return NextResponse.json({ error: "Need at least 2 medicines" });

  const isBengali = language === "bn";

  const prompt = `You are a clinical pharmacology expert for India. Check interactions between these medicines: ${medicines.join(", ")}.

Return a single JSON object with ALL these fields:

{
  "overall": "safe" or "warning" or "dangerous",
  "summary": "1-2 sentence overall summary",
  "safeToTake": true or false,
  "advice": "what the patient should do",
  "safetyScore": number from 1 to 10,
  "safetyVerdict": "Safe" or "Caution" or "Avoid",
  "interactionReason": "2-3 sentences explaining why",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "pairs": [
    {
      "medicines": ["medicine1", "medicine2"],
      "severity": "safe" or "warning" or "dangerous",
      "description": "short description",
      "why": "why this interaction happens",
      "whatToDo": "what to do about it"
    }
  ]
}

Rules:
- safetyScore 1-3 = safe, 4-6 = caution, 7-10 = avoid
- Be medically accurate for Indian medicine brands
- Return ONLY the raw JSON object. No markdown, no code fences, no extra text.`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: "You are a clinical pharmacology expert. Always respond with only a valid raw JSON object. No markdown, no code fences.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    // Try to extract JSON object from response
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "No result" }, { status: 500 });

    const parsed = JSON.parse(match[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
