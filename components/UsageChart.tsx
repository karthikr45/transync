"use client";

import { Session } from "@/lib/mock-data";

export default function UsageChart({ sessions, threshold = 4 }: { sessions: Session[]; threshold?: number }) {
  const max = Math.max(...sessions.map((s) => s.hours), 10);
  const w = 600;
  const h = 180;
  const pad = 24;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const stepX = innerW / Math.max(sessions.length - 1, 1);

  const points = sessions
    .map((s, i) => {
      const x = pad + i * stepX;
      const y = pad + innerH - (s.hours / max) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  const thresholdY = pad + innerH - (threshold / max) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e2e8f0" />
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e2e8f0" />
      <line
        x1={pad}
        y1={thresholdY}
        x2={w - pad}
        y2={thresholdY}
        stroke="#f59e0b"
        strokeDasharray="4 4"
        strokeWidth={1}
      />
      <text x={w - pad} y={thresholdY - 4} textAnchor="end" fontSize="10" fill="#b45309">
        {threshold}h compliance
      </text>
      <polyline points={points} fill="none" stroke="#2563eb" strokeWidth={2} />
      {sessions.map((s, i) => {
        const x = pad + i * stepX;
        const y = pad + innerH - (s.hours / max) * innerH;
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#2563eb" />;
      })}
    </svg>
  );
}
