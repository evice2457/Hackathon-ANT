'use client'

import React from 'react'
import { X, ShieldCheck, Lock, EyeOff, Server, FileText } from 'lucide-react'

interface TermsAndPrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsAndPrivacyModal({ isOpen, onClose }: TermsAndPrivacyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white/95 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-cyan-500/25 dark:bg-[#0B132B]/95 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 dark:border-cyan-500/15">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Terms of Service & Privacy Policy</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Updated September 2026 • VirtualDouble (ANT)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {/* Privacy Guarantee Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <EyeOff className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">100% On-Device Privacy Guarantee</h4>
                <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-300/80">
                  Your webcam stream and facial landmark coordinates are processed exclusively on your local device using WebAssembly (WASM). No video, frames, or biometric imagery are ever recorded, streamed, or uploaded to any cloud server.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white">
              <FileText className="size-4 text-cyan-600 dark:text-cyan-400" />
              <h3>1. Terms of Service & Cognitive Body Doubling Philosophy</h3>
            </div>
            <p>
              VirtualDouble provides an empathetic, judgment-free cognitive coworker designed to support focus persistence and ease task initiation for neurodivergent and neurotypical knowledge workers. By using this service, you agree to engage in constructive, self-compassionate productivity. VirtualDouble is not a clinical diagnostic instrument or psychiatric intervention.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white">
              <Lock className="size-4 text-cyan-600 dark:text-cyan-400" />
              <h3>2. Data Collection & Account Telemetry</h3>
            </div>
            <p>
              To maintain your personalized focus analytics and session history across devices:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Profile Information:</strong> Full name, email address, phone number, gender, and date of birth to calibrate age-cohort focus benchmarks.</li>
              <li><strong>Session Telemetry:</strong> Session duration, completed micro-commitment titles, timestamps, and focus index scores are securely encrypted in Supabase and your local storage.</li>
              <li><strong>Zero Behavioral Tracking:</strong> We never log your browsing history, keystroke text content, or third-party tab activity.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white">
              <Server className="size-4 text-cyan-600 dark:text-cyan-400" />
              <h3>3. Data Portability & Account Deletion</h3>
            </div>
            <p>
              You maintain sovereign ownership of your focus records. You may export or purge your account telemetry and reset all profile credentials at any time directly through the dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200/80 px-6 py-4 dark:border-cyan-500/15">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cyan-500 hover:bg-cyan-400 px-6 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  )
}
