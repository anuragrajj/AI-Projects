import type { KeyboardEvent } from "react";
import type { IconType } from "./icons";
import { ArrowRightIcon, LockIcon } from "./icons";

export type Agent = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  icon: IconType;
  /** Tailwind gradient stops, e.g. "from-indigo-500 to-violet-600" */
  accent: string;
  /** Tailwind hover shadow color, e.g. "hover:shadow-indigo-500/20" */
  glow: string;
  status: "live" | "soon";
  route: string;
};

type AgentCardProps = {
  agent: Agent;
  onOpen: () => void;
};

export default function AgentCard({ agent, onOpen }: AgentCardProps) {
  const { name, tagline, description, tags, icon: Icon, accent, glow, status } = agent;
  const isLive = status === "live";

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role={isLive ? "button" : undefined}
      tabIndex={isLive ? 0 : undefined}
      onClick={isLive ? onOpen : undefined}
      onKeyDown={isLive ? handleKeyDown : undefined}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 ${
        isLive
          ? `cursor-pointer hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900 hover:shadow-2xl ${glow} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`
          : "opacity-60"
      }`}
    >
      {/* Accent wash */}
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl transition-opacity duration-300 ${
          isLive ? "group-hover:opacity-30" : ""
        }`}
      />

      <div className="relative flex items-start justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${accent} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
            <LockIcon className="h-3 w-3" />
            Coming soon
          </span>
        )}
      </div>

      <div className="relative mt-5 flex-1">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <p className="mt-0.5 text-sm font-medium text-slate-400">{tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-slate-800 bg-slate-800/40 px-2 py-1 text-[11px] font-medium text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {isLive && (
        <div className="relative mt-5 flex items-center gap-1.5 text-sm font-semibold text-indigo-300">
          Open agent
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      )}
    </div>
  );
}
