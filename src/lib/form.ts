/**
 * The pieces the contact form's action and its markup both need.
 *
 * Their own module because a `'use server'` file may only export async
 * functions — a constant declared next to the action would be a build error.
 */

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  /** Keyed by field name, rendered under the input it belongs to. */
  errors?: Record<string, string>
  /** A failure that isn't about one field — a missing form, a database error. */
  message?: string
}

export const initialContactFormState: ContactFormState = { status: 'idle' }

/**
 * The honeypot input's name. Rendered off-screen and hidden from assistive
 * tech, so a human never fills it in and an indiscriminate bot usually does.
 */
export const HONEYPOT_FIELD = '_hp_website'
