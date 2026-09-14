import { useCallback, useState } from "react";
import { CpuIcon, SendIcon, SparkleIcon } from "../components/icons";

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
    <div className="min-h-screen bg-canvas text-ink-muted">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-raised text-accent">
            <SparkleIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="font-display text-[17px] font-semibold tracking-tight text-ink">
              Proposal Outline Agent
            </h1>
            <p className="label mt-0.5">AI-powered proposal generation</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="space-y-6">
          {/* Assistant opener */}
          <Row author="Assistant" icon>
            <p className="text-[14px] leading-relaxed text-ink-muted">
              Hello! How can I assist you today?
            </p>
          </Row>

          {/* User answer — selectable */}
          <Row author="You">
            <p ref={containerRef} className="text-[14px] leading-relaxed text-ink">
              {answer}
            </p>
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-line" />
          </Row>
        </div>

        {selectedText && (
          <div className="mt-8 rounded-xl border border-accent/30 bg-accent-soft/40 p-4">
            <p className="label mb-2.5">Selected text</p>
            <input
              type="text"
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-colors duration-150 focus:border-accent/60"
            />
          </div>
        )}

        {/* Composer */}
        <div className="mt-10 flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 transition-colors duration-150 focus-within:border-accent/50">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe the proposal you need…"
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            aria-label="Send message"
            disabled={!inputValue.trim()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg transition-colors duration-150 hover:bg-accent-hover disabled:bg-surface-hover disabled:text-ink-faint"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

function Row({
  author,
  icon = false,
  children,
}: {
  author: string;
  icon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-surface-raised text-[11px] font-medium text-ink-dim">
        {icon ? <CpuIcon className="h-[15px] w-[15px]" /> : author[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="label mb-1.5">{author}</p>
        {children}
      </div>
    </div>
  );
}
