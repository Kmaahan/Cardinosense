 'use client'

/**
 * ML History Page — redesigned with:
 *  - Masonry-style card list with tape decorations
 *  - Probability doughnut-style visual indicator
 *  - Expandable AI doctor's notes section
 *  - Empty state with illustration
 *  - Staggered Framer Motion list entrance
 */

import { useEffect, useState } from 'react'
import { getMLHistory, MLHistoryResponse } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { RoughNotation } from 'react-rough-notation'
import { FiClock, FiActivity, FiChevronDown, FiChevronUp, FiHeart } from 'react-icons/fi'
import Link from 'next/link'

// ---- Probability ring SVG ----
function ProbabilityRing({ pct, high }: { pct: number; high: boolean }) {
  const r = 36, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = high ? '#ef4444' : '#22c55e'

  return (
    <div className="relative inline-flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <motion.circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="caveat text-xl font-bold text-gray-800 dark:text-gray-100">{pct}%</p>
      </div>
    </div>
  )
}

// ---- Expandable AI notes ----
function ExpandableNotes({ notes }: { notes: string }) {
  const [expanded, setExpanded] = useState(false)
  const preview = notes.slice(0, 200)

  return (
    <div>
      <AnimatePresence initial={false}>
        <motion.div
          key={expanded ? 'full' : 'preview'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap custom-scrollbar overflow-y-auto pr-1"
          style={{ maxHeight: expanded ? 400 : undefined }}
        >
          {expanded ? notes : preview + (notes.length > 200 ? '…' : '')}
        </motion.div>
      </AnimatePresence>
      {notes.length > 200 && (
        <button
          onClick={() => setExpanded(s => !s)}
          className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 handwritten text-base hover:underline"
        >
          {expanded ? <><FiChevronUp /> Show less</> : <><FiChevronDown /> Read full notes</>}
        </button>
      )}
    </div>
  )
}

export default function MLHistoryPage() {
  const [history, setHistory] = useState<MLHistoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getMLHistory()
      .then(setHistory)
      .catch(() => setError('Failed to load history. Please ensure you are logged in.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullPage message="Loading ML history…" />

  return (
    <div className="page-wrapper">
      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="handwritten text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-3 inline-flex items-center gap-3">
            <FiClock className="text-blue-500" />
            <RoughNotation type="highlight" show color="#bfdbfe" padding={[2, 8]}>
              ML Assessment History
            </RoughNotation>
          </h1>
          <p className="handwritten text-xl text-gray-600 dark:text-gray-400">
            Review your past Machine Learning predictions and AI Doctor's Notes
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="card card-pink text-center handwritten text-xl text-rose-600 mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-16 flex flex-col items-center gap-5"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3.5 }}
              className="text-7xl select-none"
            >
              🤖
            </motion.div>
            <h2 className="handwritten text-3xl font-bold text-gray-700 dark:text-gray-200">
              No ML Assessments Yet
            </h2>
            <p className="handwritten text-xl text-gray-500 dark:text-gray-400 max-w-sm">
              Run your first Machine Learning heart disease assessment to see results here
            </p>
            <Link href="/ml-predictor" className="btn-primary text-xl py-3 px-8">
              🔬 Run ML Assessment
            </Link>
          </motion.div>
        )}

        {/* History list */}
        {history.length > 0 && (
          <div className="space-y-8">
            {history.slice(0, 15).map((record, index) => {
              const high = record.heart_disease_probability > 50
              const rotate = index % 2 === 0 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.06, 0.4), ease: 'easeOut' }}
                  whileHover={{ scale: 1.005, rotate: 0 }}
                  className={`card relative ${rotate}`}
                >
                  {/* Tape */}
                  {index % 2 === 0
                    ? <div className="tape tape-top-left" style={{ background: 'rgba(254,215,170,0.6)' }} aria-hidden="true" />
                    : <div className="tape tape-top-right" style={{ background: 'rgba(196,253,229,0.6)' }} aria-hidden="true" />
                  }

                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pt-2 pb-4 border-b-2 border-dashed border-gray-200 dark:border-slate-600">
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 handwritten text-base mb-1">
                        <FiActivity className="w-4 h-4" />
                        {new Date(record.created_at).toLocaleDateString('en-US', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                        })}
                        {' '}·{' '}
                        {new Date(record.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                      <h3 className="handwritten text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Prediction:{' '}
                        <span className={high ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {record.prediction} {high ? '⚠️' : '✓'}
                        </span>
                      </h3>
                    </div>
                    <ProbabilityRing pct={record.heart_disease_probability} high={high} />
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Vitals */}
                    <div
                      className="bg-blue-50/60 dark:bg-blue-950/20 p-4"
                      style={{
                        border: '2px solid #bfdbfe',
                        borderRadius: 'var(--radius-sketch-b)',
                      }}
                    >
                      <h4 className="handwritten text-xl font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FiHeart className="text-blue-500" /> Vitals Entered
                      </h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm font-sans">
                        {[
                          ['Age',         record.age],
                          ['Sex',         record.sex],
                          ['Resting BP',  `${record.resting_bp} mmHg`],
                          ['Cholesterol', `${record.cholesterol} mg/dl`],
                          ['Max HR',      record.max_hr],
                          ['Chest Pain',  record.chest_pain_type],
                        ].map(([k, v]) => (
                          <div key={String(k)}>
                            <dt className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{k}</dt>
                            <dd className="handwritten text-lg font-semibold text-gray-800 dark:text-gray-100">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* AI Notes */}
                    <div
                      className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4"
                      style={{
                        border: '2px solid #a7f3d0',
                        borderRadius: 'var(--radius-sketch-c)',
                      }}
                    >
                      <h4 className="handwritten text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                        🩺 Doctor's Notes (AI)
                      </h4>
                      <ExpandableNotes notes={record.ai_analysis} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
