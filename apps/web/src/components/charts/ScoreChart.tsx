"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props {
  data: Array<{ eventId: string; score: number; status: string; createdAt: string }>;
}

export function ScoreChart({ data }: Props) {
  const chartData = data.map((d, i) => ({
    name: `#${i + 1}`,
    score: d.score,
    eventId: d.eventId,
    status: d.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#94a3b8" }}
          formatter={(v: number) => [`${v}%`, "Score"]}
        />
        <ReferenceLine y={80} stroke="#334155" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#0077cc"
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload } = props;
            const color = payload.status === "PASS" ? "#34d399" : payload.status === "FAIL" ? "#f87171" : "#fbbf24";
            return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={color} stroke="none" />;
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
