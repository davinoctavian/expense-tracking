const PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
export type Period = (typeof PERIODS)[number];

type Props = {
  value: Period;
  onChange: (period: Period) => void;
};

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            value === p
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          {p.charAt(0) + p.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}
