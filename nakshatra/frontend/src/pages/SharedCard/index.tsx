import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, Download, Share2 } from '@/lib/lucide-icons'
import { getPublicCard } from '@/services/auth'

export default function SharedCardPage() {
  const { slug } = useParams<{ slug: string }>()
  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    getPublicCard(slug)
      .then(c => {
        if (c) setCard(c)
        else setError('Card not found')
      })
      .catch(() => setError('Failed to load card'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmos flex items-center justify-center">
        <div className="text-gold animate-pulse font-cinzel">Loading cosmic insight...</div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-cosmos flex flex-col items-center justify-center gap-4">
        <span className="text-4xl">✦</span>
        <p className="text-champagne/50 font-cormorant">{error || 'Card not found'}</p>
        <Link to="/login" className="text-gold hover:text-gold/80 text-sm underline">Go to Nakshatra</Link>
      </div>
    )
  }

  const typeLabels: Record<string, string> = {
    kundli: 'Birth Chart', tarot: 'Tarot Reading', numerology: 'Numerology',
    compatibility: 'Compatibility', daily: 'Daily Insight',
  }

  return (
    <div className="min-h-screen bg-cosmos flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Card header */}
        <div className="text-center mb-4">
          <span className="text-3xl block mb-2">✦</span>
          <h1 className="font-cinzel text-xl text-gold-gradient font-bold">Nakshatra</h1>
        </div>

        {/* Card content */}
        <div className="glass-card-dark rounded-2xl p-6 border border-gold/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-cinzel">
              {typeLabels[card.type] || card.type}
            </span>
            {card.author && (
              <span className="text-xs text-champagne/40 font-cormorant">
                by {card.author.avatar} {card.author.name}
              </span>
            )}
          </div>

          {card.title && (
            <h2 className="font-cinzel text-lg text-champagne">{card.title}</h2>
          )}

          {/* Render card data based on type */}
          <div className="bg-stardust/20 rounded-xl p-4 space-y-2">
            {card.type === 'kundli' && card.data && (
              <>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Name:</span> {card.data.name}
                </p>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Ascendant:</span> {card.data.ascendant}
                </p>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Moon Sign:</span> {card.data.moonSign}
                </p>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Nakshatra:</span> {card.data.nakshatra}
                </p>
                {card.data.summary && (
                  <p className="text-sm text-champagne/60 font-cormorant mt-2 leading-relaxed">{card.data.summary}</p>
                )}
              </>
            )}
            {card.type === 'tarot' && card.data && (
              <>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Spread:</span> {card.data.spreadType}
                </p>
                {card.data.question && (
                  <p className="font-cormorant text-champagne/60 italic">"{card.data.question}"</p>
                )}
                {card.data.cards?.map((c: any, i: number) => (
                  <p key={i} className="text-sm text-champagne/70 font-cormorant">
                    {c.position}: <span className="text-gold/70">{c.cardName}</span>
                    {c.isReversed && ' (Reversed)'}
                  </p>
                ))}
              </>
            )}
            {card.type === 'numerology' && card.data && (
              <>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Life Path:</span> {card.data.lifePathNumber}
                </p>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Expression:</span> {card.data.expressionNumber}
                </p>
                <p className="font-cormorant text-champagne/80">
                  <span className="text-gold/60">Soul Urge:</span> {card.data.soulUrgeNumber}
                </p>
              </>
            )}
            {/* Generic fallback */}
            {!['kundli', 'tarot', 'numerology'].includes(card.type) && card.data && (
              <pre className="text-xs text-champagne/50 font-mono whitespace-pre-wrap overflow-hidden">
                {JSON.stringify(card.data, null, 2).slice(0, 500)}
              </pre>
            )}
          </div>

          <p className="text-xs text-champagne/30 font-cormorant text-center">
            Shared on {new Date(card.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center space-y-3">
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl text-sm font-cinzel tracking-wider inline-flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FFB347 0%, #FF6B00 100%)',
                color: '#020B18',
                boxShadow: '0 4px 20px rgba(255, 179, 71, 0.3)',
              }}
            >
              <ExternalLink size={14} /> Get Your Own Reading
            </motion.button>
          </Link>
          <p className="text-xs text-champagne/30 font-cormorant">
            Free to use — powered by Vedic wisdom
          </p>
        </div>
      </motion.div>
    </div>
  )
}
