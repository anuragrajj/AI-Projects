import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogInIcon, LogOutIcon, UserIcon, UserPlusIcon } from "./icons";
import type { RootState, AppDispatch } from "../store";
import { logout } from "../store/slices/AuthSlice";

type ProfileMenuProps = {
  onLogin: () => void;
  onSignup: () => void;
};

/**
 * Avatar button in the top bar. Clicking it opens a small account dropdown —
 * Login / Sign up when signed out, or the user's name and a Logout option
 * (behind a confirmation dialog) when signed in.
 */
export default function ProfileMenu({ onLogin, onSignup }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

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

  const confirmLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    setConfirmOpen(false);
    navigate("/login");
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
            <p className="truncate text-sm font-medium text-white">
              {isAuthenticated && user ? user.name : "Welcome"}
            </p>
            {!isAuthenticated && (
              <p className="text-[11px] text-slate-500">Sign in to save your work</p>
            )}
          </div>
          <div className="my-1 h-px bg-slate-800" />

          {isAuthenticated ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => select(() => setConfirmOpen(true))}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <LogOutIcon className="h-4 w-4 text-slate-400" />
              Logout
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h2 className="text-base font-semibold text-white">Log out?</h2>
            <p className="mt-1.5 text-sm text-slate-400">
              You'll need to sign in again to access your workspace.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
