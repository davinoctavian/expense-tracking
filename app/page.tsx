"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import PeriodSelector from "@/components/PeriodSelector";
import { getIcon } from "@/lib/icons";
import { useTheme } from "@/lib/ThemeContext";

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string | null;
  date: string;
  category: { name: string; icon: string | null; color: string | null } | null;
};

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];
const PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
type Period = (typeof PERIODS)[number];

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DashboardPage() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<Period>("MONTHLY");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [period]);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?period=${period}`);
    if (res.ok) setTransactions(await res.json());
    setLoading(false);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryData = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc: { name: string; value: number; color: string }[], t) => {
      const name = t.category?.name ?? "Uncategorized";
      const existing = acc.find((a) => a.name === name);
      if (existing) existing.value += t.amount;
      else
        acc.push({
          name,
          value: t.amount,
          color: t.category?.color ?? COLORS[acc.length % COLORS.length],
        });
      return acc;
    }, []);

  const legendStyle = { color: "var(--text)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar showUserLinks />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <PeriodSelector value={period} onChange={setPeriod} />

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Balance",
              value: fmt(balance),
              color: balance >= 0 ? "text-green-500" : "text-red-500",
            },
            {
              label: "Income",
              value: fmt(totalIncome),
              color: "text-green-500",
            },
            {
              label: "Expenses",
              value: fmt(totalExpense),
              color: "text-red-500",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <p
                className="text-sm mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {card.label}
              </p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--text)" }}
            >
              Expenses by Category
            </h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={_.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => fmt(Number(val))}
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={legendStyle}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p
                className="text-sm text-center py-12"
                style={{ color: "var(--text-muted)" }}
              >
                No expenses yet
              </p>
            )}
          </div>

          {/* Recent Transactions */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                Recent Transactions
              </h2>
              <Link
                href="/history"
                className="text-xs text-blue-500 hover:underline"
              >
                See all
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : transactions.length === 0 ? (
              <p
                className="text-sm text-center py-12"
                style={{ color: "var(--text-muted)" }}
              >
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {transactions.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getIcon(t.category?.icon ?? null)}
                      </span>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {t.category?.name ?? "Uncategorized"}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {new Date(t.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${t.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {fmt(t.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
