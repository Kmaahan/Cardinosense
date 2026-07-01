'use client'

/**
 * SymptomForm — enhanced with:
 *  - Animated label entrance
 *  - Sketch-style input fields with real-time char counter
 *  - Smooth error shake animation
 *  - Loading state with pencil spinner
 */

import { useState, FormEvent, ChangeEvent } from 'react'
import { SymptomRequest } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertCircle, FiFileText, FiUser, FiBookOpen } from 'react-icons/fi'

interface SymptomFormProps {
  onSubmit: (data: SymptomRequest) => Promise<void>
  isLoading: boolean
}

export default function SymptomForm({ onSubmit, isLoading }: SymptomFormProps) {
  const [formData, setFormData] = useState<SymptomRequest>({
    symptoms: '',
    age: undefined,
    medical_history: undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const MAX_SYMPTOMS = parseInt(process.env.NEXT_PUBLIC_MAX_CHAR_SYMPTOMS || '500')
  const MIN_SYMPTOMS = parseInt(process.env.NEXT_PUBLIC_MIN_CHAR_SYMPTOMS || '5')
  const MAX_HISTORY  = 300

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value || undefined }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name)
  }

  const validateField = (name: string) => {
    const newErrors = { ...errors }
    if (name === 'symptoms') {
      if (!formData.symptoms?.trim())
        newErrors.symptoms = 'Please describe your symptoms'
      else if (formData.symptoms.length < MIN_SYMPTOMS)
        newErrors.symptoms = `At least ${MIN_SYMPTOMS} characters needed`
      else if (formData.symptoms.length > MAX_SYMPTOMS)
        newErrors.symptoms = `Maximum ${MAX_SYMPTOMS} characters exceeded`
      else delete newErrors.symptoms
    }
    if (name === 'age' && formData.age !== undefined) {
      if ((formData.age as number) < 0 || (formData.age as number) > 150)
        newErrors.age = 'Age must be between 0 and 150'
      else delete newErrors.age
    }
    if (name === 'medical_history' && formData.medical_history) {
      if (formData.medical_history.length > MAX_HISTORY)
        newErrors.medical_history = `Maximum ${MAX_HISTORY} characters exceeded`
      else delete newErrors.medical_history
    }
    setErrors(newErrors)
  }

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.symptoms?.trim())
      newErrors.symptoms = 'Please describe your symptoms'
    else if (formData.symptoms.length < MIN_SYMPTOMS)
      newErrors.symptoms = `At least ${MIN_SYMPTOMS} characters needed`
    else if (formData.symptoms.length > MAX_SYMPTOMS)
      newErrors.symptoms = `Maximum ${MAX_SYMPTOMS} characters exceeded`

    if (formData.age !== undefined && ((formData.age as number) < 0 || (formData.age as number) > 150))
      newErrors.age = 'Age must be between 0 and 150'

    if (formData.medical_history && formData.medical_history.length > MAX_HISTORY)
      newErrors.medical_history = `Maximum ${MAX_HISTORY} characters exceeded`

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (validateAll()) await onSubmit(formData)
  }

  const symLen  = formData.symptoms?.length || 0
  const symPct  = Math.min((symLen / MAX_SYMPTOMS) * 100, 100)
  const histLen = formData.medical_history?.length || 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* ---- Symptoms textarea ---- */}
      <div>
        <label htmlFor="symptoms" className="input-label flex items-center gap-2">
          <FiFileText className="w-5 h-5 text-blue-500" />
          Describe Your Symptoms *
        </label>
        <motion.div
          animate={errors.symptoms && touched.symptoms ? { x: [-6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          <textarea
            id="symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            onBlur={() => handleBlur('symptoms')}
            placeholder="e.g., I've had a persistent headache, mild fever, and fatigue for the past 3 days..."
            rows={5}
            className={`input-field resize-none ${errors.symptoms && touched.symptoms ? 'error' : ''}`}
            disabled={isLoading}
          />
        </motion.div>

        {/* Character progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="progress-track flex-1">
            <div
              className="progress-fill"
              style={{
                width: `${symPct}%`,
                background: symPct > 90
                  ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                  : symPct > 70
                  ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                  : 'linear-gradient(90deg,#3b82f6,#6366f1)',
              }}
            />
          </div>
          <span className="char-counter whitespace-nowrap">{symLen}/{MAX_SYMPTOMS}</span>
        </div>

        <AnimatePresence>
          {errors.symptoms && touched.symptoms && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="field-error"
            >
              <FiAlertCircle className="w-4 h-4" />
              {errors.symptoms}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Age ---- */}
      <div>
        <label htmlFor="age" className="input-label flex items-center gap-2">
          <FiUser className="w-5 h-5 text-indigo-500" />
          Age <span className="text-gray-400 font-normal text-base">(optional)</span>
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age ?? ''}
          onChange={handleChange}
          onBlur={() => handleBlur('age')}
          placeholder="Your age"
          min="0"
          max="150"
          className={`input-field ${errors.age && touched.age ? 'error' : ''}`}
          disabled={isLoading}
        />
        <AnimatePresence>
          {errors.age && touched.age && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="field-error"
            >
              <FiAlertCircle className="w-4 h-4" />
              {errors.age}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Medical History ---- */}
      <div>
        <label htmlFor="medical_history" className="input-label flex items-center gap-2">
          <FiBookOpen className="w-5 h-5 text-emerald-500" />
          Medical History <span className="text-gray-400 font-normal text-base">(optional)</span>
        </label>
        <textarea
          id="medical_history"
          name="medical_history"
          value={formData.medical_history ?? ''}
          onChange={handleChange}
          onBlur={() => handleBlur('medical_history')}
          placeholder="e.g., diabetes, allergies, previous conditions..."
          rows={3}
          className={`input-field resize-none ${errors.medical_history && touched.medical_history ? 'error' : ''}`}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mt-1">
          <AnimatePresence>
            {errors.medical_history && touched.medical_history ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="field-error">
                <FiAlertCircle className="w-4 h-4" />
                {errors.medical_history}
              </motion.p>
            ) : (
              <span />
            )}
          </AnimatePresence>
          <span className="char-counter">{histLen}/{MAX_HISTORY}</span>
        </div>
      </div>

      {/* ---- Submit ---- */}
      <motion.button
        type="submit"
        disabled={isLoading || !formData.symptoms?.trim()}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className="btn-primary w-full"
        style={{ padding: '0.875rem 1.5rem', fontSize: '1rem' }}
        id="analyze-submit-btn"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ display: 'inline-block', fontSize: 18 }}
            >
              ⚙️
            </motion.span>
            Analyzing…
          </span>
        ) : (
          'Analyze Symptoms'
        )}
      </motion.button>
    </form>
  )
}
