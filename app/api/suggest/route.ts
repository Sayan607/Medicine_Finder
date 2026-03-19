import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || query.trim().length < 2) return NextResponse.json({ suggestions: [] });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
    });

    const prompt = `The user typed: "${query}". 
    Suggest 3 to 5 autocomplete strings. These should be common medicine names, salts, or symptoms in India that match the query.
    Return a JSON object with a single key "suggestions" containing an array of strings.`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());

    return NextResponse.json({ suggestions: parsed.suggestions || [] });
  } catch (err) {
    console.error("Suggest Route Error:", err);
    return NextResponse.json({ suggestions: [] });
  }
}
