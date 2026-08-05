import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`members_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`members\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`members_links_order_idx\` ON \`members_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`members_links_parent_id_idx\` ON \`members_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`members\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`photo_id\` integer,
  	\`focus\` text,
  	\`role_id\` integer NOT NULL,
  	\`order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`member_photos\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`role_id\`) REFERENCES \`member_roles\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`members_photo_idx\` ON \`members\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`members_role_idx\` ON \`members\` (\`role_id\`);`)
  await db.run(sql`CREATE INDEX \`members_updated_at_idx\` ON \`members\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`members_created_at_idx\` ON \`members\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`member_roles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`blurb\` text,
  	\`order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`member_roles_updated_at_idx\` ON \`member_roles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`member_roles_created_at_idx\` ON \`member_roles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`member_photos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_portrait_url\` text,
  	\`sizes_portrait_width\` numeric,
  	\`sizes_portrait_height\` numeric,
  	\`sizes_portrait_mime_type\` text,
  	\`sizes_portrait_filesize\` numeric,
  	\`sizes_portrait_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`member_photos_updated_at_idx\` ON \`member_photos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`member_photos_created_at_idx\` ON \`member_photos\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`member_photos_filename_idx\` ON \`member_photos\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`member_photos_sizes_portrait_sizes_portrait_filename_idx\` ON \`member_photos\` (\`sizes_portrait_filename\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`members_id\` integer REFERENCES members(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`member_roles_id\` integer REFERENCES member_roles(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`member_photos_id\` integer REFERENCES member_photos(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_members_id_idx\` ON \`payload_locked_documents_rels\` (\`members_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_member_roles_id_idx\` ON \`payload_locked_documents_rels\` (\`member_roles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_member_photos_id_idx\` ON \`payload_locked_documents_rels\` (\`member_photos_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`members_links\`;`)
  await db.run(sql`DROP TABLE \`members\`;`)
  await db.run(sql`DROP TABLE \`member_roles\`;`)
  await db.run(sql`DROP TABLE \`member_photos\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	\`posts_id\` integer,
  	\`partners_id\` integer,
  	\`partner_tiers_id\` integer,
  	\`partner_logos_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	\`forms_id\` integer,
  	\`form_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`partners_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`partner_tiers_id\`) REFERENCES \`partner_tiers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`partner_logos_id\`) REFERENCES \`partner_logos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forms_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "projects_id", "posts_id", "partners_id", "partner_tiers_id", "partner_logos_id", "media_id", "users_id", "forms_id", "form_submissions_id") SELECT "id", "order", "parent_id", "path", "projects_id", "posts_id", "partners_id", "partner_tiers_id", "partner_logos_id", "media_id", "users_id", "forms_id", "form_submissions_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_partners_id_idx\` ON \`payload_locked_documents_rels\` (\`partners_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_partner_tiers_id_idx\` ON \`payload_locked_documents_rels\` (\`partner_tiers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_partner_logos_id_idx\` ON \`payload_locked_documents_rels\` (\`partner_logos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`)
}
