"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
    title: "Building practical machine learning systems that run under real constraints",
    description:
      "My AI work is centered on models that have to perform in the real world, especially on-device inference, silent-speech lip reading, reinforcement learning, and efficient deployment.",
    long:
      "A lot of my AI work is focused on deployment, latency, and making models useful outside of notebooks. I have worked on silent-speech lip-reading systems, offline mobile inference with Core ML and the Apple Neural Engine, and reinforcement learning models where architecture choices and efficiency matter. What makes this work meaningful to me is that it combines theory with system design: the model has to be accurate, but it also has to fit hardware limits, inference speed requirements, and real usage conditions.",
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
    pillTone: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    activeTone:
      "border-cyan-300/30 bg-cyan-300/12 text-white shadow-[0_0_30px_rgba(103,232,249,0.12)]",
    dot: "bg-cyan-300",
    stats: [
      { label: "Main Focus", value: "Applied ML Systems" },
      { label: "Deployment", value: "Offline + On-Device" },
      { label: "Next Step", value: "Quantum AI" },
    ],
    points: [
      "Built silent-speech lip-reading systems for real-time offline use",
      "Worked on deployment-aware AI where latency, hardware, and accuracy all matter",
      "Interested in pushing toward hybrid quantum-classical learning and deeper model research",
    ],
    animationBlurb:
      "The background models a live neural network whose nodes and edges shift with your cursor to reflect adaptive learning structure.",
  },
  Cybersecurity: {
    label: "Cybersecurity",
    eyebrow: "Cybersecurity",
    title: "Combining competition, network analysis, and practical defense thinking",
    description:
      "My cybersecurity experience comes from both high-level competition and hands-on technical work in networking, incident response, and adversarial problem solving.",
    long:
      "I have developed cybersecurity experience through national recognition, competitive challenges, and technical workshops that pushed me into real tools and real debugging. That includes work with packet analysis, network reasoning, vulnerability-oriented thinking, and practical security tools such as Wireshark, Nmap, and Metasploit. What I like most about cybersecurity is that it rewards precision: you need to reason about systems carefully, think adversarially, and understand how small technical details create large security consequences.",
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
    pillTone: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    activeTone:
      "border-violet-300/30 bg-violet-300/12 text-white shadow-[0_0_30px_rgba(196,181,253,0.12)]",
    dot: "bg-violet-300",
    stats: [
      { label: "Recognition", value: "National Cyber Scholar" },
      { label: "Competition", value: "Top-10 CTF Work" },
      { label: "Focus", value: "Networks + Defense" },
    ],
    points: [
      "Built practical experience through CTFs, packet analysis, and incident response exercises",
      "Learned to reason adversarially about systems, vulnerabilities, and infrastructure",
      "Most interested in secure systems, cyber operations, and technical defense at scale",
    ],
    animationBlurb:
      "The background streams cryptographic-style character fields that react to cursor position like a shifting security surface.",
  },
  Physics: {
    label: "Physics",
    eyebrow: "Physics",
    title: "Using mathematical models to understand motion, fields, light, and physical systems",
    description:
      "Physics matters to me because it connects equations to real behavior, from mechanics and electromagnetism to future work in optics, imaging, and advanced devices.",
    long:
      "My physics background includes calculus-based mechanics and electricity and magnetism, but what really draws me in is the way physics unifies theory and reality. I am especially interested in light-matter interactions, quantum optics, nanophotonics, and experimental systems where modeling and physical design have to work together. Long term, I want to do research on problems that connect physics, computation, and hardware, especially where careful mathematical reasoning directly shapes how a device or system behaves.",
    chips: [
      "Calculus-Based Mechanics",
      "Calculus-Based E&M",
      "Quantum Optics",
      "Nanophotonics",
      "Imaging",
      "Device Physics",
    ],
    pillTone: "border-sky-300/25 bg-sky-300/10 text-sky-100",
    activeTone:
      "border-sky-300/30 bg-sky-300/12 text-white shadow-[0_0_30px_rgba(125,211,252,0.12)]",
    dot: "bg-sky-300",
    stats: [
      { label: "Coursework", value: "Calc-Based Physics" },
      { label: "Research Goal", value: "Optics + Photonics" },
      { label: "Long-Term Use", value: "Theory + Hardware" },
    ],
    points: [
      "Using calculus-based physics as a foundation for more advanced physical research",
      "Most interested in optics, photonics, imaging, and light-matter interaction problems",
      "Want to bridge mathematical physics with experimental and computational systems",
    ],
    animationBlurb:
      "The background simulates a gravitational system where stars and planets orbit a black hole while the cursor adds a small local gravitational perturbation.",
  },
  Chemistry: {
    label: "Chemistry",
    eyebrow: "Chemistry",
    title: "Studying how matter behaves, changes, and supports deeper scientific systems",
    description:
      "Chemistry gives me the molecular and materials-level understanding that connects naturally to physics, biology, and device-oriented research.",
    long:
      "My chemistry work includes AP Chemistry, organic chemistry, and biochemistry, and I see it as essential for understanding how real systems behave below the macroscopic level. I am especially interested in how chemistry supports physical systems, materials questions, and interdisciplinary scientific work. The subject is valuable to me because it combines conceptual structure, quantitative reasoning, and experimental thinking in a way that directly supports future research in devices, materials, and advanced scientific modeling.",
    chips: [
      "AP Chemistry",
      "Organic Chemistry",
      "Biochemistry",
      "Thermodynamics",
      "Molecular Structure",
      "Physical Chemistry",
    ],
    pillTone: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    activeTone:
      "border-emerald-300/30 bg-emerald-300/12 text-white shadow-[0_0_30px_rgba(110,231,183,0.12)]",
    dot: "bg-emerald-300",
    stats: [
      { label: "Foundation", value: "AP Chem + Beyond" },
      { label: "Extra Study", value: "Orgo + Biochem" },
      { label: "Future Use", value: "Materials + Systems" },
    ],
    points: [
      "Built chemistry depth across general, organic, and biochemical topics",
      "Interested in molecular behavior, thermodynamics, and chemistry tied to physics and materials",
      "Want chemistry to support more advanced research in scientific and device-focused systems",
    ],
    animationBlurb:
      "The background generates a different atom on each load and visualizes its stylized orbital structure with motion and color shifts tied to cursor position.",
  },
  Math: {
    label: "Math",
    eyebrow: "Mathematics",
    title: "Using rigorous quantitative reasoning as the backbone of everything else I do",
    description:
      "Math is the common structure behind my work in AI, physics, cybersecurity, chemistry, and future quantum computing research.",
    long:
      "Mathematics is the subject I rely on most broadly. I use it for modeling, optimization, analysis, and turning hard technical ideas into something precise enough to build from or prove from. Whether the problem is in machine learning, physics, security, or scientific computation, math is what gives that work clarity and structure. In the long term, it is the part of my background that will stay central to everything else because it supports both theory and real-world technical systems.",
    chips: [
      "AP Calculus BC",
      "AP Statistics",
      "Quantitative Modeling",
      "Problem Solving",
      "Analysis",
      "Optimization",
    ],
    pillTone: "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100",
    activeTone:
      "border-fuchsia-300/30 bg-fuchsia-300/12 text-white shadow-[0_0_30px_rgba(244,114,182,0.12)]",
    dot: "bg-fuchsia-300",
    stats: [
      { label: "Current Courses", value: "Calc BC + Stats" },
      { label: "Role", value: "Core Framework" },
      { label: "Main Use", value: "Models + Precision" },
    ],
    points: [
      "Using calculus and statistics as working tools across technical disciplines",
      "Drawn to abstraction, modeling, optimization, and mathematically clean problem solving",
      "See math as the language that makes serious research and engineering possible",
    ],
    animationBlurb:
      "The background uses a cursor-reactive flow field so the scene behaves like a live mathematical system instead of a static graph.",
  },
} as const

const homeContent = {
  eyebrow: "Overview",
  title: "Researching and building across AI, cybersecurity, physics, chemistry, mathematics, and advanced technical systems",
  description:
    "I’m Pushpak Jain, a high school researcher building through difficult quantitative work, real technical projects, and interdisciplinary STEM interests rather than staying inside one narrow track.",
  long:
    "This site is designed to give a reader a fast but meaningful sense of what I actually work on. My strongest interests are in practical AI systems, cybersecurity, computation-heavy physics, mathematically grounded problem solving, chemistry that supports scientific systems, and research that connects software with real devices. The goal is not just breadth for its own sake, but depth across areas that reinforce one another: math supports physics and AI, physics supports device thinking, chemistry supports materials and scientific reasoning, and security sharpens systems-level thinking.",
  chips: [
    "AI",
    "Cybersecurity",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Research",
    "Hardware",
    "Systems",
  ],
  pillTone: "border-white/15 bg-white/8 text-white/86",
  dot: "bg-white",
  stats: [
    { label: "Focus", value: "Research + Systems" },
    { label: "Style", value: "Depth + Building" },
    { label: "Identity", value: "Multidisciplinary STEM" },
  ],
  points: [
    "Working across multiple technical fields that strengthen one another instead of treating them separately",
    "Most interested in problems that require mathematical rigor, scientific reasoning, and real implementation",
    "Building toward research that connects computation, physical systems, and advanced technical design",
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

function ContactButton({
  open,
  onClick,
}: {
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={open}
      className={`rounded-full border px-4 py-3 text-[11px] uppercase tracking-[0.28em] transition-all duration-300 ${
        open
          ? "border-white/22 bg-white/[0.1] text-white shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          : "border-white/10 bg-white/[0.03] text-white/64 hover:border-white/16 hover:bg-white/[0.05] hover:text-white/88"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-white" />
        Contact
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
    <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl grid-cols-1 gap-5 px-6 pb-8 pt-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
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

            <div className="mt-4 max-w-3xl text-[1.85rem] font-medium leading-tight tracking-[-0.045em] text-white/97">
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

        <DetailCard title="What I’m doing" body={points[0]} dot={dotClass} />
        <DetailCard title="Why it’s useful" body={points[1]} dot={dotClass} />
        <DetailCard title="Where it goes next" body={points[2]} dot={dotClass} />
      </div>
    </section>
  )
}

function ContactModal({
  mounted,
  visible,
  onClose,
}: {
  mounted: boolean
  visible: boolean
  onClose: () => void
}) {
  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-xl"
        style={{ animation: `${visible ? "modalBackdropIn" : "modalBackdropOut"} 420ms cubic-bezier(0.22,1,0.36,1) both` }}
      />
      <div
        className="absolute inset-0"
        style={{ animation: `${visible ? "modalBackdropIn" : "modalBackdropOut"} 420ms cubic-bezier(0.22,1,0.36,1) both` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.12),transparent_24%),radial-gradient(circle_at_80%_22%,rgba(167,139,250,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(244,114,182,0.1),transparent_26%)] animate-[modalBackdrop_9s_ease-in-out_infinite]" />
      </div>

      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[2.2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(10,16,28,0.94),rgba(7,12,22,0.92))] shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: `${visible ? "modalIn" : "modalOut"} 420ms cubic-bezier(0.22,1,0.36,1) both` }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.14),transparent_34%),radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_44%)]" />
          <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl animate-[floatOrb_8s_ease-in-out_infinite]" />
          <div className="absolute -right-8 bottom-4 h-56 w-56 rounded-full bg-violet-300/10 blur-3xl animate-[floatOrb_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-300/8 blur-3xl animate-[pulseCore_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        <div className="relative border-b border-white/8 px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-sm text-white/84">
                <span className="h-2 w-2 rounded-full bg-white" />
                Contact
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                Get in touch
              </h2>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.28em] text-white/74 transition hover:bg-white/[0.08] hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="relative grid gap-3 p-6 md:grid-cols-2 md:p-8">
          <a
            href="mailto:jainpushpak09@gmail.com"
            className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/24 hover:bg-white/[0.07]"
          >
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Email</div>
            <div className="mt-3 text-xl font-medium text-white/94">jainpushpak09@gmail.com</div>
          </a>

          <a
            href="https://www.linkedin.com/in/pushpak-jain-4018ab31a/"
            target="_blank"
            rel="noreferrer"
            className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-sky-300/24 hover:bg-white/[0.07]"
          >
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">LinkedIn</div>
            <div className="mt-3 text-xl font-medium text-white/94">pushpak-jain-4018ab31a</div>
          </a>

          <a
            href="https://github.com/pushiscool"
            target="_blank"
            rel="noreferrer"
            className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-violet-300/24 hover:bg-white/[0.07]"
          >
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">GitHub</div>
            <div className="mt-3 text-xl font-medium text-white/94">github.com/pushiscool</div>
          </a>

          <a
            href="tel:2025780257"
            className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-fuchsia-300/24 hover:bg-white/[0.07]"
          >
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Phone</div>
            <div className="mt-3 text-xl font-medium text-white/94">(202) 578-0257</div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [selected, setSelected] = useState<SectionKey>("Home")
  const [contactMounted, setContactMounted] = useState(false)
  const [contactVisible, setContactVisible] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (contactMounted) {
          setContactVisible(false)
          if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
          closeTimerRef.current = window.setTimeout(() => {
            setContactMounted(false)
          }, 420)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [contactMounted])

  const openContact = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    setContactMounted(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setContactVisible(true)
      })
    })
  }

  const closeContact = () => {
    setContactVisible(false)
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      setContactMounted(false)
    }, 420)
  }

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
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white">
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

      <div className="relative z-10 min-h-screen">
        <header className="sticky top-0 z-40 mx-auto flex max-w-7xl flex-col gap-4 px-6 pt-6 pb-3 md:px-10 lg:flex-row lg:items-start lg:justify-between backdrop-blur-md">
          <NameButton active={selected === "Home"} onClick={() => setSelected("Home")} />

          <div
            className={`w-full max-w-5xl rounded-[1.45rem] border p-2 backdrop-blur-xl shadow-[0_16px_56px_rgba(0,0,0,0.22)] ${
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
              <ContactButton open={contactMounted && contactVisible} onClick={openContact} />
            </div>
          </div>
        </header>

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
            sideTitle="How the animation works"
            sideText={subjects.AI.animationBlurb}
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
            sideTitle="How the animation works"
            sideText={subjects.Cybersecurity.animationBlurb}
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
            sideTitle="How the animation works"
            sideText={subjects.Physics.animationBlurb}
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
            sideTitle="How the animation works"
            sideText={subjects.Chemistry.animationBlurb}
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
            sideTitle="How the animation works"
            sideText={subjects.Math.animationBlurb}
            points={active.points}
            chipMode="math"
          />
        ) : (
          <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl grid-cols-1 gap-6 px-6 pb-10 pt-6 md:px-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-8">
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
                <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">How to use this page</div>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  Click the subject tabs to see the main areas I work in, what I am actually doing in each one, why it matters, and the kind of research direction I want to build toward.
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
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/12 via-violet-300/8 to-transparent" />
                <div className="relative">
                  <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">What this site is for</div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                    A real overview, not just a design shell
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{active.long}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {active.points.map((point, index) => (
                  <DetailCard
                    key={point}
                    title={index === 0 ? "What I’m doing" : index === 1 ? "Why it’s useful" : "Where it goes next"}
                    body={point}
                    dot={active.dot}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-[1.55rem] border border-white/9 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/44">Reader takeaway</div>
                <div className="mt-3 text-xl font-medium tracking-[-0.03em] text-white/94">
                  The main point is that my work is strongest where theory, quantitative reasoning, and implementation meet.
                </div>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  I want the reader to leave with a clear sense of both range and seriousness: not just what subjects I like, but what I am building, what I want to research, and how those areas connect.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      <ContactModal mounted={contactMounted} visible={contactVisible} onClose={closeContact} />

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

        @keyframes modalIn {
          0% {
            opacity: 0;
            transform: translateY(26px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes modalOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(22px) scale(0.97);
          }
        }

        @keyframes modalBackdropIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes modalBackdropOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes floatOrb {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(18px, -14px, 0) scale(1.08);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes pulseCore {
          0% {
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.5;
          }
        }

        @keyframes modalBackdrop {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.03);
          }
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  )
}