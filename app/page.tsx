"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Medicine = {
  name: string;
  salt: string;
  manufacturer: string;
  price: number;
  type: string;
  dosage: string;
  uses: string;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html { font-size: 16px; }
  body { background: #060810; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

  .app {
    min-height: 100vh; min-height: 100dvh;
    background: #060810;
    background-image:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(32,178,170,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(99,102,241,0.06) 0%, transparent 60%);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 48px 20px 80px; color: #e8eaf0;
  }

  .container { width: 100%; max-width: 600px; }

  /* HEADER */
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
  .logo-ring {
    width: 64px; height: 64px; border-radius: 50%; background: #000; flex-shrink: 0;
    border: 1.5px solid rgba(20,184,166,0.3);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 4px rgba(20,184,166,0.06), 0 4px 24px rgba(0,0,0,0.7), 0 0 32px rgba(20,184,166,0.12);
    overflow: hidden;
  }
  .logo-ring img { width: 44px; height: 44px; object-fit: contain; mix-blend-mode: screen; filter: brightness(1.8) contrast(1.1); }
  .header-text { }
  .title { font-family: 'DM Serif Display', serif; font-size: 34px; letter-spacing: -0.5px; color: #f0f2f8; line-height: 1; }
  .subtitle { font-size: 13px; color: rgba(148,163,184,0.7); margin-top: 5px; font-weight: 300; }

  /* DISCLAIMER */
  .disclaimer {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-radius: 12px;
    background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.15);
    margin-bottom: 24px;
  }
  .disclaimer-icon { font-size: 14px; margin-top: 1px; flex-shrink: 0; }
  .disclaimer-text { font-size: 12px; color: rgba(251,191,36,0.7); line-height: 1.5; }

  /* SEARCH */
  .search-wrap { position: relative; margin-bottom: 14px; }
  .search-row { display: flex; gap: 8px; }
  .input-shell { flex: 1; position: relative; min-width: 0; }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(148,163,184,0.5); pointer-events: none; }
  .search-input {
    width: 100%; height: 52px; padding: 0 14px 0 42px; border-radius: 14px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    color: #e8eaf0; font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .search-input::placeholder { color: rgba(148,163,184,0.4); }
  .search-input:focus { border-color: rgba(20,184,166,0.5); box-shadow: 0 0 0 3px rgba(20,184,166,0.08); background: rgba(255,255,255,0.07); }
  .search-input:disabled { opacity: 0.6; }

  .camera-btn {
    height: 52px; width: 52px; border-radius: 14px; flex-shrink: 0;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    color: rgba(148,163,184,0.7); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    -webkit-appearance: none;
  }
  .camera-btn:hover, .camera-btn:active { background: rgba(20,184,166,0.1); border-color: rgba(20,184,166,0.3); color: #2dd4bf; }

  .search-btn {
    height: 52px; padding: 0 18px; border-radius: 14px;
    background: linear-gradient(135deg, #14b8a6, #0891b2);
    border: none; color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    box-shadow: 0 4px 18px rgba(20,184,166,0.22);
    white-space: nowrap; display: flex; align-items: center; gap: 7px;
    flex-shrink: 0; -webkit-appearance: none;
  }
  .search-btn:active { transform: scale(0.97); }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* SUGGESTIONS */
  .suggestions {
    position: absolute; top: calc(100% + 8px); left: 0; right: 0;
    background: #0d1320; border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px; overflow: hidden; z-index: 50;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  }
  .suggestion-item {
    padding: 13px 18px; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
    color: rgba(226,232,240,0.85); transition: background 0.15s;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .suggestion-item:last-child { border-bottom: none; }
  .suggestion-item:active { background: rgba(20,184,166,0.1); }
  .suggestion-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(20,184,166,0.6); flex-shrink: 0; }
  .suggest-loading { padding: 13px 18px; font-size: 13px; color: rgba(148,163,184,0.35); }

  /* IMAGE PREVIEW */
  .image-preview-wrap {
    margin-bottom: 14px; border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(20,184,166,0.2); position: relative;
    background: rgba(255,255,255,0.02);
  }
  .image-preview { width: 100%; max-height: 180px; object-fit: contain; display: block; }
  .remove-image {
    position: absolute; top: 10px; right: 10px; width: 30px; height: 30px;
    border-radius: 50%; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.15);
    color: #fff; cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
  }
  .image-status {
    padding: 10px 16px; font-size: 12.5px; display: flex; align-items: center; gap: 8px;
    color: rgba(226,232,240,0.6); background: rgba(0,0,0,0.4);
  }
  .image-status.success { color: #2dd4bf; }
  .image-status.error { color: rgba(252,165,165,0.8); }

  /* SEARCH HISTORY */
  .history-row {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .history-label { font-size: 11px; color: rgba(148,163,184,0.35); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .history-chip {
    padding: 5px 12px; border-radius: 20px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    font-size: 12.5px; color: rgba(226,232,240,0.6); cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .history-chip:active { background: rgba(20,184,166,0.1); border-color: rgba(20,184,166,0.25); color: #2dd4bf; }

  /* CONTROLS */
  .controls { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .controls-label { font-size: 11.5px; color: rgba(148,163,184,0.45); font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap; }
  .sort-select {
    height: 36px; padding: 0 12px; border-radius: 10px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    color: rgba(226,232,240,0.8); font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; cursor: pointer; -webkit-appearance: none; appearance: none;
    padding-right: 28px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(148,163,184,0.5)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
  }
  .sort-select option { background: #0d1320; }

  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); margin-bottom: 20px; }

  /* RESULTS META */
  .results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .results-count { font-size: 11px; color: rgba(148,163,184,0.4); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500; }
  .ai-badge { font-size: 10.5px; color: rgba(20,184,166,0.65); background: rgba(20,184,166,0.08); border: 1px solid rgba(20,184,166,0.14); border-radius: 6px; padding: 3px 8px; }

  /* CARDS */
  .results { display: flex; flex-direction: column; gap: 10px; }
  .card {
    border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    overflow: hidden; animation: fadeSlideUp 0.3s ease both;
    transition: border-color 0.2s;
  }
  .card.cheapest { border-color: rgba(20,184,166,0.2); background: rgba(20,184,166,0.03); }
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .card:nth-child(1){animation-delay:.02s} .card:nth-child(2){animation-delay:.06s}
  .card:nth-child(3){animation-delay:.10s} .card:nth-child(4){animation-delay:.14s}
  .card:nth-child(5){animation-delay:.18s} .card:nth-child(6){animation-delay:.22s}
  .card:nth-child(7){animation-delay:.26s} .card:nth-child(8){animation-delay:.30s}

  .card-main {
    padding: 16px 18px; display: flex; align-items: center;
    justify-content: space-between; cursor: pointer; gap: 12px;
    -webkit-user-select: none; user-select: none;
  }
  .card-main:active { background: rgba(255,255,255,0.03); }
  .card-left { min-width: 0; flex: 1; }
  .card-name { font-size: 15px; font-weight: 500; color: #e8eaf0; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-salt { font-size: 12px; color: rgba(148,163,184,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-mfr  { font-size: 11px; color: rgba(148,163,184,0.3); margin-top: 2px; }
  .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .price-tag { font-size: 18px; font-weight: 600; color: #2dd4bf; font-family: 'DM Serif Display', serif; }
  .type-tag { font-size: 10px; color: rgba(148,163,184,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
  .badge { font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; background: rgba(20,184,166,0.15); color: #2dd4bf; border: 1px solid rgba(20,184,166,0.25); border-radius: 5px; padding: 2px 7px; }
  .expand-icon { font-size: 10px; color: rgba(148,163,184,0.3); transition: transform 0.2s; }
  .expand-icon.open { transform: rotate(180deg); }

  /* SHARE BUTTON */
  .card-actions {
    display: flex; gap: 8px; padding: 0 18px 14px; margin-top: -4px;
  }
  .share-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: rgba(226,232,240,0.6); cursor: pointer; transition: background 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .share-btn:active { background: rgba(20,184,166,0.1); color: #2dd4bf; border-color: rgba(20,184,166,0.2); }
  .share-btn.copied { color: #2dd4bf; border-color: rgba(20,184,166,0.2); }

  /* EXPANDED DETAILS */
  .card-details {
    padding: 14px 18px 16px; border-top: 1px solid rgba(255,255,255,0.05);
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  }
  .detail-block { }
  .detail-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: rgba(148,163,184,0.3); font-weight: 500; margin-bottom: 4px; }
  .detail-value { font-size: 13px; color: rgba(226,232,240,0.7); line-height: 1.5; }
  .detail-full { grid-column: 1 / -1; }

  /* LOADING */
  .loading { display: flex; flex-direction: column; align-items: center; padding: 50px 0; gap: 16px; }
  .spinner { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(20,184,166,0.15); border-top-color: #14b8a6; animation: spin 0.8s linear infinite; }
  .btn-spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: rgba(148,163,184,0.35); }

  /* STATES */
  .initial, .empty { text-align: center; padding: 50px 0 30px; }
  .state-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.3; }
  .state-title { font-size: 15px; font-weight: 500; color: rgba(226,232,240,0.35); margin-bottom: 6px; }
  .state-sub { font-size: 13px; color: rgba(148,163,184,0.25); }
  .error-box { padding: 16px 18px; border-radius: 14px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); font-size: 13px; color: rgba(252,165,165,0.75); text-align: center; }

  /* FOOTER */
  .footer { text-align: center; margin-top: 56px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
  .footer-name { font-size: 12.5px; color: rgba(226,232,240,0.4); margin-bottom: 4px; }
  .footer-name strong { color: rgba(226,232,240,0.7); font-weight: 500; }
  .footer-email { font-size: 11.5px; color: rgba(45,212,191,0.5); }

  /* MOBILE TWEAKS */
  @media (max-width: 480px) {
    .app { padding: 32px 16px 80px; }
    .title { font-size: 30px; }
    .logo-ring { width: 56px; height: 56px; }
    .logo-ring img { width: 38px; height: 38px; }
    .search-btn { padding: 0 14px; font-size: 13px; }
    .card-details { grid-template-columns: 1fr; }
    .detail-full { grid-column: 1; }
  }
`;

const MAX_HISTORY = 5;

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Medicine[] | null>(null);
  const [sort, setSort] = useState<string>("low");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestLoading, setSuggestLoading] = useState<boolean>(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<string>("");
  const [imageStatusType, setImageStatusType] = useState<"" | "success" | "error">("");
  const [identifyLoading, setIdentifyLoading] = useState<boolean>(false);

  const [history, setHistory] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // Load history from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("medifind_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const addToHistory = (q: string) => {
    setHistory(prev => {
      const updated = [q, ...prev.filter(h => h !== q)].slice(0, MAX_HISTORY);
      try { sessionStorage.setItem("medifind_history", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const fetchSuggestions = useCallback((q: string) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (q.trim().length < 2) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch("/api/suggest", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch { setSuggestions([]); }
      finally { setSuggestLoading(false); }
    }, 380);
  }, []);

  const sortResults = (data: Medicine[], s: string) =>
    [...data].sort((a, b) => s === "low" ? a.price - b.price : b.price - a.price);

  const searchMedicine = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim();
    if (!q) return;
    setLoading(true); setError(""); setResults(null);
    setShowSuggestions(false); setExpandedIndex(null);
    addToHistory(q);
    try {
      const res = await fetch("/api/medicine", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.error) setError("Something went wrong. Please try again.");
      else setResults(sortResults(data.results, sort));
    } catch { setError("Network error. Please check your connection."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (results && results.length > 0)
      setResults(prev => prev ? sortResults(prev, sort) : prev);
  }, [sort]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".search-wrap"))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") searchMedicine();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageStatus("Identifying medicine…");
      setImageStatusType("");
      setIdentifyLoading(true);
      try {
        const base64 = dataUrl.split(",")[1];
        const res = await fetch("/api/identify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.medicineName) {
          setImageStatus(`Identified: ${data.medicineName}`);
          setImageStatusType("success");
          setQuery(data.medicineName);
          await searchMedicine(data.medicineName);
        } else {
          setImageStatus("Couldn't identify. Try a clearer photo.");
          setImageStatusType("error");
        }
      } catch {
        setImageStatus("Error identifying image.");
        setImageStatusType("error");
      } finally { setIdentifyLoading(false); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const shareResult = async (m: Medicine, i: number) => {
    const text = `💊 ${m.name} (${m.salt})\n💰 ₹${m.price} — ${m.type}\n🏭 ${m.manufacturer}\n📋 ${m.uses}\n\nFound on MediFind`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "MediFind", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(i);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch {}
  };

  const cheapestPrice = results && results.length > 0
    ? Math.min(...results.map(r => r.price)) : null;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="container">

          {/* HEADER */}
          <div className="header">
            <div className="logo-ring">
              <img src="/logo.png" alt="MediFind" />
            </div>
            <div className="header-text">
              <h1 className="title">MediFind</h1>
              <p className="subtitle">Compare medicine prices instantly</p>
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <span className="disclaimer-text">Prices are approximate. Always consult a licensed pharmacist or doctor before purchasing or changing medication.</span>
          </div>

          {/* SEARCH */}
          <div className="search-wrap" ref={searchWrapRef}>
            <div className="search-row">
              <div className="input-shell">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text" value={query}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuery(val);
                    if (val === "") { setResults(null); setError(""); setSuggestions([]); }
                    else { fetchSuggestions(val); setShowSuggestions(true); }
                  }}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onKeyDown={handleKey}
                  placeholder="Search medicine or salt…"
                  className="search-input"
                  disabled={loading || identifyLoading}
                  autoComplete="off" autoCorrect="off" spellCheck="false"
                />
              </div>

              {/* CAMERA */}
              <button className="camera-btn" onClick={() => fileInputRef.current?.click()}
                title="Search by photo" disabled={loading || identifyLoading}>
                {identifyLoading
                  ? <span className="btn-spinner" />
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                }
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                style={{ display: "none" }} onChange={handleImageChange} />

              <button onClick={() => searchMedicine()} className="search-btn"
                disabled={loading || !query.trim() || identifyLoading}>
                {loading ? <><span className="btn-spinner" />…</> : "Search"}
              </button>
            </div>

            {/* SUGGESTIONS */}
            {showSuggestions && (suggestLoading || suggestions.length > 0) && (
              <div className="suggestions">
                {suggestLoading && suggestions.length === 0 && (
                  <div className="suggest-loading">Finding suggestions…</div>
                )}
                {suggestions.map((s, i) => (
                  <div key={i} className="suggestion-item" onMouseDown={() => {
                    setQuery(s); setShowSuggestions(false); searchMedicine(s);
                  }}>
                    <span className="suggestion-dot" />{s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IMAGE PREVIEW */}
          {imagePreview && (
            <div className="image-preview-wrap">
              <img src={imagePreview} className="image-preview" alt="Medicine" />
              <button className="remove-image" onClick={() => { setImagePreview(null); setImageStatus(""); }}>✕</button>
              {imageStatus && (
                <div className={`image-status ${imageStatusType}`}>
                  {imageStatusType === "success" ? "✓" : imageStatusType === "error" ? "✗" : "⟳"} {imageStatus}
                </div>
              )}
            </div>
          )}

          {/* SEARCH HISTORY */}
          {history.length > 0 && !loading && (
            <div className="history-row">
              <span className="history-label">Recent</span>
              {history.map((h, i) => (
                <button key={i} className="history-chip" onClick={() => {
                  setQuery(h); searchMedicine(h);
                }}>{h}</button>
              ))}
            </div>
          )}

          {/* CONTROLS */}
          <div className="controls">
            <span className="controls-label">Sort</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
          </div>

          <div className="divider" />

          {/* STATES */}
          {!loading && results === null && !error && (
            <div className="initial">
              <div className="state-icon">💊</div>
              <p className="state-title">Search any medicine</p>
              <p className="state-sub">Type a name, or tap 📷 to search by photo</p>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p className="loading-text">Finding best prices…</p>
            </div>
          )}

          {error && <div className="error-box">⚠️ {error}</div>}

          {!loading && results !== null && results.length === 0 && !error && (
            <div className="empty">
              <div className="state-icon">🔍</div>
              <p className="state-title">No results found</p>
              <p className="state-sub">Try a different name or spelling</p>
            </div>
          )}

          {/* RESULTS */}
          {!loading && results !== null && results.length > 0 && (
            <>
              <div className="results-meta">
                <span className="results-count">{results.length} result{results.length !== 1 ? "s" : ""}</span>
                <span className="ai-badge">✦ AI-powered</span>
              </div>
              <div className="results">
                {results.map((m, i) => (
                  <div key={i} className={`card${m.price === cheapestPrice ? " cheapest" : ""}`}>
                    <div className="card-main" onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                      <div className="card-left">
                        <div className="card-name">{m.name}</div>
                        <div className="card-salt">{m.salt}</div>
                        <div className="card-mfr">{m.manufacturer}</div>
                      </div>
                      <div className="card-right">
                        <div className="price-tag">₹{m.price}</div>
                        {m.price === cheapestPrice
                          ? <span className="badge">Best Price</span>
                          : <div className="type-tag">{m.type}</div>}
                        <div className={`expand-icon${expandedIndex === i ? " open" : ""}`}>▼</div>
                      </div>
                    </div>

                    {expandedIndex === i && (
                      <>
                        <div className="card-details">
                          {m.uses && (
                            <div className="detail-block detail-full">
                              <div className="detail-label">Uses</div>
                              <div className="detail-value">{m.uses}</div>
                            </div>
                          )}
                          {m.dosage && (
                            <div className="detail-block detail-full">
                              <div className="detail-label">Dosage</div>
                              <div className="detail-value">{m.dosage}</div>
                            </div>
                          )}
                          <div className="detail-block">
                            <div className="detail-label">Form</div>
                            <div className="detail-value">{m.type}</div>
                          </div>
                          <div className="detail-block">
                            <div className="detail-label">Manufacturer</div>
                            <div className="detail-value">{m.manufacturer}</div>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button className={`share-btn${copiedIndex === i ? " copied" : ""}`}
                            onClick={() => shareResult(m, i)}>
                            {copiedIndex === i ? "✓ Copied!" : "⤴ Share"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
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
