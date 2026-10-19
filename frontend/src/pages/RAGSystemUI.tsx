import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import ChatSessionSidebar from "../components/ChatSessionSidebar";
import DocumentsModal from "../components/DocumentsModal";
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
import {
   useCreateChatSessionMutation,
   useDeleteChatSessionMutation,
   useLazyGetChatSessionsQuery,
   useLazyGetRagDocsQuery,
   useLazyGetSessionDocumentQuery,
   useLazyGetSessionMessagesQuery,
   useSendChatMessageMutation,
} from "../services/apis";
import { uploadDocument } from "../services/documentApi";
import type { DocumentDto } from "../services/documentApi";
import { errorMessage } from "../services/helper";
import { setLoading } from "../store/slices/LoaderSlice";
import { useDispatch } from "react-redux";

type Doc = {
   id: string;
   name: string;
   chunks?: number;
};

type ChatMessage = {
   id: string;
   role: "user" | "ai";
   content: string;
};

type ChatSession = {
   id: string;
   title: string;
   documentId: string | null;
   updatedAt: number;
};

// Shapes the backend returns (backend/src/rag/rag_schemas.py).
type SessionDto = { id: string; title: string | null; document_id: string | null; updated_at: string };
type MessageDto = { id: string; role: "user" | "assistant"; content: string };

const toDoc = (d: DocumentDto): Doc => ({ id: d.id, name: d.file_name, chunks: d.chunk_count });
const toSession = (s: SessionDto): ChatSession => ({
   id: s.id,
   title: s.title || "New chat",
   documentId: s.document_id,
   updatedAt: Date.parse(s.updated_at),
});
const toMessage = (m: MessageDto): ChatMessage => ({
   id: m.id,
   role: m.role === "user" ? "user" : "ai",
   content: m.content,
});

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
   const [getRagDocs] = useLazyGetRagDocsQuery();
   const [getChatSessions] = useLazyGetChatSessionsQuery();
   const [getSessionDocument] = useLazyGetSessionDocumentQuery();
   const [getSessionMessages] = useLazyGetSessionMessagesQuery();
   const [createChatSession] = useCreateChatSessionMutation();
   const [deleteChatSession] = useDeleteChatSessionMutation();
   const [sendChatMessage] = useSendChatMessageMutation();
   const dispatch = useDispatch();

   const [sessions, setSessions] = useState<ChatSession[]>([]);
   // Three states: nothing open (both empty), a saved chat (activeSessionId), or a new chat being set up (isNewChat).
   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
   const [isNewChat, setIsNewChat] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(true);
   const [docsOpen, setDocsOpen] = useState(false);

   // The document list is only loaded and shown for a new chat; a saved chat shows just its own document.
   const [documents, setDocuments] = useState<Doc[]>([]);
   const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const [isUploading, setIsUploading] = useState(false);

   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [input, setInput] = useState("");
   const [isLoadingChat, setIsLoadingChat] = useState(false);
   // The chat waiting for an answer: a session id, or "new" until that chat's session exists.
   const [pendingChat, setPendingChat] = useState<string | null>(null);

   // Same value as the open chat, readable from async callbacks so a late response never lands in another chat.
   const openChatRef = useRef<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const isTyping = pendingChat !== null && pendingChat === (activeSessionId ?? (isNewChat ? "new" : null));
   const canChat = selectedDoc !== null && !isLoadingChat;
   // Deleting a document detaches its chats (their document_id becomes null): the history stays readable, but they can't take new messages.
   const isDocDeleted =
      activeSessionId !== null && !isLoadingChat && sessions.find((s) => s.id === activeSessionId)?.documentId === null;

   const openChat = (sessionId: string | null, newChat = false) => {
      openChatRef.current = sessionId ?? (newChat ? "new" : null);
      setActiveSessionId(sessionId);
      setIsNewChat(newChat);
      setSelectedDoc(null);
      setMessages([]);
      setInput("");
      setDropdownOpen(false);
      setIsLoadingChat(false);
   };

   // 1. On open: load the user's chats into the sidebar.
   useEffect(() => {
      getChatSessions({})
         .unwrap()
         .then((res: SessionDto[]) => setSessions(res.map(toSession)))
         .catch((error) => console.error("Could not load chats:", error));
   }, [getChatSessions]);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

   // 2. Clicking a chat: fetch the document it is connected to (pre-selected) and its messages.
   const selectSession = async (id: string) => {
      openChat(id);
      setIsLoadingChat(true);
      try {
         const [doc, history]: [DocumentDto | null, MessageDto[]] = await Promise.all([
            getSessionDocument({ pathParam: `${id}/document` }).unwrap(),
            getSessionMessages({ pathParam: `${id}/messages` }).unwrap(),
         ]);
         if (openChatRef.current !== id) return; // another chat was opened while this one loaded
         setSelectedDoc(doc ? toDoc(doc) : null);
         if (!doc) setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, documentId: null } : s)));
         setMessages(history.map(toMessage));
         setIsLoadingChat(false);
      } catch (error) {
         console.error("Could not load chat:", error);
         if (openChatRef.current !== id) return;
         setIsLoadingChat(false);
         alert(errorMessage(error, "Could not load this chat"));
      }
   };

   // 3. New chat: the only place the document list and the upload button are shown.
   const newChat = async () => {
      openChat(null, true);
      try {
         const res: DocumentDto[] = await getRagDocs({ status: "ready" }).unwrap();
         setDocuments(res.map(toDoc));
      } catch (error) {
         console.error("Could not load documents:", error);
      }
   };

   const handleSend = async () => {
      const content = input.trim();
      if (!content || !selectedDoc || !canChat || pendingChat) return;

      let chat = activeSessionId ?? "new";
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setPendingChat(chat);
      setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content }]);

      try {
         let sessionId = activeSessionId;
         if (!sessionId) {
            // First message of a new chat: create its session, connected to the chosen document.
            const created: SessionDto = await createChatSession({
               title: content.slice(0, 40),
               document_id: selectedDoc.id,
            }).unwrap();
            sessionId = created.id;
            chat = created.id;
            setSessions((prev) => [toSession(created), ...prev]);
            setPendingChat(created.id);
            if (openChatRef.current === "new") {
               // Still on the new-chat screen: it now becomes this saved chat (document locked in).
               openChatRef.current = created.id;
               setActiveSessionId(created.id);
               setIsNewChat(false);
               setDropdownOpen(false);
            }
         }

         const reply: MessageDto = await sendChatMessage({ pathParam: `${sessionId}/messages`, content }).unwrap();
         if (openChatRef.current === sessionId) setMessages((prev) => [...prev, toMessage(reply)]);
         setSessions((prev) => {
            const current = prev.find((s) => s.id === sessionId);
            if (!current) return prev;
            return [{ ...current, updatedAt: Date.now() }, ...prev.filter((s) => s.id !== sessionId)];
         });
      } catch (error) {
         console.error("Could not send message:", error);
         if (openChatRef.current === chat) {
            const text = errorMessage(error, "Sorry, I couldn't get an answer. Please try again.");
            setMessages((prev) => [...prev, { id: `error-${Date.now()}`, role: "ai", content: text }]);
         }
      } finally {
         setPendingChat(null);
      }
   };

   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleSend();
      }
   };

   const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // so picking the same file again still fires onChange
      if (!file) return;

      if (file.type !== "application/pdf") {
         alert("Only PDF files allowed");
         return;
      }

      dispatch(setLoading(true));

      setIsUploading(true);
      try {
         const newDoc = toDoc(await uploadDocument(file));
         setDocuments((prev) => [newDoc, ...prev]);
         if (openChatRef.current === "new") setSelectedDoc(newDoc);
      } catch (error) {
         console.error(error);
         alert(error instanceof Error ? error.message : "Upload failed");
      } finally {
         setIsUploading(false);
         dispatch(setLoading(false));
      }
   };

   // The Docs modal does the upload/delete itself; these keep this page's state in step with it.
   const handleDocUploaded = (doc: DocumentDto) => {
      if (doc.status !== "ready") return; // only searchable documents can be chosen as context
      setDocuments((prev) => [toDoc(doc), ...prev.filter((d) => d.id !== doc.id)]);
   };

   const handleDocDeleted = (id: string) => {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      // The backend detaches every chat that used this document; mirror that so they stop accepting messages.
      setSessions((prev) => prev.map((s) => (s.documentId === id ? { ...s, documentId: null } : s)));
      if (selectedDoc?.id === id) setSelectedDoc(null);
   };

   const deleteSession = async (id: string) => {
      try {
         await deleteChatSession({ pathParam: id }).unwrap();
      } catch (error) {
         alert(errorMessage(error, "Could not delete this chat"));
         return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (openChatRef.current === id) openChat(null);
   };

   const hasChatOpen = activeSessionId !== null || isNewChat;
   let emptyHint = "Pick a chat from the sidebar, or start a new one.";
   if (isLoadingChat) emptyHint = "Loading chat…";
   else if (selectedDoc) emptyHint = `Answers are grounded in ${selectedDoc.name}`;
   else if (isNewChat) emptyHint = "Choose a document above, or upload a PDF, to begin.";
   else if (isDocDeleted) emptyHint = "Document deleted";
   else if (activeSessionId) emptyHint = "The document for this chat is no longer available.";

   return (
      <div className="relative flex h-screen overflow-hidden bg-canvas text-ink-muted">
         {/* ── Chat session rail ── */}
         <ChatSessionSidebar
            sessions={sessions}
            activeId={activeSessionId ?? ""}
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            onSelect={selectSession}
            onNewChat={newChat}
            onDelete={deleteSession}
            onHome={() => navigate("/")}
            onOpenDocs={() => setDocsOpen(true)}
         />

         {docsOpen && (
            <DocumentsModal
               onClose={() => setDocsOpen(false)}
               onUploaded={handleDocUploaded}
               onDeleted={handleDocDeleted}
            />
         )}

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

               {isNewChat ? (
                  <>
                     <span className="label mr-1 hidden sm:block">Context</span>

                     {/* Document Dropdown */}
                     <div className="relative" ref={dropdownRef}>
                        <button
                           onClick={() => setDropdownOpen((o) => !o)}
                           className="flex min-w-[14rem] items-center gap-2.5 rounded-lg border border-line bg-surface-raised px-3 py-2 text-[13px] text-ink transition-colors duration-150 hover:border-line-strong"
                        >
                           <FileIcon className="h-4 w-4 shrink-0 text-accent" />
                           <span className="flex-1 truncate text-left">{selectedDoc?.name ?? "Select a document"}</span>
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
                                 {documents.length === 0 && (
                                    <p className="px-3 py-4 text-[12.5px] text-ink-faint">No documents yet. Upload a PDF to begin.</p>
                                 )}
                                 {documents.map((doc) => (
                                    <button
                                       key={doc.id}
                                       onClick={() => { setSelectedDoc(doc); setDropdownOpen(false); }}
                                       className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                                          selectedDoc?.id === doc.id
                                             ? "bg-surface-hover text-ink"
                                             : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                                       }`}
                                    >
                                       <FileIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                                       <span className="truncate">{doc.name}</span>
                                       {selectedDoc?.id === doc.id && (
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
                        disabled={isUploading}
                        className="flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-fg transition-colors duration-150 hover:bg-accent-hover disabled:bg-surface-hover disabled:text-ink-faint"
                     >
                        <UploadIcon className="h-4 w-4" />
                        {isUploading ? "Uploading…" : "Upload PDF"}
                     </button>
                     <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />

                     <div className="ml-auto flex items-center gap-2 text-[12px] text-ink-dim">
                        <InfoIcon className="h-3.5 w-3.5" />
                        <span className="tabular">
                           {documents.length} document{documents.length !== 1 ? "s" : ""} loaded
                        </span>
                     </div>
                  </>
               ) : activeSessionId ? (
                  <>
                     <span className="label mr-1 hidden sm:block">Context</span>

                     {/* A saved chat stays with its document, so it is shown but can't be switched. */}
                     <div className="flex min-w-[14rem] items-center gap-2.5 rounded-lg border border-line bg-surface-raised px-3 py-2 text-[13px] text-ink">
                        <FileIcon className="h-4 w-4 shrink-0 text-accent" />
                        <span className="flex-1 truncate">
                           {isLoadingChat ? "Loading…" : selectedDoc?.name ?? (isDocDeleted ? "Document deleted" : "Document no longer available")}
                        </span>
                     </div>
                  </>
               ) : (
                  <span className="label py-2">Select a chat or start a new one</span>
               )}
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
                           {hasChatOpen ? "Ask anything about your document" : "Your document chats"}
                        </p>
                        <p className="mt-2 text-[13px] text-ink-dim">{emptyHint}</p>
                     </div>
                  ) : (
                     <div className="mb-8 flex items-center gap-2.5 border-b border-line pb-4">
                        <FileIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                        <p className="label truncate">Chatting with {selectedDoc?.name ?? "a deleted document"}</p>
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
                                    className={`whitespace-pre-wrap rounded-xl border px-4 py-3 text-[14px] leading-[1.7] text-ink ${
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
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        disabled={!canChat}
                        onChange={(e) => {
                           setInput(e.target.value);
                           e.target.style.height = "auto";
                           e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedDoc ? `Ask anything about ${selectedDoc.name}…` : emptyHint}
                        className="w-full resize-none bg-transparent py-1 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
                        style={{ maxHeight: "120px" }}
                     />
                     <button
                        onClick={handleSend}
                        disabled={!input.trim() || !canChat || pendingChat !== null}
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
