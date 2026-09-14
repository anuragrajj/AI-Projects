import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthShell from "../components/AuthShell";
import { BoltIcon, LockIcon, UserIcon } from "../components/icons";
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
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <BoltIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Agent Hub</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Log in to continue to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-800 accent-indigo-500"
                />
                Remember me
              </label>
              <button type="button" className="font-medium text-indigo-300 hover:text-indigo-200">
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockIcon className="h-4 w-4" />
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[11px] uppercase tracking-wider text-slate-600">or</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800/60"
          >
            <UserIcon className="h-4 w-4" />
            Continue as guest
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Sign up
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
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/60"
      />
    </label>
  );
}
