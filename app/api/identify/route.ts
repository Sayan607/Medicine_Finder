import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType, language } = await req.json();
  if (!imageBase64) return NextResponse.json({ medicines: [], error: "No image" });

  const isBengali = language === "bn";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.1, max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } },
            {
              type: "text",
              text: `This is a medical prescription. Extract ALL medicines mentioned.

For each medicine return a JSON array of objects with:
- name: medicine name as written
- dosage: dosage if mentioned (e.g. "500mg") or ""
- frequency: how often (e.g. "twice daily") or "" ${isBengali ? "in Bengali" : ""}
- whenToEat: ONLY one of "Before food"/"After food"/"With food"/"Empty stomach"/"Not specified" ${isBengali ? "- in Bengali" : ""}
- duration: for how many days if mentioned or ""
- instructions: any special instructions ${isBengali ? "in Bengali" : ""} or ""

Return ONLY a raw JSON array. No markdown, no explanation.
If no medicines found, return [].

Example: [{"name":"Crocin 500","dosage":"500mg","frequency":"twice daily","whenToEat":"After food","duration":"5 days","instructions":""}]`
            }
          ]
        }],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ medicines: [] });
    return NextResponse.json({ medicines: JSON.parse(match[0]) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ medicines: [], error: "Failed" }, { status: 500 });
  }
}
