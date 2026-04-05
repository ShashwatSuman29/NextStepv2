'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  subtitle?: string
  items: FAQItem[]
  className?: string
}

export function FAQSection({ title = 'Frequently Asked Questions', subtitle, items, className = '' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className={`py-14 sm:py-24 px-4 sm:px-6 ${className}`}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            FAQ
          </span>
          <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen ? 'border-primary/20 bg-white shadow-soft' : 'border-border/50 bg-white hover:border-border'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{item.question}</span>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen ? 'bg-primary/10 rotate-180' : 'bg-muted'
                  }`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={isOpen ? 'text-primary' : 'text-muted-foreground'} />
                    </svg>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
