# VirtualDouble browser vision subsystem

## Decision

VirtualDouble uses a fully browser-side pipeline:

```text
getUserMedia camera frame
  -> MediaPipe Tasks Face Landmarker (local WebAssembly / GPU)
  -> landmarks + face transform + blendshape coefficients
  -> VisionObservation (observable geometry only)
  -> per-run median neutral-pose calibration
  -> relative pose + exponential smoothing
  -> angular enter/exit hysteresis + dwell-time state machine
  -> FocusSessionContext.setFocusState(...)
  -> 30-second continuous non-focus episode tracker
  -> pause countdown + shared ANT check-in (main page and Document PiP)
```

The positive-start ritual uses the same Face Landmarker and signal extractor:

```text
SmileRitualView
  -> useSmileRitual() / useVisionMonitor()
  -> 0.5 s acquisition baseline
  -> absolute smile coefficient held for 0.9 s
  -> one-shot smileGesture
  -> 1.4 s ANT celebration
  -> startSession()
```

This is the simplest deployment for Vercel, has no Python service to operate,
avoids round-trip latency, and keeps camera frames out of VirtualDouble's
servers. The model and WebAssembly runtime are served as static, versioned app
assets. Frames are passed directly from the in-memory `<video>` element to the
model and are neither recorded nor persisted. Landmarks are also not persisted.

The precise privacy statement is: **camera images and video are processed and
discarded on the user's device; VirtualDouble does not upload them.** MediaPipe
Tasks 1.0.1 separately documents that its SDK may send non-image performance
and utilization metrics to Google. Do not claim that the SDK makes zero network
requests. See the [MediaPipe privacy notice](https://github.com/google-ai-edge/mediapipe#privacy-notice).

## Technology comparison (researched September 2026)

| Option | License and maintenance | Browser / acceleration | Assets and capabilities | Integration assessment |
| --- | --- | --- | --- | --- |
| [MediaPipe Tasks Face Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js) | Apache-2.0 implementation; active Google AI Edge project with current 2026 docs and releases | Local WebAssembly with GPU delegate and CPU fallback; works in normal client components | 3.59 MiB model bundle, about 11 MiB for the selected WASM binary; 478 3D landmarks, 52 blendshapes, and canonical-face transform | **Selected.** Best capability/reliability ratio and smallest amount of custom vision code |
| [TensorFlow.js face-landmarks-detection](https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection) | Apache-2.0; active repository, but this package wraps the older MediaPipe FaceMesh family | TFJS WebGL/WASM or MediaPipe runtime | 478 points and face box; separate TFJS backend/model downloads | Good fallback. No first-class face transformation matrix or blendshapes, so more geometric code and tuning are required |
| [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/) plus a landmark model | MIT runtime; actively maintained | WASM on all major browsers; WebGPU primarily Chromium; WebGL is maintenance mode | Runtime, WASM, detector, landmark model, preprocessing, and postprocessing must all be selected and shipped | Excellent general runtime but not a ready-made face pipeline. Model provenance/licensing and more glue reduce hackathon reliability |
| OpenCV.js plus a detector/landmarks | Apache-2.0; mature | Local WASM/CPU | `solvePnP` is useful for pose, but OpenCV does not supply the required modern face landmarks by itself | Rejected: a large second runtime only to recover pose already available from MediaPipe |
| Browser capture plus Python/FastAPI | Depends on model | Server CPU/GPU | Requires frame upload, backend hosting, scaling, and authentication | Rejected: materially worse privacy, latency, Vercel fit, reliability, and build time |

MediaPipe's official model bundle combines BlazeFace detection, FaceMesh-V2,
and a blendshape model. The model uses 192×192 detector and 256×256 mesh inputs.
The web API runs `detectForVideo` synchronously, so this implementation throttles
to 10 FPS. That is enough for multi-second behavioral transitions without
spending resources on 60 FPS. The debug panel reports measured inference time
and effective FPS; use those values on the demo laptop before changing the rate.

### Ready-made, derived, and intentionally omitted

- Ready-made model outputs: face presence, 478 landmarks, facial transform,
  eye-blink coefficients, and mouth-smile coefficients.
- Derived algorithms: Euler pose approximation, coefficient-to-eye-openness,
  median neutral-pose/smile calibration, exponential smoothing, angular
  enter/exit thresholds, dwell times, and state hysteresis.
- No trained custom model: none is necessary for the primary demo.
- No yawn detector: jaw opening is ambiguous with speech and ordinary mouth
  movement. Reliable repeated-yawn classification needs validation or a trained
  temporal model, so it is explicitly out of hackathon scope.
- No identity, face embedding, emotion, diagnosis, engagement, or productivity
  score is computed.

## Files and API

- `lib/vision/types.ts`: public observations, pose, diagnostics, and status.
- `lib/vision/config.ts`: all tunable model and temporal thresholds.
- `lib/vision/face-landmarker.ts`: lazy singleton model with GPU -> CPU fallback.
- `lib/vision/head-pose.ts`: canonical transform to approximate Euler angles.
- `lib/vision/signals.ts`: blendshape extraction and exponential smoothing.
- `lib/vision/temporal-filter.ts`: deterministic behavior state machine.
- `lib/vision/use-vision-monitor.ts`: camera lifecycle, scheduling, teardown.
- `lib/vision/smile-ritual.ts`: ritual-specific acquisition and smile heuristics.
- `lib/vision/use-smile-ritual.ts`: MediaPipe adapter for `SmileRitualView`.
- `components/VisionMonitor.tsx`: context bridge and development diagnostics.
- `lib/check-in-episode.ts`: deterministic 30-second episode tracker.
- `components/AntCheckIn.tsx`: shared main-page and PiP intervention UI.

Another teammate can consume frame-level data by adding an `onObservation`
callback to `useVisionMonitor`; application focus state should continue to flow
only through `setFocusState`. `VisionObservation.smileGesture` and `smileScore`
drive the current `SmileRitualView` readiness step. The gesture fires once after a
calibrated score rise is held, then rearms only after relaxation. They mean
only “smile-like mouth geometry was observed,” never “happy.”

The one-face policy is deliberate: `numFaces: 1` enables MediaPipe smoothing and
matches the product. If two faces appear, the model follows one prominent face;
VirtualDouble does not count, identify, or switch behavior based on identity.

## Tunable defaults

All values are in `lib/vision/config.ts` and are initial demo heuristics, not
scientific or medical thresholds.

| Setting | Default | Meaning |
| --- | ---: | --- |
| inference rate | 10 FPS | Maximum inference scheduling rate |
| detection / presence / tracking confidence | 0.55 | MediaPipe acceptance thresholds |
| pose EMA alpha | 0.35 | Damp frame-to-frame pose/blendshape jitter |
| neutral calibration | 1.8 s and at least 10 samples | Median pitch/yaw/roll and resting smile baseline |
| meaningful absence | 0.75 s | Reset pose/smile/eye EMA while preserving a completed neutral baseline |
| head-down enter / exit | +22° / +14° relative pitch | Angular hysteresis for coarse downward orientation |
| looking-away enter / exit | ±32° / ±22° relative yaw | Angular hysteresis for a coarse strong head turn |
| smile gesture | 0.55 absolute, +0.20 over baseline, held 0.30 s | One-shot readiness gesture; rearms after relaxing to baseline +0.08 |
| away dwell | 3.0 s | Continuous missing face before `away` |
| posture dwell | 2.0 s | Continuous head-down/turned pose before `possibly_distracted` |
| recovery dwell | 1.5 s | Stable face/pose before returning to `focused` |

For the running-session MVP, yaw remains observable in diagnostics but is
excluded from focus-state classification. Only sustained relative head-down
posture and sustained face absence can drive an intervention. After CV emits
`possibly_distracted` or `away`, the application requires another 30 seconds of
continuous non-focused state before pausing and opening the ANT check-in.
Returning to `focused` before then cancels the pending episode.

## Setup and operation

```bash
npm install
npm run dev
```

Use `http://localhost:3000` or HTTPS; browsers do not permit camera access on an
ordinary insecure remote origin. The smile path enables camera monitoring for
the session; choosing **Start without camera** persists an opt-out for that
session and the running monitor does not request the camera again. A later new
session can opt in normally. Pausing, completing, or ending it stops every camera track. The
model stays cached in memory for fast resume and is not recreated on React
renders. Pause and resume both reset the shared focus state to `focused`; a new
monitor run emits its first derived state even when that state is also
`focused`, preventing stale synchronization.

With no PiP window, a hidden main document intentionally suspends inference.
When Document PiP is open, its visible window owns the animation-frame
scheduler, so inference can continue while the opener is hidden. Opening and
closing PiP swaps only the scheduler: it does not recreate the camera stream or
the Face Landmarker. Closing PiP returns scheduling to the opener window.

Posture classification is disabled while the 1.8-second neutral calibration is
in progress, but absence detection remains active. A brief detector miss keeps
the EMA history. After 0.75 seconds of absence, pose/smile/eye EMA and gesture
latches reset so reacquisition is not biased; a completed session baseline is
preserved. Deliberate pause/resume starts a fresh monitor and calibration.

The check-in timer treats `possibly_distracted` and `away` as one continuous
non-focused condition, so switching between them does not reset the timer. It
fires exactly once after 30 seconds, records a fixed prompt for that episode,
opens check-in state, and pauses the session. Pause resets focus state and stops
CV, but the separately owned check-in remains open. Its free-text answer exists
only in React memory and is never persisted or logged. Resume closes the
check-in and starts a fresh monitoring/calibration run; staying paused closes
the interaction without resuming.

If PiP is open, it renders the same check-in state in place of the mini widget.
There is no second timer, provider, camera stream, or answer store. The ritual
also disables its CV monitor as soon as smile success or the manual fallback
fires, before the running-session monitor can start.

Assets are committed for repeatable/offline inference after the app itself has
loaded:

- `public/mediapipe/models/face_landmarker.task`
- `public/mediapipe/wasm/*`

The development diagnostics panel is compiled out of production. Set
`NEXT_PUBLIC_VISION_DEBUG=0` to hide it during local development. Camera errors
remain visible in production because users need actionable permission/device
feedback.

Run verification with:

```bash
npm run test:vision
npm run lint
npm run build
```

## Head-pose convention and physical validation

MediaPipe's `MatrixData` protobuf defaults to column-major storage, its C++
matrix conversion copies column-major packed values, and the Tasks Vision Web
wrapper exposes that packed list without transposing it. `head-pose.ts` therefore
indexes `data[row + column * 4]` and extracts intrinsic XYZ angles for
`R = Rz(roll) * Ry(yaw) * Rx(pitch)`. The hidden inference video is not
CSS-mirrored, so the implementation applies no mirroring sign corrections.
Independent synthetic matrices cover identity, pitch, signed yaw, roll, and a
combined rotation. Relevant upstream definitions are the MediaPipe
[MatrixData proto](https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/framework/formats/matrix_data.proto),
[matrix conversion](https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/framework/formats/matrix.cc),
and [Face Landmarker Web wrapper](https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/tasks/web/vision/face_landmarker/face_landmarker.ts).

This mathematical audit does not replace a physical camera check. On the demo
machine, record diagnostics at neutral, clearly down/up, left/right, and
sideways tilt. Down must increase pitch delta, up must move it oppositely,
left/right must increase `|yaw delta|`, and sideways tilt must primarily change
roll. If reality disagrees, correct the axis/sign mapping; do not mask the issue
with arbitrary absolute values. No webcam was accessible from the automated
environment used for this change, so these physical values remain unverified.

## Manual test matrix

| Scenario | Expected result |
| --- | --- |
| 1. Neutral calibration completes | Debug calibration changes from `calibrating` to `ready` after ~1.8 s and at least 10 visible-face samples |
| 2. Neutral face | Relative pitch/yaw remain near baseline; stable `focused` |
| 3. Lower head clearly | Pitch delta rises; sustained pose reaches `possibly_distracted` after dwell |
| 4. Raise head | Pitch delta moves opposite to down and does not trigger head-down |
| 5. Turn left | `|yaw delta|` increases and crosses the enter threshold only for a strong turn |
| 6. Turn right | `|yaw delta|` increases with the opposite sign |
| 7. Tilt sideways | Roll responds primarily; pitch/yaw remain secondary |
| 8. Brief glance (<2 s) | State remains `focused` |
| 9. Sustained strong turn | Yaw changes in diagnostics only; running-session focus state stays unchanged |
| 10. Leave chair | Brief misses are ignored; `away` after 3 continuous seconds |
| 11. Return | Fresh EMA values; stable neutral face recovers after 1.5 s |
| 12. Pause while distracted | Camera tracks stop and shared state resets to `focused` |
| 13. Resume | Exactly one stream starts, calibration restarts, and first CV result synchronizes state |
| 14. Open Document PiP | PiP appears without creating another stream or model |
| 15. Switch to VS Code | Opener becomes hidden while PiP remains visible |
| 16. Verify CV continues in PiP | Head posture and absence transitions still update at roughly 10 FPS |
| 17. Close PiP | PiP scheduler is cancelled without stopping/restarting the stream |
| 18. Verify scheduler returns | Main-window scheduling resumes; still one inference loop and stream |
| 19. Hide opener without PiP during non-focus | Public state resets to `focused`; stale pre-hide evidence cannot complete the 30-second episode; returning visible requires fresh CV evidence |
| 20. Hide opener with visible PiP during non-focus | CV and the same 30-second episode continue normally without resetting |
| 21. Recover before 30 s | Pending check-in cancels and countdown continues |
| 22. Stay head-down/away for 30 s | Countdown pauses once; exactly one ANT check-in renders: full-page without PiP, compact inside active PiP |
| 23. Answer and resume | Hard-coded support appears, then resume closes check-in and starts fresh CV calibration |
| 24. Later non-focus episode | A new check-in can trigger after another continuous 30 s |
| 25. Permission denied | Actionable camera message; session remains manually usable |
| 26. Camera busy/unavailable | Actionable message; no retry loop or leaked stream |
| 27. Dim lighting | Note acquisition reliability; no rapid state changes |
| 28. Glasses | Presence/pose remain usable; secondary eye geometry may degrade with glare |
| 29. Smile ritual | MediaPipe acquires briefly, a smile held ~0.9 s fires once, camera stops during celebration, then session starts; fallback also works |

Also verify that hiding the main tab with **no PiP** may intentionally suspend
inference, while hiding it with an active visible **Document PiP must continue**.
Record effective FPS, inference latency, UI responsiveness, and the physical
neutral/down/up/left/right/roll values on the actual demo laptop before the
presentation. Leave margin between neutral measurements and demo heuristics.

## Browser and performance limitations

- Camera permission and secure context are mandatory.
- MediaPipe video inference is synchronous on the main thread. At 10 FPS it is
  intentionally simple; move inference to a Worker only if the benchmark shows
  visible UI stalls on target hardware.
- GPU delegate support varies. Initialization automatically falls back to CPU.
- Safari/Firefox camera support is usable through WASM but should be tested;
  Chromium is the recommended hackathon demo browser.
- Pose is head orientation, not eye gaze. A person can move only their eyes and
  remain geometrically “forward.” This is preferable to overstating precision.
- Pose axis/sign behavior is mathematically tested but still requires the
  physical camera sanity test above on the target browser and hardware.
- Eye and smile coefficients are sensitive to occlusion, facial hair, glasses,
  camera angle, and lighting. They are optional triggers, never conclusions.
