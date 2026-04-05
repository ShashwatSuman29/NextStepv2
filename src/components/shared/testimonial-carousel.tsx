'use client'

const testimonials = [
  {
    quote: "NextStep helped me compare fees and placements across colleges I was confused about. The counselling session cleared all my doubts.",
    name: "Priya Sharma",
    detail: "B.Tech CSE, SRM University",
    initial: "P",
  },
  {
    quote: "I visited two campuses through NextStep before making my final choice. Seeing the college in person made all the difference.",
    name: "Arjun Patel",
    detail: "BBA, Christ University",
    initial: "A",
  },
  {
    quote: "The counsellor helped me find colleges within my budget that I hadn't even considered. Really grateful for the guidance.",
    name: "Sneha Reddy",
    detail: "B.Tech ECE, VIT Vellore",
    initial: "S",
  },
  {
    quote: "Being from a small town, I had no idea how to approach admissions. NextStep made the entire process simple and stress-free.",
    name: "Rahul Kumar",
    detail: "B.Tech ME, Manipal Institute",
    initial: "R",
  },
  {
    quote: "The side-by-side comparison tool saved me weeks of research. I could instantly see which college fit my needs best.",
    name: "Ananya Singh",
    detail: "B.Sc, Amity University",
    initial: "A",
  },
  {
    quote: "My counsellor understood exactly what I wanted and shortlisted colleges I could actually get into. Very practical advice.",
    name: "Vikram Joshi",
    detail: "MBA, Symbiosis Pune",
    initial: "V",
  },
]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="w-[340px] shrink-0 rounded-2xl border border-border/50 bg-card p-6 shadow-soft mx-3 select-none">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, j) => (
          <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#74c69d" className="text-[#74c69d]">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>

      <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground/85 line-clamp-4">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      <div className="mt-5 flex items-center gap-3 border-t border-border/30 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white">
          {t.initial}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.detail}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialCarousel() {
  // Duplicate testimonials for seamless infinite loop
  const items = [...testimonials, ...testimonials]

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling row */}
      <div className="flex animate-marquee hover:[animation-play-state:paused]">
        {items.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  )
}
