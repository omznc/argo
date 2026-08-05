import Link from 'next/link'
import type { CSSProperties } from 'react'

import type { Project } from '@/lib/content-types'

import { StatusDot } from './ui'

/**
 * Per-card jitter for the hover aurora.
 *
 * Seeded off the slug rather than `Math.random()` because this renders on the
 * server: a random value would differ between the server and client passes and
 * trip a hydration mismatch. Same slug always lands on the same sky, which also
 * means a card looks like itself every visit.
 */
function auroraJitter(slug: string): CSSProperties {
  let seed = 2166136261
  for (let i = 0; i < slug.length; i += 1) {
    seed = Math.imul(seed ^ slug.charCodeAt(i), 16777619) >>> 0
  }

  // Distinct bit ranges per draw, so the six values do not move together.
  const draw = (n: number) => ((seed >>> (n * 4)) & 0xff) / 255

  const base = [19, 25, 31] // The coprime periods the page-level sky uses.

  return {
    // ±3s on each period. Kept coprime-ish so the composite still never repeats.
    '--argo-drift-1': `${(base[0] + draw(0) * 6 - 3).toFixed(2)}s`,
    '--argo-drift-2': `${(base[1] + draw(1) * 6 - 3).toFixed(2)}s`,
    '--argo-drift-3': `${(base[2] + draw(2) * 6 - 3).toFixed(2)}s`,
    // Negative — a phase offset into the cycle, not a delay before it starts.
    '--argo-phase-1': `${-(draw(3) * base[0]).toFixed(2)}s`,
    '--argo-phase-2': `${-(draw(4) * base[1]).toFixed(2)}s`,
    '--argo-phase-3': `${-(draw(5) * base[2]).toFixed(2)}s`,
    // Staggered entrances, held short enough to still feel like one gesture.
    '--argo-enter-1': `${Math.round(draw(6) * 40)}ms`,
    '--argo-enter-2': `${Math.round(40 + draw(7) * 60)}ms`,
    '--argo-enter-3': `${Math.round(90 + draw(0) * 70)}ms`,
    // Exits stagger the other way round, so it unravels rather than rewinding.
    '--argo-exit-1': `${Math.round(60 + draw(1) * 60)}ms`,
    '--argo-exit-2': `${Math.round(draw(2) * 50)}ms`,
    '--argo-exit-3': `${Math.round(30 + draw(3) * 60)}ms`,
  } as CSSProperties
}

/** Full card — used for active projects on the home page and the projects index. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative isolate flex flex-col overflow-hidden border border-white/10 bg-white/[.015] p-[26px] transition-colors hover:border-argo-yellow/40 hover:bg-white/[.03]"
    >
      {/* The site's aurora, at card scale. `isolate` on the card keeps the bands'
          screen blend inside this box instead of lifting the page behind it.
          Each curtain carries entrance/exit; the band inside carries the drift. */}
      <div aria-hidden="true" className="argo-aurora-card" style={auroraJitter(project.slug)}>
        <span className="argo-aurora-curtain argo-aurora-curtain-1">
          <span className="argo-aurora-band argo-aurora-band-1" />
        </span>
        <span className="argo-aurora-curtain argo-aurora-curtain-2">
          <span className="argo-aurora-band argo-aurora-band-2" />
        </span>
        <span className="argo-aurora-curtain argo-aurora-curtain-3">
          <span className="argo-aurora-band argo-aurora-band-3" />
        </span>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between font-mono text-xs">
          <StatusDot status={project.status} />
          <span className="text-faint">{project.cycleShort}</span>
        </div>
        <h3 className="mt-4 mb-[10px] font-display text-[23px] font-bold text-bone">
          {project.title}
        </h3>
        <p className="font-display text-[14.5px] leading-[1.55] text-muted">{project.excerpt}</p>
      </div>
    </Link>
  )
}

/** Compact card — the shipped-work strip beneath the active projects. */
export function ProjectChip({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="border border-white/[.07] px-[18px] py-4 transition-colors hover:border-white/25"
    >
      <div className="font-mono text-[11px] text-faint">✓ done · {project.cycleShort}</div>
      <div className="mt-1.5 font-display text-[15px] font-semibold text-[#cdd0ca]">
        {project.title}
      </div>
    </Link>
  )
}
