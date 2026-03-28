import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Copy, Share2, X, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ShareCardProps {
  type: 'kundli' | 'tarot' | 'numerology' | 'compatibility' | 'daily'
  data: Record<string, unknown>
  onClose: () => void
}

// ─── Canvas Dimensions ─────────────────────────────────────────────────────

const W = 1080
const H = 1080

// ─── Drawing Helpers ───────────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }
  return currentY
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCornerOrnament(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, angle: number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.strokeStyle = 'rgba(255,179,71,0.6)'
  ctx.lineWidth = 1.5

  // L-shape corner
  ctx.beginPath()
  ctx.moveTo(0, size)
  ctx.lineTo(0, 0)
  ctx.lineTo(size, 0)
  ctx.stroke()

  // Decorative dot
  ctx.fillStyle = '#FFB347'
  ctx.beginPath()
  ctx.arc(0, 0, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawStarfield(ctx: CanvasRenderingContext2D, seed: number) {
  const rng = (s: number) => {
    const x = Math.sin(s + seed) * 43758.5453123
    return x - Math.floor(x)
  }
  for (let i = 0; i < 120; i++) {
    const x     = rng(i * 3.1) * W
    const y     = rng(i * 3.7) * H
    const r     = rng(i * 2.9) * 1.2
    const alpha = rng(i * 1.7) * 0.4 + 0.05
    ctx.fillStyle = `rgba(247,231,206,${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ─── Content Renderers ─────────────────────────────────────────────────────

function renderKundliCard(ctx: CanvasRenderingContext2D, data: Record<string, unknown>) {
  const rashi    = String(data.rashi    ?? 'Mesha')
  const symbol   = String(data.symbol  ?? '♈')
  const nakshatra = String(data.nakshatra ?? 'Ashwini')
  const mahadasha = String(data.mahadasha ?? 'Jupiter')
  const name     = String(data.name    ?? 'Your Chart')

  // Title
  ctx.font = 'bold 52px "Georgia", serif'
  ctx.fillStyle = '#FFB347'
  ctx.textAlign = 'center'
  ctx.fillText('My Vedic Birth Chart', W / 2, 220)

  // Name
  ctx.font = '38px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.9)'
  ctx.fillText(name, W / 2, 295)

  // Divider
  ctx.strokeStyle = 'rgba(255,179,71,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W / 2 - 200, 325)
  ctx.lineTo(W / 2 + 200, 325)
  ctx.stroke()

  // Symbol
  ctx.font = '140px serif'
  ctx.fillStyle = 'rgba(255,179,71,0.85)'
  ctx.fillText(symbol, W / 2, 510)

  // Rashi
  ctx.font = 'bold 64px "Georgia", serif'
  ctx.fillStyle = '#F7E7CE'
  ctx.fillText(rashi, W / 2, 600)

  // Nakshatra
  ctx.font = '36px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.65)'
  ctx.fillText(`Nakshatra: ${nakshatra}`, W / 2, 660)

  // Mahadasha
  ctx.font = '32px "Georgia", serif'
  ctx.fillStyle = 'rgba(147,51,234,0.9)'
  ctx.fillText(`Mahadasha: ${mahadasha}`, W / 2, 720)
}

function renderTarotCard(ctx: CanvasRenderingContext2D, data: Record<string, unknown>) {
  const cardName = String(data.cardName ?? 'The Star')
  const keywords = Array.isArray(data.keywords)
    ? (data.keywords as string[]).slice(0, 4)
    : ['Hope', 'Renewal', 'Inspiration']
  const date     = String(data.date ?? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }))

  ctx.font = 'bold 48px "Georgia", serif'
  ctx.fillStyle = '#FFB347'
  ctx.textAlign = 'center'
  ctx.fillText('My Daily Tarot', W / 2, 220)

  ctx.font = '34px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.6)'
  ctx.fillText(date, W / 2, 275)

  // Card name — large
  ctx.font = 'bold 96px "Georgia", serif'
  ctx.fillStyle = '#F7E7CE'
  ctx.textAlign = 'center'
  const lines = cardName.split(' ')
  if (lines.length <= 2) {
    ctx.fillText(cardName, W / 2, 440)
  } else {
    ctx.font = 'bold 72px "Georgia", serif'
    ctx.fillText(lines.slice(0, 2).join(' '), W / 2, 420)
    ctx.fillText(lines.slice(2).join(' '), W / 2, 510)
  }

  // Keywords as chips
  const chipY = 600
  const chipH = 52
  const chipPad = 30
  let chipX = W / 2 - ((keywords.length - 1) * 10)
  // Measure total width first
  ctx.font = '28px "Georgia", serif'
  const widths = keywords.map(k => ctx.measureText(k).width + chipPad * 2)
  const totalW = widths.reduce((a, b) => a + b + 16, 0) - 16
  chipX = (W - totalW) / 2

  keywords.forEach((kw, i) => {
    const w = widths[i]
    ctx.fillStyle = 'rgba(147,51,234,0.3)'
    drawRoundedRect(ctx, chipX, chipY - chipH + 12, w, chipH, chipH / 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(147,51,234,0.6)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#F7E7CE'
    ctx.font = '28px "Georgia", serif'
    ctx.textAlign = 'center'
    ctx.fillText(kw, chipX + w / 2, chipY)
    chipX += w + 16
  })
}

function renderNumerologyCard(ctx: CanvasRenderingContext2D, data: Record<string, unknown>) {
  const lifePathNumber  = Number(data.lifePathNumber   ?? 7)
  const lifePathTitle   = String(data.lifePathTitle    ?? 'The Seeker')
  const expressionNum   = Number(data.expressionNumber ?? 3)
  const soulUrgeNum     = Number(data.soulUrgeNumber   ?? 9)
  const personalityNum  = Number(data.personalityNumber ?? 5)
  const personalYearNum = Number(data.personalYearNumber ?? 2)

  ctx.font = 'bold 52px "Georgia", serif'
  ctx.fillStyle = '#FFB347'
  ctx.textAlign = 'center'
  ctx.fillText('My Sacred Numbers', W / 2, 220)

  ctx.font = '36px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.6)'
  ctx.fillText(String(data.name ?? ''), W / 2, 282)

  // Life path number — huge
  ctx.font = 'bold 240px "Georgia", serif'
  ctx.fillStyle = '#FFB347'
  ctx.fillText(String(lifePathNumber), W / 2, 580)

  ctx.font = 'bold 52px "Georgia", serif'
  ctx.fillStyle = '#F7E7CE'
  ctx.fillText(lifePathTitle, W / 2, 650)

  ctx.font = '28px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.55)'
  ctx.fillText('Life Path Number', W / 2, 700)

  // Five numbers row
  const numbers = [
    { label: 'Life Path', value: lifePathNumber },
    { label: 'Expression', value: expressionNum },
    { label: 'Soul Urge', value: soulUrgeNum },
    { label: 'Personality', value: personalityNum },
    { label: 'Personal Year', value: personalYearNum },
  ]
  const boxW = 160
  const boxH = 110
  const gap   = 20
  const totalRow = numbers.length * boxW + (numbers.length - 1) * gap
  let bx = (W - totalRow) / 2

  numbers.forEach(n => {
    // Box
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    drawRoundedRect(ctx, bx, 780, boxW, boxH, 16)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,179,71,0.2)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = 'bold 44px "Georgia", serif'
    ctx.fillStyle = '#FFB347'
    ctx.textAlign = 'center'
    ctx.fillText(String(n.value), bx + boxW / 2, 840)

    ctx.font = '20px "Georgia", serif'
    ctx.fillStyle = 'rgba(247,231,206,0.45)'
    ctx.fillText(n.label, bx + boxW / 2, 870)

    bx += boxW + gap
  })
}

function renderCompatibilityCard(ctx: CanvasRenderingContext2D, data: Record<string, unknown>) {
  const name1 = String(data.name1 ?? 'Person 1')
  const name2 = String(data.name2 ?? 'Person 2')
  const score = Number(data.score ?? 0)
  const maxScore = Number(data.maxScore ?? 36)
  const label = String(data.label ?? 'Compatible')
  const rashi1 = String(data.rashi1 ?? '')
  const rashi2 = String(data.rashi2 ?? '')

  ctx.font = 'bold 52px "Georgia", serif'
  ctx.fillStyle = '#FFB347'
  ctx.textAlign = 'center'
  ctx.fillText('Our Cosmic Match', W / 2, 220)

  // Names with heart
  ctx.font = '44px "Georgia", serif'
  ctx.fillStyle = '#F7E7CE'
  ctx.fillText(`${name1}  ✦  ${name2}`, W / 2, 295)

  if (rashi1 || rashi2) {
    ctx.font = '28px "Georgia", serif'
    ctx.fillStyle = 'rgba(247,231,206,0.5)'
    ctx.fillText(`${rashi1}  ·  ${rashi2}`, W / 2, 348)
  }

  // Score
  ctx.font = 'bold 220px "Georgia", serif'
  const scoreColor = score >= 33 ? '#FFB347' : score >= 25 ? '#22c55e' : score >= 18 ? '#eab308' : '#ef4444'
  ctx.fillStyle = scoreColor
  ctx.fillText(String(score), W / 2, 630)

  ctx.font = 'bold 56px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.4)'
  ctx.fillText(`/ ${maxScore}`, W / 2, 700)

  // Score arc decoration
  const cx = W / 2, cy = 540, r = 210
  const fraction = score / maxScore
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = scoreColor
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2)
  ctx.stroke()

  // Label
  ctx.font = 'bold 48px "Georgia", serif'
  ctx.fillStyle = scoreColor
  ctx.fillText(label, W / 2, 790)

  // Ashtakoot
  ctx.font = '30px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.4)'
  ctx.fillText('Ashtakoot Compatibility', W / 2, 850)
}

function renderDailyCard(ctx: CanvasRenderingContext2D, data: Record<string, unknown>) {
  const ruler   = String(data.planetaryRuler ?? 'Sun')
  const phase   = String(data.moonPhase      ?? 'Waxing Crescent')
  const quote   = String(data.quote ?? 'The cosmos within you reflects the cosmos without.')
  const date    = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  ctx.font = 'bold 52px "Georgia", serif'
  ctx.fillStyle = '#FFB347'
  ctx.textAlign = 'center'
  ctx.fillText('My Daily Cosmic Energy', W / 2, 215)

  ctx.font = '34px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.55)'
  ctx.fillText(date, W / 2, 275)

  ctx.strokeStyle = 'rgba(255,179,71,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W / 2 - 220, 305)
  ctx.lineTo(W / 2 + 220, 305)
  ctx.stroke()

  // Planetary ruler
  ctx.font = '36px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.5)'
  ctx.fillText('Planetary Ruler', W / 2, 375)

  ctx.font = 'bold 110px "Georgia", serif'
  ctx.fillStyle = '#F7E7CE'
  ctx.fillText(ruler, W / 2, 510)

  // Moon phase
  ctx.font = '36px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.5)'
  ctx.fillText('Moon Phase', W / 2, 595)

  ctx.font = 'bold 56px "Georgia", serif'
  ctx.fillStyle = 'rgba(192,192,255,0.85)'
  ctx.fillText(phase, W / 2, 660)

  // Quote box
  const qx = 120, qy = 720, qw = W - 240, qh = 180
  ctx.fillStyle = 'rgba(255,179,71,0.05)'
  drawRoundedRect(ctx, qx, qy, qw, qh, 20)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,179,71,0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.font = 'italic 34px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.75)'
  ctx.textAlign = 'center'
  wrapText(ctx, `"${quote}"`, W / 2, qy + 60, qw - 60, 50)
}

// ─── Main Canvas Renderer ──────────────────────────────────────────────────

function renderCard(
  canvas: HTMLCanvasElement,
  type: ShareCardProps['type'],
  data: Record<string, unknown>,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width  = W
  canvas.height = H

  // Background gradient
  const bg = ctx.createRadialGradient(W / 2, H / 3, 0, W / 2, H / 2, W * 0.85)
  bg.addColorStop(0, '#061628')
  bg.addColorStop(0.6, '#030E1A')
  bg.addColorStop(1, '#000511')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Starfield
  drawStarfield(ctx, type.charCodeAt(0) + (data.name ? String(data.name).charCodeAt(0) : 42))

  // Subtle nebula glow
  const nebula = ctx.createRadialGradient(W * 0.3, H * 0.25, 0, W * 0.3, H * 0.25, W * 0.55)
  nebula.addColorStop(0, 'rgba(107,33,168,0.12)')
  nebula.addColorStop(1, 'transparent')
  ctx.fillStyle = nebula
  ctx.fillRect(0, 0, W, H)

  // Gold border frame
  const border = 32
  const cornerSize = 52
  ctx.strokeStyle = 'rgba(255,179,71,0.45)'
  ctx.lineWidth = 2
  drawRoundedRect(ctx, border, border, W - border * 2, H - border * 2, 24)
  ctx.stroke()

  // Inner border
  ctx.strokeStyle = 'rgba(255,179,71,0.12)'
  ctx.lineWidth = 1
  drawRoundedRect(ctx, border + 8, border + 8, W - (border + 8) * 2, H - (border + 8) * 2, 18)
  ctx.stroke()

  // Corner ornaments
  const inset = border + 12
  drawCornerOrnament(ctx, inset,          inset,          cornerSize, 0)
  drawCornerOrnament(ctx, W - inset,      inset,          cornerSize, Math.PI / 2)
  drawCornerOrnament(ctx, W - inset,      H - inset,      cornerSize, Math.PI)
  drawCornerOrnament(ctx, inset,          H - inset,      cornerSize, -Math.PI / 2)

  // Logo area
  ctx.font = 'bold 38px "Georgia", serif'
  ctx.fillStyle = 'rgba(255,179,71,0.7)'
  ctx.textAlign = 'center'
  ctx.fillText('✦ NAKSHATRA ✦', W / 2, 110)

  ctx.font = '22px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.35)'
  ctx.fillText('Vedic Astrology', W / 2, 148)

  // Type-specific content
  switch (type) {
    case 'kundli':        renderKundliCard(ctx, data);        break
    case 'tarot':         renderTarotCard(ctx, data);         break
    case 'numerology':    renderNumerologyCard(ctx, data);    break
    case 'compatibility': renderCompatibilityCard(ctx, data); break
    case 'daily':         renderDailyCard(ctx, data);         break
  }

  // CTA footer
  ctx.textAlign = 'center'
  ctx.font = 'bold 28px "Georgia", serif'
  ctx.fillStyle = 'rgba(255,179,71,0.55)'
  ctx.fillText('Join me on Nakshatra app', W / 2, H - 100)

  ctx.font = '22px "Georgia", serif'
  ctx.fillStyle = 'rgba(247,231,206,0.25)'
  ctx.fillText('Discover your cosmic blueprint', W / 2, H - 65)
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ShareCard({ type, data, onClose }: ShareCardProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [imgSrc, setImgSrc] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderCard(canvas, type, data)
    setImgSrc(canvas.toDataURL('image/png'))
  }, [type, data])

  const getBlob = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) { reject(new Error('No canvas')); return }
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      }, 'image/png')
    })
  }, [])

  const handleDownload = useCallback(() => {
    if (!imgSrc) return
    const a = document.createElement('a')
    a.href = imgSrc
    a.download = `nakshatra-${type}-${Date.now()}.png`
    a.click()
    toast.success('Image downloaded!')
  }, [imgSrc, type])

  const handleCopy = useCallback(async () => {
    try {
      const blob = await getBlob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      toast.success('Image copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: copy the data URL as text
      try {
        await navigator.clipboard.writeText(imgSrc)
        toast.success('Image URL copied!')
      } catch {
        toast.error('Copy not supported in this browser.')
      }
    }
  }, [getBlob, imgSrc])

  const handleShare = useCallback(async () => {
    setSharing(true)
    try {
      if (navigator.share) {
        const blob = await getBlob()
        const file = new File([blob], `nakshatra-${type}.png`, { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Nakshatra Reading',
            text: 'Discover your cosmic blueprint on Nakshatra — Vedic Astrology app',
            files: [file],
          })
        } else {
          await navigator.share({
            title: 'My Nakshatra Reading',
            text: 'Discover your cosmic blueprint on Nakshatra — Vedic Astrology app',
          })
        }
      } else {
        await handleCopy()
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Sharing failed. Try downloading instead.')
      }
    } finally {
      setSharing(false)
    }
  }, [getBlob, handleCopy, type])

  const typeLabel: Record<ShareCardProps['type'], string> = {
    kundli:        'Birth Chart',
    tarot:         'Tarot Reading',
    numerology:    'Sacred Numbers',
    compatibility: 'Compatibility',
    daily:         'Daily Energy',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(16px)', background: 'rgba(2,11,24,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="flex flex-col items-center gap-5 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="font-cinzel text-gold text-base font-semibold">Share Your {typeLabel[type]}</p>
            <p className="text-champagne/40 text-xs font-cormorant mt-0.5">1080 × 1080 · Instagram / WhatsApp ready</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full glass-card-dark hover:bg-white/10 text-champagne/60 hover:text-champagne transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hidden canvas for rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-gold/15"
          style={{ boxShadow: '0 0 60px rgba(255,179,71,0.12)' }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={`${typeLabel[type]} share card`}
              className="w-full h-auto block"
              draggable={false}
            />
          ) : (
            <div className="aspect-square flex items-center justify-center bg-nebula">
              <Loader2 size={32} className="text-gold/50 animate-spin" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <motion.button
            onClick={handleDownload}
            disabled={!imgSrc}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-cinzel text-xs font-semibold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,179,71,0.15))',
              border: '1px solid rgba(255,179,71,0.3)',
              color: '#FFB347',
            }}
          >
            <Download size={14} />
            Download
          </motion.button>

          <motion.button
            onClick={handleCopy}
            disabled={!imgSrc}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-cinzel text-xs font-semibold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{
              background: copied
                ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))'
                : 'rgba(255,255,255,0.05)',
              border: copied ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: copied ? '#22c55e' : 'rgba(247,231,206,0.7)',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>

          <motion.button
            onClick={handleShare}
            disabled={!imgSrc || sharing}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-cinzel text-xs font-semibold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(107,33,168,0.2))',
              border: '1px solid rgba(147,51,234,0.35)',
              color: '#9333EA',
            }}
          >
            {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            Share
          </motion.button>
        </div>

        <p className="text-champagne/30 text-xs font-cormorant text-center">
          Tap outside or press <kbd className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-champagne/40">Esc</kbd> to close
        </p>
      </motion.div>
    </motion.div>
  )
}
