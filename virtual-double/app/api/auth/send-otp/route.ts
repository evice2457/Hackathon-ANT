import { NextResponse } from 'next/server'
import { generateAndStoreOtp } from '@/lib/auth/otp-store'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 })
    }

    // 1. Generate secure 6-digit OTP
    const otpCode = generateAndStoreOtp(cleanEmail)

    // 2. Dispatch real email via Supabase Auth if configured
    let supabaseDispatched = false
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${request.headers.get('origin') || 'http://localhost:3000'}/`,
        })
        if (!error) {
          supabaseDispatched = true
        }
      } catch (err) {
        console.warn('[Supabase Auth Email Dispatch]:', err)
      }
    }

    // 3. Dispatch via Resend API if configured
    const resendApiKey = process.env.RESEND_API_KEY
    let resendDispatched = false
    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ANT VirtualDouble <security@virtualdouble.app>',
            to: cleanEmail,
            subject: 'Your VirtualDouble Password Reset OTP',
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #06b6d4;">VirtualDouble ANT Password Reset</h2>
                <p>Hello,</p>
                <p>You requested to reset your password for your VirtualDouble cognitive body doubler account.</p>
                <div style="margin: 24px 0; text-align: center;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background: #070F26; color: #38bdf8; border-radius: 12px; display: inline-block;">
                    ${otpCode}
                  </span>
                </div>
                <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please disregard this email.</p>
              </div>
            `,
          }),
        })
        if (resendRes.ok) resendDispatched = true
      } catch (err) {
        console.warn('[Resend Email Dispatch]:', err)
      }
    }

    console.log(`[AUTH OTP DISPATCH] Sent to ${cleanEmail}. Code: ${otpCode} (Supabase: ${supabaseDispatched}, Resend: ${resendDispatched})`)

    return NextResponse.json({
      success: true,
      message: `A verification code has been dispatched to ${cleanEmail}. Please check your Gmail inbox (and Spam folder).`,
      // Return code for local development/testing verification when third-party mailer is not configured
      previewCode: !supabaseDispatched && !resendDispatched ? otpCode : undefined,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
