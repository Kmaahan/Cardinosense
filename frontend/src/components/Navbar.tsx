'use client'

/**
 * Navbar — Dark modern UI theme
 *  - Glassmorphism dark navbar with subtle border
 *  - Clean pill-style active tabs
 *  - Animated icon logo
 *  - Responsive mobile drawer
 */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import {
  FiHome,
  FiActivity,
  FiCpu,
  FiClock,
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiHeart,
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  authRequired: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/',             label: 'Analyzer',        icon: FiHome,     authRequired: false },
  { href: '/dashboard',    label: 'Dashboard',       icon: FiActivity, authRequired: true  },
  { href: '/ml-predictor', label: 'ML Assessment',   icon: FiCpu,      authRequired: true  },
  { href: '/ml-history',   label: 'ML History',      icon: FiClock,    authRequired: true  },
  { href: '/history',      label: 'Symptom History', icon: FiHeart,    authRequired: true  },
  { href: '/profile',      label: 'Profile',         icon: FiUser,     authRequired: true  },
]

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const { dark, toggle } = useTheme()

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [pathname])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setMobileOpen(false)
    router.push('/')
  }

  const visibleLinks = NAV_ITEMS.filter(item => !item.authRequired || isLoggedIn)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* ---- Navbar ---- */}
      <nav
        className="sticky top-0 z-50 glass"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                }}
              >
                🫀
              </motion.div>
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                CardioSense
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {visibleLinks.map(item => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sketchy-tab flex items-center gap-1.5 ${active ? 'active' : ''}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggle}
                className="btn-icon"
                aria-label="Toggle theme"
                id="theme-toggle"
              >
                {dark
                  ? <FiSun className="w-4.5 h-4.5" style={{ color: '#fbbf24' }} />
                  : <FiMoon className="w-4.5 h-4.5" />
                }
              </motion.button>

              {/* Auth buttons desktop */}
              <div className="hidden lg:flex items-center gap-2">
                {isLoggedIn ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleLogout}
                    className="btn-danger"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    id="logout-btn"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    Logout
                  </motion.button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      id="login-link"
                    >
                      <FiLogIn className="w-3.5 h-3.5" /> Login
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      id="signup-link"
                    >
                      <FiUserPlus className="w-3.5 h-3.5" /> Sign Up
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(o => !o)}
                className="btn-icon lg:hidden"
                aria-label="Open menu"
                id="mobile-menu-btn"
              >
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </motion.button>
            </div>

          </div>
        </div>
      </nav>

      {/* ---- Mobile Drawer ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden z-40 glass"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {visibleLinks.map(item => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.9375rem',
                      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      background: active ? 'var(--accent-blue-soft)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}

              <div className="divider-sketch" />

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    color: '#f87171',
                    background: 'rgba(244,63,94,0.08)',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center" id="mobile-login">
                    <FiLogIn className="w-4 h-4" /> Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center" id="mobile-signup">
                    <FiUserPlus className="w-4 h-4" /> Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
