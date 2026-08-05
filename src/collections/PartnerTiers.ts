import type { CollectionConfig } from 'payload'

import { PARTNERS_TAG } from '../lib/cache-tags'
import { revalidateFlatHooks } from '../lib/revalidate'

/**
 * The multipliers behind the tier size control. Stored as a key rather than the
 * number itself so the set stays a short, nameable list in the admin — an open
 * number field invites 1.07 and a wall that no longer lines up.
 */
export const TIER_SCALES = {
  small: 0.8,
  default: 1,
  large: 1.25,
  huge: 1.5,
} as const

export type TierScale = keyof typeof TIER_SCALES

/**
 * The rows of the partner wall — "Academic", "Silver team", "Supporters".
 *
 * A collection rather than a select on the partner, because sponsorship
 * packages get renamed and reordered between cycles, and a select's options
 * live in this file: renaming a tier would be a code change and a migration.
 *
 * `orderable` puts the wall's row order in the list view's drag handles. The
 * position lives in Payload's own `_order` key, so there is no order number to
 * keep in sync by hand.
 */
export const PartnerTiers: CollectionConfig = {
  slug: 'partner-tiers',
  labels: { singular: 'Partner tier', plural: 'Partner tiers' },
  access: { read: () => true },
  orderable: true,
  admin: {
    group: 'Partners',
    useAsTitle: 'label',
    defaultColumns: ['label', 'logoScale', 'minWidth'],
    description: 'Drag the rows to reorder the wall — the top row here is the top row on the site.',
  },
  defaultSort: '_order',
  hooks: revalidateFlatHooks(PARTNERS_TAG),
  fields: [
    { name: 'label', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'logoScale',
          type: 'select',
          required: true,
          defaultValue: 'default' satisfies TierScale,
          options: [
            { label: 'Small (80%)', value: 'small' },
            { label: 'Default (100%)', value: 'default' },
            { label: 'Large (125%)', value: 'large' },
            { label: 'Huge (150%)', value: 'huge' },
          ],
          admin: {
            description:
              'Scales every logo and plaque in this row. Use it to give a headline sponsor more presence without editing each logo.',
            width: '50%',
          },
        },
        {
          name: 'minWidth',
          type: 'number',
          required: true,
          defaultValue: 150,
          admin: {
            description:
              'Plaque minimum width in px, before the row scale. The academic row runs wider than the rest.',
            width: '50%',
          },
        },
      ],
    },
  ],
}
