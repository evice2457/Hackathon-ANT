import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import {
  DEFAULT_VISION_CONFIG,
  FACE_LANDMARKER_MODEL_PATH,
  MEDIAPIPE_WASM_PATH,
  type VisionConfig,
} from '@/lib/vision/config'

let landmarkerPromise: Promise<FaceLandmarker> | null = null

async function createFaceLandmarker(config: VisionConfig): Promise<FaceLandmarker> {
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

