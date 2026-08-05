import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Partner logos live apart from the editorial media library, for two reasons.
 *
 * No `imageSizes`: a logo renders at 130px wide, so Payload's card and hero
 * derivatives would be pure waste — a 1600×900 upscale of a wordmark, written
 * to disk on every upload. (Payload already skips resizing for SVG, which most
 * of these are, but the raster marks would go through sharp.)
 *
 * No required `alt`: the partner's name is the alt text, and it is already a
 * required field on the partner document. Asking for it twice is asking for it
 * to drift.
 *
 * SVG is accepted here as it is in Media — Payload scans uploaded SVGs for
 * scripts and other active content, and rejects them if found.
 */
export const PartnerLogos: CollectionConfig = {
  slug: 'partner-logos',
  labels: { singular: 'Partner logo', plural: 'Partner logos' },
  access: { read: () => true },
  admin: { group: 'Partners' },
  upload: {
    staticDir: process.env.MEDIA_DIR
      ? path.join(process.env.MEDIA_DIR, 'partners')
      : path.resolve(dirname, '../../media/partners'),
    mimeTypes: ['image/svg+xml', 'image/png', 'image/webp', 'image/avif'],
  },
  fields: [],
}
