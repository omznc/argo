import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Uploads are served from under /api/, so the blanket API rule below
        // would otherwise keep every hero image out of image search. The
        // allow is listed first because the longer, more specific rule wins.
        allow: ['/', '/api/media/'],
        // The admin and the REST/GraphQL API are not content.
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
