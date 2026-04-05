'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SaveToggle } from './save-toggle'

interface CollegeCardProps {
  id: string
  name: string
  city: string
  state: string
  feeMin?: number | null
  feeMax?: number | null
  description?: string | null
  placementRate?: number | null
  collegeType?: string | null
  imagePaths?: string[]
  establishedYear?: number | null
  accreditation?: string | null
  hostelAvailable?: boolean
  scholarship?: boolean
  index?: number
}

export function CollegeCard({
  id, name, city, state, feeMin, feeMax, description,
  placementRate, collegeType, imagePaths, establishedYear,
  accreditation, hostelAvailable, scholarship, index = 0,
}: CollegeCardProps) {
  const hasImage = imagePaths && imagePaths.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <Link
        href={`/colleges/${id}`}
        className="group relative block overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft transition-all duration-500 hover:shadow-lifted hover:-translate-y-2 hover:border-primary/20"
      >
        {/* Image section */}
        {hasImage ? (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <img
              src={imagePaths[0]}
              alt={`${name} campus`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                img.parentElement?.classList.add('bg-gradient-to-br', 'from-primary-dark/20', 'to-primary/10')
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/70" />

            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {collegeType && (
                <span className="rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-foreground capitalize shadow-sm">
                  {collegeType}
                </span>
              )}
            </div>

            {placementRate != null && (
              <span className="absolute top-3 right-3 rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 14l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {placementRate}%
              </span>
            )}

            {/* Bottom overlay info on image */}
            <div className="absolute bottom-0 left-0 right-12 px-4 pb-3">
              <h3 className="text-base font-bold text-white leading-tight drop-shadow-md">
                {name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-white/80">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z" fill="currentColor"/>
                </svg>
                <span className="text-xs font-medium">{city}, {state}</span>
              </div>
            </div>
          </div>
        ) : (
          /* No-image header with gradient */
          <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark/80">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: `radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)` }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
              <h3 className="text-base font-bold text-white leading-tight">
                {name}
              </h3>
              <div className="mt-0.5 flex items-center gap-1.5 text-white/70">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z" fill="currentColor"/>
                </svg>
                <span className="text-xs font-medium">{city}, {state}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content section */}
        <div className="p-5">
          {/* Description */}
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Accreditation */}
          {accreditation && (
            <p className={`${description ? 'mt-2' : ''} text-[11px] font-semibold text-primary leading-snug`}>
              {accreditation}
            </p>
          )}

          {/* Tags row */}
          <div className={`${description || accreditation ? 'mt-3' : ''} flex flex-wrap gap-1.5`}>
            {establishedYear && (
              <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Est. {establishedYear}</span>
            )}
            {hostelAvailable && (
              <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Hostel</span>
            )}
            {scholarship && (
              <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Scholarship</span>
            )}
          </div>

          {/* Fee range */}
          {(feeMin || feeMax) && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-xs font-bold text-primary">₹</span>
              <span className="text-xs font-semibold text-foreground">
                {feeMin?.toLocaleString('en-IN') ?? '—'} – ₹{feeMax?.toLocaleString('en-IN') ?? '—'}
              </span>
              <span className="text-[9px] text-muted-foreground">/yr</span>
            </div>
          )}

          {/* Explore CTA */}
          <div className="mt-4 flex items-center border-t border-border/40 pt-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all duration-300 group-hover:gap-2.5">
              Explore Details
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Bottom bar on hover */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </Link>

      {/* Save toggle */}
      <SaveToggle collegeId={id} className={`absolute ${hasImage ? 'top-[160px]' : 'top-5'} right-4 h-9 w-9 rounded-xl bg-card/90 backdrop-blur-sm shadow-md border border-border/30 transition-all hover:scale-110 hover:shadow-lifted z-10`} size={16} />
    </motion.div>
  )
}
