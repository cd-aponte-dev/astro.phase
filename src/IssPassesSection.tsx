import { useMemo } from 'react'
import { computeUpcomingIssPasses } from './issPasses'
import { formatDate, formatTime } from './format'
import tleSnapshot from './data/iss-tle.json'
import type { Location } from './location'

interface IssPassesSectionProps {
  location: Location
  timeZone: string
}

export function IssPassesSection({ location, timeZone }: IssPassesSectionProps) {
  const passes = useMemo(
    () => computeUpcomingIssPasses(tleSnapshot, location, new Date()),
    [location],
  )

  return (
    <section className="iss-passes">
      <h2>ISS Passes</h2>

      {passes.length === 0 ? (
        <p className="hint">No ISS passes over the horizon in the next 5 days.</p>
      ) : (
        <ul className="iss-pass-list">
          {passes.map((pass) => (
            <li
              key={pass.rise.toISOString()}
              className={`iss-pass ${pass.visible ? 'visible' : 'not-visible'}`}
            >
              <div className="iss-pass-date">{formatDate(pass.rise, timeZone)}</div>
              <div className="iss-pass-times">
                <span>
                  <span className="label">Rise</span> {formatTime(pass.rise, timeZone)}
                </span>
                <span>
                  <span className="label">Max</span> {formatTime(pass.maxElevation, timeZone)} (
                  {Math.round(pass.maxElevationDegrees)}&deg;)
                </span>
                <span>
                  <span className="label">Set</span> {formatTime(pass.set, timeZone)}
                </span>
              </div>
              <div className="iss-pass-status">
                {pass.visible ? 'Visible' : `Not visible — ${pass.reason}`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
