// Server component — no 'use client' needed
// Fixed full-page graffiti texture: spray circles, text tags, corner brackets, drips

export function GraffitiBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Spray paint blur filters */}
          <filter id="spray-lg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" />
          </filter>
          <filter id="spray-md" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" />
          </filter>
          <filter id="spray-sm" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
          <filter id="drip-blur" x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
        </defs>

        {/* ── Spray circles ── */}
        <circle cx="120" cy="180" r="90" fill="#FFB800" opacity="0.028" filter="url(#spray-lg)" />
        <circle cx="1320" cy="120" r="70" fill="#C084FC" opacity="0.030" filter="url(#spray-lg)" />
        <circle cx="720" cy="820" r="110" fill="#22C55E" opacity="0.022" filter="url(#spray-lg)" />
        <circle cx="1380" cy="700" r="80" fill="#FFB800" opacity="0.025" filter="url(#spray-md)" />
        <circle cx="60"  cy="600" r="60" fill="#60A5FA" opacity="0.030" filter="url(#spray-md)" />
        <circle cx="900" cy="200" r="50" fill="#F87171" opacity="0.020" filter="url(#spray-md)" />
        <circle cx="300" cy="750" r="40" fill="#FBBF24" opacity="0.025" filter="url(#spray-sm)" />
        <circle cx="1100" cy="500" r="55" fill="#C084FC" opacity="0.022" filter="url(#spray-md)" />
        <circle cx="550" cy="450" r="35" fill="#FFB800" opacity="0.018" filter="url(#spray-sm)" />

        {/* ── Text fragments — graffiti tags ── */}
        <text
          x="72" y="245"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="52"
          fontWeight="900"
          fill="#FFB800"
          opacity="0.042"
          transform="rotate(-12, 72, 245)"
          letterSpacing="4"
        >HACK</text>

        <text
          x="1180" y="160"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="44"
          fontWeight="900"
          fill="#C084FC"
          opacity="0.038"
          transform="rotate(8, 1180, 160)"
          letterSpacing="3"
        >BUILD</text>

        <text
          x="620" y="840"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="60"
          fontWeight="900"
          fill="#22C55E"
          opacity="0.036"
          transform="rotate(-5, 620, 840)"
          letterSpacing="5"
        >WIN</text>

        <text
          x="1260" y="620"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="38"
          fontWeight="900"
          fill="#60A5FA"
          opacity="0.035"
          transform="rotate(15, 1260, 620)"
          letterSpacing="2"
        >CREATE</text>

        <text
          x="30" y="490"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="48"
          fontWeight="900"
          fill="#FBBF24"
          opacity="0.032"
          transform="rotate(-18, 30, 490)"
          letterSpacing="3"
        >AI</text>

        <text
          x="850" y="120"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="36"
          fontWeight="900"
          fill="#F87171"
          opacity="0.030"
          transform="rotate(6, 850, 120)"
          letterSpacing="4"
        >CODE</text>

        <text
          x="200" y="820"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="30"
          fontWeight="900"
          fill="#FFB800"
          opacity="0.028"
          transform="rotate(-8, 200, 820)"
          letterSpacing="2"
        >LAUNCH</text>

        <text
          x="1050" y="860"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="34"
          fontWeight="900"
          fill="#4ADE80"
          opacity="0.030"
          transform="rotate(10, 1050, 860)"
          letterSpacing="3"
        >SHIP IT</text>

        {/* ── Corner bracket marks ── */}
        {/* Top-left */}
        <path d="M20,20 L20,60 M20,20 L60,20" stroke="#FFB800" strokeWidth="2" opacity="0.08" fill="none" strokeLinecap="square" />
        {/* Top-right */}
        <path d="M1420,20 L1420,60 M1420,20 L1380,20" stroke="#FFB800" strokeWidth="2" opacity="0.08" fill="none" strokeLinecap="square" />
        {/* Bottom-left */}
        <path d="M20,880 L20,840 M20,880 L60,880" stroke="#FFB800" strokeWidth="2" opacity="0.08" fill="none" strokeLinecap="square" />
        {/* Bottom-right */}
        <path d="M1420,880 L1420,840 M1420,880 L1380,880" stroke="#FFB800" strokeWidth="2" opacity="0.08" fill="none" strokeLinecap="square" />

        {/* Mid-left bracket */}
        <path d="M12,380 L12,520 M12,380 L36,380 M12,520 L36,520" stroke="#C084FC" strokeWidth="1.5" opacity="0.06" fill="none" strokeLinecap="square" />
        {/* Mid-right bracket */}
        <path d="M1428,340 L1428,480 M1428,340 L1404,340 M1428,480 L1404,480" stroke="#60A5FA" strokeWidth="1.5" opacity="0.06" fill="none" strokeLinecap="square" />

        {/* ── Diagonal speed lines ── */}
        <line x1="1300" y1="0"   x2="1440" y2="180" stroke="#FFB800" strokeWidth="1" opacity="0.04" />
        <line x1="1320" y1="0"   x2="1440" y2="155" stroke="#FFB800" strokeWidth="0.5" opacity="0.03" />
        <line x1="0"    y1="650" x2="130"  y2="900" stroke="#C084FC" strokeWidth="1" opacity="0.04" />
        <line x1="0"    y1="680" x2="110"  y2="900" stroke="#C084FC" strokeWidth="0.5" opacity="0.03" />

        {/* ── Cross/tag marks ── */}
        <line x1="430" y1="180" x2="460" y2="180" stroke="#22C55E" strokeWidth="1.5" opacity="0.07" />
        <line x1="445" y1="165" x2="445" y2="195" stroke="#22C55E" strokeWidth="1.5" opacity="0.07" />

        <line x1="1000" y1="680" x2="1028" y2="680" stroke="#FBBF24" strokeWidth="1.5" opacity="0.06" />
        <line x1="1014" y1="666" x2="1014" y2="694" stroke="#FBBF24" strokeWidth="1.5" opacity="0.06" />

        <line x1="680" y1="350" x2="706" y2="350" stroke="#60A5FA" strokeWidth="1" opacity="0.05" />
        <line x1="693" y1="337" x2="693" y2="363" stroke="#60A5FA" strokeWidth="1" opacity="0.05" />

        {/* ── Drip marks ── */}
        <path
          d="M118,272 Q120,300 116,330 Q114,355 118,375 Q120,385 118,400"
          stroke="#FFB800" strokeWidth="2" fill="none" opacity="0.045"
          filter="url(#drip-blur)"
          strokeLinecap="round"
        />
        <ellipse cx="118" cy="404" rx="3" ry="5" fill="#FFB800" opacity="0.045" filter="url(#drip-blur)" />

        <path
          d="M1315,192 Q1318,218 1312,248 Q1310,265 1314,280"
          stroke="#C084FC" strokeWidth="1.5" fill="none" opacity="0.040"
          filter="url(#drip-blur)"
          strokeLinecap="round"
        />
        <ellipse cx="1314" cy="284" rx="2.5" ry="4" fill="#C084FC" opacity="0.040" filter="url(#drip-blur)" />

        <path
          d="M724,858 Q726,872 722,886"
          stroke="#22C55E" strokeWidth="2" fill="none" opacity="0.038"
          filter="url(#drip-blur)"
          strokeLinecap="round"
        />
        <ellipse cx="722" cy="889" rx="2" ry="3.5" fill="#22C55E" opacity="0.038" filter="url(#drip-blur)" />

        {/* ── Particle clusters ── */}
        {/* Top-right cluster */}
        <circle cx="1390" cy="80"  r="1.5" fill="#FFB800" opacity="0.10" />
        <circle cx="1400" cy="92"  r="1"   fill="#FFB800" opacity="0.08" />
        <circle cx="1378" cy="95"  r="1"   fill="#FFB800" opacity="0.06" />
        <circle cx="1408" cy="72"  r="0.8" fill="#FFB800" opacity="0.07" />
        <circle cx="1370" cy="75"  r="1.2" fill="#FFB800" opacity="0.05" />

        {/* Bottom-left cluster */}
        <circle cx="48"  cy="848" r="1.5" fill="#C084FC" opacity="0.10" />
        <circle cx="60"  cy="858" r="1"   fill="#C084FC" opacity="0.08" />
        <circle cx="36"  cy="860" r="1"   fill="#C084FC" opacity="0.06" />
        <circle cx="68"  cy="840" r="0.8" fill="#C084FC" opacity="0.07" />
        <circle cx="30"  cy="840" r="1.2" fill="#C084FC" opacity="0.05" />

        {/* Mid-page scatter */}
        <circle cx="480" cy="520" r="1"   fill="#FBBF24" opacity="0.09" />
        <circle cx="494" cy="530" r="0.8" fill="#FBBF24" opacity="0.07" />
        <circle cx="468" cy="528" r="1.2" fill="#FBBF24" opacity="0.06" />

        <circle cx="950" cy="300" r="1"   fill="#4ADE80" opacity="0.08" />
        <circle cx="962" cy="310" r="0.8" fill="#4ADE80" opacity="0.06" />
        <circle cx="940" cy="312" r="1.2" fill="#4ADE80" opacity="0.07" />
      </svg>
    </div>
  )
}
