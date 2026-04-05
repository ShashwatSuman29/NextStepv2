'use client'

import { type ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  accent?: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card p-8 transition-all duration-500 hover:border-primary/15 hover:shadow-lifted">
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 rounded-2xl bg-[#2d6a4f]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.07] transition-all duration-500 group-hover:bg-primary/10 group-hover:shadow-sm">
          {icon}
        </div>
        <h3
          className="mt-5 text-lg font-semibold text-foreground tracking-tight"
        >
          {title}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Stripe-style learn more link */}
        <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1">
          <span>Learn more</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
            <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
