'use client'

const testimonials = [
  {
    quote: "NextStep made my college search so much easier. The counselling sessions were incredibly helpful in narrowing down my choices.",
    name: "Priya Sharma",
    detail: "B.Tech CSE, NIT Trichy",
    initial: "P",
  },
  {
    quote: "I was overwhelmed by options until I found NextStep. The campus visit feature helped me experience colleges before making my decision.",
    name: "Arjun Patel",
    detail: "BBA, Christ University",
    initial: "A",
  },
  {
    quote: "The personalized guidance from NextStep counsellors helped me find colleges I hadn't even considered. Truly a game changer.",
    name: "Sneha Reddy",
    detail: "B.Tech ECE, VIT Vellore",
    initial: "S",
  },
  {
    quote: "From JEE counselling to college visits, NextStep handled everything seamlessly. I couldn't have asked for a better experience.",
    name: "Rahul Kumar",
    detail: "B.Tech ME, IIT Dhanbad",
    initial: "R",
  },
  {
    quote: "The college comparison tool saved me weeks of research. I could see fees, placements, and facilities side by side instantly.",
    name: "Ananya Singh",
    detail: "B.Sc Data Science, BITS Pilani",
    initial: "A",
  },
  {
    quote: "My counsellor understood exactly what I was looking for and guided me to the perfect fit. NextStep is a must for every aspirant.",
    name: "Vikram Joshi",
    detail: "MBA, IIM Indore",
    initial: "V",
  },
]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="w-[340px] shrink-0 rounded-2xl border border-border/50 bg-card p-6 shadow-soft mx-3 select-none">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, j) => (
          <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" className="text-gold">
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
