import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || query.trim().length < 2) return NextResponse.json({ suggestions: [] });

  const prompt = `List up to 6 Indian medicine brand names or salt names that start with or closely match "${query}".
Return ONLY a raw JSON array of strings. No explanation, no markdown, no code fences.
Example: ["Crocin","Calpol","Cetirizine","Cipla","Combiflam","Cofsils"]`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", temperature: 0.1, max_tokens: 200,
        messages: [
          { role: "system", content: "You suggest Indian medicine names. Respond with only a raw JSON array of strings." },
          { role: "user", content: prompt }
        ],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ suggestions: [] });
    return NextResponse.json({ suggestions: JSON.parse(match[0]) });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
