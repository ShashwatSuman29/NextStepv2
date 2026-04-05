'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface StatCounterProps {
  end: number
  suffix?: string
  prefix?: string
  label: string
  duration?: number
}

export function StatCounter({ end, suffix = '', prefix = '', label, duration = 2 }: StatCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <p className="text-3xl font-bold text-white sm:text-5xl md:text-6xl" style={{ fontFamily: 'var(--font-sans)' }}>
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </p>
      <div className="mx-auto mt-3 h-px w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <p className="mt-3 text-sm font-medium text-white/50 tracking-wide">{label}</p>
    </motion.div>
  )
}
