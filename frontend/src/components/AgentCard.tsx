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
  status: "live" | "soon";
  route: string;
};

type AgentCardProps = {
  agent: Agent;
  index: number;
  onOpen: () => void;
};

export default function AgentCard({ agent, index, onOpen }: AgentCardProps) {
  const { name, tagline, description, tags, icon: Icon, status } = agent;
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
      className={`group relative flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors duration-150 ${
        isLive
          ? "cursor-pointer hover:border-line-strong hover:bg-surface-raised"
          : "opacity-55"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-surface-raised text-ink-muted transition-colors duration-150 ${
            isLive ? "group-hover:border-accent/40 group-hover:text-accent" : ""
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>

        <span className="label tabular pt-1">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="mt-5 flex-1">
        <div className="flex items-center gap-2.5">
          <h3 className="font-display text-[17px] font-semibold tracking-tight text-ink">{name}</h3>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-label text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-label text-ink-faint">
              <LockIcon className="h-2.5 w-2.5" />
              Soon
            </span>
          )}
        </div>

        <p className="mt-1 font-mono text-[11px] uppercase tracking-label text-ink-dim">{tagline}</p>
        <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink-muted">{description}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-line px-2 py-1 text-[11px] font-medium text-ink-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      {isLive && (
        <div className="mt-6 flex items-center gap-1.5 border-t border-line pt-4 text-[13px] font-medium text-ink-muted transition-colors duration-150 group-hover:text-accent">
          Open agent
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </div>
      )}
    </div>
  );
}
