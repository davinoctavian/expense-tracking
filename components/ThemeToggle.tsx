"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, loading } = useTheme();

  if (loading) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition hover:bg-gray-100 cursor-pointer dark:hover:bg-slate-700"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
