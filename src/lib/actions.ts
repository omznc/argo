'use server'

import { getContactForm } from './content'
import type { FormField } from './content-types'
import { type ContactFormState, HONEYPOT_FIELD } from './form'
import { payloadClient } from './payload'

/** RFC-shaped enough to catch a typo without rejecting a valid address. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function labelFor(field: Extract<FormField, { name: string }>): string {
  return field.label || field.name
}

/**
 * Receives the contact form.
 *
 * The form's definition is re-read from the Settings global rather than taken
 * from the request, so what gets validated is always the form the site
 * actually renders — a submission can't name a different form, or a field the
 * form doesn't have. (If the site ever grows a second form, this is the line
 * that has to start accepting an id and checking it against the configured
 * ones, rather than trusting it.)
 *
 * Reaching Payload through the Local API is also what makes the access rule in
 * payload.config.ts work: `create` is closed on form-submissions, so this
 * function is the only way in, and the checks below can't be skipped by POSTing
 * straight at the REST endpoint.
 */
export async function submitContactForm(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const form = await getContactForm()
  if (!form) {
    return { status: 'error', message: 'This form is not accepting messages right now.' }
  }

  // A filled honeypot is reported back as success. Telling a bot it failed just
  // tells it what to fix.
  if (String(formData.get(HONEYPOT_FIELD) ?? '').trim() !== '') {
    return { status: 'success' }
  }

  const errors: Record<string, string> = {}
  const submissionData: { field: string; value: string }[] = []

  for (const field of form.fields) {
    if (field.blockType === 'message') continue

    const raw = formData.get(field.name)

    if (field.blockType === 'checkbox') {
      const checked = raw !== null
      if (field.required && !checked) {
        errors[field.name] = `${labelFor(field)} is required.`
        continue
      }
      // Payload requires a value on every submission row, so an unticked
      // optional box is omitted rather than stored as an empty string.
      if (checked) submissionData.push({ field: field.name, value: 'true' })
      continue
    }

    const value = typeof raw === 'string' ? raw.trim() : ''

    if (!value) {
      if (field.required) errors[field.name] = `${labelFor(field)} is required.`
      continue
    }

    if (field.blockType === 'email' && !EMAIL.test(value)) {
      errors[field.name] = 'Enter a valid email address.'
      continue
    }

    if (field.blockType === 'select' && !field.options.some((option) => option.value === value)) {
      errors[field.name] = `Choose one of the listed options.`
      continue
    }

    submissionData.push({ field: field.name, value })
  }

  if (Object.keys(errors).length > 0) return { status: 'error', errors }

  try {
    const payload = await payloadClient()
    await payload.create({
      collection: 'form-submissions',
      data: { form: Number(form.id), submissionData },
    })
  } catch (error) {
    // The submission is lost either way; what matters is that the sender is
    // told so, rather than shown a confirmation for a message nobody received.
    const payload = await payloadClient()
    payload.logger.error({ err: error }, 'Contact form submission failed')
    return {
      status: 'error',
      message: 'Something went wrong sending that. Please email us instead.',
    }
  }

  return { status: 'success' }
}
