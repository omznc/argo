import { ImageResponse } from 'next/og'

/**
 * The social card. There was no `og:image` at all before, which is the single
 * biggest gap when a link gets pasted into Slack, Discord or X — those unfurl
 * into a bare grey box without one.
 *
 * Rendered in the design's language: ink field, hatch-free, one yellow rule and
 * the mono wordmark. Inline styles and flex only — this is satori, not a browser.
 */

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const ink = '#08090b'
const bone = '#f4f5f2'
const yellow = '#ffb700'
const dim = '#6b6f6a'

export function ogCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string
  title: string
  footer: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: ink,
          padding: '72px 80px',
          // The dawn gradient the footer rises out of, turned on its side.
          backgroundImage: `linear-gradient(140deg, ${ink} 45%, #161b26 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: yellow }} />
          <div style={{ fontSize: 24, letterSpacing: 6, color: '#9a9e97', textTransform: 'uppercase' }}>
            {eyebrow}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 96, height: 5, backgroundColor: yellow, marginBottom: 36 }} />
          <div
            style={{
              fontSize: title.length > 46 ? 66 : 82,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: bone,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 26,
            color: dim,
          }}
        >
          <div style={{ display: 'flex' }}>{footer}</div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: bone }}>argo</div>
        </div>
      </div>
    ),
    { ...ogSize },
  )
}
