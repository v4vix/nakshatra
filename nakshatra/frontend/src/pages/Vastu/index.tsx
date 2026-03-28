import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { generateId } from '@/utils/generateId'
import {
  Home,
  Building2,
  Map,
  ChevronRight,
  X,
  Info,
  Compass,
  Star,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Gem,
  Droplets,
  Flame,
  Wind,
  Mountain,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'C'
type PropertyType = 'Home' | 'Office' | 'Plot'

interface ZoneData {
  direction: Direction
  label: string
  sanskritName: string
  deity: string
  element: string
  elementColor: string
  planet: string
  idealUse: string[]
  description: string
  defects: string[]
  remedies: string[]
  dos: string[]
  donts: string[]
  bgClass: string
  textClass: string
}

interface Room {
  id: string
  name: string
  zone: Direction | ''
}

// ─── Zone Data ────────────────────────────────────────────────────────────────

const ZONES: Record<Direction, ZoneData> = {
  N: {
    direction: 'N',
    label: 'North',
    sanskritName: 'Kuber Zone',
    deity: 'Kubera',
    element: 'Water',
    elementColor: '#3B82F6',
    planet: 'Mercury',
    idealUse: ['Water features', 'Finance/career area', 'Open space', 'Living room'],
    description:
      'The North zone is governed by Kubera, the lord of wealth. It is associated with the Water element and Mercury. Keeping this zone open and clutter-free invites prosperity, career growth, and financial abundance into your home.',
    defects: [
      'Heavy furniture or storage',
      'Toilet or kitchen in the north',
      'Cut or extended north corner',
      'Blocked natural light',
    ],
    remedies: [
      'Place a water feature (aquarium or fountain)',
      'Add green indoor plants',
      'Keep the area clean and clutter-free',
      'Use blue or green colors',
      'Place a Kubera yantra or image',
    ],
    dos: [
      'Keep open and airy',
      'Place water-related décor',
      'Use green and blue tones',
      'Ensure good natural light',
    ],
    donts: [
      'Do not store heavy items',
      'Avoid placing toilet here',
      'Do not block with large furniture',
      'Avoid red or orange colors',
    ],
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400',
  },
  NE: {
    direction: 'NE',
    label: 'North-East',
    sanskritName: 'Ishanya / Shiva Zone',
    deity: 'Shiva / Ishanya',
    element: 'Water + Ether',
    elementColor: '#93C5FD',
    planet: 'Jupiter',
    idealUse: ['Pooja room', 'Meditation space', 'Study', 'Water storage'],
    description:
      'The North-East is the most sacred zone, ruled by Lord Shiva. It combines the energy of Water and Ether (Akasha). This is the zone of divine grace, wisdom, and spiritual awakening. It must be kept most pure and elevated.',
    defects: [
      'Toilet or septic tank in NE',
      'Kitchen in NE',
      'Cut NE corner',
      'Staircase in NE',
      'Heavy construction in NE',
    ],
    remedies: [
      'Place the pooja/prayer room here',
      'Keep the space sacred and clean',
      'Install Shiva lingam or sacred symbols',
      'Allow maximum natural light',
      'Use light blue or white colors',
    ],
    dos: [
      'Keep it the most sacred space',
      'Place worship items here',
      'Allow morning sunlight',
      'Keep it elevated and clean',
    ],
    donts: [
      'Never place toilet here',
      'Avoid heavy machinery',
      'Do not cut this corner',
      'Avoid dark or heavy colors',
    ],
    bgClass: 'bg-sky-400/20',
    textClass: 'text-sky-300',
  },
  E: {
    direction: 'E',
    label: 'East',
    sanskritName: 'Indra Zone',
    deity: 'Indra',
    element: 'Wood / Air',
    elementColor: '#22C55E',
    planet: 'Sun',
    idealUse: ['Living room', 'Main entrance/door', 'Social activities', 'Study'],
    description:
      'The East is the zone of Indra, king of the gods, and is energized by the rising Sun. It governs health, vitality, social connections, and new beginnings. The main entrance in the East is highly auspicious and brings solar energy into the home.',
    defects: [
      'Blocking the east wall with heavy structures',
      'Toilet in the east',
      'No windows in the east',
      'Staircase blocking the east',
    ],
    remedies: [
      'Ensure windows or openings face east',
      'Place green plants near east walls',
      'Keep the east entrance welcoming',
      'Use green or wooden décor',
      'Avoid heavy furniture',
    ],
    dos: [
      'Place main entrance here if possible',
      'Ensure good natural morning light',
      'Add green plants',
      'Keep the zone open and welcoming',
    ],
    donts: [
      'Do not block with heavy furniture',
      'Avoid placing bathroom here',
      'Do not use dark wall colors',
      'Avoid clutter near the east door',
    ],
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-400',
  },
  SE: {
    direction: 'SE',
    label: 'South-East',
    sanskritName: 'Agni Zone',
    deity: 'Agni',
    element: 'Fire',
    elementColor: '#EF4444',
    planet: 'Venus',
    idealUse: ['Kitchen', 'Electrical appliances', 'Generator', 'Boiler room'],
    description:
      'The South-East is the realm of Agni (Fire), ruled by Venus. It represents transformation, energy, and passion. This is the ideal place for fire-related activities like cooking. Electrical equipment placed here harnesses the natural fire energy positively.',
    defects: [
      'Water features in SE',
      'Bathroom in SE',
      'Bedroom in SE (causes relationship issues)',
      'Main entrance in SE',
    ],
    remedies: [
      'Place kitchen in SE',
      'Use red, orange, or yellow colors',
      'Add fire elements like candles',
      'Place electrical appliances here',
      'Avoid water features in this zone',
    ],
    dos: [
      'Place kitchen here',
      'Use warm, fiery colors',
      'Keep electrical equipment here',
      'Ensure good ventilation',
    ],
    donts: [
      'Do not place water features here',
      'Avoid blue or black colors',
      'Do not place bedroom here',
      'Avoid water storage tanks',
    ],
    bgClass: 'bg-red-500/20',
    textClass: 'text-red-400',
  },
  S: {
    direction: 'S',
    label: 'South',
    sanskritName: 'Yama Zone',
    deity: 'Yama',
    element: 'Earth',
    elementColor: '#F97316',
    planet: 'Mars',
    idealUse: ['Master bedroom', 'Heavy storage', 'Pooja room (alternative)'],
    description:
      'The South is governed by Yama, the lord of dharma and death. While it may seem inauspicious, it is ideal for the master bedroom as the heavy energy of the south promotes deep, restful sleep. Heavy storage here is also beneficial.',
    defects: [
      'Main entrance in the south',
      'Open space or garden in south only',
      'Toilet in the south without support',
      'Depressed south zone',
    ],
    remedies: [
      'Keep walls and structures heavy in south',
      'Use earthy tones — orange, brown, yellow',
      'Place master bedroom here',
      'Add heavy furniture for grounding',
    ],
    dos: [
      'Place master bedroom here',
      'Keep the zone heavy and grounded',
      'Use earthy warm colors',
      'Build heavy walls on south side',
    ],
    donts: [
      'Do not place main entrance here',
      'Avoid too much open space in south',
      'Do not use light or airy colors',
      'Avoid mirrors on south walls',
    ],
    bgClass: 'bg-orange-500/20',
    textClass: 'text-orange-400',
  },
  SW: {
    direction: 'SW',
    label: 'South-West',
    sanskritName: 'Nirriti Zone',
    deity: 'Nirriti',
    element: 'Earth',
    elementColor: '#A16207',
    planet: 'Rahu',
    idealUse: ["Owner's bedroom", 'Master bedroom', 'Heavy storage', 'Valuables safe'],
    description:
      'The South-West is the most stable and grounding zone, ruled by Nirriti and influenced by Rahu. This is the ideal corner for the head of the household. The weight and heaviness of this corner provides stability, longevity, and protection to the family.',
    defects: [
      'Cut SW corner (very inauspicious)',
      'Open or depressed SW zone',
      'Toilet in the SW corner',
      'Main entrance in SW',
    ],
    remedies: [
      "Place owner's or master bedroom here",
      'Store valuables and safe here',
      'Add heavy furniture and items',
      'Use yellow, brown, or earthy tones',
      'Install pyramid yantra if corner is cut',
    ],
    dos: [
      "Place owner's bedroom here",
      'Store all valuables here',
      'Keep the zone heavy with furniture',
      'Use earthy warm colors',
    ],
    donts: [
      'Do not cut or reduce SW corner',
      'Avoid open spaces or gardens here',
      'Do not place kitchen here',
      'Avoid light colors',
    ],
    bgClass: 'bg-yellow-800/20',
    textClass: 'text-yellow-600',
  },
  W: {
    direction: 'W',
    label: 'West',
    sanskritName: 'Varuna Zone',
    deity: 'Varuna',
    element: 'Air / Metal',
    elementColor: '#94A3B8',
    planet: 'Saturn',
    idealUse: ['Dining room', 'Study', "Children's room", 'Bathroom'],
    description:
      'The West is governed by Varuna, lord of water and cosmic order. Ruled by Saturn, it represents discipline, learning, and reward for effort. The dining room in the west promotes family bonding, and a study here supports focused learning.',
    defects: [
      'Open or depressed west zone',
      'Too many windows in west',
      'Bright colors in the west',
      'Instability in the west wall',
    ],
    remedies: [
      'Use metal objects and décor',
      'Apply white, gray, or metallic tones',
      'Place wind chimes in the west',
      'Maintain solid west wall',
    ],
    dos: [
      'Place dining room or study here',
      'Use metal and white tones',
      'Add wind chimes',
      'Keep the zone organized',
    ],
    donts: [
      'Avoid too much open space in west',
      'Do not use vibrant warm colors',
      'Avoid fire-related activities here',
      'Do not neglect this zone',
    ],
    bgClass: 'bg-slate-500/20',
    textClass: 'text-slate-400',
  },
  NW: {
    direction: 'NW',
    label: 'North-West',
    sanskritName: 'Vayu Zone',
    deity: 'Vayu',
    element: 'Air',
    elementColor: '#E2E8F0',
    planet: 'Moon',
    idealUse: ['Guest bedroom', 'Toilet/bathroom', 'Garage', 'Poultry/cattle'],
    description:
      'The North-West is the zone of Vayu (Wind), ruled by the Moon. It governs movement, change, travel, and social connections. The guest bedroom is ideal here as guests naturally move in and out. Good ventilation in this zone is essential.',
    defects: [
      'Main entrance in NW (causes instability)',
      'Heavy construction blocks NW air',
      'Stagnant water in NW',
      'Owner bedroom in NW',
    ],
    remedies: [
      'Keep the zone well-ventilated',
      'Use white and light colors',
      'Allow free air movement',
      'Place guest bedroom here',
      'Add white or silver décor',
    ],
    dos: [
      'Ensure excellent ventilation',
      'Use white and light colors',
      'Place guest rooms here',
      'Allow free movement and airflow',
    ],
    donts: [
      'Do not block air flow',
      "Avoid owner's bedroom here",
      'Do not use heavy dark colors',
      'Avoid stagnant water',
    ],
    bgClass: 'bg-gray-400/20',
    textClass: 'text-gray-300',
  },
  C: {
    direction: 'C',
    label: 'Center',
    sanskritName: 'Brahmasthala',
    deity: 'Brahma',
    element: 'Space / Akasha',
    elementColor: '#C084FC',
    planet: 'All Planets',
    idealUse: ['Must remain OPEN', 'Courtyard', 'Light well', 'No construction'],
    description:
      'The Brahmasthala is the sacred center of the home, governed by Brahma the creator. It represents the Akasha (Space) element and connects with all planetary energies simultaneously. This zone MUST be kept completely open to allow cosmic energy to flow freely through the entire home.',
    defects: [
      'Any construction in the center (CRITICAL defect)',
      'Pillars or columns in Brahmasthala',
      'Staircases in the center',
      'Toilets or heavy structures here',
    ],
    remedies: [
      'Keep completely open — no furniture',
      'Allow natural light from above if possible',
      'Place only a small tulsi plant or lamp',
      'Ensure energy flows freely through center',
      'Do not extend the building into Brahmasthala',
    ],
    dos: [
      'Keep completely open and clear',
      'Allow maximum light and air',
      'Place a small sacred lamp here',
      'Treat it as the spiritual heart of home',
    ],
    donts: [
      'NEVER construct a pillar here',
      'Do not build rooms over the center',
      'Avoid placing heavy objects',
      'Do not place toilet or kitchen',
    ],
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-400',
  },
}

const DIRECTIONS: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

const FACING_SCORES: Record<Direction, number> = {
  N: 85,
  NE: 90,
  E: 88,
  SE: 72,
  S: 65,
  SW: 60,
  W: 75,
  NW: 70,
  C: 0,
}

const PROPERTY_TYPES: PropertyType[] = ['Home', 'Office', 'Plot']

const ROOM_NAMES = [
  'Master Bedroom',
  'Guest Bedroom',
  "Children's Room",
  'Living Room',
  'Kitchen',
  'Dining Room',
  'Study/Office',
  'Pooja Room',
  'Bathroom/Toilet',
  'Store Room',
  'Garage',
]

// ─── Grid Layout ──────────────────────────────────────────────────────────────

const GRID_LAYOUT: Direction[][] = [
  ['NW', 'N', 'NE'],
  ['W', 'C', 'E'],
  ['SW', 'S', 'SE'],
]

// ─── Element Icon ─────────────────────────────────────────────────────────────

function ElementIcon({ element }: { element: string }) {
  if (element.includes('Water')) return <Droplets className="w-3 h-3" />
  if (element.includes('Fire')) return <Flame className="w-3 h-3" />
  if (element.includes('Air')) return <Wind className="w-3 h-3" />
  if (element.includes('Earth')) return <Mountain className="w-3 h-3" />
  if (element.includes('Wood')) return <Leaf className="w-3 h-3" />
  return <Star className="w-3 h-3" />
}

// ─── Zone Cell ────────────────────────────────────────────────────────────────

function ZoneCell({
  zone,
  onClick,
  assignedRooms,
}: {
  zone: ZoneData
  onClick: () => void
  assignedRooms: string[]
}) {
  const isCenter = zone.direction === 'C'
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative flex flex-col items-center justify-center p-2 rounded-lg border border-white/10
        cursor-pointer transition-all duration-200 min-h-[90px] sm:min-h-[110px]
        ${zone.bgClass} hover:border-white/30
        ${isCenter ? 'border-purple-400/40' : ''}
      `}
    >
      <div className={`text-[10px] font-cinzel font-bold ${zone.textClass} mb-0.5`}>
        {zone.direction === 'C' ? 'CENTER' : zone.direction}
      </div>
      <div className="text-[9px] text-white/60 text-center leading-tight mb-1">
        {zone.sanskritName.split(' ').slice(0, 2).join(' ')}
      </div>
      <div className={`flex items-center gap-1 ${zone.textClass} mb-1`}>
        <ElementIcon element={zone.element} />
        <span className="text-[9px]">{zone.element.split('/')[0].trim()}</span>
      </div>
      <div className="text-[8px] text-white/50">{zone.deity}</div>
      {assignedRooms.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5 justify-center">
          {assignedRooms.slice(0, 2).map((r) => (
            <span key={r} className="text-[7px] bg-gold/20 text-gold px-1 rounded">
              {r.split(' ')[0]}
            </span>
          ))}
          {assignedRooms.length > 2 && (
            <span className="text-[7px] text-white/40">+{assignedRooms.length - 2}</span>
          )}
        </div>
      )}
      <motion.div
        className="absolute top-1 right-1 text-white/30"
        whileHover={{ opacity: 1 }}
      >
        <Info className="w-2.5 h-2.5" />
      </motion.div>
    </motion.button>
  )
}

// ─── Zone Drawer ──────────────────────────────────────────────────────────────

function ZoneDrawer({ zone, onClose }: { zone: ZoneData; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="glass-card-dark w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className={`text-xs font-cinzel ${zone.textClass} mb-1`}>{zone.label}</div>
              <h2 className="text-xl font-cinzel text-gold-gradient">{zone.sanskritName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/50">Deity: {zone.deity}</span>
                <span className="text-xs text-white/50">Planet: {zone.planet}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Element badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: zone.elementColor + '25', border: `1px solid ${zone.elementColor}50` }}
          >
            <ElementIcon element={zone.element} />
            <span className="text-xs" style={{ color: zone.elementColor }}>
              Element: {zone.element}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-white/70 font-cormorant leading-relaxed mb-5">
            {zone.description}
          </p>

          {/* Ideal Use */}
          <div className="mb-5">
            <h3 className="text-xs font-cinzel text-saffron mb-2">Ideal Room Use</h3>
            <div className="flex flex-wrap gap-2">
              {zone.idealUse.map((use) => (
                <span
                  key={use}
                  className="text-xs px-2 py-1 rounded-full bg-saffron/15 text-saffron border border-saffron/30"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>

          {/* Defects */}
          <div className="mb-5">
            <h3 className="text-xs font-cinzel text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Defects to Avoid
            </h3>
            <ul className="space-y-1">
              {zone.defects.map((d) => (
                <li key={d} className="text-xs text-white/60 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span> {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Remedies */}
          <div className="mb-5">
            <h3 className="text-xs font-cinzel text-green-400 mb-2 flex items-center gap-1">
              <Gem className="w-3 h-3" /> Remedies
            </h3>
            <ul className="space-y-1">
              {zone.remedies.map((r) => (
                <li key={r} className="text-xs text-white/60 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✦</span> {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Dos and Don'ts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-cinzel text-celestial mb-2">Do's</h3>
              <ul className="space-y-1">
                {zone.dos.map((d) => (
                  <li key={d} className="text-xs text-white/60 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-celestial mt-0.5 flex-shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-cinzel text-red-400 mb-2">Don'ts</h3>
              <ul className="space-y-1">
                {zone.donts.map((d) => (
                  <li key={d} className="text-xs text-white/60 flex items-start gap-1.5">
                    <X className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Vastu() {
  const { addXP, user } = useStore()
  const [propertyType, setPropertyType] = useState<PropertyType>('Home')
  const [facingDirection, setFacingDirection] = useState<Direction | ''>('')
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Master Bedroom', zone: '' },
    { id: '2', name: 'Kitchen', zone: '' },
    { id: '3', name: 'Living Room', zone: '' },
  ])
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [vastuScore, setVastuScore] = useState<number | null>(null)
  const [newRoomName, setNewRoomName] = useState('')

  const addRoom = () => {
    if (!newRoomName.trim()) return
    setRooms((prev) => [...prev, { id: generateId(), name: newRoomName.trim(), zone: '' }])
    setNewRoomName('')
  }

  const removeRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRoomZone = (id: string, zone: Direction | '') => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, zone } : r)))
  }

  const getRoomsForZone = (direction: Direction): string[] =>
    rooms.filter((r) => r.zone === direction).map((r) => r.name)

  const calculateScore = () => {
    if (!facingDirection) {
      toast.error('Please select a facing direction first')
      return
    }

    let score = FACING_SCORES[facingDirection] ?? 70

    // Bonus points for correct room placements
    const idealPlacements: Array<{ room: string; zone: Direction }> = [
      { room: 'Kitchen', zone: 'SE' },
      { room: 'Master Bedroom', zone: 'SW' },
      { room: 'Living Room', zone: 'E' },
      { room: 'Pooja Room', zone: 'NE' },
      { room: 'Study/Office', zone: 'W' },
      { room: 'Guest Bedroom', zone: 'NW' },
    ]

    let bonusPoints = 0
    let penaltyPoints = 0

    rooms.forEach((room) => {
      if (!room.zone) return
      const ideal = idealPlacements.find((ip) => ip.room === room.name)
      if (ideal) {
        if (ideal.zone === room.zone) {
          bonusPoints += 3
        } else {
          penaltyPoints += 1
        }
      }
      // Kitchen in NE is a major defect
      if (room.name === 'Kitchen' && room.zone === 'NE') penaltyPoints += 8
      // Pooja in SW or S is inauspicious
      if (room.name === 'Pooja Room' && (room.zone === 'SW' || room.zone === 'S')) penaltyPoints += 5
    })

    score = Math.min(100, Math.max(0, score + bonusPoints - penaltyPoints))
    setVastuScore(Math.round(score))
    setAnalysisComplete(true)
    addXP(35, 'vastu_analysis')
    toast.success('+35 XP earned! Vastu analysis complete.', { icon: '🏠' })
  }

  const scoreColor = vastuScore !== null
    ? vastuScore >= 80
      ? 'text-green-400'
      : vastuScore >= 60
      ? 'text-saffron'
      : 'text-red-400'
    : ''

  const scoreLabel = vastuScore !== null
    ? vastuScore >= 85
      ? 'Highly Auspicious'
      : vastuScore >= 70
      ? 'Moderately Auspicious'
      : vastuScore >= 55
      ? 'Needs Improvement'
      : 'Major Corrections Needed'
    : ''

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Compass className="w-7 h-7 text-saffron" />
          <h1 className="text-3xl font-cinzel text-gold-gradient">Vastu Shastra</h1>
          <Compass className="w-7 h-7 text-saffron rotate-45" />
        </div>
        <p className="text-white/60 font-cormorant text-lg max-w-xl mx-auto">
          Vastu Shastra is the ancient Hindu science of spatial alignment — harmonizing your living
          space with the five elements and cosmic directional forces for prosperity, health, and peace.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-white/40">
          <span>🌊 Water — Flow & Wealth</span>
          <span>🔥 Fire — Energy & Transformation</span>
          <span>💨 Air — Movement & Communication</span>
          <span>🌍 Earth — Stability & Grounding</span>
          <span>✨ Ether — Space & Spirit</span>
        </div>
      </motion.div>

      {/* Property Setup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <h2 className="text-lg font-cinzel text-champagne mb-4">Property Setup</h2>

        {/* Property Type */}
        <div className="mb-5">
          <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
            Property Type
          </label>
          <div className="flex gap-3">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setPropertyType(type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-cinzel ${
                  propertyType === type
                    ? 'border-saffron bg-saffron/15 text-saffron'
                    : 'border-white/10 text-white/40 hover:border-white/25'
                }`}
              >
                {type === 'Home' && <Home className="w-4 h-4" />}
                {type === 'Office' && <Building2 className="w-4 h-4" />}
                {type === 'Plot' && <Map className="w-4 h-4" />}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Facing Direction */}
        <div className="mb-5">
          <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
            Main Entrance / Facing Direction
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir}
                onClick={() => setFacingDirection(dir)}
                className={`py-2 rounded-lg border text-sm font-cinzel transition-all ${
                  facingDirection === dir
                    ? 'border-gold bg-gold/15 text-gold shadow-gold-glow'
                    : 'border-white/10 text-white/40 hover:border-white/25'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
          {facingDirection && (
            <p className="text-xs text-white/40 mt-2">
              {ZONES[facingDirection].label} facing — {ZONES[facingDirection].deity} zone —{' '}
              Base score: {FACING_SCORES[facingDirection]}/100
            </p>
          )}
        </div>

        {/* Room Assignment */}
        <div>
          <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block">
            Assign Rooms to Zones (Optional — improves score accuracy)
          </label>
          <div className="space-y-2 mb-3">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center gap-2">
                <span className="text-sm text-white/70 w-36 flex-shrink-0 truncate">{room.name}</span>
                <select
                  value={room.zone}
                  onChange={(e) => updateRoomZone(room.id, e.target.value as Direction | '')}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-saffron/50"
                >
                  <option value="">— Select Zone —</option>
                  {DIRECTIONS.map((dir) => (
                    <option key={dir} value={dir}>
                      {dir} — {ZONES[dir].label} ({ZONES[dir].sanskritName.split('/')[0].trim()})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeRoom(room.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Room */}
          <div className="flex gap-2">
            <select
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-saffron/50"
            >
              <option value="">+ Add a room...</option>
              {ROOM_NAMES.filter((n) => !rooms.find((r) => r.name === n)).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              onClick={addRoom}
              disabled={!newRoomName}
              className="px-4 py-1.5 rounded-lg bg-saffron/20 border border-saffron/30 text-saffron text-sm disabled:opacity-30 hover:bg-saffron/30 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </motion.div>

      {/* Vastu Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-cinzel text-champagne">Vastu Grid — 9 Zones</h2>
          <span className="text-xs text-white/40">Click any zone to explore</span>
        </div>

        {/* Compass labels */}
        <div className="relative">
          <div className="text-center text-xs text-white/40 mb-1 font-cinzel">NORTH</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/40 font-cinzel [writing-mode:vertical-lr] rotate-180 self-center px-1">
              WEST
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {GRID_LAYOUT.map((row, ri) =>
                row.map((dir) => (
                  <ZoneCell
                    key={dir}
                    zone={ZONES[dir]}
                    onClick={() => setSelectedZone(ZONES[dir])}
                    assignedRooms={getRoomsForZone(dir)}
                  />
                ))
              )}
            </div>
            <div className="text-xs text-white/40 font-cinzel [writing-mode:vertical-lr] self-center px-1">
              EAST
            </div>
          </div>
          <div className="text-center text-xs text-white/40 mt-1 font-cinzel">SOUTH</div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
            {[
              { element: 'Water', color: '#3B82F6' },
              { element: 'Fire', color: '#EF4444' },
              { element: 'Earth', color: '#F97316' },
              { element: 'Air', color: '#94A3B8' },
              { element: 'Space', color: '#C084FC' },
              { element: 'Wood', color: '#22C55E' },
            ].map(({ element, color }) => (
              <div key={element} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-white/40">{element}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Analyze Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={calculateScore}
          className="w-full py-4 rounded-xl shimmer-border bg-gradient-to-r from-saffron/20 to-gold/20 text-gold font-cinzel text-lg hover:from-saffron/30 hover:to-gold/30 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            <Compass className="w-5 h-5" />
            Analyze Vastu Score
            <span className="text-sm text-white/50 font-cormorant ml-1">+35 XP</span>
          </span>
        </button>
      </motion.div>

      {/* Score Result */}
      <AnimatePresence>
        {analysisComplete && vastuScore !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl p-6 mb-6 text-center"
          >
            <h2 className="text-sm font-cinzel text-white/50 uppercase tracking-wider mb-3">
              Vastu Score for Your {propertyType}
            </h2>
            <div className={`text-7xl font-cinzel font-bold mb-2 ${scoreColor}`}>
              {vastuScore}
            </div>
            <div className={`text-lg font-cinzel mb-4 ${scoreColor}`}>{scoreLabel}</div>
            {/* Progress bar */}
            <div className="w-full bg-white/5 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vastuScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  vastuScore >= 80
                    ? 'bg-green-400'
                    : vastuScore >= 60
                    ? 'bg-saffron'
                    : 'bg-red-400'
                }`}
              />
            </div>
            <p className="text-sm text-white/60 font-cormorant">
              {vastuScore >= 80
                ? 'Your space is in excellent harmony with Vastu principles. Positive energies flow freely.'
                : vastuScore >= 60
                ? 'Your space has moderate Vastu compliance. Some adjustments can enhance energy flow.'
                : 'Significant Vastu corrections are recommended to improve energy balance in your space.'}
            </p>
            <div className="mt-4 p-3 bg-gold/10 rounded-xl border border-gold/20">
              <p className="text-xs text-gold font-cinzel">+35 XP Earned — Vastu Analysis Complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone Drawer */}
      {selectedZone && (
        <ZoneDrawer zone={selectedZone} onClose={() => setSelectedZone(null)} />
      )}
    </div>
  )
}
