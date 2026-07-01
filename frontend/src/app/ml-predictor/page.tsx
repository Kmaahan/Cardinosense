'use client'

/**
 * ML Predictor Page — redesigned with:
 *  - 2-column sticky form layout
 *  - Grouped vitals sections with icon headers
 *  - Animated probability gauge on result
 *  - AI notes with reading mode layout
 *  - Loading overlay on submit button
 */

import { useState } from 'react'
import { mlPredict, MLPredictRequest, MLPredictResponse } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { RoughNotation } from 'react-rough-notation'
import { FiHeart, FiActivity, FiAlertCircle, FiCpu } from 'react-icons/fi'

// Field component for consistent form row styling
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="input-label text-base">{label}</label>
      {children}
    </div>
  )
}

// Animated gauge bar
function GaugeBar({ pct, high }: { pct: number; high: boolean }) {
  const color = high
    ? 'from-amber-400 to-rose-500'
    : 'from-emerald-400 to-teal-500'

  return (
    <div>
      <div className="progress-track mb-1.5">
        <motion.div
          className={`progress-fill bg-gradient-to-r ${color}`}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between handwritten text-sm text-gray-500 dark:text-gray-400">
        <span>0% (Low Risk)</span>
        <span>100% (High Risk)</span>
      </div>
    </div>
  )
}

export default function MLPredictorPage() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [result,  setResult]  = useState<MLPredictResponse | null>(null)

  const [form, setForm] = useState({
    age: 45 as number | '',
    sex: 'M',
    chest_pain_type: 'ATA',
    resting_bp: 120 as number | '',
    cholesterol: 200 as number | '',
    fasting_bs: 0,
    resting_ecg: 'Normal',
    max_hr: 150 as number | '',
    exercise_angina: 'N',
    oldpeak: 0.0 as number | '',
    st_slope: 'Up',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setForm(prev => ({
      ...prev,
      [name]: type === 'number'
        ? (value === '' ? '' : Number(value))
        : name === 'fasting_bs'
        ? Number(value)
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that all numeric fields are filled
    const numericFields = ['age', 'resting_bp', 'cholesterol', 'max_hr', 'oldpeak']
    const emptyFields = numericFields.filter(f => form[f as keyof typeof form] === '')
    if (emptyFields.length > 0) {
      setError('Please fill in all required patient vitals.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const payload: MLPredictRequest = {
        ...form,
        age: Number(form.age),
        resting_bp: Number(form.resting_bp),
        cholesterol: Number(form.cholesterol),
        max_hr: Number(form.max_hr),
        oldpeak: Number(form.oldpeak),
      }
      setResult(await mlPredict(payload))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Prediction failed. Make sure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  const high = result ? result.heart_disease_probability > 50 : false

  return (
    <div className="page-wrapper">
      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="handwritten text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-3 inline-block">
            <RoughNotation type="underline" show color="#ef4444" strokeWidth={3} padding={[0, 8]}>
              Advanced ML Assessment
            </RoughNotation>
          </h1>
          <p className="handwritten text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter your specific cardiac vitals to receive a statistical heart disease probability
            plus a personalised Doctor's note from Gemini AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ---- Form Card ---- */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            className="card rotate-[0.6deg] relative"
          >
            <div className="tape tape-top-center" aria-hidden="true" />

            <h2 className="handwritten text-3xl font-bold mb-6 mt-4 pb-3 border-b-2 border-dashed border-gray-200 dark:border-slate-600 flex items-center gap-3">
              <FiHeart className="text-rose-500" />
              Patient Vitals
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Age">
                  <input type="number" name="age" value={form.age} onChange={handleChange} min={1} max={120} required className="input-field py-2" />
                </Field>
                <Field label="Sex">
                  <select name="sex" value={form.sex} onChange={handleChange} className="input-field py-2">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </Field>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Resting BP (mmHg)">
                  <input type="number" name="resting_bp" value={form.resting_bp} onChange={handleChange} required className="input-field py-2" />
                </Field>
                <Field label="Cholesterol (mg/dl)">
                  <input type="number" name="cholesterol" value={form.cholesterol} onChange={handleChange} required className="input-field py-2" />
                </Field>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Max HR Achieved">
                  <input type="number" name="max_hr" value={form.max_hr} onChange={handleChange} required className="input-field py-2" />
                </Field>
                <Field label="Fasting Blood Sugar >120">
                  <select name="fasting_bs" value={form.fasting_bs} onChange={handleChange} className="input-field py-2">
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </Field>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Chest Pain Type">
                  <select name="chest_pain_type" value={form.chest_pain_type} onChange={handleChange} className="input-field py-2">
                    <option value="ASY">Asymptomatic (ASY)</option>
                    <option value="ATA">Atypical Angina (ATA)</option>
                    <option value="NAP">Non-Anginal (NAP)</option>
                    <option value="TA">Typical Angina (TA)</option>
                  </select>
                </Field>
                <Field label="Resting ECG">
                  <select name="resting_ecg" value={form.resting_ecg} onChange={handleChange} className="input-field py-2">
                    <option value="Normal">Normal</option>
                    <option value="ST">ST-T Abnormality</option>
                    <option value="LVH">Left Ventricular Hypertrophy</option>
                  </select>
                </Field>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Exercise Angina">
                  <select name="exercise_angina" value={form.exercise_angina} onChange={handleChange} className="input-field py-2">
                    <option value="N">No</option>
                    <option value="Y">Yes</option>
                  </select>
                </Field>
                <Field label="Oldpeak">
                  <input type="number" step="0.1" name="oldpeak" value={form.oldpeak} onChange={handleChange} required className="input-field py-2" />
                </Field>
                <Field label="ST Slope">
                  <select name="st_slope" value={form.st_slope} onChange={handleChange} className="input-field py-2">
                    <option value="Up">Up</option>
                    <option value="Flat">Flat</option>
                    <option value="Down">Down</option>
                  </select>
                </Field>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-sm rounded-lg border border-rose-200"
                  >
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full text-xl py-4 mt-2 flex items-center justify-center gap-2"
                id="ml-predict-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">✏️</span> Running ML Model…
                  </span>
                ) : (
                  <>
                    <FiCpu className="w-5 h-5" /> Run ML Prediction &amp; Analysis
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* ---- Results Column ---- */}
          <div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card min-h-64 flex items-center justify-center"
                >
                  <LoadingSpinner message="Running ML model & Gemini analysis…" size="lg" />
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Probability card */}
                  <div className={`card text-center -rotate-[0.6deg] relative ${high ? 'card-pink' : 'card-green'}`}>
                    <div className="tape tape-top-right" aria-hidden="true" />
                    <h2 className="handwritten text-3xl font-bold mb-4 mt-2 flex items-center justify-center gap-2">
                      <FiActivity className={high ? 'text-rose-500' : 'text-emerald-500'} />
                      ML Probability Score
                    </h2>

                    {/* Big number */}
                    <div className="my-4 inline-block">
                      <RoughNotation
                        type="circle"
                        show
                        color={high ? '#ef4444' : '#22c55e'}
                        strokeWidth={4}
                        padding={[8, 16]}
                      >
                        <span className="caveat text-7xl font-bold text-gray-900 dark:text-white">
                          {result.heart_disease_probability}%
                        </span>
                      </RoughNotation>
                    </div>

                    <p className="handwritten text-2xl mt-2">
                      Prediction:{' '}
                      <strong className={high ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {result.prediction} {high ? '⚠️' : '✓'}
                      </strong>
                    </p>

                    <div className="mt-6 px-2">
                      <GaugeBar pct={result.heart_disease_probability} high={high} />
                    </div>
                  </div>

                  {/* Doctor's notes */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card card-blue relative"
                  >
                    <div className="tape tape-top-left" aria-hidden="true" />
                    <h2 className="handwritten text-3xl font-bold mb-4 mt-2 flex items-center gap-2 marker-highlight marker-blue">
                      🩺 Doctor's Notes (AI)
                    </h2>
                    <div className="prose prose-sm dark:prose-invert font-sans text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap custom-scrollbar overflow-y-auto max-h-96">
                      {result.ai_analysis}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card min-h-64 flex flex-col items-center justify-center gap-5 border-dashed bg-gray-50/30 dark:bg-slate-800/20 -rotate-[0.5deg]"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [3, -3, 3] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-6xl select-none"
                  >
                    🤖
                  </motion.div>
                  <div className="text-center">
                    <p className="handwritten text-2xl font-bold text-gray-600 dark:text-gray-300">
                      Results will appear here
                    </p>
                    <p className="handwritten text-lg text-gray-500 dark:text-gray-400 mt-2">
                      Fill in the vitals and click "Run ML Prediction"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
