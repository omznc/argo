'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Starts navigation on the first input event that commits to it — pointerdown
 * for a mouse, keydown for Enter — instead of waiting for the click. That
 * recovers the press-to-release interval, typically 70–150ms, on every link in
 * the site, on top of the App Shell the <Link> has already prefetched.
 *
 * Attached once at the document rather than per link, so it covers plain <a>
 * elements as well as <Link>.
 */
export function EagerNavigation() {
  const router = useRouter()

  useEffect(() => {
    let eagerHref: string | null = null

    const internalHref = (target: EventTarget | null): string | null => {
      const anchor = target instanceof Element ? target.closest('a') : null
      if (!(anchor instanceof HTMLAnchorElement)) return null
      if (anchor.target && anchor.target !== '_self') return null
      if (anchor.hasAttribute('download')) return null
      if (anchor.getAttribute('rel')?.includes('external')) return null
      if (anchor.origin !== window.location.origin) return null
      // Same-page hash links keep the browser's native scroll and history handling.
      if (anchor.hash && anchor.pathname === window.location.pathname) return null
      return anchor.href
    }

    // A modified click means open-in-new-tab, download, or select — never navigate.
    const unmodified = (event: KeyboardEvent | PointerEvent) =>
      !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

    const onPointerDown = (event: PointerEvent) => {
      // Mouse only. On touch, a press that turns into a scroll must not navigate,
      // and touch has no click delay left to win back anyway.
      if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary) return
      if (!unmodified(event)) return
      const href = internalHref(event.target)
      if (!href) return
      eagerHref = href
      router.push(href)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !unmodified(event)) return
      const href = internalHref(event.target)
      if (!href) return
      eagerHref = href
      router.push(href)
    }

    /**
     * The click still arrives afterwards and would navigate a second time,
     * pushing a duplicate history entry. Capture phase runs before next/link's
     * own handler, and preventDefault alone is enough: next/link bails on a
     * defaultPrevented event, while propagation continues so React onClick
     * handlers on the link itself still run.
     */
    const onClickCapture = (event: MouseEvent) => {
      if (eagerHref === null) return
      if (internalHref(event.target) === eagerHref) event.preventDefault()
      eagerHref = null
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('click', onClickCapture, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [router])

  return null
}
