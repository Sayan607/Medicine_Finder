import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { medicines, language } = await req.json();

    if (!medicines || medicines.length < 2) {
      return NextResponse.json({ error: "Need at least 2 medicines" }, { status: 400 });
    }

    const isBengali = language === "bn";

    const prompt = `You are a clinical pharmacology expert for India. Check interactions between: ${medicines.join(", ")}.

Respond with ONLY this exact JSON structure:
{
  "overall": "safe" | "warning" | "dangerous",
  "summary": "brief summary here",
  "safeToTake": boolean,
  "advice": "advice here",
  "safetyScore": number (1-10),
  "safetyVerdict": "Safe" | "Caution" | "Avoid",
  "interactionReason": "reason here",
  "keyPoints": ["point 1"],
  "pairs": [
    {
      "medicines": ["med1", "med2"],
      "severity": "safe" | "warning" | "dangerous",
      "description": "description here",
      "why": "why here",
      "whatToDo": "what to do here"
    }
  ]
}
${isBengali ? "Write summary, advice, interactionReason, keyPoints, description, why, whatToDo in Bengali" : "Write all text fields in English"}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
    });

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Interact Route Error:", err);
    return NextResponse.json({ error: err.message || "Failed to check interactions" }, { status: 500 });
  }
}
