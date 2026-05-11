"use client";

import { useEffect, useState } from "react";
import ButtonLoader from "@/components/ButtonLoader";
import FullscreenOverlay from "@/components/FullscreenOverlay";
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import FormCard from "@/components/FormCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getIcon, ICON_MAP } from "@/lib/icons";

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
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    icon: "money",
    color: "#6366f1",
  });

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
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    resetForm();
    fetchCategories();
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

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  };
  const labelStyle = { color: "var(--text)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
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
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 cursor-pointer"
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
                <label
                  className="block text-sm font-medium mb-1"
                  style={labelStyle}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={inputStyle}
                  placeholder="e.g. Food, Transport"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={labelStyle}
                >
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ICON_MAP).map(([key, emoji]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, icon: key })}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition cursor-pointer"
                      style={{
                        border:
                          form.icon === key
                            ? "2px solid #3b82f6"
                            : "2px solid var(--border)",
                        backgroundColor:
                          form.icon === key ? "#eff6ff" : "var(--bg-card)",
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={labelStyle}
                >
                  Color
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className="w-8 h-8 rounded-full transition cursor-pointer"
                      style={{
                        backgroundColor: color,
                        border:
                          form.color === color
                            ? "3px solid var(--text)"
                            : "3px solid transparent",
                        transform:
                          form.color === color ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: "var(--bg)" }}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: form.color + "33" }}
                >
                  {getIcon(form.icon)}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text)" }}
                >
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
        ) : categories.length === 0 ? (
          <EmptyState
            message="No categories yet"
            actionLabel="Create your first category"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                }}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: (cat.color ?? "#6366f1") + "33" }}
                >
                  {getIcon(cat.icon ?? null)}
                </span>
                <div className="flex-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {cat.name}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-1.5 rounded-lg transition cursor-pointer"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleteId === cat.id}
                    className="p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                    style={{ color: "var(--text-muted)" }}
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
