'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  Wind,
  Headphones,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

type TaskDifficulty = 'light' | 'medium' | 'deep' | 'creative'

interface MusicTrack {
  id: string
  title: string
  difficulty: TaskDifficulty
  difficultyLabel: string
  genre: string
  bpm: string
  description: string
  scientificBenefit: string
  tags: string[]
  synthType: 'lofi' | 'binaural' | 'drone' | 'piano'
}

interface RecoveryViewProps {
  onStartFocusWithMusic?: (genre: string) => void
}

export default function RecoveryView({ onStartFocusWithMusic }: RecoveryViewProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty>('medium')
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')
  const [breathSeconds, setBreathSeconds] = useState(4)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  // Guided 4-7-8 Breathing Timer Cycle
  useEffect(() => {
    let timer: NodeJS.Timeout
    const runCycle = () => {
      setBreathPhase('Inhale')
      setBreathSeconds(4)
      timer = setTimeout(() => {
        setBreathPhase('Hold')
        setBreathSeconds(7)
        timer = setTimeout(() => {
          setBreathPhase('Exhale')
          setBreathSeconds(8)
          timer = setTimeout(runCycle, 8000)
        }, 7000)
      }, 4000)
    }
    runCycle()
    return () => clearTimeout(timer)
  }, [])

  // Web Audio Synthesizer for live realistic ambient preview
  const stopAudio = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop()
        oscRef.current.disconnect()
      } catch {}
      oscRef.current = null
    }
    if (gainRef.current) {
      try {
        gainRef.current.disconnect()
      } catch {}
      gainRef.current = null
    }
    setActivePlayingId(null)
  }

  const playSynthPreview = (track: MusicTrack) => {
    if (activePlayingId === track.id) {
      stopAudio()
      return
    }
    stopAudio()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      if (track.synthType === 'binaural') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(216, ctx.currentTime)
      } else if (track.synthType === 'drone') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(110, ctx.currentTime)
      } else if (track.synthType === 'lofi') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(329.63, ctx.currentTime)
      } else {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, ctx.currentTime)
      }

      gain.gain.setValueAtTime(0.01, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.8)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()

      oscRef.current = osc
      gainRef.current = gain
      setActivePlayingId(track.id)
    } catch {
      setActivePlayingId(track.id)
    }
  }

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const tracks: MusicTrack[] = [
    {
      id: 'track-1',
      title: 'Binaural Flow 10Hz (Alpha Waves)',
      difficulty: 'medium',
      difficultyLabel: 'Moderate / Logic & Programming',
      genre: 'Binaural Alpha Waves',
      bpm: 'Neural Entrainment',
      description: '10Hz audio entrainment gently induces alpha brainwaves, maintaining calm alertness without anxiety.',
      scientificBenefit: 'Decreases mental fatigue during complex logic synthesis and debugging.',
      tags: ['Alpha Waves', 'Flow State', 'Logic Work'],
      synthType: 'binaural',
    },
    {
      id: 'track-2',
      title: 'Deep Abyss Brown Noise & Ambient Drone',
      difficulty: 'deep',
      difficultyLabel: 'Deep / Mathematics & Architecture',
      genre: 'Brown Noise & Drone',
      bpm: 'Acoustic Isolation',
      description: 'Low-frequency spectral distribution shields cognitive working memory from abrupt auditory distractions.',
      scientificBenefit: 'Enhances working memory retention by dampening transient environment noise.',
      tags: ['Brown Noise', 'Deep Isolation', 'Focus'],
      synthType: 'drone',
    },
    {
      id: 'track-3',
      title: 'Tokyo Midnight Rain — Warm Lo-Fi Chill',
      difficulty: 'light',
      difficultyLabel: 'Light / Communications & Admin',
      genre: 'Lo-Fi Chill Hop',
      bpm: '76 BPM',
      description: 'Gentle syncopated beats combined with soft rain textures encourage relaxed pacing during routine tasks.',
      scientificBenefit: 'Sustains resting heart rate in the optimal 68-72 BPM zone for operational tasks.',
      tags: ['Lo-Fi Beats', 'Rain Textures', 'Relaxed Flow'],
      synthType: 'lofi',
    },
    {
      id: 'track-4',
      title: 'Neo-Classical Echoes — Piano & Strings',
      difficulty: 'creative',
      difficultyLabel: 'Creative / Design & Ideation',
      genre: 'Cinematic Modern Piano',
      bpm: 'Free Tempo',
      description: 'Minimalist melodic motifs stimulate divergent thinking and spatial imagination without lyrical distraction.',
      scientificBenefit: 'Fosters hemispheric integration during brainstorming and visual composition.',
      tags: ['Minimal Piano', 'Creative Ideation', 'Atmosphere'],
      synthType: 'piano',
    },
  ]

  const filteredTracks = tracks.filter((t) => t.difficulty === selectedDifficulty)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-in fade-in duration-500 font-sans">
      {/* Editorial Recovery Header (No badges, high-contrast dark title in light mode) */}
      <div className="mb-8 border-b border-slate-200/80 dark:border-cyan-500/15 pb-6">
        <h1 className="text-3xl font-serif font-normal tracking-tight text-[#0A1128] dark:text-slate-100 sm:text-4xl">
          Recovery & Cognitive Reset
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Restore autonomic nervous equilibrium and calibrate task-specific acoustics for your next sprint.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: 4-7-8 Guided Breathwork Card (4 cols) */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/90 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl lg:col-span-4 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-cyan-500/15 pb-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-cyan-400/80">
                4-7-8 BREATHING
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Vagus Nerve Reset</span>
            </div>

            {/* Breathing Visualizer Circle */}
            <div className="relative my-8 flex items-center justify-center">
              <div
                className={`size-52 rounded-full border-2 transition-all duration-1000 flex items-center justify-center ${
                  breathPhase === 'Inhale'
                    ? 'scale-115 border-cyan-500 bg-cyan-500/10'
                    : breathPhase === 'Hold'
                    ? 'scale-115 border-sky-400 bg-sky-500/15 animate-pulse'
                    : 'scale-90 border-slate-300 dark:border-slate-700 bg-transparent'
                }`}
              >
                <div
                  className={`size-32 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 opacity-90 blur-xs flex flex-col items-center justify-center text-slate-950 font-bold transition-all duration-1000 ${
                    breathPhase === 'Inhale'
                      ? 'scale-105'
                      : breathPhase === 'Hold'
                      ? 'scale-100'
                      : 'scale-75 opacity-40'
                  }`}
                >
                  <Wind className="size-6 mb-1 text-slate-950" />
                  <span className="text-sm uppercase tracking-wider">{breathPhase}</span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-serif font-bold text-[#0A1128] dark:text-white mb-1">
              Parasympathetic Reset
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
              Inhale through your nose for 4 seconds, hold for 7 seconds, and release gently through the mouth for 8 seconds.
            </p>
          </div>

          <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-cyan-500/20 dark:bg-slate-900/60 p-3.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-around">
            <span>Cortisol Reduction</span>
            <span>•</span>
            <span>Dopamine Replenishment</span>
          </div>
        </div>

        {/* Right Column: Music Recommendation (8 cols) — Clean borderless soundscape rows */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/90 p-6 sm:p-8 shadow-sm dark:shadow-xl backdrop-blur-xl lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-cyan-500/15 pb-5 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1128] dark:text-white flex items-center gap-2">
                  <Headphones className="size-5 text-cyan-600 dark:text-cyan-400" />
                  Soundscapes by Task Difficulty
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select cognitive intensity to calibrate audio entrainment
                </p>
              </div>

              {/* Clean Difficulty Selector Pills (Text only, no emojis or redundant icons) */}
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 dark:border-cyan-500/20 dark:bg-slate-900/80 p-1">
                {[
                  { key: 'light' as const, label: 'Light' },
                  { key: 'medium' as const, label: 'Moderate' },
                  { key: 'deep' as const, label: 'Deep' },
                  { key: 'creative' as const, label: 'Creative' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedDifficulty(item.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      selectedDifficulty === item.key
                        ? 'bg-cyan-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Tracks (Clean borderless presentation — NO nested bounding boxes) */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className={`py-5 transition-all ${
                    activePlayingId === track.id ? 'bg-cyan-50/50 dark:bg-cyan-950/20 px-3 rounded-2xl' : 'px-1'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Synthesizer Preview Play Button */}
                      <button
                        type="button"
                        onClick={() => playSynthPreview(track)}
                        className={`size-12 shrink-0 rounded-full flex items-center justify-center transition-all ${
                          activePlayingId === track.id
                            ? 'bg-cyan-500 text-slate-950 scale-105 shadow-md shadow-cyan-500/30'
                            : 'bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-500 hover:text-slate-950 dark:bg-cyan-500/20 dark:border-cyan-400/40 dark:text-cyan-300 dark:hover:bg-cyan-500 dark:hover:text-slate-950'
                        }`}
                        title={activePlayingId === track.id ? 'Stop audio' : 'Play audio preview'}
                      >
                        {activePlayingId === track.id ? (
                          <Pause className="size-5" />
                        ) : (
                          <Play className="size-5 ml-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300 px-2 py-0.5 text-[11px] font-semibold">
                            {track.genre}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            • {track.bpm}
                          </span>
                        </div>

                        <h3 className="mt-1.5 text-base font-bold text-[#0A1128] dark:text-white">
                          {track.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onStartFocusWithMusic?.(track.genre)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-200 dark:hover:bg-cyan-500 dark:hover:text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Apply to Focus</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clean Scientific Mechanism Line (No sparkles or heavy boxes) */}
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 pl-16">
                    <strong className="text-slate-700 dark:text-cyan-300 font-medium">Scientific Mechanism: </strong>
                    {track.scientificBenefit}
                  </p>

                  {/* Equalizer Live Wave Bars */}
                  {activePlayingId === track.id && (
                    <div className="mt-3 flex items-center gap-1 pl-16">
                      <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mr-2 flex items-center gap-1">
                        <Volume2 className="size-3" /> AUDIO PREVIEW ACTIVE
                      </span>
                      {[35, 70, 50, 90, 55, 75, 40, 85, 65, 80].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h * 0.2}px` }}
                          className="w-1 rounded-full bg-cyan-500 animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Return Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-cyan-500/15 pt-5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-cyan-600 dark:text-cyan-400" />
              Cognitive rest session complete • Ready for next sprint
            </span>

            <button
              type="button"
              onClick={() => onStartFocusWithMusic?.(filteredTracks[0]?.genre || 'Focus Audio')}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all hover:scale-102"
            >
              <span>Enter Focus Session</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
