'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Lock,
  Mail,
  Phone,
  User,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { useAuth, type GenderType, type SignUpPayload } from '@/lib/auth/auth-context'
import TermsAndPrivacyModal from '@/components/TermsAndPrivacyModal'

interface AuthViewProps {
  onSuccess: () => void
}

type AuthMode = 'signin' | 'signup' | 'forgot'

export default function AuthView({ onSuccess }: AuthViewProps) {
  const { signIn, signUp, resetPassword } = useAuth()

  const [mode, setMode] = useState<AuthMode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState<SignUpPayload>({
    fullName: '',
    email: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '2000-01-01',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')

  // Forgot Password Form State
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotCode, setForgotCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [captchaNum1, setCaptchaNum1] = useState(12)
  const [captchaNum2, setCaptchaNum2] = useState(7)
  const [captchaInput, setCaptchaInput] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [previewOtp, setPreviewOtp] = useState<string | null>(null)

  // Restore remembered identifier if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('virtualdouble_remembered_email')
      if (savedUser) {
        setSignInIdentifier(savedUser)
        setRememberMe(true)
      }
    } catch {}
  }, [])

  const regenerateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 15) + 3)
    setCaptchaNum2(Math.floor(Math.random() * 15) + 2)
    setCaptchaInput('')
  }

  // Handle Sign In Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    const res = await signIn(signInIdentifier, signInPassword)
    setIsSubmitting(false)

    if (res.success) {
      try {
        if (rememberMe) {
          localStorage.setItem('virtualdouble_remembered_email', signInIdentifier)
        } else {
          localStorage.removeItem('virtualdouble_remembered_email')
        }
      } catch {}
      onSuccess()
    } else {
      setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.')
    }
  }

  // Handle Sign Up Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!agreedToTerms) {
      setErrorMsg('Please read and agree to the Terms of Service & Privacy Policy.')
      return
    }

    if (!signUpData.fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }

    if (!signUpData.email.trim() && !signUpData.phone.trim()) {
      setErrorMsg('Please provide either an email or phone number.')
      return
    }

    if (signUpData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (signUpData.password !== confirmPassword) {
      setErrorMsg('Password confirmation does not match.')
      return
    }

    setIsSubmitting(true)
    const res = await signUp(signUpData)
    setIsSubmitting(false)

    if (res.success) {
      setSuccessMsg('Account created successfully! Welcome to VirtualDouble.')
      setTimeout(() => {
        onSuccess()
      }, 500)
    } else {
      setErrorMsg(res.error || 'Failed to register account.')
    }
  }

  // Handle Real OTP Dispatch to User's Gmail
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (parseInt(captchaInput.trim(), 10) !== captchaNum1 + captchaNum2) {
      setErrorMsg('Human verification equation is incorrect. Please try again.')
      regenerateCaptcha()
      return
    }

    const cleanEmail = forgotEmail.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      const data = await res.json()
      setIsSubmitting(false)

      if (data.success) {
        setCodeSent(true)
        if (data.previewCode) {
          setPreviewOtp(data.previewCode)
        }
        setSuccessMsg(data.message || `A verification OTP has been dispatched to ${cleanEmail}.`)
      } else {
        setErrorMsg(data.error || 'Failed to dispatch verification code.')
      }
    } catch {
      setIsSubmitting(false)
      setErrorMsg('Network error while requesting verification code.')
    }
  }

  // Handle Real Password Reset Verification & Update
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    const cleanEmail = forgotEmail.trim().toLowerCase()

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: forgotCode.trim(),
          newPassword,
        }),
      })
      const data = await res.json()

      if (data.success) {
        // Also update local fallback store to keep state coherent
        await resetPassword(cleanEmail, newPassword, forgotCode)
        setIsSubmitting(false)
        setSuccessMsg('Your password has been reset successfully! Redirecting to sign in...')
        setTimeout(() => {
          setMode('signin')
          setSignInIdentifier(cleanEmail)
          setSignInPassword(newPassword)
          setSuccessMsg(null)
          setCodeSent(false)
          setForgotCode('')
          setNewPassword('')
        }, 1400)
      } else {
        setIsSubmitting(false)
        setErrorMsg(data.error || 'Invalid or expired OTP code.')
      }
    } catch {
      setIsSubmitting(false)
      setErrorMsg('Network error while verifying OTP code.')
    }
  }

  const isSignUp = mode === 'signup'
  const isForgot = mode === 'forgot'

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 font-sans animate-in fade-in duration-500">
      {/* Scaled down to ~90% (max-w-[850px]), sleek rounded-2xl border */}
      <div className="relative w-full max-w-[850px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-cyan-500/25 dark:bg-[#070F26]/95 dark:shadow-[0_20px_50px_-15px_rgba(6,182,212,0.22)]">
        
        {/* ========================================================= */}
        {/* DESKTOP VIEW: SLIDING DOUBLE-PANEL CONTAINER (HEIGHT 610px) */}
        {/* ========================================================= */}
        <div className="relative hidden md:block h-[610px] w-full overflow-hidden">
          
          {/* 1. SIGN IN FORM PANEL (Positioned on the Left half: left: 0) */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 p-8 flex flex-col justify-center transition-all duration-700 ease-in-out ${
              !isSignUp && !isForgot
                ? 'z-20 opacity-100 translate-x-0 pointer-events-auto'
                : isForgot
                ? 'z-20 opacity-100 translate-x-0 pointer-events-auto'
                : 'z-10 opacity-0 -translate-x-12 pointer-events-none'
            }`}
          >
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {!isForgot ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Centered Large Title in Plus Jakarta Sans */}
                <h2 className="text-center font-sans text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Sign In
                </h2>

                {/* Email or Phone Input */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Mail className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Email Address or Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="alex.nguyen@gmail.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Lock className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox & Forgot Password Link */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="size-4 rounded border border-slate-300 bg-white transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900" />
                      <Check className="pointer-events-none absolute size-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setErrorMsg(null)
                      setSuccessMsg(null)
                    }}
                    className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="size-4" />
                </button>
              </form>
            ) : (
              /* Forgot Password Form */
              <div className="space-y-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-1"
                >
                  <ArrowLeft className="size-3.5" /> Back to Sign In
                </button>

                <h2 className="text-center font-sans text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Reset Password
                </h2>

                {!codeSent ? (
                  <form onSubmit={handleRequestResetCode} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <Mail className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        Gmail Address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                      />
                    </div>

                    {/* Human Verification Captcha */}
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <ShieldCheck className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                          Human Verification
                        </span>
                        <button
                          type="button"
                          onClick={regenerateCaptcha}
                          className="flex items-center gap-1 text-[10px] text-cyan-600 hover:underline dark:text-cyan-400"
                        >
                          <RefreshCw className="size-2.5" /> New
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-300">
                          {captchaNum1} + {captchaNum2} = ?
                        </div>
                        <input
                          type="number"
                          required
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="Answer"
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? 'Sending to Gmail...' : 'Send OTP to Gmail'}
                      <ArrowRight className="size-3.5" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmReset} className="space-y-3">
                    {previewOtp && (
                      <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-2 text-center text-xs text-cyan-700 dark:text-cyan-300">
                        OTP Code dispatched: <strong className="font-mono font-bold">{previewOtp}</strong>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <KeyRound className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        Enter 6-Digit OTP from Gmail
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        placeholder="e.g. 849201"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono tracking-widest text-center focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <Lock className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? 'Verifying...' : 'Confirm New Password'}
                      <ArrowRight className="size-3.5" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* 2. SIGN UP FORM PANEL (Positioned on the Right half: right: 0) */}
          <div
            className={`absolute top-0 right-0 h-full w-1/2 p-7 flex flex-col justify-center transition-all duration-700 ease-in-out ${
              isSignUp
                ? 'z-20 opacity-100 translate-x-0 pointer-events-auto'
                : 'z-10 opacity-0 translate-x-12 pointer-events-none'
            }`}
          >
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="mb-2 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-2 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-2.5">
              {/* Centered Large Title in Plus Jakarta Sans */}
              <h2 className="text-center font-sans text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Create Account
              </h2>

              {/* Row 1: Full Name */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                  <User className="size-3 text-cyan-600 dark:text-cyan-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  placeholder="e.g. Alex Nguyen"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              {/* Row 2: Email Address */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                  <Mail className="size-3 text-cyan-600 dark:text-cyan-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  placeholder="alex.nguyen@example.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              {/* Row 3: Phone Number */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                  <Phone className="size-3 text-cyan-600 dark:text-cyan-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  placeholder="+84 987 654 321"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              {/* Row 4: Gender & Date of Birth (Same Row - Only Male and Female) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                    Gender
                  </label>
                  <select
                    value={signUpData.gender}
                    onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value as GenderType })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                    <Calendar className="size-3 text-cyan-600 dark:text-cyan-400" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={signUpData.dateOfBirth}
                    onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: Password */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                  <Lock className="size-3 text-cyan-600 dark:text-cyan-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              {/* Row 6: Confirm Password */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                  <ShieldCheck className="size-3 text-cyan-600 dark:text-cyan-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              {/* Row 7: Terms & Privacy Checkbox */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="size-3.5 rounded border border-slate-300 bg-white transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900" />
                    <Check className="pointer-events-none absolute size-2.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsTermsModalOpen(true)
                      }}
                      className="font-semibold text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400"
                    >
                      Terms of Service & Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* Submit Create Account Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="size-3.5" />
              </button>
            </form>
          </div>

          {/* 3. SLIDING OVERLAY CONTAINER (HERO MASCOT PANEL)               */}
          {/* Slides smoothly across the board using translate-x             */}
          {/* Sign In mode: sits on the right (translate-x-full)             */}
          {/* Sign Up mode: sits on the left (translate-x-0)                */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 overflow-hidden z-30 transition-transform duration-700 ease-in-out border-slate-200/80 dark:border-cyan-500/20 bg-gradient-to-br from-cyan-50/60 via-white to-sky-50/40 dark:from-[#0B132B] dark:via-[#091533] dark:to-[#070F26] ${
              isSignUp
                ? 'translate-x-0 border-r shadow-2xl'
                : 'translate-x-full border-l shadow-2xl'
            }`}
          >
            {/* Inner mascot content with smooth cross-fade */}
            <div className="h-full w-full p-8 flex flex-col items-center justify-between text-center select-none">
              
              {/* Comic Speech Bubble */}
              <div className="relative z-20 mt-4 max-w-[19rem] px-4">
                <div className="relative rounded-[2rem] border-[3px] border-slate-900 bg-white px-5 py-3 shadow-xl transition-all duration-300 dark:border-cyan-400 dark:bg-[#070F26]">
                  <p className="font-sans text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-cyan-200">
                    &ldquo;{isSignUp ? 'Hello new friend!' : 'Welcome back!'}&rdquo;
                  </p>

                  {/* Comic Bubble Pointer Tail */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                    <svg
                      className="h-5 w-7 text-white dark:text-[#070F26]"
                      viewBox="0 0 36 24"
                      fill="currentColor"
                    >
                      <path d="M0 0 C 12 12, 14 24, 6 24 C 20 20, 28 12, 36 0 Z" />
                    </svg>
                    <svg
                      className="absolute inset-0 h-5 w-7 text-slate-900 dark:text-cyan-400 pointer-events-none"
                      viewBox="0 0 36 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <path d="M0 0 C 12 12, 14 24, 6 24 C 20 20, 28 12, 36 0" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ANT Mascot Waving */}
              <div className="relative animate-mascot-float my-auto">
                <div className="relative h-56 w-52 lg:h-64 lg:w-60 drop-shadow-[0_14px_32px_rgba(6,182,212,0.22)]">
                  <Image
                    src="/ant-mascot-removebg.png"
                    alt="ANT Mascot Waving"
                    width={380}
                    height={460}
                    priority
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mx-auto -mt-3 h-3 w-28 rounded-full bg-cyan-500/20 blur-md dark:bg-cyan-400/25 animate-mascot-shadow" />
              </div>

              {/* Switcher Button */}
              <div className="mb-4 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}
                </span>

                {isSignUp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setErrorMsg(null)
                      setSuccessMsg(null)
                    }}
                    className="rounded-full border-2 border-cyan-500/80 bg-white/90 px-6 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-500 hover:text-slate-950 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-400 dark:hover:text-slate-950 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Sign In to Website
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setErrorMsg(null)
                      setSuccessMsg(null)
                    }}
                    className="rounded-full border-2 border-cyan-500/80 bg-white/90 px-6 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-500 hover:text-slate-950 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-400 dark:hover:text-slate-950 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Create New Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE VIEW (< md): CLEAN VERTICAL RESPONSIVE FLOW        */}
        {/* ========================================================= */}
        <div className="block md:hidden p-6">
          {/* Mascot Section */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative z-20 mb-2">
              <div className="relative rounded-2xl border-2 border-slate-900 bg-white px-4 py-2 shadow-md dark:border-cyan-400 dark:bg-[#070F26]">
                <p className="font-sans text-sm font-bold text-slate-900 dark:text-cyan-200">
                  &ldquo;{isSignUp ? 'Hello new friend!' : 'Welcome back!'}&rdquo;
                </p>
              </div>
            </div>
            <div className="relative size-32 my-1">
              <Image
                src="/ant-mascot-removebg.png"
                alt="ANT Mascot"
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
          </div>

          {/* Feedback */}
          {errorMsg && (
            <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
              {successMsg}
            </div>
          )}

          {/* Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <h2 className="text-center font-sans text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Sign In
              </h2>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address or Phone
                </label>
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="alex.nguyen@gmail.com"
                  className="w-full mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-3.5 rounded border-slate-300 text-cyan-600"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-cyan-600 dark:text-cyan-400 underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-slate-950"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold"
                >
                  Don&apos;t have an account? Create one
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <h2 className="text-center font-sans text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Create Account
              </h2>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  placeholder="Alex Nguyen"
                  className="w-full mt-0.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  placeholder="alex.nguyen@example.com"
                  className="w-full mt-0.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  placeholder="+84 987 654 321"
                  className="w-full mt-0.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                  <select
                    value={signUpData.gender}
                    onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value as GenderType })}
                    className="w-full mt-0.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={signUpData.dateOfBirth}
                    onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                    className="w-full mt-0.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full mt-0.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full mt-0.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 size-3.5"
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-cyan-600 dark:text-cyan-400 underline font-semibold"
                    >
                      Terms of Service & Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-slate-950"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="inline-flex items-center gap-1 text-xs text-slate-500"
              >
                <ArrowLeft className="size-3" /> Back
              </button>
              <h2 className="text-center font-sans text-xl font-bold text-slate-900 dark:text-slate-100">
                Reset Password
              </h2>
              {!codeSent ? (
                <form onSubmit={handleRequestResetCode} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:bg-slate-900/80 dark:text-white"
                  />
                  <div className="rounded-lg border p-2 text-xs flex items-center justify-between">
                    <span>{captchaNum1} + {captchaNum2} = ?</span>
                    <input
                      type="number"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Answer"
                      className="w-20 px-2 py-1 border rounded text-xs dark:bg-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-cyan-500 py-2 text-xs font-bold text-slate-950"
                  >
                    Send OTP to Gmail
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-3">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full rounded-lg border px-3 py-2 text-sm font-mono text-center dark:bg-slate-900/80 dark:text-white"
                  />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-900/80 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-cyan-500 py-2 text-xs font-bold text-slate-950"
                  >
                    Confirm New Password
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terms and Privacy Modal */}
      <TermsAndPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  )
}
