'use client'

import { Lightbulb, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DistractionNudgeModalProps {
  onBreakDown: () => void
  onKeepGoing: () => void
  onClose: () => void
}

export default function DistractionNudgeModal({ 
  onBreakDown, 
  onKeepGoing,
  onClose,
}: DistractionNudgeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 py-12 z-50">
      <div className="w-full max-w-xl rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-amber-500/30 backdrop-blur-md shadow-2xl shadow-amber-500/20 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-10">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/50 flex items-center justify-center mb-6">
            <Lightbulb className="w-7 h-7 text-amber-400" />
          </div>

          {/* Headline */}
          <h3 className="text-3xl font-light text-white mb-4">
            Notice you paused <span className="font-serif italic font-normal text-amber-200">for a moment</span>
          </h3>

          {/* Description */}
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Totally okay! Brains get overloaded sometimes. Would you like me to break this step down even smaller for you?
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={onBreakDown}
              className="flex-1 px-6 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30"
            >
              Break it down smaller (AI)
            </Button>
            <Button
              onClick={onKeepGoing}
              variant="outline"
              className="flex-1 px-6 py-6 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50 hover:border-slate-500 rounded-xl font-semibold"
            >
              Keep going
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
