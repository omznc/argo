import type { CollectionConfig } from 'payload'

import { MEMBERS_TAG } from '../lib/cache-tags'
import { revalidateFlatHooks } from '../lib/revalidate'

/** Mirrors the `Member` type in src/lib/content-types.ts. */
export const Members: CollectionConfig = {
  slug: 'members',
  labels: { singular: 'Member', plural: 'Members' },
  access: { read: () => true },
  admin: {
    group: 'Members',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
  },
  defaultSort: 'order',
  hooks: revalidateFlatHooks(MEMBERS_TAG),
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: "Also the photo's alt text." },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'member-photos',
      // Not required: a team gains people faster than it gets everyone in front
      // of a camera, and the card falls back to an initials monogram. A member
      // held back from the page for want of a headshot is the worse outcome.
      admin: { description: 'Optional. Without one the card shows the initials.' },
    },
    {
      name: 'focus',
      type: 'text',
      admin: {
        description:
          'Optional short line under the name — what they work on, e.g. "suspension, wheel hubs". Not a job title: the role heading above the card is the title.',
      },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Links',
      admin: { description: 'Optional. A personal site, GitHub or LinkedIn.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { description: 'What the link says, e.g. GitHub.', width: '40%' },
            },
            { name: 'href', type: 'text', required: true, label: 'URL', admin: { width: '60%' } },
          ],
        },
      ],
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'member-roles',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Position within the role, low first.' },
    },
  ],
}
