'use client'

import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { ArrowRight } from './icons'
import { Container } from './ui'

type NavItem = { label: string; href: string }

const navItems: NavItem[] = [
  { label: 'mission', href: '/#mission' },
  { label: 'projects', href: '/projects' },
  { label: 'journal', href: '/journal' },
  { label: 'members', href: '/members' },
  { label: 'partners', href: '/#partners' },
  { label: 'contact', href: '/contact' },
]

/**
 * Renders inside a <Link>, so it can read that link's pending state. With
 * Partial Prefetching a click lands on the destination's App Shell straight
 * away, so this only appears when a navigation genuinely has to wait — which is
 * exactly when the user deserves to be told.
 */
function PendingUnderline() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-0 -bottom-1 h-px origin-left bg-argo-yellow transition-transform duration-200 ${
        pending ? 'scale-x-100' : 'scale-x-0'
      }`}
    />
  )
}

function NavAnchor({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem
  isActive: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`relative transition-colors hover:text-bone ${
        isActive ? 'text-bone' : 'text-[#a7aaa4]'
      }`}
    >
      {item.label}
      <PendingUnderline />
    </Link>
  )
}

/**
 * The only part of the header that reads the route. Every hook that resolves the
 * current URL (usePathname, useParams, useSelectedLayoutSegment) suspends while
 * Next.js prerenders the App Shell for a route with dynamic params — the shell
 * is shared across every /projects/[slug], so the pathname isn't known yet.
 *
 * Keeping the read in this leaf, behind its own boundary, means the header still
 * lands in the shell; only the active marker fills in after navigation.
 */
function ActiveNavAnchor({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname()
  const isRoute = !item.href.includes('#')
  const isActive = isRoute && (pathname === item.href || pathname.startsWith(`${item.href}/`))

  return <NavAnchor item={item} isActive={isActive} onNavigate={onNavigate} />
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavAnchor item={item} isActive={false} onNavigate={onNavigate} />}>
      <ActiveNavAnchor item={item} onNavigate={onNavigate} />
    </Suspense>
  )
}

/**
 * Cache Components keeps routes mounted with React's <Activity> instead of
 * unmounting them, so an open panel survives a navigation and has to be closed
 * deliberately. Renders nothing, so suspending here costs the shell nothing.
 */
function CloseOnRouteChange({ onRouteChange }: { onRouteChange: () => void }) {
  const pathname = usePathname()
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    onRouteChange()
  }, [pathname, onRouteChange])

  return null
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const toggleRef = useRef<HTMLButtonElement>(null)

  /**
   * Escape closes the panel and returns focus to the button that opened it —
   * without the second half, focus would be left on a control inside a panel
   * that is now `visibility: hidden`, which strands a keyboard user at the top
   * of the document with no idea where they are.
   */
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  /**
   * Holds the page still behind the open panel. Restores the previous inline
   * value rather than clearing it, so this composes with anything else that
   * touches body overflow instead of stomping it, and the effect only runs
   * while open so the closed state costs nothing.
   */
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <header className="relative z-20">
      <Suspense fallback={null}>
        <CloseOnRouteChange onRouteChange={close} />
      </Suspense>

      {/**
       * Dims the page behind the open panel, and closes on tap — a scrim you
       * cannot dismiss by tapping is a trap.
       *
       * `-z-10` keeps it inside the header's own stacking context, so it covers
       * the page but stays under the header bar and panel. The bar's background
       * therefore has to live on the Container below rather than on <header>:
       * an element's own background paints *beneath* its negative-z children,
       * so a background here would sit under the scrim and be dimmed with the
       * rest of the page — the opposite of matching the panel.
       */}
      <div
        aria-hidden={!open}
        onClick={close}
        className={`fixed inset-0 -z-10 bg-ink/80 transition-opacity duration-200 ease-out lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <Container
        className={`relative flex items-center justify-between py-[26px] transition-colors duration-200 ease-out ${
          open ? 'bg-ink-raised lg:bg-transparent' : 'bg-transparent'
        }`}
      >
        <Link href="/" aria-label="Argo — home" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/argo-lockup-white.svg" alt="Argo Robotics" className="h-8 w-auto md:h-10" />
        </Link>

        <nav className="hidden items-center gap-[34px] font-mono text-[13px] lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-argo-yellow px-[18px] py-[11px] font-bold text-ink transition-[background-color,transform] duration-[160ms] ease-out hover:bg-[#e6a500] active:scale-[.98]"
          >
            get involved
            <ArrowRight />
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex h-10 w-10 items-center justify-center border border-white/[.16] transition-transform duration-[160ms] ease-out active:scale-[.96] lg:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {/* Both marks are stacked on the same 24×24 centre and cross-faded, so
              the swap has a middle rather than being one frame wide. */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <g
              className={`origin-center transition-[opacity,transform] duration-200 ease-out motion-reduce:rotate-0 ${
                open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
              }`}
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </g>
            <g
              className={`origin-center transition-[opacity,transform] duration-200 ease-out motion-reduce:rotate-0 ${
                open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
              }`}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </g>
          </svg>
        </button>
      </Container>

      {/**
       * Stays mounted so it has a state to animate from, and overlays the page
       * from `top-full` rather than sitting in flow — in flow, opening it shoved
       * everything below down in a single frame, which is the jump the fade was
       * meant to smooth in the first place. See `.argo-mobile-nav`.
       */}
      <nav
        id="mobile-nav"
        data-open={open ? '' : undefined}
        className="argo-mobile-nav absolute inset-x-0 top-full border-t border-white/[.09] bg-ink-raised lg:hidden"
      >
        <Container className="flex flex-col gap-5 py-6 font-mono text-sm">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={close} />
          ))}
          <Link
            href="/contact"
            onClick={close}
            className="inline-flex w-fit items-center gap-2 bg-argo-yellow px-[18px] py-[11px] font-bold text-ink transition-transform duration-[160ms] ease-out active:scale-[.98]"
          >
            get involved
            <ArrowRight />
          </Link>
        </Container>
      </nav>
    </header>
  )
}
