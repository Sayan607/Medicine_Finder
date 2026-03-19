import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, language, mode } = await req.json();
    const isBengali = language === "bn";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    let prompt = "";
    if (mode === "prescription") {
      prompt = `You are an expert pharmacist. Read this prescription.
      Return a JSON object with a single key "medicines" containing an array of objects.
      Each object must have: 
      - name (string)
      - dosage (string, or empty)
      - frequency (string, or empty)
      - whenToEat (string, or "Not specified")
      - duration (string, or empty)
      - instructions (string, or empty)
      ${isBengali ? "Translate 'instructions' and 'whenToEat' to Bengali." : ""}`;
    } else {
      prompt = `Identify the main medicine in this image. Return a JSON object with a single key "medicineName" (string). If it is clearly not a medicine or unreadable, return an empty string.`;
    }

    const imagePart = {
      inlineData: { data: imageBase64, mimeType },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const parsed = JSON.parse(result.response.text());
    
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Identify Route Error:", err);
    return NextResponse.json({ error: err.message || "Failed to identify image" }, { status: 500 });
  }
}
