'use client'

/**
 * AnalysisResult — Dark modern UI theme
 *  - Clean dark cards with colored borders
 *  - Modern badge pills
 *  - Smooth stagger animations
 */

import { AnalysisResponse } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiThumbsUp,
  FiActivity,
} from 'react-icons/fi'

interface AnalysisResultProps {
  analysis: AnalysisResponse
}

// Severity badge pill
const SeverityBadge = ({ level }: { level: string }) => {
  const map: Record<string, string> = {
    LOW:      'badge-low',
    MODERATE: 'badge-moderate',
    HIGH:     'badge-high',
  }
  const icons: Record<string, React.ReactNode> = {
    LOW:      <FiCheckCircle className="w-3.5 h-3.5" />,
    MODERATE: <FiClock className="w-3.5 h-3.5" />,
    HIGH:     <FiAlertTriangle className="w-3.5 h-3.5" />,
  }
  return (
    <span className={`badge ${map[level] || 'badge-moderate'}`}>
      {icons[level]}
      {level}
    </span>
  )
}

// Urgency card
const UrgencyCard = ({ urgency }: { urgency: string }) => {
  const config = {
    SELF_CARE: {
      icon: FiCheckCircle,
      accent: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.25)',
      title: 'Self-Care',
      desc: 'You can manage this with home remedies and over-the-counter treatments.',
    },
    VISIT_DOCTOR: {
      icon: FiClock,
      accent: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.25)',
      title: 'Visit Your Doctor',
      desc: 'Schedule an appointment with your healthcare provider soon.',
    },
    SEEK_EMERGENCY: {
      icon: FiAlertTriangle,
      accent: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
      title: 'Seek Emergency Care',
      desc: 'Please seek immediate medical attention or call emergency services.',
    },
  }

  const c = config[urgency as keyof typeof config] || config.VISIT_DOCTOR
  const Icon = c.icon

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: c.bg,
            border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: c.accent }} />
        </div>
        <div>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            fontSize: '1rem', color: c.accent, marginBottom: '0.25rem',
          }}>
            {c.title}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {c.desc}
          </p>
        </div>
      </div>
    </div>
  )
}

// Stagger animation
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* ---- Summary Card ---- */}
      <motion.div variants={item} className="card card-blue">
        <h2
          style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.125rem',
            color: 'var(--text-primary)', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <FiActivity className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
          Analysis Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Severity Level
            </p>
            <SeverityBadge level={analysis.severity_level} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Recommended Action
            </p>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              {analysis.medical_urgency.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ---- Urgency Card ---- */}
      <motion.div variants={item}>
        <UrgencyCard urgency={analysis.medical_urgency} />
      </motion.div>

      {/* ---- Key Findings ---- */}
      {analysis.key_findings.length > 0 && (
        <motion.div variants={item} className="card card-yellow">
          <h3
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem',
              color: 'var(--text-primary)', marginBottom: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <FiZap className="w-4.5 h-4.5" style={{ color: '#fbbf24' }} />
            Key Findings
          </h3>
          <ul className="space-y-2">
            {analysis.key_findings.map((finding, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span
                  style={{
                    minWidth: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: '#fbbf24',
                    flexShrink: 0, marginTop: 2,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {finding}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ---- Symptom Breakdown ---- */}
      {analysis.symptom_breakdown.length > 0 && (
        <motion.div variants={item} className="card">
          <h3
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem',
              color: 'var(--text-primary)', marginBottom: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <FiActivity className="w-4.5 h-4.5" style={{ color: 'var(--accent-blue)' }} />
            Symptom Analysis
          </h3>
          <div className="space-y-3">
            {analysis.symptom_breakdown.map((item_data, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-elevated)',
                  borderLeft: '3px solid var(--accent-blue)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  padding: '0.875rem 1rem',
                }}
              >
                <h4 style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                  fontSize: '0.9375rem', color: 'var(--text-primary)',
                  textTransform: 'capitalize', marginBottom: '0.5rem',
                }}>
                  {item_data.symptom}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Likelihood:</span>
                  <SeverityBadge level={item_data.likelihood} />
                </div>
                {item_data.possible_conditions.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {item_data.possible_conditions.map((cond, cIdx) => (
                      <li key={cIdx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.8125rem', color: 'var(--text-secondary)',
                      }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>→</span>
                        {cond}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ---- Recommendations ---- */}
      {analysis.recommendations.length > 0 && (
        <motion.div variants={item} className="card card-green">
          <h3
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem',
              color: 'var(--text-primary)', marginBottom: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <FiThumbsUp className="w-4.5 h-4.5" style={{ color: '#4ade80' }} />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span style={{ color: '#4ade80', fontWeight: 700, flexShrink: 0, marginTop: 2, fontSize: '0.875rem' }}>✓</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ---- Disclaimer footer ---- */}
      <motion.div
        variants={item}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {analysis.disclaimer}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.375rem' }}>
          Analysed at: {new Date(analysis.analysis_timestamp).toLocaleString()}
        </p>
      </motion.div>
    </motion.div>
  )
}
