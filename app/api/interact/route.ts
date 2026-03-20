import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // 1. Get the data from the request
    const body = await req.json();
    const { medicines, language } = body;
    
    if (!medicines || !Array.isArray(medicines)) {
      return NextResponse.json({ error: "No medicines selected" }, { status: 400 });
    }

    const isBengali = language === "bn";

    // 2. Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get info about these specific medicines from our DB
    const { data: dbMeds } = await supabase
      .from('medicines')
      .select('name, interactions, salt')
      .in('name', medicines);

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `Analyze these medicines for interactions: ${medicines.join(", ")}.
    Known Data: ${JSON.stringify(dbMeds || [])}
    
    Return ONLY a JSON object:
    {
      "summary": "...",
      "interactionReason": "...",
      "keyPoints": ["..."],
      "pairs": [
        { "medicines": ["med1", "med2"], "severity": "safe" | "warning" | "dangerous", "description": "why", "whatToDo": "advice" }
      ],
      "advice": "..."
    }
    Translate all text to ${isBengali ? "Bengali" : "English"}.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(responseText);

    // 4. Score Logic (Your Color Rules)
    let score = 2;
    const pairs = parsed.pairs || [];
    const hasDangerous = pairs.some((p: any) => p.severity === "dangerous");
    const warningCount = pairs.filter((p: any) => p.severity === "warning").length;

    if (hasDangerous) score = 9;
    else if (warningCount > 3) score = 8;
    else if (warningCount >= 1) score = 5;
    else score = 2;

    const verdict = score <= 3 ? (isBengali ? "নিরাপদ" : "Safe") : 
                    score <= 6 ? (isBengali ? "সতর্কতা" : "Caution") : 
                    (isBengali ? "এড়িয়ে চলুন" : "Avoid");

    return NextResponse.json({
      ...parsed,
      overall: score <= 3 ? "safe" : score <= 6 ? "warning" : "dangerous",
      safetyScore: score,
      safetyVerdict: verdict
    });

  } catch (error: any) {
    console.error("❌ INTERACTION ERROR:", error);
    return NextResponse.json({ error: "Failed to check interactions" }, { status: 500 });
  }
}
