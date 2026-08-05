import type { CollectionConfig } from 'payload'

import { PARTNERS_TAG } from '../lib/cache-tags'
import { revalidateFlatHooks } from '../lib/revalidate'

/**
 * The rows of the partner wall — "Academic", "Silver team", "Supporters".
 *
 * A collection rather than a select on the partner, because sponsorship
 * packages get renamed and reordered between cycles, and a select's options
 * live in this file: renaming a tier would be a code change and a migration.
 */
export const PartnerTiers: CollectionConfig = {
  slug: 'partner-tiers',
  labels: { singular: 'Partner tier', plural: 'Partner tiers' },
  access: { read: () => true },
  admin: {
    group: 'Partners',
    useAsTitle: 'label',
    defaultColumns: ['label', 'order', 'minWidth'],
  },
  defaultSort: 'order',
  hooks: revalidateFlatHooks(PARTNERS_TAG),
  fields: [
    { name: 'label', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'order',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: { description: 'Low numbers sit at the top of the wall.', width: '50%' },
        },
        {
          name: 'minWidth',
          type: 'number',
          required: true,
          defaultValue: 120,
          admin: {
            description: 'Plaque minimum width in px. The academic row runs wider than the rest.',
            width: '50%',
          },
        },
      ],
    },
  ],
}
