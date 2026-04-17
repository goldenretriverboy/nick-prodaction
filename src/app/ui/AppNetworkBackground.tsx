import { useEffect, useRef } from 'react'

type NetworkNode = {
  baseX: number
  baseY: number
  x: number
  y: number
  depth: number
  radius: number
  boost: number
  row: number
  col: number
}

export function AppNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches

    if (reduceMotion || !hasFinePointer) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const nodes: NetworkNode[] = []
    const cursor = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      lastMoveAt: 0,
    }

    let width = 0
    let height = 0
    let rafId = 0
    let lastTs = performance.now()
    let dpr = 1
    let gridCols = 0
    let gridRows = 0

    const createNodes = () => {
      nodes.length = 0

      const spacing = Math.max(34, Math.min(58, width / 28))
      const cols = Math.max(14, Math.floor(width / spacing))
      const rows = Math.max(9, Math.floor(height / spacing))
      gridCols = cols
      gridRows = rows
      const stepX = width / cols
      const stepY = height / rows

      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          const jitterX = (Math.random() - 0.5) * stepX * 0.28
          const jitterY = (Math.random() - 0.5) * stepY * 0.28
          const baseX = col * stepX + jitterX
          const baseY = row * stepY + jitterY

          nodes.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            depth: 0.45 + Math.random() * 0.85,
            radius: 0.9 + Math.random() * 1.05,
            boost: 0,
            row,
            col,
          })
        }
      }
    }

    const resizeCanvas = () => {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      createNodes()

      const centerX = width / 2
      const centerY = height / 2
      cursor.x = centerX
      cursor.y = centerY
      cursor.targetX = centerX
      cursor.targetY = centerY
    }

    const animate = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 16.6667, 2)
      lastTs = ts

      if (ts - cursor.lastMoveAt > 2200) {
        cursor.active = false
      }

      if (!cursor.active) {
        cursor.targetX = width / 2 + Math.sin(ts * 0.00016) * width * 0.08
        cursor.targetY = height / 2 + Math.cos(ts * 0.0002) * height * 0.06
      }

      cursor.x += (cursor.targetX - cursor.x) * 0.14 * dt
      cursor.y += (cursor.targetY - cursor.y) * 0.14 * dt

      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'screen'

      const influenceRadius = Math.max(220, Math.min(width, height) * 0.42)
      const normalizedX = (cursor.x / width - 0.5) * 2
      const normalizedY = (cursor.y / height - 0.5) * 2

      for (const node of nodes) {
        const offsetX = node.baseX - cursor.x
        const offsetY = node.baseY - cursor.y
        const distance = Math.hypot(offsetX, offsetY) || 1
        const influence = Math.max(0, 1 - distance / influenceRadius)
        const push = influence * 17

        node.boost = influence
        node.x = node.baseX + (offsetX / distance) * push + normalizedX * 9 * node.depth
        node.y = node.baseY + (offsetY / distance) * push + normalizedY * 7 * node.depth
      }

      for (const node of nodes) {
        const neighbors: NetworkNode[] = []

        if (node.col < gridCols) {
          const right = nodes[node.row * (gridCols + 1) + (node.col + 1)]
          if (right) {
            neighbors.push(right)
          }
        }
        if (node.row < gridRows) {
          const bottom = nodes[(node.row + 1) * (gridCols + 1) + node.col]
          if (bottom) {
            neighbors.push(bottom)
          }
        }
        if (node.col < gridCols && node.row < gridRows) {
          const diagonal = nodes[(node.row + 1) * (gridCols + 1) + (node.col + 1)]
          if (diagonal) {
            neighbors.push(diagonal)
          }
        }

        for (const neighbor of neighbors) {
          const avgBoost = (node.boost + neighbor.boost) * 0.5
          context.strokeStyle = `rgba(136, 164, 255, ${0.08 + avgBoost * 0.28})`
          context.lineWidth = 0.7 + avgBoost * 0.95
          context.beginPath()
          context.moveTo(node.x, node.y)
          context.lineTo(neighbor.x, neighbor.y)
          context.stroke()
        }
      }

      for (const node of nodes) {
        const radius = node.radius * (1 + node.boost * 2.15)
        context.fillStyle = `rgba(206, 222, 255, ${0.14 + node.boost * 0.72})`
        context.beginPath()
        context.arc(node.x, node.y, radius, 0, Math.PI * 2)
        context.fill()

        if (node.boost > 0.02) {
          context.fillStyle = `rgba(120, 156, 255, ${0.12 + node.boost * 0.3})`
          context.beginPath()
          context.arc(node.x, node.y, radius * 2.4, 0, Math.PI * 2)
          context.fill()
        }
      }

      context.globalCompositeOperation = 'source-over'
      rafId = window.requestAnimationFrame(animate)
    }

    const handlePointerMove = (event: PointerEvent) => {
      cursor.targetX = event.clientX
      cursor.targetY = event.clientY
      cursor.active = true
      cursor.lastMoveAt = performance.now()
    }

    const handleBlur = () => {
      cursor.active = false
      cursor.lastMoveAt = 0
    }

    resizeCanvas()

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', handleBlur)
    rafId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', handleBlur)
      context.clearRect(0, 0, width, height)
    }
  }, [])

  return <canvas ref={canvasRef} className="app-network-background" aria-hidden="true" />
}
