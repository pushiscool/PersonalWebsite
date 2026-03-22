"use client"

import { useEffect, useRef } from "react"

type BackgroundStar = {
  x: number
  y: number
  r: number
  a: number
  twinkle: number
  phase: number
  depth: number
  tint: number
}

type WarpStar = {
  x: number
  y: number
  z: number
  speed: number
  size: number
  tint: number
}

type Meteor = {
  active: boolean
  cooldown: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  len: number
  hue: number
  size: number
}

type Scene = {
  backgroundStars: BackgroundStar[]
  warpStars: WarpStar[]
  meteors: Meteor[]
}

const TAU = Math.PI * 2
const STAR_SPEED = 0.34
const GRAIN_OPACITY = 0.12

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rand = (min: number, max: number) => min + Math.random() * (max - min)

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
  bg.addColorStop(0, "#010207")
  bg.addColorStop(0.32, "#061126")
  bg.addColorStop(0.62, "#0a1832")
  bg.addColorStop(1, "#02040a")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const glowA = ctx.createRadialGradient(w * 0.16, h * 0.14, 0, w * 0.16, h * 0.14, w * 0.44)
  glowA.addColorStop(0, "rgba(45,212,191,0.09)")
  glowA.addColorStop(0.24, "rgba(56,189,248,0.065)")
  glowA.addColorStop(0.58, "rgba(129,140,248,0.03)")
  glowA.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, w, h)

  const glowB = ctx.createRadialGradient(w * 0.84, h * 0.72, 0, w * 0.84, h * 0.72, w * 0.4)
  glowB.addColorStop(0, "rgba(99,102,241,0.1)")
  glowB.addColorStop(0.24, "rgba(168,85,247,0.05)")
  glowB.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, w, h)

  const band = ctx.createLinearGradient(0, h * 0.18, 0, h * 0.82)
  band.addColorStop(0, "rgba(255,255,255,0)")
  band.addColorStop(0.45, "rgba(56,189,248,0.018)")
  band.addColorStop(0.62, "rgba(99,102,241,0.028)")
  band.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = band
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

const createWarpStar = (): WarpStar => ({
  x: rand(-1, 1),
  y: rand(-1, 1),
  z: rand(0.15, 1),
  speed: rand(0.22, 0.78),
  size: rand(0.45, 1.4),
  tint: Math.random(),
})

const resetWarpStar = (star: WarpStar) => {
  star.x = rand(-1, 1)
  star.y = rand(-1, 1)
  star.z = rand(0.88, 1.15)
  star.speed = rand(0.22, 0.78)
  star.size = rand(0.45, 1.4)
  star.tint = Math.random()
}

const createMeteor = (): Meteor => ({
  active: false,
  cooldown: rand(1.2, 4.6),
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 0,
  maxLife: 0,
  len: 0,
  hue: 0,
  size: 0,
})

const spawnMeteor = (meteor: Meteor, w: number, h: number) => {
  const fromLeft = Math.random() > 0.35

  meteor.active = true
  meteor.maxLife = rand(0.65, 1.1)
  meteor.life = meteor.maxLife
  meteor.len = rand(120, 220)
  meteor.size = rand(1.1, 1.8)
  meteor.hue = Math.random() > 0.5 ? 196 : 250

  if (fromLeft) {
    meteor.x = rand(-w * 0.12, w * 0.2)
    meteor.y = rand(-h * 0.05, h * 0.35)
    meteor.vx = rand(880, 1220)
    meteor.vy = rand(380, 560)
  } else {
    meteor.x = rand(w * 0.8, w * 1.08)
    meteor.y = rand(-h * 0.05, h * 0.26)
    meteor.vx = -rand(760, 1020)
    meteor.vy = rand(360, 520)
  }
}

const buildScene = (w: number, h: number): Scene => {
  const area = w * h

  const backgroundStars: BackgroundStar[] = Array.from(
    { length: Math.floor(clamp(area / 8500, 180, 320)) },
    () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: rand(0.35, 1.95),
      a: rand(0.08, 0.45),
      twinkle: rand(0.35, 1.5),
      phase: Math.random() * TAU,
      depth: rand(0.2, 1.2),
      tint: Math.random(),
    })
  )

  const warpStars: WarpStar[] = Array.from(
    { length: Math.floor(clamp(area / 5200, 240, 420)) },
    () => createWarpStar()
  )

  const meteors: Meteor[] = Array.from({ length: 3 }, () => createMeteor())

  return { backgroundStars, warpStars, meteors }
}

export default function ImmersiveSTEMBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const sceneRef = useRef<Scene>({ backgroundStars: [], warpStars: [], meteors: [] })
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const currentRef = useRef({ x: 0.5, y: 0.5 })
  const grainPatternRef = useRef<CanvasPattern | null>(null)
  const staticBgRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    grainPatternRef.current = createGrainPattern(ctx)

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25)

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
      const { backgroundStars, warpStars, meteors } = sceneRef.current

      if (!w || !h || !bg) {
        frameRef.current = window.requestAnimationFrame(render)
        return
      }

      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.033)
      lastTimeRef.current = now
      const t = now * 0.001

      const current = currentRef.current
      const target = targetRef.current

      current.x = lerp(current.x, target.x, 0.08)
      current.y = lerp(current.y, target.y, 0.08)

      const px = (current.x - 0.5) * 2
      const py = (current.y - 0.5) * 2
      const vpX = w * 0.5 + px * w * 0.18
      const vpY = h * 0.5 + py * h * 0.12
      const spread = Math.min(w, h) * 0.68
      const speedBoost = 1 + Math.hypot(px, py) * 0.12

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(bg, 0, 0, w, h)

      for (let i = 0; i < backgroundStars.length; i++) {
        const s = backgroundStars[i]
        const x = s.x - px * (5 + s.depth * 8)
        const y = s.y - py * (5 + s.depth * 8)
        const twinkle = 0.58 + 0.42 * Math.sin(t * s.twinkle + s.phase)

        ctx.globalAlpha = s.a * twinkle
        ctx.fillStyle =
          s.tint < 0.24
            ? "rgba(255,255,255,1)"
            : s.tint < 0.58
              ? "rgba(191,219,254,1)"
              : "rgba(224,231,255,1)"

        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, TAU)
        ctx.fill()

        if (s.r > 1.28 && i % 10 === 0) {
          ctx.strokeStyle =
            s.tint < 0.5
              ? `rgba(125,211,252,${0.1 * twinkle})`
              : `rgba(196,181,253,${0.085 * twinkle})`
          ctx.lineWidth = 0.65
          ctx.beginPath()
          ctx.moveTo(x - s.r * 2.8, y)
          ctx.lineTo(x + s.r * 2.8, y)
          ctx.moveTo(x, y - s.r * 2.8)
          ctx.lineTo(x, y + s.r * 2.8)
          ctx.stroke()
        }
      }

      ctx.globalAlpha = 1
      ctx.lineCap = "round"

      for (let i = 0; i < warpStars.length; i++) {
        const star = warpStars[i]

        const prevScale = spread / star.z
        const prevX = vpX + star.x * prevScale
        const prevY = vpY + star.y * prevScale

        star.z -= dt * star.speed * speedBoost * STAR_SPEED

        const scale = spread / star.z
        const x = vpX + star.x * scale
        const y = vpY + star.y * scale

        if (star.z <= 0.02 || x < -120 || x > w + 120 || y < -120 || y > h + 120) {
          resetWarpStar(star)
          continue
        }

        const alpha = clamp((1 - star.z) * 0.72, 0.04, 0.9)
        const lineWidth = clamp(star.size * (1.1 + (1 - star.z) * 1.8), 0.6, 2.8)

        ctx.globalCompositeOperation = "screen"
        ctx.strokeStyle =
          star.tint < 0.22
            ? `rgba(255,255,255,${alpha})`
            : star.tint < 0.58
              ? `rgba(125,211,252,${alpha * 0.9})`
              : `rgba(196,181,253,${alpha * 0.88})`
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()

        if (star.z < 0.22) {
          ctx.fillStyle =
            star.tint < 0.22
              ? `rgba(255,255,255,${alpha})`
              : star.tint < 0.58
                ? `rgba(125,211,252,${alpha})`
                : `rgba(196,181,253,${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, lineWidth * 0.55, 0, TAU)
          ctx.fill()
        }
      }

      ctx.globalCompositeOperation = "screen"

      for (let i = 0; i < meteors.length; i++) {
        const meteor = meteors[i]

        if (!meteor.active) {
          meteor.cooldown -= dt
          if (meteor.cooldown <= 0) spawnMeteor(meteor, w, h)
          continue
        }

        meteor.life -= dt
        meteor.x += meteor.vx * dt
        meteor.y += meteor.vy * dt

        const alpha = clamp(meteor.life / meteor.maxLife, 0, 1)

        if (meteor.life <= 0 || meteor.x < -w * 0.25 || meteor.x > w * 1.25 || meteor.y > h * 1.25) {
          meteor.active = false
          meteor.cooldown = rand(2.4, 5.8)
          continue
        }

        const lenX = (meteor.vx / Math.hypot(meteor.vx, meteor.vy)) * meteor.len
        const lenY = (meteor.vy / Math.hypot(meteor.vx, meteor.vy)) * meteor.len

        const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - lenX, meteor.y - lenY)
        grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.95})`)
        grad.addColorStop(
          0.22,
          meteor.hue === 196
            ? `rgba(125,211,252,${alpha * 0.42})`
            : `rgba(196,181,253,${alpha * 0.42})`
        )
        grad.addColorStop(1, "rgba(255,255,255,0)")

        ctx.strokeStyle = grad
        ctx.lineWidth = meteor.size
        ctx.beginPath()
        ctx.moveTo(meteor.x, meteor.y)
        ctx.lineTo(meteor.x - lenX, meteor.y - lenY)
        ctx.stroke()

        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.arc(meteor.x, meteor.y, meteor.size * 0.9, 0, TAU)
        ctx.fill()
      }

      ctx.globalCompositeOperation = "source-over"

      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.14,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.82
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