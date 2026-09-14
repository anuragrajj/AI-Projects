import type { IconType } from "./icons";
import { BoltIcon, HomeIcon, PlusIcon } from "./icons";

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
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-[18px]">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-fg">
          <BoltIcon className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          Agent Hub
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavButton
          active={activeId === "home"}
          icon={HomeIcon}
          label="Dashboard"
          onClick={() => onSelect("home")}
        />

        <p className="label px-3 pb-2 pt-6">Agents</p>
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`group relative flex w-full items-center gap-2.5 rounded-lg py-2 pl-3 pr-2.5 text-left text-[13.5px] transition-colors duration-150 ${
                  active
                    ? "bg-surface-raised font-medium text-ink"
                    : "text-ink-muted hover:bg-surface-raised/60 hover:text-ink"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-accent" />
                )}
                <Icon
                  className={`h-[17px] w-[17px] shrink-0 transition-colors duration-150 ${
                    active ? "text-accent" : "text-ink-dim group-hover:text-ink-muted"
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {item.status === "soon" && <span className="label">Soon</span>}
              </button>
            );
          })}

          <div className="flex items-center gap-2.5 rounded-lg py-2 pl-3 pr-2.5 text-[13.5px] text-ink-faint">
            <PlusIcon className="h-[17px] w-[17px] shrink-0" />
            <span>More on the way</span>
          </div>
        </div>
      </nav>

      <div className="border-t border-line px-5 py-3.5">
        <p className="label">v0.1 · Preview</p>
      </div>
    </aside>
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
      className={`group relative flex w-full items-center gap-2.5 rounded-lg py-2 pl-3 pr-2.5 text-[13.5px] transition-colors duration-150 ${
        active
          ? "bg-surface-raised font-medium text-ink"
          : "text-ink-muted hover:bg-surface-raised/60 hover:text-ink"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-accent" />
      )}
      <Icon
        className={`h-[17px] w-[17px] shrink-0 transition-colors duration-150 ${
          active ? "text-accent" : "text-ink-dim group-hover:text-ink-muted"
        }`}
      />
      {label}
    </button>
  );
}
