import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType, language, mode } = await req.json();
  if (!imageBase64) return NextResponse.json({ medicines: [], error: "No image" });
  const isBengali = language === "bn";

  if (mode === "prescription") {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
                text: `This is a handwritten Indian doctor's prescription. Carefully read and extract every medicine.

Indian doctors write:
- Tab/Cap/Inj/Syr/Gel/Drops before medicine names
- 1-0-1 = morning and night, 0-0-1 = only night, 1-1-1 = three times, BD = twice, TDS = thrice, OD = once
- AC = before food, PC = after food, HS = at bedtime
- x5/x7/x10 = duration in days
- Common medicines: Azee/Azithro=Azithromycin, Taxim=Cefpodoxime, Pan/Pantop=Pantoprazole, Dolo/Crocin=Paracetamol, Oflox=Ofloxacin, Metrogyl=Metronidazole, Montair=Montelukast, Allegra=Fexofenadine

For each medicine return JSON array with:
- name: medicine name (string)
- dosage: strength like "500mg" or "" (string)
- frequency: e.g. "Twice daily", "Once at night", "1-0-1" ${isBengali ? "in Bengali" : ""} (string)
- whenToEat: ONLY one of: "Before food"/"After food"/"With food"/"At bedtime"/"Not specified" ${isBengali ? "in Bengali" : ""} (string)
- duration: e.g. "5 days" or "" (string)
- instructions: extra note or "" (string)

STRICT: Never return "TBD", numbers only, or single letters as medicine names.
Return ONLY raw JSON array. No markdown.`
              }
            ]
          }],
        }),
      });
      const data = await r.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return NextResponse.json({ medicines: [] });
      const medicines = JSON.parse(match[0]);
      const cleaned = medicines.filter((m: any) =>
        m.name && m.name.length > 2 &&
        !/^\d+(\s*\.\s*\d+)?$/.test(m.name.trim()) &&
        !["tbd","lm","na","n/a"].includes(m.name.toLowerCase().trim())
      );
      return NextResponse.json({ medicines: cleaned });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ medicines: [], error: "Failed" }, { status: 500 });
    }
  }

  // Single medicine camera identification
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.1, max_tokens: 200,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } },
            { type: "text", text: `Identify the medicine brand name or salt visible on this packaging or strip.
Return ONLY: {"medicineName": "name here"} or {"medicineName": null}` }
          ]
        }],
      }),
    });
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ medicineName: null });
    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ medicineName: null, error: "Failed" }, { status: 500 });
  }
}
