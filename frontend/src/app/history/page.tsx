'use client'

/**
 * Symptom History Page — Dark modern UI theme
 *  - List-item row style matching screenshot's task list
 *  - Expandable accordion items
 *  - Severity color indicators
 *  - Staggered entrance animations
 */

import { useEffect, useState } from 'react'
import { getHistory } from '@/lib/api'
import AnalysisResult from '@/components/AnalysisResult'
import LoadingSpinner from '@/components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiChevronUp, FiClock, FiHeart } from 'react-icons/fi'
import Link from 'next/link'

// Simple relative-time formatter
function relativeTime(iso: string) {
  const now  = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60)      return 'just now'
  if (diff < 3600)    return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)   return `${Math.floor(diff/3600)}h ago`
  if (diff < 604800)  return `${Math.floor(diff/86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

// Severity colors
const SEV_COLOR: Record<string, string> = {
  LOW:      '#22c55e',
  MODERATE: '#f59e0b',
  HIGH:     '#ef4444',
}
const SEV_BG: Record<string, string> = {
  LOW:      'rgba(34,197,94,0.12)',
  MODERATE: 'rgba(245,158,11,0.12)',
  HIGH:     'rgba(239,68,68,0.12)',
}

// Expandable history item
function HistoryItem({ item, index }: { item: any; index: number }) {
  const [open, setOpen] = useState(false)
  const analysis = JSON.parse(item.analysis_json)
  const color = SEV_COLOR[analysis.severity_level] || '#3b82f6'
  const bg    = SEV_BG[analysis.severity_level] || 'rgba(59,130,246,0.08)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.35) }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        ...(open ? { borderColor: 'var(--border-medium)', boxShadow: 'var(--shadow-md)' } : {}),
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Severity dot */}
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: bg,
          border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              fontSize: '0.6875rem', color: color,
              background: bg,
              padding: '0.1875rem 0.625rem',
              borderRadius: '999px',
              border: `1px solid ${color}30`,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {analysis.severity_level}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <FiClock style={{ width: 12, height: 12 }} />
              {relativeTime(item.created_at)}
            </span>
          </div>
          <p style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 600,
            fontSize: '0.9375rem', color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {item.symptoms}
          </p>
        </div>

        {/* Chevron */}
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {open
            ? <FiChevronUp style={{ width: 18, height: 18 }} />
            : <FiChevronDown style={{ width: 18, height: 18 }} />
          }
        </div>
      </button>

      {/* Expandable analysis */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              background: 'var(--bg-surface)',
            }}>
              <AnalysisResult analysis={analysis} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(err => setError(err.response?.data?.detail || 'Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullPage message="Loading your health history…" />

  return (
    <div className="page-wrapper">
      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            color: 'var(--text-primary)', marginBottom: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <FiHeart style={{ color: '#f43f5e' }} />
            Your Health History
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            {history.length > 0
              ? `${history.length} symptom analys${history.length === 1 ? 'is' : 'es'} on record`
              : 'No analyses recorded yet'}
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="card card-pink" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: '#f87171', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              {error}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!error && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{
              textAlign: 'center', padding: '4rem 2rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
              border: '1px dashed var(--border-medium)',
              background: 'var(--bg-surface)',
            }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3.5 }}
              style={{ fontSize: 56 }}
            >
              📖
            </motion.div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              No Health History Yet
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '24rem', lineHeight: 1.7 }}>
              Complete your first symptom analysis to start building your health record
            </p>
            <Link href="/" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 1.75rem' }}>
              Analyse My Symptoms
            </Link>
          </motion.div>
        )}

        {/* History list */}
        {history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.slice(0, 15).map((item, index) => (
              <HistoryItem key={item.id} item={item} index={index} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
