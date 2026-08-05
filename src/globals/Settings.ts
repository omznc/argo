import type { GlobalConfig } from 'payload'

import { SETTINGS_TAG } from '../lib/cache-tags'
import { revalidateGlobalHooks } from '../lib/revalidate'

/**
 * Site-wide identity: the strings that appear in the footer, the page metadata
 * and the Organization/WebSite JSON-LD.
 *
 * Deliberately not here: the canonical origin. `siteUrl` stays in src/lib/site.ts
 * reading from the environment, because it is a property of the deployment
 * rather than the content — a preview build has to be able to override it, and
 * an editor who could point canonicals at the wrong host would be one save away
 * from de-indexing the site.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
  access: { read: () => true },
  admin: { group: 'Configuration' },
  hooks: revalidateGlobalHooks(SETTINGS_TAG),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'siteName', type: 'text', required: true, defaultValue: 'Argo' },
            {
              name: 'alternateName',
              type: 'text',
              admin: {
                description:
                  'Longer form of the name, e.g. Argo Student Space Research Laboratory. Emitted as schema.org alternateName.',
              },
            },
            {
              name: 'metaTitle',
              type: 'text',
              admin: {
                description:
                  'The browser-tab title of the home page. Inner pages get "<page> · <site name>" automatically.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'One sentence. Used as the default meta description and in the site JSON-LD.',
              },
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              admin: { description: 'Shown large in the footer and emitted in the JSON-LD.' },
            },
            {
              name: 'contactNote',
              type: 'text',
              admin: {
                description:
                  'The line under the footer email, e.g. "Collaborate · sponsor · invite us for a talk."',
              },
            },
            {
              name: 'contactForm',
              type: 'relationship',
              relationTo: 'forms',
              admin: {
                description:
                  'Which built form the contact section renders. Leave empty and the footer shows the email address alone.',
              },
            },
          ],
        },
        {
          label: 'Organization',
          description:
            'Feeds the Organization JSON-LD — what a search engine reads to build the knowledge panel.',
          fields: [
            {
              name: 'foundingLocation',
              type: 'text',
              admin: { description: 'e.g. Belgrade, Serbia.' },
            },
            {
              name: 'parentOrganization',
              type: 'text',
              admin: { description: 'e.g. University of Belgrade.' },
            },
            {
              name: 'organizationLogo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  "Google's logo guidelines reject SVG, so this wants a raster mark on an opaque background. Falls back to /assets/argo-mark.jpg when empty.",
              },
            },
          ],
        },
        {
          label: 'Socials',
          fields: [
            {
              name: 'socials',
              type: 'array',
              label: 'Social profiles',
              admin: {
                description:
                  'One list, two readers: the footer renders the labels and the Organization JSON-LD emits the URLs as sameAs — which is how a search engine ties these profiles to the site.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      maxLength: 2,
                      admin: {
                        description: 'The one- or two-letter mark, e.g. IG.',
                        width: '30%',
                      },
                    },
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'Full name — what a screen reader announces.',
                        width: '70%',
                      },
                    },
                  ],
                },
                { name: 'href', type: 'text', required: true, label: 'Profile URL' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
