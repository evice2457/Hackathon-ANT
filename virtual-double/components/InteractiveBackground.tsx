'use client'

import { useEffect, useRef } from 'react'

interface InteractiveBackgroundProps {
  isDarkMode: boolean
}

interface WaveRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  intensity: number
  speed: number
}

export default function InteractiveBackground({ isDarkMode }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let prefersReducedMotion = mediaQuery.matches

    const handleMediaChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let smoothX = targetX
    let smoothY = targetY
    let prevSmoothX = targetX
    let prevSmoothY = targetY
    let smoothVelocity = 0
    let isHovering = false

    const ripples: WaveRipple[] = []
    let animationFrameId: number
    let time = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return
      isHovering = true
      targetX = e.clientX
      targetY = e.clientY
    }

    const handleMouseLeave = () => {
      isHovering = false
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Grid spacing for buttery fluid dither nodes
    const step = 24

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Silky dual-exponential easing for cursor tracking
      smoothX += (targetX - smoothX) * 0.075
      smoothY += (targetY - smoothY) * 0.075

      const distMoved = Math.hypot(smoothX - prevSmoothX, smoothY - prevSmoothY)
      smoothVelocity += (distMoved - smoothVelocity) * 0.1
      prevSmoothX = smoothX
      prevSmoothY = smoothY

      time += isHovering ? 0.012 : 0.008

      // Spawn soft ripples on gentle movement
      if (distMoved > 3 && ripples.length < 10) {
        ripples.push({
          x: smoothX,
          y: smoothY,
          radius: 6,
          maxRadius: Math.min(width, height) * 0.4,
          intensity: Math.min(0.85, 0.25 + distMoved * 0.03),
          speed: 2.8,
        })
      }

      // Update ripples with smooth attenuation
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i]
        rip.radius += rip.speed
        rip.intensity *= 0.985
        if (rip.radius >= rip.maxRadius || rip.intensity < 0.02) {
          ripples.splice(i, 1)
        }
      }

      const cols = Math.ceil(width / step) + 1
      const rows = Math.ceil(height / step) + 1

      for (let r = 0; r < rows; r++) {
        const y = r * step
        for (let c = 0; c < cols; c++) {
          const x = c * step

          // Harmonic multi-frequency waves
          const wave1 = Math.sin(x * 0.0028 + y * 0.002 + time * 1.1)
          const wave2 = Math.cos(x * 0.0016 - y * 0.0032 - time * 0.8)
          const wave3 = Math.sin((x * 0.6 + y * 0.8) * 0.0022 + time * 0.55)
          let elevation = wave1 * 0.42 + wave2 * 0.36 + wave3 * 0.22

          // Smooth Hermite cubic cursor disturbance
          const dx = x - smoothX
          const dy = y - smoothY
          const distToMouse = Math.hypot(dx, dy)
          const maxInfluence = 380

          if (distToMouse < maxInfluence) {
            // Normalized smoothstep curve: 3t^2 - 2t^3
            const t = 1 - distToMouse / maxInfluence
            const smoothFalloff = t * t * (3 - 2 * t)
            const rippleWave = Math.sin(distToMouse * 0.035 - time * 3.2)
            elevation += rippleWave * smoothFalloff * (0.65 + Math.min(smoothVelocity * 0.15, 0.45))
          }

          // Gentle ripples influence
          for (let i = 0; i < ripples.length; i++) {
            const rip = ripples[i]
            const dRip = Math.hypot(x - rip.x, y - rip.y)
            const diff = Math.abs(dRip - rip.radius)
            if (diff < 80) {
              const u = 1 - diff / 80
              const smoothU = u * u * (3 - 2 * u)
              elevation += Math.sin(diff * 0.065) * smoothU * rip.intensity * 0.38
            }
          }

          // Render crest nodes with soft ethereal dots
          if (elevation > -0.24) {
            const normalized = (elevation + 0.24) / 1.5
            const clamped = Math.max(0, Math.min(1, normalized))
            const dotSize = Math.max(0.5, Math.min(3.0, clamped * 3.0))
            const alpha = Math.min(0.30, Math.max(0.035, clamped * 0.28))

            ctx.beginPath()
            ctx.arc(x, y, dotSize, 0, Math.PI * 2)

            if (isDarkMode) {
              ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.95})`
            } else {
              ctx.fillStyle = `rgba(2, 132, 199, ${alpha * 0.88})`
            }
            ctx.fill()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDarkMode])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Editorial Base Gradients */}
      {isDarkMode ? (
        <div className="absolute inset-0 bg-gradient-to-b from-[#070F26] via-[#0B132B] to-[#040817]" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F0F9FF] to-[#E2E8F0]" />
      )}

      {/* Atmospheric Soft Cyan Radial Light */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_90%_70%_at_50%_15%,_rgba(6,182,212,0.15),_transparent_75%),radial-gradient(ellipse_60%_50%_at_85%_75%,_rgba(56,189,248,0.09),_transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_90%_70%_at_50%_15%,_rgba(2,132,199,0.09),_transparent_75%),radial-gradient(ellipse_60%_50%_at_85%_75%,_rgba(14,165,233,0.07),_transparent_70%)]'
        }`}
      />

      {/* Vignette Depth */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(4,8,23,0.7)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(203,213,225,0.5)_100%)]'
        }`}
      />

      {/* Silky Fluid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full motion-reduce:hidden" />
    </div>
  )
}
