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
  Sparkles,
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
  const { signIn, signUp, resetPassword, isSupabaseConnected } = useAuth()

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
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [forgotCode, setForgotCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [captchaNum1, setCaptchaNum1] = useState(12)
  const [captchaNum2, setCaptchaNum2] = useState(7)
  const [captchaInput, setCaptchaInput] = useState('')
  const [codeSent, setCodeSent] = useState(false)

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

  // One-Click Demo Login for Hackathon Judges
  const handleDemoLogin = async () => {
    setErrorMsg(null)
    setIsSubmitting(true)
    const res = await signIn('alex.nguyen@gmail.com', 'password123')
    setIsSubmitting(false)
    if (res.success) onSuccess()
  }

  // Handle Sign Up Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

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

  // Handle Request Code for Forgot Password
  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (parseInt(captchaInput.trim(), 10) !== captchaNum1 + captchaNum2) {
      setErrorMsg('Human verification equation is incorrect. Please try again.')
      regenerateCaptcha()
      return
    }

    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your registered email or phone number.')
      return
    }

    setCodeSent(true)
    setForgotCode('849201') // Pre-generate realistic 6-digit demonstration OTP
    setSuccessMsg('Verification code sent to your inbox. Demo OTP: 849201')
  }

  // Handle Password Reset Confirm
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    const res = await resetPassword(forgotIdentifier, newPassword, forgotCode)
    setIsSubmitting(false)

    if (res.success) {
      setSuccessMsg('Password has been reset successfully! Redirecting to sign in...')
      setTimeout(() => {
        setMode('signin')
        setSignInIdentifier(forgotIdentifier)
        setSignInPassword(newPassword)
        setSuccessMsg(null)
      }, 1400)
    } else {
      setErrorMsg(res.error || 'Failed to reset password.')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:py-12 font-sans animate-in fade-in duration-500">
      {/* Main Split-Panel Card Container */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-cyan-500/25 dark:bg-[#070F26]/95 dark:shadow-[0_25px_60px_-15px_rgba(6,182,212,0.25)] transition-all duration-500">
        
        {/* Backend Connectivity Status Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 text-xs dark:border-cyan-500/15 dark:bg-[#0B132B]/60">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
            <span className="font-medium text-slate-600 dark:text-cyan-300/90">
              {isSupabaseConnected ? 'Supabase Backend Synchronized' : 'Account-Isolated Telemetry Engine'}
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ANT Cognitive Body Doubler
          </span>
        </div>

        {/* Split Content: Two Columns on Desktop, Switchable & Animating */}
        <div className="flex flex-col md:flex-row min-h-[580px]">

          {/* ========================================================= */}
          {/* PANEL 1: MASCOT HERO COLUMN WITH SPEECH BUBBLE            */}
          {/* In SignUp: displays on the LEFT (order-1)                 */}
          {/* In SignIn: displays on the RIGHT (order-2)                */}
          {/* In Forgot: displays on the RIGHT (order-2)                */}
          {/* ========================================================= */}
          <div
            className={`flex flex-col items-center justify-between p-8 sm:p-10 md:w-1/2 transition-all duration-500 border-b md:border-b-0 ${
              mode === 'signup'
                ? 'order-1 md:border-r border-slate-200/80 dark:border-cyan-500/20 bg-gradient-to-br from-cyan-50/50 via-white to-sky-50/30 dark:from-[#0B132B] dark:via-[#091533] dark:to-[#070F26]'
                : 'order-2 md:order-2 md:border-l border-slate-200/80 dark:border-cyan-500/20 bg-gradient-to-bl from-cyan-50/50 via-white to-sky-50/30 dark:from-[#0B132B] dark:via-[#091533] dark:to-[#070F26]'
            }`}
          >
            {/* Top Brand Tag */}
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-cyan-500/30">
                {mode === 'signup' ? 'New Explorer Orientation' : mode === 'signin' ? 'Welcome Back' : 'Security Verification'}
              </span>
            </div>

            {/* Mascot Stage: Speech Bubble on Top + Waving ANT Mascot */}
            <div className="my-auto flex flex-col items-center justify-center text-center">
              
              {/* Comic Speech Bubble with Tail */}
              <div className="relative z-20 mb-3 max-w-[20rem] px-4">
                <div className="relative rounded-[2rem] border-[3px] border-slate-900 bg-white px-6 py-3.5 shadow-xl transition-all duration-300 dark:border-cyan-400 dark:bg-[#070F26]">
                  <p className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-cyan-200 md:text-xl">
                    &ldquo;
                    {mode === 'signup'
                      ? 'Hello new friend!'
                      : mode === 'signin'
                      ? 'Welcome back!'
                      : 'I will help you reset!'}
                    &rdquo;
                  </p>

                  {/* Comic Bubble Pointer Tail pointing down directly to ANT's head */}
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

              {/* ANT Mascot Waving Hand */}
              <div className="relative select-none animate-mascot-float mt-1">
                <div className="relative h-60 w-56 sm:h-72 sm:w-64 drop-shadow-[0_16px_36px_rgba(6,182,212,0.25)]">
                  <Image
                    src="/ant-mascot-removebg.png"
                    alt="ANT Mascot Waving"
                    width={400}
                    height={480}
                    priority
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* Soft ground reflection shadow */}
                <div className="mx-auto -mt-3 h-3.5 w-32 rounded-full bg-cyan-500/20 blur-md dark:bg-cyan-400/25 animate-mascot-shadow" />
              </div>

              {/* Explanatory Quote */}
              <p className="mt-4 max-w-xs text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {mode === 'signup'
                  ? 'Ready to break down overwhelming tasks and build your focus momentum?'
                  : mode === 'signin'
                  ? 'Your personalized focus metrics, soundscapes, and body doubler are waiting.'
                  : 'Enter your verification details to restore your personalized focus history.'}
              </p>
            </div>

            {/* Bottom Switcher Card / Action Button */}
            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'signup'
                  ? 'Already have an ANT account?'
                  : mode === 'signin'
                  ? "Don't have an account yet?"
                  : 'Remembered your credentials?'}
              </span>

              {mode === 'signup' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="rounded-full border-2 border-cyan-500/70 bg-white/80 px-6 py-2 text-xs sm:text-sm font-bold text-cyan-700 hover:bg-cyan-500 hover:text-slate-950 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-400 dark:hover:text-slate-950 transition-all shadow-sm active:scale-95"
                >
                  Sign In to Website
                </button>
              ) : mode === 'signin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="rounded-full border-2 border-cyan-500/70 bg-white/80 px-6 py-2 text-xs sm:text-sm font-bold text-cyan-700 hover:bg-cyan-500 hover:text-slate-950 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-400 dark:hover:text-slate-950 transition-all shadow-sm active:scale-95"
                >
                  Create New Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="rounded-full border-2 border-slate-300 bg-white px-5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-cyan-500/40 dark:bg-cyan-950/30 dark:text-cyan-300 transition-all"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PANEL 2: INTERACTIVE FORM COLUMN                          */}
          {/* In SignUp: displays on the RIGHT (order-2)                */}
          {/* In SignIn: displays on the LEFT (order-1)                 */}
          {/* In Forgot: displays on the LEFT (order-1)                 */}
          {/* ========================================================= */}
          <div
            className={`flex flex-col justify-center p-8 sm:p-10 md:w-1/2 transition-all duration-500 ${
              mode === 'signup' ? 'order-2' : 'order-1 md:order-1'
            }`}
          >
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* FORM A: SIGN IN VIEW                                      */}
            {/* --------------------------------------------------------- */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-serif">
                    Sign In
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Enter your email or phone number to resume your focus flow.
                  </p>
                </div>

                {/* Email or Phone */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Mail className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Email Address or Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="alex.nguyen@gmail.com or 0987654321"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
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
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white pr-10"
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
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] hover:shadow-cyan-500/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="size-4" />
                </button>

                {/* Hackathon Quick Demo Account Button */}
                <div className="pt-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                    <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400">
                      Instant Access
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  </div>

                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-cyan-500" />
                    One-Click Demo Account (Alex Nguyen)
                  </button>
                </div>
              </form>
            )}

            {/* --------------------------------------------------------- */}
            {/* FORM B: CREATE ACCOUNT (SIGN UP) VIEW                     */}
            {/* Separate lines for Full Name, Email, Phone Number,       */}
            {/* Gender & DOB (same row), Password, Confirm Password      */}
            {/* --------------------------------------------------------- */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="mb-2">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-serif">
                    Create Account
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Register your private ANT profile for isolated metrics and demographic analytics.
                  </p>
                </div>

                {/* ROW 1: Full Name */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <User className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Full Name (Họ và tên)
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    placeholder="e.g. Alex Nguyen"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  />
                </div>

                {/* ROW 2: Email Address */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Mail className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    placeholder="alex.nguyen@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  />
                </div>

                {/* ROW 3: Phone Number */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Phone className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Phone Number (Số điện thoại)
                  </label>
                  <input
                    type="tel"
                    required
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    placeholder="+84 987 654 321"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                  />
                </div>

                {/* ROW 4: Gender & Date of Birth (Same Row - Grid 2 cols) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      Gender (Giới tính)
                    </label>
                    <select
                      value={signUpData.gender}
                      onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value as GenderType })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                    >
                      <option value="male">Nam (Male)</option>
                      <option value="female">Nữ (Female)</option>
                      <option value="non-binary">Phi nhị nguyên</option>
                      <option value="prefer-not-to-say">Không tiết lộ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <Calendar className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={signUpData.dateOfBirth}
                      onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                    />
                  </div>
                </div>

                {/* ROW 5: Password */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Lock className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white pr-10"
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

                {/* ROW 6: Confirm Password */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* ROW 7: Terms of Service & Privacy Policy Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="size-4 rounded border border-slate-300 bg-white transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900" />
                      <Check className="pointer-events-none absolute size-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
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
                      </button>{' '}
                      (including 100% on-device vision processing).
                    </span>
                  </label>
                </div>

                {/* Submit Create Account Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] hover:shadow-cyan-500/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                  <ArrowRight className="size-4" />
                </button>
              </form>
            )}

            {/* --------------------------------------------------------- */}
            {/* FORM C: FORGOT PASSWORD VIEW                              */}
            {/* --------------------------------------------------------- */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setErrorMsg(null)
                      setSuccessMsg(null)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Sign In
                  </button>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-serif">
                    Reset Password
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Verify human identity and enter your OTP to reset your password.
                  </p>
                </div>

                {!codeSent ? (
                  <form onSubmit={handleRequestResetCode} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <Mail className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        Registered Email or Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="alex.nguyen@gmail.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                      />
                    </div>

                    {/* Human Verification Captcha */}
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-cyan-600 dark:text-cyan-400" />
                          Human Verification
                        </span>
                        <button
                          type="button"
                          onClick={regenerateCaptcha}
                          className="flex items-center gap-1 text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                        >
                          <RefreshCw className="size-3" /> New equation
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-mono font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-300">
                          {captchaNum1} + {captchaNum2} = ?
                        </div>
                        <input
                          type="number"
                          required
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="Your answer"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-md transition-all hover:bg-cyan-400 active:scale-[0.99] cursor-pointer"
                    >
                      Send Verification Code
                      <ArrowRight className="size-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmReset} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <KeyRound className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        Verification Code (OTP)
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        placeholder="e.g. 849201"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-mono tracking-widest text-center focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <Lock className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        Set New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/30 dark:bg-slate-900/80 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-md transition-all hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? 'Resetting password...' : 'Confirm New Password'}
                      <ArrowRight className="size-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
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
