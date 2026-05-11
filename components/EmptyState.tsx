import Link from "next/link";

type Props = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export default function EmptyState({
  message,
  actionLabel,
  actionHref,
  onAction,
}: Props) {
  return (
    <div className="text-center py-12">
      <p className="mb-2" style={{ color: "var(--text-muted)" }}>
        {message}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-blue-500 text-sm hover:underline"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-blue-500 text-sm hover:underline cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
