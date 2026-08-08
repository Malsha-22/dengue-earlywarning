"use client";

type Props = {
  tier: "Normal" | "Elevated" | null;
  confidence: number | null;
};

export default function RiskGauge({ tier, confidence }: Props) {
  const hasResult = tier !== null && confidence !== null;

  let needleAngle = 0;
  if (hasResult) {
    const magnitude = 30 + (confidence as number) * 60;
    needleAngle = tier === "Elevated" ? magnitude : -magnitude;
  }

  const color = tier === "Elevated" ? "#C23B22" : "#1B7A4C";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 240 140" width="240" height="140">
        <path d="M 20 120 A 100 100 0 0 1 120 20" fill="none" stroke="#DCFCE7" strokeWidth="14" strokeLinecap="round" />
        <path d="M 120 20 A 100 100 0 0 1 220 120" fill="none" stroke="#FEE2E2" strokeWidth="14" strokeLinecap="round" />
        <g style={{ transformOrigin: "120px 120px", transform: `rotate(${needleAngle}deg)`, transition: "transform 0.6s ease" }}>
          <line x1="120" y1="120" x2="120" y2="34" stroke={hasResult ? color : "#94a3b8"} strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="120" cy="120" r="8" fill={hasResult ? color : "#94a3b8"} />
        <text x="20" y="138" fontSize="11" fill="#64748b">NORMAL</text>
        <text x="175" y="138" fontSize="11" fill="#64748b">ELEVATED</text>
      </svg>
      {hasResult && (
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color }}>{tier}</div>
          <div className="text-xs text-slate-500 mt-1">{((confidence as number) * 100).toFixed(1)}% model confidence</div>
        </div>
      )}
    </div>
  );
}