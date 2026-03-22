"use client"

import { useEffect, useRef } from "react"

type Node = {
  layer: number
  index: number
  baseX: number
  baseY: number
  x: number
  y: number
  phase: number
  bias: number
  activation: number
  hue: number
}

type Connection = {
  from: number
  to: number
  weight: number
  phase: number
  speed: number
}

type Scene = {
  nodes: Node[]
  layers: number[][]
  connections: Connection[]
  incoming: number[][]
  stars: { x: number; y: number; r: number; a: number; phase: number; speed: number }[]
}

const TAU = Math.PI * 2
const LAYER_COUNTS = [8, 12, 16, 20, 20, 16, 12, 8]
const GRAIN_OPACITY = 0.12

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
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
  bg.addColorStop(0, "#02030a")
  bg.addColorStop(0.28, "#071225")
  bg.addColorStop(0.6, "#0a1730")
  bg.addColorStop(1, "#02050b")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const glowA = ctx.createRadialGradient(w * 0.12, h * 0.16, 0, w * 0.12, h * 0.16, w * 0.42)
  glowA.addColorStop(0, "rgba(56,189,248,0.09)")
  glowA.addColorStop(0.3, "rgba(103,232,249,0.05)")
  glowA.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, w, h)

  const glowB = ctx.createRadialGradient(w * 0.88, h * 0.72, 0, w * 0.88, h * 0.72, w * 0.4)
  glowB.addColorStop(0, "rgba(129,140,248,0.1)")
  glowB.addColorStop(0.3, "rgba(168,85,247,0.045)")
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
  const nodes: Node[] = []
  const layers: number[][] = []

  const startX = -w * 0.035
  const endX = w * 1.035
  const usableHeight = h * 0.9
  const top = h * 0.05

  for (let layer = 0; layer < LAYER_COUNTS.length; layer++) {
    const count = LAYER_COUNTS[layer]
    const x = lerp(startX, endX, layer / (LAYER_COUNTS.length - 1))
    const gap = count === 1 ? 0 : usableHeight / (count - 1)
    const layerNodes: number[] = []

    for (let i = 0; i < count; i++) {
      const bend = Math.sin((i / Math.max(count - 1, 1)) * Math.PI + layer * 0.42) * 12
      const y = top + i * gap + bend
      const hue = lerp(188, 262, layer / (LAYER_COUNTS.length - 1))
      const nodeIndex = nodes.length

      nodes.push({
        layer,
        index: i,
        baseX: x + rand(-10, 10),
        baseY: y + rand(-8, 8),
        x,
        y,
        phase: Math.random() * TAU,
        bias: rand(-0.65, 0.65),
        activation: 0,
        hue,
      })

      layerNodes.push(nodeIndex)
    }

    layers.push(layerNodes)
  }

  const connections: Connection[] = []
  const incoming: number[][] = Array.from({ length: nodes.length }, () => [])

  for (let layer = 0; layer < layers.length - 1; layer++) {
    const left = layers[layer]
    const right = layers[layer + 1]

    for (let i = 0; i < left.length; i++) {
      const from = left[i]
      const mapped = Math.round((i / Math.max(left.length - 1, 1)) * (right.length - 1))
      const targets = new Set<number>()

      for (let offset = -2; offset <= 2; offset++) {
        const idx = mapped + offset
        if (idx >= 0 && idx < right.length) targets.add(right[idx])
      }

      targets.add(right[Math.floor(Math.random() * right.length)])
      if (Math.random() > 0.45) targets.add(right[Math.floor(Math.random() * right.length)])

      for (const to of targets) {
        const connectionIndex = connections.length
        connections.push({
          from,
          to,
          weight: rand(-0.95, 0.95),
          phase: Math.random(),
          speed: rand(0.45, 0.95),
        })
        incoming[to].push(connectionIndex)
      }
    }
  }

  const stars = Array.from({ length: 160 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: rand(0.35, 1.25),
    a: rand(0.04, 0.12),
    phase: Math.random() * TAU,
    speed: rand(0.35, 1.2),
  }))

  return { nodes, layers, connections, incoming, stars }
}

const quadraticPoint = (
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  t: number
) => {
  const inv = 1 - t
  const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x1
  const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y1
  return { x, y }
}

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const sceneRef = useRef<Scene>({
    nodes: [],
    layers: [],
    connections: [],
    incoming: [],
    stars: [],
  })
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
      const scene = sceneRef.current

      if (!w || !h || !bg || scene.nodes.length === 0) {
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
      const cursorRadius = Math.min(w, h) * 0.24

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(bg, 0, 0, w, h)

      for (let i = 0; i < scene.stars.length; i++) {
        const s = scene.stars[i]
        const twinkle = 0.6 + 0.4 * Math.sin(t * s.speed + s.phase)
        ctx.fillStyle = `rgba(220,232,255,${s.a * twinkle})`
        ctx.beginPath()
        ctx.arc(s.x - px * 4, s.y - py * 4, s.r, 0, TAU)
        ctx.fill()
      }

      for (let i = 0; i < scene.nodes.length; i++) {
        const node = scene.nodes[i]
        const dx = cursorX - node.baseX
        const dy = cursorY - node.baseY
        const dist = Math.hypot(dx, dy)
        const influence = Math.exp(-((dist / cursorRadius) * (dist / cursorRadius)))

        const layerParallax = px * (12 + node.layer * 2.1)
        const verticalParallax = py * 9
        const breatheX = Math.sin(t * 0.7 + node.phase) * 1.7
        const breatheY = Math.cos(t * 0.82 + node.phase) * 2.3

        node.x = node.baseX + layerParallax + dx * 0.03 * influence + breatheX
        node.y = node.baseY + verticalParallax + dy * 0.05 * influence + breatheY
      }

      const inputLayer = scene.layers[0]
      for (let i = 0; i < inputLayer.length; i++) {
        const node = scene.nodes[inputLayer[i]]
        const dx = cursorX - node.x
        const dy = cursorY - node.y
        const dist = Math.hypot(dx, dy)
        const local = Math.exp(-((dist / cursorRadius) * (dist / cursorRadius)))

        const signal =
          Math.sin(t * 1.2 + node.phase) * 1.1 +
          Math.cos(t * 0.74 + node.phase * 1.3) * 0.5 +
          local * 2.25 +
          node.bias * 0.35 -
          0.55

        node.activation = sigmoid(signal)
      }

      for (let layer = 1; layer < scene.layers.length; layer++) {
        const layerNodes = scene.layers[layer]

        for (let j = 0; j < layerNodes.length; j++) {
          const nodeIndex = layerNodes[j]
          const node = scene.nodes[nodeIndex]
          const inc = scene.incoming[nodeIndex]

          let sum = 0
          for (let k = 0; k < inc.length; k++) {
            const connection = scene.connections[inc[k]]
            sum += scene.nodes[connection.from].activation * connection.weight
          }

          const dx = cursorX - node.x
          const dy = cursorY - node.y
          const dist = Math.hypot(dx, dy)
          const local = Math.exp(-((dist / cursorRadius) * (dist / cursorRadius)))

          const signal =
            sum / Math.sqrt(Math.max(inc.length, 1)) +
            Math.sin(t * 0.76 + node.phase) * 0.2 +
            local * 0.5 +
            node.bias * 0.24

          node.activation = sigmoid(signal)
        }
      }

      ctx.globalCompositeOperation = "screen"
      ctx.lineCap = "round"

      for (let i = 0; i < scene.connections.length; i++) {
        const connection = scene.connections[i]
        const from = scene.nodes[connection.from]
        const to = scene.nodes[connection.to]

        const avg = (from.activation + to.activation) * 0.5
        const midX = (from.x + to.x) * 0.5
        const midY = (from.y + to.y) * 0.5
        const lineDx = to.x - from.x
        const lineDy = to.y - from.y
        const len = Math.hypot(lineDx, lineDy) || 1
        const nx = -lineDy / len
        const ny = lineDx / len

        const cursorMidDist = Math.hypot(cursorX - midX, cursorY - midY)
        const bendInfluence = Math.exp(-((cursorMidDist / (Math.min(w, h) * 0.34)) ** 2))
        const bend =
          (Math.sin(t * 0.9 + connection.phase * TAU) * 5.5 + px * 10 + py * 7) *
          (0.28 + bendInfluence * 1.18)

        const cx = midX + nx * bend + (cursorX - midX) * 0.016 * bendInfluence
        const cy = midY + ny * bend + (cursorY - midY) * 0.016 * bendInfluence

        const alpha = 0.025 + Math.abs(connection.weight) * 0.018 + avg * 0.105

        ctx.strokeStyle =
          connection.weight >= 0
            ? `rgba(110,231,255,${alpha})`
            : `rgba(196,181,253,${alpha})`
        ctx.lineWidth = 0.5 + avg * 0.52

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.quadraticCurveTo(cx, cy, to.x, to.y)
        ctx.stroke()

        const pulseStrength = from.activation * (0.22 + avg * 0.78)
        if (pulseStrength > 0.12) {
          const progress = ((t * connection.speed + connection.phase) % 1 + 1) % 1
          const p = quadraticPoint(from.x, from.y, cx, cy, to.x, to.y, progress)
          const pulseR = 3 + avg * 6

          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR)
          if (connection.weight >= 0) {
            g.addColorStop(0, `rgba(255,255,255,${pulseStrength})`)
            g.addColorStop(0.22, `rgba(125,211,252,${pulseStrength * 0.62})`)
            g.addColorStop(1, "rgba(125,211,252,0)")
          } else {
            g.addColorStop(0, `rgba(255,255,255,${pulseStrength})`)
            g.addColorStop(0.22, `rgba(196,181,253,${pulseStrength * 0.62})`)
            g.addColorStop(1, "rgba(196,181,253,0)")
          }

          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, pulseR, 0, TAU)
          ctx.fill()
        }
      }

      for (let i = 0; i < scene.nodes.length; i++) {
        const node = scene.nodes[i]
        const dx = cursorX - node.x
        const dy = cursorY - node.y
        const dist = Math.hypot(dx, dy)
        const local = Math.exp(-((dist / cursorRadius) * (dist / cursorRadius)))

        const radius = 2.7 + node.activation * 2.1 + local * 1.1
        const glowR = radius * 4.25

        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR)
        glow.addColorStop(0, `hsla(${node.hue} 100% 86% / ${0.72 * node.activation + local * 0.14 + 0.08})`)
        glow.addColorStop(0.16, `hsla(${node.hue} 100% 76% / ${0.42 * node.activation + local * 0.09 + 0.05})`)
        glow.addColorStop(1, `hsla(${node.hue} 100% 70% / 0)`)

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, glowR, 0, TAU)
        ctx.fill()

        ctx.fillStyle = `rgba(255,255,255,${0.76 + node.activation * 0.22})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, TAU)
        ctx.fill()

        ctx.strokeStyle = `hsla(${node.hue} 100% 78% / ${0.12 + node.activation * 0.22})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 1.5, 0, TAU)
        ctx.stroke()
      }

      ctx.globalCompositeOperation = "source-over"

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
      vignette.addColorStop(1, "rgba(0,0,0,0.55)")
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