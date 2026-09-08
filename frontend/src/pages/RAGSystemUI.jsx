import { useEffect, useRef, useState } from "react";

const DUMMY_DOCUMENTS = [
   { id: 1, name: "Product Manual v2.pdf" },
   { id: 2, name: "Q3 Financial Report.pdf" },
   { id: 3, name: "Research Paper - NLP.pdf" },
   { id: 4, name: "Company Policy 2024.pdf" },
];

const DUMMY_MESSAGES = [
   { userId: "abc", AI: "Hello! I've analyzed the selected document. Ask me anything about its contents." },
   { userId: "abc", AI: "Based on the document, the key findings suggest a 23% improvement in overall efficiency when applying the proposed methodology." },
];

const UserIcon = () => (
   <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      U
   </div>
);

const BotIcon = () => (
   <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
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
      <div className="flex items-end gap-3 mb-4">
         <BotIcon />
         <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1 items-center h-4">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
         </div>
      </div>
   );
}

export default function RAGSystemUI() {
   const [selectedDoc, setSelectedDoc] = useState(DUMMY_DOCUMENTS[0]);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const [uploadedDocs, setUploadedDocs] = useState(DUMMY_DOCUMENTS);
   const [messages, setMessages] = useState(
      DUMMY_MESSAGES.map((m, i) => ({
         id: i,
         role: i % 2 === 0 ? "user" : "ai",
         content: i % 2 === 0 ? "Can you summarize the document for me?" : m.AI,
         userId: m.userId,
      }))
   );


   const [input, setInput] = useState("");
   const [isTyping, setIsTyping] = useState(false);
   const fileInputRef = useRef(null);
   const messagesEndRef = useRef(null);
   const dropdownRef = useRef(null);

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
      function handleClickOutside(e) {
         if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setDropdownOpen(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const handleSend = () => {
      if (!input.trim()) return;
      const userMsg = { id: Date.now(), role: "user", content: input, userId: "abc" };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
         setIsTyping(false);
         const aiMsg = {
            id: Date.now() + 1,
            role: "ai",
            content: `Based on "${selectedDoc.name}", here's what I found: This is a placeholder AI response. Integrate your RAG pipeline here to return real answers from the document.`,
            userId: "abc",
         };
         setMessages((prev) => [...prev, aiMsg]);
      }, 1800);
   };

   const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleSend();
      }
   };

   const handleFileUpload = async (e) => {
      console.log("File input changed:", e.target.files);

      const file = e.target.files[0];
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
         const newDoc = {
            id: data.doc_id,
            name: data.filename,
            chunks: data.chunk_count,
         };

         setUploadedDocs((prev) => [...prev, newDoc]);
         setSelectedDoc(newDoc);

      } catch (error) {
         console.error(error);
         alert(error.message);
      }

      e.target.value = "";
   };

   return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
         {/* ── Header ── */}
         <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                     <polyline points="14 2 14 8 20 8" />
                     <line x1="16" y1="13" x2="8" y2="13" />
                     <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
               </div>
               <div>
                  <h1 className="text-base font-semibold text-slate-100 leading-tight">DocMind RAG</h1>
                  <p className="text-xs text-slate-500">Retrieval-Augmented Generation</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs text-slate-400">System Online</span>
            </div>
         </header>

         {/* ── Toolbar ── */}
         <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mr-1">Context</span>

            {/* Document Dropdown */}
            <div className="relative" ref={dropdownRef}>
               <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500 text-slate-200 text-sm px-3 py-2 rounded-lg transition-all duration-150 min-w-52"
               >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                     <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="flex-1 text-left truncate">{selectedDoc.name}</span>
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
                  <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                     <div className="px-3 py-2 border-b border-slate-700">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Select Document</p>
                     </div>
                     <div className="max-h-52 overflow-y-auto">
                        {uploadedDocs.map((doc) => (
                           <button
                              key={doc.id}
                              onClick={() => { setSelectedDoc(doc); setDropdownOpen(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${selectedDoc.id === doc.id ? "bg-indigo-600/20 text-indigo-300" : "text-slate-300"}`}
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
               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-2 rounded-lg transition-all duration-150 font-medium"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
               </svg>
               Upload PDF
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />

            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
               </svg>
               {uploadedDocs.length} document{uploadedDocs.length !== 1 ? "s" : ""} loaded
            </div>
         </div>

         {/* ── Chat Area ── */}
         <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <div className="max-w-3xl mx-auto">
               {/* Context pill */}
               <div className="flex justify-center mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-400 text-xs px-3 py-1.5 rounded-full">
                     <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                     </svg>
                     Chatting with <span className="text-indigo-400 font-medium">{selectedDoc.name}</span>
                  </span>
               </div>

               {messages.map((msg) =>
                  msg.role === "user" ? (
                     /* User message – right aligned */
                     <div key={msg.id} className="flex items-end justify-end gap-3 mb-4">
                        <div className="max-w-lg">
                           <p className="text-xs text-slate-500 text-right mb-1 mr-1">You</p>
                           <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed shadow-lg shadow-indigo-900/30">
                              {msg.content}
                           </div>
                        </div>
                        <UserIcon />
                     </div>
                  ) : (
                     /* AI message – left aligned */
                     <div key={msg.id} className="flex items-end gap-3 mb-4">
                        <BotIcon />
                        <div className="max-w-lg">
                           <p className="text-xs text-slate-500 mb-1 ml-1">DocMind AI</p>
                           <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-200 leading-relaxed shadow-lg shadow-black/20">
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
         <div className="bg-slate-900 border-t border-slate-800 px-4 py-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex items-end gap-3">
               <div className="flex-1 bg-slate-800 border border-slate-700 focus-within:border-indigo-500 rounded-2xl px-4 py-3 transition-colors duration-150">
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
                     className="w-full bg-transparent text-slate-100 text-sm placeholder-slate-500 resize-none outline-none leading-relaxed"
                     style={{ maxHeight: "120px" }}
                  />
               </div>
               <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 shadow-lg shadow-indigo-900/40"
               >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                     <line x1="22" y1="2" x2="11" y2="13" />
                     <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
               </button>
            </div>
            <p className="text-center text-xs text-slate-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
         </div>
      </div>
   );
}
