import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AgentCard from "../components/AgentCard";
import type { Agent } from "../components/AgentCard";
import ProfileMenu from "../components/ProfileMenu";
import Sidebar from "../components/Sidebar";
import type { RootState } from "../store";
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
  const user = useSelector((state: RootState) => state.auth.user);

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
    <div className="flex min-h-screen bg-canvas text-ink-muted">
      <Sidebar items={LIVE_AGENTS} activeId="home" onSelect={handleSelect} />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-canvas/90 px-6 py-3.5 backdrop-blur md:px-10">
          <p className="flex-1 truncate text-[13.5px] text-ink-muted">
            {greetingForNow()}
            {user?.name ? <span className="text-ink">, {user.name}</span> : null}
          </p>

          <button
            type="button"
            className="hidden items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink-dim transition-colors duration-150 hover:border-line-strong hover:text-ink-muted sm:flex"
          >
            <SearchIcon className="h-4 w-4" />
            Search agents
            <kbd className="ml-6 rounded border border-line px-1.5 font-mono text-[10px] text-ink-faint">
              /
            </kbd>
          </button>

          <ProfileMenu onLogin={() => navigate("/login")} onSignup={() => navigate("/signup")} />
        </header>

        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-dots mask-fade-b opacity-70" />

          <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
            {/* Hero */}
            <section className="max-w-2xl pt-14">
              <p className="label">AI workspace</p>
              <h1 className="mt-4 font-display text-[30px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[40px] lg:text-[46px]">
                Meet your AI agents,{" "}
                <br className="hidden sm:block" />
                all in one place.
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
                A growing collection of AI agents and RAG chatbots. Pick one from the rail or a card
                below to get started.
              </p>
            </section>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <Stat value={String(LIVE_AGENTS.length)} label="Agents live" />
              <Stat value={String(UPCOMING_AGENTS.length)} label="In development" />
              <Stat value="$0.00" label="Cost today" />
            </div>

            {/* Available now */}
            <section className="mt-16">
              <SectionHeader title="Available now" meta={`${LIVE_AGENTS.length} agents`} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {LIVE_AGENTS.map((agent, i) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={i}
                    onOpen={() => openRoute(agent.route)}
                  />
                ))}
              </div>
            </section>

            {/* Coming soon */}
            <section className="mt-14">
              <SectionHeader title="Coming soon" meta={`${UPCOMING_AGENTS.length} in build`} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {UPCOMING_AGENTS.map((agent, i) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={LIVE_AGENTS.length + i}
                    onOpen={() => undefined}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line pb-3">
      <h2 className="font-display text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
      <span className="label tabular">{meta}</span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-6 py-5">
      <p className="tabular font-display text-[26px] font-semibold tracking-tight text-ink">
        {value}
      </p>
      <p className="label mt-1.5">{label}</p>
    </div>
  );
}
