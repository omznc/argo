import type { Field } from 'payload'

/** Lowercases and dash-joins a title into a URL-safe slug. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Slug field that fills itself from `sourceField` when left blank, so editors
 * only type a URL when they want to override it.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  // The beforeValidate hook below runs before required-field validation, so a
  // blank slug is filled from the title rather than rejected. Being required
  // is what lets the frontend types treat a slug as always present.
  required: true,
  admin: {
    position: 'sidebar',
    description: 'Leave blank to generate from the title.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = data?.[sourceField]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})
