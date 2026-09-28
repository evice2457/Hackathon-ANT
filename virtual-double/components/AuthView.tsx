'use client'

import React, { useState } from 'react'
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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
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
      }, 600)
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
    setSuccessMsg('Verification code sent to your inbox. Demo code: 849201')
  }

  // Handle Password Reset Confirm
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    const res = await resetPassword(forgotIdentifier, newPassword, forgotCode)
    setIsSubmitting(false)

    if (res.success) {
      setSuccessMsg('Password has been reset successfully! Redirecting to login...')
      setTimeout(() => {
        setMode('signin')
        setSignInIdentifier(forgotIdentifier)
        setSignInPassword(newPassword)
        setSuccessMsg(null)
      }, 1500)
    } else {
      setErrorMsg(res.error || 'Failed to reset password.')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 font-sans animate-in fade-in duration-300">
      <div className="w-full max-w-md">
        {/* Brand Mascot Intro */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3 size-16 overflow-hidden rounded-full border border-sky-300/40 bg-white p-1 shadow-md shadow-cyan-950/20 ring-4 ring-cyan-500/20 dark:border-cyan-500/30 dark:bg-[#0B132B]">
            <Image
              src="/ant-mascot.png"
              alt="ANT Mascot"
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {mode === 'signin' && 'Sign in to VirtualDouble'}
            {mode === 'signup' && 'Create your ANT account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {mode === 'signin' && 'Access your isolated biometric dashboard, history, and soundscapes.'}
            {mode === 'signup' && 'Set up your personalized cognitive profile and baseline metrics.'}
            {mode === 'forgot' && 'Verify your identity and regain access to your account.'}
          </p>

          {/* Supabase Status Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-0.5 text-[11px] font-medium text-slate-600 dark:border-cyan-500/20 dark:bg-[#0B132B]/60 dark:text-cyan-300 shadow-2xs">
            <span className={`size-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-500'}`} />
            {isSupabaseConnected ? 'Supabase Backend Connected' : 'Local Sandbox Database Active'}
          </div>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-cyan-500/20 dark:bg-[#0B132B]/85 sm:p-8">
          {/* Mode Switch Tabs (Sign In / Sign Up) */}
          {mode !== 'forgot' && (
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-slate-200 bg-slate-100/70 p-1 dark:border-cyan-500/20 dark:bg-[#070F26]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMsg(null)
                }}
                className={`rounded-full py-2 text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-slate-950 shadow-xs dark:bg-cyan-500 dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMsg(null)
                }}
                className={`rounded-full py-2 text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-950 shadow-xs dark:bg-cyan-500 dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="size-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="name@gmail.com or 0987654321"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setErrorMsg(null)
                    }}
                    className="text-xs font-medium text-cyan-600 hover:underline dark:text-cyan-400"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="size-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-full bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In & Enter Flow'}</span>
                <ArrowRight className="size-4" />
              </button>

              {/* Quick Demo Login Option for Judges */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-50/50 hover:bg-cyan-100 px-4 py-1.5 text-xs font-semibold text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300 transition-colors"
                >
                  <Sparkles className="size-3.5 text-cyan-500" />
                  <span>Quick Demo Login (Alex Nguyen)</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name (Họ và tên)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="size-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    placeholder="e.g. Alex Nguyen"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="size-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      placeholder="alex@gmail.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone className="size-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      placeholder="+84 987 654 321"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gender (Giới tính)
                  </label>
                  <select
                    value={signUpData.gender}
                    onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value as GenderType })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                  >
                    <option value="male">Male (Nam)</option>
                    <option value="female">Female (Nữ)</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Calendar className="size-3.5" />
                    </div>
                    <input
                      type="date"
                      required
                      value={signUpData.dateOfBirth}
                      onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-2 py-2 text-xs sm:text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    placeholder="Min 6 chars"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 size-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsTermsModalOpen(true)
                      }}
                      className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                    >
                      Terms of Service & Privacy Policy
                    </button>
                    {' '}(including 100% on-device vision processing).
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 rounded-full bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Registering...' : 'Create Account & Enter Flow'}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD WORKFLOW */}
          {mode === 'forgot' && (
            <div>
              {!codeSent ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Enter your Registered Email or Phone
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail className="size-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="alex.nguyen@gmail.com"
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Human Verification Captcha Tool */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-cyan-500/20 dark:bg-[#070F26]/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        Human Captcha Verification
                      </span>
                      <button
                        type="button"
                        onClick={regenerateCaptcha}
                        title="New Equation"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <RefreshCw className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl bg-white border border-slate-200 px-3 py-2 text-center font-mono font-bold tracking-wider text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-cyan-300">
                        {captchaNum1} + {captchaNum2} = ?
                      </div>
                      <input
                        type="number"
                        required
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Result"
                        className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all"
                  >
                    Send Verification Code
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      6-Digit Verification Code (Sent to your inbox)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <KeyRound className="size-4" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        placeholder="849201"
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 font-mono text-center tracking-widest text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock className="size-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Resetting Password...' : 'Update Password & Return to Login'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    >
                      ← Cancel and return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terms & Privacy Modal */}
      <TermsAndPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  )
}
