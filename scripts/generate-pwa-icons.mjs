import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pub = resolve(__dirname, '../public')
const logo = resolve(pub, 'logo.png')

for (const size of [192, 512]) {
  const inner = Math.round(size * 0.78)
  const pad = Math.round((size - inner) / 2)
  const resized = await sharp(logo).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 255 } } })
    .composite([{ input: resized, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(pub, `icon-${size}.png`))
  console.log(`  icon-${size}.png -> public/icon-${size}.png`)
}
console.log('PWA icons done.')
