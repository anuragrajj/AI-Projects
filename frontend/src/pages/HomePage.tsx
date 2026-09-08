import { useNavigate } from "react-router-dom";
import AgentCard from "../components/AgentCard";
import type { Agent } from "../components/AgentCard";
import ProfileMenu from "../components/ProfileMenu";
import Sidebar from "../components/Sidebar";
import {
  BriefcaseIcon,
  ChartIcon,
  DocChatIcon,
  GridIcon,
  SearchIcon,
  SparkleIcon,
} from "../components/icons";

/** Agents that are ready to use today. */
const LIVE_AGENTS: Agent[] = [
  {
    id: "doc-chat",
    name: "Talk to your document",
    tagline: "RAG chatbot",
    description:
      "Upload PDFs, notes or reports and ask questions in plain language. Answers come back grounded in your files, with the passages they were drawn from.",
    tags: ["PDF & docs", "Citations", "Semantic search"],
    icon: DocChatIcon,
    accent: "from-indigo-500 to-violet-600",
    glow: "hover:shadow-indigo-500/20",
    status: "live",
    route: "/rag-agent",
  },
  {
    id: "resume-jobs",
    name: "Upload resume – find jobs",
    tagline: "Job-matching agent",
    description:
      "Drop in your resume and let the agent surface roles that fit your experience, flag the gaps, and tailor your application to each posting.",
    tags: ["Resume parsing", "Job search", "Skill matching"],
    icon: BriefcaseIcon,
    accent: "from-emerald-500 to-teal-600",
    glow: "hover:shadow-emerald-500/20",
    status: "live",
    route: "/resume-jobs",
  },
];

/** Placeholder cards for agents still in development. */
const UPCOMING_AGENTS: Agent[] = [
  {
    id: "meeting-notes",
    name: "Meeting notes summarizer",
    tagline: "Summary agent",
    description:
      "Turn transcripts and recordings into clean summaries, decisions and action items ready to share with your team.",
    tags: ["Transcripts", "Action items"],
    icon: SparkleIcon,
    accent: "from-amber-500 to-orange-600",
    glow: "",
    status: "soon",
    route: "",
  },
  {
    id: "codebase-qa",
    name: "Codebase Q&A",
    tagline: "Developer agent",
    description:
      "Ask questions about a repository and get answers with links to the exact files and lines involved.",
    tags: ["Code search", "Repo-aware"],
    icon: GridIcon,
    accent: "from-sky-500 to-blue-600",
    glow: "",
    status: "soon",
    route: "",
  },
  {
    id: "data-analyst",
    name: "Data analyst",
    tagline: "Analytics agent",
    description:
      "Connect a spreadsheet or CSV and ask for charts, trends and plain-English explanations of the numbers.",
    tags: ["CSV & sheets", "Charts"],
    icon: ChartIcon,
    accent: "from-rose-500 to-pink-600",
    glow: "",
    status: "soon",
    route: "",
  },
];

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const navigate = useNavigate();

  const openRoute = (route: string) => {
    if (route) navigate(route);
  };

  const handleSelect = (id: string) => {
    if (id === "home") {
      navigate("/");
      return;
    }
    const agent = LIVE_AGENTS.find((a) => a.id === id);
    if (agent) openRoute(agent.route);
  };

  return (
    <div className="flex min-h-screen bg-[#080b13] text-slate-300">
      {/*
        index.css / App.css constrain and center #root globally. Neutralise that
        for this full-bleed layout only while the homepage is mounted — React
        removes this <style> again on navigation, so no other page is touched.
      */}
      <style>{`
        #root { max-width: none; margin: 0; padding: 0; text-align: left; }
        body { display: block; }
      `}</style>

      <Sidebar items={LIVE_AGENTS} activeId="home" onSelect={handleSelect} />

      <main className="relative flex-1 overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl" />
        </div>

        <div className="relative h-screen overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-4 md:px-10">
            {/* Top bar */}
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{greetingForNow()} 👋</p>
                <h1 className="mt-0.5 text-lg font-semibold text-white">Your workspace</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-500 sm:flex">
                  <SearchIcon className="h-4 w-4" />
                  <span>Search agents</span>
                  <kbd className="ml-4 rounded border border-slate-700 bg-slate-800 px-1.5 text-[11px] text-slate-400">
                    /
                  </kbd>
                </div>
                <ProfileMenu
                  onLogin={() => navigate("/login")}
                  onSignup={() => navigate("/signup")}
                />
              </div>
            </header>

            {/* Hero */}
            <section className="mt-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                <SparkleIcon className="h-3.5 w-3.5" />
                AI workspace
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                Meet your AI agents, all in one place.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                A growing collection of AI agents and RAG chatbots. Pick one from the sidebar or a
                card below to get started — more are on the way.
              </p>
            </section>

            {/* Stats */}
            <div className="mt-7 flex flex-wrap gap-3">
              <StatPill value={String(LIVE_AGENTS.length)} label="Agents live" />
              <StatPill value={String(UPCOMING_AGENTS.length)} label="In development" />
              <StatPill value="$0.00" label="Your cost today" />
            </div>

            {/* Available now */}
            <section className="mt-10">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Available now
                </h3>
                <span className="text-xs text-slate-600">{LIVE_AGENTS.length} agents</span>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {LIVE_AGENTS.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onOpen={() => openRoute(agent.route)} />
                ))}
              </div>
            </section>

            {/* Coming soon */}
            <section className="mt-12 pb-10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Coming soon
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {UPCOMING_AGENTS.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onOpen={() => undefined} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5">
      <span className="text-base font-semibold text-white">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
