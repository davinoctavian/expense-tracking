import LoadingSpinner from "./LoadingSpinner";

export default function FullscreenOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600 font-medium">Please wait...</p>
      </div>
    </div>
  );
}
