const fs = require('fs')
const path = require('path')

function createIcon(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#0a0a0f" rx="${size * 0.15}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="${size * 0.45}" fill="#c9a84c" font-weight="bold">R</text>
  </svg>`
  
  const dir = path.join(process.cwd(), 'public', 'icons')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  
  fs.writeFileSync(path.join(dir, `icon-${size}.png`), Buffer.from(svg))
  console.log(`Created icon-${size}.png`)
}

createIcon(192)
createIcon(512)
