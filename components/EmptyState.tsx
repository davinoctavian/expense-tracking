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
      <p className="text-gray-400 mb-2">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-blue-600 text-sm hover:underline"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-blue-600 text-sm hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
