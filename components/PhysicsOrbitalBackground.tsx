"use client"

import { useEffect, useRef } from "react"

type BodyKind = "star" | "planet"

type TrailPoint = {
  x: number
  y: number
}

type Body = {
  id: number
  parentId: number | null
  kind: BodyKind
  x: number
  y: number
  vx: number
  vy: number
  mu: number
  radius: number
  hue: number
  alpha: number
  glow: number
  trailLength: number
  trail: TrailPoint[]
  alive: boolean
  spawnFade: number
}

type DiskParticle = {
  r: number
  angle: number
  speed: number
  size: number
  alpha: number
  hue: number
}

type FaintStar = {
  x: number
  y: number
  r: number
  a: number
  phase: number
  speed: number
  hue: number
}

type Scene = {
  bodies: Body[]
  disk: DiskParticle[]
  stars: FaintStar[]
}

type BuiltScene = {
  scene: Scene
  nextId: number
}

const TAU = Math.PI * 2
const GRAIN_OPACITY = 0.12

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const createGrainPattern = (ctx: CanvasRenderingContext2D) => {
  const c = document.createElement("canvas")
  c.width = 96
  c.height = 96
  const g = c.getContext("2d")
  if (!g) return null

  const img = g.createImageData(c.width, c.height)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255)
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  return ctx.createPattern(c, "repeat")
}

const buildStaticBackground = (w: number, h: number, grain: CanvasPattern | null) => {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")
  if (!ctx) return c

  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, "#010208")
  bg.addColorStop(0.22, "#06101d")
  bg.addColorStop(0.56, "#091528")
  bg.addColorStop(1, "#02040a")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const glowA = ctx.createRadialGradient(w * 0.18, h * 0.18, 0, w * 0.18, h * 0.18, w * 0.44)
  glowA.addColorStop(0, "rgba(125,211,252,0.06)")
  glowA.addColorStop(0.28, "rgba(59,130,246,0.03)")
  glowA.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, w, h)

  const glowB = ctx.createRadialGradient(w * 0.84, h * 0.72, 0, w * 0.84, h * 0.72, w * 0.38)
  glowB.addColorStop(0, "rgba(168,85,247,0.06)")
  glowB.addColorStop(0.32, "rgba(244,114,182,0.03)")
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

  return c
}

const circularSpeed = (mu: number, r: number) => Math.sqrt(mu / Math.max(r, 1))

const pushTrail = (body: Body) => {
  body.trail.push({ x: body.x, y: body.y })
  if (body.trail.length > body.trailLength) body.trail.shift()
}

const addPlanet = (
  bodies: Body[],
  nextId: () => number,
  parent: Body,
  r: number,
  angle: number,
  hue: number,
  radius: number,
  speedScale: number
) => {
  const x = parent.x + Math.cos(angle) * r
  const y = parent.y + Math.sin(angle) * r
  const tangentX = -Math.sin(angle)
  const tangentY = Math.cos(angle)
  const v = circularSpeed(parent.mu * 0.8, r) * speedScale

  bodies.push({
    id: nextId(),
    parentId: parent.id,
    kind: "planet",
    x,
    y,
    vx: parent.vx + tangentX * v,
    vy: parent.vy + tangentY * v,
    mu: 0,
    radius,
    hue,
    alpha: 0.84,
    glow: radius * 3.2,
    trailLength: 90,
    trail: [],
    alive: true,
    spawnFade: 0,
  })
}

const addStarSystem = (
  bodies: Body[],
  nextId: () => number,
  bhX: number,
  bhY: number,
  bhMu: number,
  minDim: number,
  config?: {
    radius?: number
    angle?: number
    starRadius?: number
    hue?: number
    incoming?: boolean
  }
) => {
  let orbitRadius = config?.radius ?? rand(minDim * 0.16, minDim * 0.7)
  let angle = config?.angle ?? rand(0, TAU)

  if (config?.incoming) {
    let tries = 0
    while (tries < 30) {
      orbitRadius = rand(minDim * 0.56, minDim * 0.82)
      angle = rand(0, TAU)
      const tx = bhX + Math.cos(angle) * orbitRadius
      const ty = bhY + Math.sin(angle) * orbitRadius
      if (tx < -40 || tx > bhX * 2 || ty < -40 || ty > bhY * 2) break
      tries++
    }
  }

  const x = bhX + Math.cos(angle) * orbitRadius
  const y = bhY + Math.sin(angle) * orbitRadius
  const dir = Math.random() > 0.33 ? 1 : -1
  const tangentX = -Math.sin(angle) * dir
  const tangentY = Math.cos(angle) * dir
  const speed = circularSpeed(bhMu, orbitRadius) * rand(0.88, 1.08)

  const starRadius = config?.starRadius ?? rand(4.3, 7.2)
  const hue = config?.hue ?? (Math.random() > 0.6 ? rand(22, 42) : rand(195, 235))
  const mu = minDim * minDim * rand(0.014, 0.03)

  const star: Body = {
    id: nextId(),
    parentId: null,
    kind: "star",
    x,
    y,
    vx: tangentX * speed,
    vy: tangentY * speed,
    mu,
    radius: starRadius,
    hue,
    alpha: 0.92,
    glow: starRadius * 4.2,
    trailLength: 180,
    trail: [],
    alive: true,
    spawnFade: 0,
  }

  bodies.push(star)

  const planetCount = Math.random() > 0.55 ? (Math.random() > 0.55 ? 2 : 1) : 0
  for (let i = 0; i < planetCount; i++) {
    addPlanet(
      bodies,
      nextId,
      star,
      minDim * rand(0.04, 0.1),
      rand(0, TAU),
      rand(90, 280),
      rand(1.9, 3.2),
      rand(0.92, 1.06)
    )
  }
}

const buildScene = (w: number, h: number): BuiltScene => {
  const minDim = Math.min(w, h)
  const bhX = w * 0.69
  const bhY = h * 0.54
  const bhMu = minDim * minDim * 0.56

  let id = 0
  const nextId = () => id++
  const bodies: Body[] = []

  const presets = [
    { radius: minDim * 0.16, angle: 0.42, starRadius: 6.8, hue: 34 },
    { radius: minDim * 0.24, angle: 1.25, starRadius: 5.2, hue: 205 },
    { radius: minDim * 0.31, angle: 2.05, starRadius: 4.9, hue: 280 },
    { radius: minDim * 0.39, angle: 2.82, starRadius: 5.8, hue: 30 },
    { radius: minDim * 0.46, angle: 3.64, starRadius: 4.6, hue: 214 },
    { radius: minDim * 0.54, angle: 4.38, starRadius: 5.1, hue: 42 },
    { radius: minDim * 0.6, angle: 5.06, starRadius: 4.4, hue: 225 },
    { radius: minDim * 0.67, angle: 5.7, starRadius: 5.3, hue: 312 },
  ]

  for (let i = 0; i < presets.length; i++) {
    addStarSystem(bodies, nextId, bhX, bhY, bhMu, minDim, presets[i])
  }

  const disk: DiskParticle[] = Array.from({ length: Math.max(840, Math.floor((w * h) / 2600)) }, () => {
    const r = rand(minDim * 0.09, minDim * 0.19)
    return {
      r,
      angle: Math.random() * TAU,
      speed: rand(0.42, 1.18) * (minDim * 0.045 / r),
      size: rand(0.4, 1.45),
      alpha: rand(0.03, 0.14),
      hue: Math.random() > 0.5 ? rand(22, 42) : rand(188, 228),
    }
  })

  const stars: FaintStar[] = Array.from({ length: Math.max(520, Math.floor((w * h) / 5200)) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: rand(0.35, 1.45),
    a: rand(0.03, 0.14),
    phase: Math.random() * TAU,
    speed: rand(0.18, 1.0),
    hue: Math.random() > 0.84 ? rand(30, 55) : rand(205, 240),
  }))

  return {
    scene: { bodies, disk, stars },
    nextId: id,
  }
}

export default function PhysicsOrbitalBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const nextSpawnRef = useRef(0)
  const nextIdRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const sceneRef = useRef<Scene>({ bodies: [], disk: [], stars: [] })
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

      const built = buildScene(w, h)
      sceneRef.current = built.scene
      nextIdRef.current = built.nextId
      nextSpawnRef.current = 7 + Math.random() * 4
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
      const scene = sceneRef.current
      if (!w || !h || !bg) {
        frameRef.current = window.requestAnimationFrame(render)
        return
      }

      const t = now * 0.001
      const dtRaw = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.03)
      lastTimeRef.current = now
      const steps = Math.max(1, Math.ceil(dtRaw / 0.008))
      const dt = dtRaw / steps

      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.08)
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.08)

      const cursorX = currentRef.current.x * w
      const cursorY = currentRef.current.y * h
      const minDim = Math.min(w, h)

      const bhX = w * 0.69
      const bhY = h * 0.54
      const bhRadius = minDim * 0.051
      const bhMu = minDim * minDim * 0.56
      const cursorMu = minDim * minDim * 0.012

      if (t > nextSpawnRef.current) {
        const aliveStarCount = scene.bodies.filter((b) => b.alive && b.kind === "star").length
        if (aliveStarCount < 16) {
          const nextId = () => nextIdRef.current++
          addStarSystem(scene.bodies, nextId, bhX, bhY, bhMu, minDim, { incoming: true })
        }
        nextSpawnRef.current = t + rand(6.5, 10.5)
      }

      for (let step = 0; step < steps; step++) {
        const starsAlive = scene.bodies.filter((b) => b.alive && b.kind === "star")
        const ax = new Map<number, number>()
        const ay = new Map<number, number>()

        for (let i = 0; i < scene.bodies.length; i++) {
          const body = scene.bodies[i]
          if (!body.alive) continue

          let fx = 0
          let fy = 0

          const dxBH = bhX - body.x
          const dyBH = bhY - body.y
          const r2BH = dxBH * dxBH + dyBH * dyBH + minDim * 0.6
          const invBH = 1 / Math.pow(r2BH, 1.5)
          fx += bhMu * dxBH * invBH
          fy += bhMu * dyBH * invBH

          const dxC = cursorX - body.x
          const dyC = cursorY - body.y
          const r2C = dxC * dxC + dyC * dyC + minDim * 50
          const invC = 1 / Math.pow(r2C, 1.5)
          fx += cursorMu * dxC * invC
          fy += cursorMu * dyC * invC

          for (let j = 0; j < starsAlive.length; j++) {
            const star = starsAlive[j]
            if (star.id === body.id) continue
            const dx = star.x - body.x
            const dy = star.y - body.y
            const r2 = dx * dx + dy * dy + 30
            const inv = 1 / Math.pow(r2, 1.5)
            fx += star.mu * dx * inv
            fy += star.mu * dy * inv
          }

          ax.set(body.id, fx)
          ay.set(body.id, fy)
        }

        for (let i = 0; i < scene.bodies.length; i++) {
          const body = scene.bodies[i]
          if (!body.alive) continue
          body.vx += (ax.get(body.id) ?? 0) * dt
          body.vy += (ay.get(body.id) ?? 0) * dt
          body.x += body.vx * dt
          body.y += body.vy * dt
          body.spawnFade = clamp(body.spawnFade + dt * 0.35, 0, 1)
          pushTrail(body)
        }

        const deadStars = new Set<number>()

        for (let i = 0; i < scene.bodies.length; i++) {
          const a = scene.bodies[i]
          if (!a.alive || a.kind !== "star") continue

          const bhDist = Math.hypot(a.x - bhX, a.y - bhY)
          if (bhDist < bhRadius * 1.04) deadStars.add(a.id)

          for (let j = i + 1; j < scene.bodies.length; j++) {
            const b = scene.bodies[j]
            if (!b.alive || b.kind !== "star") continue
            const d = Math.hypot(a.x - b.x, a.y - b.y)
            if (d < (a.radius + b.radius) * 1.08) {
              deadStars.add(a.id)
              deadStars.add(b.id)
            }
          }
        }

        if (deadStars.size > 0) {
          for (let i = 0; i < scene.bodies.length; i++) {
            const body = scene.bodies[i]
            if (!body.alive) continue
            if (deadStars.has(body.id) || (body.parentId !== null && deadStars.has(body.parentId))) {
              body.alive = false
            }
          }
        }

        for (let i = 0; i < scene.bodies.length; i++) {
          const body = scene.bodies[i]
          if (!body.alive) continue

          if (body.kind === "planet") {
            const parentAlive = scene.bodies.some((b) => b.alive && b.id === body.parentId)
            if (!parentAlive) body.alive = false
          }

          const bhDist = Math.hypot(body.x - bhX, body.y - bhY)
          if (bhDist < bhRadius * 0.95) body.alive = false

          if (body.kind === "planet") {
            for (let j = 0; j < scene.bodies.length; j++) {
              const star = scene.bodies[j]
              if (!star.alive || star.kind !== "star") continue
              const d = Math.hypot(body.x - star.x, body.y - star.y)
              if (d < (body.radius + star.radius) * 0.92) body.alive = false
            }
          }

          if (
            body.x < -w * 0.34 ||
            body.x > w * 1.34 ||
            body.y < -h * 0.34 ||
            body.y > h * 1.34
          ) {
            body.alive = false
          }
        }
      }

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(bg, 0, 0, w, h)

      for (let i = 0; i < scene.stars.length; i++) {
        const s = scene.stars[i]
        const twinkle = 0.58 + 0.42 * Math.sin(t * s.speed + s.phase)
        ctx.fillStyle = `hsla(${s.hue} 90% 82% / ${s.a * twinkle})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, TAU)
        ctx.fill()
      }

      const diskTilt = 0.34

      ctx.save()
      ctx.translate(bhX, bhY)
      ctx.scale(1, diskTilt)

      const outerR = minDim * 0.19
      const innerR = minDim * 0.083

      const diskBack = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR)
      diskBack.addColorStop(0, "rgba(0,0,0,0)")
      diskBack.addColorStop(0.18, "rgba(255,175,110,0.09)")
      diskBack.addColorStop(0.4, "rgba(255,148,90,0.06)")
      diskBack.addColorStop(0.72, "rgba(120,190,255,0.028)")
      diskBack.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = diskBack
      ctx.beginPath()
      ctx.arc(0, 0, outerR, 0, TAU)
      ctx.fill()

      ctx.restore()

      ctx.save()
      ctx.globalCompositeOperation = "screen"

      for (let pass = 0; pass < 2; pass++) {
        const front = pass === 1
        for (let i = 0; i < scene.disk.length; i++) {
          const p = scene.disk[i]
          const a = p.angle + t * p.speed
          const x = Math.cos(a) * p.r
          const y = Math.sin(a) * p.r * diskTilt
          if ((front && y < 0) || (!front && y >= 0)) continue

          const sx = bhX + x
          const sy = bhY + y
          const rr = Math.hypot(x, y / diskTilt)
          const holeFade = clamp((rr - minDim * 0.08) / (minDim * 0.075), 0, 1)
          const sideBoost = 0.72 + 0.32 * (0.5 + 0.5 * Math.cos(a))
          const layerBoost = front ? 1.26 : 0.62
          const alpha = p.alpha * holeFade * sideBoost * layerBoost

          ctx.fillStyle = `hsla(${p.hue} 100% 74% / ${alpha})`
          ctx.beginPath()
          ctx.arc(sx, sy, p.size, 0, TAU)
          ctx.fill()
        }
      }

      const aliveBodies = scene.bodies.filter((b) => b.alive)

      for (let i = 0; i < aliveBodies.length; i++) {
        const body = aliveBodies[i]
        for (let j = 1; j < body.trail.length; j++) {
          const p0 = body.trail[j - 1]
          const p1 = body.trail[j]
          const a = (j / body.trail.length) * (body.kind === "star" ? 0.13 : 0.085) * body.spawnFade
          ctx.strokeStyle =
            body.kind === "star"
              ? `rgba(255,195,135,${a})`
              : `hsla(${body.hue} 100% 80% / ${a})`
          ctx.lineWidth = body.kind === "star" ? 2 : 1.15
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.stroke()
        }
      }

      for (let i = 0; i < aliveBodies.length; i++) {
        const body = aliveBodies[i]
        const fade = body.spawnFade
        const glow = ctx.createRadialGradient(body.x, body.y, 0, body.x, body.y, body.glow)
        if (body.kind === "star") {
          glow.addColorStop(0, `rgba(255,255,255,${0.96 * fade})`)
          glow.addColorStop(0.16, `rgba(255,215,150,${0.52 * fade})`)
          glow.addColorStop(1, "rgba(255,180,120,0)")
        } else {
          glow.addColorStop(0, `rgba(255,255,255,${0.94 * fade})`)
          glow.addColorStop(0.2, `hsla(${body.hue} 100% 78% / ${0.42 * fade})`)
          glow.addColorStop(1, `hsla(${body.hue} 100% 70% / 0)`)
        }

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(body.x, body.y, body.glow, 0, TAU)
        ctx.fill()

        ctx.fillStyle =
          body.kind === "star"
            ? `rgba(255,247,230,${body.alpha * fade})`
            : `hsla(${body.hue} 100% 86% / ${body.alpha * fade})`
        ctx.beginPath()
        ctx.arc(body.x, body.y, body.radius, 0, TAU)
        ctx.fill()
      }

      ctx.restore()

      const diskFront = ctx.createRadialGradient(bhX, bhY, minDim * 0.083, bhX, bhY, minDim * 0.17)
      diskFront.addColorStop(0, "rgba(255,175,110,0)")
      diskFront.addColorStop(0.22, "rgba(255,182,120,0.14)")
      diskFront.addColorStop(0.5, "rgba(120,190,255,0.05)")
      diskFront.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = diskFront
      ctx.beginPath()
      ctx.ellipse(bhX, bhY, minDim * 0.17, minDim * 0.17 * diskTilt, 0, 0, TAU)
      ctx.fill()

      const photonRing = ctx.createRadialGradient(bhX, bhY, bhRadius, bhX, bhY, minDim * 0.07)
      photonRing.addColorStop(0, "rgba(255,180,120,0)")
      photonRing.addColorStop(0.32, "rgba(255,190,130,0.18)")
      photonRing.addColorStop(0.68, "rgba(125,211,252,0.08)")
      photonRing.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = photonRing
      ctx.beginPath()
      ctx.arc(bhX, bhY, minDim * 0.07, 0, TAU)
      ctx.fill()

      const lensGlow = ctx.createRadialGradient(bhX, bhY, minDim * 0.02, bhX, bhY, minDim * 0.14)
      lensGlow.addColorStop(0, "rgba(255,255,255,0.03)")
      lensGlow.addColorStop(0.2, "rgba(125,211,252,0.025)")
      lensGlow.addColorStop(0.42, "rgba(244,114,182,0.015)")
      lensGlow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = lensGlow
      ctx.beginPath()
      ctx.arc(bhX, bhY, minDim * 0.14, 0, TAU)
      ctx.fill()

      ctx.fillStyle = "#000105"
      ctx.beginPath()
      ctx.arc(bhX, bhY, bhRadius, 0, TAU)
      ctx.fill()

      const cursorWash = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, minDim * 0.18)
      cursorWash.addColorStop(0, "rgba(125,211,252,0.026)")
      cursorWash.addColorStop(0.26, "rgba(168,85,247,0.02)")
      cursorWash.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = cursorWash
      ctx.beginPath()
      ctx.arc(cursorX, cursorY, minDim * 0.18, 0, TAU)
      ctx.fill()

      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        minDim * 0.16,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.88
      )
      vignette.addColorStop(0, "rgba(0,0,0,0)")
      vignette.addColorStop(0.72, "rgba(0,0,0,0.08)")
      vignette.addColorStop(1, "rgba(0,0,0,0.58)")
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