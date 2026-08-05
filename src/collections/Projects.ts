import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { PROJECTS_TAG } from '../lib/cache-tags'
import { revalidateHooks } from '../lib/revalidate'

/** Mirrors the `Project` type in src/lib/content-types.ts. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'cycle', 'updatedAt'],
  },
  versions: { drafts: true },
  hooks: revalidateHooks(PROJECTS_TAG),
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Shipped', value: 'shipped' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'cycle',
          type: 'text',
          required: true,
          admin: { description: 'Full cycle, e.g. 2025–2026.', width: '50%' },
        },
        {
          name: 'cycleShort',
          type: 'text',
          required: true,
          admin: { description: 'Card chrome, e.g. 25–26.', width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'target',
          type: 'text',
          admin: { description: 'Competition or milestone, e.g. ERC 2026.', width: '50%' },
        },
        {
          name: 'domain',
          type: 'text',
          required: true,
          admin: { description: 'rover · rocket · avionics · uav · outreach', width: '50%' },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: { description: 'One-paragraph blurb used on cards.' },
    },
    {
      name: 'lede',
      type: 'textarea',
      required: true,
      admin: { description: 'Lead paragraph under the project title.' },
    },
    {
      name: 'body',
      type: 'array',
      labels: { singular: 'Paragraph', plural: 'Paragraphs' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'subsystems',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'summary', type: 'text', required: true },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      admin: { position: 'sidebar' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'heroCaption',
      type: 'text',
      admin: { description: 'Shown in the hatch placeholder until a hero image is uploaded.' },
    },
  ],
}
