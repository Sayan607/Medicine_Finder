// app/components/cautionscale.tsx
type Props = {
  score: number;
  verdict: string;
  reason: string;
  keyPoints: string[];
};

export default function CautionScale({ score, verdict, reason, keyPoints }: Props) {
  const getTheme = () => {
    if (score <= 3) return { 
      text: "text-teal-700", bar: "bg-teal-500", dot: "bg-teal-500", 
      bg: "bg-white", border: "border-slate-100", accent: "bg-teal-50/50" 
    };
    if (score <= 6) return { 
      text: "text-amber-700", bar: "bg-amber-500", dot: "bg-amber-400", 
      bg: "bg-white", border: "border-slate-100", accent: "bg-amber-50/50" 
    };
    return { 
      text: "text-rose-700", bar: "bg-rose-500", dot: "bg-rose-500", 
      bg: "bg-white", border: "border-slate-100", accent: "bg-rose-50/50" 
    };
  };

  const t = getTheme();

  return (
    <div className={`rounded-[24px] border ${t.border} ${t.bg} overflow-hidden shadow-sm`}>
      
      {/* 🏆 Header Section (Matches Result Header) */}
      <div className={`p-5 border-b border-slate-50 flex justify-between items-center ${t.accent}`}>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Safety Verdict</span>
          <h3 className={`text-xl font-black ${t.text}`}>{verdict}</h3>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-black font-serif ${t.text}`}>{score}</span>
          <span className="text-slate-300 font-bold text-sm">/10</span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 🏆 The Scale (Clean & Integrated) */}
        <div className="space-y-2">
          <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full ${t.bar} transition-all duration-1000`}
              style={{ width: `${score * 10}%` }}
            />
          </div>
          <div className="flex justify-between px-0.5">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <div key={n} className={`w-0.5 h-1 rounded-full ${n === score ? t.dot : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        {/* 🏆 Analysis Reason */}
        <div className="space-y-4">
          <p className="text-[14px] text-slate-600 leading-relaxed font-medium italic">
            "{reason}"
          </p>

          {/* 🏆 Key Findings (Matches the "Warnings" sub-cards style) */}
          <div className="grid gap-2">
            {keyPoints.map((point, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />
                <span className="text-[12.5px] font-semibold text-slate-700 leading-snug">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
