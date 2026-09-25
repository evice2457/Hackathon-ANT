'use client'

import { useEffect, useRef } from 'react'

interface InteractiveBackgroundProps {
  isDarkMode: boolean
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

    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0
    let animationFrameId: number
    let time = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      targetMouseX = (e.clientX - centerX) / centerX
      targetMouseY = (e.clientY - centerY) / centerY
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

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

    // Render loop: Topographic Halftone / Dither Dot Grid
    const step = 28 // Grid spacing for crisp halftone dots

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse easing
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05
      time += 0.008

      const cols = Math.ceil(width / step) + 1
      const rows = Math.ceil(height / step) + 1

      for (let r = 0; r < rows; r++) {
        const y = r * step
        for (let c = 0; c < cols; c++) {
          const x = c * step

          // Topographic wave simulation: multi-frequency sine wave
          const wave1 = Math.sin(x * 0.0035 + y * 0.0025 + time)
          const wave2 = Math.cos(x * 0.002 - y * 0.004 - time * 0.7)
          const wave3 = Math.sin((x + y) * 0.002 + time * 0.5)
          const elevation = (wave1 + wave2 + wave3) / 3 // Value from -1 to 1

          // Gentle mouse displacement
          const dx = x - (width / 2 + mouseX * 200)
          const dy = y - (height / 2 + mouseY * 200)
          const dist = Math.hypot(dx, dy)
          const mouseFactor = Math.max(0, 1 - dist / 500) * 0.35

          const combined = elevation + mouseFactor

          // Convert to Halftone dot size and opacity (only draw in crest areas for delicate editorial look)
          if (combined > -0.2) {
            const normalized = (combined + 0.2) / 1.5 // 0 to 1
            const dotSize = Math.max(0.6, Math.min(2.8, normalized * 2.8))
            const alpha = Math.min(0.28, Math.max(0.04, normalized * 0.26))

            ctx.beginPath()
            ctx.arc(x, y, dotSize, 0, Math.PI * 2)

            if (isDarkMode) {
              // Warm crimson-rose dither dots in dark mode
              ctx.fillStyle = `rgba(224, 72, 98, ${alpha * 0.9})`
            } else {
              // Warm crimson-coral dither dots in light mode
              ctx.fillStyle = `rgba(166, 28, 48, ${alpha})`
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
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDarkMode])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Warm Ambient Base Gradient */}
      {isDarkMode ? (
        <div className="absolute inset-0 bg-gradient-to-b from-[#160B0F] via-[#1F0E16] to-[#12070B]" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FDFBF7] to-[#F5ECE3]" />
      )}

      {/* Warm Radial Ambient Lighting (Rose Crimson & Warm Butter) */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_80%_60%_at_50%_15%,_rgba(201,42,67,0.12),_transparent_75%),radial-gradient(ellipse_60%_50%_at_85%_75%,_rgba(251,232,166,0.06),_transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_80%_60%_at_50%_15%,_rgba(166,28,48,0.07),_transparent_75%),radial-gradient(ellipse_60%_50%_at_85%_75%,_rgba(251,232,166,0.16),_transparent_70%)]'
        }`}
      />

      {/* Subtle Vignette for Editorial Depth */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(18,7,11,0.6)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,_transparent_65%,_rgba(235,223,212,0.45)_100%)]'
        }`}
      />

      {/* Topographic Halftone / Dither Dots Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full motion-reduce:hidden" />
    </div>
  )
}
