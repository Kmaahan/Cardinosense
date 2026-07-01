'use client'

/**
 * Dashboard — Dark modern UI theme
 *  - Sleek stat cards with glow accents
 *  - Dark Recharts charts
 *  - Clean section headers
 *  - Smooth stagger animations
 */

import { useEffect, useState } from 'react'
import { getHistory } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts'
import { FiActivity, FiTrendingUp, FiAlertTriangle, FiList } from 'react-icons/fi'
import Link from 'next/link'

// ---- Stat card ----
function StatCard({
  icon, label, value, accentColor, delay,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accentColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        background: 'var(--bg-card-alt)',
        border: `1px solid ${accentColor}30`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '0.5rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        boxShadow: `0 0 30px ${accentColor}10`,
      }}
    >
      {/* Gradient top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
        borderRadius: '999px 999px 0 0',
      }} />

      <div style={{ fontSize: 24, opacity: 0.8 }} aria-hidden="true">
        {icon}
      </div>

      <div style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 800,
        fontSize: typeof value === 'string' && value.length > 12
          ? '1.25rem'
          : typeof value === 'string' && value.length > 8
          ? '1.6rem'
          : '2.5rem',
        lineHeight: 1.2,
        color: accentColor,
        textAlign: 'center',
        wordBreak: 'break-word',
      }}>
        {value}
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
        fontWeight: 500,
      }}>
        {label}
      </p>
    </motion.div>
  )
}

// ---- Custom dark tooltip for charts ----
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.stroke, fontSize: '0.875rem' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [history, setHistory]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    getHistory()
      .then(data => setHistory(data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullPage message="Loading your dashboard…" />
  if (error) return (
    <div className="container-custom py-12 text-center">
      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#f87171' }}>{error}</p>
    </div>
  )

  // ---- Empty state ----
  if (history.length === 0) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '2rem' }}>
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ fontSize: 72 }}
        >
          📊
        </motion.div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: 'var(--text-primary)' }}>
          Your Dashboard is Empty!
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '28rem', lineHeight: 1.7 }}>
          Run your first symptom analysis to start seeing beautiful charts and insights here.
        </p>
        <Link href="/" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
          Analyse My Symptoms
        </Link>
      </div>
    )
  }

  // ---- Statistics ----
  const totalAnalyses  = history.length
  const severityCounts = { LOW: 0, MODERATE: 0, HIGH: 0 }
  const urgencyCounts: Record<string, number> = {}

  history.forEach(item => {
    if (item.severity_level in severityCounts)
      severityCounts[item.severity_level as keyof typeof severityCounts]++
    urgencyCounts[item.medical_urgency] = (urgencyCounts[item.medical_urgency] || 0) + 1
  })

  const mostFreqUrgency = Object.keys(urgencyCounts).reduce(
    (a, b) => urgencyCounts[a] > urgencyCounts[b] ? a : b
  )

  const severityData = [
    { name: 'Low',      count: severityCounts.LOW,      fill: '#22c55e' },
    { name: 'Moderate', count: severityCounts.MODERATE, fill: '#f59e0b' },
    { name: 'High',     count: severityCounts.HIGH,     fill: '#ef4444' },
  ]

  const timelineData = history.slice(0, 7).reverse().map(item => ({
    date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    severity: item.severity_level === 'HIGH' ? 3 : item.severity_level === 'MODERATE' ? 2 : 1,
  }))

  const urgencyData = Object.entries(urgencyCounts).map(([name, count]) => ({
    name: name.replace(/_/g, ' '),
    count,
  }))

  const chartAxisStyle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    fill: '#606080',
  }

  return (
    <div className="page-wrapper">
      <div className="container-custom">

        {/* ---- Page Header ---- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2.5rem', textAlign: 'center' }}
        >
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            color: 'var(--text-primary)', marginBottom: '0.5rem',
          }}>
            My Health Dashboard
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Your symptom analysis journey at a glance
          </p>
        </motion.div>

        {/* ---- Stat Cards ---- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={<FiList />}          label="Total Analyses"    value={totalAnalyses}                        accentColor="#3b82f6" delay={0}   />
          <StatCard icon={<FiActivity />}       label="High Severity"     value={severityCounts.HIGH}                  accentColor="#ef4444" delay={0.08}/>
          <StatCard icon={<FiAlertTriangle />}  label="Moderate Cases"    value={severityCounts.MODERATE}              accentColor="#f59e0b" delay={0.16}/>
          <StatCard icon={<FiTrendingUp />}     label="Common Urgency"    value={mostFreqUrgency.replace(/_/g, ' ')}   accentColor="#22c55e" delay={0.24}/>
        </div>

        {/* ---- Charts Row ---- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Severity Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              Severity Breakdown
            </h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" name="Cases" radius={[6, 6, 0, 0]}>
                    {severityData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Timeline Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 }}
            className="card"
          >
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
              Severity Timeline
            </h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 4]} ticks={[1, 2, 3]}
                    tickFormatter={v => v === 1 ? 'Low' : v === 2 ? 'Mod' : 'High'}
                    tick={chartAxisStyle} axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<DarkTooltip />} />
                  <Line
                    type="monotone" dataKey="severity" name="Severity"
                    stroke="#6366f1" strokeWidth={2.5}
                    dot={{ r: 5, stroke: '#6366f1', strokeWidth: 2, fill: '#1a1a2e' }}
                    activeDot={{ r: 7, stroke: '#6366f1', strokeWidth: 2, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ---- Urgency Distribution Bar ---- */}
        {urgencyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 }}
            className="card"
          >
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#14b8a6', display: 'inline-block' }} />
              Medical Urgency Distribution
            </h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={urgencyData} layout="vertical" margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" allowDecimals={false} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={chartAxisStyle} axisLine={false} tickLine={false} width={130} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" name="Count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
