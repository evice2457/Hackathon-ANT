'use client'

import { useEffect, useRef } from 'react'

interface InteractiveBackgroundProps {
  isDarkMode: boolean
}

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  size: number
  alpha: number
}

export default function InteractiveBackground({ isDarkMode }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Accessibility check: Reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let prefersReducedMotion = mediaQuery.matches

    const handleMediaChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    let mouseX = 0
    let mouseY = 0
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      mouseX = (e.clientX - centerX) / centerX
      mouseY = (e.clientY - centerY) / centerY
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Setup Canvas
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Floating ambient particles (sparse, tranquil & soothing)
    const particleCount = Math.min(Math.floor((width * height) / 32000), 36)
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const alpha = Math.random() * 0.22 + 0.1
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.2 - 0.05,
        size: Math.random() * 1.5 + 1,
        alpha,
      })
    }

    // Main 60 FPS Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Render Floating Ambient Particles
      const mouseCanvasX = (mouseX + 1) * 0.5 * width
      const mouseCanvasY = (mouseY + 1) * 0.5 * height

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy

          // Edge wrap
          if (p.y < -10) {
            p.y = height + 10
            p.x = Math.random() * width
          }
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10

          // Gentle mouse ambient reaction
          const dx = p.x - mouseCanvasX
          const dy = p.y - mouseCanvasY
          const dist = Math.hypot(dx, dy)
          const maxDist = 80

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 0.6
            p.x += (dx / dist) * force
            p.y += (dy / dist) * force
          }
        }

        // Draw particle dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        if (isDarkMode) {
          ctx.fillStyle = `rgba(165, 243, 252, ${p.alpha})`
        } else {
          ctx.fillStyle = `rgba(14, 116, 144, ${p.alpha * 0.5})`
        }
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDarkMode])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Subtle Ambient Color Gradient Matching Palette */}
      {isDarkMode ? (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-[#070F26]" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F0F9FF] to-[#E2E8F0]" />
      )}

      {/* Soft Radial Ambient Lighting */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,_rgba(14,165,233,0.12),_transparent_75%)]'
            : 'bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,_rgba(56,189,248,0.14),_transparent_75%)]'
        }`}
      />

      {/* Subtle Edge Vignette */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(7,15,38,0.6)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(226,232,240,0.5)_100%)]'
        }`}
      />

      {/* Ambient Peaceful Floating Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full motion-reduce:hidden" />
    </div>
  )
}
