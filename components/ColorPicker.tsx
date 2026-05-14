"use client";

const COLOR_GROUPS: Record<string, string[]> = {
  Preset: [
    "#2563eb",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#ffffff",
    "#000000",
  ],
};

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {Object.entries(COLOR_GROUPS).map(([group, colors]) => (
        <div key={group}>
          <p
            className="text-xs mb-1.5 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {group}
          </p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className="transition cursor-pointer active:scale-95"
                title={color}
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  backgroundColor: color,
                  border:
                    value === color
                      ? "3px solid var(--text)"
                      : "2px solid var(--border)",
                  transform: value === color ? "scale(1.15)" : "scale(1)",
                  boxShadow:
                    value === color ? "0 0 0 2px var(--bg-card)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Custom hex input */}
      <div className="flex items-center gap-3 pt-1">
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            backgroundColor: value,
            border: "2px solid var(--border)",
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          placeholder="#000000"
          maxLength={7}
          minLength={4}
          className="flex-1 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0.5"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
          title="Pick custom color"
        />
      </div>
    </div>
  );
}
