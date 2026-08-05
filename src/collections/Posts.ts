import {
  BlocksFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { POSTS_TAG } from '../lib/cache-tags'
import { estimateReadingMinutes } from '../lib/reading-time'
import { revalidateHooks } from '../lib/revalidate'

/** Mirrors the `Post` type in src/lib/content-types.ts. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Journal post', plural: 'Journal' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
  },
  versions: { drafts: true },
  hooks: revalidateHooks(POSTS_TAG),
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'Engineering',
      options: ['Engineering', 'Team', 'Outreach', 'Competition'].map((value) => ({
        label: value,
        value,
      })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      defaultValue: 'Argo',
      admin: { description: 'Byline — a team name is fine.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'readingMinutes',
      type: 'number',
      // Not `required`: nothing supplies it, so requiring it would only mean
      // every caller of `payload.create` has to pass a number that the hook
      // below immediately overwrites. `min` still validates what the hook computes.
      min: 1,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Estimated from the lede and body on every save.',
      },
      hooks: {
        /**
         * `beforeValidate` rather than `beforeChange`, so the `min` above
         * validates the computed number — a beforeChange hook lands after
         * validation has already run.
         *
         * An update can be partial (a PATCH of one field, an autosave), so the
         * text is taken from the incoming data where present and the stored
         * document otherwise. Reading only `data` would recompute a full-length
         * post down to one minute the first time someone edits its title.
         */
        beforeValidate: [
          ({ data, originalDoc }) =>
            estimateReadingMinutes(
              data?.lede ?? originalDoc?.lede,
              data?.content ?? originalDoc?.content,
            ),
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: { description: 'Shown on the journal index and in link previews.' },
    },
    {
      name: 'lede',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Opening paragraph, set larger than the body. Kept out of the rich text so it always renders as the lede.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          // The design uses `[ section ]` markers rather than a full heading
          // scale, so h2 is the only level the article template renders.
          HeadingFeature({ enabledHeadingSizes: ['h2'] }),
          BlocksFeature({ blocks: [] }),
        ],
      }),
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
    {
      name: 'tags',
      type: 'array',
      admin: { position: 'sidebar' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'relatedProject',
      type: 'relationship',
      relationTo: 'projects',
      admin: { position: 'sidebar' },
    },
  ],
}
