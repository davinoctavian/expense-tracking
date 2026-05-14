"use client";

import { useState } from "react";
import { ICON_MAP } from "@/lib/icons";

const ICON_CATEGORIES: Record<string, string[]> = {
  "🍽️ Food": [
    "food",
    "pizza",
    "coffee",
    "restaurant",
    "catering",
    "drinks",
    "snack",
    "groceries",
    "bakery",
    "dessert",
  ],
  "🚗 Transport": [
    "car",
    "fuel",
    "motorcycle",
    "taxi",
    "bus",
    "train",
    "flight",
    "travel",
    "parking",
  ],
  "🏠 Housing": [
    "home",
    "rent",
    "electric",
    "water",
    "internet",
    "gas",
    "furniture",
    "repair",
  ],
  "💊 Health": [
    "health",
    "hospital",
    "doctor",
    "pharmacy",
    "fitness",
    "gym",
    "mental",
  ],
  "🛒 Shopping": [
    "shop",
    "fashion",
    "shoes",
    "accessories",
    "beauty",
    "skincare",
  ],
  "🎮 Entertainment": [
    "game",
    "music",
    "movie",
    "streaming",
    "sports",
    "hobby",
    "book",
    "concert",
  ],
  "👤 Personal": ["pet", "gift", "charity", "education", "baby", "wedding"],
  "💰 Finance": [
    "money",
    "expense",
    "bill",
    "tax",
    "insurance",
    "investment",
    "savings",
    "loan",
  ],
  "💼 Work": [
    "phone",
    "office",
    "equipment",
    "subscription",
    "salary",
    "freelance",
  ],
  "📌 Other": ["general", "other"],
};

type Props = {
  value: string;
  onChange: (key: string) => void;
};

export default function IconPicker({ value, onChange }: Props) {
  const [activeCategory, setActiveCategory] = useState(
    Object.keys(ICON_CATEGORIES)[0],
  );
  const [search, setSearch] = useState("");

  const isSearching = search.trim().length > 0;

  const searchResults = isSearching
    ? Object.entries(ICON_MAP).filter(([key]) =>
        key.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icon..."
        className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          border: "1px solid var(--border)",
        }}
      />

      {isSearching ? (
        /* Search Results */
        <div
          className="rounded-xl p-3"
          style={{
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        >
          {searchResults.length === 0 ? (
            <p
              className="text-sm text-center py-4"
              style={{ color: "var(--text-muted)" }}
            >
              No icons found
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {searchResults.map(([key, emoji]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setSearch("");
                  }}
                  title={key}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition cursor-pointer active:scale-95"
                  style={{
                    border:
                      value === key
                        ? "2px solid #3b82f6"
                        : "2px solid transparent",
                    backgroundColor:
                      value === key ? "#eff6ff" : "var(--bg-card)",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Category Tabs — horizontal scroll */}
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {Object.keys(ICON_CATEGORIES).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor:
                    activeCategory === cat ? "#2563eb" : "var(--bg-card)",
                  color: activeCategory === cat ? "white" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Icons Grid */}
          <div
            className="rounded-xl p-3"
            style={{
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="grid grid-cols-6 gap-2">
              {ICON_CATEGORIES[activeCategory].map((key) => {
                const emoji = ICON_MAP[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    title={key}
                    className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition cursor-pointer active:scale-95"
                    style={{
                      border:
                        value === key
                          ? "2px solid #3b82f6"
                          : "2px solid transparent",
                      backgroundColor:
                        value === key ? "#eff6ff" : "var(--bg-card)",
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected preview */}
          {value && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-xl">{ICON_MAP[value]}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Selected: <span style={{ color: "var(--text)" }}>{value}</span>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
