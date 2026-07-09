import { CSSProperties, FormEvent, ReactNode, useState } from "react";
import { Check, BookOpen, ChevronRight, Upload, Users, BarChart2, Tag, FileText, MessageSquare, ListChecks } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// ─── Design tokens ────────────────────────────────────────────────────────────

const INK = "#1C1812";
const PAPER = "#F5F0E8";
const CARD = "#FDFAF4";
const WARM = "#EDE8DC";
const OXBLOOD = "#7B1D1D";
const FOREST = "#2C3E2D";
const MUTED = "#8B7355";
const BODY = "#4A4035";
const MONO = "'DM Mono', monospace";
const SERIF = "'EB Garamond', serif";
const SANS = "'Inter', sans-serif";
const waitlistEndpoint = "/api/waitlist";
const premiumEase = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.22,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(5px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.72, delay, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

function Lift({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -3,
              boxShadow:
                "0 18px 48px rgba(28,24,18,0.10), 0 2px 8px rgba(28,24,18,0.05)",
            }
      }
      transition={{ duration: 0.32, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

// ─── Annotation tag palette ───────────────────────────────────────────────────

const TAGS = {
  confusing:  { label: "Confusing",        bg: "rgba(123,29,29,0.11)",  color: OXBLOOD,   bar: OXBLOOD },
  strong:     { label: "Strong line",       bg: "rgba(44,62,45,0.11)",   color: FOREST,    bar: FOREST },
  pacing:     { label: "Pacing issue",      bg: "rgba(139,100,40,0.12)", color: "#7A5020", bar: "#7A5020" },
  missing:    { label: "Missing context",   bg: "rgba(70,80,140,0.1)",   color: "#424878", bar: "#424878" },
  emotional:  { label: "Emotional impact",  bg: "rgba(60,100,70,0.11)",  color: "#2D5E3A", bar: "#2D5E3A" },
} as const;

type TagKey = keyof typeof TAGS;

// ─── Inline annotation span ───────────────────────────────────────────────────

function Ann({
  tag, count, children, active, onClick,
}: {
  tag: TagKey; count: number; children: ReactNode;
  active: boolean; onClick: () => void;
}) {
  const t = TAGS[tag];
  return (
    <span
      onClick={onClick}
      className="cursor-pointer relative inline"
      style={{
        background: active ? t.bg.replace("0.11", "0.22").replace("0.12", "0.24").replace("0.1", "0.2") : t.bg,
        borderBottom: `1.5px solid ${t.color}`,
        padding: "0 2px",
        transition: "background 0.15s",
      }}
    >
      {children}
      <span
        className="ml-1 text-[9px] align-super"
        style={{ fontFamily: MONO, color: t.color, opacity: 0.8 }}
      >
        {count}
      </span>
    </span>
  );
}

// ─── Tag badge ────────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: TagKey }) {
  const t = TAGS[tag];
  return (
    <span
      className="inline-flex items-center text-[9px] px-1.5 py-0.5 uppercase tracking-wide"
      style={{ background: t.bg, color: t.color, fontFamily: MONO, border: `1px solid ${t.color}30` }}
    >
      {t.label}
    </span>
  );
}

// ─── Annotations data ─────────────────────────────────────────────────────────

type Annotation = {
  id: string;
  tag: TagKey;
  phrase: string;
  comments: { reader: string; text: string }[];
};

const annotations: Annotation[] = [
  {
    id: "a1",
    tag: "confusing",
    phrase: "each one a different lie",
    comments: [
      { reader: "Sarah K.", text: "Different from what? The previous chapter established these maps as accurate — this contradicts without explanation." },
      { reader: "Marcus R.", text: "Confused me too. Are the maps wrong on purpose or because they're outdated?" },
      { reader: "Priya N.", text: "I had to reread the opening twice. The contradiction needs a beat of clarification." },
    ],
  },
  {
    id: "a2",
    tag: "strong",
    phrase: "he said, his voice carrying the weight of thirty years",
    comments: [
      { reader: "Sarah K.", text: "This landed. The compression of time in 'thirty years' is doing exactly the right work." },
      { reader: "Priya N.", text: "Best line in the chapter. The voice earned it." },
      { reader: "Tom W.", text: "Stopped here and read it again. Quietly devastating." },
      { reader: "Diana L.", text: "This is the emotional center — make sure the rest earns it." },
    ],
  },
  {
    id: "a3",
    tag: "pacing",
    phrase: "The commission had seemed straightforward",
    comments: [
      { reader: "Marcus R.", text: "We've been told this before. If you're repeating it, the scene needs to earn the repetition." },
      { reader: "Tom W.", text: "The pacing slowed here. I expected the guild meeting to start immediately." },
    ],
  },
  {
    id: "a4",
    tag: "missing",
    phrase: "he realized they already knew",
    comments: [
      { reader: "Sarah K.", text: "Knew what, exactly? I don't have enough context about what the guild's expectations are." },
      { reader: "Priya N.", text: "This felt abrupt — what did they know? The scene needs grounding before this reveal." },
    ],
  },
];

// ─── Reader mockup panel ──────────────────────────────────────────────────────

function ReaderPanel() {
  const [activeId, setActiveId] = useState<string | null>("a2");
  const active = annotations.find((a) => a.id === activeId) ?? null;

  const ann = (id: string) => {
    const a = annotations.find((x) => x.id === id)!;
    return (
      <Ann tag={a.tag} count={a.comments.length} active={activeId === id} onClick={() => setActiveId(activeId === id ? null : id)}>
        {a.phrase}
      </Ann>
    );
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr", minHeight: "380px" }}>
      <div className="grid md:grid-cols-[1fr_260px]" style={{ minHeight: "380px" }}>
        {/* Manuscript text */}
        <div className="p-6 overflow-y-auto" style={{ borderRight: "1px solid rgba(28,24,18,0.08)" }}>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[9px] uppercase tracking-widest" style={{ fontFamily: MONO, color: MUTED }}>Chapter 3</span>
            <div className="h-px flex-1" style={{ background: "rgba(28,24,18,0.1)" }} />
            <div className="flex gap-1.5">
              {(Object.keys(TAGS) as TagKey[]).map((k) => (
                <TagBadge key={k} tag={k} />
              ))}
            </div>
          </div>
          <div
            className="leading-[1.85] text-[13px]"
            style={{ fontFamily: SERIF, color: INK, fontSize: "0.95rem" }}
          >
            <p className="mb-4">
              The cartographer spread his maps across the table,{" "}
              {ann("a1")}. He had spent thirty years drawing borders
              that never existed and coastlines that had shifted since the surveys were done.
              The guild had never asked him to be accurate. They had asked him to be useful.
            </p>
            <p className="mb-4">
              &ldquo;I mapped the world as it should be,&rdquo;{" "}
              {ann("a2")}
              , carrying the weight of careful deception. &ldquo;What you do with those maps
              is your own affair.&rdquo;
            </p>
            <p className="mb-4">
              {ann("a3")} enough when the guild first approached him — a coastal survey,
              they had said, nothing more. Now, surrounded by their silence and the smell
              of old parchment, he felt the familiar vertigo of a man standing at the edge
              of an unmapped place.
            </p>
            <p>
              He looked up from the table and{" "}
              {ann("a4")} — had known, perhaps, before he had walked
              through the door. The silence was not hostile. It was expectant.
            </p>
          </div>
        </div>

        {/* Annotation panel */}
        <div className="p-4" style={{ background: "rgba(245,240,232,0.4)" }}>
          {active ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TagBadge tag={active.tag} />
                <span className="text-[9px]" style={{ fontFamily: MONO, color: MUTED }}>
                  {active.comments.length} readers
                </span>
              </div>
              <p
                className="text-[11px] italic mb-4 pb-3"
                style={{ fontFamily: SERIF, color: BODY, borderBottom: "1px solid rgba(28,24,18,0.1)" }}
              >
                &ldquo;{active.phrase}&rdquo;
              </p>
              <div className="space-y-3">
                {active.comments.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold"
                        style={{ background: INK, color: PAPER }}
                      >
                        {c.reader[0]}
                      </div>
                      <span className="text-[10px] font-medium" style={{ fontFamily: SANS, color: INK }}>
                        {c.reader}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed pl-5" style={{ fontFamily: SERIF, color: BODY }}>
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full pt-12 text-center">
              <span className="text-[11px] italic" style={{ fontFamily: SERIF, color: MUTED }}>
                Click a highlighted passage to see what readers said.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard / priorities panel ─────────────────────────────────────────────

function PrioritiesPanel() {
  const repeated = [
    { tag: "confusing" as TagKey, count: 18, chapters: "Ch 3, 5, 7" },
    { tag: "pacing" as TagKey, count: 11, chapters: "Ch 4, 6, 7" },
    { tag: "missing" as TagKey, count: 9, chapters: "Ch 3, 8" },
    { tag: "emotional" as TagKey, count: 6, chapters: "Ch 2, 5" },
    { tag: "strong" as TagKey, count: 21, chapters: "Ch 2, 3, 5, 9" },
  ];
  const strongest = [
    { chapter: "Ch 3", scene: "The guild confrontation", score: 4 },
    { chapter: "Ch 2", scene: "Opening paragraph", score: 4 },
    { chapter: "Ch 5", scene: "The border crossing", score: 3 },
  ];
  const attention = [
    { chapter: "Ch 7", issue: "Scene clarity — 4 readers flagged confusion" },
    { chapter: "Ch 4", issue: "Pacing in the guild intro — 3 flags" },
    { chapter: "Ch 3", issue: "Missing context before the reveal" },
  ];
  const readers = [
    { name: "Priya N.", avatar: "P", chapter: 9, total: 9, status: "finished" },
    { name: "Sarah K.", avatar: "S", chapter: 7, total: 9, status: "reading" },
    { name: "Marcus R.", avatar: "M", chapter: 5, total: 9, status: "reading" },
    { name: "Tom W.", avatar: "T", chapter: 4, total: 9, status: "inactive" },
    { name: "Diana L.", avatar: "D", chapter: 2, total: 9, status: "reading" },
  ];
  const maxCount = Math.max(...repeated.map((r) => r.count));

  return (
    <div className="p-5 grid md:grid-cols-2 gap-5" style={{ minHeight: "380px" }}>
      {/* Repeated issues */}
      <div className="p-4 border" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }}>
        <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
          Annotation frequency
        </div>
        <div className="space-y-2.5">
          {repeated.map((r) => (
            <div key={r.tag}>
              <div className="flex items-center justify-between mb-1">
                <TagBadge tag={r.tag} />
                <span className="text-[9px]" style={{ fontFamily: MONO, color: MUTED }}>
                  {r.count} notes · {r.chapters}
                </span>
              </div>
              <div className="h-1" style={{ background: "rgba(28,24,18,0.08)" }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(r.count / maxCount) * 100}%`,
                    background: TAGS[r.tag].bar,
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strongest moments */}
      <div className="p-4 border" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }}>
        <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
          Strongest moments
        </div>
        <div className="space-y-3 mb-5">
          {strongest.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <span className="text-[9px] mr-2" style={{ fontFamily: MONO, color: MUTED }}>{s.chapter}</span>
                <span className="text-[11px]" style={{ fontFamily: SERIF, color: INK }}>{s.scene}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5"
                    style={{ background: j < s.score ? FOREST : "rgba(28,24,18,0.1)" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] uppercase tracking-widest mb-2.5" style={{ fontFamily: MONO, color: MUTED }}>
          Needs attention
        </div>
        <div className="space-y-2">
          {attention.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[9px] mt-0.5 flex-shrink-0" style={{ fontFamily: MONO, color: OXBLOOD }}>{a.chapter}</span>
              <span className="text-[10px] leading-snug" style={{ color: BODY }}>{a.issue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reader progress — full width */}
      <div className="md:col-span-2 p-4 border" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }}>
        <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
          Reader progress
        </div>
        <div className="grid sm:grid-cols-5 gap-4">
          {readers.map((r) => (
            <div key={r.name}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0"
                  style={{
                    background: r.status === "finished" ? FOREST : r.status === "inactive" ? "rgba(28,24,18,0.2)" : OXBLOOD,
                    color: PAPER,
                  }}
                >
                  {r.avatar}
                </div>
                <span className="text-[10px] font-medium" style={{ fontFamily: SANS, color: INK }}>{r.name}</span>
              </div>
              <div className="h-1 mb-1" style={{ background: "rgba(28,24,18,0.08)" }}>
                <div
                  className="h-full"
                  style={{
                    width: `${(r.chapter / r.total) * 100}%`,
                    background: r.status === "finished" ? FOREST : r.status === "inactive" ? "rgba(28,24,18,0.25)" : OXBLOOD,
                  }}
                />
              </div>
              <span
                className="text-[9px]"
                style={{ fontFamily: MONO, color: MUTED }}
              >
                {r.status === "finished" ? "finished" : `ch ${r.chapter}/${r.total}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Product mockup container ─────────────────────────────────────────────────

function ProductMockup() {
  const [tab, setTab] = useState<"reader" | "priorities">("reader");
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="overflow-hidden"
      style={{
        border: "1px solid rgba(28,24,18,0.14)",
        background: CARD,
        boxShadow: "0 16px 56px rgba(28,24,18,0.12), 0 2px 8px rgba(28,24,18,0.06)",
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.992 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: premiumEase }}
    >
      {/* Browser chrome */}
      <div
        className="px-4 py-2.5 flex items-center gap-3 border-b"
        style={{ background: WARM, borderColor: "rgba(28,24,18,0.1)" }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(28,24,18,0.18)" }} />
          ))}
        </div>
        <div
          className="flex-1 px-3 py-0.5 text-[11px]"
          style={{ background: PAPER, border: "1px solid rgba(28,24,18,0.1)", color: MUTED, fontFamily: MONO }}
        >
          app.betamanuscript.com / manuscripts / the-last-cartographer / feedback
        </div>
      </div>

      {/* App toolbar */}
      <div
        className="px-5 py-2 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(28,24,18,0.08)" }}
      >
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: INK }}>
            The Last Cartographer
          </span>
          <span className="text-[10px]" style={{ fontFamily: MONO, color: MUTED }}>
            Draft 2 · 9 chapters · 5 readers · 64 annotations
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(["reader", "priorities"] as const).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 text-[10px] transition-colors cursor-pointer"
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.24, ease: premiumEase }}
              style={{
                fontFamily: MONO,
                background: tab === t ? INK : "transparent",
                color: tab === t ? PAPER : MUTED,
                border: `1px solid ${tab === t ? INK : "rgba(28,24,18,0.15)"}`,
              }}
            >
              {t === "reader" ? "Reader view" : "Revision priorities"}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: premiumEase }}
        >
          {tab === "reader" ? <ReaderPanel /> : <PrioritiesPanel />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="h-px w-6" style={{ background: "rgba(28,24,18,0.2)" }} />
      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTED, fontFamily: MONO }}>
        {children}
      </span>
    </div>
  );
}

function WaitlistForm({ label = "Join the waitlist", dark = false }: { label?: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const reduceMotion = useReducedMotion();

  async function submitWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(waitlistEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          source: "betamanuscript-waitlist",
          submittedAt: new Date().toISOString(),
          formStartedAt,
          website,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
          detail?: {
            message?: string;
          };
        } | null;
        const errorMessage =
          import.meta.env.DEV && errorPayload?.detail?.message
            ? `${errorPayload.error}: ${errorPayload.detail.message}`
            : errorPayload?.error;

        throw new Error(errorMessage ?? "Waitlist endpoint rejected the request");
      }

      setStatus("success");
      setMessage("You're on the list. Check your inbox for the discount note.");
      setEmail("");
      setWebsite("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something failed. Try again in a few seconds.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2.5 py-3" style={{ color: dark ? PAPER : OXBLOOD }}>
        <Check size={14} strokeWidth={2.5} />
        <span className="text-sm" style={{ fontFamily: MONO }}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitWaitlist}
      className="flex flex-col sm:flex-row"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="sr-only"
        aria-hidden="true"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status !== "loading") {
            setStatus("idle");
            setMessage("");
          }
        }}
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 text-sm border-y border-l focus:outline-none transition-colors"
        style={{
          background: dark ? "rgba(253,250,244,0.06)" : CARD,
          borderColor: dark ? "rgba(245,240,232,0.18)" : "rgba(28,24,18,0.2)",
          color: dark ? PAPER : INK,
          fontFamily: SANS,
        }}
      />
      <motion.button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 text-sm font-medium transition-colors cursor-pointer border whitespace-nowrap"
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.24, ease: premiumEase }}
        style={{
          background: dark ? PAPER : OXBLOOD,
          color: dark ? OXBLOOD : PAPER,
          borderColor: dark ? PAPER : OXBLOOD,
          fontFamily: SANS,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = dark ? "#EDE8DC" : "#691919";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = dark ? PAPER : OXBLOOD;
        }}
      >
        {status === "loading" ? "Joining..." : label}
      </motion.button>
      {status === "error" && (
        <p
          className="sm:col-span-2 mt-2 text-[11px]"
          style={{ color: dark ? "#F5B7B1" : OXBLOOD, fontFamily: MONO }}
          role="alert"
        >
          {message}
        </p>
      )}
    </form>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK, fontFamily: SANS }}>

      {/* Nav */}
      <motion.nav
        className="sticky top-0 z-20 border-b px-6 md:px-12 py-4 flex items-center justify-between"
        style={{ borderColor: "rgba(28,24,18,0.1)", background: "rgba(245,240,232,0.94)", backdropFilter: "blur(8px)" }}
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: premiumEase }}
      >
        <div className="flex items-center gap-2.5">
          <BookOpen size={16} strokeWidth={1.5} style={{ color: OXBLOOD }} />
          <span className="text-base font-semibold" style={{ fontFamily: SERIF, color: INK }}>
            BetaManuscript
          </span>
        </div>
        <a
          href="#cta"
          className="text-sm px-4 py-2 transition-colors"
          style={{ border: "1px solid rgba(28,24,18,0.2)", color: INK, fontFamily: SANS }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(28,24,18,0.05)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
        >
          Join the waitlist
        </a>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <motion.section
        className="relative z-10 px-6 md:px-12 pt-20 pb-28 max-w-5xl mx-auto"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.55, ease: premiumEase }}
      >
        <div className="grid md:grid-cols-[1fr_380px] gap-16 items-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(4px)" }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.82, delay: 0.08, ease: premiumEase }}
          >
            <h1
              className="mb-6 leading-[1.08]"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                fontWeight: 400,
                color: INK,
                letterSpacing: "-0.02em",
              }}
            >
              Turn beta reader feedback into clear{" "}
              <em>revision priorities.</em>
            </h1>
            <p
              className="text-lg mb-2 leading-relaxed max-w-lg"
              style={{ color: BODY, fontWeight: 300, lineHeight: 1.65 }}
            >
              Invite readers, collect structured annotations, spot repeated issues, and understand
              what works before you publish.
            </p>
            
            <div className="max-w-md">
              <WaitlistForm label="Join the waitlist" />
              <p className="text-[11px] mt-3" style={{ color: MUTED, fontFamily: MONO }}>
                Early access, launch discount code, and no spam.
              </p>
            </div>
          </motion.div>

          {/* Right: annotated preview card */}
          <motion.div
            className="hidden md:block"
            initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.99 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.82, delay: 0.2, ease: premiumEase }}
          >
            <div
              className="p-5 border"
              style={{ borderColor: "rgba(28,24,18,0.12)", background: CARD }}
            >
              <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
                Annotation summary — Chapter 3
              </div>
              <div className="space-y-2.5 mb-5">
                {[
                  { tag: "confusing" as TagKey, n: 18, note: "Scattered across 6 passages" },
                  { tag: "pacing" as TagKey, n: 11, note: "Guild intro and mid-scene" },
                  { tag: "missing" as TagKey, n: 9, note: "Context gaps before reveals" },
                  { tag: "strong" as TagKey, n: 21, note: "Strongest response in draft" },
                ].map((row) => (
                  <div key={row.tag} className="flex items-center justify-between gap-3">
                    <TagBadge tag={row.tag} />
                    <span className="text-[10px] flex-1" style={{ color: BODY }}>{row.note}</span>
                    <span className="text-[10px] font-medium" style={{ fontFamily: MONO, color: INK }}>{row.n}</span>
                  </div>
                ))}
              </div>
              <div
                className="pt-4 border-t"
                style={{ borderColor: "rgba(28,24,18,0.08)" }}
              >
                <div className="text-[9px] uppercase tracking-widest mb-2" style={{ fontFamily: MONO, color: MUTED }}>
                  Top revision note
                </div>
                <p
                  className="text-[12px] leading-relaxed italic"
                  style={{ fontFamily: SERIF, color: BODY }}
                >
                  &ldquo;The guild confrontation scene loses clarity mid-way. Three readers flagged confusion at the same passage.&rdquo;
                </p>
                <div className="mt-2 text-[9px]" style={{ fontFamily: MONO, color: MUTED }}>
                  — generated from 18 reader annotations
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Problem ──────────────────────────────────────────────────────────── */}
      <section
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(28,24,18,0.1)", background: WARM }}
      >
        <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
          <Reveal>
            <SectionLabel>The problem</SectionLabel>
            <h2
              className="mb-12 max-w-2xl"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                fontWeight: 400,
                color: INK,
                letterSpacing: "-0.015em",
              }}
            >
              Most beta reading rounds generate noise,
              <br />
              <em>not clarity.</em>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-px" style={{ background: "rgba(28,24,18,0.1)" }}>
            {[
              {
                glyph: "§",
                title: "Google Docs comments get messy fast",
                detail:
                  "Threads collapse, notes get buried, and unresolved comments pile up with no way to see what actually mattered to more than one reader.",
              },
              {
                glyph: "¶",
                title: "Feedback is scattered across Discord, email, forms, and notes",
                detail:
                  "You spend hours pulling responses together from five different places before you can even start to see what's working and what isn't.",
              },
              {
                glyph: "†",
                title: "It's hard to know which issues actually matter",
                detail:
                  "One reader's pet peeve is not the same as a structural problem. Without aggregation, everything looks equally urgent — and nothing gets fixed.",
              },
            ].map((card, i) => (
              <Lift key={i} className="p-8" style={{ background: WARM }}>
                <div
                  className="text-2xl mb-5"
                  style={{ fontFamily: SERIF, color: OXBLOOD, opacity: 0.55 }}
                >
                  {card.glyph}
                </div>
                <h3
                  className="mb-3 leading-snug"
                  style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 500, color: INK }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6456" }}>
                  {card.detail}
                </p>
              </Lift>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product preview ───────────────────────────────────────────────────── */}
      <section
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(28,24,18,0.1)" }}
      >
        <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
          <Reveal>
            <SectionLabel>Product preview</SectionLabel>
          </Reveal>
          <Reveal delay={0.08} className="grid md:grid-cols-[280px_1fr] gap-12 items-start mb-8">
            <div>
              <h2
                className="mb-4 leading-snug"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)",
                  fontWeight: 400,
                  color: INK,
                  letterSpacing: "-0.015em",
                }}
              >
                Structured feedback.
                <br />
                <em>Clear priorities.</em>
              </h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B6456" }}>
                Readers annotate directly in the text. You see which passages repeated across
                readers, what landed, and what needs work — all in one place.
              </p>
              <div className="space-y-2.5">
                {[
                  { tag: "confusing" as TagKey },
                  { tag: "strong" as TagKey },
                  { tag: "pacing" as TagKey },
                  { tag: "missing" as TagKey },
                  { tag: "emotional" as TagKey },
                ].map(({ tag }) => (
                  <div key={tag} className="flex items-center gap-2">
                    <TagBadge tag={tag} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {/* Annotation examples — styled as real marked-up text */}
              <Lift
                className="p-6 border"
                style={{ borderColor: "rgba(28,24,18,0.12)", background: CARD }}
              >
                <div className="text-[9px] uppercase tracking-widest mb-4" style={{ fontFamily: MONO, color: MUTED }}>
                  What readers see when they read
                </div>
                <p
                  className="leading-[2] mb-1"
                  style={{ fontFamily: SERIF, fontSize: "0.95rem", color: INK }}
                >
                  The cartographer spread his maps across the table,{" "}
                  <span style={{ background: TAGS.confusing.bg, borderBottom: `1.5px solid ${TAGS.confusing.color}`, padding: "0 2px" }}>
                    each one a different lie
                  </span>
                  <span className="text-[9px] ml-1 align-super" style={{ fontFamily: MONO, color: TAGS.confusing.color }}>3</span>
                  . &ldquo;I mapped the world as it should be,&rdquo;{" "}
                  <span style={{ background: TAGS.strong.bg, borderBottom: `1.5px solid ${TAGS.strong.color}`, padding: "0 2px" }}>
                    he said, his voice carrying the weight of thirty years
                  </span>
                  <span className="text-[9px] ml-1 align-super" style={{ fontFamily: MONO, color: TAGS.strong.color }}>4</span>
                  .{" "}
                  <span style={{ background: TAGS.pacing.bg, borderBottom: `1.5px solid ${TAGS.pacing.color}`, padding: "0 2px" }}>
                    The commission had seemed straightforward
                  </span>
                  <span className="text-[9px] ml-1 align-super" style={{ fontFamily: MONO, color: TAGS.pacing.color }}>2</span>
                  {" "}enough when the guild first approached him.
                </p>
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {(Object.keys(TAGS) as TagKey[]).map((k) => <TagBadge key={k} tag={k} />)}
                </div>
              </Lift>

              {/* Revision priority summary */}
              <Lift
                className="p-6 border"
                style={{ borderColor: "rgba(28,24,18,0.12)", background: CARD }}
              >
                <div className="text-[9px] uppercase tracking-widest mb-4" style={{ fontFamily: MONO, color: MUTED }}>
                  What you see in the revision dashboard
                </div>
                <div className="space-y-3">
                  {[
                    { tag: "confusing" as TagKey, count: 18, note: "6 passages across Ch 3, 5, 7" },
                    { tag: "pacing" as TagKey, count: 11, note: "Guild intro and mid-chapter" },
                    { tag: "strong" as TagKey, count: 21, note: "Strongest response in the draft" },
                  ].map((row) => (
                    <div key={row.tag}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <TagBadge tag={row.tag} />
                          <span className="text-[10px]" style={{ color: BODY }}>{row.note}</span>
                        </div>
                        <span className="text-[10px] font-medium" style={{ fontFamily: MONO, color: INK }}>{row.count}</span>
                      </div>
                      <div className="h-0.5" style={{ background: "rgba(28,24,18,0.08)" }}>
                        <div style={{ width: `${(row.count / 21) * 100}%`, height: "100%", background: TAGS[row.tag].bar, opacity: 0.65 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Lift>
            </div>
          </Reveal>
          <ProductMockup />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(28,24,18,0.1)", background: WARM }}
      >
        <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
          <Reveal>
            <SectionLabel>How it works</SectionLabel>
            <h2
              className="mb-14"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                fontWeight: 400,
                color: INK,
                letterSpacing: "-0.015em",
              }}
            >
              Three steps to a cleaner beta round.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: "01",
                Icon: Upload,
                title: "Add your manuscript by chapter",
                detail:
                  "Paste or upload your draft. Organize it by chapter so readers move through it in order and feedback is always tied to a specific location.",
              },
              {
                num: "02",
                Icon: Users,
                title: "Invite your beta readers",
                detail:
                  "Send invites by email. Readers get a clean reading view with annotation tools built in. No account or download required.",
              },
              {
                num: "03",
                Icon: BarChart2,
                title: "Review tagged feedback, surveys, and revision priorities",
                detail:
                  "See every annotation by tag and chapter. Spot which issues appear across multiple readers and turn that signal into a revision list.",
              },
            ].map((step, i) => (
              <Lift key={i} className="relative">
                <div className="text-[10px] mb-4" style={{ fontFamily: MONO, color: MUTED }}>
                  {step.num}
                </div>
                <div
                  className="w-9 h-9 flex items-center justify-center mb-5 border"
                  style={{ borderColor: "rgba(28,24,18,0.15)", background: PAPER, color: OXBLOOD }}
                >
                  <step.Icon size={16} strokeWidth={1.5} />
                </div>
                <h3
                  className="mb-3"
                  style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 500, color: INK }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6456" }}>
                  {step.detail}
                </p>
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-5 -right-7"
                    style={{ color: "rgba(28,24,18,0.2)" }}
                  >
                    <ChevronRight size={13} />
                  </div>
                )}
              </Lift>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(28,24,18,0.1)" }}
      >
        <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
          <Reveal>
            <SectionLabel>Features</SectionLabel>
            <h2
              className="mb-12 max-w-xl"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                fontWeight: 400,
                color: INK,
                letterSpacing: "-0.015em",
              }}
            >
              Built for authors who want signal,
              <em> not more noise.</em>
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-px" style={{ background: "rgba(28,24,18,0.1)" }}>
            {[
              {
                Icon: MessageSquare,
                title: "Structured annotations",
                tag: "Core",
                detail:
                  "Readers mark what works, what doesn't, and why — directly in the text. Every note is tied to a passage, a chapter, and a tag. No free-floating comments.",
              },
              {
                Icon: Tag,
                title: "Feedback tags",
                tag: "Core",
                detail:
                  "Filter annotations by pacing, character, worldbuilding, prose, confusion, and more. See which categories appear most, and where in the manuscript.",
              },
              {
                Icon: FileText,
                title: "Reader surveys",
                tag: "Coming soon",
                detail:
                  "Add end-of-chapter or end-of-book questions to collect structured responses alongside in-text notes. Set your own questions or use templates.",
              },
              {
                Icon: ListChecks,
                title: "Revision dashboard",
                tag: "Core",
                detail:
                  "See repeated issues and strongest moments at a glance. Export a prioritized revision list based on reader frequency, not gut feeling.",
              },
            ].map((card, i) => (
              <Lift key={i} className="p-8" style={{ background: PAPER }}>
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-9 h-9 flex items-center justify-center border"
                    style={{ borderColor: "rgba(28,24,18,0.14)", background: CARD, color: OXBLOOD }}
                  >
                    <card.Icon size={16} strokeWidth={1.5} />
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 uppercase tracking-wide"
                    style={{
                      fontFamily: MONO,
                      background: card.tag === "Core" ? "rgba(44,62,45,0.1)" : "rgba(28,24,18,0.06)",
                      color: card.tag === "Core" ? FOREST : MUTED,
                    }}
                  >
                    {card.tag}
                  </span>
                </div>
                <h3
                  className="mb-3"
                  style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 500, color: INK }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6456" }}>
                  {card.detail}
                </p>
              </Lift>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section
        id="cta"
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(28,24,18,0.1)", background: INK }}
      >
        <div className="px-6 md:px-12 py-24 max-w-5xl mx-auto">
          <Reveal className="grid md:grid-cols-[1fr_420px] gap-16 items-start">
            <div>
              <div className="w-8 h-px mb-8" style={{ background: "rgba(245,240,232,0.25)" }} />
              <h2
                className="mb-5 leading-tight"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 400,
                  color: PAPER,
                  letterSpacing: "-0.02em",
                }}
              >
                Help shape a better beta reading workflow.
              </h2>
              <p
                className="text-base leading-relaxed mb-4 max-w-md"
                style={{ color: "rgba(245,240,232,0.65)", fontWeight: 300, lineHeight: 1.65 }}
              >
                I'm currently talking with indie authors, book coaches, and editors to
                understand what actually hurts during beta reading.
              </p>
              <p
                className="text-sm leading-relaxed max-w-sm"
                style={{ color: "rgba(245,240,232,0.45)", fontWeight: 300 }}
              >
                If you join the waitlist, I'll follow up personally — not with a marketing
                sequence, but with one question about your workflow. You'll also receive
                a launch discount code when BetaManuscript is released.
              </p>
              <div
                className="mt-12 pl-5 border-l"
                style={{ borderColor: "rgba(245,240,232,0.15)" }}
              >
                <p
                  className="italic leading-relaxed"
                  style={{
                    fontFamily: SERIF,
                    fontSize: "1.1rem",
                    color: "rgba(245,240,232,0.55)",
                  }}
                >
                  "After my last beta round I had 47 Google Docs comment threads, three
                  spreadsheets, and no idea which problems were real. I needed a way to
                  separate signal from noise."
                </p>
                <div className="text-[10px] mt-3" style={{ fontFamily: MONO, color: "rgba(245,240,232,0.3)" }}>
                  — An indie fantasy author who helped shape this product
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div
                className="text-sm mb-4"
                style={{ color: "rgba(245,240,232,0.75)", fontFamily: SANS }}
              >
                Request early access
              </div>
              <WaitlistForm label="Get early access" dark={true} />
              <p className="text-[11px] mt-3" style={{ color: "rgba(245,240,232,0.28)", fontFamily: MONO }}>
                No cost during beta. Launch discount reserved. Unsubscribe anytime.
              </p>
              <div className="mt-10 space-y-4">
                {[
                  "Your manuscript stays private — no public sharing",
                  "Structured annotations, not open-ended comment threads",
                  "Revision priorities built from reader frequency, not guesswork",
                  "Designed for indie authors, not publishing houses",
                ].map((point, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.45, delay: i * 0.04, ease: premiumEase }}
                  >
                    <Check size={11} strokeWidth={2.5} className="flex-shrink-0 mt-1" style={{ color: "rgba(245,240,232,0.35)" }} />
                    <span className="text-sm" style={{ color: "rgba(245,240,232,0.45)", lineHeight: 1.55 }}>
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t px-6 md:px-12 py-8"
        style={{ borderColor: "rgba(28,24,18,0.1)", background: PAPER }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen size={14} strokeWidth={1.5} style={{ color: OXBLOOD }} />
            <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: INK }}>
              BetaManuscript
            </span>
          </div>
          <div className="text-[11px]" style={{ fontFamily: MONO, color: MUTED }}>
            A workspace for authors who take revision seriously.
          </div>
          <div className="text-[10px]" style={{ fontFamily: MONO, color: "#C8C2B6" }}>
            © 2026 - BetaManuscript
          </div>
        </div>
      </footer>
    </div>
  );
}
