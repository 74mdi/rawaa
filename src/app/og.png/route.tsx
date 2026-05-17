import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
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
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '2px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '24px',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #c9a84c 0%, #e2c97e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#0a0a0f',
            }}
          >
            R
          </div>
          <span style={{ fontSize: '64px', fontWeight: 'bold', color: '#c9a84c', fontFamily: 'serif' }}>
            Rawaa
          </span>
          <span style={{ fontSize: '40px', color: '#a08030', fontFamily: 'serif' }}>روعة</span>
          <div style={{ width: '100px', height: '2px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', marginTop: '8px' }} />
          <span style={{ fontSize: '36px', color: '#a89d8e' }}>Parfums & Bijoux</span>
          <span style={{ fontSize: '24px', color: '#5e5650', marginTop: '8px' }}>عطور ومجوهرات</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
