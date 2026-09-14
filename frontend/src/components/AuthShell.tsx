import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BoltIcon } from "./icons";

const FEATURES = [
  {
    title: "Grounded answers",
    body: "Chat with your documents and get responses traced back to the passage they came from.",
  },
  {
    title: "A library of agents",
    body: "Ready-to-use agents for documents, resumes and analysis — with more shipping continuously.",
  },
  {
    title: "One workspace",
    body: "Every conversation, document and agent stays in a single place you can pick back up.",
  },
];

/**
 * Shared split-screen chrome for the auth pages: a branded panel on the left
 * (hidden on small screens) and a centered content slot on the right.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas text-ink-muted">
      {/* Left — branded panel */}
      <div className="relative hidden w-[44%] max-w-2xl shrink-0 flex-col justify-between border-r border-line bg-surface px-14 py-14 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-fg">
            <BoltIcon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            Agent Hub
          </span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md font-display text-[38px] font-semibold leading-[1.1] tracking-tight text-ink">
            Every AI agent you build, in one workspace.
          </h2>

          <ul className="mt-12 max-w-md divide-y divide-line border-y border-line">
            {FEATURES.map((feature, i) => (
              <li key={feature.title} className="flex gap-5 py-5">
                <span className="label tabular pt-1">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-[14px] font-medium text-ink">{feature.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-dim">{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[11px] text-ink-faint">
          © {new Date().getFullYear()} Agent Hub
        </p>
      </div>

      {/* Right — form content */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full min-w-0 max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
