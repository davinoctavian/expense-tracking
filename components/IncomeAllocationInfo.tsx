"use client";

import { useEffect, useState } from "react";

type Props = {
  startDate: string;
  endDate: string;
  excludeBudgetId?: string | null;
};

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function IncomeAllocationInfo({
  startDate,
  endDate,
  excludeBudgetId,
}: Props) {
  const [data, setData] = useState<{
    income: number;
    allocated: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;
    fetch(
      `/api/budgets/allocation?startDate=${startDate}&endDate=${endDate}&excludeId=${excludeBudgetId ?? ""}`,
    )
      .then((r) => r.json())
      .then(setData);
  }, [startDate, endDate, excludeBudgetId]);

  if (!data) return null;

  const percent =
    data.income > 0 ? Math.min((data.allocated / data.income) * 100, 100) : 0;
  const isOver = data.allocated > data.income;

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{
        backgroundColor: "var(--bg)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex justify-between text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>Income in period</span>
        <span className="font-medium text-green-500">{fmt(data.income)}</span>
      </div>
      <div
        className="flex justify-between text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>Already allocated</span>
        <span className="font-medium" style={{ color: "var(--text)" }}>
          {fmt(data.allocated)}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--border)" }}
      >
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : percent > 80 ? "bg-yellow-400" : "bg-green-500"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color: isOver ? "#ef4444" : "var(--text-muted)" }}>
          {isOver
            ? `Over allocated by ${fmt(data.allocated - data.income)}`
            : `${fmt(data.remaining)} available`}
        </span>
        <span style={{ color: "var(--text-muted)" }}>
          {Math.round(percent)}%
        </span>
      </div>
      {data.income === 0 && (
        <p className="text-xs text-yellow-600">
          ⚠️ No income in this period. Add income first.
        </p>
      )}
    </div>
  );
}
