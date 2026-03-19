type Props = {
    score: number;
    verdict: string;
    reason: string;
    keyPoints: string[];
  };
  
  export default function CautionScale({ score, verdict, reason, keyPoints }: Props) {
    const getColor = () => {
      if (score <= 3) return { bar: "bg-green-500", text: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
      if (score <= 6) return { bar: "bg-yellow-400", text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
      return { bar: "bg-red-500", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    };
  
    const c = getColor();
    const emoji = score <= 3 ? "✅" : score <= 6 ? "⚠️" : "🚫";
  
    return (
      <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 mt-4`}>
  
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg">{emoji} {verdict}</span>
          <span className={`font-bold text-2xl ${c.text}`}>{score}/10</span>
        </div>
  
        {/* Scale Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full mb-1 relative">
          <div
            className={`h-3 rounded-full ${c.bar} transition-all`}
            style={{ width: `${score * 10}%` }}
          />
        </div>
  
        {/* Tick marks */}
        <div className="flex justify-between mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <span
              key={n}
              className={`text-[9px] ${n === score ? c.text + " font-bold" : "text-gray-400"}`}
            >
              {n}
            </span>
          ))}
        </div>
  
        {/* Legend */}
        <div className="flex gap-3 text-xs mt-2 mb-4">
          <span className="text-green-600">● 1-3 Safe</span>
          <span className="text-yellow-500">● 4-6 Caution</span>
          <span className="text-red-500">● 7-10 Avoid</span>
        </div>
  
        {/* Reason */}
        <p className="text-sm text-gray-700 mb-3">{reason}</p>
  
        {/* Key Points */}
        <div className="space-y-2">
          {keyPoints.map((point, i) => (
            <div key={i} className={`flex gap-2 text-sm font-medium ${c.text}`}>
              <span>•</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
  
      </div>
    );
  }
  