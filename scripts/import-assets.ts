/**
 * Pulls every design asset already fetched in this session out of the
 * transcript and writes it into public/assets — so binary payloads never have
 * to be retyped by hand.
 *
 * The partner logos in the design project are print-resolution scans (one is
 * 4414px wide for a mark rendered at 34px tall). Raster logos are downscaled to
 * a sane web size; SVGs are copied verbatim.
 *
 *   bun scripts/import-assets.ts <transcript.jsonl> [extra-result.json ...]
 */
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

type FetchedFile = {
  method: string
  path: string
  content: string
  contentType: string
  isBase64?: boolean
  truncated?: boolean
}

const MAX_WIDTH = 600

/** Depth-first walk collecting any get_file payload embedded as a JSON string. */
function harvest(node: unknown, out: Map<string, FetchedFile>): void {
  if (typeof node === 'string') {
    if (!node.includes('"method":"get_file"')) return
    const start = node.indexOf('{"method":"get_file"')
    if (start === -1) return
    try {
      const parsed = JSON.parse(node.slice(start)) as FetchedFile
      if (parsed.path && parsed.content) out.set(parsed.path, parsed)
    } catch {
      /* Partial or interleaved payload — ignore. */
    }
    return
  }
  if (Array.isArray(node)) {
    for (const item of node) harvest(item, out)
    return
  }
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>
    if (record.method === 'get_file' && typeof record.content === 'string') {
      out.set(record.path as string, record as unknown as FetchedFile)
      return
    }
    for (const value of Object.values(record)) harvest(value, out)
  }
}

const [transcript, ...extras] = process.argv.slice(2)
if (!transcript) {
  console.error('usage: bun scripts/import-assets.ts <transcript.jsonl> [extra-result.json ...]')
  process.exit(1)
}

const files = new Map<string, FetchedFile>()

for (const line of (await Bun.file(transcript).text()).split('\n')) {
  if (!line.trim()) continue
  try {
    harvest(JSON.parse(line), files)
  } catch {
    harvest(line, files)
  }
}

for (const extra of extras) {
  try {
    harvest(await Bun.file(extra).json(), files)
  } catch {
    /* Persisted results are plain JSON; skip anything unreadable. */
  }
}

await mkdir('public/assets/partners', { recursive: true })

const skipped: string[] = []
let written = 0

for (const [path, file] of [...files].sort()) {
  if (!path.startsWith('assets/')) continue

  if (file.truncated) {
    skipped.push(path)
    continue
  }

  const target = `public/${path}`
  const bytes = Buffer.from(file.content, file.isBase64 ? 'base64' : 'utf8')

  if (path.endsWith('.svg')) {
    await Bun.write(target, bytes)
    console.log(`  ${path}  ${(bytes.length / 1024).toFixed(1)} KB (svg)`)
    written++
    continue
  }

  const image = sharp(bytes)
  const { width = 0, height = 0 } = await image.metadata()
  const targetWidth = Math.min(width, MAX_WIDTH)
  const out = await image
    .resize({ width: targetWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
  await Bun.write(target, out)
  console.log(
    `  ${path}  ${width}×${height} ${(bytes.length / 1024).toFixed(1)} KB` +
      ` → ${targetWidth}px ${(out.length / 1024).toFixed(1)} KB`,
  )
  written++
}

console.log(`\nwrote ${written} asset(s)`)
if (skipped.length) {
  console.log(`\nskipped ${skipped.length} (exceed the 256 KiB DesignSync read cap):`)
  for (const path of skipped) console.log(`  ${path}`)
}
