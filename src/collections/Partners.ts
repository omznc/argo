import type { CollectionConfig } from 'payload'

import { PARTNERS_TAG } from '../lib/cache-tags'
import { revalidateFlatHooks } from '../lib/revalidate'

/** Mirrors the `Partner` type in src/lib/content-types.ts. */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partner', plural: 'Partners' },
  access: { read: () => true },
  /* Same drag-to-reorder as the tiers. The list is ordered across the whole
     collection, not per tier, which is enough: the wall reads the partners of
     one tier at a time, so their relative order is what shows up. */
  orderable: true,
  admin: {
    group: 'Partners',
    useAsTitle: 'name',
    defaultColumns: ['name', 'tier', 'activeUntil'],
    description: 'Drag the rows to reorder logos within their tier.',
  },
  defaultSort: '_order',
  hooks: revalidateFlatHooks(PARTNERS_TAG),
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: "Also the logo's alt text." },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'partner-logos',
      required: true,
    },
    {
      name: 'website',
      type: 'text',
      admin: { description: 'Optional. Makes the plaque a link — worth having for a sponsor.' },
    },
    {
      name: 'tier',
      type: 'relationship',
      relationTo: 'partner-tiers',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'activeUntil',
      type: 'date',
      admin: {
        position: 'sidebar',
        description:
          'Optional. The wall stops rendering this partner after this date — sponsorships lapse and nobody remembers to come back and delete the logo.',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
      },
    },
    {
      type: 'collapsible',
      label: 'Optical sizing',
      admin: {
        description:
          'Per-logo caps, so a wordmark and a roundel sit at the same visual weight on the wall rather than the same pixel height.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'maxHeight',
              type: 'number',
              required: true,
              defaultValue: 38,
              admin: { description: 'px, before the tier scale', width: '50%' },
            },
            {
              name: 'maxWidth',
              type: 'number',
              required: true,
              defaultValue: 163,
              admin: { description: 'px, before the tier scale', width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}
