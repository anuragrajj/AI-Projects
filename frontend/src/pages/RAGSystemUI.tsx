import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import ChatSessionSidebar from "../components/ChatSessionSidebar";

type Doc = {
   id: number | string;
   name: string;
   chunks?: number;
};

type ChatMessage = {
   id: number;
   role: "user" | "ai";
   content: string;
   userId: string;
};

type ChatSession = {
   id: string;
   title: string;
   docName: string;
   messages: ChatMessage[];
   updatedAt: number;
};

const DUMMY_DOCUMENTS: Doc[] = [
   { id: 1, name: "Product Manual v2.pdf" },
   { id: 2, name: "Q3 Financial Report.pdf" },
   { id: 3, name: "Research Paper - NLP.pdf" },
   { id: 4, name: "Company Policy 2024.pdf" },
];

const NOW = Date.now();
const DAY = 86_400_000;

// Dummy chat history — replace with real sessions from your backend later.
const DUMMY_SESSIONS: ChatSession[] = [
   {
      id: "s-1",
      title: "Q3 revenue drivers",
      docName: "Q3 Financial Report.pdf",
      updatedAt: NOW - 3 * 60 * 1000,
      messages: [
         { id: 1, role: "user", content: "What were the main revenue drivers in Q3?", userId: "abc" },
         { id: 2, role: "ai", content: "Q3 revenue grew 18% QoQ, led by enterprise subscriptions (+31%) with a smaller lift from professional services (+7%). Net churn held flat at 1.9%.", userId: "abc" },
         { id: 3, role: "user", content: "How did that compare to the forecast?", userId: "abc" },
         { id: 4, role: "ai", content: "It landed roughly 4% ahead of the mid-point forecast of $42.1M, mostly because two enterprise deals pulled forward from Q4.", userId: "abc" },
      ],
   },
   {
      id: "s-2",
      title: "Remote work eligibility",
      docName: "Company Policy 2024.pdf",
      updatedAt: NOW - 55 * 60 * 1000,
      messages: [
         { id: 1, role: "user", content: "Who is eligible for fully remote work?", userId: "abc" },
         { id: 2, role: "ai", content: "Per section 4.2, employees with 6+ months tenure in a role designated 'location-flexible' may request fully remote status, subject to manager approval.", userId: "abc" },
      ],
   },
   {
      id: "s-3",
      title: "NLP paper — evaluation setup",
      docName: "Research Paper - NLP.pdf",
      updatedAt: NOW - DAY - 2 * 3600 * 1000,
      messages: [
         { id: 1, role: "user", content: "Summarize the evaluation methodology.", userId: "abc" },
         { id: 2, role: "ai", content: "They evaluate on GLUE plus two in-house datasets, reporting the mean of 5 seeds. Significance is tested with McNemar's test; both accuracy and macro-F1 are reported.", userId: "abc" },
         { id: 3, role: "user", content: "What baselines did they use?", userId: "abc" },
         { id: 4, role: "ai", content: "A fine-tuned BERT-base and a frozen-encoder linear probe. Their method beats BERT-base by 2.3 macro-F1 on average.", userId: "abc" },
      ],
   },
   {
      id: "s-4",
      title: "First-time product setup",
      docName: "Product Manual v2.pdf",
      updatedAt: NOW - DAY - 9 * 3600 * 1000,
      messages: [
         { id: 1, role: "user", content: "What are the first-time setup steps?", userId: "abc" },
         { id: 2, role: "ai", content: "1) Mount the base unit, 2) connect power and wait for the amber LED, 3) pair via the mobile app, 4) run the calibration wizard. Full details are in chapter 2.", userId: "abc" },
      ],
   },
   {
      id: "s-5",
      title: "Efficiency methodology claim",
      docName: "Q3 Financial Report.pdf",
      updatedAt: NOW - 4 * DAY,
      messages: [
         { id: 1, role: "user", content: "Where does the 23% efficiency figure come from?", userId: "abc" },
         { id: 2, role: "ai", content: "From the operations appendix: a pilot across 3 sites measured a 23% reduction in average handling time after the new workflow, versus the prior quarter's baseline.", userId: "abc" },
      ],
   },
   {
      id: "s-6",
      title: "New-hire equipment policy",
      docName: "Company Policy 2024.pdf",
      updatedAt: NOW - 12 * DAY,
      messages: [
         { id: 1, role: "user", content: "What equipment does a new hire receive?", userId: "abc" },
         { id: 2, role: "ai", content: "A laptop (Mac or Windows), one external monitor, and a $150 accessories stipend. Anything above that goes through IT procurement.", userId: "abc" },
      ],
   },
];

const UserIcon = () => (
   <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
      U
   </div>
);

const BotIcon = () => (
   <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
         <rect x="3" y="11" width="18" height="10" rx="2" />
         <circle cx="12" cy="5" r="2" />
         <path d="M12 7v4" />
         <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" strokeLinecap="round" />
         <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round" />
         <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" strokeLinecap="round" />
      </svg>
   </div>
);

function TypingIndicator() {
   return (
      <div className="mb-4 flex items-end gap-3">
         <BotIcon />
         <div className="rounded-2xl rounded-bl-sm border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div className="flex h-4 items-center gap-1">
               <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "0ms" }} />
               <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "150ms" }} />
               <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "300ms" }} />
            </div>
         </div>
      </div>
   );
}

export default function RAGSystemUI() {
   const navigate = useNavigate();

   const [selectedDoc, setSelectedDoc] = useState<Doc>(DUMMY_DOCUMENTS[1]);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const [uploadedDocs, setUploadedDocs] = useState<Doc[]>(DUMMY_DOCUMENTS);
   const [messages, setMessages] = useState<ChatMessage[]>(DUMMY_SESSIONS[0].messages);

   const [sessions, setSessions] = useState<ChatSession[]>(DUMMY_SESSIONS);
   const [activeSessionId, setActiveSessionId] = useState<string>(DUMMY_SESSIONS[0].id);
   const [sidebarOpen, setSidebarOpen] = useState(true);

   const [input, setInput] = useState("");
   const [isTyping, setIsTyping] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const getData = async () => {
      // const controller = new AbortController();

      // api.get("/todos/1", {
      //    signal: controller.signal,
      // });

      // // cancel when needed
      // controller.abort();
      const getRes = await fetch("http://127.0.0.1:8000/api/documents", {
         method: "GET",
         // body: formData,
      });
      console.log("Upload response status:", getRes.status);
   }

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      getData();
   }, [messages, isTyping]);

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setDropdownOpen(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // Full-bleed view: index.css / App.css cap and center #root globally. Override
   // those inline (beats the stylesheet) while this page is mounted, then restore.
   useEffect(() => {
      const rootEl = document.getElementById("root");
      const body = document.body;
      const prev = {
         maxWidth: rootEl?.style.maxWidth ?? "",
         margin: rootEl?.style.margin ?? "",
         padding: rootEl?.style.padding ?? "",
         width: rootEl?.style.width ?? "",
         textAlign: rootEl?.style.textAlign ?? "",
         bodyDisplay: body.style.display,
      };
      if (rootEl) {
         rootEl.style.maxWidth = "none";
         rootEl.style.margin = "0";
         rootEl.style.padding = "0";
         rootEl.style.width = "100%";
         rootEl.style.textAlign = "left";
      }
      body.style.display = "block";
      return () => {
         if (rootEl) {
            rootEl.style.maxWidth = prev.maxWidth;
            rootEl.style.margin = prev.margin;
            rootEl.style.padding = prev.padding;
            rootEl.style.width = prev.width;
            rootEl.style.textAlign = prev.textAlign;
         }
         body.style.display = prev.bodyDisplay;
      };
   }, []);

   // Keep the active session's transcript in sync with the visible messages.
   useEffect(() => {
      setSessions((prev) =>
         prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            const firstUser = messages.find((m) => m.role === "user");
            const title = s.title === "New chat" && firstUser ? firstUser.content.slice(0, 40) : s.title;
            return { ...s, messages, title };
         })
      );
   }, [messages, activeSessionId]);

   const handleSend = () => {
      if (!input.trim()) return;
      const userMsg: ChatMessage = { id: Date.now(), role: "user", content: input, userId: "abc" };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
         setIsTyping(false);
         const aiMsg: ChatMessage = {
            id: Date.now() + 1,
            role: "ai",
            content: `Based on "${selectedDoc.name}", here's what I found: This is a placeholder AI response. Integrate your RAG pipeline here to return real answers from the document.`,
            userId: "abc",
         };
         setMessages((prev) => [...prev, aiMsg]);
      }, 1800);
   };

   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleSend();
      }
   };

   const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      console.log("File input changed:", e.target.files);

      const file = e.target.files?.[0];
      if (!file) return;

      // Optional: basic validation
      if (file.type !== "application/pdf") {
         alert("Only PDF files allowed");
         return;
      }

      const formData = new FormData();
      formData.append("file", file); // MUST match FastAPI param

      try {
         console.log("Uploading file:", file.name);

         const response = await fetch("http://127.0.0.1:8000/api/upload", {
            method: "POST",
            body: formData,
         });
         console.log("Upload response status:", response.status);


         if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Upload failed");
         }

         const data = await response.json();

         // Use backend response
         const newDoc: Doc = {
            id: data.doc_id,
            name: data.filename,
            chunks: data.chunk_count,
         };

         setUploadedDocs((prev) => [...prev, newDoc]);
         setSelectedDoc(newDoc);

      } catch (error) {
         console.error(error);
         alert(error instanceof Error ? error.message : "Upload failed");
      }

      e.target.value = "";
   };

   // ── Session management (dummy) ──
   const selectSession = (id: string) => {
      const session = sessions.find((s) => s.id === id);
      if (!session) return;
      setActiveSessionId(id);
      setMessages(session.messages);
      setInput("");
      const doc = uploadedDocs.find((d) => d.name === session.docName);
      if (doc) setSelectedDoc(doc);
   };

   const newChat = () => {
      const fresh: ChatSession = {
         id: `s-${Date.now()}`,
         title: "New chat",
         docName: selectedDoc.name,
         messages: [],
         updatedAt: Date.now(),
      };
      setSessions((prev) => [fresh, ...prev]);
      setActiveSessionId(fresh.id);
      setMessages([]);
      setInput("");
   };

   const deleteSession = (id: string) => {
      const next = sessions.filter((s) => s.id !== id);
      if (next.length === 0) {
         const fresh: ChatSession = {
            id: `s-${Date.now()}`,
            title: "New chat",
            docName: selectedDoc.name,
            messages: [],
            updatedAt: Date.now(),
         };
         setSessions([fresh]);
         setActiveSessionId(fresh.id);
         setMessages([]);
         return;
      }
      setSessions(next);
      if (id === activeSessionId) {
         setActiveSessionId(next[0].id);
         setMessages(next[0].messages);
      }
   };

   return (
      <div className="relative flex h-screen overflow-hidden bg-[#080b13] font-sans text-slate-300">
         {/* ── Ambient background glow ── */}
         <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl" />
         </div>

         {/* ── Chat session rail ── */}
         <ChatSessionSidebar
            sessions={sessions}
            activeId={activeSessionId}
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            onSelect={selectSession}
            onNewChat={newChat}
            onDelete={deleteSession}
            onHome={() => navigate("/")}
         />

         <div className="relative z-10 flex min-w-0 flex-1 flex-col">
            {/* ── Header ── */}
           

            {/* ── Toolbar ── */}
            <div className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b border-slate-800/70 bg-slate-950/40 px-4 py-3 backdrop-blur-xl sm:px-6">
               <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Context</span>

               {/* Document Dropdown */}
               <div className="relative" ref={dropdownRef}>
                  <button
                     onClick={() => setDropdownOpen((o) => !o)}
                     className="flex min-w-[13rem] items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-indigo-500/60 hover:bg-slate-900"
                  >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                     </svg>
                     <span className="flex-1 truncate text-left">{selectedDoc.name}</span>
                     <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                        className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                     >
                        <polyline points="6 9 12 15 18 9" />
                     </svg>
                  </button>

                  {dropdownOpen && (
                     <div className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
                        <div className="border-b border-slate-800 px-3 py-2">
                           <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Select document</p>
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                           {uploadedDocs.map((doc) => (
                              <button
                                 key={doc.id}
                                 onClick={() => { setSelectedDoc(doc); setDropdownOpen(false); }}
                                 className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${selectedDoc.id === doc.id ? "bg-indigo-500/15 text-indigo-300" : "text-slate-300 hover:bg-slate-800"}`}
                              >
                                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                 </svg>
                                 <span className="truncate">{doc.name}</span>
                                 {selectedDoc.id === doc.id && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" className="ml-auto flex-shrink-0">
                                       <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                 )}
                              </button>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               {/* Upload Button */}
               <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5"
               >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                     <polyline points="17 8 12 3 7 8" />
                     <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload PDF
               </button>
               <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />

               <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                     <circle cx="12" cy="12" r="10" />
                     <line x1="12" y1="8" x2="12" y2="12" />
                     <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {uploadedDocs.length} document{uploadedDocs.length !== 1 ? "s" : ""} loaded
               </div>
            </div>

            {/* ── Chat Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
               <div className="mx-auto max-w-3xl">
                  {/* Context pill */}
                  <div className="mb-6 flex justify-center">
                     <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-200">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                           <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                           <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Chatting with <span className="font-semibold text-indigo-300">{selectedDoc.name}</span>
                     </span>
                  </div>

                  {messages.length === 0 && !isTyping && (
                     <div className="mt-16 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.3A8 8 0 1 1 21 12Z" />
                           </svg>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-300">Ask anything about your document</p>
                        <p className="mt-1 text-xs text-slate-500">Your questions and answers stay in this chat.</p>
                     </div>
                  )}

                  {messages.map((msg) =>
                     msg.role === "user" ? (
                        /* User message – right aligned */
                        <div key={msg.id} className="mb-4 flex items-end justify-end gap-3">
                           <div className="max-w-lg">
                              <p className="mb-1 mr-1 text-right text-[11px] text-slate-500">You</p>
                              <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-3 text-sm leading-relaxed text-white shadow-lg shadow-indigo-900/30">
                                 {msg.content}
                              </div>
                           </div>
                           <UserIcon />
                        </div>
                     ) : (
                        /* AI message – left aligned */
                        <div key={msg.id} className="mb-4 flex items-end gap-3">
                           <BotIcon />
                           <div className="max-w-lg">
                              <p className="mb-1 ml-1 text-[11px] text-slate-500">DocMind AI</p>
                              <div className="rounded-2xl rounded-bl-sm border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-relaxed text-slate-200 shadow-lg shadow-black/20">
                                 {msg.content}
                              </div>
                           </div>
                        </div>
                     )
                  )}

                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
               </div>
            </div>

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 border-t border-slate-800/70 bg-slate-950/60 px-4 py-4 backdrop-blur-xl">
               <div className="mx-auto flex max-w-3xl items-end gap-3">
                  <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 transition-colors duration-150 focus-within:border-indigo-500/70">
                     <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => {
                           setInput(e.target.value);
                           e.target.style.height = "auto";
                           e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask anything about ${selectedDoc.name}…`}
                        className="w-full resize-none bg-transparent text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-500"
                        style={{ maxHeight: "120px" }}
                     />
                  </div>
                  <button
                     onClick={handleSend}
                     disabled={!input.trim() || isTyping}
                     aria-label="Send message"
                     className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40 transition-all duration-150 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none"
                  >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                     </svg>
                  </button>
               </div>
               <p className="mt-2 text-center text-[11px] text-slate-600">Press Enter to send · Shift+Enter for new line</p>
            </div>
         </div>
      </div>
   );
}
