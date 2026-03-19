import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { medicines, language } = await req.json();
  if (!medicines || medicines.length < 2) return NextResponse.json({ error: "Need at least 2 medicines" });

  const isBengali = language === "bn";

  const prompt = `You are a clinical pharmacology expert for India. Check interactions between these medicines: ${medicines.join(", ")}.

Return a single JSON object (not array) with ALL these fields:

- overall: ONLY one of: "safe"/"warning"/"dangerous"
- summary: 1-2 sentence overall summary ${isBengali ? "in Bengali" : ""}
- safeToTake: boolean
- advice: what the patient should do ${isBengali ? "in Bengali" : ""} (string)
- safetyScore: number 1-10 (1=completely safe together, 10=extremely dangerous together)
- safetyVerdict: ONLY one of: "Safe"/"Caution"/"Avoid"
- interactionReason: 2-3 sentences explaining WHY these medicines interact or don't ${isBengali ? "in Bengali" : ""} (string)
- keyPoints: array of 3-5 important highlighted points about this combination ${isBengali ? "in Bengali" : ""} (string[])
- pairs: array of interaction pairs, each with:
  - medicines: array of 2 medicine names
  - severity: "safe"/"warning"/"dangerous"
  - description: short description ${isBengali ? "in Bengali" : ""}
  - why: why this interaction happens ${isBengali ? "in Bengali" : ""}
  - whatToDo: what to do about it ${isBengali ? "in Bengali" : ""}

Rules:
- safetyScore 1-3 = Safe (green), 4-6 = Caution (yellow), 7-10 = Avoid (red)
- Be medically accurate for Indian medicine brands
- Return ONLY raw JSON object. No markdown, no code fences.`;

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
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: "You are a clinical pharmacology expert. Respond with only a raw JSON object.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "No result" });
    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
