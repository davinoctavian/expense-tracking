"use client";

import { useEffect, useState } from "react";
import ButtonLoader from "@/components/ButtonLoader";
import FullscreenOverlay from "@/components/FullscreenOverlay";
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import TransferSurplusModal from "@/components/TransferSurplusModal";
import IncomeAllocationInfo from "@/components/IncomeAllocationInfo";
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
  surplus: number;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate: string;
  categoryId: string | null;
  category: Category | null;
  spent: number;
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transferBudget, setTransferBudget] = useState<Budget | null>(null);
  const [endedIncome, setEndedIncome] = useState(0);
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
    const [b, c] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories"),
    ]);
    if (b.ok) {
      const budgetData = await b.json();
      setBudgets(budgetData);

      // Calculate income for ended budgets range
      const endedBudgets = budgetData.filter(
        (bud: Budget) => new Date(bud.endDate) < new Date(),
      );
      if (endedBudgets.length > 0) {
        const minStart = endedBudgets.reduce(
          (min: string, bud: Budget) =>
            bud.startDate < min ? bud.startDate : min,
          endedBudgets[0].startDate,
        );
        const maxEnd = endedBudgets.reduce(
          (max: string, bud: Budget) => (bud.endDate > max ? bud.endDate : max),
          endedBudgets[0].endDate,
        );
        const incomeRes = await fetch(
          `/api/budgets/allocation?startDate=${minStart.split("T")[0]}&endDate=${maxEnd.split("T")[0]}`,
        );
        if (incomeRes.ok) {
          const incomeData = await incomeRes.json();
          setEndedIncome(incomeData.income);
        }
      }
    }
    if (c.ok) setCategories(await c.json());
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

  const now = new Date();
  const active = budgets.filter(
    (b) => new Date(b.startDate) <= now && new Date(b.endDate) >= now,
  );
  const upcoming = budgets.filter((b) => new Date(b.startDate) > now);
  const ended = budgets.filter((b) => new Date(b.endDate) < now);

  // Overall summary from active budgets
  const totalBudget = active.reduce((sum, b) => sum + b.amount + b.surplus, 0);
  const totalSpent = active.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Overall summary from ended budgets
  const totalBudgetEnded = ended.reduce(
    (sum, b) => sum + b.amount + b.surplus,
    0,
  );
  const totalSpentEnded = ended.reduce((sum, b) => sum + b.spent, 0);
  const totalRemainingEnded = totalBudgetEnded - totalSpentEnded;

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };
  const labelStyle = { color: "var(--text)" };
  const mutedStyle = { color: "var(--text-muted)" };

  const BudgetCard = ({ budget }: { budget: Budget }) => {
    const total = budget.amount + budget.surplus;
    const percent = Math.min((budget.spent / total) * 100, 100);
    const isOver = budget.spent > total;
    const surplus = total - budget.spent;
    const isEnded = new Date(budget.endDate) < now;
    const hasSurplus = isEnded && surplus > 0;

    return (
      <div
        className="rounded-2xl shadow-sm p-4 md:p-5"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{
                backgroundColor: (budget.category?.color ?? "#6366f1") + "33",
              }}
            >
              {getIcon(budget.category?.icon ?? null)}
            </span>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text)" }}
              >
                {budget.category?.name ?? "General Budget"}
              </p>
              <p className="text-xs" style={mutedStyle}>
                {budget.period.charAt(0) + budget.period.slice(1).toLowerCase()}{" "}
                · {new Date(budget.startDate).toLocaleDateString("id-ID")} –{" "}
                {new Date(budget.endDate).toLocaleDateString("id-ID")}
              </p>
              {budget.surplus > 0 && (
                <p className="text-xs text-green-500">
                  +{fmt(budget.surplus)} surplus transferred in
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {hasSurplus && (
              <button
                onClick={() => setTransferBudget(budget)}
                className="px-2 py-1 text-xs rounded-lg transition cursor-pointer"
                style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                title="Transfer surplus"
              >
                ↗ Transfer
              </button>
            )}
            {!isEnded && (
              <button
                onClick={() => handleEdit(budget)}
                className="p-1.5 rounded-lg transition cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                ✏️
              </button>
            )}
            <button
              onClick={() => handleDelete(budget.id)}
              disabled={deleteId === budget.id}
              className="p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
              style={{ color: "var(--text-muted)" }}
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs" style={mutedStyle}>
            <span>Spent: {fmt(budget.spent)}</span>
            <span>Budget: {fmt(total)}</span>
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
              className={
                isOver
                  ? "text-red-500 font-medium"
                  : hasSurplus
                    ? "text-green-500 font-medium"
                    : ""
              }
              style={!isOver && !hasSurplus ? mutedStyle : {}}
            >
              {isOver
                ? `Over by ${fmt(budget.spent - total)}`
                : isEnded
                  ? `Surplus: ${fmt(surplus)}`
                  : `${fmt(surplus)} remaining`}
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
  };

  const SectionLabel = ({ label, count }: { label: string; count: number }) => (
    <div className="flex items-center gap-2 mb-2">
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={mutedStyle}
      >
        {label}
      </p>
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: "var(--bg-card)",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
        }}
      >
        {count}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <FullscreenOverlay show={submitting} />

      {transferBudget && (
        <TransferSurplusModal
          budget={transferBudget}
          surplus={
            transferBudget.amount +
            transferBudget.surplus -
            transferBudget.spent
          }
          onClose={() => setTransferBudget(null)}
          onSuccess={fetchAll}
        />
      )}

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
            + New
          </button>
        }
      />

      <div className="max-w-2xl mx-auto p-4 md:p-6 pb-8 space-y-4">
        {/* Overall summary */}
        {!loading && active.length > 0 && (
          <div
            className="rounded-2xl p-4 md:p-5"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={mutedStyle}
            >
              Active Period Overview
            </p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-xs mb-0.5" style={mutedStyle}>
                  Total Budget
                </p>
                <p
                  className="text-base font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {fmt(totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={mutedStyle}>
                  Total Spent
                </p>
                <p className="text-base font-bold text-red-500">
                  {fmt(totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={mutedStyle}>
                  Remaining
                </p>
                <p
                  className={`text-base font-bold ${totalRemaining >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {fmt(totalRemaining)}
                </p>
              </div>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border)" }}
            >
              <div
                className={`h-full rounded-full transition-all ${totalSpent / totalBudget > 1 ? "bg-red-500" : totalSpent / totalBudget > 0.8 ? "bg-yellow-400" : "bg-green-500"}`}
                style={{
                  width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* New/Edit Form */}
        {showForm && (
          <FormCard title={editingId ? "Edit Budget" : "New Budget"}>
            <ErrorMessage message={error} />
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={labelStyle}
                >
                  Category <span style={mutedStyle}>(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "", name: "General", icon: null, color: null },
                    ...categories,
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, categoryId: cat.id })}
                      className="py-2 px-3 rounded-xl text-sm transition cursor-pointer flex items-center gap-2"
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
                      <span>{cat.id === "" ? "📊" : getIcon(cat.icon)}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={labelStyle}
                >
                  Amount
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={mutedStyle}
                  >
                    Rp
                  </span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      className="w-full box-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={inputStyle}
                      required
                    />
                  </div>
                ))}
              </div>

              {form.startDate && form.endDate && (
                <IncomeAllocationInfo
                  startDate={form.startDate}
                  endDate={form.endDate}
                  excludeBudgetId={editingId}
                />
              )}

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
            <div className="animate-spin w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-600" />
          </div>
        ) : budgets.length === 0 ? (
          <EmptyState
            message="No budgets yet"
            actionLabel="Create your first budget"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-6">
            {/* Active */}
            {active.length > 0 && (
              <div>
                <SectionLabel label="🟢 Active" count={active.length} />
                <div className="space-y-3">
                  {active.map((b) => (
                    <BudgetCard key={b.id} budget={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <SectionLabel label="🔵 Upcoming" count={upcoming.length} />
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <BudgetCard key={b.id} budget={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Ended */}
            {ended.length > 0 && (
              <div>
                <SectionLabel label="⚫ Ended" count={ended.length} />

                {/* Ended summary */}
                <div
                  className="rounded-2xl p-4 md:p-5 mb-4"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wide mb-3"
                    style={mutedStyle}
                  >
                    Ended Period Overview
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs mb-0.5" style={mutedStyle}>
                        Total Income
                      </p>
                      <p className="text-base font-bold text-green-500">
                        {fmt(endedIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={mutedStyle}>
                        Total Budgeted
                      </p>
                      <p
                        className="text-base font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {fmt(totalBudgetEnded)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={mutedStyle}>
                        Total Spent
                      </p>
                      <p className="text-base font-bold text-red-500">
                        {fmt(totalSpentEnded)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={mutedStyle}>
                        Surplus
                      </p>
                      <p
                        className={`text-base font-bold ${totalRemainingEnded >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {fmt(totalRemainingEnded)}
                      </p>
                    </div>
                  </div>

                  {/* Unallocated income */}
                  {endedIncome > 0 && endedIncome > totalBudgetEnded && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
                      style={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span>💡</span>
                      <span>
                        <span style={{ color: "var(--text)" }}>
                          {fmt(endedIncome - totalBudgetEnded)}
                        </span>{" "}
                        was earned but never allocated to any budget
                      </span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--border)" }}
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          totalSpentEnded / totalBudgetEnded > 1
                            ? "bg-red-500"
                            : totalSpentEnded / totalBudgetEnded > 0.8
                              ? "bg-yellow-400"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min((totalSpentEnded / totalBudgetEnded) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div
                      className="flex justify-between text-xs"
                      style={mutedStyle}
                    >
                      <span>
                        {Math.round((totalSpentEnded / totalBudgetEnded) * 100)}
                        % of budget used
                      </span>
                      <span>
                        {totalRemainingEnded >= 0
                          ? `${fmt(totalRemainingEnded)} surplus`
                          : `${fmt(Math.abs(totalRemainingEnded))} over budget`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {ended.map((b) => (
                    <BudgetCard key={b.id} budget={b} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
