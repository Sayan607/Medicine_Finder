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
  safetyScore?: number;
  safetyVerdict?: string;
  interactionReason?: string;
  keyPoints?: string[];
};

type InteractionResult = {
  overall: Safety; summary: string; safeToTake: boolean; advice: string;
  safetyScore?: number; safetyVerdict?: string;
  interactionReason?: string; keyPoints?: string[];
  pairs: Array<{ medicines: string[]; severity: Safety; description: string; why: string; whatToDo: string }>;
};

type PrescriptionMed = {
  name: string; dosage: string; frequency: string;
  whenToEat: string; duration: string; instructions: string;
};

const T = {
  en: {
    appName: "MedMind", subtitle: "India's smartest medicine companion",
    tabSearch: "Search", tabChecker: "Interactions", tabScan: "Scan Rx",
    searchPlaceholder: "Medicine, symptom or disease…",
    searchBtn: "Search", searching: "Searching…",
    sortLow: "Price: Low → High", sortHigh: "Price: High → Low", sortBy: "Sort",
    noResults: "No results found", noResultsSub: "Try a different name or symptom",
    initialTitle: "Search any medicine", initialSub: "Type a name, symptom or disease",
    uses: "Uses", dosage: "Dosage", whenToEat: "When to take",
    sideEffects: "Side effects", warnings: "Warnings",
    interactions: "Avoid with", form: "Form", manufacturer: "Manufacturer",
    pregnancy: "Pregnancy", children: "Children", elderly: "Elderly",
    bestPrice: "Best Price", aiPowered: "AI-powered",
    checkerTitle: "Interaction Checker",
    checkerSub: "Check if your medicines are safe to take together",
    addMedicine: "Type a medicine name…", addBtn: "Add",
    checkBtn: "Check Interactions", checking: "Checking…",
    checkerMin: "Add at least 2 medicines to check",
    safe: "Safe to take together", warning: "Take with caution", dangerous: "Do not take together",
    advice: "What to do",
    scanTitle: "Scan Prescription",
    scanSub: "Upload your prescription — MedMind reads it for you",
    scanning: "Reading your prescription…",
    scanResults: "Medicines in your prescription",
    noMeds: "No medicines detected", noMedsSub: "Try a clearer, well-lit photo",
    frequency: "How often", duration: "For how long", instructions: "Special instructions",
    whenToEat2: "When to take",
    history: "Recent searches", saved: "Saved medicines",
    save: "Save", saved2: "Saved", share: "Share", copied: "Copied!",
    disclaimer: "Prices are approximate. Always consult a licensed pharmacist or doctor before purchasing or changing any medication.",
    findingPrices: "Finding best prices…", langBtn: "বাংলা",
    checkAll: "Check interactions between all medicines",
    symptomTip: "Try searching a symptom:",
    footerTagline: "India's smartest medicine companion",
    footerDesc: "MedMind helps you understand your medicines, compare prices, scan prescriptions, and check drug interactions — all for free.",
    contactTitle: "Questions or suggestions?",
    contactDesc: "We'd love to hear from you. Reach out at:",
    feedbackTitle: "Have feedback?",
    feedbackDesc: "Help us improve MedMind for everyone in India.",
    rightsReserved: "All rights reserved.",
    madeWith: "Made with",
    forIndia: "for India",
    privacyNote: "MedMind does not store your searches or prescription photos.",
  },
  bn: {
    appName: "MedMind", subtitle: "ভারতের সবচেয়ে স্মার্ট ওষুধ সহায়ক",
    tabSearch: "খোঁজ", tabChecker: "মিশ্রণ পরীক্ষা", tabScan: "প্রেসক্রিপশন",
    searchPlaceholder: "ওষুধ, উপসর্গ বা রোগ লিখুন…",
    searchBtn: "খুঁজুন", searching: "খোঁজা হচ্ছে…",
    sortLow: "দাম: কম → বেশি", sortHigh: "দাম: বেশি → কম", sortBy: "সাজান",
    noResults: "কোনো ফলাফল নেই", noResultsSub: "অন্য নাম বা উপসর্গ দিয়ে চেষ্টা করুন",
    initialTitle: "যেকোনো ওষুধ খুঁজুন", initialSub: "নাম, উপসর্গ বা রোগ লিখুন",
    uses: "ব্যবহার", dosage: "ডোজ", whenToEat: "কখন খাবেন",
    sideEffects: "পার্শ্বপ্রতিক্রিয়া", warnings: "সতর্কতা",
    interactions: "এড়িয়ে চলুন", form: "ধরন", manufacturer: "প্রস্তুতকারক",
    pregnancy: "গর্ভাবস্থা", children: "শিশু", elderly: "বয়স্ক",
    bestPrice: "সেরা দাম", aiPowered: "AI-চালিত",
    checkerTitle: "ওষুধ মিশ্রণ পরীক্ষক",
    checkerSub: "আপনার ওষুধগুলো একসাথে নিরাপদ কিনা দেখুন",
    addMedicine: "ওষুধের নাম লিখুন…", addBtn: "যোগ",
    checkBtn: "পরীক্ষা করুন", checking: "পরীক্ষা হচ্ছে…",
    checkerMin: "কমপক্ষে ২টি ওষুধ যোগ করুন",
    safe: "একসাথে নিরাপদ", warning: "সতর্কতার সাথে নিন", dangerous: "একসাথে নেবেন না",
    advice: "কী করবেন",
    scanTitle: "প্রেসক্রিপশন স্ক্যান",
    scanSub: "প্রেসক্রিপশনের ছবি দিন — MedMind পড়ে দেবে",
    scanning: "প্রেসক্রিপশন পড়া হচ্ছে…",
    scanResults: "আপনার প্রেসক্রিপশনের ওষুধ",
    noMeds: "কোনো ওষুধ পাওয়া যায়নি", noMedsSub: "স্পষ্ট আলোতে ছবি তুলুন",
    frequency: "কতবার", duration: "কতদিন", instructions: "বিশেষ নির্দেশনা",
    whenToEat2: "কখন খাবেন",
    history: "সাম্প্রতিক খোঁজ", saved: "সংরক্ষিত ওষুধ",
    save: "সংরক্ষণ", saved2: "সংরক্ষিত", share: "শেয়ার", copied: "কপি হয়েছে!",
    disclaimer: "দাম আনুমানিক। ওষুধ কেনা বা পরিবর্তনের আগে ফার্মাসিস্ট বা ডাক্তারের সাথে পরামর্শ করুন।",
    findingPrices: "সেরা দাম খোঁজা হচ্ছে…", langBtn: "English",
    checkAll: "সব ওষুধের মিশ্রণ পরীক্ষা করুন",
    symptomTip: "উপসর্গ দিয়ে খুঁজুন:",
    footerTagline: "ভারতের সবচেয়ে স্মার্ট ওষুধ সহায়ক",
    footerDesc: "MedMind আপনাকে ওষুধ বুঝতে, দাম তুলনা করতে, প্রেসক্রিপশন পড়তে এবং ওষুধ মিশ্রণ পরীক্ষা করতে সাহায্য করে — বিনামূল্যে।",
    contactTitle: "প্রশ্ন বা পরামর্শ?",
    contactDesc: "আমাদের সাথে যোগাযোগ করুন:",
    feedbackTitle: "মতামত দিন",
    feedbackDesc: "MedMind-কে আরও ভালো করতে সাহায্য করুন।",
    rightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
    madeWith: "তৈরি হয়েছে",
    forIndia: "ভারতের জন্য",
    privacyNote: "MedMind আপনার খোঁজ বা প্রেসক্রিপশনের ছবি সংরক্ষণ করে না।",
  }
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap');

:root {
  --bg: #f5f3ef;
  --bg2: #ede9e2;
  --white: #ffffff;
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
  --safe: #065f46; --safe-bg: #ecfdf5; --safe-border: #6ee7b7;
  --warn: #92400e; --warn-bg: #fffbeb; --warn-border: #fcd34d;
  --danger: #991b1b; --danger-bg: #fef2f2; --danger-border: #fca5a5;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.05), 0 24px 48px rgba(0,0,0,0.1);
  --radius: 18px; --radius-sm: 10px;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html { font-size: 16px; }
body { background: var(--bg); font-family: 'Instrument Sans', sans-serif; color: var(--text); overflow-x: hidden; }

.app {
  min-height: 100vh; min-height: 100dvh;
  background: var(--bg);
  background-image:
    radial-gradient(ellipse 60% 40% at 10% 0%, rgba(13,148,136,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 35% at 90% 100%, rgba(180,83,9,0.05) 0%, transparent 50%);
  display: flex; flex-direction: column; align-items: center;
}

.main-content {
  width: 100%; max-width: 640px;
  padding: 44px 16px 0;
  flex: 1;
}

/* ── HEADER ── */
.header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px; gap: 12px;
}
.header-left { display: flex; align-items: center; gap: 6px; }
.logo-ring {
  width: 72px; height: 72px; flex-shrink: 0;
  background: none; border: none; box-shadow: none;
  display: flex; align-items: center; justify-content: center;
  overflow: visible;
}
.logo-ring img {
  width: 100%; height: 100%; object-fit: contain; display: block;
  transform: scale(2.2); transform-origin: center center;
}
.app-name {
  font-family: 'Instrument Sans', sans-serif;
  font-size: 34px; font-weight: 700; line-height: 1;
  letter-spacing: -0.5px;
}
.app-name-med { color: #38bdf8; }
.app-name-mind { color: #0d9488; }
.app-sub { font-size: 11.5px; color: var(--text3); margin-top: 4px; font-weight: 400; letter-spacing: 0.1px; }
.lang-btn {
  padding: 8px 16px; border-radius: 22px; font-size: 12px; font-weight: 600;
  background: var(--white); border: 1.5px solid var(--border2); color: var(--teal);
  cursor: pointer; white-space: nowrap; box-shadow: var(--shadow-sm);
  transition: all 0.2s; font-family: 'Instrument Sans', sans-serif; letter-spacing: 0.2px;
}
.lang-btn:hover { background: var(--teal-light); border-color: var(--teal); }

/* ── DISCLAIMER ── */
.disclaimer {
  display: flex; gap: 10px; padding: 12px 16px; border-radius: 12px;
  background: var(--gold-light); border: 1px solid var(--gold-border); margin-bottom: 22px;
}
.disclaimer-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
.disclaimer-text { font-size: 11.5px; color: var(--gold); line-height: 1.55; }

/* ── TABS ── */
.tabs {
  display: flex; gap: 4px; margin-bottom: 24px;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 16px; padding: 5px; box-shadow: var(--shadow-sm);
}
.tab-btn {
  flex: 1; padding: 10px 6px; border-radius: 12px; border: none;
  font-family: 'Instrument Sans', sans-serif; font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; color: var(--text2);
  background: transparent; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.tab-btn.active { background: var(--teal); color: #fff; box-shadow: 0 2px 10px rgba(13,148,136,0.28); }
.tab-icon { font-size: 14px; line-height: 1; }

/* ── SEARCH ── */
.search-wrap { position: relative; margin-bottom: 12px; }
.search-row { display: flex; gap: 8px; }
.input-shell { flex: 1; position: relative; min-width: 0; }
.search-icon-wrap { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; display: flex; align-items: center; }
.search-input {
  width: 100%; height: 52px; padding: 0 48px 0 42px; border-radius: 14px;
  background: var(--white); border: 1.5px solid var(--border);
  color: var(--text); font-family: 'Instrument Sans', sans-serif; font-size: 14px; outline: none;
  box-shadow: var(--shadow); transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none;
}
.search-input::placeholder { color: var(--text3); }
.search-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(13,148,136,0.1), var(--shadow); }
.search-input:disabled { opacity: 0.6; background: var(--bg2); }

.voice-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; padding: 5px;
  color: var(--text3); transition: color 0.2s; display: flex; align-items: center;
  border-radius: 8px;
}
.voice-btn:hover { color: var(--teal); background: var(--teal-light); }
.voice-btn.listening { color: var(--teal); animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

.icon-btn {
  height: 52px; width: 52px; border-radius: 14px; flex-shrink: 0;
  background: var(--white); border: 1.5px solid var(--border); color: var(--text2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow); transition: all 0.2s;
}
.icon-btn:hover { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }

.search-btn {
  height: 52px; padding: 0 20px; border-radius: 14px;
  background: var(--teal); border: none; color: #fff;
  font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 600;
  cursor: pointer; box-shadow: 0 4px 14px rgba(13,148,136,0.3);
  transition: all 0.2s; white-space: nowrap;
  display: flex; align-items: center; gap: 7px; flex-shrink: 0;
}
.search-btn:hover:not(:disabled) { background: var(--teal2); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,148,136,0.35); }
.search-btn:active { transform: scale(0.97); }
.search-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

/* ── SUGGESTIONS ── */
.suggestions {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 50;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-lg);
}
.sug-item {
  padding: 12px 16px; font-size: 13.5px; cursor: pointer;
  display: flex; align-items: center; gap: 10px; color: var(--text2);
  border-bottom: 1px solid var(--border); transition: background 0.15s;
}
.sug-item:last-child { border-bottom: none; }
.sug-item:hover { background: var(--teal-light); color: var(--teal); }
.sug-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); flex-shrink: 0; }

/* ── CONTROLS ── */
.controls-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.ctrl-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.sort-select {
  height: 34px; padding: 0 26px 0 10px; border-radius: 9px;
  background: var(--white); border: 1.5px solid var(--border);
  color: var(--text2); font-family: 'Instrument Sans', sans-serif; font-size: 12.5px;
  outline: none; cursor: pointer; -webkit-appearance: none; appearance: none; box-shadow: var(--shadow-sm);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23a09a92' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center;
}

/* ── TRENDING ── */
.trending-row { display: flex; align-items: flex-start; gap: 12px; }
.trending-label {
  font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px;
  color: var(--text3); font-weight: 700; white-space: nowrap;
  margin-top: 8px; min-width: 62px;
}
.trending-chips { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.trend-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 20px; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; border: 1.5px solid;
  font-family: 'Instrument Sans', sans-serif; white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.trend-chip-icon { display: flex; align-items: center; opacity: 0.7; }
.symptom-chip { background: var(--teal-light); border-color: var(--teal-border); color: var(--teal); }
.symptom-chip:hover { background: var(--teal); color: #fff; border-color: var(--teal); }
.symptom-chip:hover .trend-chip-icon { opacity: 1; }
.med-chip { background: var(--white); border-color: var(--border2); color: var(--text2); }
.med-chip:hover { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }

/* ── HISTORY / CHIPS ── */
.history-section { margin-bottom: 14px; }
.section-label { font-size: 10.5px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; margin-bottom: 8px; }
.chips-row { display: flex; flex-wrap: wrap; gap: 7px; }
.chip {
  padding: 5px 12px; border-radius: 20px; font-size: 12px; color: var(--text2);
  background: var(--white); border: 1.5px solid var(--border); cursor: pointer;
  box-shadow: var(--shadow-sm); transition: all 0.15s; white-space: nowrap;
  font-family: 'Instrument Sans', sans-serif; font-weight: 500;
}
.chip:hover { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }
.chip.symptom { background: var(--teal-light); border-color: var(--teal-border); color: var(--teal); }

/* ── IMAGE PREVIEW ── */
.img-wrap {
  margin-bottom: 12px; border-radius: 14px; overflow: hidden;
  border: 1.5px solid var(--teal-border); position: relative;
  background: var(--teal-light); box-shadow: var(--shadow);
}
.img-prev { width: 100%; max-height: 160px; object-fit: contain; display: block; }
.img-remove {
  position: absolute; top: 8px; right: 8px; width: 28px; height: 28px;
  border-radius: 50%; background: var(--white); border: 1.5px solid var(--border);
  color: var(--text2); cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);
}
.img-status { padding: 9px 14px; font-size: 12px; display: flex; align-items: center; gap: 7px; background: var(--white); border-top: 1px solid var(--border); }
.img-status.success { color: var(--teal); }
.img-status.error { color: var(--danger); }

/* ── DIVIDER ── */
.divider { height: 1.5px; background: var(--border); margin-bottom: 18px; border-radius: 1px; }

/* ── RESULTS META ── */
.results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.res-count { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; font-weight: 600; }
.ai-badge {
  font-size: 10.5px; color: var(--teal); background: var(--teal-light);
  border: 1.5px solid var(--teal-border); border-radius: 20px; padding: 3px 10px; font-weight: 600;
  display: flex; align-items: center; gap: 4px;
}

/* ── SAVED SECTION ── */
.saved-section { margin-bottom: 18px; }
.saved-cards { display: flex; flex-direction: column; gap: 7px; }
.saved-card {
  padding: 12px 16px; border-radius: 12px; background: var(--white);
  border: 1.5px solid var(--border); display: flex; align-items: center;
  justify-content: space-between; cursor: pointer; box-shadow: var(--shadow-sm);
  transition: all 0.15s;
}
.saved-card:hover { border-color: var(--teal); box-shadow: var(--shadow); }
.saved-name { font-size: 14px; font-weight: 600; color: var(--text); }
.saved-meta { font-size: 11.5px; color: var(--text3); margin-top: 2px; }
.unsave-btn { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 11px; padding: 4px; border-radius: 4px; }

/* ── MEDICINE CARDS ── */
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
.card:nth-child(1){animation-delay:.02s} .card:nth-child(2){animation-delay:.05s}
.card:nth-child(3){animation-delay:.08s} .card:nth-child(4){animation-delay:.11s}
.card:nth-child(5){animation-delay:.14s} .card:nth-child(6){animation-delay:.17s}

.card-top {
  padding: 16px 18px; display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; gap: 12px; -webkit-user-select: none; user-select: none;
}
.card-top:active { background: var(--bg); }
.card-left { min-width: 0; flex: 1; }
.card-name { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-salt { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-mfr { font-size: 11px; color: var(--text3); margin-top: 2px; }
.card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.price { font-size: 20px; font-weight: 700; color: var(--teal); font-family: 'Cormorant Garamond', serif; }
.price-save { font-size: 10px; color: #16a34a; font-weight: 700; background: #dcfce7; border-radius: 5px; padding: 1px 6px; }
.badge { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; background: var(--teal); color: #fff; border-radius: 5px; padding: 2px 8px; }
.type-tag { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; font-weight: 500; }
.expand-arr { font-size: 9px; color: var(--text3); transition: transform 0.25s; margin-top: 2px; }
.expand-arr.open { transform: rotate(180deg); }

/* ── EXPANDED CARD ── */
.card-expanded { border-top: 1.5px solid var(--border); padding: 16px 18px; background: #fdfcfb; display: flex; flex-direction: column; gap: 14px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-full { grid-column: 1 / -1; }
.info-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text3); font-weight: 700; margin-bottom: 5px; }
.info-value { font-size: 13px; color: var(--text2); line-height: 1.55; }
.when-pill {
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px;
  font-size: 12.5px; font-weight: 600; background: var(--teal-light); color: var(--teal); border: 1.5px solid var(--teal-border);
}
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.tag { padding: 3px 10px; border-radius: 18px; font-size: 11.5px; background: var(--bg2); border: 1px solid var(--border); color: var(--text2); }
.tag.danger { background: var(--danger-bg); border-color: var(--danger-border); color: var(--danger); }
.tag.warn { background: var(--warn-bg); border-color: var(--warn-border); color: var(--warn); }
.warn-grid { display: flex; flex-direction: column; gap: 7px; }
.warn-row { display: flex; gap: 10px; align-items: flex-start; }
.warn-key { font-size: 10.5px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; min-width: 72px; margin-top: 2px; }
.warn-val { font-size: 12.5px; color: var(--text2); line-height: 1.4; }

.card-actions { display: flex; gap: 7px; padding: 0 18px 14px; flex-wrap: wrap; }
.action-btn {
  padding: 7px 14px; border-radius: 9px; font-size: 12px; font-weight: 600;
  background: var(--bg); border: 1.5px solid var(--border); color: var(--text2);
  cursor: pointer; transition: all 0.15s; font-family: 'Instrument Sans', sans-serif;
  display: flex; align-items: center; gap: 5px;
}
.action-btn:hover { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }
.action-btn.saved-active { background: var(--teal-light); color: var(--teal); border-color: var(--teal); }

/* ── CHECKER ── */
.section-head { margin-bottom: 20px; }
.section-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: var(--text); margin-bottom: 4px; }
.section-sub { font-size: 13px; color: var(--text2); line-height: 1.5; }
.add-row { display: flex; gap: 8px; margin-bottom: 12px; }
.add-input {
  flex: 1; height: 48px; padding: 0 14px; border-radius: 12px;
  background: var(--white); border: 1.5px solid var(--border);
  color: var(--text); font-family: 'Instrument Sans', sans-serif; font-size: 14px; outline: none; box-shadow: var(--shadow-sm);
}
.add-input::placeholder { color: var(--text3); }
.add-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
.add-btn {
  height: 48px; padding: 0 18px; border-radius: 12px; font-size: 13px; font-weight: 700;
  background: var(--white); border: 1.5px solid var(--teal); color: var(--teal);
  cursor: pointer; font-family: 'Instrument Sans', sans-serif; white-space: nowrap;
  box-shadow: var(--shadow-sm); transition: all 0.15s;
}
.add-btn:hover { background: var(--teal); color: #fff; }
.med-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.med-tag {
  padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;
  background: var(--teal-light); border: 1.5px solid var(--teal-border); color: var(--teal);
  display: flex; align-items: center; gap: 7px;
}
.med-tag-x { cursor: pointer; opacity: 0.5; font-size: 12px; line-height: 1; }
.med-tag-x:hover { opacity: 1; }
.check-btn {
  width: 100%; height: 52px; border-radius: 14px; font-size: 14px; font-weight: 700;
  background: var(--teal); border: none; color: #fff; cursor: pointer;
  font-family: 'Instrument Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(13,148,136,0.3); transition: all 0.2s; margin-bottom: 18px;
}
.check-btn:hover:not(:disabled) { background: var(--teal2); transform: translateY(-1px); }
.check-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.checker-min { text-align: center; font-size: 12.5px; color: var(--text3); margin-top: -10px; margin-bottom: 16px; }

/* ── INTERACTION RESULT ── */
.interact-result { border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-md); animation: slideUp 0.3s ease; }
.interact-header { padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
.interact-header.safe { background: var(--safe-bg); border-bottom: 1.5px solid var(--safe-border); }
.interact-header.warning { background: var(--warn-bg); border-bottom: 1.5px solid var(--warn-border); }
.interact-header.dangerous { background: var(--danger-bg); border-bottom: 1.5px solid var(--danger-border); }
.safety-icon { font-size: 26px; flex-shrink: 0; }
.safety-label { font-size: 16px; font-weight: 700; }
.safety-label.safe { color: var(--safe); }
.safety-label.warning { color: var(--warn); }
.safety-label.dangerous { color: var(--danger); }
.safety-summary { font-size: 13px; color: var(--text2); margin-top: 3px; }
.interact-body { padding: 16px 20px; background: var(--white); border: 1.5px solid var(--border); border-top: none; border-radius: 0 0 var(--radius) var(--radius); }
.interact-pairs { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.pair-card { padding: 14px 16px; border-radius: 12px; border: 1.5px solid; }
.pair-card.safe { background: var(--safe-bg); border-color: var(--safe-border); }
.pair-card.warning { background: var(--warn-bg); border-color: var(--warn-border); }
.pair-card.dangerous { background: var(--danger-bg); border-color: var(--danger-border); }
.pair-sev { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
.pair-sev.safe { color: var(--safe); }
.pair-sev.warning { color: var(--warn); }
.pair-sev.dangerous { color: var(--danger); }
.pair-meds { font-size: 13.5px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
.pair-desc { font-size: 12.5px; color: var(--text2); line-height: 1.4; margin-bottom: 8px; }
.pair-info-box { padding: 8px 11px; border-radius: 8px; font-size: 12px; line-height: 1.45; margin-top: 5px; }
.pair-info-box.why { background: rgba(0,0,0,0.04); color: var(--text2); }
.pair-info-box.action { font-weight: 600; }
.pair-info-box.action.safe { background: var(--safe-bg); color: var(--safe); }
.pair-info-box.action.warning { background: var(--warn-bg); color: var(--warn); }
.pair-info-box.action.dangerous { background: var(--danger-bg); color: var(--danger); }
.pair-info-label { font-weight: 800; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; opacity: 0.7; }
.advice-box { padding: 14px 16px; border-radius: 12px; background: var(--bg); border: 1.5px solid var(--border); }
.advice-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text3); font-weight: 700; margin-bottom: 5px; }
.advice-text { font-size: 13px; color: var(--text2); line-height: 1.5; }

/* ── SCAN ── */
.upload-zone { border-radius: var(--radius); overflow: hidden; margin-bottom: 16px; box-shadow: var(--shadow); }
.upload-btns { display: grid; grid-template-columns: 1fr 1fr; }
.upload-btn-item {
  padding: 30px 16px; text-align: center; cursor: pointer;
  background: var(--white); transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  border: 1.5px solid var(--border);
}
.upload-btn-item:first-child { border-right: none; border-radius: var(--radius) 0 0 var(--radius); }
.upload-btn-item:last-child { border-left: 1px solid var(--border); border-radius: 0 var(--radius) var(--radius) 0; }
.upload-btn-item:hover { background: var(--teal-light); border-color: var(--teal); }
.upload-icon-lg { font-size: 30px; line-height: 1; }
.upload-label { font-size: 13.5px; font-weight: 700; color: var(--text); }
.upload-sub-text { font-size: 11px; color: var(--text3); }

.scan-img-wrap { margin-bottom: 14px; border-radius: 14px; overflow: hidden; border: 1.5px solid var(--teal-border); box-shadow: var(--shadow); position: relative; }
.scan-img { width: 100%; max-height: 200px; object-fit: contain; display: block; }
.scan-status { padding: 10px 16px; font-size: 12.5px; display: flex; align-items: center; gap: 8px; background: var(--white); border-top: 1px solid var(--border); }
.scan-status.success { color: var(--teal); font-weight: 600; }
.scan-status.error { color: var(--danger); }

.scan-results-head { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text3); font-weight: 700; margin-bottom: 10px; }
.scan-cards { display: flex; flex-direction: column; gap: 10px; }
.scan-card {
  padding: 16px 18px; border-radius: var(--radius); background: var(--white);
  border: 1.5px solid var(--border); box-shadow: var(--shadow); animation: slideUp 0.3s ease both;
}
.scan-card:nth-child(1){animation-delay:.02s} .scan-card:nth-child(2){animation-delay:.06s}
.scan-card:nth-child(3){animation-delay:.10s} .scan-card:nth-child(4){animation-delay:.14s}
.scan-med-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
.scan-med-name { font-size: 15px; font-weight: 700; color: var(--text); }
.dosage-badge { font-size: 12px; font-weight: 700; color: var(--teal); background: var(--teal-light); border: 1.5px solid var(--teal-border); border-radius: 8px; padding: 3px 10px; white-space: nowrap; }
.scan-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 10px; }
.scan-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.scan-pill.eat { background: var(--teal-light); color: var(--teal); border: 1.5px solid var(--teal-border); }
.scan-pill.freq { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #bfdbfe; }
.scan-pill.dur { background: #fff7ed; color: #c2410c; border: 1.5px solid #fed7aa; }
.scan-instructions { padding: 9px 12px; border-radius: 9px; background: var(--bg2); border: 1px solid var(--border); font-size: 12.5px; color: var(--text2); margin-bottom: 10px; line-height: 1.4; }

/* ── CHECK ALL BTN ── */
.check-all-btn {
  width: 100%; padding: 14px 20px; border-radius: 14px; margin-bottom: 16px;
  background: linear-gradient(135deg, var(--teal), #0891b2); border: none; color: #fff;
  font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(13,148,136,0.3); transition: all 0.2s;
}
.check-all-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(13,148,136,0.35); }

/* ── LOADING / STATES ── */
.loading { display: flex; flex-direction: column; align-items: center; padding: 52px 0; gap: 14px; }
.spinner { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid var(--border2); border-top-color: var(--teal); animation: spin 0.75s linear infinite; }
.btn-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 13px; color: var(--text3); font-weight: 500; }
.empty-state { text-align: center; padding: 52px 0 30px; }
.empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.35; }
.empty-title { font-size: 15px; font-weight: 600; color: var(--text2); margin-bottom: 6px; }
.empty-sub { font-size: 13px; color: var(--text3); }
.error-box { padding: 14px 18px; border-radius: 12px; background: var(--danger-bg); border: 1.5px solid var(--danger-border); font-size: 13px; color: var(--danger); text-align: center; font-weight: 500; }

/* ── FOOTER ── */
.footer {
  width: 100%; background: #1a1714; color: rgba(255,255,255,0.85);
  margin-top: 64px; padding: 48px 20px 32px;
  display: flex; flex-direction: column; align-items: center;
}
.footer-inner { width: 100%; max-width: 640px; }
.footer-top { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 36px; }
.footer-logo-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.footer-logo-img {
  width: 44px; height: 44px; border-radius: 50%;
  overflow: hidden; border: 2px solid rgba(255,255,255,0.15);
  background: #fff; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.footer-logo-img img { width: 90%; height: 90%; object-fit: contain; display: block; }
.footer-app-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #fff; }
.footer-tagline { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 12px; }
.footer-desc { font-size: 12.5px; color: rgba(255,255,255,0.45); line-height: 1.6; max-width: 440px; }

.footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 32px; }
.footer-col-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.7px; color: rgba(255,255,255,0.35); font-weight: 700; margin-bottom: 12px; }
.footer-link { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px; display: flex; align-items: center; gap: 7px; line-height: 1.4; }
.footer-link a { color: rgba(13,148,136,0.9); text-decoration: none; }
.footer-link a:hover { color: #2dd4bf; text-decoration: underline; }
.footer-email-link { color: rgba(13,148,136,0.9); text-decoration: none; font-weight: 600; }
.footer-email-link:hover { color: #2dd4bf; }

.footer-privacy { padding: 16px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: rgba(255,255,255,0.35); text-align: center; line-height: 1.5; margin-bottom: 28px; display: flex; align-items: flex-start; gap: 8px; }
.footer-privacy-icon { flex-shrink: 0; margin-top: 1px; }

.footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.footer-built-by { display: flex; align-items: center; gap: 8px; }
.footer-personal-logo { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; border: 1.5px solid rgba(255,255,255,0.15); }
.footer-personal-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.footer-built-text { font-size: 12.5px; color: rgba(255,255,255,0.45); }
.footer-built-text strong { color: rgba(255,255,255,0.75); font-weight: 600; }
.footer-copy { font-size: 11px; color: rgba(255,255,255,0.25); text-align: center; }
.footer-made-with { font-size: 11.5px; color: rgba(255,255,255,0.35); display: flex; align-items: center; gap: 4px; }

/* ── CAUTION SCALE ── */
.caution-scale { border-radius: 14px; border: 1.5px solid; padding: 14px 16px; margin-top: 14px; }
.caution-scale.green { background: #ecfdf5; border-color: #6ee7b7; }
.caution-scale.yellow { background: #fffbeb; border-color: #fcd34d; }
.caution-scale.red { background: #fef2f2; border-color: #fca5a5; }
.caution-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.caution-verdict { font-size: 14px; font-weight: 700; }
.caution-score { font-size: 20px; font-weight: 800; }
.caution-scale.green .caution-verdict, .caution-scale.green .caution-score { color: #065f46; }
.caution-scale.yellow .caution-verdict, .caution-scale.yellow .caution-score { color: #92400e; }
.caution-scale.red .caution-verdict, .caution-scale.red .caution-score { color: #991b1b; }
.caution-bar-wrap { width: 100%; height: 10px; background: #e5e7eb; border-radius: 99px; margin-bottom: 4px; }
.caution-bar-fill { height: 10px; border-radius: 99px; transition: width 0.4s ease; }
.caution-scale.green .caution-bar-fill { background: #10b981; }
.caution-scale.yellow .caution-bar-fill { background: #f59e0b; }
.caution-scale.red .caution-bar-fill { background: #ef4444; }
.caution-ticks { display: flex; justify-content: space-between; margin-bottom: 8px; }
.caution-tick { font-size: 9px; color: #9ca3af; }
.caution-legend { display: flex; gap: 10px; margin-bottom: 10px; }
.caution-legend span { font-size: 11px; }
.caution-reason { font-size: 12.5px; color: #374151; line-height: 1.5; margin-bottom: 10px; }
.caution-points { display: flex; flex-direction: column; gap: 5px; }
.caution-point { font-size: 12.5px; font-weight: 600; display: flex; gap: 6px; }
.caution-scale.green .caution-point { color: #065f46; }
.caution-scale.yellow .caution-point { color: #92400e; }
.caution-scale.red .caution-point { color: #991b1b; }

/* ── PROMO VIDEO ── */
.promo-video-wrap {
  width: 100%; margin-bottom: 20px; border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1); background: #000;
  border: 1.5px solid var(--border);
}
.promo-video-wrap video {
  width: 100%; display: block; max-height: 260px; object-fit: cover;
}

/* ── PROMO SECTION ── */
.promo-section {
  width: 100%; background: #0d9488;
  padding: 48px 20px; display: flex; flex-direction: column; align-items: center;
  position: relative; overflow: hidden;
}
.promo-inner { width: 100%; max-width: 640px; position: relative; }

.promo-decor-circle {
  position: absolute; width: 140px; height: 140px; border-radius: 50%;
  background: rgba(255,255,255,0.1); top: -30px; left: -40px;
  transition: transform 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease;
}
.promo-decor-circle.hidden { transform: scale(0.3) translateX(-60px); opacity: 0; }
.promo-decor-circle.visible { transform: scale(1) translateX(0); opacity: 1; }

.promo-card {
  background: #f5f0e8; border-radius: 24px; padding: 28px 24px 24px;
  margin-bottom: 24px; position: relative; overflow: hidden;
  transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease;
}
.promo-card.hidden { transform: translateY(40px); opacity: 0; }
.promo-card.visible { transform: translateY(0); opacity: 1; }

.promo-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.promo-logo-img { width: 38px; height: 38px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid rgba(13,148,136,0.2); }
.promo-logo-img img { width: 85%; height: 85%; object-fit: contain; }
.promo-logo-text { font-size: 18px; font-weight: 700; font-family: 'Instrument Sans', sans-serif; }
.promo-logo-text span:first-child { color: #38bdf8; }
.promo-logo-text span:last-child { color: #0d9488; }
.promo-logo-sub { font-size: 10px; color: #888; display: block; font-weight: 400; margin-top: 1px; }

.promo-headline { font-size: 32px; font-weight: 900; line-height: 1.15; color: #1a1714; margin-bottom: 0; font-family: 'Instrument Sans', sans-serif; }
.promo-headline-teal { color: #0d9488; }

.promo-pill {
  position: absolute; right: -10px; bottom: -10px; width: 80px; height: 80px;
  transition: transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s, opacity 0.9s ease 0.2s;
}
.promo-pill.hidden { transform: rotate(-30deg) scale(0.4); opacity: 0; }
.promo-pill.visible { transform: rotate(15deg) scale(1); opacity: 1; }

.promo-phone-wrap {
  display: flex; justify-content: center; margin-bottom: 20px;
  transition: transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s, opacity 0.8s ease 0.15s;
}
.promo-phone-wrap.hidden { transform: translateY(60px) scale(0.92); opacity: 0; }
.promo-phone-wrap.visible { transform: translateY(0) scale(1); opacity: 1; }

.promo-phone {
  width: 200px; background: #fff; border-radius: 28px;
  border: 6px solid #1a1714; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden; position: relative;
}
.promo-phone-notch {
  width: 60px; height: 14px; background: #1a1714; border-radius: 0 0 10px 10px;
  margin: 0 auto 8px; display: block;
}
.promo-phone-inner { padding: 0 10px 12px; }
.promo-phone-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.promo-phone-logo { display: flex; align-items: center; gap: 5px; }
.promo-phone-logo img { width: 20px; height: 20px; border-radius: 50%; }
.promo-phone-logo-text { font-size: 11px; font-weight: 700; }
.promo-phone-logo-text span:first-child { color: #38bdf8; }
.promo-phone-logo-text span:last-child { color: #0d9488; }
.promo-phone-lang { font-size: 8px; border: 1px solid #ccc; border-radius: 8px; padding: 2px 6px; color: #666; }
.promo-phone-disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 5px 7px; font-size: 7px; color: #b45309; margin-bottom: 7px; line-height: 1.4; }
.promo-phone-tabs { display: flex; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 2px; margin-bottom: 7px; gap: 2px; }
.promo-phone-tab { flex: 1; padding: 4px 2px; border-radius: 6px; font-size: 7px; text-align: center; font-weight: 500; color: #888; }
.promo-phone-tab.active { background: #0d9488; color: #fff; font-weight: 700; }
.promo-phone-search { display: flex; gap: 4px; margin-bottom: 6px; align-items: center; }
.promo-phone-input { flex: 1; background: #f9f9f9; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 8px; font-size: 8px; color: #333; display: flex; align-items: center; gap: 4px; }
.promo-phone-search-btn { background: #0d9488; color: #fff; border-radius: 6px; padding: 5px 8px; font-size: 8px; font-weight: 700; white-space: nowrap; }
.promo-phone-recent { font-size: 7px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 700; }
.promo-phone-chips { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
.promo-phone-chip { border: 1px solid #e5e7eb; border-radius: 10px; padding: 2px 7px; font-size: 7px; color: #555; }
.promo-phone-result-label { font-size: 7px; color: #999; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 700; margin-bottom: 4px; display: flex; justify-content: space-between; }
.promo-phone-ai-badge { background: #f0faf9; color: #0d9488; border: 1px solid #99f6e4; border-radius: 8px; padding: 1px 5px; font-size: 6px; font-weight: 700; }
.promo-phone-card { background: #fff; border: 1.5px solid #0d9488; border-radius: 10px; padding: 8px 10px; }
.promo-phone-card-name { font-size: 10px; font-weight: 800; color: #1a1714; }
.promo-phone-card-salt { font-size: 7px; color: #888; margin-bottom: 2px; }
.promo-phone-card-right { display: flex; align-items: center; gap: 5px; }
.promo-phone-card-price { font-size: 13px; font-weight: 800; color: #0d9488; }
.promo-phone-card-badge { background: #0d9488; color: #fff; border-radius: 4px; padding: 1px 5px; font-size: 6px; font-weight: 800; text-transform: uppercase; }

.promo-url {
  text-align: center; color: #fff; font-size: 20px; font-weight: 800;
  letter-spacing: -0.3px; font-family: 'Instrument Sans', sans-serif;
  transition: transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s, opacity 0.7s ease 0.3s;
}
.promo-url.hidden { transform: translateY(20px); opacity: 0; }
.promo-url.visible { transform: translateY(0); opacity: 1; }

.promo-scroll-row::-webkit-scrollbar { display: none; }
.promo-scroll-row { -ms-overflow-style: none; scrollbar-width: none; }

/* ── MOBILE ── */
@media (max-width: 480px) {
  .main-content { padding: 28px 14px 0; }
  .app-name { font-size: 26px; }
  .logo-ring { width: 54px; height: 54px; }
  .info-grid { grid-template-columns: 1fr; }
  .info-full { grid-column: 1; }
  .footer-grid { grid-template-columns: 1fr; gap: 20px; }
  .search-btn { padding: 0 13px; font-size: 13px; }
}
`;

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [tab, setTab] = useState<Tab>("search");
  const t = T[lang];

  const [promoVisible, setPromoVisible] = useState(false);
  const promoRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPromoVisible(true); },
      { threshold: 0.1 }
    );
    if (promoRef.current) obs.observe(promoRef.current);
    return () => obs.disconnect();
  }, []);

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
  const [checkerSuggestions, setCheckerSuggestions] = useState<string[]>([]);
  const [showCheckerSug, setShowCheckerSug] = useState(false);

  const [scanImg, setScanImg] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("");
  const [scanStatusType, setScanStatusType] = useState<""|"success"|"error">("");
  const [scanMeds, setScanMeds] = useState<PrescriptionMed[] | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanFileRef = useRef<HTMLInputElement>(null);
  const scanGalleryRef = useRef<HTMLInputElement>(null);
  const sugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkerSugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const checkerWrapRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);
  const langRef = useRef(lang);
  const sortRef = useRef(sort);
  
  useEffect(() => { queryRef.current = query; }, [query]);
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { sortRef.current = sort; }, [sort]);

  useEffect(() => {
    try {
      const h = sessionStorage.getItem("mm_history");
      const s = sessionStorage.getItem("mm_saved");
      if (h) setHistory(JSON.parse(h));
      if (s) setSavedMeds(JSON.parse(s));
    } catch {}
  }, []);

  const addHistory = (q: string) => {
    setHistory(prev => {
      const u = [q, ...prev.filter(x => x !== q)].slice(0, 5);
      try { sessionStorage.setItem("mm_history", JSON.stringify(u)); } catch {}
      return u;
    });
  };

  const toggleSave = (m: Medicine) => {
    setSavedMeds(prev => {
      const exists = prev.find(x => x.name === m.name);
      const u = exists ? prev.filter(x => x.name !== m.name) : [m, ...prev].slice(0, 10);
      try { sessionStorage.setItem("mm_saved", JSON.stringify(u)); } catch {}
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

  const fetchCheckerSug = useCallback((q: string) => {
    if (checkerSugTimer.current) clearTimeout(checkerSugTimer.current);
    if (q.trim().length < 2) { setCheckerSuggestions([]); return; }
    checkerSugTimer.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
        const d = await r.json();
        setCheckerSuggestions(d.suggestions ?? []);
      } catch { setCheckerSuggestions([]); }
    }, 380);
  }, []);

  const sortArr = (arr: Medicine[], s: string) =>
    [...arr].sort((a, b) => s === "low" ? a.price - b.price : b.price - a.price);

  const searchMed = useCallback(async (q?: string) => {
    const qry = (q ?? inputRef.current?.value ?? queryRef.current ?? "").trim();
    if (!qry) return;
    const currentLang = langRef.current;
    const currentSort = sortRef.current;
    setLoading(true); setError(""); setResults(null); setShowSug(false); setExpanded(null);
    addHistory(qry);
    try {
      const r = await fetch("/api/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: qry, language: currentLang })
      });
      const d = await r.json();
      if (d.error) setError("Something went wrong. Please try again.");
      else setResults(sortArr(d.results ?? [], currentSort));
    } catch { setError("Network error. Please check your connection."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (results?.length) setResults(prev => prev ? sortArr(prev, sort) : prev);
  }, [sort]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".search-wrap")) setShowSug(false);
      if (!(e.target as HTMLElement).closest(".checker-wrap")) setShowCheckerSug(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert(lang === "bn" ? "Chrome ব্রাউজার ব্যবহার করুন" : "Voice search works best in Chrome browser"); return; }
    if (listening) return;
    const rec = new SR();
    rec.lang = lang === "bn" ? "bn-IN" : "en-IN";
    rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e: any) => { const txt = e.results[0][0].transcript; setQuery(txt); searchMed(txt); };
    rec.start();
  };

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      setImgPreview(url); setImgStatus("Identifying medicine…"); setImgStatusType(""); setImgLoading(true);
      try {
        const r = await fetch("/api/identify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: url.split(",")[1], mimeType: file.type, language: lang }) });
        const d = await r.json();
        if (d.medicineName) { setImgStatus(`Identified: ${d.medicineName}`); setImgStatusType("success"); setQuery(d.medicineName); await searchMed(d.medicineName); }
        else { setImgStatus("Couldn't identify. Try a clearer photo."); setImgStatusType("error"); }
      } catch { setImgStatus("Error identifying."); setImgStatusType("error"); }
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
        if (d.medicines?.length > 0) {
          setScanMeds(d.medicines);
          setScanStatus(`${d.medicines.length} ${lang === "bn" ? "টি ওষুধ পাওয়া গেছে" : "medicines found"}`);
          setScanStatusType("success");
        } else { setScanStatus(lang === "bn" ? "কোনো ওষুধ পাওয়া যায়নি" : "No medicines found — try a clearer photo"); setScanStatusType("error"); }
      } catch { setScanStatus("Error reading prescription."); setScanStatusType("error"); }
      finally { setScanLoading(false); }
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  const checkInteract = useCallback(async (overrideMeds?: string[]) => {
    const meds = overrideMeds ?? checkerMeds;
    if (meds.length < 2) return;
    if (overrideMeds) setCheckerMeds(overrideMeds);
    setCheckLoading(true); setCheckError(""); setInteractResult(null); setTab("checker");
    try {
      const r = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: meds, language: langRef.current })
      });
      const text = await r.text();
      const clean = text.replace(/```json|```/g, "").trim();
      const d = JSON.parse(clean);
      if (d.error) setCheckError("Failed to check interactions."); else setInteractResult(d);
    } catch (e) { console.error(e); setCheckError("Failed to check interactions."); }
    finally { setCheckLoading(false); }
  }, [checkerMeds]);

  const shareResult = async (m: Medicine, i: number) => {
    const text = `💊 ${m.name} (${m.salt})\n💰 ₹${m.price} — ${m.type}\n🏭 ${m.manufacturer}\n📋 ${m.uses}\n⏰ ${m.whenToEat}\n\nFound on MedMind — India's smartest medicine companion`;
    try {
      if (navigator.share) await navigator.share({ title: "MedMind", text });
      else { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 2000); }
    } catch {}
  };

  const cheapest = results?.length ? Math.min(...results.map(r => r.price)) : null;
  const safetyIcon = (s: Safety) => s === "safe" ? "✅" : s === "warning" ? "⚠️" : "🚫";

  const SYMPTOMS_EN = ["Fever", "Headache", "Cold & Cough", "Stomach pain", "Acidity", "Diabetes"];
  const SYMPTOMS_BN = ["জ্বর", "মাথাব্যথা", "সর্দি-কাশি", "পেটব্যথা", "অ্যাসিডিটি", "ডায়াবেটিস"];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="main-content">

          {/* HEADER */}
          <div className="header">
            <div className="header-left">
              <div className="logo-ring">
                <img src="/medmind-logo.png" alt="MedMind" />
              </div>
              <div>
                <h1 className="app-name">
                  <span className="app-name-med">Med</span><span className="app-name-mind">Mind</span>
                </h1>
                <p className="app-sub">{t.subtitle}</p>
              </div>
            </div>
            <button className="lang-btn" onClick={() => setLang(l => l === "en" ? "bn" : "en")}>{t.langBtn}</button>
          </div>

          {/* PROMO VIDEO */}
          <div className="promo-video-wrap">
            <video
              src="/promovideo.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>

          {/* DISCLAIMER */}
          <div className="disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <span className="disclaimer-text">{t.disclaimer}</span>
          </div>

          {/* TABS */}
          <div className="tabs">
            {(["search","checker","scan"] as Tab[]).map(tb => (
              <button key={tb} className={`tab-btn${tab === tb ? " active" : ""}`} onClick={() => setTab(tb)}>
                <span className="tab-icon">
                  {tb === "search" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  ) : tb === "checker" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
                  )}
                </span>
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
                    <span className="search-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </span>
                    <input ref={inputRef} type="text" value={query} placeholder={t.searchPlaceholder} className="search-input"
                      disabled={loading || imgLoading} autoComplete="off" autoCorrect="off" spellCheck={false}
                      onChange={e => { const v = e.target.value; setQuery(v); queryRef.current = v; if (!v) { setResults(null); setError(""); setSuggestions([]); } else { fetchSug(v); setShowSug(true); } }}
                      onFocus={() => { if (suggestions.length > 0) setShowSug(true); }}
                      onKeyDown={e => { if (e.key === "Enter") { const q = queryRef.current; if (q) searchMed(q); } if (e.key === "Escape") setShowSug(false); }}
                    />
                    <button className={`voice-btn${listening ? " listening" : ""}`} onClick={handleVoice} title={lang === "bn" ? "ভয়েস সার্চ" : "Voice search"}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                    </button>
                  </div>
                  <button className="icon-btn" onClick={() => fileRef.current?.click()} disabled={loading || imgLoading} title={lang === "bn" ? "ছবি দিয়ে খুঁজুন" : "Search by photo"}>
                    {imgLoading ? <span className="btn-spin" style={{ borderTopColor: "var(--teal)", borderColor: "var(--border)" }} /> :
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    }
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImgChange} />
                  <button className="search-btn" onClick={() => { const q = queryRef.current; if (q) searchMed(q); }} disabled={loading || !query.trim() || imgLoading}>
                    {loading ? <><span className="btn-spin" />{t.searching}</> : t.searchBtn}
                  </button>
                </div>
                {showSug && (sugLoading || suggestions.length > 0) && (
                  <div className="suggestions">
                    {sugLoading && !suggestions.length && <div className="sug-item" style={{ color: "var(--text3)" }}>…</div>}
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
                <div className="history-section">
                  <div className="section-label">{t.history}</div>
                  <div className="chips-row">
                    {history.map((h, i) => <button key={i} className="chip" onClick={() => { setQuery(h); queryRef.current = h; searchMed(h); }}>{h}</button>)}
                  </div>
                </div>
              )}

              {savedMeds.length > 0 && !loading && results === null && (
                <div className="history-section">
                  <div className="section-label">{t.saved}</div>
                  <div className="saved-cards">
                    {savedMeds.slice(0, 3).map((m, i) => (
                      <div key={i} className="saved-card" onClick={() => { setQuery(m.name); queryRef.current = m.name; searchMed(m.name); }}>
                        <div><div className="saved-name">{m.name}</div><div className="saved-meta">{m.salt} · ₹{m.price}</div></div>
                        <button className="unsave-btn" onClick={e => { e.stopPropagation(); toggleSave(m); }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ALWAYS VISIBLE TRENDING SECTION */}
              {!loading && results === null && !error && (
                <div style={{ marginBottom: 20 }}>
                  <div className="trending-row">
                    <span className="trending-label">
                      {lang === "bn" ? "উপসর্গ" : "Symptoms"}
                    </span>
                    <div className="trending-chips">
                      {(lang === "bn"
                        ? ["জ্বর","মাথাব্যথা","সর্দি","পেটব্যথা","অ্যাসিডিটি"]
                        : ["Fever","Headache","Cold","Stomach pain","Acidity"]
                      ).map((s, i) => (
                        <button key={i} className="trend-chip symptom-chip" onClick={() => { setQuery(s); queryRef.current = s; searchMed(s); }}>
                          <span className="trend-chip-icon">
                            {i===0 ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                            : i===1 ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            : i===2 ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                            : i===3 ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                            : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>}
                          </span>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="trending-row" style={{ marginTop: 12 }}>
                    <span className="trending-label">
                      {lang === "bn" ? "জনপ্রিয় ওষুধ" : "Medicines"}
                    </span>
                    <div className="trending-chips">
                      {(lang === "bn"
                        ? ["প্যারাসিটামল","অ্যাজিথ্রোমাইসিন","প্যান্টোপ্রাজোল","সেটিরিজিন","মেটফর্মিন"]
                        : ["Paracetamol","Azithromycin","Pantoprazole","Cetirizine","Metformin"]
                      ).map((m, i) => (
                        <button key={i} className="trend-chip med-chip" onClick={() => { setQuery(m); queryRef.current = m; searchMed(m); }}>
                          <span className="trend-chip-icon">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                          </span>
                          {m}
                        </button>
                      ))}
                    </div>
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
                <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: 0.25 }}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)", marginBottom: 5 }}>{t.initialTitle}</p>
                  <p style={{ fontSize: 13, color: "var(--text3)" }}>{t.initialSub}</p>
                </div>
              )}
              {loading && <div className="loading"><div className="spinner" /><p className="loading-text">{t.findingPrices}</p></div>}
              {error && <div className="error-box">⚠️ {error}</div>}
              {!loading && results !== null && results.length === 0 && !error && (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <p className="empty-title">{t.noResults}</p>
                  <p className="empty-sub">{t.noResultsSub}</p>
                  <div style={{ marginTop: 14, padding: "10px 16px", borderRadius: 10, background: "var(--gold-light)", border: "1px solid var(--gold-border)", fontSize: 12.5, color: "var(--gold)", lineHeight: 1.5 }}>
                    💡 {lang === "bn" ? "বানান পরীক্ষা করুন বা ভিন্ন নামে খুঁজুন — যেমন ব্র্যান্ড নামের বদলে সল্ট নাম দিয়ে" : "Try checking your spelling, or search by salt/generic name instead of brand name"}
                  </div>
                </div>
              )}

              {!loading && results !== null && results.length > 0 && (
                <>
                  <div className="results-meta">
                    <span className="res-count">{results.length} {lang === "bn" ? "টি ফলাফল" : results.length === 1 ? "result found" : "results found"}</span>
                    <span className="ai-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      {t.aiPowered}
                    </span>
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
                            {m.price === cheapest
                              ? <span className="badge">{t.bestPrice}</span>
                              : <>
                                  <div className="type-tag">{m.type}</div>
                                  {cheapest && m.price - cheapest > 5 && <div className="price-save">Save ₹{m.price - cheapest}</div>}
                                </>
                            }
                            <div className={`expand-arr${expanded === i ? " open" : ""}`}>▼</div>
                          </div>
                        </div>

                        {expanded === i && (
                          <>
                            <div className="card-expanded">
                              <div className="info-grid">
                                {m.uses && <div className="info-full"><div className="info-label">{t.uses}</div><div className="info-value">{m.uses}</div></div>}
                                {m.dosage && <div className="info-full"><div className="info-label">{t.dosage}</div><div className="info-value">{m.dosage}</div></div>}
                                {m.whenToEat && (
                                  <div className="info-full">
                                    <div className="info-label">{t.whenToEat}</div>
                                    <div className="info-value"><span className="when-pill">🍽 {m.whenToEat}</span></div>
                                  </div>
                                )}
                                {m.sideEffects?.length > 0 && (
                                  <div className="info-full">
                                    <div className="info-label">{t.sideEffects}</div>
                                    <div className="tags">{m.sideEffects.map((s, j) => <span key={j} className="tag warn">{s}</span>)}</div>
                                  </div>
                                )}
                                {m.interactions?.length > 0 && (
                                  <div className="info-full">
                                    <div className="info-label">{t.interactions}</div>
                                    <div className="tags">{m.interactions.map((s, j) => <span key={j} className="tag danger">{s}</span>)}</div>
                                  </div>
                                )}
                                {m.warnings && (
                                  <div className="info-full">
                                    <div className="info-label">{t.warnings}</div>
                                    <div className="warn-grid">
                                      {m.warnings.pregnancy && <div className="warn-row"><span className="warn-key">{t.pregnancy}</span><span className="warn-val">{m.warnings.pregnancy}</span></div>}
                                      {m.warnings.children && <div className="warn-row"><span className="warn-key">{t.children}</span><span className="warn-val">{m.warnings.children}</span></div>}
                                      {m.warnings.elderly && <div className="warn-row"><span className="warn-key">{t.elderly}</span><span className="warn-val">{m.warnings.elderly}</span></div>}
                                    </div>
                                  </div>
                                )}
                                <div><div className="info-label">{t.form}</div><div className="info-value">{m.type}</div></div>
                                <div><div className="info-label">{t.manufacturer}</div><div className="info-value">{m.manufacturer}</div></div>
                                {m.safetyScore !== undefined && (
                                  <div className="info-full">
                                    <div className="info-label">Safety Rating</div>
                                    {(() => {
                                      const score = m.safetyScore!;
                                      const color = score <= 3 ? "green" : score <= 6 ? "yellow" : "red";
                                      const emoji = score <= 3 ? "✅" : score <= 6 ? "⚠️" : "🚫";
                                      return (
                                        <div className={`caution-scale ${color}`}>
                                          <div className="caution-header">
                                            <span className="caution-verdict">{emoji} {m.safetyVerdict ?? "Unknown"}</span>
                                            <span className="caution-score">{score}/10</span>
                                          </div>
                                          <div className="caution-bar-wrap">
                                            <div className="caution-bar-fill" style={{ width: `${score * 10}%` }} />
                                          </div>
                                          <div className="caution-ticks">
                                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                              <span key={n} className="caution-tick" style={{ fontWeight: n === score ? 800 : 400 }}>{n}</span>
                                            ))}
                                          </div>
                                          <div className="caution-legend">
                                            <span style={{ color: "#16a34a" }}>● 1–3 Safe</span>
                                            <span style={{ color: "#d97706" }}>● 4–6 Caution</span>
                                            <span style={{ color: "#dc2626" }}>● 7–10 Avoid</span>
                                          </div>
                                          {m.interactionReason && <p className="caution-reason">{m.interactionReason}</p>}
                                          {m.keyPoints && m.keyPoints.length > 0 && (
                                            <div className="caution-points">
                                              {m.keyPoints.map((pt, k) => (
                                                <div key={k} className="caution-point"><span>•</span><span>{pt}</span></div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="card-actions">
                              <button className={`action-btn${isSaved(m.name) ? " saved-active" : ""}`} onClick={() => toggleSave(m)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={isSaved(m.name) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                                {isSaved(m.name) ? t.saved2 : t.save}
                              </button>
                              <button className="action-btn" onClick={() => shareResult(m, i)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                {copied === i ? t.copied : t.share}
                              </button>
                              <button className="action-btn" onClick={() => { setCheckerMeds(p => p.includes(m.name) ? p : [...p, m.name]); setTab("checker"); }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                {lang === "bn" ? "মিশ্রণ পরীক্ষা" : "Check interaction"}
                              </button>
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
            <div>
              <div className="section-head">
                <div className="section-title">{t.checkerTitle}</div>
                <div className="section-sub">{t.checkerSub}</div>
              </div>
              <div className="add-row checker-wrap" style={{ position: "relative" }}>
                <input className="add-input" placeholder={t.addMedicine} value={checkerInput}
                  onChange={e => { const v = e.target.value; setCheckerInput(v); if (v.trim().length >= 2) { fetchCheckerSug(v); setShowCheckerSug(true); } else { setCheckerSuggestions([]); setShowCheckerSug(false); } }}
                  onFocus={() => { if (checkerSuggestions.length > 0) setShowCheckerSug(true); }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && checkerInput.trim()) {
                      setCheckerMeds(p => p.includes(checkerInput.trim()) ? p : [...p, checkerInput.trim()]);
                      setCheckerInput("");
                      setShowCheckerSug(false);
                      setCheckerSuggestions([]);
                      setInteractResult(null);
                      setCheckError("");
                    }
                    if (e.key === "Escape") setShowCheckerSug(false);
                  }}
                />
                <button className="add-btn" onClick={() => {
                  if (checkerInput.trim()) {
                    setCheckerMeds(p => p.includes(checkerInput.trim()) ? p : [...p, checkerInput.trim()]);
                    setCheckerInput("");
                    setShowCheckerSug(false);
                    setCheckerSuggestions([]);
                    setInteractResult(null);
                    setCheckError("");
                  }
                }}>{t.addBtn}</button>
                {showCheckerSug && checkerSuggestions.length > 0 && (
                  <div className="suggestions" style={{ top: "calc(100% + 4px)" }}>
                    {checkerSuggestions.map((s, i) => (
                      <div key={i} className="sug-item" onMouseDown={() => {
                        setCheckerMeds(p => p.includes(s) ? p : [...p, s]);
                        setCheckerInput("");
                        setShowCheckerSug(false);
                        setCheckerSuggestions([]);
                        setInteractResult(null);
                        setCheckError("");
                      }}>
                        <span className="sug-dot" />{s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {checkerMeds.length > 0 && (
                <div className="med-tags">
                  {checkerMeds.map((m, i) => (
                    <div key={i} className="med-tag">{m}<span className="med-tag-x" onClick={() => { setCheckerMeds(p => p.filter((_,j) => j !== i)); setInteractResult(null); setCheckError(""); }}>✕</span></div>
                  ))}
                </div>
              )}
              <button className="check-btn" onClick={() => checkInteract()} disabled={checkerMeds.length < 2 || checkLoading}>
                {checkLoading ? <><span className="btn-spin" />{t.checking}</> : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    {t.checkBtn}
                  </>
                )}
              </button>
              {checkerMeds.length < 2 && <div className="checker-min">{t.checkerMin}</div>}
              {checkError && <div className="error-box" style={{ marginBottom: 16 }}>⚠️ {checkError}</div>}
              {checkLoading && <div className="loading"><div className="spinner" /><p className="loading-text">{t.checking}</p></div>}

              {interactResult && !checkLoading && (
                <div className="interact-result">
                  <div className={`interact-header ${interactResult.overall}`}>
                    <span className="safety-icon">{safetyIcon(interactResult.overall)}</span>
                    <div>
                      <div className={`safety-label ${interactResult.overall}`}>
                        {interactResult.overall === "safe" ? t.safe : interactResult.overall === "warning" ? t.warning : t.dangerous}
                      </div>
                      <div className="safety-summary">{interactResult.summary}</div>
                    </div>
                  </div>

                  {/* CAUTION SCALE */}
                  {interactResult.safetyScore !== undefined && (
                    (() => {
                      const score = interactResult.safetyScore!;
                      const isGreen = score <= 3;
                      const isYellow = score > 3 && score <= 6;
                      const bgColor = isGreen ? "var(--safe-bg)" : isYellow ? "var(--warn-bg)" : "var(--danger-bg)";
                      const borderColor = isGreen ? "var(--safe-border)" : isYellow ? "var(--warn-border)" : "var(--danger-border)";
                      const textColor = isGreen ? "var(--safe)" : isYellow ? "var(--warn)" : "var(--danger)";
                      const barColor = isGreen ? "#10b981" : isYellow ? "#f59e0b" : "#ef4444";
                      const emoji = isGreen ? "✅" : isYellow ? "⚠️" : "🚫";
                      return (
                        <div style={{ background: bgColor, borderTop: `1.5px solid ${borderColor}`, padding: "14px 20px" }}>
                          {/* Score row */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: textColor }}>
                              Safety Score
                            </span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{emoji} {score}/10</span>
                          </div>
                          {/* Bar */}
                          <div style={{ width: "100%", height: 8, background: "rgba(0,0,0,0.08)", borderRadius: 99, marginBottom: 4 }}>
                            <div style={{ width: `${score * 10}%`, height: 8, borderRadius: 99, background: barColor, transition: "width 0.4s ease" }} />
                          </div>
                          {/* Ticks */}
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <span key={n} style={{ fontSize: 9, color: n === score ? textColor : "rgba(0,0,0,0.3)", fontWeight: n === score ? 800 : 400 }}>{n}</span>
                            ))}
                          </div>
                          {/* Legend */}
                          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                            <span style={{ fontSize: 11, color: "var(--safe)" }}>● 1–3 Safe</span>
                            <span style={{ fontSize: 11, color: "var(--warn)" }}>● 4–6 Caution</span>
                            <span style={{ fontSize: 11, color: "var(--danger)" }}>● 7–10 Avoid</span>
                          </div>
                          {/* Reason */}
                          {interactResult.interactionReason && (
                            <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.55, marginBottom: 8 }}>
                              {interactResult.interactionReason}
                            </p>
                          )}
                          {/* Key points */}
                          {interactResult.keyPoints && interactResult.keyPoints.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {interactResult.keyPoints.map((pt, k) => (
                                <div key={k} style={{ display: "flex", gap: 7, fontSize: 12.5, fontWeight: 600, color: textColor }}>
                                  <span>•</span><span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                  <div className="interact-body">
                    {interactResult.pairs?.length > 0 && (
                      <div className="interact-pairs">
                        {interactResult.pairs.map((p, i) => (
                          <div key={i} className={`pair-card ${p.severity}`}>
                            <div className={`pair-sev ${p.severity}`}>
                              {p.severity === "safe" ? "🟢" : p.severity === "warning" ? "🟡" : "🔴"} {p.severity.toUpperCase()}
                            </div>
                            <div className="pair-meds">{p.medicines.join(" + ")}</div>
                            <div className="pair-desc">{p.description}</div>
                            {p.why && (
                              <div className="pair-info-box why">
                                <div className="pair-info-label">Why this happens</div>
                                {p.why}
                              </div>
                            )}
                            {p.whatToDo && (
                              <div className={`pair-info-box action ${p.severity}`}>
                                <div className="pair-info-label">What to do</div>
                                {p.whatToDo}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {interactResult.advice && (
                      <div className="advice-box">
                        <div className="advice-label">{t.advice}</div>
                        <div className="advice-text">{interactResult.advice}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SCAN ══ */}
          {tab === "scan" && (
            <div>
              <div className="section-head">
                <div className="section-title">{t.scanTitle}</div>
                <div className="section-sub">{t.scanSub}</div>
              </div>

              {!scanImg && (
                <div className="upload-zone">
                  <div className="upload-btns">
                    <div className="upload-btn-item" onClick={() => scanFileRef.current?.click()}>
                      <div className="upload-icon-lg">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </div>
                      <div className="upload-label">{lang === "bn" ? "ক্যামেরা" : "Camera"}</div>
                      <div className="upload-sub-text">{lang === "bn" ? "এখনই ছবি তুলুন" : "Take a photo now"}</div>
                    </div>
                    <div className="upload-btn-item" onClick={() => scanGalleryRef.current?.click()}>
                      <div className="upload-icon-lg">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div className="upload-label">{lang === "bn" ? "গ্যালারি" : "Gallery"}</div>
                      <div className="upload-sub-text">{lang === "bn" ? "ফোন থেকে বেছে নিন" : "Choose from phone"}</div>
                    </div>
                  </div>
                </div>
              )}

              {scanImg && (
                <div className="scan-img-wrap">
                  <img src={scanImg} className="scan-img" alt="" />
                  <button className="img-remove" style={{ top: 8, right: 8 }} onClick={() => { setScanImg(null); setScanMeds(null); setScanStatus(""); }}>✕</button>
                  <div className={`scan-status ${scanStatusType}`}>
                    {scanStatusType === "success" ? "✓" : scanStatusType === "error" ? "✗" : "⟳"} {scanStatus}
                  </div>
                </div>
              )}

              <input ref={scanFileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleScanChange} />
              <input ref={scanGalleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleScanChange} />

              {scanLoading && <div className="loading"><div className="spinner" /><p className="loading-text">{t.scanning}</p></div>}

              {scanMeds && !scanLoading && scanMeds.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p className="empty-title">{t.noMeds}</p>
                  <p className="empty-sub">{t.noMedsSub}</p>
                </div>
              )}

              {scanMeds && !scanLoading && scanMeds.length > 0 && (
                <>
                  <div className="scan-results-head">{t.scanResults} ({scanMeds.length})</div>

                  {scanMeds.length >= 2 && (
                    <button className="check-all-btn" onClick={() => checkInteract(scanMeds.map(m => m.name))}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      {t.checkAll}
                    </button>
                  )}

                  <div className="scan-cards">
                    {scanMeds.map((m, i) => (
                      <div key={i} className="scan-card">
                        <div className="scan-med-header">
                          <div className="scan-med-name">💊 {m.name}</div>
                          {m.dosage && <span className="dosage-badge">{m.dosage}</span>}
                        </div>
                        <div className="scan-pills">
                          {m.whenToEat && m.whenToEat !== "Not specified" && (
                            <span className="scan-pill eat">🍽 {m.whenToEat}</span>
                          )}
                          {m.frequency && <span className="scan-pill freq">🕐 {m.frequency}</span>}
                          {m.duration && <span className="scan-pill dur">📅 {m.duration}</span>}
                        </div>
                        {m.instructions && (
                          <div className="scan-instructions">📌 {m.instructions}</div>
                        )}
                        <button className="action-btn" style={{ fontSize: 12 }} onClick={() => { setQuery(m.name); setTab("search"); searchMed(m.name); }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                          {lang === "bn" ? "দাম ও বিকল্প দেখুন" : "Find price & cheaper alternatives"}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ height: 64 }} />
        </div>

        {/* ══ PROMO SECTION ══ */}
        <div ref={promoRef} style={{ width: "100%", background: "#0d9488", padding: "44px 0 52px", overflow: "hidden" }}>

          {/* Logo + tagline — slides in from LEFT */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            marginBottom: 6, padding: "0 20px",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0s, opacity 0.8s ease 0s",
            transform: promoVisible ? "translateX(0)" : "translateX(-60px)",
            opacity: promoVisible ? 1 : 0,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>
              <img src="/medmind-logo.png" alt="MedMind" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1, fontFamily: "'Instrument Sans', sans-serif" }}>
                <span style={{ color: "#38bdf8" }}>Med</span><span style={{ color: "#99f6e4" }}>Mind</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>India's smartest medicine companion</div>
            </div>
          </div>

          {/* Headline — slides in from RIGHT */}
          <div style={{
            textAlign: "center", marginBottom: 32, padding: "0 20px",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 0.8s ease 0.1s",
            transform: promoVisible ? "translateX(0)" : "translateX(60px)",
            opacity: promoVisible ? 1 : 0,
          }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.2, fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.5px" }}>
              Smart meds. Smart Price.<br />
              <span style={{ color: "#99f6e4" }}>Safer</span> you.
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginTop: 10, lineHeight: 1.5 }}>
              Everything about your medicine — in one place
            </div>
          </div>

          {/* Scrollable cards — each flies up with stagger */}
          <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "4px 20px 12px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            className="promo-scroll-row">

            {/* Card 1 — Search tab active */}
            <div style={{
              minWidth: 220, scrollSnapAlign: "start", flexShrink: 0,
              transition: "transform 0.75s cubic-bezier(0.16,1,0.3,1) 0.2s, opacity 0.75s ease 0.2s",
              transform: promoVisible ? "translateY(0) scale(1)" : "translateY(70px) scale(0.9)",
              opacity: promoVisible ? 1 : 0,
            }}>
              <div style={{ background: "rgba(255,255,255,0.13)", borderRadius: 18, padding: "14px 12px 10px", marginBottom: 10, border: "1.5px solid rgba(255,255,255,0.22)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#99f6e4", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12 }}>✦</span> Search
                </div>
                <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", minHeight: 360 }}>
                  <div style={{ background: "#0d9488", padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <img src="/medmind-logo.png" alt="MedMind" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}><span style={{ color: "#38bdf8" }}>Med</span><span style={{ color: "#99f6e4" }}>Mind</span></span>
                    </div>
                    <span style={{ fontSize: 6.5, background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 6, padding: "1px 5px" }}>বাংলা</span>
                  </div>
                  <div style={{ display: "flex", background: "#f9f9f9", borderBottom: "1px solid #e5e7eb", padding: "3px" }}>
                    {[{ label: "Search", active: true }, { label: "Interact", active: false }, { label: "Scan Rx", active: false }].map(tab => (
                      <div key={tab.label} style={{ flex: 1, textAlign: "center", padding: "4px 2px", borderRadius: 5, background: tab.active ? "#0d9488" : "transparent", fontSize: 6.5, fontWeight: tab.active ? 800 : 500, color: tab.active ? "#fff" : "#aaa" }}>{tab.label}</div>
                    ))}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ background: "#f0faf9", border: "1px solid #99f6e4", borderRadius: 7, padding: "5px 8px", fontSize: 8, color: "#0d9488", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Dolo 650</span>
                      <span style={{ background: "#0d9488", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 7 }}>Search</span>
                    </div>
                    <div style={{ fontSize: 6.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Recent Searches</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
                      {["Dolo 650", "Azithromycin", "Paracetamol"].map(s => (
                        <span key={s} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1px 5px", fontSize: 6.5, color: "#555" }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 6.5, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                      <span>2 results found</span>
                      <span style={{ background: "#f0faf9", color: "#0d9488", border: "1px solid #99f6e4", borderRadius: 8, padding: "0px 4px", fontSize: 6, fontWeight: 800 }}>⚡ AI-powered</span>
                    </div>
                    <div style={{ background: "#fff", border: "1.5px solid #0d9488", borderRadius: 8, padding: "7px 8px", marginBottom: 5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#1a1714" }}>Dolo 650</div>
                          <div style={{ fontSize: 7, color: "#888" }}>Paracetamol 650mg</div>
                          <div style={{ fontSize: 7, color: "#888" }}>Micro Labs Ltd</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#0d9488" }}>₹30</div>
                          <div style={{ background: "#0d9488", color: "#fff", borderRadius: 3, padding: "1px 4px", fontSize: 6, fontWeight: 800 }}>BEST PRICE</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 8px", marginBottom: 5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#1a1714" }}>Calpol 650</div>
                          <div style={{ fontSize: 7, color: "#888" }}>Paracetamol 650mg</div>
                          <div style={{ fontSize: 7, color: "#888" }}>GSK Pharma</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#0d9488" }}>₹38</div>
                          <div style={{ fontSize: 7, color: "#aaa" }}>Save ₹8</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#1a1714" }}>Pacimol 650</div>
                          <div style={{ fontSize: 7, color: "#888" }}>Paracetamol 650mg</div>
                          <div style={{ fontSize: 7, color: "#888" }}>Cipla Ltd</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#0d9488" }}>₹42</div>
                          <div style={{ fontSize: 7, color: "#aaa" }}>Save ₹12</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>Find any medicine instantly</div>
            </div>

            {/* Card 2 — Medicine Detail */}
            <div style={{
              minWidth: 220, scrollSnapAlign: "start", flexShrink: 0,
              transition: "transform 0.75s cubic-bezier(0.16,1,0.3,1) 0.32s, opacity 0.75s ease 0.32s",
              transform: promoVisible ? "translateY(0) scale(1)" : "translateY(70px) scale(0.9)",
              opacity: promoVisible ? 1 : 0,
            }}>
              <div style={{ background: "rgba(255,255,255,0.13)", borderRadius: 18, padding: "14px 12px 10px", marginBottom: 10, border: "1.5px solid rgba(255,255,255,0.22)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#99f6e4", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12 }}>🩺</span> Details
                </div>
                <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", padding: "10px", minHeight: 360 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#1a1714", marginBottom: 2 }}>Dolo 650</div>
                  <div style={{ fontSize: 7, color: "#888", marginBottom: 8 }}>Paracetamol 650mg · Micro Labs Ltd</div>
                  {[
                    { label: "Uses", val: "Fever, Mild to moderate pain relief" },
                    { label: "Dosage", val: "1 tablet every 6 hours as needed" },
                    { label: "When to take", val: "Any time", pill: true },
                  ].map((row, i) => (
                    <div key={i} style={{ marginBottom: 7 }}>
                      <div style={{ fontSize: 6.5, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{row.label}</div>
                      {row.pill
                        ? <span style={{ background: "#f0faf9", color: "#0d9488", border: "1px solid #99f6e4", borderRadius: 20, padding: "2px 8px", fontSize: 7.5, fontWeight: 700 }}>🍽 {row.val}</span>
                        : <div style={{ fontSize: 7.5, color: "#444", lineHeight: 1.4 }}>{row.val}</div>}
                    </div>
                  ))}
                  <div style={{ marginBottom: 7 }}>
                    <div style={{ fontSize: 6.5, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>Side Effects</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {["Nausea", "Stomach pain", "Allergic reaction"].map(s => (
                        <span key={s} style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e", borderRadius: 20, padding: "1px 6px", fontSize: 6.5 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 7 }}>
                    <div style={{ fontSize: 6.5, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>Avoid With</div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {["Warfarin", "Carbamazepine"].map(s => (
                        <span key={s} style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 20, padding: "1px 6px", fontSize: 6.5 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 6.5, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Warnings</div>
                    {[
                      { k: "Pregnancy", v: "Safe for short-term use" },
                      { k: "Children", v: "Consult doctor under 12" },
                      { k: "Elderly", v: "Safe in standard doses" },
                    ].map((w, i) => (
                      <div key={i} style={{ display: "flex", gap: 5, marginBottom: 3, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 6, fontWeight: 800, color: "#aaa", minWidth: 44, marginTop: 1 }}>{w.k}</span>
                        <span style={{ fontSize: 6.5, color: "#555", lineHeight: 1.4 }}>{w.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>Full medicine info at a glance</div>
            </div>

            {/* Card 3 — Interactions */}
            <div style={{
              minWidth: 220, scrollSnapAlign: "start", flexShrink: 0,
              transition: "transform 0.75s cubic-bezier(0.16,1,0.3,1) 0.44s, opacity 0.75s ease 0.44s",
              transform: promoVisible ? "translateY(0) scale(1)" : "translateY(70px) scale(0.9)",
              opacity: promoVisible ? 1 : 0,
            }}>
              <div style={{ background: "rgba(255,255,255,0.13)", borderRadius: 18, padding: "14px 12px 10px", marginBottom: 10, border: "1.5px solid rgba(255,255,255,0.22)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#99f6e4", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12 }}>⚡</span> Interactions
                </div>
                <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", minHeight: 360 }}>
                  <div style={{ background: "#0d9488", padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <img src="/medmind-logo.png" alt="MedMind" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}><span style={{ color: "#38bdf8" }}>Med</span><span style={{ color: "#99f6e4" }}>Mind</span></span>
                    </div>
                    <span style={{ fontSize: 6.5, background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 6, padding: "1px 5px" }}>বাংলা</span>
                  </div>
                  <div style={{ display: "flex", background: "#f9f9f9", borderBottom: "1px solid #e5e7eb", padding: "3px" }}>
                    {[{ label: "Search", active: false }, { label: "Interact", active: true }, { label: "Scan Rx", active: false }].map(tab => (
                      <div key={tab.label} style={{ flex: 1, textAlign: "center", padding: "4px 2px", borderRadius: 5, background: tab.active ? "#0d9488" : "transparent", fontSize: 6.5, fontWeight: tab.active ? 800 : 500, color: tab.active ? "#fff" : "#aaa" }}>{tab.label}</div>
                    ))}
                  </div>
                  <div style={{ padding: "10px" }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {["Dolo 650", "Pan D"].map(m => (
                        <span key={m} style={{ background: "#f0faf9", border: "1.5px solid #99f6e4", color: "#0d9488", borderRadius: 20, padding: "2px 8px", fontSize: 7, fontWeight: 700 }}>{m} ✕</span>
                      ))}
                    </div>
                    <div style={{ background: "#ecfdf5", border: "1.5px solid #6ee7b7", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>✅</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#065f46" }}>Safe to take together</span>
                      </div>
                      <div style={{ fontSize: 7, color: "#065f46", lineHeight: 1.4 }}>Generally low risk of significant interactions for short-term use.</div>
                    </div>
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 7, marginBottom: 8 }}>
                      <div style={{ fontSize: 7, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Safety Score</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 99, marginRight: 8 }}>
                          <div style={{ width: "20%", height: 6, background: "#10b981", borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#065f46" }}>2/10</span>
                      </div>
                      {["Dolo 650 contains Paracetamol.", "Pan D contains Pantoprazole.", "No significant interactions documented."].map((pt, i) => (
                        <div key={i} style={{ display: "flex", gap: 4, fontSize: 6.5, fontWeight: 600, color: "#065f46", marginBottom: 3 }}>
                          <span>•</span><span>{pt}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 7, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 5 }}>Pair Analysis</div>
                      <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 6, padding: "6px 8px" }}>
                        <div style={{ fontSize: 7, fontWeight: 800, color: "#065f46", marginBottom: 2 }}>🟢 SAFE · Dolo 650 + Pan D</div>
                        <div style={{ fontSize: 6.5, color: "#065f46", lineHeight: 1.4 }}>No known adverse interaction between Paracetamol and Pantoprazole.</div>
                        <div style={{ fontSize: 6, fontWeight: 700, color: "#065f46", marginTop: 4 }}>What to do: No specific action required.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>Check drug interactions safely</div>
            </div>

            {/* Card 4 — Scan Rx */}
            <div style={{
              minWidth: 220, scrollSnapAlign: "start", flexShrink: 0,
              transition: "transform 0.75s cubic-bezier(0.16,1,0.3,1) 0.56s, opacity 0.75s ease 0.56s",
              transform: promoVisible ? "translateY(0) scale(1)" : "translateY(70px) scale(0.9)",
              opacity: promoVisible ? 1 : 0,
            }}>
              <div style={{ background: "rgba(255,255,255,0.13)", borderRadius: 18, padding: "14px 12px 10px", marginBottom: 10, border: "1.5px solid rgba(255,255,255,0.22)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#99f6e4", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12 }}>◈</span> Scan Rx
                </div>
                <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", minHeight: 360 }}>
                  <div style={{ background: "#0d9488", padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <img src="/medmind-logo.png" alt="MedMind" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}><span style={{ color: "#38bdf8" }}>Med</span><span style={{ color: "#99f6e4" }}>Mind</span></span>
                    </div>
                    <span style={{ fontSize: 6.5, background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 6, padding: "1px 5px" }}>বাংলা</span>
                  </div>
                  <div style={{ display: "flex", background: "#f9f9f9", borderBottom: "1px solid #e5e7eb", padding: "3px" }}>
                    {[{ label: "Search", active: false }, { label: "Interact", active: false }, { label: "Scan Rx", active: true }].map(tab => (
                      <div key={tab.label} style={{ flex: 1, textAlign: "center", padding: "4px 2px", borderRadius: 5, background: tab.active ? "#0d9488" : "transparent", fontSize: 6.5, fontWeight: tab.active ? 800 : 500, color: tab.active ? "#fff" : "#aaa" }}>{tab.label}</div>
                    ))}
                  </div>
                  <div style={{ padding: "10px" }}>
                    <div style={{ background: "#f5f5f0", border: "1.5px solid #99f6e4", borderRadius: 8, padding: "8px", marginBottom: 8, position: "relative" }}>
                      <div style={{ fontSize: 6, color: "#0d9488", fontWeight: 700, textAlign: "center", marginBottom: 4 }}>MISSION HOSPITAL</div>
                      {["Azil 500", "Lokitab DSR", "Pantop 40", "Metformin", "Calpol"].map((med, i) => (
                        <div key={i} style={{ fontSize: 6.5, color: "#444", marginBottom: 1.5, paddingLeft: 6 }}>• {med}</div>
                      ))}
                      <div style={{ marginTop: 5, fontSize: 7, color: "#0d9488", fontWeight: 700 }}>✓ 5 medicines found</div>
                    </div>
                    <div style={{ fontSize: 6.5, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 5 }}>Detected Medicines</div>
                    {[
                      { name: "Azil 500", dose: "500mg", when: "Before food", freq: "Once daily" },
                      { name: "Lokitab DSR", dose: "", when: "", freq: "Twice daily" },
                      { name: "Pantop 40", dose: "40mg", when: "Before food", freq: "Once daily" },
                      { name: "Metformin", dose: "500mg", when: "After food", freq: "Twice daily" },
                    ].map((m, i) => (
                      <div key={i} style={{ background: "#f9f9f9", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 7px", marginBottom: 4 }}>
                        <div style={{ fontSize: 8, fontWeight: 800, color: "#1a1714", marginBottom: 3 }}>
                          ◈ {m.name} {m.dose && <span style={{ background: "#f0faf9", color: "#0d9488", border: "1px solid #99f6e4", borderRadius: 5, padding: "0px 4px", fontSize: 6.5 }}>{m.dose}</span>}
                        </div>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                          {m.when && <span style={{ background: "#f0faf9", color: "#0d9488", border: "1px solid #99f6e4", borderRadius: 10, padding: "1px 5px", fontSize: 6 }}>🍽 {m.when}</span>}
                          {m.freq && <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 10, padding: "1px 5px", fontSize: 6 }}>🕐 {m.freq}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>Scan prescriptions instantly</div>
            </div>

          </div>

          {/* Swipe hint */}
          <div style={{
            textAlign: "center", marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.4)",
            transition: "opacity 0.8s ease 0.7s",
            opacity: promoVisible ? 1 : 0,
          }}>← swipe to explore →</div>

          {/* URL */}
          <div style={{
            textAlign: "center", marginTop: 22, fontSize: 19, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.3px", fontFamily: "'Instrument Sans', sans-serif",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s, opacity 0.8s ease 0.6s",
            transform: promoVisible ? "translateY(0)" : "translateY(24px)",
            opacity: promoVisible ? 1 : 0,
          }}>
            www.medmind.in
          </div>

        </div>

        {/* ══ FOOTER ══ */}
        <footer className="footer">
          <div className="footer-inner">

            {/* INSTALL BANNER */}
            <div style={{
              background: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(56,189,248,0.1))",
              border: "1.5px solid rgba(13,148,136,0.3)",
              borderRadius: 16, padding: "16px 20px", marginBottom: 32,
              display: "flex", alignItems: "center", gap: 14
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>📲</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                  Use MedMind as an App — it's free!
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  Tap the <strong style={{ color: "rgba(255,255,255,0.85)" }}>⋮ menu</strong> in your browser → <strong style={{ color: "rgba(255,255,255,0.85)" }}>"Add to Home Screen"</strong> — no app store needed.
                </div>
              </div>
            </div>

            {/* TOP — branding */}
            <div className="footer-top">
              <div className="footer-logo-wrap">
                <div className="footer-logo-img">
                  <img src="/medmind-logo.png" alt="MedMind" />
                </div>
                <span className="footer-app-name"><span style={{ color: "#38bdf8" }}>Med</span><span style={{ color: "#2dd4bf" }}>Mind</span></span>
              </div>
              <p className="footer-tagline">{t.footerTagline}</p>
              <p className="footer-desc">{t.footerDesc}</p>
            </div>

            {/* GRID — links */}
            <div className="footer-grid">
              <div>
                <div className="footer-col-title">Contact</div>
                <div className="footer-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href="mailto:sayansardar6677@gmail.com" className="footer-email-link">sayansardar6677@gmail.com</a>
                </div>
                <div className="footer-link" style={{ fontSize: 12, marginTop: 4 }}>
                  For bugs, suggestions, or anything — just email!
                </div>
              </div>
              <div>
                <div className="footer-col-title">Feedback</div>
                <div className="footer-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {t.feedbackDesc}
                </div>
                <div className="footer-link" style={{ marginTop: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  MedMind is free and always will be.
                </div>
              </div>
            </div>

            {/* PRIVACY NOTE */}
            <div className="footer-privacy">
              <span className="footer-privacy-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              {t.privacyNote}
            </div>

            {/* BOTTOM */}
            <div className="footer-bottom">
              <div className="footer-built-by">
                <div className="footer-personal-logo">
                  <img src="/logo.png" alt="Sayan" />
                </div>
                <span className="footer-built-text">Built by <strong>Sayan Sardar</strong></span>
              </div>
              <div className="footer-made-with">
                {t.madeWith} ❤️ {t.forIndia}
              </div>
              <p className="footer-copy">© {new Date().getFullYear()} MedMind. {t.rightsReserved}</p>
            </div>

          </div>
        </footer>
      </div>
    </>
  );
}
