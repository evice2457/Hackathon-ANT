'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  User,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  Award,
  ChevronRight,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Database,
} from 'lucide-react'
import { useAuth, type GenderType } from '@/lib/auth/auth-context'

export default function DashboardView() {
  const { user, telemetry, updateProfile, isSupabaseConnected } = useAuth()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editFullName, setEditFullName] = useState(user?.fullName || 'Alex Nguyen')
  const [editEmail, setEditEmail] = useState(user?.email || 'alex.nguyen@gmail.com')
  const [editPhone, setEditPhone] = useState(user?.phone || '+84 987 654 321')
  const [editGender, setEditGender] = useState<GenderType>(user?.gender || 'male')
  const [editDob, setEditDob] = useState(user?.dateOfBirth || '2000-05-15')
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [activeRange, setActiveRange] = useState<'today' | 'week' | 'month'>('today')

  // Keep edit state in sync with authenticated user
  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName)
      setEditEmail(user.email)
      setEditPhone(user.phone)
      setEditGender(user.gender)
      setEditDob(user.dateOfBirth)
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaveStatus('Saving...')
    const res = await updateProfile({
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      gender: editGender,
      dateOfBirth: editDob,
    })
    if (res.success) {
      setIsEditingProfile(false)
      setSaveStatus('Saved successfully')
      setTimeout(() => setSaveStatus(null), 3000)
    } else {
      setSaveStatus(res.error || 'Failed to save profile')
    }
  }

  // Derive dynamic metrics from isolated telemetry
  const totalHours = Math.floor(telemetry.totalFocusSeconds / 3600)
  const totalMins = Math.floor((telemetry.totalFocusSeconds % 3600) / 60)
  const formattedTotalTime = `${totalHours}h ${totalMins}m`
  const completedSessionsCount = telemetry.completedSessionsCount
  const distractionRescuesCount = telemetry.distractionRescuesCount
  const streakDays = telemetry.streakDays

  // Calculate dynamic focus score
  const focusIndex = useMemo(() => {
    if (!telemetry.tasks || telemetry.tasks.length === 0) return 94
    const sum = telemetry.tasks.reduce((acc, t) => acc + (t.focusScore || 92), 0)
    return Math.round(sum / telemetry.tasks.length)
  }, [telemetry.tasks])

  const currentAge = user?.age || 26
  const ageCohort =
    currentAge < 22
      ? 'Undergraduate / Student (18-21)'
      : currentAge <= 30
      ? 'Early Career & Builders (22-30)'
      : currentAge <= 45
      ? 'Senior Professionals (31-45)'
      : 'Executive & Lifelong Masters (46+)'

  const cohortBenchmark =
    currentAge <= 30
      ? { topPercent: 8, avgHours: '3.2h', recoverySpeed: '8.4s' }
      : { topPercent: 12, avgHours: '3.8h', recoverySpeed: '9.1s' }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-in fade-in duration-500 font-sans">
      {/* Editorial Dashboard Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200/80 dark:border-cyan-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-0.5 text-[11px] font-semibold dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300">
              <Database className="size-3" />
              {isSupabaseConnected ? 'Supabase Synchronized' : 'Account Isolated Telemetry'}
            </span>
            {user && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                User ID: <code className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">{user.id.slice(0, 14)}...</code>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-serif font-normal tracking-tight text-[#0A1128] dark:text-slate-100 sm:text-4xl">
            Focus Intelligence Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Real-time biometric rhythm, session telemetry, and demographic focus benchmarks for{' '}
            <strong className="text-slate-800 dark:text-slate-200">{user?.fullName || 'Alex Nguyen'}</strong>.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 dark:border-cyan-500/20 dark:bg-slate-900/60 shadow-xs">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeRange === range
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: High-level Stats + Focus Gauge */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-8">
        {/* Focus Score Gauge Card (4 cols) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/90 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl md:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans uppercase tracking-widest font-semibold text-slate-500 dark:text-cyan-400/80">
              FOCUS SCORE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-0.5 text-xs font-semibold dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300">
              <Zap className="size-3" /> Deep Flow
            </span>
          </div>

          {/* Circular Progress Gauge Visualizer */}
          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative flex size-44 items-center justify-center">
              <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-cyan-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * focusIndex) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-sans text-5xl font-extrabold tracking-tight tabular-nums text-[#0A1128] dark:text-cyan-200">
                  {focusIndex}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  / 100 PTS
                </span>
              </div>
            </div>
            <p className="mt-3 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
              Flow consistency exceeds <span className="text-cyan-600 dark:text-cyan-300 font-bold">92%</span> of peer baseline
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-cyan-500/15 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Streak: <strong className="text-slate-800 dark:text-slate-200">{streakDays} Days</strong></span>
            <span>Daily Goal: <strong className="text-slate-800 dark:text-slate-200">{formattedTotalTime} / 4h</strong></span>
          </div>
        </div>

        {/* 4 Metric Cards (8 cols) */}
        <div className="grid grid-cols-2 gap-4 md:col-span-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/70 p-5 backdrop-blur-md flex flex-col justify-between shadow-xs">
            <div className="size-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Focused</p>
              <p className="mt-1 text-2xl font-sans font-bold tracking-tight text-[#0A1128] dark:text-white">
                {formattedTotalTime}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              <TrendingUp className="size-3" /> +24% vs baseline
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/70 p-5 backdrop-blur-md flex flex-col justify-between shadow-xs">
            <div className="size-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Sessions</p>
              <p className="mt-1 text-2xl font-sans font-bold tracking-tight text-[#0A1128] dark:text-white">
                {completedSessionsCount} Sprints
              </p>
            </div>
            <p className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              100% micro-commitment
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/70 p-5 backdrop-blur-md flex flex-col justify-between shadow-xs">
            <div className="size-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Distraction Rescues</p>
              <p className="mt-1 text-2xl font-sans font-bold tracking-tight text-[#0A1128] dark:text-white">
                {distractionRescuesCount}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              Restored within 10s
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/70 p-5 backdrop-blur-md flex flex-col justify-between shadow-xs">
            <div className="size-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Sprint Block</p>
              <p className="mt-1 text-2xl font-sans font-bold tracking-tight text-[#0A1128] dark:text-white">
                {completedSessionsCount > 0 ? `${Math.round((telemetry.totalFocusSeconds / 60) / Math.max(1, completedSessionsCount))} mins` : '25 mins'}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              Optimal biological rhythm
            </p>
          </div>

          {/* Real-time Focus Timeline Card spanning full width of 8 cols */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-4 rounded-2xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/80 p-5 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  REAL-TIME FOCUS TIMELINE
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-cyan-600 dark:text-cyan-400">
                <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" /> Live Telemetry
              </span>
            </div>

            {/* SVG Dynamic Timeline Graph */}
            <div className="relative h-32 w-full">
              <svg className="size-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 120">
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />

                <path
                  d="M 0,100 Q 60,85 120,40 T 240,25 T 360,55 T 480,20 T 570,30 L 570,120 L 0,120 Z"
                  fill="url(#focusGradient)"
                />
                <path
                  d="M 0,100 Q 60,85 120,40 T 240,25 T 360,55 T 480,20 T 570,30"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle cx="570" cy="30" r="5" fill="#38BDF8" className="animate-ping" />
                <circle cx="570" cy="30" r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>

            <div className="mt-2 flex justify-between text-xs font-sans font-medium text-slate-500 dark:text-slate-400">
              <span>08:00 (Warm up)</span>
              <span>10:00 (Peak 98%)</span>
              <span>12:00 (Rest block)</span>
              <span>14:30 (Deep Flow 94%)</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Current ({focusIndex}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: User Profile & Age Benchmarking (Left) + Completed Task History (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* User Demographic Profile Card (5 cols) */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/90 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-cyan-500/15 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-cyan-50 border border-cyan-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="size-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A1128] dark:text-white">Profile & Account Telemetry</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cognitive benchmarks & verified demographic</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isEditingProfile) {
                    handleSaveProfile()
                  } else {
                    setIsEditingProfile(true)
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  isEditingProfile
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-900/40'
                }`}
              >
                {isEditingProfile ? (
                  <>
                    <Save className="size-3.5" /> Save Profile
                  </>
                ) : (
                  'Edit Profile'
                )}
              </button>
            </div>

            {saveStatus && (
              <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Profile Fields Editor */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                  <User className="size-3 text-cyan-600 dark:text-cyan-400" /> Full Name
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900/80 dark:text-white"
                  />
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                    {user?.fullName || 'Alex Nguyen'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mail className="size-3 text-cyan-600 dark:text-cyan-400" /> Email Address
                </label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900/80 dark:text-white"
                  />
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200 font-sans">
                    {user?.email || 'alex.nguyen@gmail.com'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Phone className="size-3 text-cyan-600 dark:text-cyan-400" /> Phone Number
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900/80 dark:text-white"
                    />
                  ) : (
                    <p className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200 font-sans">
                      {user?.phone || '+84 987 654 321'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Calendar className="size-3 text-cyan-600 dark:text-cyan-400" /> Date of Birth / Age
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900/80 dark:text-white"
                    />
                  ) : (
                    <p className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm font-semibold text-cyan-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-cyan-300 font-sans">
                      {currentAge} years old ({user?.dateOfBirth || '2000-05-15'})
                    </p>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    Gender Identity
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as GenderType)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 dark:border-cyan-500/40 dark:bg-slate-900/80 dark:text-white"
                  >
                    <option value="male">Nam (Male)</option>
                    <option value="female">Nữ (Female)</option>
                    <option value="non-binary">Phi nhị nguyên giới (Non-binary)</option>
                    <option value="prefer-not-to-say">Không muốn tiết lộ (Prefer not to say)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Age-Cohort Insight */}
          <div className="mt-6 border-l-2 border-cyan-500 pl-4 py-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-cyan-300 uppercase tracking-wider mb-1 font-sans">
              Age Cohort Benchmark ({ageCohort})
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Your focus persistence places you in the <strong className="text-cyan-700 dark:text-cyan-300">Top {cohortBenchmark.topPercent}%</strong> for age {currentAge}. Average peer focus time is {cohortBenchmark.avgHours}/day.
            </p>
            <div className="mt-2 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-cyan-400/90">
              <span>Distraction recovery latency: {cohortBenchmark.recoverySpeed}</span>
              <span>ANT compatibility: 99.4%</span>
            </div>
          </div>
        </div>

        {/* Completed Task History (7 cols) */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 dark:border-cyan-500/20 dark:bg-[#0B132B]/90 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-cyan-500/15 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-cyan-50 border border-cyan-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A1128] dark:text-white font-sans">Completed Tasks History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Recently conquered micro-commitments on this account</p>
                </div>
              </div>

              <span className="text-xs font-sans font-medium text-slate-500 dark:text-cyan-400">
                {telemetry.tasks.length} tasks recorded
              </span>
            </div>

            {/* Task List */}
            {telemetry.tasks.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm">No focus sprints completed yet on this account.</p>
                <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Launch a focus session to record real-time telemetry!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {telemetry.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between py-3.5 transition-all hover:bg-slate-50/60 dark:hover:bg-slate-900/40 px-2 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 size-5 rounded-full bg-cyan-50 border border-cyan-300 dark:bg-cyan-500/20 dark:border-cyan-400/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                        <CheckCircle2 className="size-3" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors">
                          {task.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-cyan-300">
                            {task.tag}
                          </span>
                          <span>•</span>
                          <span>{task.durationMinutes} mins</span>
                          <span>•</span>
                          <span>{task.completedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <span className="rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300 px-2.5 py-1 text-xs font-bold">
                        {task.focusScore} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-cyan-500/15 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Sessions automatically synchronize per-account upon completion</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              <span>Weekly telemetry report</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
