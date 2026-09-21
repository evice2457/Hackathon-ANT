'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const DEFAULT_MASCOT_NAME = 'VirtualDouble'
const MASCOT_NAME_STORAGE_KEY = 'ant_mascot_name'

interface MascotNameContextValue {
  mascotName: string
  setMascotName: (name: string) => void
}

const MascotNameContext = createContext<MascotNameContextValue | null>(null)

export function MascotNameProvider({ children }: { children: ReactNode }) {
  const [mascotName, setMascotNameState] = useState(DEFAULT_MASCOT_NAME)

  useEffect(() => {
    let savedName = DEFAULT_MASCOT_NAME
    try {
      const saved = window.localStorage.getItem(MASCOT_NAME_STORAGE_KEY)
      if (saved?.trim()) savedName = saved.trim()
    } catch {
      // Local storage may be unavailable; keep the default name.
    }

    const frame = window.requestAnimationFrame(() => setMascotNameState(savedName))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const setMascotName = useCallback((name: string) => {
    const finalName = name.trim() || DEFAULT_MASCOT_NAME
    setMascotNameState(finalName)
    try {
      window.localStorage.setItem(MASCOT_NAME_STORAGE_KEY, finalName)
      window.dispatchEvent(new CustomEvent('mascot-name-change', { detail: finalName }))
    } catch {
      // The in-memory name remains usable when local storage is unavailable.
    }
  }, [])

  const value = useMemo(() => ({ mascotName, setMascotName }), [mascotName, setMascotName])
  return <MascotNameContext.Provider value={value}>{children}</MascotNameContext.Provider>
}

export function useMascotName(): MascotNameContextValue {
  const context = useContext(MascotNameContext)
  if (!context) throw new Error('useMascotName must be used within a <MascotNameProvider>')
  return context
}
