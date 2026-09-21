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

interface WaterRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
}

export default function InteractiveBackground({ isDarkMode }: InteractiveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
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
    let currentX = 0
    let currentY = 0
    let animationFrameId: number

    // Water Ripples Collection
    const ripples: WaterRipple[] = []
    let lastSpawnX = -999
    let lastSpawnY = -999

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      mouseX = (e.clientX - centerX) / centerX
      mouseY = (e.clientY - centerY) / centerY

      // Spawn water ripple if mouse moved enough distance (feels like gliding fingers on water)
      const dist = Math.hypot(e.clientX - lastSpawnX, e.clientY - lastSpawnY)
      if (dist > 18) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 3,
          maxRadius: 75 + Math.random() * 25,
          alpha: 0.65,
          speed: 1.4 + Math.random() * 0.8,
        })
        lastSpawnX = e.clientX
        lastSpawnY = e.clientY

        // Limit active ripples for peak performance
        if (ripples.length > 35) {
          ripples.shift()
        }
      }
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

    // Floating ambient particles (sparse & tranquil)
    const particleCount = Math.min(Math.floor((width * height) / 30000), 40)
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const alpha = Math.random() * 0.25 + 0.12
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.25 - 0.05,
        size: Math.random() * 1.5 + 1,
        alpha,
      })
    }

    // Main 60 FPS Render Loop
    const render = () => {
      // 1. Mouse Parallax for Mountain Layer
      if (!prefersReducedMotion) {
        currentX += (mouseX * 12 - currentX) * 0.04
        currentY += (mouseY * 12 - currentY) * 0.04

        if (bgRef.current) {
          bgRef.current.style.transform = `translate3d(${-currentX}px, ${-currentY}px, 0) scale(1.06)`
        }
      } else if (bgRef.current) {
        bgRef.current.style.transform = 'scale(1.02)'
      }

      ctx.clearRect(0, 0, width, height)

      // 2. Render & Update Water Ripples ("lõng bõng lướt trên mặt nước")
      if (!prefersReducedMotion && ripples.length > 0) {
        ctx.save()
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i]
          r.radius += r.speed
          r.alpha *= 0.962 // Smooth water dispersion

          if (r.alpha < 0.02 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1)
            continue
          }

          // Primary Outer Wave Crest
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
          ctx.lineWidth = Math.max(1, 2.5 * (1 - r.radius / r.maxRadius))
          ctx.strokeStyle = isDarkMode
            ? `rgba(103, 232, 249, ${r.alpha * 0.55})`
            : `rgba(14, 165, 233, ${r.alpha * 0.45})`
          ctx.stroke()

          // Secondary Inner Echo Wave (Water refraction ring)
          if (r.radius > 10) {
            ctx.beginPath()
            ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2)
            ctx.lineWidth = Math.max(0.75, 1.5 * (1 - r.radius / r.maxRadius))
            ctx.strokeStyle = isDarkMode
              ? `rgba(165, 243, 252, ${r.alpha * 0.3})`
              : `rgba(56, 189, 248, ${r.alpha * 0.25})`
            ctx.stroke()
          }

          // Tertiary Micro-Ring
          if (r.radius > 20) {
            ctx.beginPath()
            ctx.arc(r.x, r.y, r.radius * 0.35, 0, Math.PI * 2)
            ctx.lineWidth = 0.75
            ctx.strokeStyle = isDarkMode
              ? `rgba(207, 250, 254, ${r.alpha * 0.18})`
              : `rgba(125, 211, 252, ${r.alpha * 0.15})`
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      // 3. Render Floating Ambient Particles
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

          // Gentle mouse water-push (repulsion)
          const dx = p.x - mouseCanvasX
          const dy = p.y - mouseCanvasY
          const dist = Math.hypot(dx, dy)
          const maxDist = 90

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 0.8
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
          ctx.fillStyle = `rgba(14, 116, 144, ${p.alpha * 0.6})`
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
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Mountain Landscape Background with Parallax */}
      <div
        ref={bgRef}
        className="absolute -inset-8 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out will-change-transform motion-reduce:transform-none motion-reduce:transition-none"
        style={{
          backgroundImage: `url('/virtual-double-background.jpg')`,
        }}
      />

      {/* Adaptive Atmospheric Tint Layer (Calibrated for visible mountains) */}
      {isDarkMode ? (
        <div className="absolute inset-0 bg-gradient-to-b from-[#070f26]/50 via-[#0a1636]/40 to-[#070e24]/60 backdrop-blur-[2px]" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 via-sky-50/40 to-slate-200/55 backdrop-blur-[2px]" />
      )}

      {/* Soft Ambient Vignette */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(5,10,25,0.45)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(241,245,249,0.35)_100%)]'
        }`}
      />

      {/* Canvas for Water Ripples ("lõng bõng lướt trên mặt nước") & Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full motion-reduce:hidden" />
    </div>
  )
}
