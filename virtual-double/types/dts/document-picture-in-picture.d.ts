/**
 * Minimal ambient typings for the Document Picture-in-Picture API
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API).
 *
 * lib.dom.ts (as shipped with the TypeScript bundled in this project) does not
 * yet declare `documentPictureInPicture`, so we declare it here. Keep this
 * small and local — do not fall back to `any` in components.
 */

interface DocumentPictureInPictureWindowEventMap {
  pagehide: PageTransitionEvent
  resize: UIEvent
}

interface DocumentPictureInPictureWindow extends Window {
  addEventListener<K extends keyof DocumentPictureInPictureWindowEventMap>(
    type: K,
    listener: (this: DocumentPictureInPictureWindow, ev: DocumentPictureInPictureWindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener<K extends keyof DocumentPictureInPictureWindowEventMap>(
    type: K,
    listener: (this: DocumentPictureInPictureWindow, ev: DocumentPictureInPictureWindowEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void
}

interface DocumentPictureInPicture {
  requestWindow(options?: {
    width?: number
    height?: number
    disallowReturnToOpener?: boolean
    preferInitialWindowPlacement?: boolean
  }): Promise<DocumentPictureInPictureWindow>
  readonly window: DocumentPictureInPictureWindow | null
}

interface Document {
  pictureInPictureElement?: Element | null
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPicture
}
