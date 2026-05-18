type Props = {
  label: string;
  value: number;
  color?: string;
  prefix?: string;
  isCurrency?: boolean;
};

function formatCompact(amount: number, isCurrency: boolean = true): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}${isCurrency ? "Rp " : ""}${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000)
    return `${sign}${isCurrency ? "Rp " : ""}${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000)
    return `${sign}${isCurrency ? "Rp " : ""}${(abs / 1_000).toFixed(0)}rb`;
  return isCurrency
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount)
    : amount.toString();
}

function formatFull(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getFontSize(amount: number): string {
  const abs = Math.abs(amount);
  const digits = abs.toFixed(0).length;
  if (digits <= 7) return "text-xl md:text-2xl";
  if (digits <= 10) return "text-lg md:text-xl";
  return "text-base md:text-lg";
}

export default function SummaryCard({
  label,
  value,
  color = "var(--text)",
  isCurrency = true,
}: Props) {
  return (
    <div
      className="rounded-2xl p-4 md:p-5 shadow-sm flex flex-col gap-1 min-w-0"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>

      {/* Compact value — always fits */}
      <p
        className={`font-bold truncate ${getFontSize(value)}`}
        style={{ color }}
        title={isCurrency ? formatFull(value) : value.toString()} // full value on hover
      >
        {formatCompact(value, isCurrency)}
      </p>

      {/* Full value in smaller text below if large */}
      {Math.abs(value) >= 1_000_000 && (
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {isCurrency ? formatFull(value) : value.toString()}
        </p>
      )}
    </div>
  );
}
