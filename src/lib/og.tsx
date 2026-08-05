import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'

/**
 * The social card. There was no `og:image` at all before, which is the single
 * biggest gap when a link gets pasted into Slack, Discord or X — those unfurl
 * into a bare grey box without one.
 *
 * Rendered in the home page's language: the ink field under its top veil and
 * the yellow dawn the footer rises out of, the hero's mono headline, and the
 * lockup signing off in the corner. Inline styles and flex only — this is
 * satori, not a browser.
 */

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const ink = '#08090b'
const inkRaised = '#0a0c10'
const inkHaze = '#161b26'
const bone = '#f4f5f2'
const yellow = '#ffb700'
const muted = '#9a9e97'
const dim = '#6b6f6a'

const assetPath = (...segments: string[]) => path.join(process.cwd(), ...segments)

/**
 * Satori needs the actual font bytes, and it cannot read woff2 — which is all
 * `next/font` emits. So the two weights the card uses are vendored as TTF
 * alongside it rather than pulled from the Google mirror at build time.
 */
async function headlineFonts() {
  const [regular, extraBold] = await Promise.all([
    readFile(assetPath('src/assets/fonts/JetBrainsMono-Regular.ttf')),
    readFile(assetPath('src/assets/fonts/JetBrainsMono-ExtraBold.ttf')),
  ])

  return [
    { name: 'JetBrains Mono', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: extraBold, weight: 800 as const, style: 'normal' as const },
  ]
}

/** The lockup, inlined — satori resolves no network or filesystem URLs itself. */
async function lockupDataUri() {
  const svg = await readFile(assetPath('public/assets/argo-lockup-white.svg'))
  return `data:image/svg+xml;base64,${svg.toString('base64')}`
}

export async function ogCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string
  title: string
  footer: string
}) {
  const [fonts, lockup] = await Promise.all([headlineFonts(), lockupDataUri()])

  /* The hero sets its full stop in brand yellow. Split it off so the card can
     do the same, and so a title without one simply renders unchanged. */
  const stop = title.endsWith('.')
  const words = (stop ? title.slice(0, -1) : title).split(' ')

  const fontSize = title.length > 46 ? 62 : 76
  /* Satori lays every child of a flex row out as its own item, so a coloured
     `<span>` inside the headline would be flung to the end of the line instead
     of following the last letter. The headline is emitted word by word instead,
     wrapping on `flexWrap`, with the space reproduced as a margin — exact,
     because JetBrains Mono advances every glyph by 0.6em. */
  const space = fontSize * 0.6

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          backgroundColor: ink,
          padding: '72px 80px',
          fontFamily: 'JetBrains Mono',
        }}
      >
        {/* `argo-veil`: the glow the page opens with. Two stacked layers rather
            than one multi-stop background, which satori renders unevenly. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            backgroundImage: `linear-gradient(180deg, ${inkRaised} 0%, ${ink} 100%)`,
          }}
        />
        {/* The veil's glow is a radial in CSS; satori renders radials in visible
            concentric bands on a field this dark, so it is flattened to the
            vertical falloff, which is the part that actually reads at this size. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 420,
            display: 'flex',
            backgroundImage: `linear-gradient(180deg, ${inkHaze} 0%, rgba(12,14,20,0) 100%)`,
            opacity: 0.85,
          }}
        />
        {/* `argo-dawn`: the yellow rising out of the bottom edge. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 300,
            display: 'flex',
            backgroundImage:
              'linear-gradient(0deg, rgba(255,183,0,0.20) 0%, rgba(255,183,0,0.08) 26%, rgba(255,183,0,0) 62%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'relative',
            fontSize: 22,
            letterSpacing: 5,
            color: muted,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            position: 'relative',
            fontSize,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: -2,
            color: bone,
            maxWidth: 1000,
          }}
        >
          {words.map((word, index) => (
            <div
              key={`${word}-${index}`}
              style={{
                display: 'flex',
                marginRight: index === words.length - 1 ? 0 : space,
              }}
            >
              {word}
            </div>
          ))}
          {stop && <div style={{ display: 'flex', color: yellow }}>.</div>}
        </div>

        <div
          style={{
            display: 'flex',
            position: 'relative',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 24,
            color: dim,
          }}
        >
          <div style={{ display: 'flex', paddingBottom: 6 }}>{footer}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lockup} alt="Argo" height={54} />
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  )
}
