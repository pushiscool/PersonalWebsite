"use client"

import { useEffect, useRef } from "react"

type Row = {
  y: number
  size: number
  speed: number
  phase: number
  alpha: number
  seed: number
  dir: 1 | -1
}

type Scene = {
  rows: Row[]
}

const TAU = Math.PI * 2
const GRAIN_OPACITY = 0.12
const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/\\\\~`"

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const nextRand = (x: number) => {
  x ^= x << 13
  x ^= x >>> 17
  x ^= x << 5
  return x >>> 0
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
  bg.addColorStop(0, "#02040a")
  bg.addColorStop(0.28, "#07111f")
  bg.addColorStop(0.58, "#0a1728")
  bg.addColorStop(1, "#03060c")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const glowA = ctx.createRadialGradient(w * 0.14, h * 0.18, 0, w * 0.14, h * 0.18, w * 0.42)
  glowA.addColorStop(0, "rgba(56,189,248,0.08)")
  glowA.addColorStop(0.3, "rgba(103,232,249,0.04)")
  glowA.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, w, h)

  const glowB = ctx.createRadialGradient(w * 0.86, h * 0.72, 0, w * 0.86, h * 0.72, w * 0.36)
  glowB.addColorStop(0, "rgba(129,140,248,0.08)")
  glowB.addColorStop(0.3, "rgba(168,85,247,0.035)")
  glowB.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = "rgba(255,255,255,0.025)"
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += 120) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y <= h; y += 76) {
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

const buildScene = (w: number, h: number): Scene => {
  const rows: Row[] = []
  const count = Math.max(18, Math.floor(h / 42))
  const top = h * 0.05
  const bottom = h * 0.95
  const usable = bottom - top

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1)
    rows.push({
      y: top + usable * t,
      size: 12 + (i % 4 === 0 ? 2 : 0),
      speed: 18 + (i % 6) * 5 + Math.random() * 8,
      phase: Math.random(),
      alpha: 0.1 + (i % 5 === 0 ? 0.06 : 0),
      seed: ((Math.random() * 4294967295) | 0) >>> 0,
      dir: i % 2 === 0 ? 1 : -1,
    })
  }

  return { rows }
}

const buildRandomLine = (seed: number, length: number, tick: number, cursorMix: number) => {
  let x = (seed ^ Math.imul(tick + 1 + cursorMix, 2654435761)) >>> 0
  let out = ""

  for (let i = 0; i < length; i++) {
    x = nextRand(x + i + 1)
    out += CHARSET[x % CHARSET.length]
    if ((i + 1) % 9 === 0 && i < length - 1) out += " "
  }

  return out
}

export default function CyberSecurityBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const sceneRef = useRef<Scene>({ rows: [] })
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const currentRef = useRef({ x: 0.5, y: 0.5 })
  const staticBgRef = useRef<HTMLCanvasElement | null>(null)
  const grainPatternRef = useRef<CanvasPattern | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    grainPatternRef.current = createGrainPattern(ctx)

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

      sceneRef.current = buildScene(w, h)
      staticBgRef.current = buildStaticBackground(w, h, grainPatternRef.current)
    }

    const onPointerMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX / window.innerWidth
      targetRef.current.y = e.clientY / window.innerHeight
    }

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      targetRef.current.x = t.clientX / window.innerWidth
      targetRef.current.y = t.clientY / window.innerHeight
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
      const { rows } = sceneRef.current

      if (!w || !h || !bg || rows.length === 0) {
        frameRef.current = window.requestAnimationFrame(render)
        return
      }

      const t = now * 0.001
      const tick = Math.floor(t * 3.1)

      const current = currentRef.current
      const target = targetRef.current

      current.x = lerp(current.x, target.x, 0.085)
      current.y = lerp(current.y, target.y, 0.085)

      const cursorX = current.x * w
      const cursorY = current.y * h
      const px = (current.x - 0.5) * 2
      const py = (current.y - 0.5) * 2

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(bg, 0, 0, w, h)

      ctx.globalCompositeOperation = "screen"
      ctx.textBaseline = "middle"

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const charWidth = row.size * 0.62
        const widthChars = Math.ceil(w / charWidth) + 36
        const rowDist = Math.abs(cursorY - row.y)
        const rowInfluence = Math.exp(-((rowDist / 135) * (rowDist / 135)))
        const cursorMix = Math.floor(current.x * 2000 + current.y * 1700 + rowInfluence * 900 + i * 31)

        const line = buildRandomLine(row.seed, widthChars, tick + i * 9, cursorMix)
        const lineWidth = line.length * charWidth
        const travel = (t * row.speed + row.phase * lineWidth) % lineWidth
        const baseX = row.dir === 1 ? -travel : -(lineWidth - travel)

        const bendX = (cursorX - w * 0.5) * 0.06 * rowInfluence
        const waveY = Math.sin(t * 0.95 + row.phase * TAU) * 2.8 + py * 9
        const y = row.y + waveY + (cursorY - row.y) * 0.025 * rowInfluence

        const hue = lerp(182, 258, current.x) + rowInfluence * 18
        const sat = 72 + rowInfluence * 16 + Math.abs(px) * 8
        const light = 62 + rowInfluence * 18 + Math.abs(py) * 5
        const alpha = clamp(row.alpha + rowInfluence * 0.12, 0.08, 0.34)

        ctx.font = `${row.size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
        ctx.fillStyle = `hsla(${hue} ${sat}% ${light}% / ${alpha})`

        const x1 = baseX + bendX
        const x2 = x1 + lineWidth

        ctx.fillText(line, x1, y)
        ctx.fillText(line, x2, y)

        if (rowInfluence > 0.08) {
          ctx.fillStyle = `rgba(255,255,255,${0.012 + rowInfluence * 0.035})`
          ctx.fillRect(0, y - row.size * 0.56, w, 1)
        }
      }

      ctx.globalCompositeOperation = "source-over"

      const cursorWash = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, Math.min(w, h) * 0.22)
      cursorWash.addColorStop(0, "rgba(103,232,249,0.07)")
      cursorWash.addColorStop(0.24, "rgba(129,140,248,0.035)")
      cursorWash.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = cursorWash
      ctx.beginPath()
      ctx.arc(cursorX, cursorY, Math.min(w, h) * 0.22, 0, TAU)
      ctx.fill()

      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.15,
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