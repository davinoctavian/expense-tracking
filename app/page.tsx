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
import PeriodSelector, { DateRange } from "@/components/PeriodSelector";
import { getIcon } from "@/lib/icons";
import { useSession } from "next-auth/react";
import SummaryCard from "@/components/SummaryCard";
import ExportButton from "@/components/ExportButton";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};
type Budget = {
  id: string;
  amount: number;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate: string;
  category: Category | null;
};
type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string | null;
  date: string;
  category: Category | null;
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

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    type: "preset",
    period: "MONTHLY",
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchAll();
  }, [dateRange]);

  const fetchAll = async () => {
    setLoading(true);
    const [tRes, bRes, cRes] = await Promise.all([
      fetch(buildUrl()),
      fetch("/api/budgets"),
      fetch("/api/categories"),
    ]);
    if (tRes.ok) setTransactions(await tRes.json());
    if (bRes.ok) setBudgets(await bRes.json());
    if (cRes.ok) setCategories(await cRes.json());
    setLoading(false);
  };

  const buildUrl = () => {
    if (
      dateRange.type === "custom" &&
      dateRange.startDate &&
      dateRange.endDate
    ) {
      return `/api/transactions?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }
    return `/api/transactions?period=${dateRange.period}`;
  };

  const getDateLabel = () => {
    if (
      dateRange.type === "custom" &&
      dateRange.startDate &&
      dateRange.endDate
    ) {
      return `${new Date(dateRange.startDate).toLocaleDateString("id-ID")} – ${new Date(dateRange.endDate).toLocaleDateString("id-ID")}`;
    }
    return dateRange.period ?? "Monthly";
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
          color: t.category?.color ?? "#6366f1",
        });
      return acc;
    }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar showUserLinks />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <PeriodSelector value={dateRange} onChange={setDateRange} />
          <ExportButton
            transactions={transactions}
            budgets={budgets}
            categories={categories}
            dateLabel={getDateLabel()}
            summary={{ totalIncome, totalExpense, balance }}
          />
        </div>

        {/* Summary Cards — 2 col on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <SummaryCard
            label="Balance"
            value={balance}
            color={balance >= 0 ? "#10b981" : "#ef4444"}
          />
          <SummaryCard label="Income" value={totalIncome} color="#10b981" />
          <SummaryCard label="Expenses" value={totalExpense} color="#ef4444" />
        </div>

        {/* Chart + Recent — stacked on mobile, side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Pie Chart */}
          <div
            className="rounded-2xl p-4 md:p-5 shadow-sm"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--text)" }}
            >
              Expenses by Category
            </h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
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
                      <span style={{ color: "var(--text)", fontSize: 12 }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p
                className="text-sm text-center py-10"
                style={{ color: "var(--text-muted)" }}
              >
                No expenses yet
              </p>
            )}
          </div>

          {/* Recent Transactions */}
          <div
            className="rounded-2xl p-4 md:p-5 shadow-sm"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                Recent
              </h2>
              <Link
                href="/history"
                className="text-xs text-blue-500 hover:underline"
              >
                See all
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : transactions.length === 0 ? (
              <p
                className="text-sm text-center py-10"
                style={{ color: "var(--text-muted)" }}
              >
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {transactions.slice(0, 8).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{
                          backgroundColor: t.category?.color ?? "#6366f1",
                        }}
                      >
                        {getIcon(t.category?.icon ?? null)}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium truncate"
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
                      className={`text-sm font-semibold flex-shrink-0 ${t.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
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

        {/* Quick actions — mobile only */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <Link
            href="/data"
            className="rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            <span className="text-2xl">📦</span>
            <span className="text-sm font-medium">My Data</span>
          </Link>
          <Link
            href="/admin"
            className="rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              visibility:
                session?.user.username !==
                process.env.NEXT_PUBLIC_SUPER_ADMIN_USERNAME
                  ? "hidden"
                  : "visible",
            }}
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
