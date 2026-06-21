import { AlertTriangle } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-danger">
      <AlertTriangle size={48} strokeWidth={1.5} />
      <p className="mt-3 text-sm text-text-secondary">{getErrorMessage(error)}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm mt-4">
          Try Again
        </button>
      )}
    </div>
  );
}
