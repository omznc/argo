import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Portraits, kept apart from the editorial media library for the same reason
 * partner logos are: the derivatives Media generates are the wrong shape here.
 * Its `card` and `hero` sizes are 16:10 and 16:9 landscape crops, which take a
 * portrait and cut the head off. One square size instead, which is what the
 * grid renders.
 *
 * `focalPoint` matters more here than anywhere else on the site — a square crop
 * of a photo shot in portrait has to be told where the face is.
 *
 * No `alt` field: the member's name is the alt text, and it is already required
 * on the member document. Asking for it twice is asking for it to drift.
 *
 * No SVG in the accepted list, unlike the logo collection — a vector portrait
 * is a mistaken upload, not a photograph.
 */
export const MemberPhotos: CollectionConfig = {
  slug: 'member-photos',
  labels: { singular: 'Member photo', plural: 'Member photos' },
  access: { read: () => true },
  admin: { group: 'Members' },
  upload: {
    staticDir: process.env.MEDIA_DIR
      ? path.join(process.env.MEDIA_DIR, 'members')
      : path.resolve(dirname, '../../media/members'),
    imageSizes: [{ name: 'portrait', width: 640, height: 640, position: 'centre' }],
    focalPoint: true,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  fields: [],
}
