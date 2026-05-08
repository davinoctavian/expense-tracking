"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ButtonLoader from "@/components/ButtonLoader";
import FullscreenOverlay from "@/components/FullscreenOverlay";
import Navbar from "@/components/Navbar";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getIcon } from "@/lib/icons";

type Category = {
  id: string;
  name: string;
  icon: string | null;
};

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
        }
      });
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <FullscreenOverlay show={loading} />
      <Navbar title="Edit Transaction" backHref="/history" />

      <div className="max-w-lg mx-auto p-6">
        <FormCard>
          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "EXPENSE" })}
                  className={`flex-1 py-2.5 text-sm font-medium transition ${
                    form.type === "EXPENSE"
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "INCOME" })}
                  className={`flex-1 py-2.5 text-sm font-medium transition ${
                    form.type === "INCOME"
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                Note <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
