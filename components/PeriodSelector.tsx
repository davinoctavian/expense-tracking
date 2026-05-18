"use client";

import { useState } from "react";

const PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
export type Period = (typeof PERIODS)[number];

export type DateRange = {
  type: "preset" | "custom";
  period?: Period;
  startDate?: string;
  endDate?: string;
};

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export default function PeriodSelector({ value, onChange }: Props) {
  const [showCustom, setShowCustom] = useState(value.type === "custom");
  const [customStart, setCustomStart] = useState(value.startDate ?? "");
  const [customEnd, setCustomEnd] = useState(value.endDate ?? "");

  const handlePreset = (period: Period) => {
    setShowCustom(false);
    onChange({ type: "preset", period });
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;
    if (customStart > customEnd) {
      alert("Start date must be before end date");
      return;
    }
    onChange({ type: "custom", startDate: customStart, endDate: customEnd });
  };

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    fontSize: "14px",
  };

  return (
    <div className="space-y-2">
      {/* Period buttons */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
            style={{
              backgroundColor:
                value.type === "preset" && value.period === p
                  ? "#2563eb"
                  : "var(--bg-card)",
              color:
                value.type === "preset" && value.period === p
                  ? "white"
                  : "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}

        {/* Custom button */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
          style={{
            backgroundColor:
              value.type === "custom" ? "#2563eb" : "var(--bg-card)",
            color: value.type === "custom" ? "white" : "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          📅 Custom
          {value.type === "custom" && value.startDate && value.endDate && (
            <span className="text-xs opacity-80">
              {new Date(value.startDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
              {" – "}
              {new Date(value.endDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </button>
      </div>

      {/* Custom date range picker */}
      {showCustom && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Custom Date Range
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                From
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full appearance-none box-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-xs mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                To
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full appearance-none box-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Last 7 days", days: 7 },
              { label: "Last 30 days", days: 30 },
              { label: "Last 90 days", days: 90 },
              { label: "This year", days: 0, thisYear: true },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  if (preset.thisYear) {
                    start.setMonth(0, 1);
                  } else {
                    start.setDate(start.getDate() - preset.days);
                  }
                  const s = start.toISOString().split("T")[0];
                  const e = end.toISOString().split("T")[0];
                  setCustomStart(s);
                  setCustomEnd(e);
                  onChange({ type: "custom", startDate: s, endDate: e });
                }}
                className="px-3 py-1 rounded-full text-xs transition cursor-pointer"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCustomApply}
            disabled={!customStart || !customEnd}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "#2563eb", color: "white" }}
          >
            Apply Range
          </button>
        </div>
      )}
    </div>
  );
}
