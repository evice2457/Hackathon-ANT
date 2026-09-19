'use client'

export default function BreathingAura() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer glow layer */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/20 blur-3xl animate-pulse opacity-60"></div>
      
      {/* Middle animated ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 opacity-50 animate-[spin_8s_linear_infinite]"></div>
      
      {/* Inner breathing ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/50 animate-[pulse_4s_ease-in-out_infinite]"></div>

      {/* Center circle */}
      <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 shadow-inner flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-cyan-300 font-light tracking-wider">15 min</div>
          <div className="text-xs text-slate-400 mt-1">Just breathe</div>
        </div>
      </div>

      {/* Subtle floating particles */}
      <div className="absolute w-2 h-2 bg-cyan-400/40 rounded-full top-8 left-1/2 -translate-x-1/2 animate-[float_6s_ease-in-out_infinite]"></div>
      <div className="absolute w-2 h-2 bg-blue-400/40 rounded-full bottom-8 right-8 animate-[float_7s_ease-in-out_infinite_2s]"></div>
      <div className="absolute w-2 h-2 bg-cyan-400/30 rounded-full bottom-8 left-8 animate-[float_5s_ease-in-out_infinite_1s]"></div>
    </div>
  )
}
