import type { CollectionConfig } from 'payload'

import { MEMBERS_TAG } from '../lib/cache-tags'
import { revalidateFlatHooks } from '../lib/revalidate'

/**
 * The bands of the members page — "Leadership", "Avionics", "Outreach".
 *
 * A collection rather than a select for the same reason partner tiers are one:
 * a team reorganises between cycles, and a select's options live in this file,
 * so renaming a role would be a code change and a migration. Here it is an edit.
 *
 * The role is also the only label a member carries. There is deliberately no
 * second per-person job title: two fields that both answer "what do they do"
 * drift, and the group heading already says it once.
 */
export const MemberRoles: CollectionConfig = {
  slug: 'member-roles',
  labels: { singular: 'Role', plural: 'Roles' },
  access: { read: () => true },
  admin: {
    group: 'Members',
    useAsTitle: 'label',
    defaultColumns: ['label', 'order'],
  },
  defaultSort: 'order',
  hooks: revalidateFlatHooks(MEMBERS_TAG),
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'e.g. Leadership, Avionics, Mechanical, Outreach.' },
    },
    {
      name: 'blurb',
      type: 'text',
      admin: {
        description: 'Optional one-liner beside the heading — what this group actually works on.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Low numbers sit at the top of the page.' },
    },
  ],
}
