import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const PERFUME_COLORS = [
  { bg: '#1a0a2e', accent: '#c9a84c', name: 'Ambre' },
  { bg: '#0a1628', accent: '#e2c97e', name: 'Oud' },
  { bg: '#1e0a1a', accent: '#d4a0a0', name: 'Rose' },
  { bg: '#0a1a14', accent: '#4caf7d', name: 'Menthe' },
  { bg: '#2a1a0a', accent: '#c9a84c', name: 'Safran' },
]

const JEWELRY_COLORS = [
  { bg: '#1a1a2e', accent: '#e2c97e', name: 'Or' },
  { bg: '#1a1a1a', accent: '#c0c0c0', name: 'Argent' },
  { bg: '#2a1a1a', accent: '#b87070', name: 'Rose' },
  { bg: '#0a1a2a', accent: '#4a90d9', name: 'Saphir' },
  { bg: '#1a2a1a', accent: '#4caf7d', name: 'Émeraude' },
]

function generatePerfumeSVG(color: typeof PERFUME_COLORS[0], index: number): string {
  const shapes = [
    `<ellipse cx="160" cy="200" rx="60" ry="120" fill="${color.bg}" stroke="${color.accent}" stroke-width="1"/>`,
    `<path d="M130 160 Q160 100 190 160" fill="none" stroke="${color.accent}" stroke-width="2"/>`,
    `<circle cx="160" cy="140" r="15" fill="${color.accent}" opacity="0.3"/>`,
    index > 1 ? `<rect x="140" y="220" width="40" height="10" rx="3" fill="${color.accent}" opacity="0.5"/>` : '',
  ].join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 320 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color.bg}"/>
        <stop offset="100%" stop-color="${adjustColor(color.bg, -20)}"/>
      </linearGradient>
      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color.accent}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="${color.accent}" stop-opacity="0"/>
      </linearGradient>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="320" height="400" rx="20" fill="url(#bg)"/>
    <rect x="40" y="40" width="240" height="320" rx="12" fill="none" stroke="${color.accent}" stroke-width="0.5" opacity="0.3"/>
    <rect x="60" y="60" width="200" height="280" rx="8" fill="none" stroke="${color.accent}" stroke-width="0.3" opacity="0.2"/>
    <circle cx="160" cy="120" r="80" fill="url(#glow)"/>
    ${shapes}
    <text x="160" y="360" text-anchor="middle" fill="${color.accent}" font-family="serif" font-size="14" letter-spacing="3" opacity="0.6">RA AWA</text>
  </svg>`
}

function generateJewelrySVG(color: typeof JEWELRY_COLORS[0], index: number): string {
  const gems = [
    `<polygon points="160,80 190,150 160,200 130,150" fill="none" stroke="${color.accent}" stroke-width="2"/>`,
    `<polygon points="160,100 175,140 160,170 145,140" fill="${color.accent}" opacity="0.3"/>`,
    `<circle cx="160" cy="260" r="40" fill="none" stroke="${color.accent}" stroke-width="1.5"/>`,
    `<circle cx="160" cy="260" r="25" fill="${color.accent}" opacity="0.15"/>`,
    index > 1 ? `<circle cx="160" cy="260" r="10" fill="${color.accent}" opacity="0.4"/>` : '',
  ].join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 320 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color.bg}"/>
        <stop offset="100%" stop-color="${adjustColor(color.bg, -15)}"/>
      </linearGradient>
      <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color.accent}" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="${color.accent}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="320" height="400" rx="20" fill="url(#bg)"/>
    <circle cx="160" cy="200" r="120" fill="url(#glow)"/>
    ${gems}
    <text x="160" y="370" text-anchor="middle" fill="${color.accent}" font-family="serif" font-size="12" letter-spacing="4" opacity="0.4">RA AWA</text>
  </svg>`
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export async function POST() {
  try {
    const products = await prisma.product.findMany()
    const uploadDir = path.join(process.cwd(), 'public', 'generated')
    await mkdir(uploadDir, { recursive: true })

    let generatedCount = 0

    for (const product of products) {
      const currentImages: string[] = JSON.parse(product.images || '[]')
      if (currentImages.length >= 2) continue

      const newImages: string[] = [...currentImages]
      const colorIndex = products.indexOf(product) % (product.category === 'PERFUME' ? PERFUME_COLORS.length : JEWELRY_COLORS.length)

      for (let i = 0; i < 2; i++) {
        const fileName = `${product.slug}-${i + 1}.svg`
        const filePath = path.join(uploadDir, fileName)

        const svg = product.category === 'PERFUME'
          ? generatePerfumeSVG(PERFUME_COLORS[colorIndex], i)
          : generateJewelrySVG(JEWELRY_COLORS[colorIndex], i)

        await writeFile(filePath, svg)
        const url = `/generated/${fileName}`
        if (!newImages.includes(url)) newImages.push(url)
      }

      if (newImages.length > currentImages.length) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: JSON.stringify(newImages) },
        })
        generatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated images for ${generatedCount} products`,
      total: products.length,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
