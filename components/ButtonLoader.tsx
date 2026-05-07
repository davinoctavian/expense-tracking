import LoadingSpinner from "./LoadingSpinner";

type Props = {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
};

export default function ButtonLoader({
  loading,
  label,
  loadingLabel = "Loading...",
  disabled,
  className = "w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50",
  type = "submit",
  onClick,
}: Props) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={className}
      onClick={onClick}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
