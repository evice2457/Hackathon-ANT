'use client'

/**
 * ANT Companion Voice & Chime Synthesizer
 * Uses Web Speech API for voice lines and Web Audio API for soothing chimes.
 * 100% on-device, no external network dependencies.
 */

// Synthesize pleasant acoustic bell chimes using Web Audio API
export function playAntChime(type: 'ready' | 'celebrate' | 'nudge' | 'complete') {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime

    if (type === 'ready') {
      // Gentle ascending 2-tone chime: E5 (659Hz) -> A5 (880Hz)
      const notes = [659.25, 880.0]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.14)

        gain.gain.setValueAtTime(0, now + i * 0.14)
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.14 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.6)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.14)
        osc.stop(now + i * 0.14 + 0.65)
      })
    } else if (type === 'nudge') {
      // Subtle gentle attention signal: D5 (587Hz) -> A5 (880Hz) with soft sine bell
      const notes = [587.33, 880.0]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.16)

        gain.gain.setValueAtTime(0, now + i * 0.16)
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.16 + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.8)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.16)
        osc.stop(now + i * 0.16 + 0.85)
      })
    } else if (type === 'complete') {
      // Rewarding warm session completion chime: G4 -> C5 -> E5 -> G5
      const notes = [392.0, 523.25, 659.25, 783.99]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + i * 0.15)

        gain.gain.setValueAtTime(0, now + i * 0.15)
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1.2)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.15)
        osc.stop(now + i * 0.15 + 1.25)
      })
    } else {
      // Celebratory cheerful arpeggio: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle' // warmer, sparkling timbre
        osc.frequency.setValueAtTime(freq, now + i * 0.11)

        gain.gain.setValueAtTime(0, now + i * 0.11)
        gain.gain.linearRampToValueAtTime(0.22, now + i * 0.11 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.8)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.11)
        osc.stop(now + i * 0.11 + 0.85)
      })
    }
  } catch (err) {
    console.warn('Web Audio chime could not play:', err)
  }
}

/**
 * Speaks ANT's dialogue using the browser's speech synthesis engine.
 * Tuned for a friendly, cheerful, supportive companion persona.
 */
export function speakAntDialogue(
  text: string,
  options?: {
    pitch?: number
    rate?: number
    onEnd?: () => void
  },
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  try {
    // Cancel previous utterance
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.pitch = options?.pitch ?? 1.3 // slightly higher pitch for cute robot mascot
    utterance.rate = options?.rate ?? 1.05 // energetic pace
    utterance.lang = 'en-US'

    // Pick a natural, friendly English voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny'))) ||
      voices.find((v) => v.lang.startsWith('en'))

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    if (options?.onEnd) {
      utterance.onend = () => options.onEnd?.()
    }

    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.warn('SpeechSynthesis error:', err)
  }
}

let sharedAudioContext: AudioContext | null = null
let silentOscillator: OscillatorNode | null = null

// Valid 44-byte silent PCM WAV file in base64
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
let silentAudioElement: HTMLAudioElement | null = null

/**
 * Prime audio playback synchronously inside ANY user gesture (click, tap, keypress).
 * This unlocks both Web Audio API and HTML5 Audio playback in Chromium
 * before any asynchronous delays or timers run.
 */
export function primeAudioOnGesture() {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
        sharedAudioContext = new AudioContextClass()
      }
      if (sharedAudioContext.state === 'suspended') {
        void sharedAudioContext.resume()
      }
    }

    if (!silentAudioElement) {
      silentAudioElement = new Audio(SILENT_WAV_DATA_URI)
      silentAudioElement.loop = true
      silentAudioElement.volume = 0.001 // Practically inaudible, but > 0 so Chrome marks media as active
    }
    silentAudioElement.play().catch(() => {})
  } catch {}
}

/**
 * Starts inaudible audio keep-alive via both HTML5 Audio loop and Web Audio API.
 * This signals to Chrome that the document is actively playing media,
 * which qualifies the page for Automatic Picture-in-Picture on minimize
 * via the Media Session API without requiring manual theme toggles.
 */
export function startAudioKeepAlive() {
  if (typeof window === 'undefined') return
  try {
    primeAudioOnGesture()

    if (sharedAudioContext && !silentOscillator) {
      const osc = sharedAudioContext.createOscillator()
      const gain = sharedAudioContext.createGain()
      gain.gain.value = 0.00001 // Inaudible to human ear
      osc.frequency.value = 40
      osc.connect(gain)
      gain.connect(sharedAudioContext.destination)
      osc.start()
      silentOscillator = osc
    }

    if (silentAudioElement && silentAudioElement.paused) {
      silentAudioElement.play().catch(() => {})
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }
  } catch (e) {
    console.warn('Could not start audio keep-alive:', e)
  }
}

export function stopAudioKeepAlive() {
  try {
    if (silentOscillator) {
      silentOscillator.stop()
      silentOscillator.disconnect()
      silentOscillator = null
    }
    if (silentAudioElement) {
      silentAudioElement.pause()
      silentAudioElement.currentTime = 0
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none'
    }
  } catch {}
}

