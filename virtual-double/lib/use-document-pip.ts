'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Manages the Document Picture-in-Picture window lifecycle.
 *
 * The PiP window is only ever ANOTHER presentation surface for the existing
 * session — no timer or state lives here. This hook handles purely the browser
 * window mechanics: opening, closing, copying styles, and cleanup.
 *
 * Browser constraints discovered in testing (Chrome 153, macOS):
 *  - requestWindow() requires a *transient user activation* — it must be called
 *    synchronously from a real gesture. Calling it from a React effect or from
 *    Base UI's onClick loses the activation and the request is rejected.
 *  - moveTo() and resizeTo() on the PiP window are blocked without a fresh
 *    gesture, so the window cannot be positioned or hidden after opening.
 */

interface UseDocumentPipOptions {
  /** Called when the PiP window closes (manual native close, or exitPip). */
  onPipClose?: () => void
}

export interface DocumentPipResult {
  /** True when documentPictureInPicture is supported in this browser. */
  isSupported: boolean
  /** True while a PiP window is currently open. */
  isPipOpen: boolean
  /** The PiP window's document, for use as a React portal target. */
  pipDocument: Document | null
  /** Opens the PiP window. Only valid from a direct native user gesture. */
  openPip: () => Promise<boolean>
  /** Closes the PiP window (no-op if not open). */
  closePip: () => void
}

const PIP_WIDTH = 320
const PIP_HEIGHT = 240

function syncPipTheme(pipDoc: Document) {
  if (typeof document === 'undefined') return
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) {
    pipDoc.documentElement.classList.add('dark')
    pipDoc.body.style.backgroundColor = '#160B0F'
    pipDoc.body.style.color = '#FAF4EB'
  } else {
    pipDoc.documentElement.classList.remove('dark')
    pipDoc.body.style.backgroundColor = '#FAF7F2'
    pipDoc.body.style.color = '#201416'
  }
}

function copyStylesIntoPip(pipDocument: Document) {
  // Next.js/Tailwind emit several <style> nodes and <link> stylesheets. Inline
  // the readable ones by value; same-origin <link> nodes are cloned by reference.
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules
      if (rules && rules.length > 0) {
        const styleEl = pipDocument.createElement('style')
        for (const rule of rules) {
          styleEl.appendChild(pipDocument.createTextNode(rule.cssText))
        }
        pipDocument.head.appendChild(styleEl)
      }
    } catch {
      // Cross-origin sheet — fall through to copying the <link> by reference.
    }
  }

  for (const link of Array.from(document.querySelectorAll('link[rel="stylesheet"]'))) {
    pipDocument.head.appendChild(link.cloneNode())
  }

  pipDocument.body.style.margin = '0'
  pipDocument.body.style.overflow = 'hidden'
  pipDocument.body.style.fontFamily =
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  syncPipTheme(pipDocument)
}

export function useDocumentPictureInPicture({
  onPipClose,
}: UseDocumentPipOptions = {}): DocumentPipResult {
  const [isSupported] = useState<boolean>(() =>
    typeof window !== 'undefined' && 'documentPictureInPicture' in window,
  )
  const [isPipOpen, setIsPipOpen] = useState(false)
  const [pipDocument, setPipDocument] = useState<Document | null>(null)

  const pipWindowRef = useRef<DocumentPictureInPictureWindow | null>(null)
  const isOpeningRef = useRef(false)

  // Keep the latest onPipClose in a ref so the callbacks below stay referentially
  // stable. Without this, a new onPipClose each render would change
  // handleWindowClose, retrigger the unmount effect's dependency, and close the
  // freshly-opened PiP window on the next render.
  const onPipCloseRef = useRef(onPipClose)

  useEffect(() => {
    onPipCloseRef.current = onPipClose
  }, [onPipClose])

  const handleWindowClose = useCallback(() => {
    isOpeningRef.current = false
    pipWindowRef.current = null
    setPipDocument(null)
    setIsPipOpen(false)
    onPipCloseRef.current?.()
  }, [])

  // Keep PiP document theme in sync with main document root classes
  useEffect(() => {
    if (!pipDocument) return

    syncPipTheme(pipDocument)

    const observer = new MutationObserver(() => {
      syncPipTheme(pipDocument)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [pipDocument])

  const closePip = useCallback(() => {
    const win = pipWindowRef.current
    if (typeof window !== 'undefined') {
      try {
        window.focus?.()
      } catch {}
    }
    if (!win) return
    // Remove our pagehide listener first so closing programmatically doesn't
    // double-fire onPipClose (which would toggle the UI back).
    win.removeEventListener('pagehide', handleWindowClose)
    try {
      win.close()
    } catch {}
    handleWindowClose()
  }, [handleWindowClose])

  const openPip = useCallback((): Promise<boolean> => {
    if (!isSupported) return Promise.resolve(false)
    const api = window.documentPictureInPicture
    if (!api) return Promise.resolve(false)

    // Only one PiP window at a time — if one is already open or currently opening, guard it.
    if (pipWindowRef.current || isOpeningRef.current) {
      if (pipWindowRef.current) {
        pipWindowRef.current.focus()
      }
      return Promise.resolve(true)
    }

    isOpeningRef.current = true

    // requestWindow MUST be invoked synchronously within the user gesture, so
    // we call it here (no await/log before it) and attach handling to the
    // returned promise. Awaiting first would consume the transient activation.
    const requestPromise = api.requestWindow({
      width: PIP_WIDTH,
      height: PIP_HEIGHT,
      preferInitialWindowPlacement: true,
    })

    return requestPromise.then(
      (pipWindow) => {
        isOpeningRef.current = false
        pipWindowRef.current = pipWindow
        try {
          copyStylesIntoPip(pipWindow.document)
        } catch (styleError) {
          console.warn('Could not copy all styles into PiP:', styleError)
        }

        // The browser closes the PiP window when the user hits its native close
        // button, or when the opener tab is closed/hidden from PiP.
        pipWindow.addEventListener('pagehide', handleWindowClose)

        setPipDocument(pipWindow.document)
        setIsPipOpen(true)
        return true
      },
      (err) => {
        isOpeningRef.current = false
        // Gesture withheld or request rejected — fail gracefully.
        console.warn('PiP window request rejected:', err)
        return false
      },
    )
  }, [isSupported, handleWindowClose])

  // If the user closes the opener tab, the PiP window disappears; nothing else
  // to do here since the whole app tears down anyway.
  useEffect(() => {
    return () => {
      const win = pipWindowRef.current
      if (win) {
        win.removeEventListener('pagehide', handleWindowClose)
        win.close()
      }
    }
  }, [handleWindowClose])

  return { isSupported, isPipOpen, pipDocument, openPip, closePip }
}
