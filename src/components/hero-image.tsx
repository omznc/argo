import Image from 'next/image'

import type { SiteImage } from '@/lib/content-types'

import { HatchPlaceholder } from './ui'

/**
 * The hero slot on a project or journal page.
 *
 * Falls back to the design's 45° hatch with the intended subject spelled out,
 * so a document without an upload still renders the frame as drawn rather than
 * collapsing the layout. `caption` doubles as the placeholder text and as the
 * alt text of last resort when a media document has no `alt` of its own.
 *
 * `sizes` matches the two widths the article column actually takes (the 848px
 * measure, full-bleed below it), so the browser never fetches the 1600px source
 * for a phone.
 */
export function HeroImage({
  image,
  caption,
  className = '',
}: {
  image?: SiteImage
  caption: string
  className?: string
}) {
  if (!image) return <HatchPlaceholder caption={caption} className={className} />

  return (
    <div className={`relative overflow-hidden border border-white/[.12] ${className}`}>
      <Image
        src={image.url}
        alt={image.alt || caption}
        fill
        sizes="(min-width: 848px) 848px, 100vw"
        className="object-cover"
        // The one image above the fold on these routes — worth the preload.
        priority
      />
    </div>
  )
}
