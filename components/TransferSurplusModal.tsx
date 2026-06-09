"use client";

import { useEffect, useState } from "react";
import { getIcon } from "@/lib/icons";
import ButtonLoader from "./ButtonLoader";
import ErrorMessage from "./ErrorMessage";

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
  period: string;
  startDate: string;
  endDate: string;
  spent: number;
  category: Category | null;
};

type Props = {
  budget: Budget;
  surplus: number;
  onClose: () => void;
  onSuccess: () => void;
};

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
type Period = (typeof PERIODS)[number];

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

export default function TransferSurplusModal({
  budget,
  surplus,
  onClose,
  onSuccess,
}: Props) {
  const [mode, setMode] = useState<"existing" | "new">("new");
  const [futureBudgets, setFutureBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newForm, setNewForm] = useState({
    amount: "",
    period: "MONTHLY" as Period,
    categoryId: budget.category?.id ?? "",
    ...getPeriodDates("MONTHLY"),
  });

  useEffect(() => {
    // Fetch future/active budgets
    fetch("/api/budgets")
      .then((r) => r.json())
      .then((data: Budget[]) => {
        const now = new Date();
        setFutureBudgets(
          data.filter((b) => b.id !== budget.id && new Date(b.endDate) >= now),
        );
      });

    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const handleTransfer = async () => {
    setLoading(true);
    setError("");

    const body =
      mode === "existing"
        ? { sourceBudgetId: budget.id, targetBudgetId: selectedBudgetId }
        : { sourceBudgetId: budget.id, newBudget: newForm };

    const res = await fetch("/api/budgets/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    onSuccess();
    onClose();
  };

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };

  const labelStyle = { color: "var(--text)" };
  const mutedStyle = { color: "var(--text-muted)" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="font-semibold" style={{ color: "var(--text)" }}>
              Transfer Surplus
            </p>
            <p className="text-xs" style={mutedStyle}>
              Available:{" "}
              <span className="text-green-500 font-medium">{fmt(surplus)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <ErrorMessage message={error} />

          {/* Source budget info */}
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{
                backgroundColor: (budget.category?.color ?? "#6366f1") + "33",
              }}
            >
              {getIcon(budget.category?.icon ?? null)}
            </span>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text)" }}
              >
                {budget.category?.name ?? "General Budget"}
              </p>
              <p className="text-xs" style={mutedStyle}>
                {new Date(budget.startDate).toLocaleDateString("id-ID")} –{" "}
                {new Date(budget.endDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-semibold text-green-500">
                {fmt(surplus)}
              </p>
              <p className="text-xs" style={mutedStyle}>
                surplus
              </p>
            </div>
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {(["existing", "new"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 text-sm font-medium transition cursor-pointer"
                style={
                  mode === m
                    ? { backgroundColor: "#2563eb", color: "white" }
                    : {
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-muted)",
                      }
                }
              >
                {m === "existing" ? "Existing Budget" : "Create New"}
              </button>
            ))}
          </div>

          {/* Existing budgets */}
          {mode === "existing" && (
            <div className="space-y-2">
              {futureBudgets.length === 0 ? (
                <p className="text-sm text-center py-4" style={mutedStyle}>
                  No active or upcoming budgets found.{" "}
                  <button
                    onClick={() => setMode("new")}
                    className="text-blue-500 underline cursor-pointer"
                  >
                    Create new instead
                  </button>
                </p>
              ) : (
                futureBudgets.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBudgetId(b.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition cursor-pointer"
                    style={{
                      border:
                        selectedBudgetId === b.id
                          ? "1px solid #3b82f6"
                          : "1px solid var(--border)",
                      backgroundColor:
                        selectedBudgetId === b.id
                          ? "#eff6ff"
                          : "var(--bg-card)",
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        backgroundColor:
                          (b.category?.color ?? "#6366f1") + "33",
                      }}
                    >
                      {getIcon(b.category?.icon ?? null)}
                    </span>
                    <div className="flex-1 text-left min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{
                          color:
                            selectedBudgetId === b.id
                              ? "#1d4ed8"
                              : "var(--text)",
                        }}
                      >
                        {b.category?.name ?? "General Budget"}
                      </p>
                      <p className="text-xs" style={mutedStyle}>
                        {new Date(b.startDate).toLocaleDateString("id-ID")} –{" "}
                        {new Date(b.endDate).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color:
                            selectedBudgetId === b.id
                              ? "#1d4ed8"
                              : "var(--text)",
                        }}
                      >
                        {fmt(b.amount)}
                      </p>
                      <p className="text-xs text-green-500">
                        +{fmt(surplus)} → {fmt(b.amount + surplus)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* New budget form */}
          {mode === "new" && (
            <div className="space-y-4">
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
                      onClick={() =>
                        setNewForm({
                          ...newForm,
                          period: p,
                          ...getPeriodDates(p),
                        })
                      }
                      className="flex-1 py-2.5 text-sm font-medium transition cursor-pointer"
                      style={
                        newForm.period === p
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, categoryId: "" })}
                    className="py-2 px-3 rounded-xl text-sm transition cursor-pointer flex items-center gap-2"
                    style={{
                      border:
                        newForm.categoryId === ""
                          ? "1px solid #3b82f6"
                          : "1px solid var(--border)",
                      backgroundColor:
                        newForm.categoryId === ""
                          ? "#eff6ff"
                          : "var(--bg-card)",
                      color:
                        newForm.categoryId === "" ? "#1d4ed8" : "var(--text)",
                    }}
                  >
                    <span>📊</span> General
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setNewForm({ ...newForm, categoryId: cat.id })
                      }
                      className="py-2 px-3 rounded-xl text-sm transition cursor-pointer flex items-center gap-2"
                      style={{
                        border:
                          newForm.categoryId === cat.id
                            ? "1px solid #3b82f6"
                            : "1px solid var(--border)",
                        backgroundColor:
                          newForm.categoryId === cat.id
                            ? "#eff6ff"
                            : "var(--bg-card)",
                        color:
                          newForm.categoryId === cat.id
                            ? "#1d4ed8"
                            : "var(--text)",
                      }}
                    >
                      <span>{getIcon(cat.icon)}</span>
                      <span className="truncate">{cat.name}</span>
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
                  Base Amount
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
                    value={newForm.amount}
                    onChange={(e) =>
                      setNewForm({ ...newForm, amount: e.target.value })
                    }
                    className="w-full rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-xs mt-1 text-green-500">
                  +{fmt(surplus)} surplus will be added → Total:{" "}
                  {fmt((parseFloat(newForm.amount) || 0) + surplus)}
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={labelStyle}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newForm.startDate}
                    onChange={(e) =>
                      setNewForm({ ...newForm, startDate: e.target.value })
                    }
                    className="w-full box-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={labelStyle}
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newForm.endDate}
                    onChange={(e) =>
                      setNewForm({ ...newForm, endDate: e.target.value })
                    }
                    className="w-full box-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          <ButtonLoader
            loading={loading}
            label={`Transfer ${fmt(surplus)}`}
            loadingLabel="Transferring..."
            disabled={mode === "existing" && !selectedBudgetId}
          />
        </div>
      </div>
    </div>
  );
}
