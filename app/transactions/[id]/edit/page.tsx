"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ButtonLoader from "@/components/ButtonLoader";
import FullscreenOverlay from "@/components/FullscreenOverlay";
import Navbar from "@/components/Navbar";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getIcon } from "@/lib/icons";
import CurrencyInput from "@/components/CurrencyInput";

type Category = { id: string; name: string; icon: string | null };

export default function EditTransactionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    type: "EXPENSE",
    note: "",
    date: "",
    categoryId: "",
  });
  const [hasGeneralBudget, setHasGeneralBudget] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    [],
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);

    fetch(`/api/transactions?period=YEARLY`)
      .then((r) => r.json())
      .then((data) => {
        const t = data.find((t: { id: string }) => t.id === id);
        if (t) {
          setForm({
            amount: t.amount.toString(),
            type: t.type,
            note: t.note ?? "",
            date: new Date(t.date).toISOString().split("T")[0],
            categoryId: t.categoryId ?? "",
          });
          // Fetch available categories for this date
          if (t.type === "EXPENSE")
            fetchAvailableCategories(
              new Date(t.date).toISOString().split("T")[0],
            );
        }
      });
  }, [id]);

  const fetchAvailableCategories = async (date: string) => {
    const res = await fetch(`/api/categories/available?date=${date}`);
    if (res.ok) {
      const data = await res.json();
      setAvailableCategories(data.categories);
      setHasGeneralBudget(data.hasGeneralBudget);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/history");
  };

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };
  const labelStyle = { color: "var(--text)" };
  const mutedStyle = { color: "var(--text-muted)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <FullscreenOverlay show={loading} />
      <Navbar title="Edit Transaction" backHref="/history" />

      <div className="max-w-lg mx-auto p-6">
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
                    onClick={() => setForm({ ...form, type })}
                    className="flex-1 py-2.5 text-sm font-medium transition cursor-pointer"
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
                    {type.charAt(0) + type.slice(1).toLowerCase()}
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
                className="w-full appearance-none box-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
                required
              />
            </div>

            {/* Budget */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={labelStyle}
              >
                Budget <span style={mutedStyle}>(optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: "", name: "None", icon: null }, ...categories].map(
                  (cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, categoryId: cat.id })}
                      className="py-2 px-3 rounded-xl text-sm transition cursor-pointer flex items-center gap-1.5"
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
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

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
                className="w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={inputStyle}
                placeholder="What was this for?"
                rows={3}
              />
            </div>

            <ButtonLoader
              loading={loading}
              label="Save Changes"
              loadingLabel="Saving..."
            />
          </form>
        </FormCard>
      </div>
    </div>
  );
}
