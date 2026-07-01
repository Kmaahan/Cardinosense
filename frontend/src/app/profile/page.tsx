'use client'

/**
 * Profile Page — Dark modern UI theme
 *  - Clean centered card with avatar
 *  - Info rows with icons (matching screenshot's profile screen)
 *  - Upload overlay on avatar hover
 */

import { useEffect, useState, useRef } from 'react'
import { getProfile, uploadProfilePhoto, logout } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiCamera, FiShield, FiLogOut, FiEdit2 } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [profile,   setProfile]   = useState<{ id: number; email: string; profile_photo?: string } | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router  = useRouter()

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setError('Failed to load profile. Please log in again.'))
      .finally(() => setLoading(false))
  }, [])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const updated = await uploadProfilePhoto(file)
      setProfile(updated)
    } catch {
      setError('Failed to upload photo. Please try a smaller image.')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading) return <LoadingSpinner fullPage message="Loading your profile…" />

  if (error || !profile) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="card card-pink" style={{ maxWidth: '28rem' }}>
          <p style={{ fontSize: '1rem', color: '#f87171', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            {error || 'Profile not found'}
          </p>
        </div>
      </div>
    )
  }

  const photoUrl = profile.profile_photo
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${profile.profile_photo}`
    : null

  const initial = profile.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '2.5rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* ---- Profile Card ---- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          className="card"
        >
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'relative', width: 96, height: 96, borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--border-medium)',
                  background: 'var(--bg-elevated)',
                  cursor: 'pointer',
                  display: 'block',
                  boxShadow: '0 0 0 4px rgba(59,130,246,0.15)',
                }}
                aria-label="Change profile photo"
              >
                {uploading ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner size="sm" message="" />
                  </div>
                ) : photoUrl ? (
                  <img src={photoUrl} alt="Profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.25rem', color: 'white' }}>
                      {initial}
                    </span>
                  </div>
                )}
                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  <FiCamera style={{ width: 24, height: 24, color: 'white' }} />
                </div>
              </button>

              {/* Camera badge */}
              <div
                style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-card)',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                }}
                onClick={() => fileRef.current?.click()}
                aria-hidden="true"
              >
                <FiEdit2 style={{ width: 12, height: 12, color: 'white' }} />
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />

            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              My Profile
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Member #{profile.id}
            </p>
          </div>

          {/* ---- Info rows ---- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>

            {/* Email */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiMail style={{ width: 16, height: 16, color: 'var(--accent-blue)' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Email Address
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Account ID */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiUser style={{ width: 16, height: 16, color: '#818cf8' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Account ID
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  #{profile.id}
                </p>
              </div>
            </div>

            {/* Status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1rem',
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiShield style={{ width: 16, height: 16, color: '#4ade80' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Account Status
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9375rem', color: '#4ade80' }}>
                    Active & Verified
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn-danger"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
            id="profile-logout-btn"
          >
            <FiLogOut style={{ width: 16, height: 16 }} />
            Sign Out
          </button>
        </motion.div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          Click the avatar to upload a new profile photo
        </p>
      </div>
    </div>
  )
}
