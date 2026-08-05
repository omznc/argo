import {
  type JSXConvertersFunction,
  RichText,
} from '@payloadcms/richtext-lexical/react'

import type { Post } from '@/lib/content-types'

/**
 * Renders a journal post's Lexical content in the article's own type styles.
 *
 * The converters are the whole point of keeping the field as rich text: editors
 * get a normal editor, and the design decides how each node lands. Nothing here
 * inherits from a prose stylesheet — every node that can appear is given a rule,
 * so a paragraph typed in the admin is identical to one written in JSX.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  /**
   * The design has no heading scale — sections are marked `[ like this ]` in
   * mono, which is why the editor only offers h2 (see src/collections/Posts.ts).
   * The brackets are decoration, so they are hidden from assistive tech and the
   * heading keeps its real text as its accessible name.
   */
  heading: ({ node, nodesToJSX }) => (
    <h2 className="mt-[34px] mb-3 font-mono text-[13px] text-dim">
      <span aria-hidden="true">[ </span>
      {nodesToJSX({ nodes: node.children })}
      <span aria-hidden="true"> ]</span>
    </h2>
  ),

  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    // Lexical keeps an empty paragraph for a blank line; rendering it would
    // open a gap the editor did not ask for.
    if (children.length === 0) return null
    return <p className="mb-[22px] text-[17px] leading-[1.75] text-bone-dim">{children}</p>
  },

  quote: ({ node, nodesToJSX }) => (
    <blockquote className="my-8 border-l-2 border-argo-yellow py-1.5 pl-6 text-xl leading-[1.45] text-bone md:text-[22px]">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),

  list: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const className =
      'mb-[22px] flex flex-col gap-2 pl-5 text-[17px] leading-[1.75] text-bone-dim'
    return node.tag === 'ol' ? (
      <ol className={`list-decimal ${className}`}>{children}</ol>
    ) : (
      <ul className={`list-disc ${className}`}>{children}</ul>
    )
  },

  listitem: ({ node, nodesToJSX }) => (
    <li className="pl-1.5 marker:text-argo-yellow">{nodesToJSX({ nodes: node.children })}</li>
  ),

  horizontalrule: () => <hr className="my-10 border-0 border-t border-white/[.12]" />,
})

export function PostBody({ post }: { post: Post }) {
  return (
    <>
      <p className="mb-[26px] text-[19px] leading-[1.7] text-[#dfe1da]">{post.lede}</p>
      <RichText data={post.content} converters={converters} disableContainer />
    </>
  )
}
