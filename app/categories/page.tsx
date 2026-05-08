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

const COLOR_OPTIONS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    icon: "money",
    color: "#6366f1",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", icon: "money", color: "#6366f1" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    resetForm();
    fetchCategories();
    setSubmitting(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      icon: cat.icon ?? "money",
      color: cat.color ?? "#6366f1",
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this category? Transactions using it will become uncategorized.",
      )
    )
      return;
    setDeleteId(id);
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FullscreenOverlay show={submitting} />
      <Navbar
        title="Categories"
        backHref="/"
        actions={
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            + New
          </button>
        }
      />

      <div className="max-w-2xl mx-auto p-6 space-y-4">
        {showForm && (
          <FormCard title={editingId ? "Edit Category" : "New Category"}>
            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Food, Transport"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(getIcon).map(([key, emoji]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, icon: key })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition ${
                        form.icon === key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full border-4 transition ${
                        form.color === color
                          ? "border-gray-800 scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: form.color + "33" }}
                >
                  {getIcon(form.icon)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {form.name || "Preview"}
                </span>
              </div>

              <div className="flex gap-2">
                <ButtonLoader
                  loading={submitting}
                  label={editingId ? "Save Changes" : "Create Category"}
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
        ) : categories.length === 0 ? (
          <EmptyState
            message="No categories yet"
            actionLabel="Create your first category"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: (cat.color ?? "#6366f1") + "33" }}
                >
                  {getIcon(cat.icon ?? null)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {cat.name}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleteId === cat.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
