import { useSelector } from "react-redux";
import type { RootState } from "../store";

/**
 * App-wide loading overlay. Rendered once near the root; visibility is
 * driven entirely by store.loader.isLoading via setLoading(true/false).
 */
export default function GlobalLoader() {
  const isLoading = useSelector((state: RootState) => state.loader.isLoading);

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-canvas/80 animate-fade-in"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
        <span className="label">Working</span>
      </div>
    </div>
  );
}
