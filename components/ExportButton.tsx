"use client";

import { useState } from "react";
import {
  exportAllCSV,
  exportAllPDF,
  exportTransactionsCSV,
  exportTransactionsPDF,
} from "@/lib/export";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};
type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string | null;
  date: string;
  category: Category | null;
};
type Budget = {
  id: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  category: Category | null;
};

type Props = {
  transactions: Transaction[];
  budgets?: Budget[] | null;
  categories?: Category[] | null;
  dateLabel: string;
  summary: { totalIncome: number; totalExpense: number; balance: number };
};

export default function ExportButton({
  transactions,
  budgets = null,
  categories = null,
  dateLabel,
  summary,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleCSV = () => {
    if (!budgets && !categories) {
      exportTransactionsCSV(transactions, dateLabel);
    } else {
      if (!budgets || !categories) return;
      exportAllCSV(transactions, budgets, categories, dateLabel);
    }
    setOpen(false);
  };

  const handlePDF = () => {
    if (!budgets && !categories) {
      exportTransactionsPDF(transactions, dateLabel, summary);
    } else {
      if (!budgets || !categories) return;
      exportAllPDF(transactions, budgets, categories, dateLabel, summary);
    }
    setOpen(false);
  };

  return (
    <div className="relative self-baseline">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
        style={{
          backgroundColor: "var(--bg-card)",
          color: "var(--text)",
          border: "1px solid var(--border)",
        }}
      >
        📤 Export
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="absolute right-0 mt-2 w-44 rounded-xl shadow-lg z-20 overflow-hidden"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={handleCSV}
              className="w-full px-4 py-3 text-sm text-left flex items-center gap-2 transition cursor-pointer"
              style={{ color: "var(--text)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span className="text-lg">📊</span>
              <div>
                <p className="font-medium">Export CSV</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Excel compatible
                </p>
              </div>
            </button>

            <div style={{ borderTop: "1px solid var(--border)" }} />

            <button
              onClick={handlePDF}
              className="w-full px-4 py-3 text-sm text-left flex items-center gap-2 transition cursor-pointer"
              style={{ color: "var(--text)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span className="text-lg">📄</span>
              <div>
                <p className="font-medium">Export PDF</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Formatted report
                </p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
