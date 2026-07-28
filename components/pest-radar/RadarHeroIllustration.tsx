// Ported 1:1 from the inline <svg> in the original pest-radar.html hero.
// Kept as static markup (no React state) — the pulsing/scanning animation
// is pure CSS (`.wave-ring`, `.node-pulse`, `.scan-bar` in globals.css).
export function RadarHeroIllustration() {
  return (
    <svg
      viewBox="0 0 1400 560"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustration of a farmer using an AI acoustic pest detection app in a crop field, with sound waves, an AI neural network and a real-time pest risk panel"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B2E22" />
          <stop offset="45%" stopColor="#154A34" />
          <stop offset="100%" stopColor="#2C9A5E" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F7A4C" />
          <stop offset="100%" stopColor="#0E3A28" />
        </linearGradient>
        <radialGradient id="sunGlow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F2C94C" stopOpacity=".55" />
          <stop offset="100%" stopColor="#F2C94C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="phoneGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123B29" />
          <stop offset="100%" stopColor="#0A2419" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1400" height="560" fill="url(#skyGrad)" />
      <circle cx="1080" cy="90" r="160" fill="url(#sunGlow2)" />

      <path d="M0 340 Q350 300 700 320 T1400 305 V560 H0 Z" fill="url(#groundGrad)" />
      <path d="M600 320 L520 560 H760 L660 320 Z" fill="#123B29" opacity=".9" />
      <g stroke="#3E9B5C" strokeWidth="2.5" opacity=".5">
        <path d="M-20 375 Q350 345 700 362 T1420 350" />
        <path d="M-20 415 Q350 388 700 404 T1420 394" />
        <path d="M-20 460 Q350 436 700 450 T1420 440" />
        <path d="M-20 505 Q350 484 700 496 T1420 488" />
      </g>

      <g transform="translate(70,300)">
        <path d="M0 240 C-6 170 -6 90 0 0" stroke="#8FD48A" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M0 120 C-40 95 -58 50 -58 10 C-20 18 4 65 0 120 Z" fill="#3E9B5C" />
        <path d="M0 70 C40 50 58 -10 58 -50 C22 -40 -4 5 0 70 Z" fill="#8FD48A" />
        <path d="M0 170 C-36 150 -50 110 -46 78 C-12 88 6 122 0 170 Z" fill="#2C9A5E" />
      </g>
      <g transform="translate(160,330)">
        <path d="M0 200 C-4 140 -4 70 0 0" stroke="#8FD48A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M0 96 C-32 76 -46 38 -44 4 C-16 12 4 52 0 96 Z" fill="#3E9B5C" />
        <path d="M0 54 C30 40 44 -8 44 -40 C16 -32 -2 6 0 54 Z" fill="#8FD48A" />
      </g>
      <g transform="translate(240,350)">
        <path d="M0 165 C-3 116 -3 58 0 0" stroke="#8FD48A" strokeWidth="4.4" fill="none" strokeLinecap="round" />
        <path d="M0 78 C-26 62 -36 30 -34 4 C-12 10 3 42 0 78 Z" fill="#3E9B5C" />
        <path d="M0 44 C24 32 34 -8 34 -32 C12 -26 -2 4 0 44 Z" fill="#8FD48A" />
      </g>

      <g transform="translate(115,275)">
        <circle r="26" fill="#0E3A28" stroke="#F2994C" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#F2994C" />
        <circle cx="-8" cy="-1" r="3.4" fill="#F2C94C" />
        <path
          d="M-6 -3 L-15 -9 M-6 2 L-16 4 M4 -3 L12 -9 M4 3 L13 6"
          stroke="#F2C94C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <g className="wave-ring r1">
        <circle cx="115" cy="275" r="34" fill="none" stroke="#F2994C" strokeWidth="1.6" opacity=".7" />
      </g>

      <g transform="translate(205,310)">
        <circle r="24" fill="#0E3A28" stroke="#F2C94C" strokeWidth="2" />
        <ellipse cx="0" cy="1" rx="8" ry="9" fill="#8B5E34" />
        <circle cx="0" cy="-7" r="3" fill="#5E3E22" />
        <path
          d="M-8 3 L-14 8 M8 3 L14 8 M-8 -2 L-15 -3 M8 -2 L15 -3"
          stroke="#5E3E22"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
      <g className="wave-ring r2">
        <circle cx="205" cy="310" r="32" fill="none" stroke="#F2C94C" strokeWidth="1.6" opacity=".7" />
      </g>

      <g transform="translate(275,340) rotate(15)">
        <circle r="20" fill="#0E3A28" stroke="#8FD48A" strokeWidth="2" />
        <rect x="-7" y="-3" width="16" height="7" rx="3" fill="#EAF4EA" />
        <path
          d="M-7 -3 L-16 -7 M-7 3 L-17 4 M9 -3 L17 -8 M9 3 L18 3"
          stroke="#CFE3D5"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>
      <g className="wave-ring r3">
        <circle cx="275" cy="340" r="28" fill="none" stroke="#8FD48A" strokeWidth="1.4" opacity=".65" />
      </g>

      <g transform="translate(430,420)">
        <rect x="-2" y="0" width="4" height="60" fill="#123B29" />
        <circle r="6" fill="#F2C94C" />
        <circle className="node-pulse" r="6" fill="none" stroke="#F2C94C" strokeWidth="1.5" />
      </g>
      <g transform="translate(980,400)">
        <rect x="-2" y="0" width="4" height="70" fill="#123B29" />
        <circle r="6" fill="#8FD48A" />
        <circle className="node-pulse" r="6" fill="none" stroke="#8FD48A" strokeWidth="1.5" />
      </g>

      <g transform="translate(660,420)">
        <ellipse cx="0" cy="128" rx="46" ry="10" fill="#0B2E22" opacity=".4" />
        <path d="M-20 128 L-24 30 Q-24 0 0 0 Q24 0 24 30 L20 128 Z" fill="#2C9A5E" />
        <path d="M-20 40 L-42 66 L-34 74 L-14 52 Z" fill="#1F7A4C" />
        <path d="M14 52 L34 30 L42 38 L22 60 Z" fill="#1F7A4C" />
        <circle cx="0" cy="-30" r="20" fill="#C68A5B" />
        <path d="M-22 -34 Q0 -58 22 -34 L22 -38 Q0 -50 -22 -38 Z" fill="#8B5E34" />
        <path d="M-24 -36 Q0 -64 24 -36 Q26 -44 0 -46 Q-26 -44 -24 -36 Z" fill="#F2994C" />
        <path d="M-46 30 L-46 66" stroke="#0E3A28" strokeWidth="10" strokeLinecap="round" />
        <path d="M42 40 L34 66" stroke="#0E3A28" strokeWidth="10" strokeLinecap="round" />
        <rect
          x="26"
          y="52"
          width="18"
          height="30"
          rx="3"
          fill="#123B29"
          stroke="#8FD48A"
          strokeWidth="1.5"
          transform="rotate(-18 26 52)"
        />
      </g>
      <g className="wave-ring r1">
        <circle cx="660" cy="380" r="70" fill="none" stroke="#8FD48A" strokeWidth="1.4" opacity=".55" />
      </g>
      <g className="wave-ring r2">
        <circle cx="660" cy="380" r="70" fill="none" stroke="#8FD48A" strokeWidth="1.4" opacity=".55" />
      </g>
      <g className="wave-ring r3">
        <circle cx="660" cy="380" r="70" fill="none" stroke="#8FD48A" strokeWidth="1.4" opacity=".55" />
      </g>

      <g transform="translate(920,230)">
        <rect x="-58" y="-115" width="116" height="230" rx="24" fill="url(#phoneGrad2)" stroke="#3E9B5C" strokeWidth="2.5" />
        <rect x="-46" y="-98" width="92" height="150" rx="10" fill="#0E3A28" />
        <text x="0" y="-74" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="11" fill="#8FD48A" fontWeight="700">
          Acoustic Analysis
        </text>
        <circle cx="0" cy="-22" r="34" fill="none" stroke="#3E9B5C" strokeWidth="2" />
        <g className="scan-bar" stroke="#8FD48A" strokeWidth="2.6" strokeLinecap="round">
          <path d="M-20 -30 L-20 -6 M-10 -40 L-10 6 M0 -48 L0 14 M10 -34 L10 2 M20 -24 L20 -8" />
        </g>
        <rect x="-40" y="24" width="80" height="26" rx="6" fill="#123B29" stroke="#3E9B5C" />
        <path
          d="M-34 42 L-24 34 L-14 44 L-2 30 L10 40 L34 28"
          stroke="#F2C94C"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="-46" y="66" width="92" height="20" rx="10" fill="#1F7A4C" />
        <text x="0" y="80" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#fff" fontWeight="700">
          AI Processing… 98%
        </text>
      </g>

      <g transform="translate(1150,110)">
        <circle r="30" fill="none" stroke="#8FD48A" strokeWidth="1.4" opacity=".7" />
        <text x="0" y="5" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="800" fill="#8FD48A">
          AI
        </text>
        <g className="node-pulse" opacity=".9">
          <circle cx="-60" cy="-30" r="3.2" fill="#8FD48A" />
          <circle cx="55" cy="-40" r="2.6" fill="#F2C94C" />
          <circle cx="70" cy="10" r="2.6" fill="#fff" />
          <circle cx="-45" cy="45" r="2.4" fill="#fff" />
          <circle cx="20" cy="60" r="2.4" fill="#8FD48A" />
          <path
            d="M-60 -30 L-30 -8 M55 -40 L30 -8 M70 10 L30 8 M-45 45 L-15 15 M20 60 L0 25"
            stroke="#8FD48A"
            strokeWidth="1"
            opacity=".6"
          />
        </g>
      </g>

      <g transform="translate(1280,300)">
        <rect x="-108" y="-96" width="216" height="192" rx="18" fill="#FFFFFF" opacity=".98" />
        <text x="-88" y="-64" fontFamily="Poppins, sans-serif" fontSize="15" fontWeight="700" fill="#10241B">
          Real-time Detection
        </text>
        <circle cx="-88" cy="-30" r="6" fill="#E0523A" />
        <text x="-70" y="-25" fontFamily="Inter, sans-serif" fontSize="13" fill="#4B5F55">
          Grasshopper
        </text>
        <text x="88" y="-25" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11.5" fontWeight="700" fill="#E0523A">
          High Risk
        </text>
        <rect x="-88" y="-16" width="176" height="6" rx="3" fill="#E1EFE2" />
        <rect x="-88" y="-16" width="140" height="6" rx="3" fill="#E0523A" />
        <circle cx="-88" cy="12" r="6" fill="#F2994C" />
        <text x="-70" y="17" fontFamily="Inter, sans-serif" fontSize="13" fill="#4B5F55">
          Stem Borer
        </text>
        <text x="88" y="17" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11.5" fontWeight="700" fill="#F2994C">
          Medium Risk
        </text>
        <rect x="-88" y="26" width="176" height="6" rx="3" fill="#E1EFE2" />
        <rect x="-88" y="26" width="90" height="6" rx="3" fill="#F2994C" />
        <circle cx="-88" cy="54" r="6" fill="#3E9B5C" />
        <text x="-70" y="59" fontFamily="Inter, sans-serif" fontSize="13" fill="#4B5F55">
          Aphid
        </text>
        <text x="88" y="59" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11.5" fontWeight="700" fill="#3E9B5C">
          Low Risk
        </text>
        <rect x="-88" y="68" width="176" height="6" rx="3" fill="#E1EFE2" />
        <rect x="-88" y="68" width="46" height="6" rx="3" fill="#3E9B5C" />
      </g>
    </svg>
  );
}
