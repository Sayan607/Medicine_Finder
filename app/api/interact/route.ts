import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { medicines, language } = await req.json();
  if (!medicines || medicines.length < 2) return NextResponse.json({ error: "Need at least 2 medicines" });

  const isBengali = language === "bn";
  const medicineList = medicines.join(", ");

  const prompt = `You are a clinical pharmacist. Check interactions between these medicines: ${medicineList}

Return a JSON object with:
- overall: "safe" | "warning" | "dangerous"
- summary: 1-2 sentence overall assessment ${isBengali ? "in Bengali" : "in English"}
- pairs: array of objects for each medicine pair with:
  - medicines: [name1, name2]
  - severity: "safe" | "warning" | "dangerous"  
  - description: what happens when combined ${isBengali ? "in Bengali" : "in English"} (1 sentence)
- advice: practical advice for the patient ${isBengali ? "in Bengali" : "in English"} (1-2 sentences)
- safeToTake: boolean

Return ONLY raw JSON object. No markdown, no code fences.

Example:
{"overall":"warning","summary":"Some combinations require caution","pairs":[{"medicines":["Aspirin","Warfarin"],"severity":"dangerous","description":"Increases bleeding risk significantly"}],"advice":"Consult your doctor before taking these together","safeToTake":false}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, max_tokens: 1500,
        messages: [
          { role: "system", content: "You are a clinical pharmacist. Respond with only raw JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Failed to parse" });
    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
