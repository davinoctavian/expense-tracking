"use client";

import { useEffect, useState } from "react";
import { getIcon } from "@/lib/icons";
import LoadingSpinner from "./LoadingSpinner";
import SummaryCard from "./SummaryCard";

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
type UserData = {
  id: string;
  name: string;
  username: string;
  createdAt: string;
};

type Tab = "summary" | "transactions" | "categories" | "budgets";

type Props = {
  userId: string;
  userName: string;
  onClose: () => void;
};

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function SpyModal({ userId, userName, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [user, setUser] = useState<UserData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/admin/users/${userId}/transactions`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setSummary(data.summary);
        setTransactions(data.transactions);
        setCategories(data.categories);
        setBudgets(data.budgets);
        setLoading(false);
      });
  }, [userId]);

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
  const tdText = { color: "var(--text)" };
  const tdMuted = { color: "var(--text-muted)" };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔍</span>
            <div>
              <p className="font-semibold" style={{ color: "var(--text)" }}>
                {userName}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                @{user?.username} · Joined{" "}
                {user
                  ? new Date(user.createdAt).toLocaleDateString("id-ID")
                  : "..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition cursor-pointer"
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div
              className="flex gap-1 p-2 flex-shrink-0 overflow-x-auto"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
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

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-4">
              {/* Summary */}
              {activeTab === "summary" && summary && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Balance",
                      value: summary.balance,
                      color: summary.balance >= 0 ? "#10b981" : "#ef4444",
                    },
                    {
                      label: "Total Income",
                      value: summary.totalIncome,
                      color: "#10b981",
                    },
                    {
                      label: "Total Expenses",
                      value: summary.totalExpense,
                      color: "#ef4444",
                    },
                    {
                      label: "Transactions",
                      value: summary.totalTransactions,
                      color: "var(--text)",
                      isCurrency: false,
                    },
                    {
                      label: "Categories",
                      value: summary.totalCategories,
                      color: "var(--text)",
                      isCurrency: false,
                    },
                    {
                      label: "Budgets",
                      value: summary.totalBudgets,
                      color: "var(--text)",
                      isCurrency: false,
                    },
                  ].map((card) => (
                    <SummaryCard
                      key={card.label}
                      label={card.label}
                      value={Number(card.value)}
                      color={card.color}
                      isCurrency={card.isCurrency ?? true}
                    />
                  ))}
                </div>
              )}

              {/* Transactions */}
              {activeTab === "transactions" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <div
                    className="rounded-2xl overflow-x-auto"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          {["Date", "Category", "Note", "Type", "Amount"].map(
                            (h) => (
                              <th
                                key={h}
                                className={`px-4 py-3 text-xs font-semibold uppercase ${h === "Amount" ? "text-right" : "text-left"}`}
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
                                  <span>
                                    {getIcon(t.category?.icon ?? null)}
                                  </span>
                                  <span style={tdText}>
                                    {t.category?.name ?? "Uncategorized"}
                                  </span>
                                </span>
                              </td>
                              <td
                                className="px-4 py-3 max-w-[120px] truncate"
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

              {/* Categories */}
              {activeTab === "categories" && (
                <div
                  className="rounded-2xl overflow-x-auto"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Icon", "Name", "Color"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-xs font-semibold uppercase text-left"
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
                            colSpan={3}
                            className="px-4 py-8 text-center"
                            style={tdMuted}
                          >
                            No categories
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
                                  backgroundColor: cat.color ?? "#6366f1",
                                }}
                              >
                                {getIcon(cat.icon ?? null)}
                              </span>
                            </td>
                            <td
                              className="px-4 py-3 font-medium"
                              style={tdText}
                            >
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Budgets */}
              {activeTab === "budgets" && (
                <div
                  className="rounded-2xl overflow-x-auto"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Category", "Period", "Date Range", "Amount"].map(
                          (h) => (
                            <th
                              key={h}
                              className={`px-4 py-3 text-xs font-semibold uppercase ${h === "Amount" ? "text-right" : "text-left"}`}
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
                            No budgets
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
                              {new Date(b.startDate).toLocaleDateString(
                                "id-ID",
                              )}{" "}
                              –{" "}
                              {new Date(b.endDate).toLocaleDateString("id-ID")}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
