import { useId } from 'react'
import type { Product } from '../domain/catalog'

export function Bracelet({ product, length = 17.5 }: { product: Product; length?: number }) {
  const id = useId().replaceAll(':', '')
  const count = Math.round(product.beadCount + (length - 17.5) * 1.5)
  return (
    <svg
      viewBox="0 0 420 280"
      className="bracelet-preview"
      role="img"
      aria-label={`${product.name} ${length}cm 구성·간격 예시`}
    >
      <defs>
        {product.colors.map((color, i) => (
          <radialGradient key={i} id={`${id}-bead-${i}`} cx="32%" cy="23%" r="80%">
            <stop stopColor="#ffffff" stopOpacity={product.code === 'industry' ? 0.8 : 0.32} />
            <stop offset="0.28" stopColor={color} />
            <stop offset="0.8" stopColor={color} />
            <stop offset="1" stopColor="#211e18" stopOpacity="0.85" />
          </radialGradient>
        ))}
        <linearGradient id={`${id}-brass`}>
          <stop stopColor="#67532e" />
          <stop offset="0.45" stopColor="#d2b573" />
          <stop offset="1" stopColor="#705630" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="1" dy="6" stdDeviation="3" floodColor="#302b22" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <ellipse
          cx="210"
          cy="135"
          rx="125"
          ry="79"
          fill="none"
          stroke={product.cord}
          strokeWidth="5"
        />
        {Array.from({ length: count }, (_, i) => {
          const angle = (((i / count) * 300 - 240) * Math.PI) / 180
          const x = 210 + 125 * Math.cos(angle),
            y = 135 + 79 * Math.sin(angle)
          const radius = product.code === 'industry' ? 10 : product.code === 'fragment' ? 13 : 12
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI + 90})`}>
              {product.code === 'fragment' && i % 4 === 0 ? (
                <rect
                  x={-radius}
                  y={-radius + 2}
                  width={radius * 2}
                  height={radius * 2 - 4}
                  rx="6"
                  fill={`url(#${id}-bead-${i % 6})`}
                />
              ) : (
                <circle r={radius} fill={`url(#${id}-bead-${i % 6})`} />
              )}
              {i % 3 === 0 && (
                <path
                  d="M-7 -4 Q-3 2 6 -1 M-4 5 L4 3"
                  fill="none"
                  stroke={product.code === 'earth' ? '#d8bb8e' : '#fff'}
                  strokeWidth="0.7"
                  opacity="0.3"
                />
              )}
              {i % 5 === 0 && (
                <rect
                  x={radius + 1}
                  y="-7"
                  width="3"
                  height="14"
                  rx="1"
                  fill={`url(#${id}-brass)`}
                />
              )}
            </g>
          )
        })}
        <g transform="translate(210 211)">
          <path
            d="M-41 0 C-25 -21 -19 19 -7 -2 S18 -24 31 0 S10 22 -5 4 S-32 -18 -41 0"
            fill="none"
            stroke={product.cord}
            strokeWidth="9"
          />
          <path
            d="M-41 -1 C-25 -22 -19 18 -7 -3 S18 -25 31 -1 S10 21 -5 3 S-32 -19 -41 -1"
            fill="none"
            stroke="#b2a389"
            strokeWidth="1.5"
            opacity="0.65"
            strokeDasharray="2 2"
          />
          <circle cx="-43" r="9" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="5" />
          <circle cx="39" r="9" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="5" />
        </g>
      </g>
      <path d="M86 257 H334 M86 252 V262 M334 252 V262" stroke="#7e8171" strokeWidth="1" />
      <text x="210" y="276" textAnchor="middle" fill="#59604f" fontSize="11" letterSpacing="2">
        {length.toFixed(1)} CM · COMPOSITION PREVIEW
      </text>
    </svg>
  )
}
