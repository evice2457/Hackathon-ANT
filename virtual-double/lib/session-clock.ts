export interface ElapsedClockReconciliation {
  elapsedSeconds: number
  reconciledAt: number
}

/** Converts elapsed wall time into whole countdown seconds without losing the remainder. */
export function reconcileElapsedSeconds(
  previousTimestamp: number,
  currentTimestamp: number,
): ElapsedClockReconciliation {
  const elapsedMilliseconds = Math.max(0, currentTimestamp - previousTimestamp)
  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000)

  return {
    elapsedSeconds,
    reconciledAt: previousTimestamp + elapsedSeconds * 1000,
  }
}
