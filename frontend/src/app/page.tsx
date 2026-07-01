'use client'

/**
 * Home / Analyzer Page — Dark modern UI theme
 *  - Hero section with gradient text and glow effect
 *  - Feature strip with dark cards
 *  - Clean form layout
 *  - Professional footer
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SymptomForm from '@/components/SymptomForm'
import AnalysisResult from '@/components/AnalysisResult'
import LoadingSpinner from '@/components/LoadingSpinner'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { analyzeSymptoms, SymptomRequest, AnalysisResponse } from '@/lib/api'
import { FiAlertCircle, FiRefreshCw, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi'

// Feature strip data
const FEATURES = [
  {
    icon: '🤖',
    label: 'AI-Powered',
    desc: 'Google Gemini analyses your symptoms instantly',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
  },
  {
    icon: '🔒',
    label: 'Private & Secure',
    desc: 'Your health data is encrypted and never shared',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    icon: '📊',
    label: 'Track Trends',
    desc: 'Dashboard visualisations to follow your health journey',
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.2)',
  },
]

export default function Page() {
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const handleSubmit = async (data: SymptomRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await analyzeSymptoms(data)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyse symptoms. Please try again.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleNewAnalysis = () => { setResult(null); setError(null) }

  return (
    <div className="page-wrapper">
      <div className="container-custom">

        {/* ============ HERO ============ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', paddingTop: '2.5rem', paddingBottom: '2rem' }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            style={{ fontSize: 56, marginBottom: '1.25rem', display: 'inline-block' }}
            aria-hidden="true"
          >
            🫀
          </motion.div>

          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.15,
              marginBottom: '1rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            Healthcare{' '}
            <span className="gradient-text">Symptom Analyzer</span>
          </h1>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              color: 'var(--text-secondary)',
              maxWidth: '36rem',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Describe what you're feeling, and our AI will provide instant,
            personalised health insights powered by Google Gemini.
          </p>
        </motion.section>

        {/* ============ FEATURE STRIP ============ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -3 }}
              style={{
                background: f.bg,
                border: `1px solid ${f.border}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                transition: 'all var(--transition-base)',
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }} aria-hidden="true">{f.icon}</span>
              <div>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                  fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem',
                }}>
                  {f.label}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ============ DISCLAIMER ============ */}
        <DisclaimerBanner />

        {/* ============ MAIN GRID ============ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="card"
            style={{ background: 'var(--bg-card-alt)' }}
          >
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem',
                color: 'var(--text-primary)', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--accent-blue-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>📝</span>
              Enter Your Symptoms
            </h2>
            <SymptomForm onSubmit={handleSubmit} isLoading={loading} />
          </motion.div>

          {/* Right — Results */}
          <div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card"
                  style={{ minHeight: '24rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LoadingSpinner message="Analysing your symptoms..." size="lg" />
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="card card-pink"
                >
                  <div className="flex gap-3 mt-2">
                    <FiAlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#f87171', marginTop: 2 }} />
                    <div>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.0625rem', color: '#f87171', marginBottom: '0.375rem' }}>
                        Something went wrong
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{error}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Check that the backend is running at {process.env.NEXT_PUBLIC_API_URL}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleNewAnalysis} className="btn-secondary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                    <FiRefreshCw className="w-4 h-4" /> Try Again
                  </button>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <AnalysisResult analysis={result} />
                  <button
                    onClick={handleNewAnalysis}
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="new-analysis-btn"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    New Analysis
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card"
                  style={{
                    minHeight: '24rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.25rem',
                    border: '1px dashed var(--border-medium)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    style={{ fontSize: 48 }}
                    aria-hidden="true"
                  >
                    📋
                  </motion.div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                      fontSize: '1.0625rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
                    }}>
                      Results will appear here
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '18rem', lineHeight: 1.6 }}>
                      Fill in the form and click "Analyze Symptoms" to get started
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', opacity: 0.5 }}>
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ============ FOOTER ============ */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} CardioSense · For educational & informational purposes only</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.375rem', color: 'var(--text-disabled)' }}>
            Not a substitute for professional medical advice
          </p>
        </footer>

      </div>
    </div>
  )
}
