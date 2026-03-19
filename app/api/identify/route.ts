import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType, language, mode } = await req.json();
  if (!imageBase64) return NextResponse.json({ medicines: [], error: "No image" });

  const isBengali = language === "bn";

  if (mode === "prescription") {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          temperature: 0.1,
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` },
              },
              {
                type: "text",
                text: `This is a handwritten Indian doctor's prescription. Carefully read and extract every medicine.

Indian doctors commonly write:
- Tab / Cap / Inj / Syr / Gel / Drops before medicine names
- Dosage timing: 1-0-1 (morning-afternoon-night), 0-0-1, 1-1-1, BD (twice daily), TDS (thrice daily), OD (once daily)
- AC = before food, PC = after food, HS = at bedtime
- Duration like x5, x7, for 10 days
- Common Indian medicines: Azee/Azithro (Azithromycin), Taxim/Cefpodoxime, Pan/Pantop (Pantoprazole), Dolo/Crocin (Paracetamol), Oflox (Ofloxacin), Ibuprofen/Brufen, Metrogyl (Metronidazole), Byna Gel, Allegra (Fexofenadine), Montair (Montelukast)

For EACH medicine, return a JSON array with:
- name: medicine name — best guess even if handwriting is messy (string)
- dosage: strength like "500mg" or "" (string)
- frequency: e.g. "1-0-1", "Once daily", "Twice daily", "At bedtime" (string)
- whenToEat: ONLY one of: "Before food" / "After food" / "With food" / "At bedtime" / "Not specified"
- duration: e.g. "5 days", "10 days" or "" (string)
- instructions: extra note or "" (string)

STRICT RULES:
- Never return "TBD", numbers only, or single letters as medicine names
- 1-0-1 means morning and night = "Twice daily (morning & night)", whenToEat: "After food"
- 0-1-0 means only afternoon = "Once daily (afternoon)"
- 0-0-1 means only night = "Once daily (at night)"
- AC before medicine = "Before food", PC = "After food"
- Return ONLY raw JSON array, no markdown, no explanation.

Example:
[{"name":"Azee 500","dosage":"500mg","frequency":"Once daily","whenToEat":"After food","duration":"5 days","instructions":""},{"name":"Pantoprazole 40mg","dosage":"40mg","frequency":"Once daily","whenToEat":"Before food","duration":"","instructions":"Take 30 minutes before breakfast"}]`,
              }
            ],
          }],
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return NextResponse.json({ medicines: [] });

      const medicines = JSON.parse(match[0]);
      const cleaned = medicines.filter((m: any) =>
        m.name &&
        m.name.length > 2 &&
        !/^\d+(\s*\.\s*\d+)?$/.test(m.name.trim()) &&
        !["tbd", "lm", "na", "n/a"].includes(m.name.toLowerCase().trim())
      );

      return NextResponse.json({ medicines: cleaned });
    } catch (err) {
      console.error("Scan error:", err);
      return NextResponse.json({ medicines: [], error: "Failed" }, { status: 500 });
    }
  }

  // Single medicine identification (camera search)
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.1,
        max_tokens: 200,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } },
            {
              type: "text",
              text: `Look at this medicine image. Identify the medicine brand name or salt/generic name visible on the packaging or strip.
Return ONLY a raw JSON object: {"medicineName": "name here"}
If you cannot identify any medicine, return: {"medicineName": null}
No explanation, no markdown, no code fences.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ medicineName: null });
    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("Identify error:", err);
    return NextResponse.json({ medicineName: null, error: "Failed" }, { status: 500 });
  }
}
