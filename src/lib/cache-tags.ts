/**
 * Cache tag names, kept in their own module because both sides of the cache
 * need them: the server-only accessors in content.ts that tag their reads, and
 * the Payload collections that expire those tags on write. Collection config is
 * also loaded by the Payload CLI, which must not pull in `server-only` code.
 */
export const PROJECTS_TAG = 'projects'
export const POSTS_TAG = 'posts'
export const SETTINGS_TAG = 'settings'
/**
 * One tag for the whole partner wall. Tiers and partners are read together and
 * rendered together, so splitting them would mean two tags that always expire
 * at the same moment.
 */
export const PARTNERS_TAG = 'partners'
/** One tag for the members page, for the same reason as the partner wall. */
export const MEMBERS_TAG = 'members'
export const FORMS_TAG = 'forms'
