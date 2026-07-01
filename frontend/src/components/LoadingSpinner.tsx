'use client'

/**
 * LoadingSpinner — Dark modern UI version
 * Clean bouncing dot loader with optional full-page mode
 */

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  message?: string
  fullPage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({
  message = 'Loading...',
  fullPage = false,
  size = 'md',
}: LoadingSpinnerProps) {
  const dotSizes = { sm: 8, md: 10, lg: 14 }
  const gap      = { sm: 6, md: 8, lg: 12 }

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      {/* Pulsing heart icon */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        style={{ fontSize: 36 }}
        aria-hidden="true"
      >
        🫀
      </motion.div>

      {/* Bouncing dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: gap[size] }}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            style={{
              width: dotSizes[size],
              height: dotSizes[size],
              borderRadius: '50%',
              display: 'inline-block',
              backgroundColor: ['#3b82f6', '#6366f1', '#14b8a6'][i],
            }}
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <p
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    )
  }

  return content
}
