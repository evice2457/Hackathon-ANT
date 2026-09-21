'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'

/**
 * Lets the Start button (and any other surface) open / close the floating
 * companion without owning any window mechanics itself.
 *
 * Why this exists: `documentPictureInPicture.requestWindow()` only succeeds
 * inside a *transient user activation*, so it must be invoked synchronously
 * from a NATIVE click handler. React's onClick — and Base UI's Button
 * primitive in particular — dispatches late enough that Chrome rejects the
 * request. Consumers bind a native listener and call `open()` from there.
 *
 * Deliberately tiny and self-contained so the floating feature stays modular
 * across the branches several people are working on.
 */
export interface FloatingCompanionApi {
  /** True when Document Picture-in-Picture is available in this browser. */
  isSupported: boolean
  /** True while the floating window is currently open. */
  isOpen: boolean
  /** Opens the floating window. MUST be called from a native user gesture. */
  open: () => void
  /** Closes the floating window. */
  close: () => void
}

const FloatingCompanionContext = createContext<FloatingCompanionApi | null>(null)

export function FloatingCompanionProvider({
  value,
  children,
}: {
  value: FloatingCompanionApi
  children: ReactNode
}) {
  return <FloatingCompanionContext.Provider value={value}>{children}</FloatingCompanionContext.Provider>
}

export function useFloatingCompanion(): FloatingCompanionApi | null {
  return useContext(FloatingCompanionContext)
}

/**
 * Binds a native `click` listener to the returned ref. Use this on any control
 * that must open the floating companion: requestWindow() has to run inside the
 * browser's original transient activation, and React's synthetic events (plus
 * the Base UI Button primitive) dispatch too late to preserve it.
 *
 * The latest handler is always used, so callers don't need to re-bind on every
 * render.
 */
export function useNativeClick<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T>(null)
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const listener = () => handlerRef.current()
    el.addEventListener('click', listener)
    return () => el.removeEventListener('click', listener)
  }, [])

  return ref
}
