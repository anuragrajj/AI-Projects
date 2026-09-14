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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
    </div>
  );
}
