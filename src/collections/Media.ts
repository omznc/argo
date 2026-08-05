import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Uploads are written to the local filesystem, which is fine on a VPS or a
 * container with a volume and lossy anywhere with an ephemeral disk — on a
 * serverless host, every upload disappears on the next deploy. Moving to object
 * storage is one `@payloadcms/storage-*` adapter here and no other change.
 *
 * `staticDir` is stated rather than left to default so there is exactly one
 * path to mount a volume at. `MEDIA_DIR` is what docker-compose sets; locally
 * it falls back to `./media` at the repo root, which is already gitignored.
 *
 * Worth knowing when backing up: the file lives here and only a row pointing at
 * it lives in the database. Either one alone is useless.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../media'),
    imageSizes: [
      { name: 'card', width: 800, height: 500, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    focalPoint: true,
    // The admin is the only writer, but an accepted list is what keeps a
    // mistaken drag-and-drop of a 40 MB RAW file or a PDF out of the media
    // library — and out of sharp, which would try to process it.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers and search engines.' },
    },
    {
      name: 'credit',
      type: 'text',
    },
  ],
}
