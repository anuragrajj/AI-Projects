import { useMemo } from "react";
import { ArrowLeftIcon, MessageIcon, PanelLeftIcon, PlusIcon, TrashIcon } from "./icons";

export type SidebarSession = {
   id: string;
   title: string;
   updatedAt: number;
};

type ChatSessionSidebarProps = {
   sessions: SidebarSession[];
   activeId: string;
   open: boolean;
   onToggle: () => void;
   onSelect: (id: string) => void;
   onNewChat: () => void;
   onDelete: (id: string) => void;
   onHome: () => void;
};

const DAY = 86_400_000;

function groupLabel(ts: number): string {
   const now = new Date();
   const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
   if (ts >= startOfToday) return "Today";
   if (ts >= startOfToday - DAY) return "Yesterday";
   if (ts >= startOfToday - 7 * DAY) return "Previous 7 days";
   if (ts >= startOfToday - 30 * DAY) return "Previous 30 days";
   return "Older";
}

/**
 * ChatGPT / Claude style rail: new chat + date-grouped session history.
 * Collapsible; on small screens it slides over the content with a backdrop.
 */
export default function ChatSessionSidebar({
   sessions,
   activeId,
   open,
   onToggle,
   onSelect,
   onNewChat,
   onDelete,
   onHome,
}: ChatSessionSidebarProps) {
   const groups = useMemo(() => {
      const acc: { label: string; items: SidebarSession[] }[] = [];
      for (const session of sessions) {
         const label = groupLabel(session.updatedAt);
         const bucket = acc.find((g) => g.label === label);
         if (bucket) bucket.items.push(session);
         else acc.push({ label, items: [session] });
      }
      return acc;
   }, [sessions]);

   return (
      <>
         {open && (
            <button
               aria-label="Close sidebar"
               onClick={onToggle}
               className="fixed inset-0 z-30 bg-canvas/70 lg:hidden"
            />
         )}

         <aside
            className={`absolute inset-y-0 left-0 z-40 flex h-full flex-col overflow-hidden border-r border-line bg-surface transition-all duration-200 ease-out lg:relative lg:inset-auto lg:z-20 ${
               open ? "w-[268px] translate-x-0" : "w-[268px] -translate-x-full lg:w-0 lg:translate-x-0"
            }`}
         >
            <div className="flex h-full w-[268px] flex-col">
               {/* Header */}
               <div className="flex items-center gap-2 border-b border-line px-3 py-3">
                  <IconButton label="Back to home" onClick={onHome}>
                     <ArrowLeftIcon className="h-4 w-4" />
                  </IconButton>
                  <span className="flex-1 truncate px-1 font-display text-[14px] font-semibold tracking-tight text-ink">
                     Chats
                  </span>
                  <IconButton label="Collapse sidebar" onClick={onToggle}>
                     <PanelLeftIcon className="h-4 w-4" />
                  </IconButton>
               </div>

               {/* New chat */}
               <div className="px-3 py-3">
                  <button
                     onClick={onNewChat}
                     className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface-raised px-3 py-2.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-accent/40 hover:text-accent"
                  >
                     <PlusIcon className="h-4 w-4" />
                     New chat
                  </button>
               </div>

               {/* History */}
               <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                  {groups.length === 0 && (
                     <p className="px-3 py-8 text-center text-[12.5px] text-ink-faint">No chats yet</p>
                  )}

                  {groups.map((group) => (
                     <div key={group.label} className="mb-4">
                        <p className="label px-3 pb-2 pt-2">{group.label}</p>
                        <div className="space-y-0.5">
                           {group.items.map((session) => {
                              const active = session.id === activeId;
                              return (
                                 <div
                                    key={session.id}
                                    className={`group relative flex items-center rounded-lg pr-1 text-[13px] transition-colors duration-150 ${
                                       active
                                          ? "bg-surface-raised text-ink"
                                          : "text-ink-muted hover:bg-surface-raised/60 hover:text-ink"
                                    }`}
                                 >
                                    {active && (
                                       <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-accent" />
                                    )}
                                    <button
                                       onClick={() => onSelect(session.id)}
                                       className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-3 text-left"
                                    >
                                       <MessageIcon
                                          className={`h-[15px] w-[15px] shrink-0 ${
                                             active ? "text-accent" : "text-ink-faint"
                                          }`}
                                       />
                                       <span className="truncate">{session.title}</span>
                                    </button>
                                    <button
                                       onClick={() => onDelete(session.id)}
                                       aria-label="Delete chat"
                                       className="shrink-0 rounded p-1.5 text-ink-faint opacity-0 transition-all duration-150 hover:text-rose-400 focus:opacity-100 group-hover:opacity-100"
                                    >
                                       <TrashIcon className="h-[15px] w-[15px]" />
                                    </button>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Footer */}
               <div className="border-t border-line px-5 py-3.5">
                  <p className="label">{sessions.length} conversations</p>
               </div>
            </div>
         </aside>
      </>
   );
}

function IconButton({
   label,
   onClick,
   children,
}: {
   label: string;
   onClick: () => void;
   children: React.ReactNode;
}) {
   return (
      <button
         onClick={onClick}
         aria-label={label}
         className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-ink-dim transition-colors duration-150 hover:border-line-strong hover:text-ink"
      >
         {children}
      </button>
   );
}
