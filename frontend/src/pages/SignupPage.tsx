import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { BoltIcon, UserPlusIcon } from "../components/icons";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire up account creation
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
            <h1 className="text-xl font-semibold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Start building with your AI agents</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Jane Doe"
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />
            <Field
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <label className="flex items-start gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 bg-slate-800 accent-indigo-500"
              />
              <span>
                I agree to the <span className="text-indigo-300">Terms of Service</span> and{" "}
                <span className="text-indigo-300">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5"
            >
              <UserPlusIcon className="h-4 w-4" />
              Create account
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Log in
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
