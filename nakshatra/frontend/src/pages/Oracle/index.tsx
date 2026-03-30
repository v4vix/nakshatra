import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { RASHI_NAMES, NAKSHATRA_NAMES } from '@/lib/vedic-constants'
import {
  Send,
  Sparkles,
  Star,
  BookOpen,
  Hash,
  Home,
  Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'oracle'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface SuggestedPrompt {
  label: string
  icon: string
  category: string
}

// ─── Rule Engine ──────────────────────────────────────────────────────────────

function getOracleResponse(message: string, _userContext: Record<string, unknown>): string {
  const msg = message.toLowerCase()

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('namaste')) {
    return `Namaste! 🙏 I am the Cosmic Oracle, keeper of Vedic wisdom.

Ask me about your birth chart, planetary periods, sacred texts, or the mysteries of the cosmos. I weave together the ancient sciences of Jyotisha, Tarot, Numerology, and Vastu Shastra to illuminate your path.

॥ यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः ॥
*"Where there is Krishna, the Lord of Yoga, and Arjuna, the archer — there is prosperity, victory, and righteousness."*`
  }

  if (msg.includes('gaja kesari')) {
    return `**Gaja Kesari Yoga** — The Elephant-Lion Combination

गज केसरी योग forms when **Jupiter (Guru/Brihaspati)** is placed in a kendra (angular house — 1st, 4th, 7th, or 10th) from the Moon.

This bestows:
• **Intelligence** like the elephant (Gaja) — immense memory and wisdom
• **Courage** like the lion (Kesari) — fearlessness and leadership
• **Fame & Prosperity** — recognition in society, financial abundance
• **Spiritual Grace** — natural inclination toward dharma and higher knowledge

The yoga is especially powerful when:
— Jupiter is strong (in own sign Sagittarius/Pisces, or exalted in Cancer)
— The Moon is bright (Shukla Paksha) and unafflicted
— This combination falls in benefic houses

॥ गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः ॥
*"The Guru is Brahma, Vishnu, and Maheshvara — the Guru is the supreme Brahman itself."*`
  }

  if (msg.includes('lagna') || msg.includes('ascendant') || msg.includes('rising')) {
    return `**The Lagna — The Soul's Mask**

The **Lagna** (लग्न) is the zodiac sign rising on the eastern horizon at the precise moment of your birth. It forms the **first house** of your natal chart and is perhaps the most critical point in Vedic astrology.

**Why Lagna matters:**
• It is the lens through which you experience the world
• Colors your personality, physical appearance, and temperament
• Acts as the "mask of the soul" — how others see you
• Determines house lordships for your entire chart

**The 12 Lagnas** each carry distinct qualities:
— **Mesha (Aries)**: Bold, pioneering, Mars-ruled fire
— **Vrishabha (Taurus)**: Sensual, steadfast, Venus-ruled earth
— **Mithuna (Gemini)**: Curious, communicative, Mercury-ruled air
— And so on through the zodiac...

The Lagna lord (the planet ruling the Lagna sign) becomes the **most important planet** in your chart — its placement, dignity, and aspects profoundly shape your destiny.

॥ जन्मलग्नं च जन्मर्क्षं जन्मराशिं विचारयेत् ॥
*"Examine the birth Lagna, birth Nakshatra, and birth Rashi together."*`
  }

  if (msg.includes('mahadasha') || msg.includes('dasha')) {
    return `**The Vimshottari Dasha System** — The Cosmic Timer

The **Vimshottari Dasha** (विंशोत्तरी दशा) is Vedic astrology's master timing system, spanning a complete **120-year cycle** through 9 planetary periods.

**The Sequence of Dashas:**
| Planet | Duration |
|--------|----------|
| ☽ Moon | 10 years |
| ♂ Mars | 7 years |
| ☊ Rahu | 18 years |
| ♃ Jupiter | 16 years |
| ♄ Saturn | 19 years |
| ☿ Mercury | 17 years |
| ☋ Ketu | 7 years |
| ♀ Venus | 20 years |
| ☉ Sun | 6 years |

Each Mahadasha is divided into **Antardashas** (sub-periods) and further **Pratyantardashas** (micro-periods), allowing precise timing of life events.

Your starting Dasha at birth is determined by the **Nakshatra** position of your natal Moon — counting from that Nakshatra's ruling planet.

॥ कालः काला कलयते सर्वभूतान्यशेषतः ॥
*"Time, the great calculator, counts all beings without exception."*`
  }

  if (msg.includes('nakshatra')) {
    return `**The 27 Nakshatras** — Lunar Mansions of the Cosmos

The **Nakshatras** (नक्षत्र) are the 27 lunar mansions of Vedic astrology, dividing the 360° zodiac into segments of **13°20' each**.

**Key Nakshatra Facts:**
• Each Nakshatra has a ruling planet (Dasha lord)
• Each has a presiding deity (*devata*)
• Each has a symbol (*symbol*) and quality (*guna*)
• The Moon transits one Nakshatra approximately every 24.8 hours

**The 27 Nakshatras in sequence:**
Ashwini → Bharani → Krittika → Rohini → Mrigashira → Ardra → Punarvasu → Pushya → Ashlesha → Magha → Purva Phalguni → Uttara Phalguni → Hasta → Chitra → Swati → Vishakha → Anuradha → Jyeshtha → Mula → Purva Ashadha → Uttara Ashadha → Shravana → Dhanishtha → Shatabhisha → Purva Bhadrapada → Uttara Bhadrapada → **Revati**

Your **Janma Nakshatra** (birth Nakshatra) — the Nakshatra of your natal Moon — is one of the most personal points in Vedic astrology, revealing your emotional nature, innate tendencies, and the flavor of your soul.

॥ चन्द्रमा मनसो जातः ॥
*"The Moon was born from the cosmic mind."* — Purusha Sukta`
  }

  if (msg.includes('yoga')) {
    return `**Yogas in Vedic Astrology** — Planetary Combinations

**Yogas** (योग) are specific planetary combinations in the birth chart that produce distinct results — elevating or challenging various aspects of life.

**Categories of Yogas:**

**Raja Yogas** (Kingly Combinations):
— Lords of Kendra and Trikona houses in conjunction or exchange
— These bring authority, power, and material success

**Dhana Yogas** (Wealth Combinations):
— 2nd and 11th house lords connecting with 1st, 5th, 9th lords
— Promise financial prosperity

**Pancha Mahapurusha Yogas** (5 Great Person Yogas):
Each formed when a planet is in its own or exaltation sign in a Kendra:
— **Ruchaka** (Mars): Courage, military success
— **Bhadra** (Mercury): Intelligence, business acumen
— **Hamsa** (Jupiter): Wisdom, spirituality, righteousness
— **Malavya** (Venus): Beauty, artistic talent, luxury
— **Shasha** (Saturn): Discipline, service, longevity

**Gaja Kesari Yoga**: Jupiter in Kendra from Moon — fame and wisdom
**Budha-Aditya Yoga**: Mercury + Sun — brilliant intellect
**Adhi Yoga**: Benefics in 6th, 7th, 8th from Moon — prosperity

॥ ग्रहाणां च यथा सूर्यः ॥
*"Among planets, the Sun is the most exalted."*`
  }

  if (msg.includes('mercury') || msg.includes('budha')) {
    return `**Mercury (Budha)** — The Divine Messenger

**Budha** (बुध) in Vedic astrology governs the intellect, communication, trade, and all matters of the analytical mind.

**Key Attributes of Mercury:**
• **Element**: Earth (Prithvi Tattva)
• **Day**: Wednesday (Budhavara)
• **Color**: Green
• **Gemstone**: Emerald (Panna)
• **Direction**: North
• **Signs owned**: Gemini (Mithuna) & Virgo (Kanya)
• **Exaltation**: Virgo at 15°
• **Debilitation**: Pisces at 15°

**Mercury rules:**
— Language, writing, and communication
— Logic, mathematics, and analysis
— Trade, commerce, and negotiations
— Short journeys and siblings
— The nervous system and skin

**Mercury in Dashas:**
Mercury Mahadasha lasts **17 years**. When strong and well-placed, it brings intellectual brilliance, business success, and excellent communication. When afflicted by malefics, it may bring confusion, anxiety, or communication breakdowns.

A strong Mercury placement supports careers in writing, technology, law, accounting, and teaching.

॥ बुधस्तु सौम्यः शुभकर्मकारी ॥
*"Mercury is gentle and the doer of auspicious deeds."*`
  }

  if (msg.includes('9 of swords') || msg.includes('nine of swords')) {
    return `**The Nine of Swords** — The Dark Night of the Soul

**Suit**: Swords (Air element — Gemini, Libra, Aquarius)
**Number**: 9 (completion of a cycle before 10's resolution)
**Keywords**: Anxiety, nightmares, mental anguish, worry, guilt

**Upright Meaning:**
The Nine of Swords speaks of **anxiety, nightmares, and mental anguish** — often "the dark night of the soul." The figure sits upright in bed, head in hands, nine swords mounted on the wall behind. This is the mind's darkest hour — intrusive thoughts, sleepless nights, fears that loom larger in the dark than in daylight.

Yet note: the swords are mounted on the wall, *not piercing the figure*. The suffering is real, but much of it **exists in the mind**.

**Questions to ask:**
— Are these worries based in reality, or amplified by fear?
— What would you tell a friend who had these same thoughts?
— What practical step can you take tomorrow to address one worry?

**Reversed Meaning:**
Reversed, the Nine of Swords signals that **dawn is near**. The worst has passed, or the suffering exists mainly in perception. The mind begins to release its grip. Seek support — a trusted friend, a counselor, or spiritual practice.

*"The mind is its own place, and in itself can make a heaven of hell, a hell of heaven."* — Milton`
  }

  if (msg.includes('tarot') || msg.includes('card')) {
    return `**The Tarot** — Mirrors of the Cosmic Soul

The Tarot deck consists of **78 cards** divided into two great systems:

**The Major Arcana (22 cards)** — Cosmic Archetypes:
The Major Arcana represents the great forces of the universe and the soul's journey from The Fool (0) through The World (21). Each card embodies a universal archetype:
— 0 The Fool → Beginning, innocence, leap of faith
— I The Magician → Will, skill, manifestation
— II The High Priestess → Intuition, mystery, the unconscious
— XVII The Star → Hope, healing, cosmic guidance
— XXI The World → Completion, integration, cosmic consciousness

**The Minor Arcana (56 cards)** — Everyday Life:
Four suits reflect the four elements:
— **Wands** (Fire): Passion, creativity, career, ambition
— **Cups** (Water): Emotions, relationships, intuition
— **Swords** (Air): Mind, conflict, truth, challenge
— **Pentacles** (Earth): Material life, money, health, career

**Tarot & Vedic Astrology:**
Each card has astrological correspondences — Major Arcana map to planets and zodiac signs, while Minor Arcana correspond to specific degrees of the zodiac, creating a beautiful bridge between Western and Vedic systems.

*Ask me about any specific card for a detailed interpretation.*`
  }

  if (msg.includes('numerology') || msg.includes('life path') || msg.includes('lucky number')) {
    return `**Numerology** — The Language of Numbers

Numbers are the universal language of the cosmos. **Numerology** reveals the hidden patterns encoded in your name and birth date.

**Core Numbers in Pythagorean Numerology:**

**Life Path Number** (Soul's Mission):
Add all digits of your birth date and reduce to a single digit (or 11, 22, 33 — master numbers).
Example: Born 15/08/1990 → 1+5+0+8+1+9+9+0 = 33 → 3+3 = **6**

**Life Path Meanings:**
— **1**: The Leader — independence, pioneering, originality
— **2**: The Diplomat — harmony, partnership, sensitivity
— **3**: The Creator — expression, joy, communication
— **4**: The Builder — stability, discipline, foundation
— **5**: The Freedom Seeker — adventure, change, versatility
— **6**: The Nurturer — family, responsibility, healing
— **7**: The Mystic — wisdom, introspection, spiritual seeking
— **8**: The Powerhouse — ambition, authority, material mastery
— **9**: The Humanitarian — compassion, completion, universal love
— **11**: The Illuminator — intuition, inspiration, spiritual messenger
— **22**: The Master Builder — large-scale vision made manifest

**Vedic Numerology** (Sankhya Shastra) also uses planetary rulers for each number, connecting numerology to Jyotisha for deeper insight.

*Tell me your birth date and I can explore your Life Path and Personal Year.*`
  }

  if (msg.includes('vastu')) {
    return `**Vastu Shastra** — Sacred Architecture of Ancient India

**Vastu Shastra** (वास्तु शास्त्र) is the traditional Hindu science of architecture and spatial arrangement — India's ancient answer to Feng Shui, predating it by millennia.

**The 9 Zones of Vastu:**
| Direction | Sanskrit | Deity | Element | Governs |
|-----------|----------|-------|---------|---------|
| North | Kuber Zone | Kubera | Water | Wealth, career |
| NE | Ishanya | Shiva | Water+Earth | Spirituality, clarity |
| East | Indra Zone | Indra | Air | Social connections |
| SE | Agni Zone | Agni | Fire | Health, kitchen |
| South | Yama Zone | Yama | Earth | Fame, stability |
| SW | Nairutya | Nairriti | Earth | Relationships, strength |
| West | Varuna Zone | Varuna | Water | Profits, gains |
| NW | Vayu Zone | Vayu | Air | Support, travel |
| Center | Brahma Zone | Brahma | Space/Ether | Life force, vitality |

**Core Principles:**
• The **Brahmasthana** (center) must be open and unobstructed
• **Northeast** should be kept light, clean, and open — sacred space
• **Southwest** should be the heaviest zone — master bedroom, storage
• **Southeast** is the fire zone — ideal for kitchen and electrical
• **Entrance** facing North or East is most auspicious

॥ वास्तु शास्त्रं प्रवक्ष्यामि लोकानां हित कामयन् ॥
*"I shall expound Vastu Shastra, desiring the welfare of all beings."*`
  }

  if (msg.includes('gita') || msg.includes('bhagavad')) {
    return `**Bhagavad Gita 2:47** — The Central Teaching

**Sanskrit:**
॥ कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।
मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥

**Transliteration:**
*Karmanye vadhikaraste ma phaleshu kadachana,*
*Ma karma-phala-hetur bhur ma te sango 'stv akarmani*

**Translation:**
*"You have the right to perform your duties, but never to the fruits of action. Never consider yourself the cause of the results of your activities, nor be attached to inaction."*

**Commentary:**
This is the **Nishkama Karma** teaching — action without attachment to outcome. Krishna teaches Arjuna that:

1. **You control action, not results** — perform your dharma fully
2. **You are not the ultimate cause** — the divine orchestrates outcomes
3. **Inaction is also a choice** — and equally consequential

In daily life: do your very best in everything — in relationships, work, spiritual practice — then release the outcome. This equanimity is the path to liberation (*moksha*).

*"When you act without attachment to fruits, the work itself becomes worship."*

Would you like another verse, or a teaching from the Upanishads?`
  }

  if (msg.includes('upanishad') || msg.includes('tat tvam') || msg.includes('brahman')) {
    return `**The Great Sayings — Mahavakyas of the Upanishads**

The Upanishads (उपनिषद्) contain the highest philosophical teachings of the Vedic tradition. Their four **Mahavakyas** (Great Sayings) reveal the ultimate truth:

**1. Tat Tvam Asi** — *Chandogya Upanishad* (Sama Veda)
॥ तत् त्वम् असि ॥
*"That thou art"* — You are the infinite Brahman, the universal consciousness

**2. Aham Brahmasmi** — *Brihadaranyaka Upanishad* (Yajur Veda)
॥ अहम् ब्रह्मास्मि ॥
*"I am Brahman"* — The individual self (*Atman*) is identical with the universal self

**3. Prajnanam Brahma** — *Aitareya Upanishad* (Rig Veda)
॥ प्रज्ञानम् ब्रह्म ॥
*"Consciousness is Brahman"* — Pure awareness is the ground of all existence

**4. Ayam Atma Brahma** — *Mandukya Upanishad* (Atharva Veda)
॥ अयम् आत्मा ब्रह्म ॥
*"This Self is Brahman"* — What you most fundamentally are is the infinite

These are not mere philosophical statements but living realizations — when truly understood, they dissolve the illusion of separation and reveal the unity underlying all existence.

॥ सर्वं खल्विदं ब्रह्म ॥
*"All this is indeed Brahman."* — Chandogya Upanishad 3.14.1`
  }

  if (msg.includes('kumbha') || msg.includes('aquarius')) {
    return `**Kumbha Rashi (Aquarius)** — The Water Bearer

**Kumbha** (कुम्भ) is the 11th sign of the Vedic zodiac, spanning 300°–330° of the ecliptic.

**Key Attributes:**
| Property | Details |
|----------|---------|
| **Ruler** | Shani (Saturn) |
| **Co-ruler** | Rahu (in some traditions) |
| **Element** | Air (Vayu) |
| **Quality** | Fixed (Sthira) |
| **Symbol** | The Water Pot Carrier |
| **Direction** | West |
| **Color** | Blue, Electric Blue |
| **Gemstone** | Blue Sapphire (Neelam) |

**Personality of Kumbha Lagna/Moon:**
— **Visionary**: Sees patterns others miss, thinks decades ahead
— **Humanitarian**: Deeply concerned with collective welfare and justice
— **Intellectual**: Analytical, scientific, drawn to unconventional ideas
— **Independent**: Values freedom of thought above all else
— **Eccentric**: Proudly marches to their own cosmic drum

**Shani's Influence:**
As Shani's sign, Kumbha natives often work hard and patiently for long-term gains. They may experience delays early in life but achieve lasting success through perseverance.

**Favorable periods**: Shani Mahadasha and Antardasha often bring career elevation for Kumbha natives when Shani is well-placed.

*"The Aquarian pours wisdom from their vessel not for themselves, but for all of humanity."*`
  }

  // Default response — acknowledge the question and provide guidance
  return `Thank you for your question about "${message.length > 60 ? message.slice(0, 60) + '...' : message}."

The cosmos holds wisdom on this matter. While I have deep knowledge in specific Vedic sciences, let me share what resonates:

Every question we ask the universe reflects an inner seeking. The Vedic tradition teaches that **true knowledge arises from sincere inquiry** — and your curiosity itself is a powerful force.

Here are some related areas I can explore in depth for you:

**Jyotisha (Vedic Astrology)** — Lagna, Dashas, Nakshatras, Yogas, planetary influences
**Divination Arts** — Tarot interpretations, Numerology, Life Path numbers
**Sacred Sciences** — Vastu Shastra, Bhagavad Gita, Upanishad teachings

Try refining your question with a specific topic, for example:
*"What does my Lagna mean?"* · *"Interpret the 9 of Swords"* · *"Explain Gaja Kesari Yoga"*

॥ तमसो मा ज्योतिर्गमय ॥
*"Lead me from darkness into light."* — Brihadaranyaka Upanishad`
}

// ─── Strip developer-facing messages from responses ─────────────────────────

const cleanResponse = (text: string) => text
  .replace(/For a deeper interpretation.*?richer analysis\.?/gi, '')
  .replace(/consider running.*?ollama.*?\./gi, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim()

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { label: 'What does my Lagna in Kumbha mean?', icon: '⭐', category: 'Kundli' },
  { label: 'Explain my Mercury Mahadasha', icon: '✨', category: 'Dasha' },
  { label: 'What is Gaja Kesari Yoga?', icon: '🐘', category: 'Yoga' },
  { label: 'Give me a Bhagavad Gita verse for today', icon: '📿', category: 'Scripture' },
  { label: 'What are my lucky numbers?', icon: '🔢', category: 'Numerology' },
  { label: 'Interpret the 9 of Swords tarot card', icon: '🃏', category: 'Tarot' },
  { label: 'Explain the 27 Nakshatras', icon: '🌙', category: 'Nakshatra' },
  { label: 'What is Tat Tvam Asi?', icon: '🕉️', category: 'Upanishad' },
]

const ORACLE_GREETING: ChatMessage = {
  id: 'oracle-greeting',
  role: 'oracle',
  content: `Namaste! 🙏 I am the **Cosmic Oracle**, keeper of Vedic wisdom across ages.

I weave together the sacred sciences of **Jyotisha**, **Tarot**, **Numerology**, **Vastu Shastra**, and the **Bhagavad Gita** to illuminate your path.

Ask me anything — about your birth chart, planetary periods, sacred verses, or the mysteries of the cosmos. The stars await your questions.

॥ ज्योतिषां रविरंशुमान् ॥
*"Among lights, I am the radiant Sun."* — Bhagavad Gita 10:21`,
  timestamp: new Date(),
}

// ─── Streaming Typewriter ─────────────────────────────────────────────────────

interface StreamingMessageProps {
  content: string
  isStreaming: boolean
  onComplete?: () => void
}

function StreamingMessage({ content, isStreaming, onComplete }: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content)
      return
    }
    setDisplayedContent('')
    setCurrentIndex(0)
  }, [content, isStreaming])

  useEffect(() => {
    if (!isStreaming) return
    if (currentIndex >= content.length) {
      onCompleteRef.current?.()
      return
    }

    // Vary speed for natural feel: faster for spaces, slower for punctuation
    const char = content[currentIndex]
    const delay =
      char === ' ' ? 8 :
      char === '\n' ? 30 :
      '.!?'.includes(char) ? 60 :
      ',;:'.includes(char) ? 30 :
      12

    const timer = setTimeout(() => {
      setDisplayedContent((prev) => prev + char)
      setCurrentIndex((prev) => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [isStreaming, currentIndex, content])

  return <FormattedContent content={displayedContent} />
}

// ─── Formatted Content ────────────────────────────────────────────────────────

function FormattedContent({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // Sanskrit/Devanagari lines (॥ ... ॥ or lines starting with ॥)
        if (line.trim().startsWith('॥') || line.trim().endsWith('॥')) {
          return (
            <p key={i} className="font-devanagari text-gold/90 text-sm leading-relaxed text-center py-1">
              {line}
            </p>
          )
        }
        // Italic lines (for transliterations/quotes)
        if (line.trim().startsWith('*') && line.trim().endsWith('*')) {
          const text = line.trim().slice(1, -1)
          return (
            <p key={i} className="font-cormorant italic text-champagne/80 text-sm leading-relaxed text-center">
              {text}
            </p>
          )
        }
        // Bold headers (** ... **)
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
          const text = line.trim().slice(2, -2)
          return (
            <p key={i} className="font-cinzel text-gold text-sm font-semibold mt-2">
              {text}
            </p>
          )
        }
        // Bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('—')) {
          return (
            <p key={i} className="font-cormorant text-champagne/90 text-base leading-relaxed pl-2">
              {renderInlineFormatting(line)}
            </p>
          )
        }
        // Table rows
        if (line.includes('|')) {
          const cells = line.split('|').filter((c) => c.trim() && c.trim() !== '---' && c.trim() !== '-')
          if (cells.length > 1 && !line.trim().match(/^[\|-]+$/)) {
            return (
              <div key={i} className="flex gap-2 text-xs font-cormorant text-champagne/80">
                {cells.map((cell, ci) => (
                  <span key={ci} className={`flex-1 ${ci === 0 ? 'text-gold/80 font-medium' : ''}`}>
                    {renderInlineFormatting(cell.trim())}
                  </span>
                ))}
              </div>
            )
          }
          return null
        }
        // Empty lines
        if (!line.trim()) {
          return <div key={i} className="h-1" />
        }
        // Regular text
        return (
          <p key={i} className="font-cormorant text-champagne/90 text-base leading-relaxed">
            {renderInlineFormatting(line)}
          </p>
        )
      })}
    </div>
  )
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Handle **bold** and *italic* inline
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-gold font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-champagne/80 italic">{part.slice(1, -1)}</em>
    }
    return part
  })
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      {/* Oracle Avatar */}
      <div className="relative flex-shrink-0 w-9 h-9">
        <div className="absolute inset-0 rounded-full border border-gold/40 animate-pulse" />
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-celestial/60 to-astral/40 flex items-center justify-center">
          <span className="text-gold text-sm animate-pulse">✦</span>
        </div>
      </div>
      <div className="glass-card-dark px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold/60"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage
  userAvatar: string
  isLastOracle: boolean
}

function MessageBubble({ message, userAvatar, isLastOracle }: MessageBubbleProps) {
  const isOracle = message.role === 'oracle'

  if (isOracle) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -16, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-end gap-3 max-w-[88%]"
      >
        {/* Oracle Avatar */}
        <div className="relative flex-shrink-0 w-9 h-9">
          <motion.div
            className="absolute inset-0 rounded-full border border-gold/40"
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -inset-1 rounded-full border border-astral/20"
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-celestial/60 to-astral/40 flex items-center justify-center">
            <span className="text-gold text-sm">✦</span>
          </div>
        </div>

        {/* Message */}
        <div className="glass-card-dark px-4 py-3.5 rounded-2xl rounded-bl-sm border border-gold/10 shadow-card-depth">
          {message.isStreaming && isLastOracle ? (
            <StreamingMessage
              content={message.content}
              isStreaming={true}
            />
          ) : (
            <FormattedContent content={message.content} />
          )}
          <p className="text-xs text-champagne/30 mt-2 font-cormorant">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-end gap-3 max-w-[80%] ml-auto flex-row-reverse"
    >
      {/* User Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 to-saffron/20 border border-gold/30 flex items-center justify-center text-base">
        {userAvatar}
      </div>

      {/* Message */}
      <div
        className="px-4 py-3 rounded-2xl rounded-br-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255,179,71,0.15) 0%, rgba(255,107,0,0.10) 100%)',
          border: '1px solid rgba(255,179,71,0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p className="font-cormorant text-champagne text-base leading-relaxed">
          {message.content}
        </p>
        <p className="text-xs text-gold/30 mt-1.5 font-cormorant text-right">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OraclePage() {
  const { user, addXP, getActiveKundli } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([ORACLE_GREETING])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const userAvatar = user?.avatar ?? '🌟'
  const activeKundli = getActiveKundli()
  const moonPlanet = activeKundli?.planets?.find(p => p.name === 'Moon')
  const userContext = {
    name: user?.fullName ?? user?.username ?? 'Seeker',
    level: user?.level ?? 1,
    rank: user?.rank ?? 'Stardust Seeker',
    birthDate: user?.birthDate,
    birthPlace: user?.birthPlace,
    lagna: activeKundli?.ascendant?.rashiIndex !== undefined
      ? RASHI_NAMES[activeKundli.ascendant.rashiIndex] : undefined,
    moonSign: moonPlanet?.rashiIndex !== undefined
      ? RASHI_NAMES[moonPlanet.rashiIndex] : undefined,
    birthNakshatra: moonPlanet?.nakshatraIndex !== undefined
      ? NAKSHATRA_NAMES[moonPlanet.nakshatraIndex] : undefined,
    currentMahadasha: activeKundli?.dashas?.currentMahadasha?.planet,
    currentAntardasha: activeKundli?.dashas?.currentAntardasha?.planet,
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = useCallback(async (query?: string) => {
    const text = (query ?? inputValue).trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage].slice(-50))
    setInputValue('')
    setIsLoading(true)

    // Award XP
    addXP(5, 'oracle_query')

    // Prepare placeholder oracle message for streaming
    const oracleId = `oracle-${Date.now()}`
    const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

    // Try RAG-powered SSE streaming endpoint first
    let usedRAG = false
    try {
      const response = await fetch(`${API_BASE}/oracle/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, topK: 5, stream: true }),
        signal: AbortSignal.timeout(15000),
      })

      if (response.ok && response.body) {
        usedRAG = true
        let streamedText = ''

        // Add streaming placeholder message
        setMessages((prev) => [...prev, {
          id: oracleId,
          role: 'oracle' as const,
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        }].slice(-50))
        setIsLoading(false)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === 'text' && event.text) {
                streamedText += event.text
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === oracleId ? { ...m, content: cleanResponse(streamedText) } : m
                  )
                )
              }
              if (event.type === 'done' || event.done) {
                // Mark streaming complete
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === oracleId ? { ...m, isStreaming: false } : m
                  )
                )
              }
              if (event.type === 'error') {
                throw new Error(event.error || 'Stream error')
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        // Ensure streaming flag is cleared
        if (streamedText) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === oracleId ? { ...m, content: cleanResponse(streamedText), isStreaming: false } : m
            )
          )
        }
      }
    } catch {
      // RAG endpoint unavailable — fall through to rule engine
    }

    // Fallback: rule engine + legacy LLM endpoint
    if (!usedRAG) {
      const ruleResponse = getOracleResponse(text, userContext)
      let finalResponse = ruleResponse

      try {
        const response = await axios.post(
          '/api/v1/llm/interpret',
          { query: text, domain: 'astrology', context: userContext },
          { timeout: 5000 }
        )
        if (response.data?.interpretation || response.data?.response || response.data?.result) {
          finalResponse =
            response.data.interpretation ??
            response.data.response ??
            response.data.result ??
            ruleResponse
        }
      } catch {
        // Silently fall back to rule engine response
      }

      setIsLoading(false)

      setMessages((prev) => [...prev, {
        id: oracleId,
        role: 'oracle' as const,
        content: cleanResponse(finalResponse),
        timestamp: new Date(),
        isStreaming: true,
      }].slice(-50))
    }

    // Show XP toast
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : -20, scale: t.visible ? 1 : 0.9 }}
          className="achievement-toast px-4 py-2 flex items-center gap-2"
        >
          <span className="text-gold text-sm">✦</span>
          <span className="font-cinzel text-xs text-gold">+5 XP — Oracle Wisdom</span>
        </motion.div>
      ),
      { duration: 2000, position: 'top-right' }
    )
  }, [inputValue, isLoading, addXP, userContext])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const isEmptyChat = messages.length === 1 && messages[0].id === 'oracle-greeting'
  const lastOracleIndex = messages.reduce((acc, msg, idx) => msg.role === 'oracle' ? idx : acc, -1)

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden relative">
      {/* Sanskrit Watermark Background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <p className="font-devanagari text-champagne opacity-[0.03] text-[12rem] leading-none text-center rotate-12 whitespace-nowrap">
          ॐ नमः शिवाय ॐ
        </p>
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-shrink-0">
        <div className="glass-card-dark border-b border-gold/10 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3">
              {/* Animated Cosmic Eye / Mandala */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-full border border-gold/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-1 rounded-full border border-astral/40"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-saffron/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-gold text-base"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ✦
                  </motion.span>
                </div>
              </div>

              <div>
                <h1 className="font-cinzel text-sm md:text-base font-semibold text-gold-gradient leading-tight">
                  Cosmic Oracle
                </h1>
                <p className="font-cormorant text-xs text-champagne/50 leading-tight">
                  Powered by Ancient Wisdom & AI
                </p>
              </div>
            </div>

            {/* Right: Badges */}
            <div className="hidden sm:flex items-center gap-2">
              {['Vedic Astrology', 'Tarot', 'Numerology'].map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 rounded-full text-xs font-cinzel border border-gold/20 text-gold/70 bg-gold/5"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Messages Area ────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-4">
        {/* Greeting / Messages */}
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              userAvatar={userAvatar}
              isLastOracle={index === lastOracleIndex}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompts (shown when chat is at greeting only) ── */}
      <AnimatePresence>
        {isEmptyChat && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative z-10 flex-shrink-0 px-4 pb-2 md:px-6"
          >
            <p className="font-cinzel text-xs text-champagne/40 mb-2 text-center tracking-wider uppercase">
              Begin Your Cosmic Journey
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <motion.button
                  key={prompt.label}
                  onClick={() => handleSend(prompt.label)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card text-left px-3 py-2.5 rounded-xl border border-gold/15 hover:border-gold/35 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-gold/60 group-hover:text-gold transition-colors">
                      {prompt.icon}
                    </span>
                    <span className="font-cinzel text-[10px] text-gold/50 group-hover:text-gold/70 transition-colors uppercase tracking-wide">
                      {prompt.category}
                    </span>
                  </div>
                  <p className="font-cormorant text-xs text-champagne/70 group-hover:text-champagne transition-colors leading-snug line-clamp-2">
                    {prompt.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Bar ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-4 pt-2 md:px-6">
        <div className="glass-card border border-gold/20 rounded-2xl overflow-hidden focus-within:border-gold/40 transition-all duration-200 focus-within:shadow-gold-glow">
          <div className="flex items-end gap-2 px-3 py-2">
            {/* Sanskrit Om prefix */}
            <span className="font-devanagari text-gold/40 text-lg pb-0.5 flex-shrink-0 select-none">
              ॐ
            </span>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Oracle anything about your cosmic journey…"
              aria-label="Message the Oracle"
              rows={1}
              className="flex-1 bg-transparent resize-none font-cormorant text-base text-champagne placeholder-champagne/30 focus:outline-none leading-relaxed py-1 max-h-32 scrollbar-thin"
              style={{ minHeight: '2rem' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`
              }}
              disabled={isLoading}
            />

            {/* Send Button */}
            <motion.button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                inputValue.trim() && !isLoading
                  ? 'bg-gradient-to-br from-gold to-saffron shadow-gold-glow hover:shadow-[0_0_30px_rgba(255,179,71,0.6)] text-cosmos'
                  : 'bg-stardust/50 text-champagne/30 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </motion.button>
          </div>

          {/* Subtle bottom hint */}
          <div className="px-4 pb-1.5 flex items-center justify-between">
            <p className="font-cormorant text-xs text-champagne/25">
              ↵ Enter to send · Shift+Enter for new line
            </p>
            <p className="font-cinzel text-[10px] text-gold/30">
              +5 XP per question
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
