import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { MemberPhotos } from './collections/MemberPhotos'
import { MemberRoles } from './collections/MemberRoles'
import { Members } from './collections/Members'
import { PartnerLogos } from './collections/PartnerLogos'
import { Partners } from './collections/Partners'
import { PartnerTiers } from './collections/PartnerTiers'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { Settings } from './globals/Settings'
import { FORMS_TAG } from './lib/cache-tags'
import { revalidateFlatHooks } from './lib/revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: '· Argo' },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Icon#Icon',
      },
    },
  },
  collections: [
    Projects,
    Posts,
    Members,
    MemberRoles,
    MemberPhotos,
    Partners,
    PartnerTiers,
    PartnerLogos,
    Media,
    Users,
  ],
  globals: [Settings],
  editor: lexicalEditor(),
  plugins: [
    formBuilderPlugin({
      // Only the blocks a contact or sponsorship enquiry actually needs. The
      // rest are switched off rather than left on: every enabled block is a
      // field type the renderer in src/components/form.tsx has to handle, so an
      // editor adding one the site can't draw would be a broken page.
      fields: {
        checkbox: true,
        email: true,
        message: true,
        select: true,
        text: true,
        textarea: true,
        country: false,
        date: false,
        number: false,
        payment: false,
        state: false,
        upload: false,
      },
      formOverrides: {
        admin: { group: 'Forms' },
        hooks: revalidateFlatHooks(FORMS_TAG),
      },
      formSubmissionOverrides: {
        admin: { group: 'Forms' },
        access: {
          // The plugin ships `create: () => true`, which makes /api/form-submissions
          // a public write endpoint — anyone can POST past the honeypot and the
          // validation in the server action. Closing it leaves exactly one way
          // in: submitContactForm, which reaches Payload through the Local API
          // and so bypasses access control by design.
          create: () => false,
        },
      },
    }),
  ],
  // A 12 MB ceiling on any single upload. Payload's default is 4 GB, which is
  // an open door on a public admin and enough to fill the disk by accident;
  // 12 MB still clears a full-resolution photo off a team camera.
  upload: { limits: { fileSize: 12 * 1024 * 1024 } },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // SQLite keeps local setup to a single file. Swap in @payloadcms/db-postgres
  // when this goes somewhere with a real database.
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./argo.db' },
  }),
  sharp,
})
