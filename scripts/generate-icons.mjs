// Generates PWA icon PNGs from the SVG sources in this folder.
// Run with: npm run gen:icons
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')

const regularSvg = path.join(__dirname, 'icon-source.svg')
const maskableSvg = path.join(__dirname, 'icon-source-maskable.svg')

async function render(svgPath, size, outFile) {
  await sharp(svgPath, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, outFile))
  console.log(`wrote ${outFile} (${size}x${size})`)
}

async function main() {
  await mkdir(outDir, { recursive: true })

  await render(regularSvg, 192, 'icon-192.png')
  await render(regularSvg, 512, 'icon-512.png')
  await render(maskableSvg, 512, 'icon-maskable-512.png')
  await render(maskableSvg, 180, 'apple-touch-icon.png')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
