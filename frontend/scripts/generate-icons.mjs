// Generates every favicon / app icon from the navbar brand mark
// (lucide UtensilsCrossed on a rounded primary tile, see components/brand.tsx).
// Run with: node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const appDir = path.join(root, "src/app")
const iconsDir = path.join(root, "public/icons")

// --primary (orange-600 light / orange-500 dark) and --primary-foreground.
const PRIMARY = "#ea580c"
const PRIMARY_DARK = "#f97316"
const FOREGROUND = "#fafafa"

// lucide-react UtensilsCrossed, 24x24 grid.
const GLYPH = [
  "m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8",
  "M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7",
  "m2.1 21.8 6.4-6.3",
  "m19 5-7 7",
]

/**
 * @param {object} o
 * @param {number} o.radius  corner radius as a fraction of the tile (0 = square)
 * @param {number} o.glyph   glyph size as a fraction of the tile
 * @param {number} o.stroke  stroke width on the 24px grid
 * @param {boolean} [o.themed] switch to the dark primary under prefers-color-scheme
 */
function tileSvg({ radius, glyph, stroke, themed = false }) {
  const size = 512
  const g = size * glyph
  const offset = (size - g) / 2
  const scale = g / 24
  const style = themed
    ? `<style>.tile{fill:${PRIMARY}}@media (prefers-color-scheme:dark){.tile{fill:${PRIMARY_DARK}}}</style>`
    : ""
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${style}<rect class="tile" width="${size}" height="${size}" rx="${size * radius}" fill="${PRIMARY}"/><g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="${FOREGROUND}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${GLYPH.map((d) => `<path d="${d}"/>`).join("")}</g></svg>`
}

// Navbar proportions: 32px tile, rounded-lg (10px), 16px glyph.
const standard = { radius: 10 / 32, glyph: 0.5, stroke: 2 }
// Tiny sizes need a bigger, bolder glyph to stay legible.
const small = { radius: 0.25, glyph: 0.66, stroke: 2.4 }
// iOS / Android apply their own mask, so these are full-bleed squares.
const appleTouch = { radius: 0, glyph: 0.52, stroke: 2 }
// Maskable: glyph must stay inside the central 80% safe circle.
const maskable = { radius: 0, glyph: 0.42, stroke: 2 }

// Rasterise at 4x (2048px) and downscale for crisp anti-aliasing.
const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: 288 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()

// ICO container with embedded PNG frames (supported since Windows Vista).
function encodeIco(frames) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(frames.length, 4)
  const entries = []
  let offset = 6 + 16 * frames.length
  for (const { size, data } of frames) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    entries.push(e)
  }
  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)])
}

await mkdir(iconsDir, { recursive: true })

const out = async (file, data) => {
  await writeFile(file, data)
  console.log("✓", path.relative(root, file))
}

// Vector favicon for modern browsers (follows light/dark theme).
await out(path.join(appDir, "icon.svg"), tileSvg({ ...standard, themed: true }))
await out(path.join(iconsDir, "icon.svg"), tileSvg(standard))
await out(path.join(iconsDir, "icon-maskable.svg"), tileSvg(maskable))

// Multi-size favicon.ico.
const icoFrames = []
for (const size of [16, 24, 32, 48, 64, 256]) {
  icoFrames.push({ size, data: await render(tileSvg(size <= 32 ? small : standard), size) })
}
await out(path.join(appDir, "favicon.ico"), encodeIco(icoFrames))

// Standard PNG favicons / PWA icons.
for (const size of [16, 32, 48, 64, 96, 128, 144, 192, 256, 384, 512]) {
  const svg = tileSvg(size <= 32 ? small : standard)
  await out(path.join(iconsDir, `icon-${size}.png`), await render(svg, size))
}

// Maskable PWA icons.
for (const size of [192, 512]) {
  await out(path.join(iconsDir, `icon-maskable-${size}.png`), await render(tileSvg(maskable), size))
}

// Apple touch icons (iPhone 120/180, iPad 152/167). 180 is the default.
for (const size of [120, 152, 167, 180]) {
  await out(path.join(iconsDir, `apple-touch-icon-${size}.png`), await render(tileSvg(appleTouch), size))
}
await out(path.join(appDir, "apple-icon.png"), await render(tileSvg(appleTouch), 180))

// Windows tile.
await out(path.join(iconsDir, "mstile-150.png"), await render(tileSvg(standard), 150))
