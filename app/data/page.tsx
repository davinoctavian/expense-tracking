"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { getIcon } from "@/lib/icons";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};
type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string | null;
  date: string;
  category: Category | null;
};
type Budget = {
  id: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  category: Category | null;
};
type Summary = {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalCategories: number;
  totalBudgets: number;
};
type Tab = "summary" | "transactions" | "categories" | "budgets";

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DataPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/summary")
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setTransactions(data.transactions);
        setCategories(data.categories);
        setBudgets(data.budgets);
        setLoading(false);
      });
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.category?.name.toLowerCase().includes(q) ||
      t.note?.toLowerCase().includes(q) ||
      t.amount.toString().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "summary", label: "Summary" },
    { key: "transactions", label: "Transactions", count: transactions.length },
    { key: "categories", label: "Categories", count: categories.length },
    { key: "budgets", label: "Budgets", count: budgets.length },
  ];

  const thStyle = {
    color: "var(--text-muted)",
    backgroundColor: "var(--bg)",
    borderBottom: "1px solid var(--border)",
  };

  const tdMuted = { color: "var(--text-muted)" };
  const tdText = { color: "var(--text)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar title="Summary" backHref="/" />

      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div
              className="flex gap-1 rounded-xl p-1 shadow-sm overflow-x-auto"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                  style={
                    activeTab === tab.key
                      ? { backgroundColor: "#2563eb", color: "white" }
                      : {
                          color: "var(--text-muted)",
                          backgroundColor: "transparent",
                        }
                  }
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={
                        activeTab === tab.key
                          ? { backgroundColor: "#1d4ed8", color: "white" }
                          : {
                              backgroundColor: "var(--bg)",
                              color: "var(--text-muted)",
                            }
                      }
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Summary Tab */}
            {activeTab === "summary" && summary && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Total Balance",
                    value: fmt(summary.balance),
                    color: summary.balance >= 0 ? "#10b981" : "#ef4444",
                  },
                  {
                    label: "Total Transactions",
                    value: summary.totalTransactions,
                    color: "var(--text)",
                  },
                  {
                    label: "All-time Income",
                    value: fmt(summary.totalIncome),
                    color: "#10b981",
                  },
                  {
                    label: "All-time Expenses",
                    value: fmt(summary.totalExpense),
                    color: "#ef4444",
                  },
                  {
                    label: "Categories",
                    value: summary.totalCategories,
                    color: "var(--text)",
                  },
                  {
                    label: "Budgets",
                    value: summary.totalBudgets,
                    color: "var(--text)",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl p-5 shadow-sm"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p className="text-xs mb-1" style={tdMuted}>
                      {card.label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: card.color }}
                    >
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by category, note, amount..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                  }}
                />
                <div
                  className="rounded-2xl shadow-sm overflow-x-auto"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Date", "Category", "Note", "Type", "Amount"].map(
                          (h) => (
                            <th
                              key={h}
                              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === "Amount" ? "text-right" : "text-left"}`}
                              style={thStyle}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center"
                            style={tdMuted}
                          >
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t, i) => (
                          <tr
                            key={t.id}
                            style={{
                              borderTop:
                                i > 0 ? "1px solid var(--border)" : "none",
                            }}
                          >
                            <td
                              className="px-4 py-3 whitespace-nowrap"
                              style={tdMuted}
                            >
                              {new Date(t.date).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5">
                                <span>{getIcon(t.category?.icon ?? null)}</span>
                                <span style={tdText}>
                                  {t.category?.name ?? "Uncategorized"}
                                </span>
                              </span>
                            </td>
                            <td
                              className="px-4 py-3 max-w-[150px] truncate"
                              style={tdMuted}
                            >
                              {t.note ?? "-"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={
                                  t.type === "INCOME"
                                    ? {
                                        backgroundColor: "#dcfce7",
                                        color: "#15803d",
                                      }
                                    : {
                                        backgroundColor: "#fee2e2",
                                        color: "#b91c1c",
                                      }
                                }
                              >
                                {t.type}
                              </span>
                            </td>
                            <td
                              className="px-4 py-3 text-right font-semibold"
                              style={{
                                color:
                                  t.type === "INCOME" ? "#10b981" : "#ef4444",
                              }}
                            >
                              {t.type === "INCOME" ? "+" : "-"}
                              {fmt(t.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div
                className="rounded-2xl shadow-sm overflow-x-auto"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {["Icon", "Name", "Color", "Actions"].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === "Actions" ? "text-right" : "text-left"}`}
                          style={thStyle}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center"
                          style={tdMuted}
                        >
                          No categories yet
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat, i) => (
                        <tr
                          key={cat.id}
                          style={{
                            borderTop:
                              i > 0 ? "1px solid var(--border)" : "none",
                          }}
                        >
                          <td className="px-4 py-3">
                            <span
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                              style={{
                                backgroundColor:
                                  (cat.color ?? "#6366f1") + "33",
                              }}
                            >
                              {getIcon(cat.icon ?? null)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium" style={tdText}>
                            {cat.name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: cat.color ?? "#6366f1",
                                }}
                              />
                              <span className="text-xs" style={tdMuted}>
                                {cat.color ?? "-"}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href="/categories"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Budgets Tab */}
            {activeTab === "budgets" && (
              <div
                className="rounded-2xl shadow-sm overflow-x-auto"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {["Category", "Period", "Date Range", "Amount"].map(
                        (h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === "Amount" ? "text-right" : "text-left"}`}
                            style={thStyle}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center"
                          style={tdMuted}
                        >
                          No budgets yet
                        </td>
                      </tr>
                    ) : (
                      budgets.map((b, i) => (
                        <tr
                          key={b.id}
                          style={{
                            borderTop:
                              i > 0 ? "1px solid var(--border)" : "none",
                          }}
                        >
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5">
                              <span>{getIcon(b.category?.icon ?? null)}</span>
                              <span style={tdText}>
                                {b.category?.name ?? "General"}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: "#dbeafe",
                                color: "#1d4ed8",
                              }}
                            >
                              {b.period.charAt(0) +
                                b.period.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={tdMuted}>
                            {new Date(b.startDate).toLocaleDateString("id-ID")}{" "}
                            – {new Date(b.endDate).toLocaleDateString("id-ID")}
                          </td>
                          <td
                            className="px-4 py-3 text-right font-semibold"
                            style={tdText}
                          >
                            {fmt(b.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
