"use client";

import { useEffect, useState } from "react";
import ButtonLoader from "@/components/ButtonLoader";
import FullscreenOverlay from "@/components/FullscreenOverlay";
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getIcon } from "@/lib/icons";

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
  let startDate: Date;
  let endDate: Date;

  if (period === "WEEKLY") {
    const day = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - day);
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
  const [form, setForm] = useState({
    amount: "",
    period: "MONTHLY" as Period,
    categoryId: "",
    startDate: getPeriodDates("MONTHLY").startDate,
    endDate: getPeriodDates("MONTHLY").endDate,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories"),
      fetch("/api/transactions?period=YEARLY"),
    ]);
    if (budgetsRes.ok) setBudgets(await budgetsRes.json());
    if (categoriesRes.ok) setCategories(await categoriesRes.json());
    if (transactionsRes.ok) setTransactions(await transactionsRes.json());
    setLoading(false);
  };

  const resetForm = () => {
    const dates = getPeriodDates("MONTHLY");
    setForm({ amount: "", period: "MONTHLY", categoryId: "", ...dates });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handlePeriodChange = (period: Period) => {
    const dates = getPeriodDates(period);
    setForm({ ...form, period, ...dates });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const url = editingId ? `/api/budgets/${editingId}` : "/api/budgets";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    resetForm();
    fetchAll();
    setSubmitting(false);
  };

  const handleEdit = (budget: Budget) => {
    setForm({
      amount: budget.amount.toString(),
      period: budget.period,
      categoryId: budget?.category?.id || "",
      startDate: new Date(budget.startDate).toISOString().split("T")[0],
      endDate: new Date(budget.endDate).toISOString().split("T")[0],
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return;
    setDeleteId(id);
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchAll();
  };

  const getSpent = (budget: Budget) => {
    return transactions
      .filter((t) => {
        if (t.type !== "EXPENSE") return false;
        if (budget.category) return t.categoryId === budget.category.id;
        return true; // no category = count all expenses
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            + New Budget
          </button>
        }
      />

      <div className="max-w-2xl mx-auto p-6 space-y-4">
        {showForm && (
          <FormCard title={editingId ? "Edit Budget" : "New Budget"}>
            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePeriodChange(p)}
                      className={`flex-1 py-2.5 text-sm font-medium transition ${
                        form.period === p
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-gray-400">(optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, categoryId: "" })}
                    className={`py-2 px-3 rounded-xl text-sm border transition ${
                      form.categoryId === ""
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    None
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, categoryId: cat.id })}
                      className={`py-2 px-3 rounded-xl text-sm border transition flex items-center gap-1.5 ${
                        form.categoryId === cat.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {cat.icon && <span>{getIcon(cat.icon)}</span>}
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <ButtonLoader
                  loading={submitting}
                  label={editingId ? "Save Changes" : "Create Budget"}
                />
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </FormCard>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
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
                  className="bg-white rounded-2xl shadow-sm p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{
                          backgroundColor:
                            (budget.category?.color ?? "#6366f1") + "33",
                        }}
                      >
                        {getIcon(budget.category?.icon ?? "general")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {budget.category?.name ?? "General Budget"}
                        </p>
                        <p className="text-xs text-gray-400">
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
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        disabled={deleteId === budget.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Spent: {fmt(spent)}</span>
                      <span>Budget: {fmt(budget.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver
                            ? "bg-red-500"
                            : percent > 80
                              ? "bg-yellow-400"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span
                        className={
                          isOver ? "text-red-500 font-medium" : "text-gray-400"
                        }
                      >
                        {isOver
                          ? `Over by ${fmt(spent - budget.amount)}`
                          : `${fmt(budget.amount - spent)} remaining`}
                      </span>
                      <span
                        className={isOver ? "text-red-500" : "text-gray-400"}
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
