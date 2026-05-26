"use client";

import { useState, useEffect } from "react";

type Props = {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  required,
  style,
  className,
}: Props) {
  const [displayValue, setDisplayValue] = useState("");

  function formatDisplay(raw: string) {
    const num = raw.replace(/\D/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(Number(num));
  }

  useEffect(() => {
    setDisplayValue(value ? formatDisplay(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ""); // digits only
    onChange(raw); // pass raw number string to parent
  };

  return (
    <div className="relative">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
        style={{ color: "var(--text-muted)" }}
      >
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
        style={style}
      />
    </div>
  );
}
