import { NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/auth/otp-store'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, otp, newPassword } = body

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, verification code, and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    // 1. Verify OTP with cryptographic store
    let isValid = false
    const storeCheck = verifyOtp(cleanEmail, cleanOtp)
    if (storeCheck.valid) {
      isValid = true
    } else if (isSupabaseConfigured && supabase) {
      // 2. Also try Supabase OTP verification if configured
      try {
        const { error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: 'recovery',
        })
        if (!error) {
          isValid = true
          // Update password in Supabase
          await supabase.auth.updateUser({ password: newPassword })
        }
      } catch (err) {
        console.warn('[Supabase Verify OTP]:', err)
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: storeCheck.reason || 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify OTP'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
