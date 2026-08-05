'use client'

import type { ReactNode } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { submitContactForm } from '@/lib/actions'
import type { FormField } from '@/lib/content-types'
import { HONEYPOT_FIELD, initialContactFormState } from '@/lib/form'

/**
 * A field ready to render. `message` blocks are rich text, so the server has
 * already converted them to elements — that keeps the Lexical renderer out of
 * the client bundle for a form whose only interactive part is the submit.
 */
export type RenderedFormField =
  | Exclude<FormField, { blockType: 'message' }>
  | { blockType: 'message'; node: ReactNode }

const inputClass =
  'w-full border border-white/[.16] bg-transparent px-[14px] py-[11px] font-display text-[15px] text-bone outline-none transition-colors placeholder:text-faint focus:border-argo-yellow'

export function ContactFormFields({
  fields,
  submitLabel,
  confirmation,
}: {
  fields: RenderedFormField[]
  submitLabel: string
  confirmation: ReactNode
}) {
  const [state, action] = useActionState(submitContactForm, initialContactFormState)

  if (state.status === 'success') {
    return (
      <div
        // Announced rather than silently swapped in: the form the user was
        // looking at is gone, and a screen reader would otherwise report
        // nothing at all.
        role="status"
        className="border border-argo-yellow/40 px-5 py-4 font-display text-[15px] leading-[1.6] text-bone-soft"
      >
        {confirmation ?? <p>Thanks — we&rsquo;ve got your message and will be in touch.</p>}
      </div>
    )
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-[18px]">
      {fields.map((field, index) =>
        field.blockType === 'message' ? (
          <div
            key={`message-${index}`}
            className="font-display text-[15px] leading-[1.6] text-muted"
          >
            {field.node}
          </div>
        ) : (
          <Field key={field.name} field={field} error={state.errors?.[field.name]} />
        ),
      )}

      <HoneypotInput />

      {state.message && (
        <p role="alert" className="font-mono text-[13px] text-argo-yellow">
          {state.message}
        </p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  )
}

function Field({
  field,
  error,
}: {
  field: Exclude<RenderedFormField, { blockType: 'message' }>
  error?: string
}) {
  const id = `contact-${field.name}`
  const errorId = `${id}-error`
  // Points the input at its message so a screen reader reads the two together,
  // instead of announcing an invalid field with no reason given.
  const describedBy = error ? errorId : undefined
  const label = field.label || field.name

  return (
    <div style={field.width ? { width: `${field.width}%` } : undefined}>
      {field.blockType === 'checkbox' ? (
        <label htmlFor={id} className="flex items-start gap-3 font-mono text-[13px] text-muted">
          <input
            id={id}
            name={field.name}
            type="checkbox"
            defaultChecked={field.defaultValue ?? false}
            required={field.required}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className="mt-[3px] size-4 shrink-0 accent-argo-yellow"
          />
          <span>
            {label}
            {field.required && <RequiredMark />}
          </span>
        </label>
      ) : (
        <>
          <label
            htmlFor={id}
            className="mb-2 block font-mono text-[11px] tracking-[.14em] text-dim uppercase"
          >
            {label}
            {field.required && <RequiredMark />}
          </label>

          {field.blockType === 'textarea' ? (
            <textarea
              id={id}
              name={field.name}
              rows={5}
              defaultValue={field.defaultValue}
              required={field.required}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              className={`${inputClass} resize-y`}
            />
          ) : field.blockType === 'select' ? (
            <select
              id={id}
              name={field.name}
              defaultValue={field.defaultValue ?? ''}
              required={field.required}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              className={inputClass}
            >
              <option value="" disabled>
                Choose one
              </option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value} className="bg-ink-raised">
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              name={field.name}
              type={field.blockType === 'email' ? 'email' : 'text'}
              defaultValue={field.blockType === 'email' ? undefined : field.defaultValue}
              required={field.required}
              autoComplete={field.blockType === 'email' ? 'email' : undefined}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              className={inputClass}
            />
          )}
        </>
      )}

      {error && (
        <p id={errorId} className="mt-2 font-mono text-[12px] text-argo-yellow">
          {error}
        </p>
      )}
    </div>
  )
}

/** The asterisk is decoration; "required" is the part that has to be heard. */
function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-argo-yellow">
        {' '}
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  )
}

/**
 * Off-screen rather than `display: none`, because the simplest bots skip fields
 * they can tell are hidden. `aria-hidden` and `tabIndex={-1}` keep it out of
 * reach of anyone navigating by keyboard or screen reader, and `autoComplete`
 * is off so a browser never fills it in and locks a real person out.
 */
function HoneypotInput() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
      <label htmlFor={HONEYPOT_FIELD}>Website</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-fit items-center gap-[9px] bg-argo-yellow px-[26px] py-[14px] text-sm font-bold text-ink transition-[background-color,transform] duration-[160ms] ease-out hover:bg-[#e6a500] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Sending…' : label}
    </button>
  )
}
