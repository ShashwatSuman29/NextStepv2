'use client'

import { motion } from 'framer-motion'

interface HeroIllustrationProps {
  className?: string
}

const float = (duration: number, delay: number = 0) => ({
  y: [0, -8, 0],
  transition: { duration, repeat: Infinity, ease: 'easeInOut' as const, delay },
})

export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <div className={className}>
      <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="w-full h-auto">

        {/* Ground shadow ellipse */}
        <ellipse cx="250" cy="430" rx="140" ry="18" fill="#d8f3dc" opacity="0.12" />

        {/* ====== FLOATING DECORATIVE ELEMENTS ====== */}

        {/* Graduation cap — top right */}
        <motion.g animate={float(5, 0)}>
          <rect x="370" y="60" width="50" height="8" rx="2" fill="#2d6a4f" />
          <rect x="380" y="42" width="30" height="18" rx="3" fill="#2d6a4f" />
          <line x1="395" y1="68" x2="395" y2="85" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
          <circle cx="395" cy="88" r="3" fill="#74c69d" />
        </motion.g>

        {/* Book stack — bottom left */}
        <motion.g animate={float(4.5, 1)}>
          <rect x="55" y="340" width="45" height="10" rx="3" fill="#95d5b2" />
          <rect x="50" y="352" width="50" height="10" rx="3" fill="#74c69d" />
          <rect x="53" y="364" width="47" height="10" rx="3" fill="#2d6a4f" />
        </motion.g>

        {/* Location pin — upper left */}
        <motion.g animate={float(5.5, 0.5)}>
          <path d="M95 130 C95 115, 115 115, 115 130 C115 145, 105 158, 105 158 C105 158, 95 145, 95 130Z" fill="#95d5b2" />
          <circle cx="105" cy="130" r="5" fill="#d8f3dc" opacity="0.6" />
        </motion.g>

        {/* Small decorative dots */}
        <motion.g animate={float(3.5, 0.3)}>
          <circle cx="430" cy="160" r="6" fill="#d8f3dc" opacity="0.4" />
        </motion.g>
        <motion.g animate={float(4, 1.2)}>
          <circle cx="70" cy="220" r="4" fill="#74c69d" opacity="0.35" />
        </motion.g>
        <motion.g animate={float(3.8, 0.8)}>
          <circle cx="410" cy="350" r="5" fill="#95d5b2" opacity="0.3" />
        </motion.g>
        <motion.g animate={float(4.2, 1.5)}>
          <circle cx="140" cy="100" r="3" fill="#d8f3dc" opacity="0.5" />
        </motion.g>

        {/* Leaf shape — lower right */}
        <motion.g animate={float(6, 1.5)}>
          <path d="M400 380 Q420 360 430 380 Q420 400 400 380Z" fill="#74c69d" opacity="0.35" />
        </motion.g>

        {/* Small star/sparkle — top center */}
        <motion.g animate={float(3, 0.2)}>
          <path d="M280 75 L283 82 L290 82 L284 87 L286 94 L280 90 L274 94 L276 87 L270 82 L277 82Z" fill="#d8f3dc" opacity="0.45" />
        </motion.g>

        {/* ====== MAIN STUDENT FIGURE ====== */}
        <g transform="translate(155, 120)">

          {/* ---- Laptop ---- */}
          {/* Laptop base */}
          <rect x="55" y="240" width="100" height="6" rx="3" fill="#2d6a4f" />
          {/* Laptop screen back */}
          <path d="M65 175 L65 240 L145 240 L145 175 Z" rx="4" fill="#2d6a4f" />
          {/* Laptop screen */}
          <rect x="70" y="180" width="70" height="52" rx="2" fill="#2d6a4f" />
          {/* Screen content lines */}
          <rect x="78" y="192" width="35" height="3" rx="1.5" fill="#74c69d" opacity="0.6" />
          <rect x="78" y="200" width="50" height="3" rx="1.5" fill="#74c69d" opacity="0.4" />
          <rect x="78" y="208" width="28" height="3" rx="1.5" fill="#d8f3dc" opacity="0.4" />
          <rect x="78" y="216" width="42" height="3" rx="1.5" fill="#74c69d" opacity="0.3" />
          {/* Screen glow */}
          <rect x="70" y="180" width="70" height="52" rx="2" fill="#d8f3dc" opacity="0.06" />

          {/* ---- Legs (crossed, behind torso) ---- */}
          {/* Left leg */}
          <path d="M60 265 Q40 290 55 310 L75 310 Q65 290 80 265Z" fill="#2d6a4f" />
          {/* Right leg */}
          <path d="M130 265 Q150 290 140 310 L120 310 Q125 290 115 265Z" fill="#2d6a4f" />
          {/* Left shoe */}
          <ellipse cx="62" cy="314" rx="16" ry="6" fill="#2d6a4f" />
          {/* Right shoe */}
          <ellipse cx="133" cy="314" rx="16" ry="6" fill="#2d6a4f" />

          {/* ---- Torso / Shirt ---- */}
          <path d="M70 140 Q68 180 65 220 Q65 260 75 270 L120 270 Q130 260 130 220 Q127 180 125 140Z" fill="#95d5b2" />
          {/* Shirt collar */}
          <path d="M85 140 L97 155 L110 140" stroke="#2d6a4f" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* ---- Arms ---- */}
          {/* Left arm — reaching to keyboard */}
          <path d="M70 160 Q50 190 58 225 Q60 235 65 240" stroke="#D4A574" strokeWidth="14" fill="none" strokeLinecap="round" />
          {/* Left sleeve */}
          <path d="M70 155 Q60 170 55 185" stroke="#95d5b2" strokeWidth="16" fill="none" strokeLinecap="round" />
          {/* Right arm — reaching to keyboard */}
          <path d="M125 160 Q145 190 140 225 Q138 235 140 240" stroke="#D4A574" strokeWidth="14" fill="none" strokeLinecap="round" />
          {/* Right sleeve */}
          <path d="M125 155 Q135 170 140 185" stroke="#95d5b2" strokeWidth="16" fill="none" strokeLinecap="round" />

          {/* ---- Hands ---- */}
          <circle cx="65" cy="242" r="8" fill="#D4A574" />
          <circle cx="140" cy="242" r="8" fill="#D4A574" />

          {/* ---- Neck ---- */}
          <rect x="90" y="125" width="15" height="18" rx="5" fill="#D4A574" />

          {/* ---- Head ---- */}
          <circle cx="97" cy="105" r="35" fill="#D4A574" />

          {/* ---- Hair ---- */}
          <path d="M62 100 Q62 65 97 60 Q132 65 132 100 Q132 85 97 80 Q62 85 62 100Z" fill="#2d6a4f" />
          {/* Hair side bits */}
          <path d="M62 100 Q58 108 62 115" stroke="#2d6a4f" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M132 100 Q136 108 132 115" stroke="#2d6a4f" strokeWidth="6" fill="none" strokeLinecap="round" />

          {/* ---- Face details ---- */}
          {/* Eyes */}
          <ellipse cx="85" cy="105" rx="3.5" ry="4" fill="#2d6a4f" />
          <ellipse cx="109" cy="105" rx="3.5" ry="4" fill="#2d6a4f" />
          {/* Eye highlights */}
          <circle cx="86.5" cy="103.5" r="1.2" fill="white" opacity="0.7" />
          <circle cx="110.5" cy="103.5" r="1.2" fill="white" opacity="0.7" />
          {/* Eyebrows */}
          <path d="M79 97 Q85 94 91 97" stroke="#2d6a4f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M103 97 Q109 94 115 97" stroke="#2d6a4f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Smile */}
          <path d="M89 115 Q97 122 105 115" stroke="#2d6a4f" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Nose */}
          <path d="M97 108 Q94 113 97 114" stroke="#C4956A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* ---- Glasses (subtle) ---- */}
          <circle cx="85" cy="105" r="9" stroke="#2d6a4f" strokeWidth="1.5" fill="none" opacity="0.5" />
          <circle cx="109" cy="105" r="9" stroke="#2d6a4f" strokeWidth="1.5" fill="none" opacity="0.5" />
          <line x1="94" y1="105" x2="100" y2="105" stroke="#2d6a4f" strokeWidth="1.5" opacity="0.5" />
        </g>

      </svg>
    </div>
  )
}
