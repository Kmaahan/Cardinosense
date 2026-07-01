'use client'

/**
 * DisclaimerBanner — Dark modern UI version
 * Clean amber-tinted warning card with icon
 */

import { FiAlertTriangle } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function DisclaimerBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8"
    >
      <div
        style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
        }}
      >
        <div className="flex gap-3 items-start">
          <FiAlertTriangle
            className="flex-shrink-0 w-5 h-5 mt-0.5"
            style={{ color: '#fbbf24' }}
          />
          <div>
            <h3
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: '#fbbf24',
                marginBottom: '0.25rem',
              }}
            >
              Medical Disclaimer
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              This analysis is for <strong style={{ color: 'var(--text-primary)' }}>informational purposes only</strong> and
              does not constitute medical advice. Always consult qualified healthcare professionals for diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
