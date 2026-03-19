import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const { query, language } = await req.json();

  if (!query || query.trim().length < 2) return NextResponse.json({ results: [] });

  const isBengali = language === "bn";

  const prompt = `You are a comprehensive medicine database for India. User searched: "${query}".
SPELLING TOLERANCE: If the query has spelling mistakes but clearly refers to a real medicine, treat it as that medicine.
Return a JSON object with a single key "results" containing an array of up to 8 matching Indian medicines. 
Each object must have:
- name: brand name (string)
- salt: active ingredient (string)
- manufacturer: Indian company name (string)
- price: Indian MRP in rupees for standard strip (number)
- type: "Tablet"/"Syrup"/"Capsule"/"Injection"/"Gel"/"Drops" (string)
- uses: what it treats ${isBengali ? "in Bengali" : ""} (string)
- dosage: typical adult dose ${isBengali ? "in Bengali" : ""} (string)
- whenToEat: ONLY one of: "Before food"/"After food"/"With food"/"Empty stomach"/"Any time" ${isBengali ? "- translate to Bengali" : ""} (string)
- sideEffects: array of 3-5 common side effects ${isBengali ? "in Bengali" : ""} (string[])
- warnings: { pregnancy: string, children: string, elderly: string } ${isBengali ? "in Bengali" : ""}
- interactions: array of 2-4 medicines to avoid (string[])
- safetyScore: number from 1-10
- safetyVerdict: ONLY one of: "Safe"/"Caution"/"Avoid" (string)
- interactionReason: 2-3 sentences explaining why it is safe or unsafe ${isBengali ? "in Bengali" : ""} (string)
- keyPoints: array of 3-5 highlighted main points ${isBengali ? "in Bengali" : ""} (string[])`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    });

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    
    return NextResponse.json({ results: parsed.results || [] });
  } catch (err: any) {
    console.error("Medicine Route Error:", err);
    return NextResponse.json({ results: null, error: err.message || "Failed to fetch data" }, { status: 500 });
  }
}
