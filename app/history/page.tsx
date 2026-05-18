"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PeriodSelector, { DateRange } from "@/components/PeriodSelector";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getIcon } from "@/lib/icons";

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string | null;
  date: string;
  category: { name: string; icon: string | null; color: string | null } | null;
};

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    type: "preset",
    period: "MONTHLY",
  });
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    setLoading(true);
    let url = "/api/transactions?";
    if (
      dateRange.type === "custom" &&
      dateRange.startDate &&
      dateRange.endDate
    ) {
      url += `startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    } else {
      url += `period=${dateRange.period}`;
    }
    const res = await fetch(url);
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
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
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

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <PeriodSelector value={dateRange} onChange={setDateRange} />

        {/* Filter */}
        <div className="flex gap-2">
          {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer"
              style={{
                backgroundColor:
                  filter === f
                    ? f === "INCOME"
                      ? "#10b981"
                      : f === "EXPENSE"
                        ? "#ef4444"
                        : "var(--active-bg)"
                    : "var(--bg-card)",
                color: filter === f ? "var(--text)" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
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
              {/* Date header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  {date}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
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

              <div
                className="rounded-2xl shadow-sm overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {items.map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-3 active:opacity-70"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {/* Icon */}
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        backgroundColor: t.category?.color ?? "#6366f1",
                      }}
                    >
                      {getIcon(t.category?.icon ?? null)}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {t.category?.name ?? "Uncategorized"}
                      </p>
                      {t.note && (
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {t.note}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <p
                      className={`text-sm font-semibold flex-shrink-0 ${t.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {fmt(t.amount)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() =>
                          router.push(`/transactions/${t.id}/edit`)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition cursor-pointer"
                        style={{ color: "var(--text-muted)" }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deleteId === t.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition cursor-pointer disabled:opacity-50"
                        style={{ color: "var(--text-muted)" }}
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
