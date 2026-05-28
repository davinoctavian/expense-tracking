import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};
type Transaction = {
  id: string;
  amount: number;
  type: string;
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

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const fmtDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── CSV ────────────────────────────────────────────────────────────────────

function toCSV(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTransactionsCSV(
  transactions: Transaction[],
  filename = "transactions.csv",
) {
  const header = ["Date", "Type", "Category", "Note", "Amount"];
  const rows = transactions.map((t) => [
    fmtDate(t.date),
    t.type,
    t.category?.name ?? "Uncategorized",
    t.note ?? "",
    t.amount.toString(),
  ]);
  downloadCSV(toCSV([header, ...rows]), filename);
}

export function exportTransactionsPDF(
  transactions: Transaction[],
  dateLabel: string,
  summary: { totalIncome: number; totalExpense: number; balance: number },
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Expenses Report", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${dateLabel}`, 14, 20);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    pageWidth - 14,
    20,
    { align: "right" },
  );

  let y = 36;

  // ── Summary
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Income", "Expenses", "Balance"]],
    body: [
      [
        fmt(summary.totalIncome),
        fmt(summary.totalExpense),
        fmt(summary.balance),
      ],
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: [30, 30, 30] },
    columnStyles: {
      0: { textColor: [22, 163, 74] },
      1: { textColor: [220, 38, 38] },
      2: { textColor: summary.balance >= 0 ? [22, 163, 74] : [220, 38, 38] },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Transactions
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Transactions (${transactions.length})`, 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Date", "Type", "Category", "Note", "Amount"]],
    body: transactions.map((t) => [
      fmtDate(t.date),
      t.type,
      t.category?.name ?? "Uncategorized",
      t.note ?? "-",
      (t.type === "INCOME" ? "+" : "-") + fmt(t.amount),
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: [30, 30, 30], fontSize: 8 },
    columnStyles: {
      1: {
        fontStyle: "bold",
      },
      4: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === "body") {
        data.cell.styles.textColor =
          data.cell.raw === "INCOME" ? [22, 163, 74] : [220, 38, 38];
      }
      if (data.column.index === 4 && data.section === "body") {
        data.cell.styles.textColor = String(data.cell.raw).startsWith("+")
          ? [22, 163, 74]
          : [220, 38, 38];
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} · Expenses Tracker`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  doc.save(`expenses-report-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportBudgetsCSV(budgets: Budget[], filename = "budgets.csv") {
  const header = ["Category", "Period", "Start Date", "End Date", "Amount"];
  const rows = budgets.map((b) => [
    b.category?.name ?? "General",
    b.period,
    fmtDate(b.startDate),
    fmtDate(b.endDate),
    b.amount.toString(),
  ]);
  downloadCSV(toCSV([header, ...rows]), filename);
}

export function exportCategoriesCSV(
  categories: Category[],
  filename = "categories.csv",
) {
  const header = ["Name", "Icon", "Color"];
  const rows = categories.map((c) => [c.name, c.icon ?? "", c.color ?? ""]);
  downloadCSV(toCSV([header, ...rows]), filename);
}

export function exportAllCSV(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  dateLabel: string,
) {
  // Transactions sheet
  const tHeader = ["Date", "Type", "Category", "Note", "Amount"];
  const tRows = transactions.map((t) => [
    fmtDate(t.date),
    t.type,
    t.category?.name ?? "Uncategorized",
    t.note ?? "",
    t.amount.toString(),
  ]);

  // Budgets sheet
  const bHeader = ["Category", "Period", "Start Date", "End Date", "Amount"];
  const bRows = budgets.map((b) => [
    b.category?.name ?? "General",
    b.period,
    fmtDate(b.startDate),
    fmtDate(b.endDate),
    b.amount.toString(),
  ]);

  // Categories sheet
  const cHeader = ["Name", "Icon", "Color"];
  const cRows = categories.map((c) => [c.name, c.icon ?? "", c.color ?? ""]);

  const content = [
    `TRANSACTIONS (${dateLabel})`,
    toCSV([tHeader, ...tRows]),
    "",
    `BUDGETS`,
    toCSV([bHeader, ...bRows]),
    "",
    `CATEGORIES`,
    toCSV([cHeader, ...cRows]),
  ].join("\n");

  downloadCSV(
    content,
    `expenses-export-${new Date().toISOString().split("T")[0]}.csv`,
  );
}

// ─── PDF ────────────────────────────────────────────────────────────────────

export function exportAllPDF(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  dateLabel: string,
  summary: { totalIncome: number; totalExpense: number; balance: number },
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Expenses Report", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${dateLabel}`, 14, 20);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    pageWidth - 14,
    20,
    { align: "right" },
  );

  let y = 36;

  // ── Summary
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Income", "Expenses", "Balance"]],
    body: [
      [
        fmt(summary.totalIncome),
        fmt(summary.totalExpense),
        fmt(summary.balance),
      ],
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: [30, 30, 30] },
    columnStyles: {
      0: { textColor: [22, 163, 74] },
      1: { textColor: [220, 38, 38] },
      2: { textColor: summary.balance >= 0 ? [22, 163, 74] : [220, 38, 38] },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Transactions
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Transactions (${transactions.length})`, 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Date", "Type", "Category", "Note", "Amount"]],
    body: transactions.map((t) => [
      fmtDate(t.date),
      t.type,
      t.category?.name ?? "Uncategorized",
      t.note ?? "-",
      (t.type === "INCOME" ? "+" : "-") + fmt(t.amount),
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: [30, 30, 30], fontSize: 8 },
    columnStyles: {
      1: {
        fontStyle: "bold",
      },
      4: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === "body") {
        data.cell.styles.textColor =
          data.cell.raw === "INCOME" ? [22, 163, 74] : [220, 38, 38];
      }
      if (data.column.index === 4 && data.section === "body") {
        data.cell.styles.textColor = String(data.cell.raw).startsWith("+")
          ? [22, 163, 74]
          : [220, 38, 38];
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Budgets
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Budgets (${budgets.length})`, 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Category", "Period", "Start Date", "End Date", "Amount"]],
    body: budgets.map((b) => [
      b.category?.name ?? "General",
      b.period,
      fmtDate(b.startDate),
      fmtDate(b.endDate),
      fmt(b.amount),
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: [30, 30, 30], fontSize: 8 },
    columnStyles: { 4: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Categories
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Categories (${categories.length})`, 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Name", "Icon Key", "Color"]],
    body: categories.map((c) => [c.name, c.icon ?? "-", c.color ?? "-"]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: [30, 30, 30], fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // ── Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} · Expenses Tracker`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  doc.save(`expenses-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
