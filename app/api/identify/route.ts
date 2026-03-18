import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();

  if (!imageBase64) {
    return NextResponse.json({ medicineName: null, error: "No image provided" });
  }

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
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: `Look at this medicine image. Identify the medicine brand name or salt/generic name visible on the packaging or strip.
Return ONLY a raw JSON object with one field: {"medicineName": "name here"}
If you cannot identify any medicine, return: {"medicineName": null}
No explanation, no markdown, no code fences.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ medicineName: null });

    const result = JSON.parse(match[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Identify API error:", err);
    return NextResponse.json({ medicineName: null, error: "Failed to identify" });
  }
}
