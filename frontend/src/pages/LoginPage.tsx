import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthShell from "../components/AuthShell";
import { BoltIcon } from "../components/icons";
import { loginRequest } from "../services/authApi";
import { login } from "../store/slices/AuthSlice";
import type { AppDispatch } from "../store";
import { setLoading } from "../store/slices/LoaderSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoadinglogin] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadinglogin(true)
    dispatch(setLoading(true));
    try {
      const { user, token } = await loginRequest(email, password);
      dispatch(login({ user, token }));
      localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      dispatch(setLoading(false));
      setLoadinglogin(false)
    }
  };

  return (
    <AuthShell>
      <div className="w-full">
        {/* Brand — mobile / small screens only, since AuthShell's left panel covers this on lg+ */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-fg">
            <BoltIcon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            Agent Hub
          </span>
        </div>

        <p className="label">Sign in</p>
        <h1 className="mt-3 font-display text-[28px] font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-2 text-[13.5px] text-ink-dim">
          Log in to continue to your workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[12.5px] text-ink-dim">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-line bg-surface accent-accent"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-[12.5px] font-medium text-ink-muted transition-colors duration-150 hover:text-accent"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-accent-fg transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-fg/30 border-t-accent-fg" />
            )}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <span className="label">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
        >
          Continue as guest
        </button>

        <p className="mt-8 text-[13px] text-ink-dim">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-medium text-ink transition-colors duration-150 hover:text-accent"
          >
            Create one
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12.5px] font-medium text-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-faint hover:border-line-strong focus:border-accent/60"
      />
    </label>
  );
}
