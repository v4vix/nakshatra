import { useEffect, useRef, useCallback } from 'react'

interface ConfettiCelebrationProps {
  active: boolean
  onComplete?: () => void
  type?: 'levelup' | 'achievement' | 'xp'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  shape: 'star' | 'circle' | 'diamond'
  rotation: number
  rotationSpeed: number
  size: number
}

const COLORS = {
  gold: '#FFB347',
  saffron: '#FF6B00',
  champagne: '#F7E7CE',
  celestial: '#9333EA',
  ethereal: '#C084FC',
  white: '#FFFFFF',
}

const COLOR_LIST = Object.values(COLORS)

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pickColor(): string {
  return COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)]
}

function createParticle(
  x: number,
  y: number,
  type: 'levelup' | 'achievement' | 'xp',
  canvasWidth: number,
  canvasHeight: number,
): Particle {
  const shapes: Particle['shape'][] = ['star', 'circle', 'diamond']
  const shape = shapes[Math.floor(Math.random() * shapes.length)]

  let vx = 0
  let vy = 0
  const speed = type === 'xp' ? randomBetween(2, 5) : randomBetween(3, 8)
  const angle = randomBetween(0, Math.PI * 2)

  if (type === 'levelup') {
    // Burst from center
    vx = Math.cos(angle) * speed
    vy = Math.sin(angle) * speed - randomBetween(2, 5)
  } else if (type === 'achievement') {
    // Burst from top-center
    vx = Math.cos(angle) * speed * 1.2
    vy = Math.abs(Math.sin(angle)) * speed * 0.5 + randomBetween(1, 3)
  } else {
    // XP: burst from bottom-right
    vx = -randomBetween(1, 4)
    vy = -randomBetween(3, 7)
  }

  return {
    x,
    y,
    vx,
    vy,
    life: 1,
    maxLife: randomBetween(0.6, 1),
    color: type === 'xp' ? (Math.random() > 0.5 ? COLORS.gold : COLORS.champagne) : pickColor(),
    shape,
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.1, 0.1),
    size: type === 'xp' ? randomBetween(4, 8) : randomBetween(6, 14),
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  alpha: number,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.font = `${size * 2}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦', 0, 0)
  ctx.restore()
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, size / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  alpha: number,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.translate(x, y)
  ctx.rotate(rotation + Math.PI / 4)
  ctx.fillRect(-size / 2, -size / 2, size, size)
  ctx.restore()
}

export default function ConfettiCelebration({
  active,
  onComplete,
  type = 'levelup',
}: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const completedRef = useRef(false)

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gravity = type === 'levelup' ? 0.15 : type === 'achievement' ? 0.12 : 0.1

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.01)

      for (const p of particlesRef.current) {
        p.vy += gravity
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.99
        p.rotation += p.rotationSpeed
        p.life -= 0.012

        const alpha = Math.max(0, p.life / p.maxLife)

        if (p.shape === 'star') {
          drawStar(ctx, p.x, p.y, p.size, p.rotation, p.color, alpha)
        } else if (p.shape === 'circle') {
          drawCircle(ctx, p.x, p.y, p.size, p.color, alpha)
        } else {
          drawDiamond(ctx, p.x, p.y, p.size, p.rotation, p.color, alpha)
        }
      }

      const shouldContinue = elapsed < 3000 || particlesRef.current.length > 0

      if (shouldContinue) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        stopAnimation()
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        if (!completedRef.current) {
          completedRef.current = true
          onComplete?.()
        }
      }
    },
    [type, onComplete, stopAnimation],
  )

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    completedRef.current = false
    startTimeRef.current = null
    particlesRef.current = []

    const particleCount = type === 'levelup' ? 200 : type === 'achievement' ? 150 : 50

    let originX: number
    let originY: number

    if (type === 'levelup') {
      originX = canvas.width / 2
      originY = canvas.height / 2
    } else if (type === 'achievement') {
      originX = canvas.width / 2
      originY = 60
    } else {
      originX = canvas.width - 80
      originY = canvas.height - 80
    }

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(
        createParticle(
          originX + randomBetween(-20, 20),
          originY + randomBetween(-20, 20),
          type,
          canvas.width,
          canvas.height,
        ),
      )
    }

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    window.addEventListener('resize', handleResize)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      stopAnimation()
      window.removeEventListener('resize', handleResize)
    }
  }, [active, type, animate, stopAnimation])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
