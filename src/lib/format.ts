/**
 * Fixed locale and UTC so the string is identical on the server and the client
 * — otherwise a statically rendered date can hydrate differently per visitor.
 */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
