import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Rawaa روعة'
  const subtitle = searchParams.get('subtitle') || 'Parfums & Bijoux'
  const price = searchParams.get('price')
  const image = searchParams.get('image')
  const category = searchParams.get('category')

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a26 50%, #0a0a0f 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201, 168, 76, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196, 124, 124, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Border */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '2px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '24px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            zIndex: 1,
            padding: '40px',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #c9a84c 0%, #e2c97e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#0a0a0f',
              }}
            >
              R
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#c9a84c', fontFamily: 'serif' }}>
                Rawaa
              </span>
              <span style={{ fontSize: '24px', color: '#a08030', fontFamily: 'serif' }}>روعة</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

          {/* Title */}
          <span style={{ fontSize: '56px', fontWeight: 'bold', color: '#f0ece4', textAlign: 'center', maxWidth: '900px' }}>
            {title}
          </span>

          {/* Subtitle */}
          <span style={{ fontSize: '32px', color: '#a89d8e' }}>
            {subtitle}
          </span>

          {/* Price badge */}
          {price && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 32px',
                borderRadius: '999px',
                background: 'rgba(201, 168, 76, 0.15)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
              }}
            >
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#c9a84c' }}>
                {price} DH
              </span>
            </div>
          )}

          {/* Category tag */}
          {category && (
            <span style={{ fontSize: '20px', color: '#a89d8e', marginTop: '8px' }}>
              {category === 'PERFUME' ? '🌸 Parfum' : category === 'JEWELRY' ? '💎 Bijou' : ''}
            </span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
