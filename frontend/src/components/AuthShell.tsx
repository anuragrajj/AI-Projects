import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BoltIcon, DocChatIcon, GridIcon, SparkleIcon } from "./icons";

const FEATURES = [
  { icon: DocChatIcon, text: "Chat with your documents, grounded in real citations" },
  { icon: GridIcon, text: "A growing library of ready-to-use AI agents" },
  { icon: SparkleIcon, text: "New agents ship straight to your workspace" },
];

/**
 * Shared split-screen chrome for the auth pages: a branded panel on the left
 * (hidden on small screens) and a centered content slot on the right.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#080b13] text-slate-300">
      {/*
        index.css / App.css constrain and center #root globally. Neutralise that
        for this full-bleed layout only while an auth page is mounted.
      */}
      <style>{`
        #root { max-width: none; margin: 0; padding: 0; text-align: left; }
        body { display: block; }
      `}</style>

      {/* Left — branded panel */}
      <div className="relative hidden w-[42%] max-w-xl shrink-0 flex-col justify-between overflow-hidden border-r border-slate-800/70 bg-gradient-to-br from-indigo-950 via-slate-950 to-[#080b13] px-12 py-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -right-16 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <BoltIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Agent Hub</span>
        </Link>

        <div className="relative">
          <h2 className="max-w-sm text-3xl font-bold leading-tight text-white">
            Meet your AI agents, all in one place.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            One workspace for every RAG chatbot and agent you build — sign in to pick up right
            where you left off.
          </p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-1.5 text-sm text-slate-400">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} Agent Hub</p>
      </div>

      {/* Right — form content */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl lg:left-1/3" />
        </div>

        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
