type Props = { children: React.ReactNode; title?: string };

export default function FormCard({ children, title }: Props) {
  return (
    <div
      className="rounded-2xl shadow-sm p-6"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {title && (
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
