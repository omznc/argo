/**
 * Imports a partner logo from a local file into public/assets/partners,
 * downscaling it to the same web size the design-project importer uses.
 *
 *   bun scripts/import-local-logo.ts <source> <target-filename> [maxWidth]
 */
import sharp from 'sharp'

const [source, targetName, maxWidthArg] = process.argv.slice(2)
if (!source || !targetName) {
  console.error('usage: bun scripts/import-local-logo.ts <source> <target-filename> [maxWidth]')
  process.exit(1)
}

const maxWidth = Number(maxWidthArg ?? 600)
const target = `public/assets/partners/${targetName}`

const input = sharp(source)
const { width = 0, height = 0 } = await input.metadata()
const targetWidth = Math.min(width, maxWidth)

const out = await input
  .resize({ width: targetWidth, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true })
  .toBuffer()

await Bun.write(target, out)

console.log(
  `${targetName}: ${width}×${height} ${(Bun.file(source).size / 1024).toFixed(1)} KB` +
    ` → ${targetWidth}px ${(out.length / 1024).toFixed(1)} KB`,
)
