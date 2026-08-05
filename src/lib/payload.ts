import 'server-only'

import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * The Payload Local API — queries the database in-process, with no HTTP hop and
 * no auth round-trip, which is what makes it safe to call from a `use cache`
 * accessor during a prerender.
 *
 * `getPayload` memoises on the config, so this is a lookup after the first call
 * rather than a new connection per request.
 */
export const payloadClient = () => getPayload({ config })
