import { useCallback, useState } from "react";

export default function ProposalOutlineAgent() {
  const [inputValue, setInputValue] = useState("");
  const answer = "Hello! This is your answer?";

  const [selectedText, setSelectedText] = useState("");

  const containerRef = useCallback((node: HTMLParagraphElement | null) => {
    if (!node) return;

    const handleMouseUp = () => {
      // Small timeout lets the browser finalize the selection
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (!text) return;

        // Only trigger if selection is inside our element
        const range = selection?.getRangeAt(0);
        if (!node.contains(range?.commonAncestorContainer ?? null)) return;

        setSelectedText(text);
      }, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-sans flex flex-col items-center px-4 py-10" style={{ width: '90vw' }}>
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-3 mb-2">
          {/* Icon placeholder */}
          <div className="w-10 h-10 rounded-lg bg-orange-400/20 flex items-center justify-center">
            <span className="text-orange-400 text-lg">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-400 tracking-tight">
            Proposal Outline Agent
          </h1>
        </div>
        <p className="text-gray-400 text-sm">AI-Powered Proposal Generation Assistant</p>
      </div>

      {/* Chat Interface Container */}
      <div className="w-full max-w-3xl">
        {/* Chat Interface Title */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white text-lg">💬</span>
          <h2 className="text-xl font-semibold text-white">Chat Interface</h2>
        </div>

        <div className="bg-[#0f1117] space-y-4 text-sm leading-relaxed mb-6">
          <p className="text-white">Hello! How can I assist you today?</p>
        </div>

        {/* Input Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 bg-[#1c1f2e] border border-gray-700 rounded-xl px-4 py-3">
            <div className="w-5 h-5 rounded bg-purple-500/30 flex items-center justify-center text-xs">
              🤖
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
            />
          </div>
        </div>

        {/* Assistant Response */}


        {/* Bottom user input bubble (partially visible) */}
        <div className="my-6">
          <div className="bg-blue-50 rounded-2xl px-5 py-4 max-w-[85%] ml-auto shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-orange-300 flex items-center justify-center text-xs">
                🧡
              </div>
              <p ref={containerRef} className="text-gray-900">{answer}</p>
            </div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

      {selectedText && (
        <div className="mb-6">
          <div className="flex items-center gap-2 bg-[#1c1f2e] border border-gray-700 rounded-xl px-4 py-3">
            <div className="w-5 h-5 rounded bg-purple-500/30 flex items-center justify-center text-xs">
              🤖
            </div>
            <input
              type="text"
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              // placeholder="Type your message..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
