import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import ChatSessionSidebar from "../components/ChatSessionSidebar";
import {
   CheckIcon,
   ChevronDownIcon,
   CpuIcon,
   FileIcon,
   InfoIcon,
   MessageIcon,
   PanelLeftIcon,
   SendIcon,
   UploadIcon,
} from "../components/icons";

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

function Avatar({ role }: { role: "user" | "ai" }) {
   return (
      <span
         className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border text-[11px] font-medium ${
            role === "user"
               ? "border-line bg-surface-raised text-ink-muted"
               : "border-accent/30 bg-accent-soft text-accent"
         }`}
      >
         {role === "user" ? "U" : <CpuIcon className="h-[15px] w-[15px]" />}
      </span>
   );
}

function TypingIndicator() {
   return (
      <div className="flex gap-3.5">
         <Avatar role="ai" />
         <div className="pt-1.5">
            <span className="flex items-center gap-1">
               {[0, 1, 2].map((i) => (
                  <span
                     key={i}
                     className="h-1.5 w-1.5 animate-blink rounded-full bg-ink-dim"
                     style={{ animationDelay: `${i * 160}ms` }}
                  />
               ))}
            </span>
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
      <div className="relative flex h-screen overflow-hidden bg-canvas text-ink-muted">
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
            {/* ── Toolbar ── */}
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5 border-b border-line bg-surface px-4 py-3 sm:px-6">
               {!sidebarOpen && (
                  <button
                     onClick={() => setSidebarOpen(true)}
                     aria-label="Open sidebar"
                     className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-ink-dim transition-colors duration-150 hover:border-line-strong hover:text-ink"
                  >
                     <PanelLeftIcon className="h-4 w-4" />
                  </button>
               )}

               <span className="label mr-1 hidden sm:block">Context</span>

               {/* Document Dropdown */}
               <div className="relative" ref={dropdownRef}>
                  <button
                     onClick={() => setDropdownOpen((o) => !o)}
                     className="flex min-w-[14rem] items-center gap-2.5 rounded-lg border border-line bg-surface-raised px-3 py-2 text-[13px] text-ink transition-colors duration-150 hover:border-line-strong"
                  >
                     <FileIcon className="h-4 w-4 shrink-0 text-accent" />
                     <span className="flex-1 truncate text-left">{selectedDoc.name}</span>
                     <ChevronDownIcon
                        className={`h-3.5 w-3.5 shrink-0 text-ink-dim transition-transform duration-150 ${
                           dropdownOpen ? "rotate-180" : ""
                        }`}
                     />
                  </button>

                  {dropdownOpen && (
                     <div className="absolute left-0 top-full z-30 mt-2 w-80 animate-fade-up overflow-hidden rounded-xl border border-line bg-surface-raised shadow-pop">
                        <div className="border-b border-line px-3 py-2.5">
                           <p className="label">Select document</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-1">
                           {uploadedDocs.map((doc) => (
                              <button
                                 key={doc.id}
                                 onClick={() => { setSelectedDoc(doc); setDropdownOpen(false); }}
                                 className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                                    selectedDoc.id === doc.id
                                       ? "bg-surface-hover text-ink"
                                       : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                                 }`}
                              >
                                 <FileIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                                 <span className="truncate">{doc.name}</span>
                                 {selectedDoc.id === doc.id && (
                                    <CheckIcon className="ml-auto h-3.5 w-3.5 shrink-0 text-accent" />
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
                  className="flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-fg transition-colors duration-150 hover:bg-accent-hover"
               >
                  <UploadIcon className="h-4 w-4" />
                  Upload PDF
               </button>
               <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />

               <div className="ml-auto flex items-center gap-2 text-[12px] text-ink-dim">
                  <InfoIcon className="h-3.5 w-3.5" />
                  <span className="tabular">
                     {uploadedDocs.length} document{uploadedDocs.length !== 1 ? "s" : ""} loaded
                  </span>
               </div>
            </div>

            {/* ── Chat Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
               <div className="mx-auto max-w-2xl">
                  {messages.length === 0 && !isTyping ? (
                     <div className="mt-24 text-center">
                        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-accent">
                           <MessageIcon className="h-5 w-5" />
                        </span>
                        <p className="mt-5 font-display text-[17px] font-semibold tracking-tight text-ink">
                           Ask anything about your document
                        </p>
                        <p className="mt-2 text-[13px] text-ink-dim">
                           Answers are grounded in{" "}
                           <span className="text-ink-muted">{selectedDoc.name}</span>
                        </p>
                     </div>
                  ) : (
                     <div className="mb-8 flex items-center gap-2.5 border-b border-line pb-4">
                        <FileIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                        <p className="label truncate">Chatting with {selectedDoc.name}</p>
                     </div>
                  )}

                  <div className="space-y-6">
                     {messages.map((msg) => {
                        const isUser = msg.role === "user";
                        return (
                           <div
                              key={msg.id}
                              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                           >
                              {!isUser && <Avatar role="ai" />}

                              <div className={`min-w-0 max-w-[80%] ${isUser ? "items-end" : ""}`}>
                                 <p className={`label mb-1.5 ${isUser ? "text-right" : ""}`}>
                                    {isUser ? "You" : "DocMind AI"}
                                 </p>
                                 <div
                                    className={`rounded-xl border px-4 py-3 text-[14px] leading-[1.7] text-ink ${
                                       isUser
                                          ? "rounded-tr-sm border-accent/30 bg-accent-soft"
                                          : "rounded-tl-sm border-line bg-surface"
                                    }`}
                                 >
                                    {msg.content}
                                 </div>
                              </div>

                              {isUser && <Avatar role="user" />}
                           </div>
                        );
                     })}

                     {isTyping && <TypingIndicator />}
                  </div>
                  <div ref={messagesEndRef} />
               </div>
            </div>

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 border-t border-line bg-surface px-4 py-4 sm:px-6">
               <div className="mx-auto max-w-2xl">
                  <div className="flex items-end gap-2.5 rounded-xl border border-line bg-surface-raised px-4 py-3 transition-colors duration-150 focus-within:border-accent/50">
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
                        className="w-full resize-none bg-transparent py-1 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
                        style={{ maxHeight: "120px" }}
                     />
                     <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        aria-label="Send message"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg transition-colors duration-150 hover:bg-accent-hover disabled:bg-surface-hover disabled:text-ink-faint"
                     >
                        <SendIcon className="h-4 w-4" />
                     </button>
                  </div>
                  <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-label text-ink-faint">
                     Enter to send · Shift + Enter for new line
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}
