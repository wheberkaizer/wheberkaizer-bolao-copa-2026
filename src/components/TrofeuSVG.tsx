import React from 'react';

interface TrofeuSVGProps {
  className?: string;
  size?: number;
}

export function TrofeuSVG({ className = '', size = 120 }: TrofeuSVGProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`relative drop-shadow-[0_8px_16px_rgba(234,179,8,0.3)] ${className}`}
    >
      {/* Decorative Golden Aura/Background Glow */}
      <circle cx="60" cy="60" r="45" fill="url(#goldGlow)" opacity="0.15" />
      <circle cx="60" cy="65" r="35" fill="none" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      
      {/* Globe: Top sphere styled with elegant gold lat/long lines */}
      <circle cx="60" cy="30" r="16" fill="url(#goldGrad)" />
      {/* Earth details (continents/subtle shapes) */}
      <path
        d="M52 23C49 25 46.5 28 46 31C48 31.5 50 29.5 52 28C54 26.5 55 24 52 23ZM68 22C64.5 21 61.5 23 61 26C63 27.5 66 26.5 68 25C70 23.5 70 22.5 68 22Z"
        fill="#78350F"
        opacity="0.25"
      />
      <path
        d="M60 14C68.8366 14 76 21.1634 76 30C76 38.8366 68.8366 46 60 46"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      <path
        d="M60 14C51.1634 14 44 21.1634 44 30C44 38.8366 51.1634 46 60 46"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      
      {/* Decorative Ring across the globe */}
      <ellipse cx="60" cy="30" rx="16" ry="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

      {/* Two supporting spiral arms rising up to hold the globe */}
      <path
        d="M48 65C45 55 46 42 56 36C52 36 50 40 49 46C48 50 49 55 52 64C53 67 49 67 48 65Z"
        fill="url(#goldGradDark)"
      />
      <path
        d="M72 65C75 55 74 42 64 36C68 36 70 40 71 46C72 50 71 55 68 64C67 67 71 67 72 65Z"
        fill="url(#goldGradDark)"
      />

      {/* Main Body: Stylized abstract modern interpretation of the two players leaning backwards carrying the world */}
      <path
        d="M54 36C56 38 58 45 58 56C58 66 50 76 52 88C52 89 68 89 68 88C70 76 62 66 62 56C62 45 64 38 66 36C64 35 56 35 54 36Z"
        fill="url(#goldGrad)"
      />
      
      {/* Central Golden Core highlights */}
      <path
        d="M58 52C59 55 60 58 60 62C60 66 58 72 57 78H63C62 72 60 66 60 62C60 58 61 55 62 52H58Z"
        fill="url(#goldAccent)"
      />

      {/* Malachite Green Bands (Double green bands on base of real FIFA trophy) */}
      <rect x="42" y="88" width="36" height="4" rx="1" fill="#047857" />
      <rect x="40" y="96" width="40" height="4" rx="1" fill="#047857" />

      {/* Golden Base Blocks */}
      <path d="M44 84H76V88H44V84Z" fill="url(#goldGradDark)" />
      <path d="M42 92H78V96H42V92Z" fill="url(#goldGrad)" />
      <path d="M36 100H84V106H36V100Z" fill="url(#goldGradDark)" rx="2" />
      
      {/* Text '2026' engraved in gold base */}
      <text
        x="60"
        y="105"
        fill="#78350F"
        fontSize="5"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="1"
        fontFamily="sans-serif"
        opacity="0.8"
      >
        FIFA 2026
      </text>

      {/* Definitions for gorgeous gradients */}
      <defs>
        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" /> {/* yellow-300 */}
          <stop offset="30%" stopColor="#F59E0B" /> {/* amber-500 */}
          <stop offset="70%" stopColor="#D97706" /> {/* amber-600 */}
          <stop offset="100%" stopColor="#92400E" /> {/* amber-800 */}
        </linearGradient>

        <linearGradient id="goldGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF0" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}
