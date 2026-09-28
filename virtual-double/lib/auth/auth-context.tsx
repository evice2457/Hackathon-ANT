'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export type GenderType = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  gender: GenderType
  dateOfBirth: string // YYYY-MM-DD
  age: number
  avatarUrl?: string
}

export interface UserCompletedTask {
  id: string
  title: string
  durationMinutes: number
  completedAt: string
  tag: string
  focusScore: number
}

export interface UserTelemetryData {
  totalFocusSeconds: number
  completedSessionsCount: number
  distractionRescuesCount: number
  streakDays: number
  tasks: UserCompletedTask[]
}

export interface SignUpPayload {
  fullName: string
  email: string
  phone: string
  gender: GenderType
  dateOfBirth: string
  password: string
}

interface AuthContextType {
  user: UserProfile | null
  telemetry: UserTelemetryData
  isAuthenticated: boolean
  isLoading: boolean
  isSupabaseConnected: boolean
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (data: SignUpPayload) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (identifier: string, newPassword: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'age'>>) => Promise<{ success: boolean; error?: string }>
  recordCompletedSession: (task: string, durationMinutes: number, focusScore?: number) => void
  recordRescue: () => void
}

const calculateAge = (dobString: string): number => {
  if (!dobString) return 26
  try {
    const dob = new Date(dobString)
    const diffMs = Date.now() - dob.getTime()
    const ageDate = new Date(diffMs)
    const calculated = Math.abs(ageDate.getUTCFullYear() - 1970)
    return isNaN(calculated) || calculated < 5 ? 26 : calculated
  } catch {
    return 26
  }
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_alex_nguyen_demo',
  fullName: 'Alex Nguyen',
  email: 'alex.nguyen@gmail.com',
  phone: '+84 987 654 321',
  gender: 'male',
  dateOfBirth: '2000-05-15',
  age: 26,
}

const DEFAULT_DEMO_TELEMETRY: UserTelemetryData = {
  totalFocusSeconds: 4 * 3600 + 25 * 60, // 4h 25m
  completedSessionsCount: 7,
  distractionRescuesCount: 4,
  streakDays: 5,
  tasks: [
    {
      id: 'task-1',
      title: 'Architect modern editorial layout without bounding constraints',
      durationMinutes: 35,
      completedAt: '10:30 AM Today',
      tag: 'Frontend UI',
      focusScore: 98,
    },
    {
      id: 'task-2',
      title: 'Optimize fluid canvas wave dither and cubic hover physics',
      durationMinutes: 25,
      completedAt: '09:45 AM Today',
      tag: 'Creative Dev',
      focusScore: 94,
    },
    {
      id: 'task-3',
      title: 'Validate Document PiP window auto pop-out on blur',
      durationMinutes: 20,
      completedAt: '08:50 AM Today',
      tag: 'QA Testing',
      focusScore: 92,
    },
    {
      id: 'task-4',
      title: 'Review camera smile detection ritual and micro-commitments',
      durationMinutes: 30,
      completedAt: 'Yesterday 04:15 PM',
      tag: 'AI Vision',
      focusScore: 95,
    },
  ],
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS_STORAGE_KEY = 'virtualdouble_users_db'
const CURRENT_USER_KEY = 'virtualdouble_current_session_id'
const TELEMETRY_KEY_PREFIX = 'virtualdouble_telemetry_'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [telemetry, setTelemetry] = useState<UserTelemetryData>(DEFAULT_DEMO_TELEMETRY)
  const [isLoading, setIsLoading] = useState(true)

  // Load telemetry for a specific user ID from storage
  const loadUserTelemetry = useCallback((userId: string): UserTelemetryData => {
    try {
      const saved = localStorage.getItem(`${TELEMETRY_KEY_PREFIX}${userId}`)
      if (saved) return JSON.parse(saved)
    } catch {}

    if (userId === DEFAULT_DEMO_USER.id) {
      return DEFAULT_DEMO_TELEMETRY
    }

    return {
      totalFocusSeconds: 0,
      completedSessionsCount: 0,
      distractionRescuesCount: 0,
      streakDays: 1,
      tasks: [],
    }
  }, [])

  // Persist telemetry for current user
  const persistUserTelemetry = useCallback((userId: string, data: UserTelemetryData) => {
    try {
      localStorage.setItem(`${TELEMETRY_KEY_PREFIX}${userId}`, JSON.stringify(data))
    } catch {}
  }, [])

  // Initialize Auth state (check Supabase or local storage session)
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user && mounted) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            const loadedUser: UserProfile = {
              id: session.user.id,
              fullName: profile?.full_name || session.user.user_metadata?.full_name || 'Member',
              email: session.user.email || '',
              phone: profile?.phone || session.user.user_metadata?.phone || '',
              gender: (profile?.gender as GenderType) || 'prefer-not-to-say',
              dateOfBirth: profile?.date_of_birth || '2000-01-01',
              age: calculateAge(profile?.date_of_birth || '2000-01-01'),
              avatarUrl: profile?.avatar_url,
            }
            setUser(loadedUser)
            setTelemetry(loadUserTelemetry(loadedUser.id))
            setIsLoading(false)
            return
          }
        }

        // Local Fallback: check stored active session
        const currentUserId = localStorage.getItem(CURRENT_USER_KEY)
        if (currentUserId) {
          const usersDbRaw = localStorage.getItem(USERS_STORAGE_KEY)
          const usersDb: Record<string, { profile: UserProfile; passwordHash?: string }> = usersDbRaw
            ? JSON.parse(usersDbRaw)
            : {}

          const record = usersDb[currentUserId]
          if (record?.profile && mounted) {
            setUser(record.profile)
            setTelemetry(loadUserTelemetry(record.profile.id))
            setIsLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('[VirtualDouble Auth] Error initializing auth session:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void initAuth()

    return () => {
      mounted = false
    }
  }, [loadUserTelemetry])

  // Sign In with email/phone and password
  const signIn = useCallback(
    async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const cleanId = identifier.trim().toLowerCase()
      if (!cleanId || !password) {
        return { success: false, error: 'Please enter both your identifier (email or phone) and password.' }
      }

      // 1. Supabase live attempt if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanId,
            password,
          })
          if (error) {
            return { success: false, error: error.message }
          }
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            const loadedUser: UserProfile = {
              id: data.user.id,
              fullName: profile?.full_name || data.user.user_metadata?.full_name || 'Member',
              email: data.user.email || '',
              phone: profile?.phone || data.user.user_metadata?.phone || '',
              gender: (profile?.gender as GenderType) || 'prefer-not-to-say',
              dateOfBirth: profile?.date_of_birth || '2000-01-01',
              age: calculateAge(profile?.date_of_birth || '2000-01-01'),
              avatarUrl: profile?.avatar_url,
            }
            setUser(loadedUser)
            setTelemetry(loadUserTelemetry(loadedUser.id))
            return { success: true }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Authentication failed'
          return { success: false, error: message }
        }
      }

      // 2. Local Fallback Database
      try {
        // Special case: demo credentials
        if (cleanId === 'alex.nguyen@gmail.com' && (password === 'password123' || password === 'demo')) {
          setUser(DEFAULT_DEMO_USER)
          localStorage.setItem(CURRENT_USER_KEY, DEFAULT_DEMO_USER.id)
          setTelemetry(loadUserTelemetry(DEFAULT_DEMO_USER.id))
          return { success: true }
        }

        const usersDbRaw = localStorage.getItem(USERS_STORAGE_KEY)
        const usersDb: Record<string, { profile: UserProfile; passwordHash?: string }> = usersDbRaw
          ? JSON.parse(usersDbRaw)
          : {}

        const matchedKey = Object.keys(usersDb).find((key) => {
          const p = usersDb[key].profile
          return (
            p.email.toLowerCase() === cleanId ||
            p.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
          )
        })

        if (!matchedKey) {
          return { success: false, error: 'Account not found. Please check your credentials or register.' }
        }

        const record = usersDb[matchedKey]
        if (record.passwordHash && record.passwordHash !== password) {
          return { success: false, error: 'Incorrect password. Try again or reset password.' }
        }

        setUser(record.profile)
        localStorage.setItem(CURRENT_USER_KEY, record.profile.id)
        setTelemetry(loadUserTelemetry(record.profile.id))
        return { success: true }
      } catch {
        return { success: false, error: 'An unexpected error occurred during sign in.' }
      }
    },
    [loadUserTelemetry]
  )

  // Sign Up new account
  const signUp = useCallback(
    async (data: SignUpPayload): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = data.email.trim().toLowerCase()
      const cleanPhone = data.phone.trim()
      const cleanName = data.fullName.trim()

      if (!cleanName || !cleanEmail || !data.password) {
        return { success: false, error: 'Please fill in all required fields.' }
      }

      if (data.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' }
      }

      // 1. Supabase live attempt if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: data.password,
            options: {
              data: {
                full_name: cleanName,
                phone: cleanPhone,
                gender: data.gender,
                date_of_birth: data.dateOfBirth,
              },
            },
          })
          if (error) return { success: false, error: error.message }

          if (authData.user) {
            const newUser: UserProfile = {
              id: authData.user.id,
              fullName: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
              gender: data.gender,
              dateOfBirth: data.dateOfBirth,
              age: calculateAge(data.dateOfBirth),
            }
            setUser(newUser)
            const freshTelemetry: UserTelemetryData = {
              totalFocusSeconds: 0,
              completedSessionsCount: 0,
              distractionRescuesCount: 0,
              streakDays: 1,
              tasks: [],
            }
            setTelemetry(freshTelemetry)
            persistUserTelemetry(newUser.id, freshTelemetry)
            return { success: true }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Registration failed'
          return { success: false, error: message }
        }
      }

      // 2. Local Fallback Database
      try {
        const usersDbRaw = localStorage.getItem(USERS_STORAGE_KEY)
        const usersDb: Record<string, { profile: UserProfile; passwordHash: string }> = usersDbRaw
          ? JSON.parse(usersDbRaw)
          : {}

        const exists = Object.values(usersDb).some(
          (u) => u.profile.email.toLowerCase() === cleanEmail || (cleanPhone && u.profile.phone === cleanPhone)
        )
        if (exists) {
          return { success: false, error: 'An account with this email or phone number already exists.' }
        }

        const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        const newProfile: UserProfile = {
          id: newId,
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          age: calculateAge(data.dateOfBirth),
        }

        usersDb[newId] = {
          profile: newProfile,
          passwordHash: data.password,
        }

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersDb))
        localStorage.setItem(CURRENT_USER_KEY, newId)

        const freshTelemetry: UserTelemetryData = {
          totalFocusSeconds: 0,
          completedSessionsCount: 0,
          distractionRescuesCount: 0,
          streakDays: 1,
          tasks: [],
        }

        setUser(newProfile)
        setTelemetry(freshTelemetry)
        persistUserTelemetry(newId, freshTelemetry)

        return { success: true }
      } catch {
        return { success: false, error: 'Failed to create account. Please try again.' }
      }
    },
    [persistUserTelemetry]
  )

  // Sign Out
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch {}
    }
    localStorage.removeItem(CURRENT_USER_KEY)
    setUser(null)
  }, [])

  // Reset Password via Email Code or Captcha verification
  const resetPassword = useCallback(
    async (identifier: string, newPassword: string, verificationCode: string): Promise<{ success: boolean; error?: string }> => {
      const cleanId = identifier.trim().toLowerCase()
      if (!cleanId || !newPassword) {
        return { success: false, error: 'Identifier and new password are required.' }
      }
      if (newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters.' }
      }

      // Check verification code (support demo code or any 6 digits)
      if (!verificationCode || verificationCode.trim().length < 4) {
        return { success: false, error: 'Please enter a valid verification code.' }
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.auth.updateUser({ password: newPassword })
          if (error) return { success: false, error: error.message }
          return { success: true }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Reset failed'
          return { success: false, error: msg }
        }
      }

      // Local storage update
      try {
        const usersDbRaw = localStorage.getItem(USERS_STORAGE_KEY)
        const usersDb: Record<string, { profile: UserProfile; passwordHash: string }> = usersDbRaw
          ? JSON.parse(usersDbRaw)
          : {}

        const matchedKey = Object.keys(usersDb).find((key) => {
          const p = usersDb[key].profile
          return p.email.toLowerCase() === cleanId || p.phone === cleanId
        })

        if (!matchedKey && cleanId !== DEFAULT_DEMO_USER.email.toLowerCase()) {
          return { success: false, error: 'No account matches this email or phone number.' }
        }

        if (matchedKey) {
          usersDb[matchedKey].passwordHash = newPassword
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersDb))
        }

        return { success: true }
      } catch {
        return { success: false, error: 'Failed to reset password.' }
      }
    },
    []
  )

  // Update profile
  const updateProfile = useCallback(
    async (updates: Partial<Omit<UserProfile, 'id' | 'age'>>): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not logged in' }

      const updatedAge = updates.dateOfBirth ? calculateAge(updates.dateOfBirth) : user.age
      const newProfile: UserProfile = {
        ...user,
        ...updates,
        age: updatedAge,
      }

      setUser(newProfile)

      // Supabase update if configured
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: newProfile.fullName,
            email: newProfile.email,
            phone: newProfile.phone,
            gender: newProfile.gender,
            date_of_birth: newProfile.dateOfBirth,
            updated_at: new Date().toISOString(),
          })
        } catch {}
      }

      // Local storage update
      try {
        const usersDbRaw = localStorage.getItem(USERS_STORAGE_KEY)
        if (usersDbRaw) {
          const usersDb = JSON.parse(usersDbRaw)
          if (usersDb[user.id]) {
            usersDb[user.id].profile = newProfile
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersDb))
          }
        }
      } catch {}

      return { success: true }
    },
    [user]
  )

  // Record a completed focus session and update isolated telemetry
  const recordCompletedSession = useCallback(
    (task: string, durationMinutes: number, focusScore = 94) => {
      if (!user) return

      setTelemetry((prev) => {
        const updatedSeconds = prev.totalFocusSeconds + durationMinutes * 60
        const updatedCount = prev.completedSessionsCount + 1
        const now = new Date()
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} Today`

        const newTask: UserCompletedTask = {
          id: `task-${Date.now()}`,
          title: task || 'Focus Sprint',
          durationMinutes,
          completedAt: timeStr,
          tag: 'Sprint',
          focusScore,
        }

        const nextTelemetry: UserTelemetryData = {
          ...prev,
          totalFocusSeconds: updatedSeconds,
          completedSessionsCount: updatedCount,
          tasks: [newTask, ...prev.tasks.slice(0, 19)], // Keep up to 20 recent tasks
        }

        persistUserTelemetry(user.id, nextTelemetry)

        // Sync to Supabase in background if configured
        if (isSupabaseConfigured && supabase) {
          void supabase.from('focus_sessions').insert({
            user_id: user.id,
            task,
            duration_minutes: durationMinutes,
            focus_score: focusScore,
          })
        }

        return nextTelemetry
      })
    },
    [user, persistUserTelemetry]
  )

  // Record distraction rescue
  const recordRescue = useCallback(() => {
    if (!user) return
    setTelemetry((prev) => {
      const nextTelemetry = {
        ...prev,
        distractionRescuesCount: prev.distractionRescuesCount + 1,
      }
      persistUserTelemetry(user.id, nextTelemetry)
      return nextTelemetry
    })
  }, [user, persistUserTelemetry])

  const value = useMemo(
    () => ({
      user,
      telemetry,
      isAuthenticated: Boolean(user),
      isLoading,
      isSupabaseConnected: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      recordCompletedSession,
      recordRescue,
    }),
    [user, telemetry, isLoading, signIn, signUp, signOut, resetPassword, updateProfile, recordCompletedSession, recordRescue]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
