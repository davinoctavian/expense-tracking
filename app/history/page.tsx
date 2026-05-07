"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PeriodSelector from "@/components/PeriodSelector";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string | null;
  date: string;
  category: { name: string; icon: string | null; color: string | null } | null;
};

const PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
type Period = (typeof PERIODS)[number];

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<Period>("MONTHLY");
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [period]);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?period=${period}`);
    if (res.ok) setTransactions(await res.json());
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    setDeleteId(id);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchTransactions();
  };

  const filtered = transactions.filter((t) =>
    filter === "ALL" ? true : t.type === filter,
  );

  // Group by date
  const grouped = filtered.reduce((acc: Record<string, Transaction[]>, t) => {
    const date = new Date(t.date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        title="Transaction History"
        backHref="/"
        actions={
          <Link
            href="/transactions/add"
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            + Add
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <PeriodSelector value={period} onChange={setPeriod} />

        <div className="flex gap-2">
          {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filter === f
                  ? f === "INCOME"
                    ? "bg-green-500 text-white"
                    : f === "EXPENSE"
                      ? "bg-red-500 text-white"
                      : "bg-gray-800 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message="No transactions found"
            actionLabel="Add your first transaction"
            actionHref="/transactions/add"
          />
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {date}
                </p>
                <p className="text-xs text-gray-400">
                  {items.reduce(
                    (sum, t) =>
                      t.type === "INCOME" ? sum + t.amount : sum - t.amount,
                    0,
                  ) >= 0
                    ? "+"
                    : ""}
                  {fmt(
                    items.reduce(
                      (sum, t) =>
                        t.type === "INCOME" ? sum + t.amount : sum - t.amount,
                      0,
                    ),
                  )}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
                {items.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xl">{t.category?.icon ?? "💰"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {t.category?.name ?? "Uncategorized"}
                      </p>
                      {t.note && (
                        <p className="text-xs text-gray-400 truncate">
                          {t.note}
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        t.type === "INCOME" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {fmt(t.amount)}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          router.push(`/transactions/${t.id}/edit`)
                        }
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deleteId === t.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
