import type { IconType } from "./icons";
import {
  BoltIcon,
  GridIcon,
  HomeIcon,
  LifeBuoyIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
} from "./icons";

export type SidebarItem = {
  id: string;
  name: string;
  icon: IconType;
  status: "live" | "soon";
};

type SidebarProps = {
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

/**
 * Always-open navigation rail. Lists the product's AI agents / RAG chatbots
 * plus a few workspace-level links.
 */
export default function Sidebar({ items, activeId, onSelect }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <BoltIcon className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          {/* TODO: swap for your product name */}
          <p className="text-sm font-semibold text-white">Agent Hub</p>
          <p className="text-[11px] text-slate-500">AI agents &amp; chatbots</p>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-2">
        <NavButton
          active={activeId === "home"}
          icon={HomeIcon}
          label="Dashboard"
          onClick={() => onSelect("home")}
        />

        <div>
          <SectionLabel>Agents</SectionLabel>
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-colors ${
                      active
                        ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300"
                        : "border-slate-700/70 bg-slate-800/40 text-slate-400 group-hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.status === "soon" && (
                    <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}

            <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-dashed border-slate-700/70">
                <PlusIcon className="h-4 w-4" />
              </span>
              <span>More on the way</span>
            </div>
          </div>
        </div>

        {/* <div>
          <SectionLabel>General</SectionLabel>
          <div className="space-y-1">
            <NavButton icon={GridIcon} label="Explore agents" onClick={() => onSelect("home")} />
            <NavButton icon={SettingsIcon} label="Settings" onClick={() => onSelect("settings")} />
            <NavButton icon={LifeBuoyIcon} label="Help & feedback" onClick={() => onSelect("help")} />
          </div>
        </div> */}
      </nav>

      {/* Workspace / account */}
      {/* <div className="border-t border-slate-800/70 p-3">
        <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-800/60">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-900">
            <UserIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-medium text-slate-200">Your workspace</span>
            <span className="block truncate text-[11px] text-slate-500">Free plan</span>
          </span>
        </button>
      </div> */}
    </aside>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
      {children}
    </p>
  );
}

function NavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: IconType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </button>
  );
}
