import { useEffect, useRef, useState } from "react";
import { LogInIcon, UserIcon, UserPlusIcon } from "./icons";

type ProfileMenuProps = {
  onLogin: () => void;
  onSignup: () => void;
};

/**
 * Avatar button in the top bar. Clicking it opens a small account dropdown
 * (Login / Sign up for now). Closes on outside click or Escape.
 * Styled to match the dark homepage theme.
 */
export default function ProfileMenu({ onLogin, onSignup }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const select = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-900 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
          open ? "ring-2 ring-emerald-400/60" : ""
        }`}
      >
        <UserIcon className="h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 p-1 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white">Welcome</p>
            <p className="text-[11px] text-slate-500">Sign in to save your work</p>
          </div>
          <div className="my-1 h-px bg-slate-800" />

          <button
            type="button"
            role="menuitem"
            onClick={() => select(onLogin)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogInIcon className="h-4 w-4 text-slate-400" />
            Login
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => select(onSignup)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <UserPlusIcon className="h-4 w-4 text-slate-400" />
            Sign up
          </button>
        </div>
      )}
    </div>
  );
}
