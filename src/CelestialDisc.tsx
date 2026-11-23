import type { BodyKey } from './astronomy'

interface CelestialDiscProps {
  body: BodyKey
  /** Moon only, 0-100 */
  moonIlluminationPercent?: number
  /** Moon only, e.g. "Waxing Gibbous" — determines which side is lit */
  moonPhaseName?: string
}

const SIZE = 32
const CENTER = SIZE / 2
const RADIUS = SIZE / 2 - 1

const MOON_DARK = '#2b2b3c'
const MOON_LIT = '#ece6d6'

// Real approximate hues, per ticket.
const PLANET_COLORS: Record<Exclude<BodyKey, 'Moon'>, string> = {
  Mercury: '#9b9995',
  Venus: '#e6d2a0',
  Mars: '#b5502c',
  Jupiter: '#c9ad84',
  Saturn: '#e8d9a6',
}

/**
 * The classic two-arc SVG moon-phase path: a fixed r,r semicircle for the
 * limb (left or right, depending on waxing/waning) traced top to bottom,
 * then a variable rx,r terminator ellipse traced back bottom to top. rx
 * shrinks from r (new moon) to 0 (quarter — the terminator is a straight
 * line) and back to r (full moon).
 *
 * Because the terminator runs in the opposite direction to the limb, the
 * sweep that bulges it toward the lit side is the limb's sweep *flipped*.
 * Crescents take the flipped sweep, so the two arcs coincide at new moon and
 * enclose nothing. Gibbous moons take the limb's sweep, so the terminator
 * bulges away from the lit side and at full moon the arcs trace a circle.
 */
function moonLitPath(fraction: number, litRight: boolean): string {
  const f = Math.min(1, Math.max(0, fraction))
  const rx = RADIUS * Math.abs(1 - 2 * f)
  const limbSweep = litRight ? 1 : 0
  const terminatorSweep = f <= 0.5 ? 1 - limbSweep : limbSweep
  const top = `${CENTER} ${CENTER - RADIUS}`
  const bottom = `${CENTER} ${CENTER + RADIUS}`
  return `M ${top} A ${RADIUS} ${RADIUS} 0 0 ${limbSweep} ${bottom} A ${rx} ${RADIUS} 0 0 ${terminatorSweep} ${top}`
}

export function CelestialDisc({ body, moonIlluminationPercent, moonPhaseName }: CelestialDiscProps) {
  if (body !== 'Moon') {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="celestial-disc" aria-hidden="true">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={PLANET_COLORS[body]} />
      </svg>
    )
  }

  const fraction = (moonIlluminationPercent ?? 0) / 100
  const waning = moonPhaseName?.startsWith('Waning') || moonPhaseName === 'Last Quarter'

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="celestial-disc" aria-hidden="true">
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={MOON_DARK} />
      <path d={moonLitPath(fraction, !waning)} fill={MOON_LIT} />
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgba(0, 0, 0, 0.15)" />
    </svg>
  )
}
