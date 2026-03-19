"use client";
import { useState, useRef, useEffect, useCallback } from "react";

type Lang = "en" | "bn";
type Tab = "search" | "checker" | "scan";
type Safety = "safe" | "warning" | "dangerous";

type Medicine = {
  name: string; salt: string; manufacturer: string; price: number; type: string;
  uses: string; dosage: string; whenToEat: string;
  sideEffects: string[];
  warnings: { pregnancy: string; children: string; elderly: string };
  interactions: string[];
};

type InteractionResult = {
  overall: Safety; summary: string; safeToTake: boolean; advice: string;
  pairs: Array<{ medicines: string[]; severity: Safety; description: string }>;
};

type PrescriptionMed = {
  name: string; dosage: string; frequency: string;
  whenToEat: string; duration: string; instructions: string;
};

const T = {
  en: {
    subtitle: "Your personal medicine assistant",
    tabSearch: "Search", tabChecker: "Checker", tabScan: "Scan",
    searchPlaceholder: "Medicine, symptom or disease…",
    searchBtn: "Search", searching: "Searching…",
    sortLow: "Price: Low → High", sortHigh: "Price: High → Low", sortBy: "Sort",
    noResults: "No results found", noResultsSub: "Try a different name",
    initialTitle: "Search any medicine", initialSub: "Name, symptom, or disease — AI finds it all",
    uses: "Uses", dosage: "Dosage", whenToEat: "When to eat",
    sideEffects: "Side effects", warnings: "Warnings",
    interactions: "Avoid with", form: "Form", manufacturer: "Manufacturer",
    pregnancy: "Pregnancy", children: "Children", elderly: "Elderly",
    bestPrice: "Best Price", aiPowered: "✦ AI-powered",
    checkerTitle: "Interaction Checker",
    checkerSub: "Check if your medicines are safe together",
    addMedicine: "Add medicine name", addBtn: "Add",
    checkBtn: "Check Interactions", checking: "Checking…",
    checkerMin: "Add at least 2 medicines",
    safe: "Safe to take together", warning: "Take with caution", dangerous: "Do not take together",
    advice: "Advice",
    scanTitle: "Scan Prescription",
    scanSub: "Upload a photo of your prescription",
    uploadBtn: "Upload Prescription Photo",
    scanning: "Reading prescription…",
    scanResults: "Medicines found",
    noMeds: "No medicines detected", noMedsSub: "Try a clearer photo",
    frequency: "Frequency", duration: "Duration", instructions: "Instructions",
    history: "Recent", saved: "Saved",
    save: "Save", saved2: "Saved ✓", share: "Share", copied: "Copied!",
    disclaimer: "Prices are approximate. Consult a pharmacist before purchasing or changing medication.",
    results: "results found", result: "result found",
    findingPrices: "Finding best prices…", langBtn: "বাংলা",
  },
  bn: {
    subtitle: "আপনার ব্যক্তিগত ওষুধ সহায়ক",
    tabSearch: "খোঁজ", tabChecker: "পরীক্ষক", tabScan: "স্ক্যান",
    searchPlaceholder: "ওষুধ, উপসর্গ বা রোগ খুঁজুন…",
    searchBtn: "খুঁজুন", searching: "খোঁজা হচ্ছে…",
    sortLow: "দাম: কম → বেশি", sortHigh: "দাম: বেশি → কম", sortBy: "সাজান",
    noResults: "কোনো ফলাফল নেই", noResultsSub: "অন্য নাম দিয়ে চেষ্টা করুন",
    initialTitle: "যেকোনো ওষুধ খুঁজুন", initialSub: "নাম, উপসর্গ, রোগ — AI সব খুঁজে দেবে",
    uses: "ব্যবহার", dosage: "ডোজ", whenToEat: "কখন খাবেন",
    sideEffects: "পার্শ্বপ্রতিক্রিয়া", warnings: "সতর্কতা",
    interactions: "এড়িয়ে চলুন", form: "রূপ", manufacturer: "প্রস্তুতকারক",
    pregnancy: "গর্ভাবস্থা", children: "শিশু", elderly: "বয়স্ক",
    bestPrice: "সেরা দাম", aiPowered: "✦ AI-চালিত",
    checkerTitle: "ওষুধ মিশ্রণ পরীক্ষক",
    checkerSub: "আপনার ওষুধগুলো একসাথে নিরাপদ কিনা দেখুন",
    addMedicine: "ওষুধের নাম লিখুন", addBtn: "যোগ",
    checkBtn: "পরীক্ষা করুন", checking: "পরীক্ষা হচ্ছে…",
    checkerMin: "কমপক্ষে ২টি ওষুধ যোগ করুন",
    safe: "একসাথে নিরাপদ", warning: "সতর্কতার সাথে নিন", dangerous: "একসাথে নেবেন না",
    advice: "পরামর্শ",
    scanTitle: "প্রেসক্রিপশন স্ক্যান",
    scanSub: "আপনার প্রেসক্রিপশনের ছবি আপলোড করুন",
    uploadBtn: "প্রেসক্রিপশনের ছবি আপলোড করুন",
    scanning: "প্রেসক্রিপশন পড়া হচ্ছে…",
    scanResults: "পাওয়া ওষুধ",
    noMeds: "কোনো ওষুধ পাওয়া যায়নি", noMedsSub: "স্পষ্ট ছবি দিয়ে চেষ্টা করুন",
    frequency: "কতবার", duration: "কতদিন", instructions: "নির্দেশনা",
    history: "সাম্প্রতিক", saved: "সংরক্ষিত",
    save: "সংরক্ষণ", saved2: "সংরক্ষিত ✓", share: "শেয়ার", copied: "কপি!",
    disclaimer: "দাম আনুমানিক। ওষুধ কেনার আগে ফার্মাসিস্টের সাথে পরামর্শ করুন।",
    results: "টি ফলাফল", result: "টি ফলাফল",
    findingPrices: "সেরা দাম খোঁজা হচ্ছে…", langBtn: "English",
  }
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg: #f5f3ef;
  --bg2: #ede9e2;
  --white: #ffffff;
  --card: #ffffff;
  --border: #e2ddd6;
  --border2: #cec9c0;
  --text: #1a1714;
  --text2: #6b6560;
  --text3: #a09a92;
  --teal: #0d9488;
  --teal2: #0f766e;
  --teal-light: #f0faf9;
  --teal-border: #99f6e4;
  --gold: #b45309;
  --gold-light: #fef3c7;
  --gold-border: #fcd34d;
  --safe: #065f46;
  --safe-bg: #ecfdf5;
  --safe-border: #6ee7b7;
  --warn: #92400e;
  --warn-bg: #fffbeb;
  --warn-border: #fcd34d;
  --danger: #991b1b;
  --danger-bg: #fef2f2;
  --danger-border: #fca5a5;
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.07);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.05), 0 24px 48px rgba(0,0,0,0.09);
  --radius: 18px;
  --radius-sm: 10px;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html { font-size: 16px; }
body { background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); overflow-x: hidden; }

.app {
  min-height: 100vh; min-height: 100dvh;
  background: var(--bg);
  background-image:
    radial-gradient(ellipse 60% 40% at 10% 0%, rgba(13,148,136,0.06) 0%, transparent 55%),
    radial-gradient(ellipse 50% 35% at 90% 100%, rgba(180,83,9,0.05) 0%, transparent 50%);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 44px 16px 80px;
}
.container { width: 100%; max-width: 620px; }

/* HEADER */
.header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px; gap: 12px;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.logo-ring {
  width: 60px; height: 60px; border-radius: 50%;
  background: linear-gradient(135deg, #0d9488, #0891b2);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(13,148,136,0.3), 0 1px 3px rgba(0,0,0,0.1);
  flex-shrink: 0; overflow: hidden;
}
.logo-ring img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.title { font-family: 'Playfair Display', serif; font-size: 32px; letter-spacing: -0.5px; color: var(--text); line-height: 1; }
.subtitle { font-size: 12px; color: var(--text3); margin-top: 4px; font-weight: 400; }

.lang-btn {
  padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;
  background: var(--white); border: 1.5px solid var(--border2);
  color: var(--teal); cursor: pointer; white-space: nowrap;
  box-shadow: var(--shadow); transition: all 0.2s; letter-spacing: 0.2px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.lang-btn:hover { background: var(--teal-light); border-color: var(--teal); }

/* DISCLAIMER */
.disclaimer {
  display: flex; gap: 10px; padding: 12px 16px; border-radius: 12px;
  background: var(--gold-light); border: 1px solid var(--gold-border);
  margin-bottom: 22px;
}
.disclaimer span:first-child { font-size: 14px; flex-shrink: 0; }
.disclaimer-text { font-size: 12px; color: var(--gold); line-height: 1.5; font-weight: 400; }

/* TABS */
.tabs {
  display: flex; gap: 4px; margin-bottom: 24px;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 16px; padding: 5px;
  box-shadow: var(--shadow);
}
.tab-btn {
  flex: 1; padding: 10px 8px; border-radius: 12px; border: none;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; color: var(--text2);
  background: transparent; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.tab-btn.active {
  background: var(--teal); color: #fff;
  box-shadow: 0 2px 10px rgba(13,148,136,0.25);
}
.tab-icon { font-size: 14px; }

/* SEARCH */
.search-wrap { position: relative; margin-bottom: 12px; }
.search-row { display: flex; gap: 8px; }
.input-shell { flex: 1; position: relative; min-width: 0; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
.search-input {
  width: 100%; height: 52px; padding: 0 44px 0 42px; border-radius: 14px;
  background: var(--white); border: 1.5px solid var(--border);
  color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; outline: none;
  box-shadow: var(--shadow); transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
}
.search-input::placeholder { color: var(--text3); }
.search-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(13,148,136,0.1), var(--shadow); }
.search-input:disabled { opacity: 0.6; background: var(--bg2); }

.voice-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text3); cursor: pointer; padding: 4px;
  transition: color 0.2s;
}
.voice-btn:hover { color: var(--teal); }
.voice-btn.listening { color: var(--teal); animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.35} }

.icon-btn {
  height: 52px; width: 52px; border-radius: 14px; flex-shrink: 0;
  background: var(--white); border: 1.5px solid var(--border);
  color: var(--text2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow); transition: all 0.2s;
}
.icon-btn:hover { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }

.search-btn {
  height: 52px; padding: 0 20px; border-radius: 14px;
  background: var(--teal); border: none; color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600;
  cursor: pointer; box-shadow: 0 4px 14px rgba(13,148,136,0.3);
  transition: all 0.2s; white-space: nowrap;
  display: flex; align-items: center; gap: 7px; flex-shrink: 0;
}
.search-btn:hover:not(:disabled) { background: var(--teal2); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,148,136,0.35); }
.search-btn:active { transform: scale(0.97); }
.search-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

/* SUGGESTIONS */
.suggestions {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 50;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 14px; overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.sug-item {
  padding: 12px 16px; font-size: 13.5px; cursor: pointer;
  display: flex; align-items: center; gap: 10px; color: var(--text2);
  border-bottom: 1px solid var(--border); transition: background 0.15s;
}
.sug-item:last-child { border-bottom: none; }
.sug-item:hover { background: var(--teal-light); color: var(--teal); }
.sug-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--teal); flex-shrink: 0; }

/* CONTROLS */
.controls-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.ctrl-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.sort-select {
  height: 34px; padding: 0 26px 0 10px; border-radius: 9px;
  background: var(--white); border: 1.5px solid var(--border);
  color: var(--text2); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px;
  outline: none; cursor: pointer; -webkit-appearance: none; appearance: none;
  box-shadow: var(--shadow);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23a09a92' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center;
}

/* HISTORY */
.history-row { display: flex; align-items: center; gap: 7px; margin-bottom: 14px; flex-wrap: wrap; }
.hist-label { font-size: 10.5px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; white-space: nowrap; }
.hist-chip {
  padding: 5px 12px; border-radius: 18px; font-size: 12px; color: var(--text2);
  background: var(--white); border: 1.5px solid var(--border); cursor: pointer;
  box-shadow: var(--shadow); transition: all 0.15s; white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.hist-chip:hover { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }

/* IMAGE PREVIEW */
.img-wrap {
  margin-bottom: 12px; border-radius: 14px; overflow: hidden;
  border: 1.5px solid var(--teal-border); position: relative; background: var(--teal-light);
  box-shadow: var(--shadow);
}
.img-prev { width: 100%; max-height: 160px; object-fit: contain; display: block; }
.img-remove {
  position: absolute; top: 8px; right: 8px; width: 28px; height: 28px;
  border-radius: 50%; background: var(--white); border: 1.5px solid var(--border);
  color: var(--text2); cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow);
}
.img-status {
  padding: 9px 14px; font-size: 12px; display: flex; align-items: center; gap: 7px;
  background: var(--white); border-top: 1px solid var(--border);
}
.img-status.success { color: var(--teal); }
.img-status.error { color: var(--danger); }

.divider { height: 1.5px; background: var(--border); margin-bottom: 18px; border-radius: 1px; }

/* RESULTS META */
.results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.res-count { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; font-weight: 600; }
.ai-badge {
  font-size: 10.5px; color: var(--teal); background: var(--teal-light);
  border: 1.5px solid var(--teal-border); border-radius: 20px; padding: 3px 10px; font-weight: 600;
}

/* SAVED */
.saved-section { margin-bottom: 18px; }
.saved-header { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; margin-bottom: 8px; }
.saved-cards { display: flex; flex-direction: column; gap: 6px; }
.saved-card {
  padding: 12px 16px; border-radius: 12px; background: var(--white);
  border: 1.5px solid var(--border); display: flex; align-items: center;
  justify-content: space-between; cursor: pointer; box-shadow: var(--shadow);
  transition: all 0.15s;
}
.saved-card:hover { border-color: var(--teal); box-shadow: var(--shadow-md); }
.saved-name { font-size: 14px; font-weight: 500; color: var(--text); }
.saved-meta { font-size: 11.5px; color: var(--text3); margin-top: 2px; }
.unsave-btn { font-size: 11px; color: var(--text3); background: none; border: none; cursor: pointer; padding: 4px; }

/* MEDICINE CARDS */
.cards { display: flex; flex-direction: column; gap: 10px; }
.card {
  border-radius: var(--radius); background: var(--white);
  border: 1.5px solid var(--border); overflow: hidden;
  box-shadow: var(--shadow); animation: slideUp 0.3s ease both;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.card:hover { box-shadow: var(--shadow-md); }
.card.cheapest { border-color: var(--teal); border-width: 2px; }
@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.card:nth-child(1){animation-delay:.02s}.card:nth-child(2){animation-delay:.06s}
.card:nth-child(3){animation-delay:.10s}.card:nth-child(4){animation-delay:.14s}
.card:nth-child(5){animation-delay:.18s}.card:nth-child(6){animation-delay:.22s}

.card-top {
  padding: 16px 18px; display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; gap: 12px; -webkit-user-select: none; user-select: none;
}
.card-top:active { background: var(--bg); }
.card-left { min-width: 0; flex: 1; }
.card-name { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-salt { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-mfr { font-size: 11px; color: var(--text3); margin-top: 2px; }
.card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.price { font-size: 20px; font-weight: 700; color: var(--teal); font-family: 'Playfair Display', serif; }
.badge {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
  background: var(--teal); color: #fff; border-radius: 5px; padding: 2px 8px;
}
.type-tag { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; font-weight: 500; }
.expand-arr { font-size: 9px; color: var(--text3); transition: transform 0.25s; margin-top: 2px; }
.expand-arr.open { transform: rotate(180deg); }

/* EXPANDED */
.card-expanded {
  border-top: 1.5px solid var(--border); padding: 16px 18px;
  background: #fdfcfb; display: flex; flex-direction: column; gap: 14px;
}
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-block { }
.info-full { grid-column: 1 / -1; }
.info-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text3); font-weight: 700; margin-bottom: 5px; }
.info-value { font-size: 13px; color: var(--text2); line-height: 1.55; }
.when-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 500;
  background: var(--teal-light); color: var(--teal); border: 1.5px solid var(--teal-border);
}
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.tag {
  padding: 3px 10px; border-radius: 18px; font-size: 11.5px; font-weight: 400;
  background: var(--bg2); border: 1px solid var(--border); color: var(--text2);
}
.tag.danger { background: var(--danger-bg); border-color: var(--danger-border); color: var(--danger); }
.tag.warn { background: var(--warn-bg); border-color: var(--warn-border); color: var(--warn); }
.warn-grid { display: flex; flex-direction: column; gap: 7px; }
.warn-row { display: flex; gap: 10px; align-items: flex-start; }
.warn-key { font-size: 10.5px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; min-width: 72px; margin-top: 2px; }
.warn-val { font-size: 12.5px; color: var(--text2); line-height: 1.4; }

.card-actions { display: flex; gap: 7px; padding: 0 18px 14px; flex-wrap: wrap; }
.action-btn {
  padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
  background: var(--bg); border: 1.5px solid var(--border); color: var(--text2);
  cursor: pointer; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center; gap: 5px;
}
.action-btn:hover { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }
.action-btn.saved { background: var(--teal-light); color: var(--teal); border-color: var(--teal); }

/* CHECKER */
.checker-wrap { }
.section-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--text); margin-bottom: 4px; }
.section-sub { font-size: 13px; color: var(--text2); margin-bottom: 20px; }

.add-row { display: flex; gap: 8px; margin-bottom: 12px; }
.add-input {
  flex: 1; height: 48px; padding: 0 14px; border-radius: 12px;
  background: var(--white); border: 1.5px solid var(--border);
  color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
  outline: none; box-shadow: var(--shadow);
}
.add-input::placeholder { color: var(--text3); }
.add-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
.add-btn {
  height: 48px; padding: 0 18px; border-radius: 12px; font-size: 13px; font-weight: 600;
  background: var(--white); border: 1.5px solid var(--teal); color: var(--teal);
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
  box-shadow: var(--shadow); transition: all 0.15s;
}
.add-btn:hover { background: var(--teal); color: #fff; }

.med-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; min-height: 36px; }
.med-tag {
  padding: 6px 12px; border-radius: 20px; font-size: 13px;
  background: var(--teal-light); border: 1.5px solid var(--teal-border); color: var(--teal);
  display: flex; align-items: center; gap: 7px; font-weight: 500;
}
.med-tag-x { cursor: pointer; opacity: 0.5; font-size: 12px; line-height: 1; }
.med-tag-x:hover { opacity: 1; }

.check-btn {
  width: 100%; height: 52px; border-radius: 14px; font-size: 15px; font-weight: 600;
  background: var(--teal); border: none; color: #fff;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(13,148,136,0.3); transition: all 0.2s;
  margin-bottom: 18px;
}
.check-btn:hover:not(:disabled) { background: var(--teal2); transform: translateY(-1px); }
.check-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.checker-min { text-align: center; font-size: 12.5px; color: var(--text3); margin-top: -10px; margin-bottom: 16px; }

.interact-result { border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-md); animation: slideUp 0.3s ease; }
.interact-header { padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
.interact-header.safe { background: var(--safe-bg); border-bottom: 1.5px solid var(--safe-border); }
.interact-header.warning { background: var(--warn-bg); border-bottom: 1.5px solid var(--warn-border); }
.interact-header.dangerous { background: var(--danger-bg); border-bottom: 1.5px solid var(--danger-border); }
.safety-icon { font-size: 28px; }
.safety-label { font-size: 16px; font-weight: 700; }
.safety-label.safe { color: var(--safe); }
.safety-label.warning { color: var(--warn); }
.safety-label.dangerous { color: var(--danger); }
.safety-summary { font-size: 13px; color: var(--text2); margin-top: 3px; }
.interact-body { padding: 16px 20px; background: var(--white); }
.interact-pairs { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.pair-card { padding: 12px 14px; border-radius: 12px; border: 1.5px solid; }
.pair-card.safe { background: var(--safe-bg); border-color: var(--safe-border); }
.pair-card.warning { background: var(--warn-bg); border-color: var(--warn-border); }
.pair-card.dangerous { background: var(--danger-bg); border-color: var(--danger-border); }
.pair-sev { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
.pair-sev.safe { color: var(--safe); }
.pair-sev.warning { color: var(--warn); }
.pair-sev.dangerous { color: var(--danger); }
.pair-meds { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.pair-desc { font-size: 12.5px; color: var(--text2); line-height: 1.4; }
.advice-box { padding: 12px 16px; border-radius: 12px; background: var(--bg); border: 1.5px solid var(--border); }
.advice-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text3); font-weight: 700; margin-bottom: 5px; }
.advice-text { font-size: 13px; color: var(--text2); line-height: 1.5; }

/* SCAN */
.upload-zone {
  border-radius: var(--radius); overflow: hidden;
  margin-bottom: 16px; box-shadow: var(--shadow);
}
.upload-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.upload-btn-item {
  padding: 28px 16px; text-align: center; cursor: pointer;
  background: var(--white); transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  border: 1.5px solid var(--border);
}
.upload-btn-item:first-child { border-radius: var(--radius) 0 0 var(--radius); border-right: none; }
.upload-btn-item:last-child { border-radius: 0 var(--radius) var(--radius) 0; border-left: 1px solid var(--border); }
.upload-btn-item:hover { background: var(--teal-light); border-color: var(--teal); }
.upload-btn-item:hover + .upload-btn-item { border-left-color: var(--teal); }
.upload-icon { font-size: 32px; }
.upload-text { font-size: 13px; color: var(--text2); font-weight: 600; }
.upload-sub { font-size: 11px; color: var(--text3); }
.scan-img-wrap { margin-bottom: 14px; border-radius: 14px; overflow: hidden; border: 1.5px solid var(--teal-border); box-shadow: var(--shadow); }
.scan-img { width: 100%; max-height: 200px; object-fit: contain; display: block; }
.scan-status { padding: 10px 16px; font-size: 12.5px; display: flex; align-items: center; gap: 8px; background: var(--white); border-top: 1px solid var(--border); }
.scan-status.success { color: var(--teal); }
.scan-status.error { color: var(--danger); }
.scan-results-head { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text3); font-weight: 700; margin-bottom: 10px; }
.scan-cards { display: flex; flex-direction: column; gap: 8px; }
.scan-card {
  padding: 16px 18px; border-radius: var(--radius); background: var(--white);
  border: 1.5px solid var(--border); box-shadow: var(--shadow);
  animation: slideUp 0.3s ease both;
}
.scan-card:nth-child(1){animation-delay:.02s}.scan-card:nth-child(2){animation-delay:.06s}
.scan-card:nth-child(3){animation-delay:.10s}.scan-card:nth-child(4){animation-delay:.14s}
.scan-med-name { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 12px; }
.scan-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.scan-field-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-weight: 700; margin-bottom: 4px; }
.scan-field-value { font-size: 13px; color: var(--text2); }
.scan-when-pill {
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 18px;
  font-size: 12px; font-weight: 500;
  background: var(--teal-light); color: var(--teal); border: 1.5px solid var(--teal-border);
}

/* LOADING / STATES */
.loading { display: flex; flex-direction: column; align-items: center; padding: 52px 0; gap: 14px; }
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2.5px solid var(--border2); border-top-color: var(--teal);
  animation: spin 0.75s linear infinite;
}
.btn-spin {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 13px; color: var(--text3); font-weight: 400; }
.empty-state { text-align: center; padding: 52px 0 30px; }
.empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.4; }
.empty-title { font-size: 15px; font-weight: 600; color: var(--text2); margin-bottom: 6px; }
.empty-sub { font-size: 13px; color: var(--text3); }
.error-box { padding: 14px 18px; border-radius: 12px; background: var(--danger-bg); border: 1.5px solid var(--danger-border); font-size: 13px; color: var(--danger); text-align: center; }

/* FOOTER */
.footer { text-align: center; margin-top: 56px; padding-top: 22px; border-top: 1.5px solid var(--border); }
.footer-name { font-size: 12px; color: var(--text3); margin-bottom: 3px; }
.footer-name strong { color: var(--text2); font-weight: 600; }
.footer-email { font-size: 11px; color: var(--teal); opacity: 0.7; }

/* MOBILE */
@media (max-width: 480px) {
  .app { padding: 28px 14px 70px; }
  .title { font-size: 27px; }
  .logo-ring { width: 52px; height: 52px; }
  .logo-ring img { width: 32px; height: 32px; }
  .info-grid { grid-template-columns: 1fr; }
  .info-full { grid-column: 1; }
  .scan-meta { grid-template-columns: 1fr; }
  .search-btn { padding: 0 13px; font-size: 13px; }
}
`;

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [tab, setTab] = useState<Tab>("search");
  const t = T[lang];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[] | null>(null);
  const [sort, setSort] = useState("low");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [savedMeds, setSavedMeds] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [sugLoading, setSugLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgStatus, setImgStatus] = useState("");
  const [imgStatusType, setImgStatusType] = useState<""|"success"|"error">("");
  const [imgLoading, setImgLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const [checkerInput, setCheckerInput] = useState("");
  const [checkerMeds, setCheckerMeds] = useState<string[]>([]);
  const [interactResult, setInteractResult] = useState<InteractionResult | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState("");

  const [scanImg, setScanImg] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("");
  const [scanStatusType, setScanStatusType] = useState<""|"success"|"error">("");
  const [scanMeds, setScanMeds] = useState<PrescriptionMed[] | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const scanFileRef = useRef<HTMLInputElement>(null);
  const scanGalleryRef = useRef<HTMLInputElement>(null);
  const sugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const h = sessionStorage.getItem("mf_history");
      const s = sessionStorage.getItem("mf_saved");
      if (h) setHistory(JSON.parse(h));
      if (s) setSavedMeds(JSON.parse(s));
    } catch {}
  }, []);

  const addHistory = (q: string) => {
    setHistory(prev => {
      const u = [q, ...prev.filter(x => x !== q)].slice(0, 5);
      try { sessionStorage.setItem("mf_history", JSON.stringify(u)); } catch {}
      return u;
    });
  };

  const toggleSave = (m: Medicine) => {
    setSavedMeds(prev => {
      const exists = prev.find(x => x.name === m.name);
      const u = exists ? prev.filter(x => x.name !== m.name) : [m, ...prev].slice(0, 10);
      try { sessionStorage.setItem("mf_saved", JSON.stringify(u)); } catch {}
      return u;
    });
  };

  const isSaved = (name: string) => savedMeds.some(x => x.name === name);

  const fetchSug = useCallback((q: string) => {
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (q.trim().length < 2) { setSuggestions([]); return; }
    sugTimer.current = setTimeout(async () => {
      setSugLoading(true);
      try {
        const r = await fetch("/api/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
        const d = await r.json();
        setSuggestions(d.suggestions ?? []);
      } catch { setSuggestions([]); }
      finally { setSugLoading(false); }
    }, 380);
  }, []);

  const sortArr = (arr: Medicine[], s: string) =>
    [...arr].sort((a, b) => s === "low" ? a.price - b.price : b.price - a.price);

  const searchMed = async (q?: string) => {
    const qry = (q ?? query).trim();
    if (!qry) return;
    setLoading(true); setError(""); setResults(null); setShowSug(false); setExpanded(null);
    addHistory(qry);
    try {
      const r = await fetch("/api/medicine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: qry, language: lang }) });
      const d = await r.json();
      if (d.error) setError("Something went wrong.");
      else setResults(sortArr(d.results, sort));
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (results?.length) setResults(prev => prev ? sortArr(prev, sort) : prev);
  }, [sort]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".search-wrap")) setShowSug(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = lang === "bn" ? "bn-IN" : "en-IN";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => { const txt = e.results[0][0].transcript; setQuery(txt); searchMed(txt); };
    rec.start();
  };

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      setImgPreview(url); setImgStatus("Identifying…"); setImgStatusType(""); setImgLoading(true);
      try {
        const r = await fetch("/api/identify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: url.split(",")[1], mimeType: file.type, language: lang }) });
        const d = await r.json();
        if (d.medicineName) { setImgStatus(`Identified: ${d.medicineName}`); setImgStatusType("success"); setQuery(d.medicineName); await searchMed(d.medicineName); }
        else { setImgStatus("Couldn't identify. Try a clearer photo."); setImgStatusType("error"); }
      } catch { setImgStatus("Error."); setImgStatusType("error"); }
      finally { setImgLoading(false); }
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  const handleScanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      setScanImg(url); setScanStatus(lang === "bn" ? "পড়া হচ্ছে…" : "Reading prescription…");
      setScanStatusType(""); setScanLoading(true); setScanMeds(null);
      try {
        const r = await fetch("/api/identify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: url.split(",")[1], mimeType: file.type, language: lang, mode: "prescription" }) });
        const d = await r.json();
        if (d.medicines?.length > 0) { setScanMeds(d.medicines); setScanStatus(`${d.medicines.length} ${lang === "bn" ? "টি ওষুধ পাওয়া গেছে" : "medicines found"}`); setScanStatusType("success"); }
        else { setScanStatus(lang === "bn" ? "কোনো ওষুধ পাওয়া যায়নি" : "No medicines found"); setScanStatusType("error"); }
      } catch { setScanStatus("Error."); setScanStatusType("error"); }
      finally { setScanLoading(false); }
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  const checkInteract = async () => {
    if (checkerMeds.length < 2) return;
    setCheckLoading(true); setCheckError(""); setInteractResult(null);
    try {
      const r = await fetch("/api/interact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ medicines: checkerMeds, language: lang }) });
      const d = await r.json();
      if (d.error) setCheckError("Failed to check."); else setInteractResult(d);
    } catch { setCheckError("Network error."); }
    finally { setCheckLoading(false); }
  };

  const shareResult = async (m: Medicine, i: number) => {
    const text = `💊 ${m.name} (${m.salt})\n💰 ₹${m.price} — ${m.type}\n🏭 ${m.manufacturer}\n📋 ${m.uses}\n⏰ ${m.whenToEat}\n\nMediFind`;
    try {
      if (navigator.share) await navigator.share({ title: "MediFind", text });
      else { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 2000); }
    } catch {}
  };

  const cheapest = results?.length ? Math.min(...results.map(r => r.price)) : null;
  const safetyIcon = (s: Safety) => s === "safe" ? "✅" : s === "warning" ? "⚠️" : "🚫";

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="container">

          <div className="header">
            <div className="header-left">
              <div className="logo-ring"><img src="/logo.png" alt="MediFind" /></div>
              <div>
                <h1 className="title">MediFind</h1>
                <p className="subtitle">{t.subtitle}</p>
              </div>
            </div>
            <button className="lang-btn" onClick={() => setLang(l => l === "en" ? "bn" : "en")}>{t.langBtn}</button>
          </div>

          <div className="disclaimer">
            <span>⚠️</span>
            <span className="disclaimer-text">{t.disclaimer}</span>
          </div>

          <div className="tabs">
            {(["search","checker","scan"] as Tab[]).map(tb => (
              <button key={tb} className={`tab-btn${tab === tb ? " active" : ""}`} onClick={() => setTab(tb)}>
                <span className="tab-icon">{tb === "search" ? "🔍" : tb === "checker" ? "💊" : "📋"}</span>
                {tb === "search" ? t.tabSearch : tb === "checker" ? t.tabChecker : t.tabScan}
              </button>
            ))}
          </div>

          {/* ══ SEARCH ══ */}
          {tab === "search" && (
            <>
              <div className="search-wrap" ref={searchWrapRef}>
                <div className="search-row">
                  <div className="input-shell">
                    <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input type="text" value={query} placeholder={t.searchPlaceholder} className="search-input"
                      disabled={loading || imgLoading} autoComplete="off" autoCorrect="off" spellCheck={false}
                      onChange={e => { const v = e.target.value; setQuery(v); if (!v) { setResults(null); setError(""); setSuggestions([]); } else { fetchSug(v); setShowSug(true); } }}
                      onFocus={() => { if (suggestions.length > 0) setShowSug(true); }}
                      onKeyDown={e => { if (e.key === "Enter") searchMed(); if (e.key === "Escape") setShowSug(false); }}
                    />
                    <button className={`voice-btn${listening ? " listening" : ""}`} onClick={handleVoice}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    </button>
                  </div>
                  <button className="icon-btn" onClick={() => fileRef.current?.click()} disabled={loading || imgLoading}>
                    {imgLoading ? <span className="btn-spin" style={{ borderTopColor: "#0d9488", borderColor: "#e2ddd6" }} /> : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImgChange} />
                  <button className="search-btn" onClick={() => searchMed()} disabled={loading || !query.trim() || imgLoading}>
                    {loading ? <><span className="btn-spin" />{t.searching}</> : t.searchBtn}
                  </button>
                </div>
                {showSug && (sugLoading || suggestions.length > 0) && (
                  <div className="suggestions">
                    {sugLoading && !suggestions.length && <div className="sug-item">…</div>}
                    {suggestions.map((s, i) => (
                      <div key={i} className="sug-item" onMouseDown={() => { setQuery(s); setShowSug(false); searchMed(s); }}>
                        <span className="sug-dot" />{s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {imgPreview && (
                <div className="img-wrap">
                  <img src={imgPreview} className="img-prev" alt="" />
                  <button className="img-remove" onClick={() => { setImgPreview(null); setImgStatus(""); }}>✕</button>
                  {imgStatus && <div className={`img-status ${imgStatusType}`}>{imgStatusType === "success" ? "✓" : imgStatusType === "error" ? "✗" : "⟳"} {imgStatus}</div>}
                </div>
              )}

              {history.length > 0 && !loading && (
                <div className="history-row">
                  <span className="hist-label">{t.history}</span>
                  {history.map((h, i) => <button key={i} className="hist-chip" onClick={() => { setQuery(h); searchMed(h); }}>{h}</button>)}
                </div>
              )}

              {savedMeds.length > 0 && !loading && results === null && (
                <div className="saved-section">
                  <div className="saved-header">{t.saved}</div>
                  <div className="saved-cards">
                    {savedMeds.slice(0, 3).map((m, i) => (
                      <div key={i} className="saved-card" onClick={() => { setQuery(m.name); searchMed(m.name); }}>
                        <div><div className="saved-name">{m.name}</div><div className="saved-meta">{m.salt} · ₹{m.price}</div></div>
                        <button className="unsave-btn" onClick={e => { e.stopPropagation(); toggleSave(m); }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="controls-row">
                <span className="ctrl-label">{t.sortBy}</span>
                <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="low">{t.sortLow}</option>
                  <option value="high">{t.sortHigh}</option>
                </select>
              </div>
              <div className="divider" />

              {!loading && results === null && !error && (
                <div className="empty-state"><div className="empty-icon">💊</div><p className="empty-title">{t.initialTitle}</p><p className="empty-sub">{t.initialSub}</p></div>
              )}
              {loading && <div className="loading"><div className="spinner" /><p className="loading-text">{t.findingPrices}</p></div>}
              {error && <div className="error-box">⚠️ {error}</div>}
              {!loading && results !== null && results.length === 0 && !error && (
                <div className="empty-state"><div className="empty-icon">🔍</div><p className="empty-title">{t.noResults}</p><p className="empty-sub">{t.noResultsSub}</p></div>
              )}

              {!loading && results !== null && results.length > 0 && (
                <>
                  <div className="results-meta">
                    <span className="res-count">{results.length} {results.length === 1 ? t.result : t.results}</span>
                    <span className="ai-badge">{t.aiPowered}</span>
                  </div>
                  <div className="cards">
                    {results.map((m, i) => (
                      <div key={i} className={`card${m.price === cheapest ? " cheapest" : ""}`}>
                        <div className="card-top" onClick={() => setExpanded(expanded === i ? null : i)}>
                          <div className="card-left">
                            <div className="card-name">{m.name}</div>
                            <div className="card-salt">{m.salt}</div>
                            <div className="card-mfr">{m.manufacturer}</div>
                          </div>
                          <div className="card-right">
                            <div className="price">₹{m.price}</div>
                            {m.price === cheapest ? <span className="badge">{t.bestPrice}</span> : <div className="type-tag">{m.type}</div>}
                            <div className={`expand-arr${expanded === i ? " open" : ""}`}>▼</div>
                          </div>
                        </div>
                        {expanded === i && (
                          <>
                            <div className="card-expanded">
                              <div className="info-grid">
                                {m.uses && <div className="info-block info-full"><div className="info-label">{t.uses}</div><div className="info-value">{m.uses}</div></div>}
                                {m.dosage && <div className="info-block info-full"><div className="info-label">{t.dosage}</div><div className="info-value">{m.dosage}</div></div>}
                                {m.whenToEat && <div className="info-block info-full"><div className="info-label">{t.whenToEat}</div><div className="info-value"><span className="when-pill">🍽 {m.whenToEat}</span></div></div>}
                                {m.sideEffects?.length > 0 && <div className="info-block info-full"><div className="info-label">{t.sideEffects}</div><div className="tags">{m.sideEffects.map((s, j) => <span key={j} className="tag warn">{s}</span>)}</div></div>}
                                {m.interactions?.length > 0 && <div className="info-block info-full"><div className="info-label">{t.interactions}</div><div className="tags">{m.interactions.map((s, j) => <span key={j} className="tag danger">{s}</span>)}</div></div>}
                                {m.warnings && (
                                  <div className="info-block info-full">
                                    <div className="info-label">{t.warnings}</div>
                                    <div className="warn-grid">
                                      {m.warnings.pregnancy && <div className="warn-row"><span className="warn-key">{t.pregnancy}</span><span className="warn-val">{m.warnings.pregnancy}</span></div>}
                                      {m.warnings.children && <div className="warn-row"><span className="warn-key">{t.children}</span><span className="warn-val">{m.warnings.children}</span></div>}
                                      {m.warnings.elderly && <div className="warn-row"><span className="warn-key">{t.elderly}</span><span className="warn-val">{m.warnings.elderly}</span></div>}
                                    </div>
                                  </div>
                                )}
                                <div className="info-block"><div className="info-label">{t.form}</div><div className="info-value">{m.type}</div></div>
                                <div className="info-block"><div className="info-label">{t.manufacturer}</div><div className="info-value">{m.manufacturer}</div></div>
                              </div>
                            </div>
                            <div className="card-actions">
                              <button className={`action-btn${isSaved(m.name) ? " saved" : ""}`} onClick={() => toggleSave(m)}>🔖 {isSaved(m.name) ? t.saved2 : t.save}</button>
                              <button className="action-btn" onClick={() => shareResult(m, i)}>⤴ {copied === i ? t.copied : t.share}</button>
                              <button className="action-btn" onClick={() => { setCheckerMeds(p => p.includes(m.name) ? p : [...p, m.name]); setTab("checker"); }}>💊 {lang === "bn" ? "চেক করুন" : "Check"}</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ CHECKER ══ */}
          {tab === "checker" && (
            <div className="checker-wrap">
              <div className="section-title">{t.checkerTitle}</div>
              <div className="section-sub">{t.checkerSub}</div>
              <div className="add-row">
                <input className="add-input" placeholder={t.addMedicine} value={checkerInput}
                  onChange={e => setCheckerInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && checkerInput.trim()) { setCheckerMeds(p => p.includes(checkerInput.trim()) ? p : [...p, checkerInput.trim()]); setCheckerInput(""); } }}
                />
                <button className="add-btn" onClick={() => { if (checkerInput.trim()) { setCheckerMeds(p => p.includes(checkerInput.trim()) ? p : [...p, checkerInput.trim()]); setCheckerInput(""); } }}>{t.addBtn}</button>
              </div>
              {checkerMeds.length > 0 && (
                <div className="med-tags">
                  {checkerMeds.map((m, i) => (
                    <div key={i} className="med-tag">{m}<span className="med-tag-x" onClick={() => setCheckerMeds(p => p.filter((_,j) => j !== i))}>✕</span></div>
                  ))}
                </div>
              )}
              <button className="check-btn" onClick={checkInteract} disabled={checkerMeds.length < 2 || checkLoading}>
                {checkLoading ? <><span className="btn-spin" />{t.checking}</> : t.checkBtn}
              </button>
              {checkerMeds.length < 2 && <div className="checker-min">{t.checkerMin}</div>}
              {checkError && <div className="error-box" style={{ marginBottom: 16 }}>⚠️ {checkError}</div>}
              {checkLoading && <div className="loading"><div className="spinner" /><p className="loading-text">{t.checking}</p></div>}
              {interactResult && !checkLoading && (
                <div className="interact-result">
                  <div className={`interact-header ${interactResult.overall}`}>
                    <span className="safety-icon">{safetyIcon(interactResult.overall)}</span>
                    <div>
                      <div className={`safety-label ${interactResult.overall}`}>{interactResult.overall === "safe" ? t.safe : interactResult.overall === "warning" ? t.warning : t.dangerous}</div>
                      <div className="safety-summary">{interactResult.summary}</div>
                    </div>
                  </div>
                  <div className="interact-body">
                    {interactResult.pairs?.length > 0 && (
                      <div className="interact-pairs">
                        {interactResult.pairs.map((p, i) => (
                          <div key={i} className={`pair-card ${p.severity}`}>
                            <div className={`pair-sev ${p.severity}`}>{p.severity.toUpperCase()}</div>
                            <div className="pair-meds">{p.medicines.join(" + ")}</div>
                            <div className="pair-desc">{p.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {interactResult.advice && <div className="advice-box"><div className="advice-label">{t.advice}</div><div className="advice-text">{interactResult.advice}</div></div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SCAN ══ */}
          {tab === "scan" && (
            <div className="scan-wrap">
              <div className="section-title">{t.scanTitle}</div>
              <div className="section-sub">{t.scanSub}</div>
              {!scanImg && (
                <div className="upload-zone">
                  <div className="upload-btns">
                    <div className="upload-btn-item" onClick={() => scanFileRef.current?.click()}>
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">{lang === "bn" ? "ক্যামেরা" : "Camera"}</div>
                      <div className="upload-sub">{lang === "bn" ? "ছবি তুলুন" : "Take a photo"}</div>
                    </div>
                    <div className="upload-btn-item" onClick={() => scanGalleryRef.current?.click()}>
                      <div className="upload-icon">🖼️</div>
                      <div className="upload-text">{lang === "bn" ? "গ্যালারি" : "Gallery"}</div>
                      <div className="upload-sub">{lang === "bn" ? "ফোন থেকে বেছে নিন" : "Choose from phone"}</div>
                    </div>
                  </div>
                </div>
              )}
              {scanImg && (
                <div className="scan-img-wrap" style={{ position: "relative" }}>
                  <img src={scanImg} className="scan-img" alt="" />
                  <button className="img-remove" style={{ top: 8, right: 8 }} onClick={() => { setScanImg(null); setScanMeds(null); setScanStatus(""); }}>✕</button>
                  <div className={`scan-status ${scanStatusType}`}>{scanStatusType === "success" ? "✓" : scanStatusType === "error" ? "✗" : "⟳"} {scanStatus}</div>
                </div>
              )}
              <input ref={scanFileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleScanChange} />
              <input ref={scanGalleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleScanChange} />
              {scanLoading && <div className="loading"><div className="spinner" /><p className="loading-text">{t.scanning}</p></div>}
              {scanMeds && !scanLoading && scanMeds.length === 0 && <div className="empty-state"><div className="empty-icon">📋</div><p className="empty-title">{t.noMeds}</p><p className="empty-sub">{t.noMedsSub}</p></div>}
              {scanMeds && !scanLoading && scanMeds.length > 0 && (
                <>
                  <div className="scan-results-head">{t.scanResults} ({scanMeds.length})</div>
                  <div className="scan-cards">
                    {scanMeds.map((m, i) => (
                      <div key={i} className="scan-card">
                        {/* Medicine name + dosage */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                          <div className="scan-med-name">💊 {m.name}</div>
                          {m.dosage && <span style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)", background: "var(--teal-light)", border: "1.5px solid var(--teal-border)", borderRadius: 8, padding: "3px 10px" }}>{m.dosage}</span>}
                        </div>

                        {/* Key info pills row */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                          {m.whenToEat && m.whenToEat !== "Not specified" && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, background: "var(--teal-light)", color: "var(--teal)", border: "1.5px solid var(--teal-border)" }}>
                              🍽 {m.whenToEat}
                            </span>
                          )}
                          {m.frequency && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, background: "#f0f4ff", color: "#3730a3", border: "1.5px solid #c7d2fe" }}>
                              🕐 {m.frequency}
                            </span>
                          )}
                          {m.duration && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, background: "#fff7ed", color: "#9a3412", border: "1.5px solid #fed7aa" }}>
                              📅 {m.duration}
                            </span>
                          )}
                        </div>

                        {/* Instructions if any */}
                        {m.instructions && (
                          <div style={{ padding: "9px 12px", borderRadius: 10, background: "var(--bg2)", border: "1px solid var(--border)", fontSize: 12.5, color: "var(--text2)", marginBottom: 12 }}>
                            📌 {m.instructions}
                          </div>
                        )}

                        {/* Search for price link */}
                        <button className="action-btn" style={{ fontSize: 12 }} onClick={() => { setQuery(m.name); setTab("search"); searchMed(m.name); }}>
                          🔍 {lang === "bn" ? "দাম ও বিকল্প দেখুন" : "Find price & alternatives"}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="footer">
            <p className="footer-name">Built by <strong>Sayan</strong></p>
            <p className="footer-email">sayansardar6677@gmail.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
