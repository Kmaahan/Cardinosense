'use client'

/**
 * Register Page — same split-pane design as Login but mirrored.
 * Includes password strength meter and confirm-password validation.
 */

import { useState } from 'react'
import { register, login } from '@/lib/api'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle,
  FiUserPlus, FiCheck,
} from 'react-icons/fi'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const labels   = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const colors   = ['bg-gray-200', 'bg-rose-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500']

  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-gray-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      <p className="text-xs font-sans text-gray-400 dark:text-gray-500">{labels[strength]}</p>
    </div>
  )
}

export default function RegisterPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return }

    setError('')
    setLoading(true)
    try {
      await register(email, password)
      await login(email, password)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden"
        style={{
          border: '2.5px solid #374151',
          borderRadius: 'var(--radius-sketch-b)',
          boxShadow: 'var(--shadow-sketch-xl)',
        }}
      >
        {/* Left — Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 p-8 md:p-10 flex flex-col justify-center relative"
        >
          <div className="tape tape-top-left" aria-hidden="true" />

          <div className="mb-8 mt-4">
            <h1 className="handwritten text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              Create Account
            </h1>
            <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
              Already have one?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign in →
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-sm rounded-lg border border-rose-200 dark:border-rose-800"
                >
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="input-label flex items-center gap-2">
                <FiMail className="w-4 h-4 text-blue-500" /> Email Address
              </label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password" className="input-label flex items-center gap-2">
                <FiLock className="w-4 h-4 text-indigo-500" /> Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {showPass ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="input-label flex items-center gap-2">
                <FiCheck className="w-4 h-4 text-emerald-500" /> Confirm Password
              </label>
              <input
                id="confirm"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className={`input-field ${confirm && confirm !== password ? 'error' : ''}`}
                disabled={loading}
              />
              <AnimatePresence>
                {confirm && confirm !== password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="field-error mt-1"
                  >
                    <FiAlertCircle className="w-4 h-4" />
                    Passwords don't match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-3.5 text-xl mt-2 flex items-center justify-center gap-2"
              id="register-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">✏️</span> Creating account…
                </span>
              ) : (
                <>
                  <FiUserPlus className="w-5 h-5" /> Create Account
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Right — Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #6ee7b7 31px, #6ee7b7 32px)',
              backgroundSize: '100% 32px',
            }}
          />

          <motion.div
            animate={{ y: [0, -10, 0], rotate: [3, -3, 3] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            className="text-8xl mb-6 select-none relative z-10"
          >
            📋
          </motion.div>

          <h2 className="handwritten text-4xl font-bold text-emerald-800 dark:text-emerald-200 text-center mb-3 relative z-10">
            Join CardioSense
          </h2>
          <p className="handwritten text-lg text-emerald-700 dark:text-emerald-300 text-center relative z-10 max-w-xs">
            Start tracking your health journey with AI-powered insights and personalised analysis
          </p>

          <ul className="mt-8 space-y-3 relative z-10">
            {['Free to use', 'AI-powered insights', 'Private & secure', 'Track over time'].map(f => (
              <li key={f} className="handwritten text-lg text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <FiCheck className="w-5 h-5 text-emerald-600" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
