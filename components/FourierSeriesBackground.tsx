"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  px: number
  py: number
  size: number
  hue: number
  alpha: number
  speed: number
  life: number
  maxLife: number
}

type Spark = {
  x: number
  y: number
  r: number
  alpha: number
  phase: number
  speed: number
}

type Scene = {
  particles: Particle[]
  sparks: Spark[]
}

const TAU = Math.PI * 2
const GRAIN_OPACITY = 0.12

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

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
  bg.addColorStop(0, "#04030a")
  bg.addColorStop(0.28, "#0b1020")
  bg.addColorStop(0.58, "#13122c")
  bg.addColorStop(1, "#07060d")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const glowA = ctx.createRadialGradient(w * 0.16, h * 0.18, 0, w * 0.16, h * 0.18, w * 0.42)
  glowA.addColorStop(0, "rgba(125,211,252,0.08)")
  glowA.addColorStop(0.28, "rgba(167,139,250,0.05)")
  glowA.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, w, h)

  const glowB = ctx.createRadialGradient(w * 0.84, h * 0.72, 0, w * 0.84, h * 0.72, w * 0.38)
  glowB.addColorStop(0, "rgba(244,114,182,0.07)")
  glowB.addColorStop(0.3, "rgba(192,132,252,0.04)")
  glowB.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, w, h)

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
  const area = w * h
  const particleCount = Math.max(950, Math.floor(area / 2100))
  const sparkCount = Math.max(70, Math.floor(area / 20000))

  const particles: Particle[] = Array.from({ length: particleCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    px: 0,
    py: 0,
    size: rand(0.8, 2.1),
    hue: Math.random() > 0.66 ? 196 : Math.random() > 0.5 ? 276 : 326,
    alpha: rand(0.06, 0.26),
    speed: rand(0.75, 1.35),
    life: rand(0, 1),
    maxLife: rand(3, 7),
  }))

  const sparks: Spark[] = Array.from({ length: sparkCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: rand(0.4, 1.5),
    alpha: rand(0.03, 0.1),
    phase: Math.random() * TAU,
    speed: rand(0.35, 1.1),
  }))

  return { particles, sparks }
}

const scalarField = (nx: number, ny: number, t: number, px: number, py: number) => {
  return (
    Math.sin(nx * TAU * 1.8 + t * 0.34) * Math.cos(ny * TAU * 1.3 - t * 0.27) +
    0.72 * Math.sin((nx + ny) * TAU * 2.4 + t * 0.18 + px * 1.8) +
    0.46 * Math.cos((nx * 2.8 - ny * 2.1) * TAU - t * 0.21 + py * 1.4) +
    0.22 * Math.sin((nx * 5.4 + ny * 3.8) * TAU + t * 0.42)
  )
}

const fieldAt = (
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  cursorX: number,
  cursorY: number,
  px: number,
  py: number
) => {
  const nx = x / w
  const ny = y / h
  const epsX = 1 / w
  const epsY = 1 / h

  const p0 = scalarField(nx, ny, t, px, py)
  const p1 = scalarField(nx + epsX * 16, ny, t, px, py)
  const p2 = scalarField(nx, ny + epsY * 16, t, px, py)

  let vx = (p2 - p0) * 7.2
  let vy = -(p1 - p0) * 7.2

  const dx = x - cursorX
  const dy = y - cursorY
  const r = Math.hypot(dx, dy) + 0.0001
  const minDim = Math.min(w, h)
  const influence = Math.exp(-((r / (minDim * 0.24)) * (r / (minDim * 0.24))))

  vx += (-dy / r) * 2.4 * influence
  vy += (dx / r) * 2.4 * influence

  vx += (cursorX - w * 0.5) / w * 0.55
  vy += (cursorY - h * 0.5) / h * 0.34

  return { x: vx, y: vy, influence }
}

export default function FourierSeriesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const sceneRef = useRef<Scene>({ particles: [], sparks: [] })
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const currentRef = useRef({ x: 0.5, y: 0.5 })
  const staticBgRef = useRef<HTMLCanvasElement | null>(null)
  const grainPatternRef = useRef<CanvasPattern | null>(null)
  const flowCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const flowCanvas = document.createElement("canvas")
    const flowCtx = flowCanvas.getContext("2d")
    if (!flowCtx) return
    flowCanvasRef.current = flowCanvas

    grainPatternRef.current = createGrainPattern(ctx)

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.3)

      sizeRef.current = { w, h, dpr }

      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      flowCanvas.width = w
      flowCanvas.height = h

      sceneRef.current = buildScene(w, h)
      staticBgRef.current = buildStaticBackground(w, h, grainPatternRef.current)

      flowCtx.clearRect(0, 0, w, h)
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
      const flow = flowCanvasRef.current
      const scene = sceneRef.current

      if (!w || !h || !bg || !flow) {
        frameRef.current = window.requestAnimationFrame(render)
        return
      }

      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.033)
      lastTimeRef.current = now
      const t = now * 0.001

      const current = currentRef.current
      const target = targetRef.current

      current.x = lerp(current.x, target.x, 0.085)
      current.y = lerp(current.y, target.y, 0.085)

      const cursorX = current.x * w
      const cursorY = current.y * h
      const px = (current.x - 0.5) * 2
      const py = (current.y - 0.5) * 2
      const minDim = Math.min(w, h)

      flowCtx.globalCompositeOperation = "source-over"
      flowCtx.fillStyle = "rgba(4,3,10,0.065)"
      flowCtx.fillRect(0, 0, w, h)
      flowCtx.globalCompositeOperation = "lighter"
      flowCtx.lineCap = "round"

      for (let i = 0; i < scene.particles.length; i++) {
        const p = scene.particles[i]
        p.life += dt

        if (p.life > p.maxLife) {
          p.x = Math.random() * w
          p.y = Math.random() * h
          p.px = p.x
          p.py = p.y
          p.life = 0
          p.maxLife = rand(3, 7)
        }

        p.px = p.x
        p.py = p.y

        const f = fieldAt(p.x, p.y, w, h, t, cursorX, cursorY, px, py)
        p.x += f.x * p.speed * dt * 48
        p.y += f.y * p.speed * dt * 48

        if (p.x < -60 || p.x > w + 60 || p.y < -60 || p.y > h + 60) {
          p.x = Math.random() * w
          p.y = Math.random() * h
          p.px = p.x
          p.py = p.y
          p.life = 0
          continue
        }

        const hue = p.hue + f.influence * 26 + current.x * 12 - current.y * 8
        const alpha = p.alpha * (0.75 + f.influence * 1.1)
        const width = p.size * (0.9 + f.influence * 0.7)

        flowCtx.strokeStyle = `hsla(${hue} 100% 76% / ${alpha * 0.28})`
        flowCtx.lineWidth = width * 3.2
        flowCtx.beginPath()
        flowCtx.moveTo(p.px, p.py)
        flowCtx.lineTo(p.x, p.y)
        flowCtx.stroke()

        flowCtx.strokeStyle = `hsla(${hue} 100% 84% / ${alpha})`
        flowCtx.lineWidth = width
        flowCtx.beginPath()
        flowCtx.moveTo(p.px, p.py)
        flowCtx.lineTo(p.x, p.y)
        flowCtx.stroke()
      }

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(bg, 0, 0, w, h)

      for (let i = 0; i < scene.sparks.length; i++) {
        const s = scene.sparks[i]
        const twinkle = 0.58 + 0.42 * Math.sin(t * s.speed + s.phase)
        ctx.fillStyle = `rgba(235,232,255,${s.alpha * twinkle})`
        ctx.beginPath()
        ctx.arc(s.x - px * 5, s.y - py * 5, s.r, 0, TAU)
        ctx.fill()
      }

      ctx.globalCompositeOperation = "screen"
      ctx.drawImage(flow, 0, 0, w, h)
      ctx.globalCompositeOperation = "source-over"

      const cursorGlow = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, minDim * 0.24)
      cursorGlow.addColorStop(0, "rgba(255,255,255,0.045)")
      cursorGlow.addColorStop(0.16, "rgba(167,139,250,0.05)")
      cursorGlow.addColorStop(0.38, "rgba(125,211,252,0.04)")
      cursorGlow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = cursorGlow
      ctx.beginPath()
      ctx.arc(cursorX, cursorY, minDim * 0.24, 0, TAU)
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