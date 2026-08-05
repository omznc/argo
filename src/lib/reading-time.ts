/**
 * Reading-time estimate for a journal post.
 *
 * Lives outside the collection because it walks a Lexical document, and that
 * shape is worth handling in one place rather than inline in a field hook.
 */

/**
 * Adult silent reading of general prose runs around 240 wpm; technical writing
 * with code, part numbers and diagrams to stop and look at runs slower. 200 is
 * the middle, and errs toward over-estimating — a post that reads quicker than
 * promised is the better failure.
 */
const WORDS_PER_MINUTE = 200

/**
 * Depth-first walk collecting the `text` of every text node.
 *
 * Deliberately structural rather than typed against Lexical's node union: the
 * editor's feature set decides which node types can appear, and a new one
 * (a block, a table cell) would otherwise be silently skipped. Anything with a
 * string `text` counts; anything with `children` gets descended into.
 */
function collectText(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectText(item, out)
    return
  }

  if (!node || typeof node !== 'object') return

  const record = node as Record<string, unknown>

  if (typeof record.text === 'string') out.push(record.text)
  if (record.root) collectText(record.root, out)
  if (record.children) collectText(record.children, out)
}

/** Whitespace-separated runs. Close enough for an estimate, in any language that spaces its words. */
function countWords(value: string): number {
  return value.split(/\s+/).filter(Boolean).length
}

/**
 * Minutes to read the given content — a mix of plain strings (the lede) and
 * Lexical documents (the body). Never returns 0: a one-line post still takes a
 * moment, and "0 min read" reads as a bug.
 */
export function estimateReadingMinutes(...sources: unknown[]): number {
  const texts: string[] = []
  for (const source of sources) {
    if (typeof source === 'string') texts.push(source)
    else collectText(source, texts)
  }

  const words = texts.reduce((total, text) => total + countWords(text), 0)
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
