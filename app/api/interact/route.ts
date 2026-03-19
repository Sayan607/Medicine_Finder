import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { medicines, language } = body;

    if (!medicines || medicines.length < 2) {
      return NextResponse.json({ error: "Need at least 2 medicines" }, { status: 400 });
    }

    const isBengali = language === "bn";

    const prompt = `You are a clinical pharmacology expert for India. Check interactions between: ${medicines.join(", ")}.

Respond with ONLY this exact JSON structure:
{
  "overall": "safe",
  "summary": "brief summary here",
  "safeToTake": true,
  "advice": "advice here",
  "safetyScore": 2,
  "safetyVerdict": "Safe",
  "interactionReason": "reason here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "pairs": [
    {
      "medicines": ["med1", "med2"],
      "severity": "safe",
      "description": "description here",
      "why": "why here",
      "whatToDo": "what to do here"
    }
  ]
}

Rules:
- overall must be exactly: "safe" or "warning" or "dangerous"
- safetyVerdict must be exactly: "Safe" or "Caution" or "Avoid"  
- safetyScore: 1-3 safe, 4-6 caution, 7-10 avoid
- ${isBengali ? "Write summary, advice, interactionReason, keyPoints, description, why, whatToDo in Bengali" : "Write all text fields in English"}
- Return ONLY a valid JSON object. No markdown, no code fences.`;

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a pharmacology expert. Respond with ONLY a valid JSON object.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      console.error("Groq API error:", r.status, errData);
      
      if (r.status === 429) {
        return NextResponse.json({ error: "Rate limit reached. Please wait a moment before checking again." }, { status: 429 });
      }
      return NextResponse.json({ error: `API Error: ${r.statusText}` }, { status: r.status });
    }

    const data = await r.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    
    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Interact route error:", err);
    return NextResponse.json({ error: "Failed to process interaction." }, { status: 500 });
  }
}
