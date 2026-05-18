"use client";

import { useEffect, useState } from "react";
import ButtonLoader from "@/components/ButtonLoader";
import FullscreenOverlay from "@/components/FullscreenOverlay";
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getIcon } from "@/lib/icons";
import IncomeAllocationInfo from "@/components/IncomeAllocationInfo";
import CurrencyInput from "@/components/CurrencyInput";

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
  categoryId: string | null;
  category: Category | null;
};
type Transaction = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryId: string | null;
};

const PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
type Period = (typeof PERIODS)[number];

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const getPeriodDates = (period: Period) => {
  const now = new Date();
  let startDate: Date, endDate: Date;
  if (period === "WEEKLY") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (period === "MONTHLY") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  }
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    period: "MONTHLY" as Period,
    categoryId: "",
    ...getPeriodDates("MONTHLY"),
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [b, c, t] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories"),
      fetch("/api/transactions?period=YEARLY"),
    ]);
    if (b.ok) setBudgets(await b.json());
    if (c.ok) setCategories(await c.json());
    if (t.ok) setTransactions(await t.json());
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      amount: "",
      period: "MONTHLY",
      categoryId: "",
      ...getPeriodDates("MONTHLY"),
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handlePeriodChange = (period: Period) =>
    setForm({ ...form, period, ...getPeriodDates(period) });

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const url = editingId ? `/api/budgets/${editingId}` : "/api/budgets";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    resetForm();
    fetchAll();
  };

  const handleEdit = (b: Budget) => {
    setForm({
      amount: b.amount.toString(),
      period: b.period,
      categoryId: b.category?.id ?? "",
      startDate: new Date(b.startDate).toISOString().split("T")[0],
      endDate: new Date(b.endDate).toISOString().split("T")[0],
    });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return;
    setDeleteId(id);
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchAll();
  };

  const getSpent = (budget: Budget) =>
    transactions
      .filter((t) => {
        if (t.type !== "EXPENSE") return false;
        if (budget.category) {
          return t.categoryId === budget.category.id;
        } else {
          return t.categoryId === null || t.categoryId === "";
        }
      })
      .reduce((sum, t) => sum + t.amount, 0);

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };
  const labelStyle = { color: "var(--text)" };
  const mutedStyle = { color: "var(--text-muted)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <FullscreenOverlay show={submitting} />
      <Navbar
        title="Budgets"
        backHref="/"
        actions={
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            + New Budget
          </button>
        }
      />

      <div className="max-w-2xl mx-auto p-4 md:p-6 pb-8 space-y-4">
        {form.startDate && form.endDate && (
          <IncomeAllocationInfo
            startDate={form.startDate}
            endDate={form.endDate}
            excludeBudgetId={editingId}
          />
        )}
        {showForm && (
          <FormCard title={editingId ? "Edit Budget" : "New Budget"}>
            <ErrorMessage message={error} />
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Period */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={labelStyle}
                >
                  Period
                </label>
                <div
                  className="flex rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePeriodChange(p)}
                      className="flex-1 py-2.5 text-sm font-medium transition cursor-pointer"
                      style={
                        form.period === p
                          ? { backgroundColor: "#2563eb", color: "white" }
                          : {
                              backgroundColor: "var(--bg-card)",
                              color: "var(--text-muted)",
                            }
                      }
                    >
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={labelStyle}
                >
                  Category <span style={mutedStyle}>(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "", name: "None", icon: null, color: null },
                    ...categories,
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, categoryId: cat.id })}
                      className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm transition cursor-pointer"
                      style={{
                        border:
                          form.categoryId === cat.id
                            ? "1px solid #3b82f6"
                            : "1px solid var(--border)",
                        backgroundColor:
                          form.categoryId === cat.id
                            ? "#eff6ff"
                            : "var(--bg-card)",
                        color:
                          form.categoryId === cat.id
                            ? "#1d4ed8"
                            : "var(--text)",
                      }}
                    >
                      {cat.icon && <span>{getIcon(cat.icon)}</span>}
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={labelStyle}
                >
                  Budget Amount
                </label>
                <CurrencyInput
                  value={form.amount}
                  onChange={(raw) => setForm({ ...form, amount: raw })}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                {(["startDate", "endDate"] as const).map((field) => (
                  <div key={field}>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={labelStyle}
                    >
                      {field === "startDate" ? "Start Date" : "End Date"}
                    </label>
                    <input
                      type="date"
                      value={form[field]}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                      className="w-full appearance-none box-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={inputStyle}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <ButtonLoader
                  loading={submitting}
                  label={editingId ? "Save Changes" : "Create Budget"}
                />
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl transition cursor-pointer"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </FormCard>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <ButtonLoader loading label="" />
          </div>
        ) : budgets.length === 0 ? (
          <EmptyState
            message="No budgets yet"
            actionLabel="Create your first budget"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-3">
            {budgets.map((budget) => {
              const spent = getSpent(budget);
              const percent = Math.min((spent / budget.amount) * 100, 100);
              const isOver = spent > budget.amount;
              return (
                <div
                  key={budget.id}
                  className="rounded-2xl shadow-sm p-5"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: budget.category?.color ?? "#6366f1",
                        }}
                      >
                        {getIcon(budget.category?.icon ?? null)}
                      </span>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {budget.category?.name ?? "General Budget"}
                        </p>
                        <p className="text-xs" style={mutedStyle}>
                          {budget.period.charAt(0) +
                            budget.period.slice(1).toLowerCase()}{" "}
                          ·{" "}
                          {new Date(budget.startDate).toLocaleDateString(
                            "id-ID",
                          )}{" "}
                          –{" "}
                          {new Date(budget.endDate).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-1.5 rounded-lg transition cursor-pointer"
                        style={mutedStyle}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        disabled={deleteId === budget.id}
                        className="p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                        style={mutedStyle}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className="flex justify-between text-xs"
                      style={mutedStyle}
                    >
                      <span>Spent: {fmt(spent)}</span>
                      <span>Budget: {fmt(budget.amount)}</span>
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
                      <span
                        className={isOver ? "text-red-500 font-medium" : ""}
                        style={!isOver ? mutedStyle : {}}
                      >
                        {isOver
                          ? `Over by ${fmt(spent - budget.amount)}`
                          : `${fmt(budget.amount - spent)} remaining`}
                      </span>
                      <span
                        className={isOver ? "text-red-500" : ""}
                        style={!isOver ? mutedStyle : {}}
                      >
                        {Math.round(percent)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
