import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import {
  DEFAULT_VISION_CONFIG,
  FACE_LANDMARKER_MODEL_PATH,
  MEDIAPIPE_WASM_PATH,
  type VisionConfig,
} from '@/lib/vision/config'

let landmarkerPromise: Promise<FaceLandmarker> | null = null

function suppressBenignWasmStderr() {
  if (typeof window === 'undefined') return
  const originalError = console.error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((originalError as any).__wasmFiltered) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredError = (...args: any[]) => {
    const firstArg = args[0]
    if (
      typeof firstArg === 'string' &&
      (firstArg.includes('INFO: Created TensorFlow Lite') ||
        firstArg.includes('face_landmarker_graph.cc') ||
        firstArg.includes('gl_context.cc') ||
        firstArg.includes('vision_wasm_internal') ||
        firstArg.includes('Sets FaceBlendshapesGraph') ||
        firstArg.includes('OpenGL error checking'))
    ) {
      console.info(...args)
      return
    }
    originalError.apply(console, args)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(filteredError as any).__wasmFiltered = true
  console.error = filteredError
}

async function createFaceLandmarker(config: VisionConfig): Promise<FaceLandmarker> {
  suppressBenignWasmStderr()
  const { FaceLandmarker: FaceLandmarkerApi, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH)
  const sharedOptions = {
    runningMode: 'VIDEO' as const,
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    minFaceDetectionConfidence: config.minFaceDetectionConfidence,
    minFacePresenceConfidence: config.minFacePresenceConfidence,
    minTrackingConfidence: config.minTrackingConfidence,
  }

  try {
    return await FaceLandmarkerApi.createFromOptions(fileset, {
      ...sharedOptions,
      baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL_PATH, delegate: 'GPU' },
    })
  } catch {
    // WebGL/GPU initialization varies across browsers and remote desktops.
    // CPU/WASM is slower but broadly available and sufficient at 10 FPS.
    return FaceLandmarkerApi.createFromOptions(fileset, {
      ...sharedOptions,
      baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL_PATH, delegate: 'CPU' },
    })
  }
}

/** One lazily loaded model for the page lifetime; React rerenders never reload it. */
export function getFaceLandmarker(config: VisionConfig = DEFAULT_VISION_CONFIG): Promise<FaceLandmarker> {
  landmarkerPromise ??= createFaceLandmarker(config).catch((error) => {
    landmarkerPromise = null
    throw error
  })
  return landmarkerPromise
}

