import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { ArrowRight } from './icons'

export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-6 md:px-11 ${className}`}>{children}</div>
  )
}

/** The `[ mission ]` markers that open each band of the page. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[13px] text-dim">[ {children} ]</div>
}

export function PrimaryLink({
  children,
  className = '',
  ...props
}: ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center gap-[9px] bg-argo-yellow px-[26px] py-[14px] text-sm font-bold text-ink transition-[background-color,transform] duration-[160ms] ease-out hover:bg-[#e6a500] active:scale-[.98] ${className}`}
    >
      {children}
      <ArrowRight />
    </Link>
  )
}

export function GhostLink({
  children,
  className = '',
  ...props
}: ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center border border-white/[.18] px-[26px] py-[14px] text-sm text-bone-soft transition-[border-color,transform] duration-[160ms] ease-out hover:border-white/40 active:scale-[.98] ${className}`}
    >
      {children}
    </Link>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="border border-white/[.14] px-[10px] py-[6px] font-mono text-xs text-[#a7aaa4]">
      {children}
    </span>
  )
}

/**
 * Stands in for imagery that has not been shot yet — the 45° hatch from the
 * design doc, with the intended subject spelled out.
 */
export function HatchPlaceholder({
  caption,
  className = '',
}: {
  caption: string
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={caption}
      className={`argo-hatch flex items-center justify-center border border-white/[.12] font-mono text-xs text-faint ${className}`}
    >
      {/* Braced so the literal reads as content, not a stray JS comment. */}
      {`// ${caption}`}
    </div>
  )
}

export function StatusDot({ status }: { status: 'active' | 'shipped' }) {
  return status === 'active' ? (
    <span className="font-mono text-xs text-argo-yellow">● active</span>
  ) : (
    <span className="font-mono text-xs text-faint">✓ done</span>
  )
}
