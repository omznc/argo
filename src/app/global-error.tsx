'use client'

/**
 * The last resort. This replaces the root layout, so it has to draw its own
 * document — and it is reached when the root layout itself failed, which means
 * assuming nothing about what still works.
 *
 * Hence inline styles rather than Tailwind classes and the site's fonts: the
 * page whose job is to render when rendering broke should not depend on the
 * stylesheet or the font pipeline it is standing in for. The palette is the
 * site's, copied by value from globals.css — the two can drift, and that is the
 * cost of not importing anything here.
 *
 * `metadata` exports are not supported in a client component, so the title is
 * set with React's own `<title>`.
 *
 * Note this file sits at src/app rather than src/app/(frontend): a global error
 * has no route group, and it covers the Payload admin under (payload) too.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: '#08090b',
          color: '#f4f5f2',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <title>Something went wrong · Argo</title>

        <main style={{ width: '100%', maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: '#6b6f6a' }}>
            [ 500 ]
          </div>

          <h1
            style={{
              margin: '16px 0 0',
              fontSize: 'clamp(2rem, 6vw, 3.25rem)',
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Telemetry lost<span style={{ color: '#ffb700' }}>.</span>
          </h1>

          <p style={{ margin: '22px 0 0', fontSize: 18, lineHeight: 1.5, color: '#9a9e97' }}>
            The site failed to render. It is on our side, not yours.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36 }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                border: 0,
                cursor: 'pointer',
                background: '#ffb700',
                color: '#08090b',
                font: 'inherit',
                fontSize: 14,
                fontWeight: 700,
                padding: '14px 26px',
              }}
            >
              try again
            </button>
            {/* A plain anchor, not next/link: this is reached when the root
                layout failed to render, so the wanted behaviour is a full
                document load into a fresh tree — a soft navigation would carry
                the broken one along. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                border: '1px solid rgba(255,255,255,.18)',
                color: '#e6e7e4',
                textDecoration: 'none',
                fontSize: 14,
                padding: '14px 26px',
              }}
            >
              back to home
            </a>
          </div>

          {error.digest && (
            <p
              style={{
                margin: '40px 0 0',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12,
                color: '#4f5358',
              }}
            >
              reference: <span style={{ color: '#6b6f6a' }}>{error.digest}</span>
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
