import { useMemo } from "react";

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
               className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            />
         )}

         <aside
            className={`absolute inset-y-0 left-0 z-40 flex h-full flex-col overflow-hidden border-r border-slate-800/70 bg-slate-950/80 backdrop-blur-xl transition-all duration-200 ease-out lg:relative lg:inset-auto lg:z-20 ${
               open ? "w-72 translate-x-0" : "-translate-x-full w-72 lg:w-0 lg:translate-x-0"
            }`}
         >
            <div className="flex h-full w-72 flex-col">
               {/* Header */}
               <div className="flex items-center gap-2 px-3 pb-2 pt-3">
                  <button
                     onClick={onHome}
                     aria-label="Back to home"
                     className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-100"
                  >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                     </svg>
                  </button>
                  <span className="flex-1 truncate text-sm font-semibold text-white">Chats</span>
                  <button
                     onClick={onToggle}
                     aria-label="Collapse sidebar"
                     className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-100"
                  >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M9 4v16" />
                     </svg>
                  </button>
               </div>

               {/* New chat */}
               <div className="px-3 pb-2">
                  <button
                     onClick={onNewChat}
                     className="flex w-full items-center gap-2 rounded-xl border border-slate-800 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 px-3 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:border-indigo-500/50 hover:from-indigo-500/25"
                  >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                     </svg>
                     New chat
                  </button>
               </div>

               {/* History */}
               <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                  {groups.length === 0 && (
                     <p className="px-3 py-6 text-center text-xs text-slate-600">No chats yet</p>
                  )}

                  {groups.map((group) => (
                     <div key={group.label} className="mb-3">
                        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                           {group.label}
                        </p>
                        <div className="space-y-0.5">
                           {group.items.map((session) => {
                              const active = session.id === activeId;
                              return (
                                 <div
                                    key={session.id}
                                    className={`group flex items-center gap-1 rounded-lg pr-1 text-sm transition-colors ${
                                       active
                                          ? "bg-slate-800 text-white"
                                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                                    }`}
                                 >
                                    <button
                                       onClick={() => onSelect(session.id)}
                                       className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-3 text-left"
                                    >
                                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-70">
                                          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.3A8 8 0 1 1 21 12Z" />
                                       </svg>
                                       <span className="truncate">{session.title}</span>
                                    </button>
                                    <button
                                       onClick={() => onDelete(session.id)}
                                       aria-label="Delete chat"
                                       className="shrink-0 rounded p-1.5 text-slate-500 opacity-0 transition-opacity hover:text-rose-400 focus:opacity-100 group-hover:opacity-100"
                                    >
                                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M3 6h18" />
                                          <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                                          <path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
                                       </svg>
                                    </button>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Footer */}
               <div className="border-t border-slate-800/70 p-3">
                  <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                     <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-slate-900">
                        U
                     </span>
                     <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-sm font-medium text-slate-200">Your workspace</span>
                        <span className="block truncate text-[11px] text-slate-500">Free plan</span>
                     </span>
                  </div>
               </div>
            </div>
         </aside>
      </>
   );
}
