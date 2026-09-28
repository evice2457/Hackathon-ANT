import crypto from 'crypto'

export interface OtpRecord {
  email: string
  code: string
  expiresAt: number // timestamp
  attempts: number
}

// In-memory active OTP store (global to persist across requests in Next.js development server)
declare global {
  // eslint-disable-next-line no-var
  var __virtualdouble_otp_store__: Map<string, OtpRecord> | undefined
}

const otpStore: Map<string, OtpRecord> = globalThis.__virtualdouble_otp_store__ ?? new Map()
if (!globalThis.__virtualdouble_otp_store__) {
  globalThis.__virtualdouble_otp_store__ = otpStore
}

export function generateAndStoreOtp(email: string): string {
  const cleanEmail = email.trim().toLowerCase()
  // Generate cryptographically secure 6-digit OTP code
  const code = crypto.randomInt(100000, 999999).toString()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  otpStore.set(cleanEmail, {
    email: cleanEmail,
    code,
    expiresAt,
    attempts: 0,
  })

  return code
}

export function verifyOtp(email: string, inputCode: string): { valid: boolean; reason?: string } {
  const cleanEmail = email.trim().toLowerCase()
  const record = otpStore.get(cleanEmail)

  if (!record) {
    return { valid: false, reason: 'No active OTP verification code found for this email address.' }
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail)
    return { valid: false, reason: 'Verification code has expired. Please request a new one.' }
  }

  record.attempts += 1
  if (record.attempts > 5) {
    otpStore.delete(cleanEmail)
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new verification code.' }
  }

  if (record.code !== inputCode.trim()) {
    return { valid: false, reason: 'Invalid verification code. Please check your Gmail inbox.' }
  }

  // Once successfully verified, delete from store to prevent replay
  otpStore.delete(cleanEmail)
  return { valid: true }
}
