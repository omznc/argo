'use client'

import { useEffect } from 'react'

import { Container, GhostLink } from '@/components/ui'

/**
 * The error boundary for every frontend route. It renders inside the layout, so
 * the header, footer and page chrome survive — a reader keeps their way out.
 *
 * It does *not* catch a failure in the layout above it or in the root layout
 * itself; those bubble to src/app/global-error.tsx, which has to redraw the
 * whole document because there is no layout left to render into.
 *
 * The site is prerendered from cached content, so reaching this page almost
 * always means the database was unreachable during a rebuild rather than a bug
 * on this route — which is exactly the kind of failure that passes. Hence
 * `retry()` rather than a plain link home: trying again is a genuine fix here,
 * not a placebo. It re-renders the segment on the server rather than reloading
 * the tab, so a successful retry costs no round trip through the shell.
 */
export default function FrontendError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // The server-side detail is stripped from `error` in production; this is
    // what makes the client half of the failure visible in the browser console.
    console.error(error)
  }, [error])

  return (
    <Container className="py-24 md:py-32">
      <div className="font-mono text-[13px] text-dim">[ 500 ]</div>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,62px)] leading-none font-extrabold tracking-[-0.03em] text-bone">
        Telemetry lost<span className="text-argo-yellow">.</span>
      </h1>
      <p className="mt-[22px] max-w-[600px] font-display text-lg leading-[1.5] text-muted">
        Something went wrong rendering this page. It is on our side, not yours — trying again is
        often enough.
      </p>

      <div className="mt-9 flex flex-wrap gap-[14px]">
        {/* A button rather than a link: this recovers the current page, and
            dressing it as navigation would misdescribe it. */}
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex items-center gap-[9px] bg-argo-yellow px-[26px] py-[14px] text-sm font-bold text-ink transition-[background-color,transform] duration-[160ms] ease-out hover:bg-[#e6a500] active:scale-[.98]"
        >
          try again
        </button>
        <GhostLink href="/">back to home</GhostLink>
      </div>

      {/* The one string that ties this page to a line in the server logs. Shown
          rather than hidden, so a reader reporting the fault can quote it. */}
      {error.digest && (
        <p className="mt-10 font-mono text-xs text-faint">
          reference: <span className="text-dim">{error.digest}</span>
        </p>
      )}
    </Container>
  )
}
