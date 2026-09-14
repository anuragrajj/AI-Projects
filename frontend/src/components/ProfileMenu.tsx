import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { IconType } from "./icons";
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

  const initial = user?.name?.trim()?.[0]?.toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`grid h-9 w-9 place-items-center rounded-lg border text-[13px] font-medium transition-colors duration-150 ${
          open
            ? "border-line-strong bg-surface-hover text-ink"
            : "border-line bg-surface-raised text-ink-muted hover:border-line-strong hover:text-ink"
        }`}
      >
        {isAuthenticated && initial ? initial : <UserIcon className="h-[17px] w-[17px]" />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 animate-fade-up overflow-hidden rounded-xl border border-line bg-surface-raised p-1 shadow-pop"
        >
          <div className="px-3 py-2.5">
            {isAuthenticated && user ? (
              <>
                <p className="truncate text-[13.5px] font-medium text-ink">{user.name}</p>
                <p className="truncate font-mono text-[11px] text-ink-dim">{user.email}</p>
              </>
            ) : (
              <>
                <p className="text-[13.5px] font-medium text-ink">Not signed in</p>
                <p className="text-[11px] text-ink-dim">Sign in to save your work</p>
              </>
            )}
          </div>

          <div className="my-1 h-px bg-line" />

          {isAuthenticated ? (
            <MenuItem icon={LogOutIcon} label="Log out" onClick={() => select(() => setConfirmOpen(true))} />
          ) : (
            <>
              <MenuItem icon={LogInIcon} label="Log in" onClick={() => select(onLogin)} />
              <MenuItem icon={UserPlusIcon} label="Create account" onClick={() => select(onSignup)} />
            </>
          )}
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-canvas/80 p-4 animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm animate-fade-up rounded-xl border border-line bg-surface-raised p-6 shadow-pop"
          >
            <h2 id="logout-title" className="font-display text-lg font-semibold tracking-tight text-ink">
              Log out?
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
              Your session token will be cleared from this device. You'll need to sign in again to
              reach your workspace.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-lg bg-rose-500 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-rose-400"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: IconType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] text-ink-muted transition-colors duration-150 hover:bg-surface-hover hover:text-ink"
    >
      <Icon className="h-4 w-4 text-ink-dim" />
      {label}
    </button>
  );
}
