import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge"; // Keeps Vercel lightning fast

// 1. Initialize Supabase Connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  const { query, language } = await req.json();

  if (!query || query.trim().length < 2) return NextResponse.json({ results: [] });

  const isBengali = language === "bn";
  const safeQuery = query.trim().toLowerCase();

  try {
    // ==========================================
    // STEP 1: CHECK SUPABASE DATABASE FIRST
    // ==========================================
    const { data: dbMeds, error: dbError } = await supabase
      .from('medicines')
      .select('*')
      .or(`name.ilike.%${safeQuery}%,salt.ilike.%${safeQuery}%`)
      .limit(4);

    if (dbMeds && dbMeds.length > 0) {
      console.log("⚡ LOADED FROM SUPABASE CACHE");
      
      // Format Postgres columns (which are lowercase) to match frontend expectations
      const formattedResults = dbMeds.map(med => ({
        name: med.name,
        salt: med.salt,
        manufacturer: med.manufacturer,
        price: Number(med.price),
        type: med.type,
        uses: med.uses,
        dosage: med.dosage,
        whenToEat: med.whentoeat, // DB is lowercased
        sideEffects: med.sideeffects || [], 
        interactions: med.interactions || [],
        warnings: med.warnings || { pregnancy: "", children: "", elderly: "" }
      }));
      
      return NextResponse.json({ results: formattedResults });
    }

    // ==========================================
    // STEP 2: NOT IN DB? FALLBACK TO GEMINI AI
    // ==========================================
    console.log("🤖 NOT IN DB, ASKING GEMINI...");
    
    const prompt = `You are a comprehensive medicine database for India. User searched: "${query}".
SPELLING TOLERANCE: If the query has spelling mistakes but clearly refers to a real medicine, treat it as that medicine.
Return a JSON object with a single key "results" containing an array of up to 4 matching Indian medicines. 
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite", 
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    });

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    const finalResults = parsed.results || [];

    // ==========================================
    // STEP 3: AUTO-CACHE TO SUPABASE
    // ==========================================
    // We only save English queries to the DB to keep our data clean
    if (!isBengali && finalResults.length > 0) {
        const insertData = finalResults.map((med: any) => ({
            name: med.name,
            salt: med.salt,
            manufacturer: med.manufacturer,
            price: med.price || 0,
            type: med.type || "Tablet",
            uses: med.uses || "",
            dosage: med.dosage || "",
            whentoeat: med.whenToEat || "Any time",
            sideeffects: med.sideEffects || [],
            interactions: med.interactions || [],
            warnings: med.warnings || {},
            search_tags: [query.toLowerCase(), med.name.toLowerCase(), med.salt.toLowerCase()]
        }));
        
        // We don't 'await' this insert. It happens silently in the background!
        supabase.from('medicines').insert(insertData).then(({error}) => {
            if (error) console.error("Cache insert error:", error.message);
            else console.log(`💾 SAVED ${insertData.length} NEW MEDS TO DATABASE!`);
        });
    }

    return NextResponse.json({ results: finalResults });

  } catch (err: any) {
    console.error("Medicine Route Error:", err);
    return NextResponse.json({ results: null, error: err.message || "Failed to fetch data" }, { status: 500 });
  }
}
