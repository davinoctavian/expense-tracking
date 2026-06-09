"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ButtonLoader from "@/components/ButtonLoader";
import FullscreenOverlay from "@/components/FullscreenOverlay";
import Navbar from "@/components/Navbar";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getIcon } from "@/lib/icons";
import CurrencyInput from "@/components/CurrencyInput";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export default function AddTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasGeneralBudget, setHasGeneralBudget] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    type: "EXPENSE",
    note: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });

  useEffect(() => {
    if (form.type === "EXPENSE") {
      fetchAvailableCategories(form.date);
    }
  }, [form.date, form.type]);

  const fetchAvailableCategories = async (date: string) => {
    setLoadingCategories(true);
    const res = await fetch(`/api/categories/available?date=${date}`);
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
      setHasGeneralBudget(data.hasGeneralBudget);
      // Reset categoryId if no longer valid
      setForm((prev) => ({ ...prev, categoryId: "" }));
    }
    setLoadingCategories(false);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate for expense: must have budget
    if (form.type === "EXPENSE") {
      if (!form.categoryId && !hasGeneralBudget) {
        setError(
          "No general budget found for this date. Please create a budget first.",
        );
        setLoading(false);
        return;
      }
      if (
        form.categoryId &&
        !categories.find((c) => c.id === form.categoryId)
      ) {
        setError("Selected budget has no budget for this date.");
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/");
  };

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };
  const labelStyle = { color: "var(--text)" };
  const mutedStyle = { color: "var(--text-muted)" };

  const noBudgetForDate =
    form.type === "EXPENSE" &&
    !loadingCategories &&
    categories.length === 0 &&
    !hasGeneralBudget;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <FullscreenOverlay show={loading} />
      <Navbar title="Add Transaction" backHref="/" />

      <div className="max-w-lg mx-auto p-4 md:p-6 pb-8">
        <FormCard>
          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={labelStyle}
              >
                Type
              </label>
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {["EXPENSE", "INCOME"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type, categoryId: "" })}
                    className="flex-1 py-3 text-sm font-medium transition cursor-pointer"
                    style={
                      form.type === type
                        ? {
                            backgroundColor:
                              type === "EXPENSE" ? "#ef4444" : "#10b981",
                            color: "white",
                          }
                        : {
                            backgroundColor: "var(--bg-card)",
                            color: "var(--text-muted)",
                          }
                    }
                  >
                    {type === "EXPENSE" ? "💸 Expense" : "💰 Income"}
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
                Amount
              </label>
              <CurrencyInput
                value={form.amount}
                onChange={(raw) => setForm({ ...form, amount: raw })}
                style={inputStyle}
                required
              />
            </div>

            {/* Date */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={labelStyle}
              >
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full appearance-none box-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
                required
              />
            </div>

            {/* Budget — only for EXPENSE */}
            {/* Only show category after date is chosen */}
            {form.type === "EXPENSE" && (
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={labelStyle}
                >
                  Budget
                </label>

                {!form.date ? (
                  <div
                    className="rounded-xl p-4 text-sm text-center"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    📅 Please select a date first to see available budgets
                  </div>
                ) : loadingCategories ? (
                  <p className="text-sm py-3" style={mutedStyle}>
                    Loading available budgets...
                  </p>
                ) : noBudgetForDate ? (
                  <div
                    className="rounded-xl p-4 text-sm text-center"
                    style={{
                      backgroundColor: "#fef9c3",
                      color: "#a16207",
                      border: "1px solid #fde047",
                    }}
                  >
                    ⚠️ No budget found for this date.{" "}
                    <Link href="/budgets" className="underline font-medium">
                      Create a budget first
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {hasGeneralBudget && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, categoryId: "" })}
                        className="py-3 px-3 rounded-xl text-sm transition cursor-pointer flex items-center gap-2"
                        style={{
                          border:
                            form.categoryId === ""
                              ? "1px solid #3b82f6"
                              : "1px solid var(--border)",
                          backgroundColor:
                            form.categoryId === ""
                              ? "#eff6ff"
                              : "var(--bg-card)",
                          color:
                            form.categoryId === "" ? "#1d4ed8" : "var(--text)",
                        }}
                      >
                        <span>📊</span>
                        <span>General</span>
                      </button>
                    )}
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, categoryId: cat.id })}
                        className="py-3 px-3 rounded-xl text-sm transition cursor-pointer flex items-center gap-2"
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
                        <span>{getIcon(cat.icon)}</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={labelStyle}
              >
                Note <span style={mutedStyle}>(optional)</span>
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={inputStyle}
                placeholder="What was this for?"
                rows={3}
              />
            </div>

            <ButtonLoader
              loading={loading}
              label="Save Transaction"
              loadingLabel="Saving..."
              disabled={form.type === "EXPENSE" && noBudgetForDate}
            />
          </form>
        </FormCard>
      </div>
    </div>
  );
}
