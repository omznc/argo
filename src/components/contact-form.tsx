import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'

import type { ContactForm as ContactFormDoc } from '@/lib/content-types'

import { ContactFormFields, type RenderedFormField } from './contact-form-fields'

/**
 * Form copy is short — a sentence between inputs, a line of thanks afterwards —
 * so it gets its own small converter set rather than the article styles in
 * post-body.tsx. Anything the editor types that isn't covered here falls
 * through to Lexical's defaults.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    if (children.length === 0) return null
    return <p className="mb-2 last:mb-0">{children}</p>
  },
})

/**
 * Server half of the contact form: it resolves the rich text, so the Lexical
 * renderer stays out of the client bundle, and hands the rest to the client
 * component that owns the submit state.
 */
export function ContactForm({ form }: { form: ContactFormDoc }) {
  const fields: RenderedFormField[] = form.fields.map((field) =>
    field.blockType === 'message'
      ? { blockType: 'message', node: <RichText data={field.message} converters={converters} /> }
      : field,
  )

  // The form's title is admin-facing — it names the form in the list of forms.
  // The page it sits on supplies the visible heading, so rendering both would
  // put two headings on one form.
  return (
    <ContactFormFields
      fields={fields}
      submitLabel={form.submitButtonLabel}
      confirmation={
        form.confirmationMessage ? (
          <RichText data={form.confirmationMessage} converters={converters} />
        ) : null
      }
    />
  )
}
