"use client"

import { useEffect, useRef } from "react"

type OrbitalKind = "s" | "p" | "d" | "f"

type OrbitalShell = {
  n: number
  kind: OrbitalKind
  electrons: number
  cap: number
  occupancy: number
  peak: number
  width: number
  velocity: number
  angle: number
  alpha: number
  hueBase: number
  phase: number
}

type AtomModel = {
  z: number
  symbol: string
  shells: OrbitalShell[]
}

type Spark = {
  x: number
  y: number
  r: number
  a: number
  phase: number
  speed: number
}

const TAU = Math.PI * 2
const GRAIN_OPACITY = 0.12
const MAX_ATOMIC_NUMBER = 54

const SYMBOLS = [
  "",
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Sc",
  "Ti",
  "V",
  "Cr",
  "Mn",
  "Fe",
  "Co",
  "Ni",
  "Cu",
  "Zn",
  "Ga",
  "Ge",
  "As",
  "Se",
  "Br",
  "Kr",
  "Rb",
  "Sr",
  "Y",
  "Zr",
  "Nb",
  "Mo",
  "Tc",
  "Ru",
  "Rh",
  "Pd",
  "Ag",
  "Cd",
  "In",
  "Sn",
  "Sb",
  "Te",
  "I",
  "Xe",
] as const

const ORDER: ReadonlyArray<{ n: number; kind: OrbitalKind; cap: number }> = [
  { n: 1, kind: "s", cap: 2 },
  { n: 2, kind: "s", cap: 2 },
  { n: 2, kind: "p", cap: 6 },
  { n: 3, kind: "s", cap: 2 },
  { n: 3, kind: "p", cap: 6 },
  { n: 4, kind: "s", cap: 2 },
  { n: 3, kind: "d", cap: 10 },
  { n: 4, kind: "p", cap: 6 },
  { n: 5, kind: "s", cap: 2 },
  { n: 4, kind: "d", cap: 10 },
  { n: 5, kind: "p", cap: 6 },
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const hslToRgb = (h: number, s: number, l: number) => {
  h = ((h % 360) + 360) % 360
  s = clamp(s, 0, 1)
  l = clamp(l, 0, 1)

  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0

  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0]
  else if (hp < 2) [r, g, b] = [x, c, 0]
  else if (hp < 3) [r, g, b] = [0, c, x]
  else if (hp < 4) [r, g, b] = [0, x, c]
  else if (hp < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const m = l - c / 2
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

const createGrainPattern = (ctx: CanvasRenderingContext2D) => {
  const canvas = document.createElement("canvas")
  canvas.width = 96
  canvas.height = 96
  const g = canvas.getContext("2d")
  if (!g) return null

  const img = g.createImageData(canvas.width, canvas.height)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255)
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  return ctx.createPattern(canvas, "repeat")
}

const buildStaticBackground = (w: number, h: number, grain: CanvasPattern | null) => {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, "#04060b")
  bg.addColorStop(0.28, "#08131d")
  bg.addColorStop(0.58, "#0d1922")
  bg.addColorStop(1, "#04070d")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const glowA = ctx.createRadialGradient(w * 0.14, h * 0.16, 0, w * 0.14, h * 0.16, w * 0.42)
  glowA.addColorStop(0, "rgba(52,211,153,0.06)")
  glowA.addColorStop(0.32, "rgba(45,212,191,0.03)")
  glowA.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, w, h)

  const glowB = ctx.createRadialGradient(w * 0.86, h * 0.72, 0, w * 0.86, h * 0.72, w * 0.38)
  glowB.addColorStop(0, "rgba(103,232,249,0.06)")
  glowB.addColorStop(0.3, "rgba(167,139,250,0.03)")
  glowB.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = "rgba(255,255,255,0.02)"
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += 120) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y <= h; y += 88) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  if (grain) {
    ctx.save()
    ctx.globalAlpha = GRAIN_OPACITY
    ctx.globalCompositeOperation = "soft-light"
    ctx.fillStyle = grain
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }

  return canvas
}

const buildAtomModel = (z: number): AtomModel => {
  let remaining = z
  const raw: Array<{ n: number; kind: OrbitalKind; electrons: number; cap: number }> = []

  for (let i = 0; i < ORDER.length && remaining > 0; i++) {
    const item = ORDER[i]
    const electrons = Math.min(item.cap, remaining)
    remaining -= electrons
    raw.push({ n: item.n, kind: item.kind, electrons, cap: item.cap })
  }

  const count = raw.length
  const shells: OrbitalShell[] = raw.map((item, i) => {
    const occupancy = item.electrons / item.cap
    const basePeak = count === 1 ? 0.52 : lerp(0.15, 0.92, i / Math.max(count - 1, 1))
    const peak =
      basePeak +
      (item.kind === "s" ? -0.03 : item.kind === "p" ? 0 : item.kind === "d" ? 0.015 : 0.03)
    const width =
      (item.kind === "s" ? 0.16 : item.kind === "p" ? 0.12 : item.kind === "d" ? 0.11 : 0.1) *
      (1 + (1 - occupancy) * 0.18)
    const velocity = clamp(
      z / (item.n * item.n * (item.kind === "s" ? 10 : item.kind === "p" ? 12 : item.kind === "d" ? 15 : 18)),
      0,
      1
    )

    return {
      n: item.n,
      kind: item.kind,
      electrons: item.electrons,
      cap: item.cap,
      occupancy,
      peak,
      width,
      velocity,
      angle: i * 0.72 + (item.kind === "p" ? 0.15 : item.kind === "d" ? 0.35 : item.kind === "f" ? 0.55 : 0),
      alpha: 0.13 + occupancy * 0.12 + velocity * 0.05,
      hueBase: 148 + velocity * 95,
      phase: Math.random() * TAU,
    }
  })

  return {
    z,
    symbol: SYMBOLS[z] ?? "X",
    shells,
  }
}

const angularDensity = (kind: OrbitalKind, theta: number, rr: number) => {
  if (kind === "s") return 1
  if (kind === "p") return 0.16 + Math.pow(Math.abs(Math.cos(theta)), 2.15)
  if (kind === "d") {
    return 0.08 + Math.pow(Math.abs(Math.cos(2 * theta)), 1.8) + 0.1 * Math.exp(-Math.pow((rr - 0.18) / 0.12, 2))
  }
  return 0.06 + Math.pow(Math.abs(Math.cos(3 * theta)), 1.75)
}

export default function ChemistryAtomBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const densityCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const currentRef = useRef({ x: 0.5, y: 0.5 })
  const grainPatternRef = useRef<CanvasPattern | null>(null)
  const staticBgRef = useRef<HTMLCanvasElement | null>(null)
  const atomRef = useRef<AtomModel | null>(null)
  const sparksRef = useRef<Spark[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const densityCanvas = document.createElement("canvas")
    const densityCtx = densityCanvas.getContext("2d")
    if (!densityCtx) return
    densityCanvasRef.current = densityCanvas

    grainPatternRef.current = createGrainPattern(ctx)

    if (!atomRef.current) {
      const z = 1 + Math.floor(Math.random() * MAX_ATOMIC_NUMBER)
      atomRef.current = buildAtomModel(z)
    }

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.35)

      sizeRef.current = { w, h, dpr }

      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      densityCanvas.width = Math.max(180, Math.floor(w / 6))
      densityCanvas.height = Math.max(120, Math.floor(h / 6))

      const sparkCount = Math.max(70, Math.floor((w * h) / 22000))
      sparksRef.current = Array.from({ length: sparkCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.35, 1.1),
        a: rand(0.02, 0.07),
        phase: Math.random() * TAU,
        speed: rand(0.35, 1.15),
      }))

      staticBgRef.current = buildStaticBackground(w, h, grainPatternRef.current)
    }

    const onPointerMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX / window.innerWidth
      targetRef.current.y = e.clientY / window.innerHeight
    }

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      targetRef.current.x = touch.clientX / window.innerWidth
      targetRef.current.y = touch.clientY / window.innerHeight
    }

    const onLeave = () => {
      targetRef.current.x = 0.5
      targetRef.current.y = 0.5
    }

    resize()

    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("pointerleave", onLeave)

    const render = (now: number) => {
      const { w, h } = sizeRef.current
      const bg = staticBgRef.current
      const atom = atomRef.current
      const densityCanvas = densityCanvasRef.current

      if (!w || !h || !bg || !atom || !densityCanvas) {
        frameRef.current = window.requestAnimationFrame(render)
        return
      }

      const t = now * 0.001
      const current = currentRef.current
      const target = targetRef.current

      current.x = lerp(current.x, target.x, 0.085)
      current.y = lerp(current.y, target.y, 0.085)

      const px = (current.x - 0.5) * 2
      const py = (current.y - 0.5) * 2
      const cursorX = current.x * w
      const cursorY = current.y * h
      const centerX = w * 0.5 + px * w * 0.03
      const centerY = h * 0.52 + py * h * 0.02
      const minDim = Math.min(w, h)

      const dctx = densityCanvas.getContext("2d")
      if (!dctx) {
        frameRef.current = window.requestAnimationFrame(render)
        return
      }

      const dw = densityCanvas.width
      const dh = densityCanvas.height
      const img = dctx.createImageData(dw, dh)
      const data = img.data
      const aspect = w / h
      const cursorShift = current.x * 28 - current.y * 18
      const cursorLocalX = (current.x - 0.5) * 0.18
      const cursorLocalY = (current.y - 0.5) * 0.18

      let idx = 0
      for (let y = 0; y < dh; y++) {
        const ny = y / (dh - 1)
        for (let x = 0; x < dw; x++) {
          const nx = x / (dw - 1)

          const dx = (nx - 0.5) * 2 + cursorLocalX * 0.32
          const dy = ((ny - 0.5) * 2) / aspect + cursorLocalY * 0.32
          const rr = Math.sqrt(dx * dx + dy * dy) + 1e-6
          const theta = Math.atan2(dy, dx)

          let accumR = 0
          let accumG = 0
          let accumB = 0
          let accumA = 0

          for (let i = 0; i < atom.shells.length; i++) {
            const shell = atom.shells[i]
            const localAngle = theta - shell.angle - t * 0.04 * (0.55 + shell.velocity) - px * 0.2 + py * 0.12
            const radial = Math.exp(-Math.pow((rr - shell.peak) / shell.width, 2))
            const angular = angularDensity(shell.kind, localAngle, rr)
            const ripple = 0.92 + 0.08 * Math.sin(t * 0.7 + rr * 7 + shell.phase)
            const density = radial * angular * ripple * shell.alpha * (0.62 + shell.occupancy * 0.58)

            if (density < 0.003) continue

            const hue = shell.hueBase + cursorShift + Math.sin(t * 0.28 + shell.phase) * 5 + shell.velocity * 18
            const rgb = hslToRgb(hue, 0.82, 0.6 + shell.velocity * 0.07)

            accumR += (rgb[0] / 255) * density
            accumG += (rgb[1] / 255) * density
            accumB += (rgb[2] / 255) * density
            accumA += density * 1.05
          }

          const nucleus = Math.exp(-Math.pow(rr / 0.1, 2)) * 0.22
          accumR += nucleus * 0.45
          accumG += nucleus * 0.68
          accumB += nucleus * 0.58
          accumA += nucleus * 0.45

          data[idx] = Math.round(clamp((1 - Math.exp(-accumR * 1.75)) * 255, 0, 255))
          data[idx + 1] = Math.round(clamp((1 - Math.exp(-accumG * 1.75)) * 255, 0, 255))
          data[idx + 2] = Math.round(clamp((1 - Math.exp(-accumB * 1.75)) * 255, 0, 255))
          data[idx + 3] = Math.round(clamp((1 - Math.exp(-accumA * 1.45)) * 205, 0, 205))
          idx += 4
        }
      }

      dctx.putImageData(img, 0, 0)

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(bg, 0, 0, w, h)

      for (let i = 0; i < sparksRef.current.length; i++) {
        const s = sparksRef.current[i]
        const twinkle = 0.58 + 0.42 * Math.sin(t * s.speed + s.phase)
        ctx.fillStyle = `rgba(235,246,255,${s.a * twinkle})`
        ctx.beginPath()
        ctx.arc(s.x - px * 4, s.y - py * 4, s.r, 0, TAU)
        ctx.fill()
      }

      ctx.save()
      ctx.globalCompositeOperation = "screen"
      ctx.globalAlpha = 0.62
      ctx.filter = "blur(16px)"
      ctx.drawImage(densityCanvas, 0, 0, w, h)
      ctx.restore()

      ctx.save()
      ctx.globalCompositeOperation = "screen"
      ctx.globalAlpha = 0.82
      ctx.drawImage(densityCanvas, 0, 0, w, h)
      ctx.restore()

      const nucleusGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, minDim * 0.1)
      nucleusGlow.addColorStop(0, "rgba(90,255,190,0.48)")
      nucleusGlow.addColorStop(0.2, "rgba(103,232,249,0.18)")
      nucleusGlow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = nucleusGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, minDim * 0.1, 0, TAU)
      ctx.fill()

      ctx.fillStyle = "rgba(220,255,245,0.72)"
      ctx.beginPath()
      ctx.arc(centerX, centerY, 3.5, 0, TAU)
      ctx.fill()

      ctx.fillStyle = "rgba(255,255,255,0.62)"
      ctx.font = "600 28px ui-sans-serif, system-ui, sans-serif"
      ctx.fillText(atom.symbol, 36, h - 62)
      ctx.font = "500 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      ctx.fillStyle = "rgba(255,255,255,0.34)"
      ctx.fillText(`Z = ${atom.z}`, 38, h - 36)

      const cursorWash = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, minDim * 0.22)
      cursorWash.addColorStop(0, "rgba(110,231,183,0.018)")
      cursorWash.addColorStop(0.24, "rgba(103,232,249,0.014)")
      cursorWash.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = cursorWash
      ctx.beginPath()
      ctx.arc(cursorX, cursorY, minDim * 0.22, 0, TAU)
      ctx.fill()

      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        minDim * 0.14,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.86
      )
      vignette.addColorStop(0, "rgba(0,0,0,0)")
      vignette.addColorStop(0.72, "rgba(0,0,0,0.08)")
      vignette.addColorStop(1, "rgba(0,0,0,0.56)")
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, w, h)

      frameRef.current = window.requestAnimationFrame(render)
    }

    frameRef.current = window.requestAnimationFrame(render)

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}