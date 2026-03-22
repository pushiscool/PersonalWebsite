"use client"

import { useMemo, useState } from "react"
import ImmersiveSTEMBackground from "@/components/ImmersiveSTEMBackground"
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground"
import CyberSecurityBackground from "@/components/CyberSecurityBackground"
import FourierSeriesBackground from "@/components/FourierSeriesBackground"
import ChemistryAtomBackground from "@/components/ChemistryAtomBackground"
import PhysicsOrbitalBackground from "@/components/PhysicsOrbitalBackground"

const subjects = {
  AI: {
    label: "AI",
    eyebrow: "Artificial Intelligence",
    title: "Building on-device lip-reading systems, applied ML models, and future quantum AI research",
    description:
      "My strongest current work in AI is centered on building real models that run under practical constraints, especially my silent-speech lip-reading work, reinforcement learning projects, and hardware-aware mobile inference.",
    long:
      "My AI work is focused on building systems that actually function under real constraints rather than staying purely theoretical. I collaborated with a University of Virginia professor, Eric Martin, on a silent-speech lip-reading application, using noise injection for accuracy and Apple’s Neural Engine for offline inference. I also developed an iPhone app for offline lip-reading using Core ML and the Apple Neural Engine, trained and optimized reinforcement learning models including Deep Q-Networks with PyTorch and TensorFlow, and worked on real-time inference problems where latency, model efficiency, and deployment matter. Going forward, I want to push further into quantum AI, especially hybrid quantum-classical learning systems, quantum reinforcement learning for control and optimization, and quantum representations for physically meaningful learning problems connected to computation, physics, and complex systems.",
    chips: [
      "Lip Reading",
      "On-Device AI",
      "Core ML",
      "Apple Neural Engine",
      "PyTorch",
      "TensorFlow",
      "Reinforcement Learning",
      "Quantum AI",
    ],
    cardTone: "from-cyan-300/18 via-sky-300/10 to-transparent",
    pillTone: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    activeTone:
      "border-cyan-300/30 bg-cyan-300/12 text-white shadow-[0_0_30px_rgba(103,232,249,0.12)]",
    dot: "bg-cyan-300",
    stats: [
      { label: "Main Project", value: "Lip-Reading AI" },
      { label: "Deployment", value: "Offline + On-Device" },
      { label: "Future Direction", value: "Quantum AI" },
    ],
    points: [
      "Built and optimized silent-speech lip-reading systems for real-time offline inference",
      "Trained reinforcement learning models and deployed hardware-aware AI under practical constraints",
      "Planning future work in hybrid quantum-classical ML, quantum RL, and quantum learning for physical systems",
    ],
  },
  Cybersecurity: {
    label: "Cybersecurity",
    eyebrow: "Cybersecurity",
    title: "Competitive security work across CTFs, network analysis, incident response, and practical defense tooling",
    description:
      "My cybersecurity background combines national competition experience, technical workshops, networking knowledge, and hands-on exposure to tools used in realistic security settings.",
    long:
      "My work in cybersecurity has been shaped by both competition and applied technical training. I was named a CyberStart America National Cyber Scholar and was recognized on stage at George Mason University as a CyberStart America winner in front of schools across Virginia. I earned the Certiport Networking Certification and competed in the Radford Capture the Flag Challenge for two consecutive years, placing in the top 10 while competing against high schools and colleges across the country. I also participated in Virginia CyberSlam at George Mason University, where I completed hands-on workshops in Wireshark, incident response, and deepfake detection tools. Beyond events, I have worked through advanced CTF-style problems involving vulnerability discovery, exploit logic, systematic debugging, and practical tools such as Wireshark, Nmap, and Metasploit. What interests me most is the blend of adversarial thinking, system-level reasoning, and technical precision required to secure real infrastructure.",
    chips: [
      "CyberStart America",
      "National Cyber Scholar",
      "Radford CTF",
      "Wireshark",
      "Incident Response",
      "Nmap",
      "Metasploit",
      "Networking",
    ],
    cardTone: "from-violet-300/18 via-indigo-300/10 to-transparent",
    pillTone: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    activeTone:
      "border-violet-300/30 bg-violet-300/12 text-white shadow-[0_0_30px_rgba(196,181,253,0.12)]",
    dot: "bg-violet-300",
    stats: [
      { label: "Recognition", value: "National Cyber Scholar" },
      { label: "Competition", value: "Top-10 Radford CTF" },
      { label: "Focus", value: "Networks + Security" },
    ],
    points: [
      "Earned national recognition through CyberStart America and competitive cybersecurity events",
      "Built practical experience through CTFs, packet analysis, incident response, and debugging under pressure",
      "Interested in secure systems, network defense, adversarial analysis, and real-world cyber operations",
    ],
  },
  Physics: {
    label: "Physics",
    eyebrow: "Physics",
    title: "Studying calculus-based physics while moving toward quantum optics, nanophotonics, imaging, and device research",
    description:
      "Physics is one of the fields I care most about because it connects mathematical structure to the real behavior of matter, light, motion, and engineered systems.",
    long:
      "My physics background includes calculus-based physics in both mechanics and electricity and magnetism, and I am especially interested in continuing toward more advanced areas such as quantum optics, nanophotonics, advanced imaging, and experimental hardware research. What draws me to physics is the combination of mathematical rigor, physical intuition, and the ability to explain real systems from first principles. I am particularly interested in research at the intersection of light-matter interactions, photonic systems, computational modeling, and experimental device design. Long term, I want to work on problems where physics, computation, and hardware development all meet in a meaningful way.",
    chips: [
      "Calculus-Based Mechanics",
      "Calculus-Based E&M",
      "Quantum Optics",
      "Nanophotonics",
      "Imaging",
      "Device Physics",
    ],
    cardTone: "from-sky-300/18 via-cyan-300/10 to-transparent",
    pillTone: "border-sky-300/25 bg-sky-300/10 text-sky-100",
    activeTone:
      "border-sky-300/30 bg-sky-300/12 text-white shadow-[0_0_30px_rgba(125,211,252,0.12)]",
    dot: "bg-sky-300",
    stats: [
      { label: "Coursework", value: "Calculus-Based Physics" },
      { label: "Research Interest", value: "Quantum Optics" },
      { label: "Long-Term Focus", value: "Photonics + Imaging" },
    ],
    points: [
      "Studying calculus-based mechanics and electricity and magnetism with a strong interest in deeper theory",
      "Interested in nanophotonics, quantum optics, advanced imaging, and light-matter interaction research",
      "Want to connect physics, computation, and experimental device design in future research",
    ],
  },
  Chemistry: {
    label: "Chemistry",
    eyebrow: "Chemistry",
    title: "Building a chemistry foundation through AP Chemistry, organic chemistry, biochemistry, and quantitative scientific reasoning",
    description:
      "Chemistry matters to me because it explains how matter behaves and changes, and it connects naturally to physics, materials, biology, and device-oriented research.",
    long:
      "My chemistry background includes AP Chemistry, organic chemistry, and biochemistry, and I am especially interested in how chemistry supports deeper work in materials, molecular behavior, physical systems, and experimental science. I like the way chemistry combines conceptual understanding with calculation, structure, and real laboratory thinking. It is also one of the subjects that connects well to several of my broader interests, including device development, photonic and physical systems, and interdisciplinary STEM research. Over time, I want to deepen this into stronger work in physical chemistry, materials-related questions, and chemistry that supports advanced hardware and scientific modeling.",
    chips: [
      "AP Chemistry",
      "Organic Chemistry",
      "Biochemistry",
      "Thermodynamics",
      "Molecular Structure",
      "Physical Chemistry",
    ],
    cardTone: "from-emerald-300/18 via-teal-300/10 to-transparent",
    pillTone: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    activeTone:
      "border-emerald-300/30 bg-emerald-300/12 text-white shadow-[0_0_30px_rgba(110,231,183,0.12)]",
    dot: "bg-emerald-300",
    stats: [
      { label: "Coursework", value: "AP Chem + Beyond" },
      { label: "Added Study", value: "Orgo + Biochem" },
      { label: "Interest", value: "Physical Systems" },
    ],
    points: [
      "Built chemistry depth through AP Chemistry, organic chemistry, and biochemistry",
      "Interested in molecular behavior, thermodynamics, structure, and chemistry connected to physics and materials",
      "Want chemistry to support future research in advanced scientific systems and device-focused work",
    ],
  },
  Math: {
    label: "Math",
    eyebrow: "Mathematics",
    title: "Using calculus, statistics, and quantitative reasoning as the backbone of everything else I build",
    description:
      "Math is the subject that strengthens all of my other work, from AI and cybersecurity to physics, chemistry, and quantum computing.",
    long:
      "My mathematics background currently includes AP Calculus BC and AP Statistics, and I rely heavily on mathematical reasoning across everything I do. Whether I am working on machine learning, physics, cybersecurity, optimization, or future quantum computing research, math is what gives those subjects structure and precision. I am especially drawn to rigorous problem solving, modeling, abstraction, and using quantitative tools to make technically difficult ideas exact. In the long term, mathematics will remain central to how I approach research, because it is the common language behind both theory and serious technical building.",
    chips: [
      "AP Calculus BC",
      "AP Statistics",
      "Quantitative Modeling",
      "Problem Solving",
      "Analysis",
      "Optimization",
    ],
    cardTone: "from-fuchsia-300/18 via-purple-300/10 to-transparent",
    pillTone: "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100",
    activeTone:
      "border-fuchsia-300/30 bg-fuchsia-300/12 text-white shadow-[0_0_30px_rgba(244,114,182,0.12)]",
    dot: "bg-fuchsia-300",
    stats: [
      { label: "Current Courses", value: "Calc BC + Stats" },
      { label: "Role", value: "STEM Backbone" },
      { label: "Use", value: "Models + Theory" },
    ],
    points: [
      "Using calculus and statistics as core tools across research, engineering, and technical problem solving",
      "Interested in abstraction, modeling, optimization, and mathematically rigorous thinking",
      "See mathematics as the foundation behind AI, physics, security, chemistry, and quantum work",
    ],
  },
} as const

const homeContent = {
  eyebrow: "Overview",
  title: "High school researcher building across AI, quantum computing, cybersecurity, physics, chemistry, mathematics, and hardware systems",
  description:
    "I’m Pushpak Jain, a high school junior pursuing difficult technical work across multiple fields, with a strong focus on research, on-device AI, hardware-software integration, and mathematically serious problem solving.",
  long:
    "My work is intentionally multidisciplinary. I build across artificial intelligence, quantum computing, cybersecurity, physics, chemistry, mathematics, and hardware-oriented engineering because I care about problems that are both technically deep and practically meaningful. I have worked on offline lip-reading AI using Core ML and the Apple Neural Engine, reinforcement learning models under real-world constraints, competitive cybersecurity challenges, quantum computing competitions, and PCB-based hardware systems for robotics. I am especially interested in future research at the intersection of computation, light-matter interactions, device design, quantum systems, and advanced scientific modeling.",
  chips: [
    "AI",
    "Quantum Computing",
    "Cybersecurity",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Hardware",
    "Research",
  ],
  cardTone: "from-cyan-300/12 via-violet-300/8 to-transparent",
  pillTone: "border-white/15 bg-white/8 text-white/86",
  dot: "bg-white",
  stats: [
    { label: "Focus", value: "Research + Systems" },
    { label: "Strength", value: "Theory + Building" },
    { label: "Identity", value: "Multidisciplinary STEM" },
  ],
  points: [
    "Building across AI, cybersecurity, quantum computing, hardware, and the physical sciences instead of staying in only one area",
    "Interested in research that combines mathematical depth, real systems, and serious technical constraints",
    "Aiming to work on problems at the intersection of computation, physics, devices, and advanced scientific research",
  ],
} as const

type SubjectKey = keyof typeof subjects
type SectionKey = "Home" | SubjectKey
type ChipMode = "ai" | "cyber" | "math" | "chemistry" | "physics"

function NameButton({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[1.1rem] border px-5 py-3.5 text-left transition-all duration-300 ${
        active
          ? "border-white/18 bg-white/[0.075] shadow-[0_0_28px_rgba(255,255,255,0.045)]"
          : "border-white/10 bg-white/[0.032] hover:border-white/16 hover:bg-white/[0.05]"
      }`}
    >
      <div className="text-[11px] uppercase tracking-[0.42em] text-white/72">Pushpak Jain</div>
    </button>
  )
}

function SubjectButton({
  name,
  active,
  onClick,
}: {
  name: SubjectKey
  active: boolean
  onClick: () => void
}) {
  const item = subjects[name]

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-3 text-[11px] uppercase tracking-[0.28em] transition-all duration-300 ${
        active
          ? item.activeTone
          : "border-white/10 bg-white/[0.03] text-white/64 hover:border-white/16 hover:bg-white/[0.05] hover:text-white/88"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${item.dot}`} />
        {item.label}
      </span>
    </button>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.028] p-4 backdrop-blur-xl">
      <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">{label}</div>
      <div className="mt-2 text-lg font-medium text-white/92">{value}</div>
    </div>
  )
}

function DetailCard({
  title,
  body,
  dot,
}: {
  title: string
  body: string
  dot: string
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.028] p-4 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{title}</div>
          <div className="mt-2 text-base leading-7 text-white/78">{body}</div>
        </div>
      </div>
    </div>
  )
}

function ThemedChip({
  label,
  mode,
}: {
  label: string
  mode: ChipMode
}) {
  const classes =
    mode === "ai"
      ? "border-cyan-300/12 bg-cyan-300/[0.06] text-cyan-50/78"
      : mode === "cyber"
        ? "border-violet-300/12 bg-violet-300/[0.06] text-violet-50/78"
        : mode === "math"
          ? "border-fuchsia-300/12 bg-fuchsia-300/[0.06] text-fuchsia-50/78"
          : mode === "chemistry"
            ? "border-emerald-300/12 bg-emerald-300/[0.06] text-emerald-50/78"
            : "border-sky-300/12 bg-sky-300/[0.06] text-sky-50/78"

  return (
    <div className={`rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.24em] ${classes}`}>
      {label}
    </div>
  )
}

function ModePanel({
  eyebrow,
  dotClass,
  title,
  description,
  chips,
  stats,
  accentLine,
  glowBg,
  sideTitle,
  sideText,
  points,
  chipMode,
}: {
  eyebrow: string
  dotClass: string
  title: string
  description: string
  chips: readonly string[]
  stats: readonly { label: string; value: string }[]
  accentLine: string
  glowBg: string
  sideTitle: string
  sideText: string
  points: readonly string[]
  chipMode: ChipMode
}) {
  return (
    <section className="mx-auto grid min-h-full max-w-7xl grid-cols-1 gap-5 px-6 pb-8 pt-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
      <div
        className="max-w-[36rem] self-end overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,18,31,0.56),rgba(7,12,22,0.28))] shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
        style={{ animation: "panelRise 640ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className={`h-px w-full ${accentLine}`} />
        <div className="relative p-6 md:p-8">
          <div className={`pointer-events-none absolute inset-0 ${glowBg}`} />

          <div className="relative">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                chipMode === "ai"
                  ? "border-cyan-300/18 bg-cyan-300/[0.08] text-cyan-100"
                  : chipMode === "cyber"
                    ? "border-violet-300/18 bg-violet-300/[0.08] text-violet-100"
                    : chipMode === "math"
                      ? "border-fuchsia-300/18 bg-fuchsia-300/[0.08] text-fuchsia-100"
                      : chipMode === "chemistry"
                        ? "border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100"
                        : "border-sky-300/18 bg-sky-300/[0.08] text-sky-100"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${dotClass}`} />
              {eyebrow}
            </div>

            <h1 className="mt-5 max-w-4xl text-[3.15rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[4.2rem] lg:text-[5rem]">
              Pushpak Jain
            </h1>

            <div className="mt-4 max-w-3xl text-[1.9rem] font-medium leading-tight tracking-[-0.045em] text-white/97">
              {title}
            </div>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/74">{description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <ThemedChip key={chip} label={chip} mode={chipMode} />
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full max-w-[19rem] justify-self-end self-end space-y-3"
        style={{ animation: "panelRise 700ms 80ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="overflow-hidden rounded-[1.45rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,17,29,0.48),rgba(7,12,22,0.24))] shadow-[0_16px_52px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className={`h-px w-full ${accentLine}`} />
          <div className="p-5">
            <div
              className={`text-[11px] uppercase tracking-[0.32em] ${
                chipMode === "ai"
                  ? "text-cyan-100/46"
                  : chipMode === "cyber"
                    ? "text-violet-100/46"
                    : chipMode === "math"
                      ? "text-fuchsia-100/46"
                      : chipMode === "chemistry"
                        ? "text-emerald-100/46"
                        : "text-sky-100/46"
              }`}
            >
              {sideTitle}
            </div>
            <p className="mt-3 text-sm leading-7 text-white/66">{sideText}</p>
          </div>
        </div>

        <DetailCard title="Core idea" body={points[0]} dot={dotClass} />
        <DetailCard title="Approach" body={points[1]} dot={dotClass} />
        <DetailCard title="Why it matters" body={points[2]} dot={dotClass} />
      </div>
    </section>
  )
}

export default function HomePage() {
  const [contactOpen, setContactOpen] = useState(false)
  const [selected, setSelected] = useState<SectionKey>("Home")

  const active = useMemo(() => {
    if (selected === "Home") return homeContent
    return subjects[selected]
  }, [selected])

  const aiMode = selected === "AI"
  const cyberMode = selected === "Cybersecurity"
  const physicsMode = selected === "Physics"
  const chemistryMode = selected === "Chemistry"
  const mathMode = selected === "Math"

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {aiMode ? (
        <NeuralNetworkBackground />
      ) : cyberMode ? (
        <CyberSecurityBackground />
      ) : physicsMode ? (
        <PhysicsOrbitalBackground />
      ) : chemistryMode ? (
        <ChemistryAtomBackground />
      ) : mathMode ? (
        <FourierSeriesBackground />
      ) : (
        <ImmersiveSTEMBackground />
      )}

      <div className="relative z-10 flex h-screen flex-col overflow-hidden">
        <header className="sticky top-0 z-20 shrink-0 border-b border-white/8 bg-slate-950/20 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 md:px-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="shrink-0">
              <NameButton active={selected === "Home"} onClick={() => setSelected("Home")} />
            </div>

            <div
              className={`w-full max-w-4xl rounded-[1.45rem] border p-2 backdrop-blur-xl shadow-[0_16px_56px_rgba(0,0,0,0.22)] ${
                aiMode
                  ? "border-cyan-300/12 bg-[linear-gradient(180deg,rgba(7,17,30,0.52),rgba(7,12,23,0.34))]"
                  : cyberMode
                    ? "border-violet-300/12 bg-[linear-gradient(180deg,rgba(10,14,26,0.52),rgba(7,11,20,0.34))]"
                    : physicsMode
                      ? "border-sky-300/12 bg-[linear-gradient(180deg,rgba(7,18,30,0.52),rgba(7,12,23,0.34))]"
                      : chemistryMode
                        ? "border-emerald-300/12 bg-[linear-gradient(180deg,rgba(7,24,22,0.52),rgba(7,14,16,0.34))]"
                        : mathMode
                          ? "border-fuchsia-300/12 bg-[linear-gradient(180deg,rgba(20,10,26,0.52),rgba(12,8,20,0.34))]"
                          : "border-white/10 bg-white/[0.028]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {(Object.keys(subjects) as SubjectKey[]).map((name) => (
                  <SubjectButton
                    key={name}
                    name={name}
                    active={selected === name}
                    onClick={() => setSelected(name)}
                  />
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {aiMode ? (
            <ModePanel
              eyebrow={active.eyebrow}
              dotClass={active.dot}
              title={active.title}
              description={active.description}
              chips={active.chips}
              stats={active.stats}
              accentLine="bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.7),rgba(167,139,250,0.55),transparent)]"
              glowBg="bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.12),transparent_34%)]"
              sideTitle="Network view"
              sideText="This section shows the kinds of AI systems I build, the tools I use, and the research direction I want to push further."
              points={active.points}
              chipMode="ai"
            />
          ) : cyberMode ? (
            <ModePanel
              eyebrow={active.eyebrow}
              dotClass={active.dot}
              title={active.title}
              description={active.description}
              chips={active.chips}
              stats={active.stats}
              accentLine="bg-[linear-gradient(90deg,transparent,rgba(196,181,253,0.72),rgba(129,140,248,0.58),transparent)]"
              glowBg="bg-[radial-gradient(circle_at_top_left,rgba(196,181,253,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_34%)]"
              sideTitle="Hash field"
              sideText="This section summarizes my security background through competitions, technical tools, and the types of systems and defense problems I want to study more deeply."
              points={active.points}
              chipMode="cyber"
            />
          ) : physicsMode ? (
            <ModePanel
              eyebrow={active.eyebrow}
              dotClass={active.dot}
              title={active.title}
              description={active.description}
              chips={active.chips}
              stats={active.stats}
              accentLine="bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.72),rgba(96,165,250,0.6),rgba(168,85,247,0.45),transparent)]"
              glowBg="bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.1),transparent_34%)]"
              sideTitle="Orbital system"
              sideText="This section explains the part of physics I care most about, how it connects to math and computation, and the research areas I want to grow into."
              points={active.points}
              chipMode="physics"
            />
          ) : chemistryMode ? (
            <ModePanel
              eyebrow={active.eyebrow}
              dotClass={active.dot}
              title={active.title}
              description={active.description}
              chips={active.chips}
              stats={active.stats}
              accentLine="bg-[linear-gradient(90deg,transparent,rgba(52,211,153,0.72),rgba(45,212,191,0.62),rgba(103,232,249,0.46),transparent)]"
              glowBg="bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(103,232,249,0.1),transparent_34%)]"
              sideTitle="Quantum model"
              sideText="Each page load selects a different atom and renders stylized orbital probability clouds whose color shifts with expected electron velocities and cursor position."
              points={active.points}
              chipMode="chemistry"
            />
          ) : mathMode ? (
            <ModePanel
              eyebrow={active.eyebrow}
              dotClass={active.dot}
              title={active.title}
              description={active.description}
              chips={active.chips}
              stats={active.stats}
              accentLine="bg-[linear-gradient(90deg,transparent,rgba(244,114,182,0.68),rgba(192,132,252,0.62),rgba(125,211,252,0.5),transparent)]"
              glowBg="bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(192,132,252,0.12),transparent_34%)]"
              sideTitle="Flow field"
              sideText="This view turns the math tab into a full-screen vector field with turbulent particle motion that shifts continuously with cursor movement."
              points={active.points}
              chipMode="math"
            />
          ) : (
            <section
              key={`default-${selected}`}
              className="mx-auto grid min-h-full max-w-7xl grid-cols-1 gap-6 px-6 pb-10 pt-6 md:px-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-8"
            >
              <div
                className="rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.03))] p-6 backdrop-blur-2xl shadow-[0_18px_80px_rgba(0,0,0,0.32)] md:p-8 lg:p-9"
                style={{ animation: "panelRise 640ms cubic-bezier(0.22,1,0.36,1) both" }}
              >
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${active.pillTone}`}>
                  <span className={`h-2 w-2 rounded-full ${active.dot}`} />
                  {active.eyebrow}
                </div>

                <h1 className="mt-6 max-w-4xl text-[3.35rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[4.5rem] lg:text-[5.55rem]">
                  Pushpak Jain
                </h1>

                <div className="mt-5 max-w-3xl">
                  <div className="text-2xl font-medium tracking-[-0.04em] text-white/96 sm:text-3xl">
                    {active.title}
                  </div>
                  <p className="mt-4 text-lg leading-8 text-white/76 sm:text-xl">{active.description}</p>
                </div>

                <div className="mt-7 rounded-[1.6rem] border border-white/9 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">
                    {selected === "Home" ? "Site overview" : "Selected subject"}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {selected === "Home"
                      ? "Click through the subject tabs to explore the major fields that shape my work, from AI and cybersecurity to physics, chemistry, and mathematics, then return here for the full overview."
                      : "This section updates based on the subject tab you select above, while my name in the top-left always brings you back to the home screen."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {active.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {active.stats.map((stat) => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} />
                  ))}
                </div>
              </div>

              <div
                className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl shadow-[0_18px_80px_rgba(0,0,0,0.28)] md:p-7 lg:p-8"
                style={{ animation: "panelRise 700ms 80ms cubic-bezier(0.22,1,0.36,1) both" }}
              >
                <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6">
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${active.cardTone}`} />
                  <div className="relative">
                    <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">
                      {selected === "Home" ? "About this site" : "About this area"}
                    </div>
                    <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {selected === "Home" ? "A multidisciplinary STEM portfolio" : active.eyebrow}
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{active.long}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {active.points.map((point, index) => (
                    <DetailCard
                      key={point}
                      title={index === 0 ? "Core idea" : index === 1 ? "Approach" : "Why it matters"}
                      body={point}
                      dot={active.dot}
                    />
                  ))}
                </div>

                <div className="mt-5 rounded-[1.55rem] border border-white/9 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/44">Personal lens</div>
                  <div className="mt-3 text-xl font-medium tracking-[-0.03em] text-white/94">
                    I’m most drawn to work that combines mathematical depth, research-level thinking, and real technical building.
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/66">
                    Across everything I study, the common thread is the same: rigorous theory, serious quantitative reasoning, and building things that push beyond surface-level understanding.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes panelRise {
          0% {
            opacity: 0;
            transform: translateY(34px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}