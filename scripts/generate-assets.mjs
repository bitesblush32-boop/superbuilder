/**
 * Asset generator — Super Builders
 * Generates: OG image (1200x630), apple-touch-icon (180x180), favicon.ico (32x32), icon.svg
 *
 * Run: node scripts/generate-assets.mjs
 * Requires: sharp  (npm install -D sharp)
 */

import sharp from 'sharp'
import { mkdirSync, writeFileSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')

mkdirSync(resolve(publicDir, 'og'), { recursive: true })

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
async function resizeLogo(px) {
  return sharp(resolve(publicDir, 'logo.png'))
    .resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

// ─────────────────────────────────────────────
// 1. OG IMAGE  1200 × 630
// ─────────────────────────────────────────────
console.log('Generating OG image…')

// Background + typography layer (SVG, no embedded raster)
const ogBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glowL" cx="22%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#FFB800" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowR" cx="82%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#FFB800" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M50 0L0 0 0 50" fill="none" stroke="#ffffff" stroke-width="0.4" stroke-opacity="0.04"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#000000"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glowL)"/>
  <rect width="1200" height="630" fill="url(#glowR)"/>

  <!-- Left gold accent rail -->
  <rect x="56" y="56" width="3" height="518" fill="#FFB800" rx="1.5"/>

  <!-- Orbit rings (right) -->
  <circle cx="978" cy="315" r="178" fill="none" stroke="#FFB800" stroke-width="0.7" stroke-opacity="0.12"/>
  <circle cx="978" cy="315" r="258" fill="none" stroke="#FFB800" stroke-width="0.5" stroke-opacity="0.07"/>
  <circle cx="978" cy="315" r="338" fill="none" stroke="#FFB800" stroke-width="0.4" stroke-opacity="0.04"/>

  <!-- Ring accent dots -->
  <circle cx="1156" cy="315" r="5" fill="#FFB800" fill-opacity="0.45"/>
  <circle cx="978"  cy="137" r="3" fill="#FFB800" fill-opacity="0.35"/>
  <circle cx="826"  cy="197" r="2" fill="#FFB800" fill-opacity="0.25"/>
  <circle cx="1060" cy="468" r="2" fill="#FFB800" fill-opacity="0.2"/>

  <!-- Prize callout card -->
  <rect x="796" y="160" width="348" height="208" rx="12"
        fill="#FFB800" fill-opacity="0.055"
        stroke="#FFB800" stroke-opacity="0.22" stroke-width="1"/>
  <!-- card top accent line -->
  <rect x="796" y="160" width="348" height="3" rx="1.5" fill="#FFB800" fill-opacity="0.5"/>

  <text x="970" y="210"
        font-family="Arial, sans-serif" font-size="11" font-weight="700"
        fill="#FFB800" fill-opacity="0.65" text-anchor="middle" letter-spacing="3.5">PRIZE POOL</text>

  <text x="970" y="298"
        font-family="Impact, 'Arial Black', sans-serif" font-size="72" font-weight="900"
        fill="#FFB800" text-anchor="middle">&#8377;1 LAKH+</text>

  <line x1="836" y1="318" x2="1104" y2="318" stroke="#FFB800" stroke-opacity="0.15" stroke-width="1"/>

  <text x="970" y="344"
        font-family="Arial, sans-serif" font-size="13" fill="#C0C0C0" fill-opacity="0.55"
        text-anchor="middle" letter-spacing="2">2,000+ STUDENTS · 6 DOMAINS</text>

  <!-- Headline: SUPER -->
  <text x="80" y="248"
        font-family="Impact, 'Arial Black', sans-serif"
        font-size="102" font-weight="900" fill="#FFFFFF" letter-spacing="-2">SUPER</text>

  <!-- Headline: BUILDERS (gold) -->
  <text x="80" y="352"
        font-family="Impact, 'Arial Black', sans-serif"
        font-size="102" font-weight="900" fill="#FFB800" letter-spacing="-2">BUILDERS</text>

  <!-- Divider line -->
  <line x1="80" y1="370" x2="680" y2="370" stroke="#FFB800" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Tagline -->
  <text x="80" y="408"
        font-family="'Arial Black', Impact, sans-serif"
        font-size="30" font-weight="800" fill="#FFFFFF" fill-opacity="0.88">Build AI. Win &#8377;1 Lakh.</text>

  <!-- Pill badges -->
  <!-- Pill 1: date -->
  <rect x="80" y="430" width="162" height="30" rx="4"
        fill="#FFB800" fill-opacity="0.10" stroke="#FFB800" stroke-opacity="0.28" stroke-width="1"/>
  <text x="161" y="450"
        font-family="Arial, sans-serif" font-size="13" fill="#FFB800" fill-opacity="0.85"
        text-anchor="middle" letter-spacing="0.8">Jun 7&#x2013;8, 2026</text>

  <!-- Pill 2: format -->
  <rect x="252" y="430" width="100" height="30" rx="4"
        fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1"/>
  <text x="302" y="450"
        font-family="Arial, sans-serif" font-size="13" fill="#C0C0C0" fill-opacity="0.65"
        text-anchor="middle" letter-spacing="0.8">100% Online</text>

  <!-- Pill 3: audience -->
  <rect x="362" y="430" width="132" height="30" rx="4"
        fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1"/>
  <text x="428" y="450"
        font-family="Arial, sans-serif" font-size="13" fill="#C0C0C0" fill-opacity="0.65"
        text-anchor="middle" letter-spacing="0.8">Class 8&#x2013;12</text>

  <!-- Bottom bar -->
  <rect x="0" y="580" width="1200" height="1" fill="#FFB800" fill-opacity="0.22"/>
  <rect x="0" y="581" width="1200" height="49" fill="#FFB800" fill-opacity="0.035"/>

  <text x="80" y="613"
        font-family="Arial, sans-serif" font-size="14" font-weight="700"
        fill="#FFB800" fill-opacity="0.65" letter-spacing="3.5">ZER0.PRO</text>

  <text x="600" y="613"
        font-family="Arial, sans-serif" font-size="13" fill="#808080"
        text-anchor="middle" letter-spacing="0.8">School Edition · Season 1 · India's AI Hackathon for Schools</text>

  <text x="1130" y="613"
        font-family="Arial, sans-serif" font-size="13" fill="#484848"
        text-anchor="end" letter-spacing="0.4">superbuilder.org</text>
</svg>`

// Render background SVG, then composite logo on top
const [ogBgBuffer, logoForOg] = await Promise.all([
  sharp(Buffer.from(ogBgSvg)).toBuffer(),
  resizeLogo(100),
])

await sharp(ogBgBuffer)
  .composite([{ input: logoForOg, top: 64, left: 74 }])
  .jpeg({ quality: 93, progressive: true, mozjpeg: true })
  .toFile(resolve(publicDir, 'og', 'super-builders.jpg'))

console.log('  OG image -> public/og/super-builders.jpg  (1200x630)')

// ─────────────────────────────────────────────
// 2. icon.svg  (SVG favicon — supported by all modern browsers)
// ─────────────────────────────────────────────
console.log('Generating icon.svg…')

// Embed logo.png as base64 so the SVG is self-contained
const logoB64 = readFileSync(resolve(publicDir, 'logo.png')).toString('base64')
const logoDataUrl = `data:image/png;base64,${logoB64}`

const iconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="12" fill="#000000"/>
  <image href="${logoDataUrl}" x="7" y="7" width="50" height="50" preserveAspectRatio="xMidYMid meet"/>
</svg>`

writeFileSync(resolve(publicDir, 'icon.svg'), iconSvgContent)
console.log('  icon.svg -> public/icon.svg')

// ─────────────────────────────────────────────
// 3. apple-touch-icon.png  180 × 180
// ─────────────────────────────────────────────
console.log('Generating apple-touch-icon.png…')

const logoFor180 = await resizeLogo(140)

await sharp({
  create: { width: 180, height: 180, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 255 } },
})
  .composite([{ input: logoFor180, top: 20, left: 20 }])
  .png({ compressionLevel: 9 })
  .toFile(resolve(publicDir, 'apple-touch-icon.png'))

console.log('  apple-touch-icon.png -> public/apple-touch-icon.png  (180x180)')

// ─────────────────────────────────────────────
// 4. favicon.ico  32 × 32  (PNG inside ICO wrapper)
// ─────────────────────────────────────────────
console.log('Generating favicon.ico…')

const logoFor32 = await resizeLogo(24)

const favicon32Png = await sharp({
  create: { width: 32, height: 32, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 255 } },
})
  .composite([{ input: logoFor32, top: 4, left: 4 }])
  .png()
  .toBuffer()

// Minimal ICO format: 6-byte ICONDIR + 16-byte ICONDIRENTRY + PNG data
// (All modern browsers accept PNG data inside an ICO container)
const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(0, 0)  // idReserved = 0
icoHeader.writeUInt16LE(1, 2)  // idType = 1 (ICO)
icoHeader.writeUInt16LE(1, 4)  // idCount = 1

const icoDirEntry = Buffer.alloc(16)
icoDirEntry.writeUInt8(32, 0)                        // bWidth
icoDirEntry.writeUInt8(32, 1)                        // bHeight
icoDirEntry.writeUInt8(0, 2)                         // bColorCount (0 = true color)
icoDirEntry.writeUInt8(0, 3)                         // bReserved
icoDirEntry.writeUInt16LE(1, 4)                      // wPlanes
icoDirEntry.writeUInt16LE(32, 6)                     // wBitCount
icoDirEntry.writeUInt32LE(favicon32Png.length, 8)    // dwBytesInRes
icoDirEntry.writeUInt32LE(22, 12)                    // dwImageOffset (6 + 16 = 22)

writeFileSync(
  resolve(publicDir, 'favicon.ico'),
  Buffer.concat([icoHeader, icoDirEntry, favicon32Png])
)
console.log('  favicon.ico -> public/favicon.ico  (32x32)')

console.log('\nAll assets generated.')
