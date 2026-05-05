"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import LogoutButton from "@/components/LogoutButton";

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<Period>("MONTHLY");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [period]);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?period=${period}`);
    if (res.ok) {
      const data = await res.json();
      setTransactions(data);
    }
    setLoading(false);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Group expenses by category for pie chart
  const categoryData = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc: { name: string; value: number }[], t) => {
      const name = t.category?.name ?? "Uncategorized";
      const existing = acc.find((a) => a.name === name);
      if (existing) existing.value += t.amount;
      else acc.push({ name, value: t.amount });
      return acc;
    }, []);

  const fmt = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">💸 Expenses</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Hi, {session?.user?.name}
          </span>
          <Link
            href="/transactions/add"
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            + Add
          </Link>
          <Link
            href="/history"
            className="text-sm text-gray-600 hover:underline"
          >
            History
          </Link>
          <Link
            href="/budgets"
            className="text-sm text-gray-600 hover:underline"
          >
            Budgets
          </Link>
          <Link
            href="/categories"
            className="text-sm text-gray-600 hover:underline"
          >
            Categories
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Balance</p>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-500"}`}
            >
              {fmt(balance)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Income</p>
            <p className="text-2xl font-bold text-green-600">
              {fmt(totalIncome)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Expenses</p>
            <p className="text-2xl font-bold text-red-500">
              {fmt(totalExpense)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
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
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => fmt(Number(val))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">
                No expenses yet
              </p>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Transactions
              </h2>
              <Link
                href="/history"
                className="text-xs text-blue-600 hover:underline"
              >
                See all
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-12">
                Loading...
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-12">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {transactions.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {t.category?.icon ?? "💰"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {t.category?.name ?? "Uncategorized"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(t.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${t.type === "INCOME" ? "text-green-600" : "text-red-500"}`}
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
