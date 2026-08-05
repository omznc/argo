import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { generateNKeysBetween } from 'payload/shared'

/**
 * The wall grew 25%: every stored cap and plaque width is scaled by this once,
 * so the sizes an editor sees in the admin stay the sizes that render.
 */
const GROWTH = 1.25

/**
 * Hands out the fractional-index keys Payload's `orderable` collections sort
 * on, in the order the ids arrive — the same keys its own hook would have
 * written, so a later drag lands between them without a reshuffle.
 */
async function backfillOrder(
  db: MigrateUpArgs['db'],
  table: 'partners' | 'partner_tiers',
  ids: number[],
): Promise<void> {
  if (ids.length === 0) return

  const keys = generateNKeysBetween(null, null, ids.length)

  for (const [index, id] of ids.entries()) {
    await db.run(
      sql`UPDATE ${sql.identifier(table)} SET "_order" = ${keys[index]} WHERE "id" = ${id};`,
    )
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  /* Read the hand-kept order numbers before the tables are rebuilt without
     them — they are the only record of how the wall is currently stacked. */
  const tierRows = await db.all<{ id: number }>(
    sql`SELECT "id" FROM "partner_tiers" ORDER BY "order" ASC, "id" ASC;`,
  )
  const partnerRows = await db.all<{ id: number }>(
    sql`SELECT p."id" FROM "partners" p
        JOIN "partner_tiers" t ON t."id" = p."tier_id"
        ORDER BY t."order" ASC, p."order" ASC, p."id" ASC;`,
  )

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_partners\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`logo_id\` integer NOT NULL,
  	\`website\` text,
  	\`order\` numeric DEFAULT 0 NOT NULL,
  	\`tier_id\` integer NOT NULL,
  	\`active_until\` text,
  	\`max_height\` numeric DEFAULT 38 NOT NULL,
  	\`max_width\` numeric DEFAULT 163 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`partner_logos\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tier_id\`) REFERENCES \`partner_tiers\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  /* `_order` is selected as NULL rather than copied: the generator assumes the
     column already exists on the old table. It is filled in below. */
  await db.run(sql`INSERT INTO \`__new_partners\`("id", "_order", "name", "logo_id", "website", "order", "tier_id", "active_until", "max_height", "max_width", "updated_at", "created_at") SELECT "id", NULL, "name", "logo_id", "website", "order", "tier_id", "active_until", "max_height", "max_width", "updated_at", "created_at" FROM \`partners\`;`)
  await db.run(sql`DROP TABLE \`partners\`;`)
  await db.run(sql`ALTER TABLE \`__new_partners\` RENAME TO \`partners\`;`)
  /* The generator re-enables foreign keys here, between the two table rebuilds.
     Moved to the end: `partners.tier_id` references `partner_tiers`, so dropping
     that table below is a constraint violation while enforcement is on. */
  await db.run(sql`CREATE INDEX \`partners__order_idx\` ON \`partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`partners_logo_idx\` ON \`partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`partners_tier_idx\` ON \`partners\` (\`tier_id\`);`)
  await db.run(sql`CREATE INDEX \`partners_updated_at_idx\` ON \`partners\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`partners_created_at_idx\` ON \`partners\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_partner_tiers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`label\` text NOT NULL,
  	\`order\` numeric DEFAULT 0 NOT NULL,
  	\`logo_scale\` text DEFAULT 'default' NOT NULL,
  	\`min_width\` numeric DEFAULT 150 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  /* Same for `_order`, and every existing tier starts at the default scale —
     the wall looks exactly as it did before this migration ran. */
  await db.run(sql`INSERT INTO \`__new_partner_tiers\`("id", "_order", "label", "order", "logo_scale", "min_width", "updated_at", "created_at") SELECT "id", NULL, "label", "order", 'default', "min_width", "updated_at", "created_at" FROM \`partner_tiers\`;`)
  await db.run(sql`DROP TABLE \`partner_tiers\`;`)
  await db.run(sql`ALTER TABLE \`__new_partner_tiers\` RENAME TO \`partner_tiers\`;`)
  await db.run(sql`CREATE INDEX \`partner_tiers__order_idx\` ON \`partner_tiers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`partner_tiers_updated_at_idx\` ON \`partner_tiers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`partner_tiers_created_at_idx\` ON \`partner_tiers\` (\`created_at\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  await backfillOrder(
    db,
    'partner_tiers',
    tierRows.map((row) => row.id),
  )
  await backfillOrder(
    db,
    'partners',
    partnerRows.map((row) => row.id),
  )

  /* The 25% bump, applied to what is already on the wall. New rows get it from
     the field defaults, which moved by the same factor. */
  await db.run(
    sql`UPDATE "partners" SET "max_height" = ROUND("max_height" * ${GROWTH}), "max_width" = ROUND("max_width" * ${GROWTH});`,
  )
  await db.run(sql`UPDATE "partner_tiers" SET "min_width" = ROUND("min_width" * ${GROWTH});`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Shrink back first, while the columns still hold the grown values.
  await db.run(
    sql`UPDATE "partners" SET "max_height" = ROUND("max_height" / ${GROWTH}), "max_width" = ROUND("max_width" / ${GROWTH});`,
  )
  await db.run(sql`UPDATE "partner_tiers" SET "min_width" = ROUND("min_width" / ${GROWTH});`)

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_partners\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`logo_id\` integer NOT NULL,
  	\`website\` text,
  	\`tier_id\` integer NOT NULL,
  	\`order\` numeric DEFAULT 0 NOT NULL,
  	\`active_until\` text,
  	\`max_height\` numeric DEFAULT 30 NOT NULL,
  	\`max_width\` numeric DEFAULT 130 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`partner_logos\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tier_id\`) REFERENCES \`partner_tiers\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_partners\`("id", "name", "logo_id", "website", "tier_id", "order", "active_until", "max_height", "max_width", "updated_at", "created_at") SELECT "id", "name", "logo_id", "website", "tier_id", "order", "active_until", "max_height", "max_width", "updated_at", "created_at" FROM \`partners\`;`)
  await db.run(sql`DROP TABLE \`partners\`;`)
  await db.run(sql`ALTER TABLE \`__new_partners\` RENAME TO \`partners\`;`)
  // Re-enabled at the end, for the reason given in `up`.
  await db.run(sql`CREATE INDEX \`partners_logo_idx\` ON \`partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`partners_tier_idx\` ON \`partners\` (\`tier_id\`);`)
  await db.run(sql`CREATE INDEX \`partners_updated_at_idx\` ON \`partners\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`partners_created_at_idx\` ON \`partners\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_partner_tiers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`order\` numeric DEFAULT 0 NOT NULL,
  	\`min_width\` numeric DEFAULT 120 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_partner_tiers\`("id", "label", "order", "min_width", "updated_at", "created_at") SELECT "id", "label", "order", "min_width", "updated_at", "created_at" FROM \`partner_tiers\`;`)
  await db.run(sql`DROP TABLE \`partner_tiers\`;`)
  await db.run(sql`ALTER TABLE \`__new_partner_tiers\` RENAME TO \`partner_tiers\`;`)
  await db.run(sql`CREATE INDEX \`partner_tiers_updated_at_idx\` ON \`partner_tiers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`partner_tiers_created_at_idx\` ON \`partner_tiers\` (\`created_at\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
