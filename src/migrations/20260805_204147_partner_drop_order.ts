import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`partners\` DROP COLUMN \`order\`;`)
  await db.run(sql`ALTER TABLE \`partner_tiers\` DROP COLUMN \`order\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`partners\` ADD \`order\` numeric DEFAULT 0 NOT NULL;`)
  await db.run(sql`ALTER TABLE \`partner_tiers\` ADD \`order\` numeric DEFAULT 0 NOT NULL;`)
}
