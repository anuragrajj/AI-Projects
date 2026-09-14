import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { BoltIcon } from "../components/icons";

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
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-fg">
            <BoltIcon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            Agent Hub
          </span>
        </div>

        <p className="label">Get started</p>
        <h1 className="mt-3 font-display text-[28px] font-semibold tracking-tight text-ink">
          Create your account
        </h1>
        <p className="mt-2 text-[13.5px] text-ink-dim">Start building with your AI agents.</p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
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

          <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-dim">
            <input
              type="checkbox"
              className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-line bg-surface accent-accent"
            />
            <span>
              I agree to the <span className="text-ink-muted underline underline-offset-2">Terms of Service</span> and{" "}
              <span className="text-ink-muted underline underline-offset-2">Privacy Policy</span>.
            </span>
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-accent-fg transition-colors duration-150 hover:bg-accent-hover"
          >
            Create account
          </button>
        </form>

        <p className="mt-8 text-[13px] text-ink-dim">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-ink transition-colors duration-150 hover:text-accent"
          >
            Sign in
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
