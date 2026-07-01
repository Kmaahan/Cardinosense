'use client'

/**
 * Login Page — Dark modern UI theme
 *  - Split-pane layout: illustration left, form right
 *  - Glassmorphism card
 *  - Real-time validation
 *  - Password visibility toggle
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiLogIn } from 'react-icons/fi'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>

        {/* Left Panel — Illustration */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.10) 100%)',
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative', overflow: 'hidden',
        }} className="hidden md:flex">
          {/* BG dots */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.4,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }} />

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            style={{ fontSize: 72, marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}
          >
            🫀
          </motion.div>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.875rem', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
            Welcome Back!
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '18rem', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
            Sign in to access your health dashboard and track your wellness journey
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
            {['📊', '🏥', '🤖'].map((emoji, i) => (
              <motion.span key={i} style={{ fontSize: 28 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Right Panel — Form */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'var(--bg-card)',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Sign In
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                Create one →
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.25)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f87171', fontSize: '0.875rem',
                  }}
                >
                  <FiAlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FiMail style={{ width: 14, height: 14, color: 'var(--accent-blue)' }} /> Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FiLock style={{ width: 14, height: 14, color: 'var(--accent-indigo)' }} /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingRight: '3rem' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="btn-icon"
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: 32, height: 32 }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff style={{ width: 16, height: 16 }} /> : <FiEye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem' }}
              id="login-submit"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block' }}>⚙️</motion.span>
                  Signing in…
                </span>
              ) : (
                <>
                  <FiLogIn style={{ width: 16, height: 16 }} /> Sign In
                </>
              )}
            </motion.button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            By signing in you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  )
}
