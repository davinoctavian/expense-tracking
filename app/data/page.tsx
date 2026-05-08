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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="My Data" backHref="/" />

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Summary Tab */}
            {activeTab === "summary" && summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">Total Balance</p>
                    <p
                      className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {fmt(summary.balance)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">
                      Total Transactions
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.totalTransactions}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">
                      All-time Income
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {fmt(summary.totalIncome)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">
                      All-time Expenses
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {fmt(summary.totalExpense)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">Categories</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.totalCategories}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">Budgets</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.totalBudgets}
                    </p>
                  </div>
                </div>
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
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Note</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                              {new Date(t.date).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5">
                                {getIcon(t.category?.icon ?? null)}
                                <span className="text-gray-700">
                                  {t.category?.name ?? "Uncategorized"}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 max-w-[150px] truncate">
                              {t.note ?? "-"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  t.type === "INCOME"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-semibold ${
                                t.type === "INCOME"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
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
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Icon</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Color</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No categories yet
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50">
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
                          <td className="px-4 py-3 font-medium text-gray-700">
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
                              <span className="text-gray-400 text-xs">
                                {cat.color ?? "-"}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href="/categories"
                              className="text-xs text-blue-600 hover:underline"
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
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-left">Date Range</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {budgets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No budgets yet
                        </td>
                      </tr>
                    ) : (
                      budgets.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5">
                              <span>
                                {getIcon(b.category?.icon ?? "general")}
                              </span>
                              <span className="text-gray-700">
                                {b.category?.name ?? "General"}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {b.period.charAt(0) +
                                b.period.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(b.startDate).toLocaleDateString("id-ID")}{" "}
                            – {new Date(b.endDate).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
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
