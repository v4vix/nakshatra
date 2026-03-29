import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, TarotReading } from '@/store'
import { generateId } from '@/utils/generateId'
import { Search, ChevronLeft, BookOpen, Zap, Star, Clock, X, RefreshCw, ChevronRight, Layers } from 'lucide-react'

// ─── Complete Tarot Deck ───────────────────────────────────────────────────

export interface TarotCardDef {
  id: number
  name: string
  arcana: 'Major' | 'Minor'
  suit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles' | null
  number: number | null
  element: string | null
  astro: string
  keywords: string[]
  uprightMeaning: string
  reversedMeaning: string
  color: string
  symbol: string
}

const MAJOR_ARCANA: TarotCardDef[] = [
  { id: 0, name: 'The Fool', arcana: 'Major', suit: null, number: 0, element: 'Air', astro: 'Uranus',
    keywords: ['New beginnings', 'Innocence', 'Adventure', 'Freedom'],
    uprightMeaning: 'A soul poised at the precipice of infinite possibility. The Fool embodies pure potential, the courage to leap into the unknown with childlike wonder. Trust the universe — every great journey begins with a single step into mystery.',
    reversedMeaning: 'Reckless abandon without wisdom, naivety turned harmful. You may be taking unnecessary risks or refusing to see warning signs. Ground yourself before the next leap — not all who wander are wise.',
    color: '#7DF9FF', symbol: '0' },
  { id: 1, name: 'The Magician', arcana: 'Major', suit: null, number: 1, element: 'Air', astro: 'Mercury',
    keywords: ['Willpower', 'Skill', 'Manifestation', 'Resourcefulness'],
    uprightMeaning: 'The alchemist of consciousness stands before you, channeling cosmic will into earthly creation. All four elements are at your command — thought, emotion, action, and material. This is the moment to act with focused intention and turn vision into reality.',
    reversedMeaning: 'Scattered energy and unrealized talent plague your path. You may be manipulating situations rather than manifesting authentically, or your skills remain dormant beneath layers of self-doubt. Realign your will with your higher purpose before proceeding.',
    color: '#FFB347', symbol: '∞' },
  { id: 2, name: 'The High Priestess', arcana: 'Major', suit: null, number: 2, element: 'Water', astro: 'Moon',
    keywords: ['Intuition', 'Mystery', 'Subconscious', 'Inner voice'],
    uprightMeaning: 'The guardian of the veil between worlds whispers ancient knowing into your stillness. Like the Chandra (Moon) in Vedic tradition, she illuminates the hidden realms of your subconscious mind. Be silent, listen deeply — the answers you seek already reside within.',
    reversedMeaning: 'You have become disconnected from your inner oracle, ignoring gut feelings in favor of external noise. Secrets may be kept from you, or you are withholding truth from yourself. Return to meditation and solitude to restore the sacred connection to your intuition.',
    color: '#C0C0FF', symbol: '☾' },
  { id: 3, name: 'The Empress', arcana: 'Major', suit: null, number: 3, element: 'Earth', astro: 'Venus',
    keywords: ['Fertility', 'Nurturing', 'Abundance', 'Beauty'],
    uprightMeaning: 'Shakti herself flows through this card — the creative, nurturing force that births all life into being. Abundance surrounds you in every form: love, wealth, creative expression, and sensory pleasure. Tend your garden with devotion and watch the universe bloom in response.',
    reversedMeaning: 'The wellspring of creation has become blocked or misdirected. You may be smothering others with excessive care, neglecting your own needs, or experiencing creative drought. Release the need to control growth — nature cannot be forced, only nurtured with patience.',
    color: '#FFB6C1', symbol: '♀' },
  { id: 4, name: 'The Emperor', arcana: 'Major', suit: null, number: 4, element: 'Fire', astro: 'Aries',
    keywords: ['Authority', 'Structure', 'Father figure', 'Control'],
    uprightMeaning: 'The sovereign architect builds empires through discipline, clear boundaries, and unwavering resolve. Like a dharmic king, your authority is earned through responsible stewardship of power. Establish order in chaos, create structure that serves, and lead with the strength of purpose.',
    reversedMeaning: 'Authority has curdled into tyranny, or discipline has collapsed into disorder. You may be dominating others through rigidity and fear, or conversely, lacking the backbone to enforce necessary boundaries. Examine your relationship with power — true strength serves rather than subjugates.',
    color: '#FF6B6B', symbol: '♈' },
  { id: 5, name: 'The Hierophant', arcana: 'Major', suit: null, number: 5, element: 'Earth', astro: 'Taurus',
    keywords: ['Tradition', 'Wisdom', 'Guidance', 'Sacred teaching'],
    uprightMeaning: 'The Guru appears, bridging the eternal wisdom of tradition with your present seeking. Like a lineage holder in the Vedic parampara, this card calls you toward sacred knowledge passed through generations. Seek a teacher, honor the path laid before you, and find the divine within established forms.',
    reversedMeaning: 'Blind conformity stifles your spiritual growth, or you have become disillusioned with institutions and dogma. The reversed Hierophant invites you to question inherited beliefs and forge your own spiritual path. Not all tradition serves — discern which teachings liberate and which imprison.',
    color: '#9B87F5', symbol: '⋈' },
  { id: 6, name: 'The Lovers', arcana: 'Major', suit: null, number: 6, element: 'Air', astro: 'Gemini',
    keywords: ['Love', 'Union', 'Choice', 'Alignment'],
    uprightMeaning: 'A sacred convergence of hearts, values, and destiny presents itself. Beyond mere romance, The Lovers speaks to the yoga of union — aligning your inner masculine and feminine, your desires with your dharma. A choice made from the heart will harmonize your entire being.',
    reversedMeaning: 'Disharmony fractures your relationships and inner wholeness. You may be avoiding a crucial choice, betraying your values for convenience, or experiencing a painful misalignment between what you want and what you need. Honest self-reflection must precede any attempt at reunion.',
    color: '#FFB6C1', symbol: '♡' },
  { id: 7, name: 'The Chariot', arcana: 'Major', suit: null, number: 7, element: 'Water', astro: 'Cancer',
    keywords: ['Control', 'Willpower', 'Victory', 'Determination'],
    uprightMeaning: 'The warrior of consciousness rides forth, harnessing opposing forces through sheer determination and focused will. Like Arjuna on his chariot guided by divine wisdom, you must master your conflicting impulses to achieve victory. Move forward with confidence — the battle is already won in the mind.',
    reversedMeaning: 'The chariot has lost direction, pulled apart by forces you cannot reconcile. Aggression without purpose, ambition without clarity, or the collapse of self-discipline threatens your journey. Pause to realign your inner horses before they drag you off the path entirely.',
    color: '#FFD700', symbol: '⊕' },
  { id: 8, name: 'Strength', arcana: 'Major', suit: null, number: 8, element: 'Fire', astro: 'Leo',
    keywords: ['Courage', 'Inner strength', 'Compassion', 'Influence'],
    uprightMeaning: 'True power flows not from dominance but from the infinite well of compassion within. The lion of your primal nature bows willingly to the gentle hand of your higher self. This is tapas — the spiritual fire of patience, endurance, and loving mastery over the forces within.',
    reversedMeaning: 'Self-doubt erodes your inner foundation, or raw emotion overwhelms your capacity for grace. You may be suppressing your natural power out of fear, or losing yourself to impulses you cannot control. Reconnect with your core — the strength you seek was never outside you.',
    color: '#FF8C00', symbol: '∞' },
  { id: 9, name: 'The Hermit', arcana: 'Major', suit: null, number: 9, element: 'Earth', astro: 'Virgo',
    keywords: ['Soul-searching', 'Introspection', 'Guidance', 'Solitude'],
    uprightMeaning: 'The sage withdraws from the world not in defeat but in devotion to truth. Like a rishi in deep tapasya, you are called to seek the light within your own lantern. This is a sacred pause — the wisdom you need cannot be found in the noise of others, only in the silence of your own being.',
    reversedMeaning: 'Isolation has crossed from sacred solitude into painful loneliness and disconnection. You may be withdrawing from necessary human contact, or refusing the inner work that solitude demands. The Hermit reversed warns: avoidance disguised as introspection serves no one.',
    color: '#888', symbol: '⎊' },
  { id: 10, name: 'Wheel of Fortune', arcana: 'Major', suit: null, number: 10, element: 'Fire', astro: 'Jupiter',
    keywords: ['Luck', 'Karma', 'Destiny', 'Cycles'],
    uprightMeaning: 'The great wheel of samsara turns, and fortune shifts in your favor. Like the cosmic dance of Jupiter bestowing divine grace, a turning point arrives bearing gifts of destiny and karmic reward. Embrace the change — you have earned this through cycles of growth seen and unseen.',
    reversedMeaning: 'You resist the natural turning of life, clinging to what was or fearing what comes. Karmic patterns repeat because the lesson has not yet been absorbed. The wheel will turn regardless — your only choice is whether to flow with its wisdom or be crushed beneath its weight.',
    color: '#FFD700', symbol: '⊗' },
  { id: 11, name: 'Justice', arcana: 'Major', suit: null, number: 11, element: 'Air', astro: 'Libra',
    keywords: ['Justice', 'Truth', 'Cause and effect', 'Dharma'],
    uprightMeaning: 'The cosmic scales of dharma weigh every action, thought, and intention with perfect precision. Truth will out, and balance will be restored — not as punishment, but as the natural law of the universe correcting itself. Act with integrity, for every cause creates its effect.',
    reversedMeaning: 'Injustice, dishonesty, or a refusal to accept accountability has tilted the scales against you. Legal matters may not resolve fairly, or you are avoiding the consequences of past actions. Until you face truth with open eyes, the karmic ledger remains unbalanced.',
    color: '#7DF9FF', symbol: '⚖' },
  { id: 12, name: 'The Hanged Man', arcana: 'Major', suit: null, number: 12, element: 'Water', astro: 'Neptune',
    keywords: ['Pause', 'Surrender', 'New perspective', 'Letting go'],
    uprightMeaning: 'Suspended between earth and sky, you are invited into the profound wisdom of surrender. Like the yogic practice of pratyahara — withdrawal of the senses — this pause is not defeat but the doorway to enlightenment. Release your grip on how things should be and discover how they truly are.',
    reversedMeaning: 'You resist the necessary pause, thrashing against stillness with futile action. Martyrdom without meaning, delay without purpose, or an unwillingness to see from a new angle keeps you trapped. Stop fighting the suspension — the insight you need comes only through release.',
    color: '#38BDF8', symbol: '⊢' },
  { id: 13, name: 'Death', arcana: 'Major', suit: null, number: 13, element: 'Water', astro: 'Scorpio',
    keywords: ['Endings', 'Transformation', 'Release', 'Transition'],
    uprightMeaning: 'The great transformer arrives, not as destroyer but as liberator. Like Shiva Nataraja dancing the dissolution of old worlds to make way for new creation, Death strips away what no longer serves your evolution. Let the old identity die gracefully — rebirth awaits on the other side of surrender.',
    reversedMeaning: 'You cling desperately to what has already ended, refusing the natural cycle of release and renewal. Fear of change paralyzes you in a half-life between what was and what could be. The longer you resist this transformation, the more painful the inevitable shedding will become.',
    color: '#4A0080', symbol: '☠' },
  { id: 14, name: 'Temperance', arcana: 'Major', suit: null, number: 14, element: 'Fire', astro: 'Sagittarius',
    keywords: ['Balance', 'Moderation', 'Patience', 'Alchemy'],
    uprightMeaning: 'The divine alchemist blends fire and water, earth and sky, creating something greater than either alone. Like the practice of samatva — equanimity in Vedic philosophy — Temperance teaches that harmony is not the absence of extremes but their conscious integration. Walk the middle path with patience and purpose.',
    reversedMeaning: 'Excess and imbalance have disrupted your inner chemistry. You may be overindulging in one area while starving another, or forcing outcomes that require patient incubation. The alchemical process has been disturbed — step back, recalibrate, and allow the natural synthesis to resume.',
    color: '#38BDF8', symbol: '△' },
  { id: 15, name: 'The Devil', arcana: 'Major', suit: null, number: 15, element: 'Earth', astro: 'Capricorn',
    keywords: ['Shadow self', 'Attachment', 'Addiction', 'Materialism'],
    uprightMeaning: 'The chains of maya — illusion and attachment — hold you captive, yet look closely: they rest loosely around your neck. The Devil reveals the bondage you have chosen through unconscious desire, addiction, or material obsession. Awareness is the first key to liberation — see clearly what binds you.',
    reversedMeaning: 'A powerful moment of breaking free from patterns, addictions, or toxic attachments that have long held sway over your life. The shadow acknowledged loses its power to control. You are reclaiming sovereignty over your choices — continue this courageous work of self-liberation.',
    color: '#660000', symbol: '♑' },
  { id: 16, name: 'The Tower', arcana: 'Major', suit: null, number: 16, element: 'Fire', astro: 'Mars',
    keywords: ['Sudden change', 'Upheaval', 'Revelation', 'Awakening'],
    uprightMeaning: 'Lightning strikes the tower of false security, and all that was built on illusion crumbles in an instant. This is not destruction but revelation — the fierce grace that shatters ego structures so truth may finally stand. What remains after the storm is unshakeable because it is real.',
    reversedMeaning: 'You sense the approaching upheaval and desperately attempt to shore up crumbling walls. Internal transformation churns beneath the surface, but fear of the external collapse keeps you clinging to unstable structures. The tower will fall eventually — choosing when gives you power in the process.',
    color: '#FF4444', symbol: '⚡' },
  { id: 17, name: 'The Star', arcana: 'Major', suit: null, number: 17, element: 'Air', astro: 'Aquarius',
    keywords: ['Hope', 'Faith', 'Renewal', 'Inspiration'],
    uprightMeaning: 'After the destruction of The Tower, The Star pours healing waters upon the wounded earth of your soul. This is shraddha — sacred faith that persists even after everything has been stripped away. You are being renewed, guided by a light that has waited patiently through your darkest nights.',
    reversedMeaning: 'Hope has dimmed and faith feels impossible to sustain. You may feel disconnected from your guiding star, lost in despair after trials that seem to have no redemptive purpose. The light has not vanished — only your ability to perceive it has been temporarily clouded. Keep looking up.',
    color: '#38BDF8', symbol: '★' },
  { id: 18, name: 'The Moon', arcana: 'Major', suit: null, number: 18, element: 'Water', astro: 'Pisces',
    keywords: ['Illusion', 'Fear', 'The unconscious', 'Mystery'],
    uprightMeaning: 'You walk the twilight path between conscious and unconscious, where shadows take deceptive shapes and nothing is as it seems. Like navigating the dream realm of the deep psyche, The Moon asks you to trust your intuition even when rational sight fails. Not all darkness is dangerous — some holds hidden treasures.',
    reversedMeaning: 'Repressed fears and anxieties surge to the surface, demanding attention you have long denied them. Self-deception lifts and you begin to see situations and people as they truly are, which may be unsettling. The fog of confusion clears gradually — have courage to face what the moonlight reveals.',
    color: '#C0C0FF', symbol: '☽' },
  { id: 19, name: 'The Sun', arcana: 'Major', suit: null, number: 19, element: 'Fire', astro: 'Sun',
    keywords: ['Joy', 'Success', 'Positivity', 'Vitality'],
    uprightMeaning: 'The Surya of the tarot blazes forth, illuminating every corner of your life with warmth, clarity, and boundless joy. Success, vitality, and the innocent delight of a soul aligned with its purpose radiate from this card. Bask in this light — you have earned this moment of radiant triumph.',
    reversedMeaning: 'The inner child has retreated behind clouds of pessimism, self-doubt, or excessive seriousness. Joy feels forced or inaccessible, and success may be delayed or partial. The sun has not ceased to shine — it is your own clouds of perception that dim its warmth. Seek what genuinely delights your spirit.',
    color: '#FFD700', symbol: '☀' },
  { id: 20, name: 'Judgement', arcana: 'Major', suit: null, number: 20, element: 'Fire', astro: 'Pluto',
    keywords: ['Rebirth', 'Inner calling', 'Absolution', 'Reflection'],
    uprightMeaning: 'The cosmic trumpet sounds and the soul answers its highest calling. This is the moment of mahapralaya — the great dissolution of old karma followed by spiritual rebirth into your truest self. Forgive what must be forgiven, release what must be released, and rise into the fullness of who you were always meant to become.',
    reversedMeaning: 'The inner call goes unanswered as self-doubt, guilt, or fear of judgment keeps you buried beneath layers of old identity. You refuse the mirror of honest self-reflection, preferring comfortable stagnation to the vulnerability of transformation. The trumpet still sounds — how long will you pretend not to hear it?',
    color: '#FF8C00', symbol: '☆' },
  { id: 21, name: 'The World', arcana: 'Major', suit: null, number: 21, element: 'Earth', astro: 'Saturn',
    keywords: ['Completion', 'Integration', 'Accomplishment', 'Wholeness'],
    uprightMeaning: 'The cosmic dancer whirls at the center of creation, celebrating the completion of a great cycle. Like the fulfillment of one\'s svadharma — your unique cosmic purpose — The World represents total integration of lessons learned across every stage of the journey. Rejoice in this wholeness, then prepare: a new spiral of evolution beckons.',
    reversedMeaning: 'A cycle remains incomplete, and the sense of closure you seek continues to elude you. Shortcuts have been taken, or final lessons resist integration. You stand at the threshold of completion but something holds you back — identify the unfinished thread and weave it into wholeness before moving forward.',
    color: '#9B87F5', symbol: '◎' },
]

// ─── Minor Arcana Interpretation Data ─────────────────────────────────────
// Comprehensive meanings for all 56 Minor Arcana cards

const MINOR_DATA: Record<string, Array<{ kw: string[]; up: string; rev: string }>> = {
  Wands: [
    { kw: ['Inspiration', 'Potential', 'Creation', 'New venture'], up: 'A divine spark of agni ignites your creative will. The Ace of Wands is pure potential — a seed of passion, a flash of inspiration calling you to act boldly. Seize this moment; the universe conspires in favor of those who dare to begin.', rev: 'Creative energy stalls at the threshold. Enthusiasm fades before the first step is taken, or false starts drain the vital force meant for your true calling. Reconnect with what genuinely excites your soul before scattering your fire.' },
    { kw: ['Planning', 'Progress', 'Discovery', 'Decision'], up: 'Standing at the crossroads with the world in your hands, you weigh your options with the wisdom of experience and the courage of vision. A partnership or journey beckons — plan carefully, then commit fully to the path that calls your spirit.', rev: 'Fear of the unknown paralyzes your decision-making. You may be over-planning to avoid taking actual risks, or a lack of clear vision leaves you stranded between possibilities. Choose imperfect action over perfect hesitation.' },
    { kw: ['Expansion', 'Foresight', 'Enterprise', 'Trade'], up: 'Your ships are launched and the horizon calls with promise. Long-range planning bears fruit as ventures expand beyond initial expectations. This is the card of the visionary merchant — trust your foresight and prepare for abundance arriving from distant shores.', rev: 'Delays frustrate your grand plans and anticipated returns fail to materialize on schedule. Overextension or poor planning may have weakened your position. Reassess your ventures with honest eyes before committing further resources.' },
    { kw: ['Celebration', 'Harmony', 'Homecoming', 'Joy'], up: 'The four wands form a canopy of celebration under which community and loved ones gather in joyous harmony. A milestone is reached, a foundation is laid, and the fruits of collective effort blossom into shared rejoicing. Welcome this season of peace and gratitude.', rev: 'Discord disrupts what should be a time of harmony and celebration. Family tensions, cancelled plans, or a sense of not belonging cloud an otherwise auspicious moment. The foundation may need strengthening before the festival can truly begin.' },
    { kw: ['Conflict', 'Competition', 'Tension', 'Growth'], up: 'Five wands clash in creative combat — this is not destruction but the fierce alchemy of competing ideas forging something stronger. Healthy rivalry, spirited debate, and the friction of diverse perspectives drive innovation and growth. Engage fully without losing your center.', rev: 'Conflict has become toxic, moving beyond productive tension into pointless power struggles. Avoidance of necessary confrontation, or exhaustion from petty battles that serve no higher purpose. Choose your fights wisely — not every provocation deserves your energy.' },
    { kw: ['Victory', 'Recognition', 'Pride', 'Triumph'], up: 'The laurel crown of victory rests upon your brow as the crowd acknowledges your achievement. Public recognition, promotion, or the sweet satisfaction of a goal met through persistent effort. Savor this triumph with humility — you have earned the respect of your peers.', rev: 'The victory you seek remains elusive, or recognition comes in hollow form. Pride may be preventing you from accepting help or acknowledging your own role in setbacks. True success is measured from within, not by the approval of others.' },
    { kw: ['Courage', 'Perseverance', 'Standing ground', 'Defense'], up: 'You stand your ground against overwhelming odds, defending what you have built with fierce determination. This is the courage of conviction — maintaining your position not through aggression but through unwavering commitment to what you know is right. Your persistence will prevail.', rev: 'The defense has become exhausting, and you wonder whether this hill is worth the battle. Stubbornness masquerades as strength, or you give in too easily when a firm stand is needed. Discern the difference between a fight worth having and a war of attrition that drains your vitality.' },
    { kw: ['Speed', 'Movement', 'Momentum', 'Progress'], up: 'Eight wands fly through open sky — obstacles have cleared and momentum surges. Communication, travel, and rapid developments arrive in quick succession. This is the cosmic green light: move swiftly, for the universe has removed the barriers to your progress.', rev: 'Sudden delays halt what seemed like unstoppable momentum. Messages are lost, plans stall, and the frustrating sense of being stuck returns. Patience is required — the blockage is temporary, but forcing the flow will only create more turbulence.' },
    { kw: ['Resilience', 'Boundaries', 'Persistence', 'Vigilance'], up: 'Battle-scarred but unbroken, you survey the landscape from a position of hard-won strength. Past challenges have forged resilience and wisdom that no future adversity can easily breach. Maintain your boundaries and remain vigilant — this is the persistence that outlasts all opposition.', rev: 'Paranoia and defensiveness have replaced healthy boundaries. You may be preparing for battles that will never come, or carrying wounds that have long needed healing. The war is over — put down your guard long enough to let peace enter.' },
    { kw: ['Burden', 'Responsibility', 'Overwhelm', 'Duty'], up: 'The weight of responsibility presses heavily upon you, yet you carry it with determination toward a goal you cannot yet see. This is the tapasya of worldly duty — the burning of ego through selfless service. Delegate where possible, but know that this burden will ultimately transform your character.', rev: 'The load has become unbearable, and collapse is imminent unless you release what is not yours to carry. Martyrdom serves no one — least of all those who depend on you. Let go of responsibilities that belong to others and reclaim your own vitality.' },
  ],
  Cups: [
    { kw: ['Love', 'Intuition', 'New feelings', 'Emotional opening'], up: 'The holy grail overflows with the waters of divine love and emotional renewal. A new relationship, creative inspiration, or spiritual awakening stirs the deepest wellsprings of your heart. Open yourself completely — this offering from the universe can only be received with vulnerability.', rev: 'Emotional walls block the flow of love and inspiration seeking entry. A missed opportunity for connection, repressed feelings, or the bitter aftertaste of closed-heartedness. The cup is being offered — your refusal to receive is the only thing preventing its gifts.' },
    { kw: ['Partnership', 'Unity', 'Mutual attraction', 'Balance'], up: 'Two hearts find their reflection in each other, creating a bond of mutual respect, attraction, and shared purpose. Whether romantic partnership or deep friendship, this union is blessed by a harmony that transcends mere compatibility. Honor this sacred connection with presence and gratitude.', rev: 'Imbalance disrupts what should be an equal partnership. One-sided affection, broken communication, or the painful discovery that your feelings are not reciprocated. True union requires two hearts fully present — assess whether both parties are truly invested.' },
    { kw: ['Celebration', 'Friendship', 'Community', 'Creativity'], up: 'Three cups raised in toast to the joy of belonging and the creative power of community. Friendships deepen, collaborations flourish, and the simple pleasure of shared celebration fills your days. This is the sangha — the sacred community that nourishes the soul through collective joy.', rev: 'Social exhaustion or superficial connections leave you feeling emptier than solitude ever could. Gossip, excess, or the hollow performance of friendship without genuine depth. Seek quality over quantity in your social world and nurture the bonds that truly sustain you.' },
    { kw: ['Contemplation', 'Apathy', 'Reevaluation', 'Discontent'], up: 'Beneath a tree of contemplation, you sit with the restless feeling that something is missing despite apparent abundance. Three cups are offered yet your eyes fixate on the one that seems empty. This is the divine discontent that precedes spiritual growth — honor it as a call to deeper meaning.', rev: 'The fog of apathy lifts and motivation gradually returns. A new opportunity presents itself just as you were about to give up searching. The period of stagnation was actually preparation — now move toward what genuinely calls your spirit forward.' },
    { kw: ['Loss', 'Grief', 'Regret', 'Acceptance'], up: 'Three cups have spilled their contents, and the grief of what is lost weighs heavily. Yet two cups remain standing behind you, unnoticed in your sorrow. This card calls you to fully honor your grief while gently turning toward what remains. Loss is the teacher that reveals what truly matters.', rev: 'You begin to emerge from grief, finding the courage to acknowledge what still remains in your life. Recovery is not forgetting but integrating loss into a deeper understanding of love. The bridge ahead leads to renewed hope — take the first steps across.' },
    { kw: ['Nostalgia', 'Memories', 'Innocence', 'Reunion'], up: 'Golden memories arise like ghosts of happier times, inviting you to revisit the innocent joys of your past. A childhood friend, a forgotten dream, or a place that once held magic calls to your heart. Honor these memories as gifts, but remember: the sweetest cup is the one you fill today.', rev: 'Living in the past has become an escape from present reality. Idealized memories obscure the truth of what was, or an unhealthy attachment to former times prevents you from creating new joys. The past is a reference, not a residence — return to the living present.' },
    { kw: ['Imagination', 'Fantasy', 'Choice', 'Illusion'], up: 'Seven cups appear in the mists of imagination, each holding a different dream, desire, or fantasy. The abundance of possibility can be intoxicating, but not every vision is meant to be pursued. Discern between inspired vision and escapist fantasy — your dharma awaits behind only one of these illusions.', rev: 'The fog of confusion clears and practical reality reasserts itself. You see through fantasies that have kept you paralyzed with indecision. This clarity, while less magical, is the foundation upon which real dreams are actually built. Choose one path and commit.' },
    { kw: ['Walking away', 'Disillusionment', 'Seeking truth', 'Courage'], up: 'The courage to walk away from what no longer nourishes your soul, even when others cannot understand your departure. Like the sannyasi renouncing worldly attachments, you sense that something deeper awaits beyond the familiar landscape. This leaving is not abandonment but the first step of a sacred pilgrimage.', rev: 'Fear of the unknown keeps you tethered to situations that have long stopped serving your growth. Or you have been drifting aimlessly, calling it spiritual seeking when it is actually avoidance of commitment. Discern whether your restlessness is genuine guidance or simply running away.' },
    { kw: ['Contentment', 'Satisfaction', 'Emotional fulfillment', 'Wishes granted'], up: 'The wish-fulfilling gem of the tarot gleams with the satisfaction of emotional dreams realized. Material comfort, loving relationships, and inner contentment converge in a moment of genuine gratitude. This is the fruit of right living — enjoy it fully, for you have aligned your heart with the universe.', rev: 'Material abundance fails to bring the emotional satisfaction you expected. Something intangible remains missing despite having everything you thought you wanted. True contentment comes from inner alignment, not external accumulation — seek what money cannot buy.' },
    { kw: ['Harmony', 'Family', 'Emotional security', 'Legacy'], up: 'The rainbow arches over a scene of complete emotional fulfillment — family harmony, lasting love, and the deep security that comes from knowing you belong. This is the culmination of the heart journey: a legacy of love that will endure beyond your own lifetime. Celebrate this rare and precious wholeness.', rev: 'Family discord or broken relationships cast shadows over what should be a harmonious home. The ideal of perfect love proves elusive, and fractured connections demand attention and healing. Remember that every family is a work in progress — perfection is not required for love to flourish.' },
  ],
  Swords: [
    { kw: ['Clarity', 'Breakthrough', 'Truth', 'New idea'], up: 'The sword of viveka — discriminating wisdom — cuts through the fog of confusion with one decisive stroke. A breakthrough in understanding, a flash of mental clarity, or the emergence of a truth that changes everything. Wield this power of insight responsibly, for truth once seen cannot be unseen.', rev: 'Mental confusion reigns as the sword of clarity remains sheathed. Miscommunication, intellectual dishonesty, or the willful avoidance of inconvenient truths clouds your judgment. Before you can cut through external illusions, you must first be honest with yourself.' },
    { kw: ['Indecision', 'Stalemate', 'Avoidance', 'Blocked emotions'], up: 'Two swords cross in tense equilibrium, reflecting the mind paralyzed between equally compelling choices. This is not the time for action but for deep inner listening. The blindfold you wear is not weakness — it is the invitation to access a wisdom beyond rational thought. Be still until the answer arrives.', rev: 'The stalemate breaks as suppressed information surfaces or a decision is finally forced. The emotional avoidance that maintained the false peace can no longer be sustained. While uncomfortable, this release of tension opens the path to genuine resolution.' },
    { kw: ['Heartbreak', 'Sorrow', 'Grief', 'Painful truth'], up: 'Three swords pierce the heart of understanding, and the pain of truth fully felt courses through you. Heartbreak, betrayal, or the sorrow of seeing clearly what you wished were otherwise. This suffering, while excruciating, is ultimately purifying — it breaks open the heart so that deeper love may eventually enter.', rev: 'The acute pain begins to subside, replaced by the slow work of healing and forgiveness. You are learning to release resentment and find meaning in suffering. Recovery is not linear — be gentle with yourself on the days when the grief returns uninvited.' },
    { kw: ['Rest', 'Restoration', 'Contemplation', 'Recovery'], up: 'The warrior rests, surrendering to the healing powers of deep contemplation and sacred stillness. Like the yogic practice of yoga nidra, this rest is not passive but profoundly restorative. Allow your mind to recover from recent trials — the battles ahead require a fully restored spirit.', rev: 'Restlessness prevents the healing you desperately need. You may be forcing yourself back into action prematurely, or the mental noise refuses to quiet despite your exhaustion. The restoration cannot be rushed — surrender more deeply to the stillness your mind craves.' },
    { kw: ['Conflict', 'Defeat', 'Loss', 'Humiliation'], up: 'The battle is lost, and the taste of defeat lingers. Yet within this apparent failure lies a profound teaching: not every fight is worth winning, and not every loss diminishes you. Gather what remains of your dignity, learn the hard lessons offered, and know that the wisest warriors choose which battles to walk away from.', rev: 'You begin to recover from a painful defeat, finding unexpected lessons in loss. The humiliation begins to transform into humility, and the clarity that follows failure reveals paths you could never have seen from the heights of success. Rise again, wiser and more grounded.' },
    { kw: ['Transition', 'Passage', 'Moving on', 'Calm after storm'], up: 'After the storms of conflict, calmer waters carry you toward a new shore. This is the necessary transition between what was and what will be — a liminal passage requiring patience and trust. The worst is behind you; let the current of healing carry you gently toward your next chapter.', rev: 'You resist the transition, anchoring yourself to the turbulent waters of the past or rushing ahead before the storm has fully passed. Unresolved issues travel with you unless properly addressed. Complete your grief before attempting to reach new shores.' },
    { kw: ['Deception', 'Strategy', 'Stealth', 'Cunning'], up: 'Not all wisdom is shared openly, and not all strategy announces itself. Like the skilled diplomat who achieves through subtlety what force cannot, the Seven of Swords counsels strategic thinking and careful maneuvering. Protect your plans and proceed with discretion — not every truth needs to be spoken aloud.', rev: 'Deception is exposed and hidden agendas come to light. Whether you are the deceiver or the deceived, the time for secrets has ended. Clear the air with radical honesty, even if the truth is uncomfortable. Integrity, once restored, is your most powerful weapon.' },
    { kw: ['Restriction', 'Imprisonment', 'Victim mentality', 'Self-imposed limits'], up: 'Eight swords surround you, but look carefully — the bindings are loose and the path forward is clear. The prison is largely of your own making, built from fears, limiting beliefs, and the stories you tell yourself about what is possible. The moment you choose to see freedom, the cage dissolves.', rev: 'You begin to break free from self-imposed limitations and the victim mentality that kept you bound. Fresh perspectives reveal that the obstacles you feared were largely phantoms. This liberation of mind is the most powerful freedom — carry it forward with confidence.' },
    { kw: ['Anxiety', 'Worry', 'Nightmares', 'Despair'], up: 'The mind torments itself in the dark hours, replaying fears and magnifying threats until sleep becomes impossible. Anxiety, obsessive worry, and the cruel swords of self-criticism cut deepest in the silence of night. Know this: the darkest hour precedes the dawn. Seek support and remember that thoughts are not facts.', rev: 'The long night of anxiety begins to lift as perspective returns with the coming light. You are learning to distinguish between genuine threats and the manufactured terrors of an overactive mind. Hope stirs tentatively — nurture it with self-compassion and the company of those who understand.' },
    { kw: ['Endings', 'Loss', 'Finality', 'Rock bottom'], up: 'The ten swords mark the absolute end — there is nowhere further to fall, and in that lies a strange liberation. The cycle of mental suffering reaches its completion, and the darkest moment becomes the soil from which new life will grow. Surrender completely to this ending, for the dawn behind those swords is already breaking.', rev: 'You resist the finality of an ending that has already occurred, prolonging suffering unnecessarily. Or the recovery from devastation begins as you realize that hitting rock bottom has given you the most solid foundation for rebuilding. The only direction from here is up.' },
  ],
  Pentacles: [
    { kw: ['Prosperity', 'Manifestation', 'New opportunity', 'Abundance'], up: 'A golden portal opens in the garden of earthly abundance, offering a tangible opportunity for material and spiritual prosperity. The Ace of Pentacles is the blessing of Lakshmi — wealth not as mere accumulation but as the flow of cosmic generosity through your dedicated hands. Plant this seed with reverence.', rev: 'A promising opportunity slips through your fingers due to poor timing, lack of preparation, or misaligned priorities. Material concerns consume spiritual energy, or the fear of scarcity prevents you from investing in growth. Ground yourself in gratitude for what you have before chasing what you lack.' },
    { kw: ['Balance', 'Adaptability', 'Juggling', 'Time management'], up: 'The cosmic juggler maintains impossible balance, keeping multiple responsibilities in graceful motion through sheer adaptability and presence. Life demands your attention in many directions simultaneously — this is not chaos but the dynamic dance of a full and purposeful existence. Stay flexible and playful.', rev: 'Too many balls in the air and something must drop. Over-commitment, scattered energy, and the pretense of managing more than is humanly possible leads to diminishing returns across all fronts. Prioritize ruthlessly — excellence in fewer areas trumps mediocrity in many.' },
    { kw: ['Teamwork', 'Collaboration', 'Craftsmanship', 'Learning'], up: 'The apprentice works alongside masters, learning through doing and contributing unique gifts to a shared creation. Collaboration, mentorship, and the sacred craft of turning skill into service elevate both individual and community. Your contribution matters — bring your best work to the collective effort.', rev: 'Teamwork falters as egos clash, standards slip, or you feel undervalued in a collaborative setting. The master-student relationship may be misaligned, or you resist the humility required to learn from others. No one builds a cathedral alone — find your place in the greater work.' },
    { kw: ['Security', 'Possessiveness', 'Control', 'Conservation'], up: 'The guardian of material security holds tightly to what has been earned, providing stability and protection for self and loved ones. Prudent resource management, wise investment, and the discipline to build lasting wealth characterize this energy. Protect your foundation — but not so tightly that nothing new can grow.', rev: 'Generosity has collapsed into greed, or financial anxiety has become an obsession that controls your every decision. You may be hoarding resources out of fear, blocking the natural flow of abundance. Loosen your grip — true security comes from trust in the cosmic flow, not from the size of your vault.' },
    { kw: ['Hardship', 'Isolation', 'Poverty', 'Spiritual seeking'], up: 'Material loss strips away the comfortable illusions of worldly security, leaving you to walk a cold and uncertain path. Yet within this hardship lives a profound spiritual teaching: when everything external is taken, you discover what is truly yours. Seek support, maintain faith, and know that this winter will pass.', rev: 'Recovery from financial or material hardship begins as new resources appear or a community opens its doors. The isolation of poverty gives way to renewed connection and shared abundance. The darkest period of scarcity was also, paradoxically, a time of discovering your deepest inner wealth.' },
    { kw: ['Generosity', 'Charity', 'Sharing', 'Giving and receiving'], up: 'The scales of generosity balance perfectly — what flows out returns multiplied, and what is received must also be given. This is the dharma of dana — sacred giving that honors both giver and receiver with equal dignity. Share your abundance freely and trust that the universe keeps impeccable accounts.', rev: 'The balance of giving and receiving has been disrupted. You may be giving beyond your means to earn approval, or selfishly hoarding when others are in genuine need. Debt, whether financial or karmic, demands honest attention. Restore the balance before it topples further.' },
    { kw: ['Patience', 'Investment', 'Long-term vision', 'Perseverance'], up: 'Seeds planted in previous seasons show their first green shoots, and the patient gardener allows nature its own timeline. Investments of time, energy, and resources begin their slow but certain yield. This is the karma yoga of work without attachment to immediate results — continue tending your garden with faith.', rev: 'Impatience with slow progress tempts you to abandon long-term plans prematurely. Or you have been waiting passively when active cultivation is needed. Assess honestly: are you being patient with a growing seed, or neglecting a garden that needs your daily attention?' },
    { kw: ['Mastery', 'Skill', 'Dedication', 'Quality'], up: 'The master craftsman creates with the absorbed devotion of one who has merged completely with their work. Years of disciplined practice have forged extraordinary skill that flows effortlessly through every creation. This is the state of dhyana — meditative absorption in your craft. Continue refining; mastery has no ceiling.', rev: 'Perfectionism has become a prison, or you take shortcuts that betray the quality your reputation was built upon. The joy has drained from work that once absorbed you completely. Reconnect with the beginner\'s passion that first called you to this craft — mastery must be sustained by love, not obligation.' },
    { kw: ['Luxury', 'Self-sufficiency', 'Refinement', 'Accomplishment'], up: 'The garden of your labors blooms in magnificent abundance, and you stand surrounded by the fruits of disciplined effort and wise stewardship. Material comfort, refined taste, and the quiet confidence of self-sufficiency characterize this moment. Enjoy the harvest with gratitude — you have built something genuinely beautiful.', rev: 'Financial setbacks or threats to your carefully built security create anxiety about the future. Over-dependence on material comfort may have made you vulnerable to market fluctuations or unexpected changes. Diversify your sense of security beyond the purely material.' },
    { kw: ['Legacy', 'Inheritance', 'Family wealth', 'Completion'], up: 'The culmination of material dharma: a legacy of abundance, stability, and generational wealth built through lifetimes of conscious effort. Family traditions, inherited wisdom, and the secure knowledge that your children will prosper characterize this completion. You have built something that outlasts you — this is the highest form of earthly success.', rev: 'Family disputes over inheritance, the burden of maintaining wealth you did not earn, or the painful discovery that material legacy alone does not equal spiritual fulfillment. Examine what you are truly passing on to the next generation — values endure longer than fortunes.' },
  ],
}

const COURT_DATA: Record<string, Record<string, { kw: string[]; up: string; rev: string }>> = {
  Wands: {
    Page: { kw: ['Enthusiasm', 'Exploration', 'Discovery', 'Free spirit'], up: 'A spark of creative fire arrives in the form of exciting news, a new venture, or the return of childlike enthusiasm for life. The Page of Wands carries messages of inspiration and invites you to explore uncharted territory with fearless curiosity and infectious optimism.', rev: 'Creative blocks, delayed news, or the frustrating gap between grand vision and practical follow-through. Enthusiasm wanes before it can be channeled into action. Temper impatience with realistic planning — not every spark needs to become a wildfire.' },
    Knight: { kw: ['Adventure', 'Passion', 'Impulsiveness', 'Action'], up: 'The knight charges forward with irresistible passion and the fierce determination to manifest vision into reality. Travel, adventure, and bold action characterize this restless energy. Channel the fire wisely — directed passion moves mountains, while scattered zeal merely singes the ground.', rev: 'Reckless impulsiveness burns bridges and alienates allies. The knight without direction becomes a menace rather than a hero. Frustration, delays in travel or projects, or the painful consequences of acting before thinking demand you temper your fire with wisdom.' },
    Queen: { kw: ['Confidence', 'Independence', 'Warmth', 'Determination'], up: 'The Queen of Wands radiates magnetic confidence and the warm charisma of one who has fully claimed her creative power. Independent, passionate, and fiercely determined, she inspires others through the sheer force of her authentic self-expression. Step into your sovereignty — the world responds to those who own their flame.', rev: 'Jealousy, self-doubt, or the dimming of a once-bright flame signals disconnection from your creative center. Demanding attention rather than naturally commanding it, or withdrawing your warmth as punishment. Rekindle your relationship with what makes you genuinely passionate.' },
    King: { kw: ['Leadership', 'Vision', 'Entrepreneurship', 'Inspiration'], up: 'The visionary king leads through inspiration rather than intimidation, setting bold direction while empowering others to contribute their unique flames to the collective fire. Natural entrepreneurship, strategic courage, and the ability to see opportunities where others see obstacles define this masterful energy.', rev: 'Tyrannical leadership, unrealistic expectations, or the dangerous hubris of a visionary who has stopped listening to counsel. Power wielded without wisdom becomes destructive. Return to the purpose that first inspired your leadership — serve the vision, not your ego.' },
  },
  Cups: {
    Page: { kw: ['Creativity', 'Intuition', 'Sensitivity', 'Inner child'], up: 'A tender message from the heart arrives — perhaps a creative inspiration, an intuitive knowing, or the stirring of feelings long dormant. The Page of Cups invites you to honor your emotional sensitivity as a gift, not a weakness, and to approach life with the wonder of an open heart.', rev: 'Emotional immaturity, creative blocks, or the pain of feeling too deeply in a world that rewards numbness. Fantasy and escapism replace genuine emotional engagement. Ground your sensitivity in practical expression — art, journaling, or trusted conversation can channel these waters productively.' },
    Knight: { kw: ['Romance', 'Charm', 'Imagination', 'Following the heart'], up: 'The romantic idealist rides forth, following the heart with poetic devotion and imaginative passion. Proposals, invitations to deeper emotional commitment, or creative opportunities that align with your deepest values arrive on wings of charm and grace. Let beauty guide your next steps.', rev: 'Moodiness, unrealistic romantic expectations, or the tendency to pursue fantasies rather than invest in real relationships. The knight of cups reversed may indicate emotional manipulation — whether you are the charmer or the charmed, check that feelings are genuine.' },
    Queen: { kw: ['Empathy', 'Nurturing', 'Intuition', 'Emotional wisdom'], up: 'The emotional oracle sits in serene wisdom, her intuitive gifts honed through years of deeply feeling the currents of the human heart. She heals through empathy, guides through compassion, and protects through unconditional love. Trust your emotional intelligence — it sees what logic cannot.', rev: 'Emotional martyrdom, codependency, or the exhaustion of giving without replenishment. Your empathy has become a burden rather than a gift, absorbing others\' pain without healthy boundaries. Fill your own cup first — you cannot pour from an empty vessel.' },
    King: { kw: ['Emotional mastery', 'Diplomacy', 'Wisdom', 'Calm'], up: 'The master of emotional intelligence navigates the deepest waters with calm authority and compassionate wisdom. Neither suppressing nor drowning in feeling, this king has achieved the rare balance of a fully open heart governed by a steady mind. Lead with empathy, decide with clarity, and heal through your grounded presence.', rev: 'Emotional manipulation, passive aggression, or the cold withdrawal of one who has learned to weaponize feelings rather than honor them. The king reversed may indicate a crisis of emotional leadership — either in your personal life or your capacity to hold space for others.' },
  },
  Swords: {
    Page: { kw: ['Curiosity', 'Mental agility', 'New ideas', 'Communication'], up: 'A brilliant new idea cuts through mental fog with the freshness of a young mind unencumbered by convention. Messages, studies, or investigations reveal truth that had been hidden. The Page of Swords brings intellectual excitement and the delightful curiosity that sees the world as an endless puzzle to solve.', rev: 'Gossip, mental scattered-ness, or the use of sharp intellect for petty purposes rather than genuine truth-seeking. All talk and no substance, or communication that wounds rather than illuminates. Focus your mental energy on what truly matters.' },
    Knight: { kw: ['Ambition', 'Action', 'Directness', 'Charged forward'], up: 'The intellectual warrior charges into battle with brilliant strategy and unstoppable determination. Fast-moving developments, decisive communication, and the courage to speak truth to power characterize this fierce energy. Act quickly on your convictions, but ensure your sword serves justice, not mere ambition.', rev: 'Ruthless ambition without moral compass, or reckless haste that creates conflict rather than resolution. The knight of swords reversed warns against cutting people down with words or charging into situations without adequate understanding. Speed is not always wisdom.' },
    Queen: { kw: ['Independence', 'Clear boundaries', 'Perception', 'Truth'], up: 'The queen of intellectual sovereignty sees through all pretense with piercing clarity and maintains her truth with unshakeable independence. Her boundaries are impeccable, her perceptions razor-sharp, and her counsel cuts straight to the heart of any matter. Embrace your inner authority to discern truth from deception.', rev: 'Coldness and emotional detachment have hardened into cruelty or isolation. Intellectual superiority masks deep loneliness or past betrayals that have made vulnerability feel dangerous. The sharpest mind must still make room for the warmth of human connection.' },
    King: { kw: ['Authority', 'Clear thinking', 'Ethics', 'Intellectual power'], up: 'The supreme strategist and arbiter of truth presides with the authority of a mind that has been tempered by both wisdom and experience. Just decisions, clear communication, and the ethical use of intellectual power define this masterful energy. Lead with your head, but let your heart verify every judgment.', rev: 'Abuse of intellectual authority, cold tyranny disguised as rationality, or the dangerous belief that being right justifies being cruel. Power corrupts even the sharpest mind when empathy is abandoned. Return to the ethical foundation that true authority requires.' },
  },
  Pentacles: {
    Page: { kw: ['Ambition', 'Diligence', 'Learning', 'New opportunity'], up: 'The earnest student of earthly wisdom approaches a new opportunity with diligence, humility, and genuine desire to learn. A scholarship, apprenticeship, or practical venture demands patience and committed effort. Trust the process of building skills — mastery is earned one dedicated day at a time.', rev: 'Lack of focus, poor study habits, or the frustration of slow progress in practical matters. The opportunity exists but you may not be applying yourself with the necessary discipline. Procrastination and distraction are the enemies of the material goals you claim to desire.' },
    Knight: { kw: ['Methodical', 'Reliable', 'Patient', 'Hard-working'], up: 'The steadfast worker advances toward their goal with unwavering patience and methodical dedication. Not flashy or fast, but absolutely reliable and ultimately unstoppable. This is the energy of sustained effort that builds empires brick by brick. Trust the process — your persistence will be rewarded handsomely.', rev: 'Stagnation, laziness, or being stuck in a rut disguised as routine. The methodical approach has become plodding, and progress has stalled. Or conversely, perfectionism prevents any movement at all. Sometimes good enough today is better than perfect never — start moving again.' },
    Queen: { kw: ['Practicality', 'Nurturing abundance', 'Generosity', 'Earth wisdom'], up: 'The queen of earthly abundance creates prosperity through practical wisdom, nurturing generosity, and an instinctive understanding of natural cycles. Her garden flourishes because she tends it with both skill and love. Apply this grounded, feminine wisdom to your material world — nourish what you wish to grow.', rev: 'Neglecting practical responsibilities while pursuing spiritual or emotional interests, or conversely, becoming so materially focused that soul-nourishment is forgotten. The queen reversed may also indicate financial dependency or using generosity as a control mechanism. Seek genuine balance between giving and growing.' },
    King: { kw: ['Wealth', 'Business acumen', 'Stability', 'Discipline'], up: 'The master of material dharma has built lasting wealth through disciplined effort, strategic vision, and the wisdom to know that true prosperity serves the greater good. Business acumen, financial stability, and the quiet authority of one who has proven their worth through tangible results. Your competence is your kingdom.', rev: 'Greed, workaholism, or the corrupting influence of wealth accumulated without spiritual purpose. The king of pentacles reversed may indicate financial mismanagement, or the painful realization that material success alone cannot fill the void of an unfulfilled soul. Rebalance your ledger — include what money cannot measure.' },
  },
}

// Generate Minor Arcana (56 cards)
function generateMinorArcana(): TarotCardDef[] {
  const suits = [
    { name: 'Wands' as const, element: 'Fire', astro: 'Aries/Leo/Sagittarius', color: '#FF6B6B', baseId: 22 },
    { name: 'Cups' as const, element: 'Water', astro: 'Cancer/Scorpio/Pisces', color: '#38BDF8', baseId: 36 },
    { name: 'Swords' as const, element: 'Air', astro: 'Gemini/Libra/Aquarius', color: '#C084FC', baseId: 50 },
    { name: 'Pentacles' as const, element: 'Earth', astro: 'Taurus/Virgo/Capricorn', color: '#4ADE80', baseId: 64 },
  ]

  const cards: TarotCardDef[] = []
  const courtNames = ['Page', 'Knight', 'Queen', 'King']

  for (const suit of suits) {
    const suitData = MINOR_DATA[suit.name]
    for (let n = 1; n <= 10; n++) {
      const d = suitData[n - 1]
      cards.push({
        id: suit.baseId + n - 1,
        name: n === 1 ? `Ace of ${suit.name}` : `${n} of ${suit.name}`,
        arcana: 'Minor', suit: suit.name, number: n,
        element: suit.element, astro: suit.astro,
        keywords: d.kw,
        uprightMeaning: d.up,
        reversedMeaning: d.rev,
        color: suit.color, symbol: n.toString()
      })
    }
    const courtSuit = COURT_DATA[suit.name]
    for (let c = 0; c < 4; c++) {
      const d = courtSuit[courtNames[c]]
      cards.push({
        id: suit.baseId + 10 + c,
        name: `${courtNames[c]} of ${suit.name}`,
        arcana: 'Minor', suit: suit.name, number: 11 + c,
        element: suit.element, astro: suit.astro,
        keywords: d.kw,
        uprightMeaning: d.up,
        reversedMeaning: d.rev,
        color: suit.color, symbol: courtNames[c][0]
      })
    }
  }
  return cards
}

const FULL_DECK: TarotCardDef[] = [...MAJOR_ARCANA, ...generateMinorArcana()]

// ─── Spread Configurations ─────────────────────────────────────────────────

interface SpreadConfig {
  id: string
  name: string
  cardCount: number
  positions: string[]
  description: string
  icon: string
  xp: number
}

const SPREADS: SpreadConfig[] = [
  { id: 'single', name: 'Single Card', cardCount: 1, positions: ["Today's Message"], description: 'One card reveals the energy of the moment.', icon: '✦', xp: 20 },
  { id: 'three', name: 'Three Cards', cardCount: 3, positions: ['Past', 'Present', 'Future'], description: 'Journey through time: what shaped you, where you stand, what awaits.', icon: '✦✦✦', xp: 30 },
  { id: 'celtic', name: 'Celtic Cross', cardCount: 10, positions: ['Present', 'Challenge', 'Past', 'Future', 'Above', 'Below', 'Advice', 'External', 'Hopes & Fears', 'Outcome'], description: 'The most complete tarot spread revealing every dimension of your situation.', icon: '✝', xp: 60 },
  { id: 'navagraha', name: 'Navagraha Spread', cardCount: 9, positions: ['Sun (Soul)', 'Moon (Mind)', 'Mars (Energy)', 'Mercury (Intellect)', 'Jupiter (Wisdom)', 'Venus (Love)', 'Saturn (Karma)', 'Rahu (Desires)', 'Ketu (Release)'], description: 'A unique fusion of tarot and Vedic astrology through the 9 planetary energies.', icon: '🪐', xp: 50 },
]

// ─── Deterministic daily card ─────────────────────────────────────────────

function getDailyCard(date: Date): TarotCardDef {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  return FULL_DECK[seed % FULL_DECK.length]
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getSpreadCards(spread: SpreadConfig, date: Date): { card: TarotCardDef; position: string; reversed: boolean }[] {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + spread.cardCount * 7
  const shuffled = seededShuffle(FULL_DECK, seed)
  return spread.positions.map((pos, i) => ({
    card: shuffled[i % shuffled.length],
    position: pos,
    reversed: ((seed + i * 13) % 4) === 0,
  }))
}

// ─── Card Visual Components ─────────────────────────────────────────────────

function CardFace({ card, reversed = false, size = 'md' }: { card: TarotCardDef; reversed?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-36 h-56' : size === 'sm' ? 'w-16 h-24' : 'w-24 h-36'
  const isMajor = card.arcana === 'Major'

  return (
    <div
      className={`${dims} relative rounded-xl overflow-hidden flex-shrink-0`}
      style={{
        transform: reversed ? 'rotate(180deg)' : undefined,
        background: `linear-gradient(145deg, ${card.color}22, ${card.color}11)`,
        border: `1px solid ${isMajor ? card.color + '99' : card.color + '44'}`,
        boxShadow: isMajor ? `0 0 20px ${card.color}33` : undefined,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ background: isMajor ? `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` : `${card.color}44` }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <div className="text-2xl font-cinzel font-bold"
          style={{ color: card.color, fontSize: size === 'lg' ? '2.5rem' : size === 'sm' ? '1rem' : '1.5rem' }}
        >{card.symbol}</div>
        {size !== 'sm' && (
          <div className="text-center px-1 font-cinzel leading-tight"
            style={{ color: card.color, fontSize: size === 'lg' ? '0.65rem' : '0.5rem', opacity: 0.9 }}
          >{card.name}</div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{ background: isMajor ? `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` : `${card.color}44` }}
      />
      {size !== 'sm' && (
        <>
          <div className="absolute top-1.5 left-1.5 text-xs" style={{ color: card.color + '88', fontSize: '0.4rem', fontFamily: 'Cinzel' }}>
            {card.arcana === 'Major' ? 'M' : card.suit?.[0]}
          </div>
          <div className="absolute bottom-1.5 right-1.5 text-xs rotate-180" style={{ color: card.color + '88', fontSize: '0.4rem', fontFamily: 'Cinzel' }}>
            {card.arcana === 'Major' ? 'M' : card.suit?.[0]}
          </div>
        </>
      )}
    </div>
  )
}

function CardBack({ size = 'md', width, height }: { size?: 'sm' | 'md' | 'lg'; width?: number; height?: number }) {
  const dims = size === 'lg' ? 'w-36 h-56' : size === 'sm' ? 'w-16 h-24' : 'w-24 h-36'
  const style: React.CSSProperties = {
    background: 'linear-gradient(145deg, #061628, #0D2137)',
    border: '1px solid rgba(255,179,71,0.3)',
  }
  if (width && height) {
    style.width = width
    style.height = height
  }
  return (
    <div className={`${width ? '' : dims} rounded-xl overflow-hidden flex-shrink-0 relative`} style={style}>
      <svg width="100%" height="100%" viewBox="0 0 100 160" preserveAspectRatio="none" className="absolute inset-0">
        <defs>
          <pattern id="bp" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M5,0 L10,5 L5,10 L0,5 Z" fill="none" stroke="rgba(255,179,71,0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="160" fill="url(#bp)"/>
        <rect x="8" y="8" width="84" height="144" rx="4" fill="none" stroke="rgba(255,179,71,0.2)" strokeWidth="1"/>
        <text x="50" y="85" textAnchor="middle" fill="rgba(255,179,71,0.4)" fontSize="24" fontFamily="serif">✦</text>
      </svg>
    </div>
  )
}

// ─── Flip Card Component ────────────────────────────────────────────────────

interface FlipCardProps {
  card: TarotCardDef
  reversed: boolean
  isFlipped: boolean
  onClick: () => void
  width?: number
  height?: number
  rotate?: number
}

function FlipCard({ card, reversed, isFlipped, onClick, width = 100, height = 174, rotate = 0 }: FlipCardProps) {
  return (
    <div
      className="tarot-card-wrapper cursor-pointer"
      style={{ width, height, transform: `rotate(${rotate}deg)` }}
      onClick={onClick}
    >
      <div className={`tarot-card-inner ${isFlipped ? 'flipped' : ''}`} style={{ width: '100%', height: '100%' }}>
        {/* tarot-card-front = face DOWN (back of physical card) */}
        <div className="tarot-card-front">
          <CardBack size="md" width={width} height={height} />
        </div>
        {/* tarot-card-back = face UP (front of physical card, revealed) */}
        <div className="tarot-card-back">
          <div
            className="rounded-xl overflow-hidden relative"
            style={{
              width,
              height,
              transform: reversed ? 'rotate(180deg)' : undefined,
              background: `linear-gradient(145deg, ${card.color}22, ${card.color}11)`,
              border: `1px solid ${card.arcana === 'Major' ? card.color + '99' : card.color + '44'}`,
              boxShadow: card.arcana === 'Major' ? `0 0 20px ${card.color}44` : undefined,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
              style={{ background: `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
              <div className="font-cinzel font-bold" style={{ color: card.color, fontSize: width > 120 ? '2.2rem' : '1.4rem' }}>
                {card.symbol}
              </div>
              <div className="text-center font-cinzel leading-tight" style={{ color: card.color, fontSize: width > 120 ? '0.6rem' : '0.45rem', opacity: 0.9 }}>
                {card.name}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
              style={{ background: `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card Detail Drawer ────────────────────────────────────────────────────

interface CardDetailDrawerProps {
  item: { card: TarotCardDef; position: string; reversed: boolean } | null
  planetContext?: string
  onClose: () => void
}

function CardDetailDrawer({ item, planetContext, onClose }: CardDetailDrawerProps) {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-cosmos/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-nebula border-l border-stardust/40 overflow-y-auto"
          >
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CardFace card={item.card} reversed={item.reversed} size="md" />
                  <div>
                    <h3 className="font-cinzel text-lg" style={{ color: item.card.color }}>
                      {item.card.name}
                    </h3>
                    {item.reversed && <div className="text-xs text-rose-400 font-cinzel">↕ Reversed</div>}
                    <div className="text-xs text-slate-400 font-cinzel mt-0.5">{item.position}</div>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-200 mt-1">
                  <X size={18} />
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">
                  {item.card.arcana === 'Major' ? 'Major Arcana' : `${item.card.suit} · Minor`}
                </span>
                {item.card.astro && (
                  <span className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">
                    {item.card.astro}
                  </span>
                )}
                {item.card.element && (
                  <span className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">
                    {item.card.element}
                  </span>
                )}
              </div>

              {/* Keywords */}
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-2">Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.card.keywords.map(k => (
                    <span key={k} className="text-xs bg-gold/10 border border-gold/20 text-gold/80 px-2 py-0.5 rounded-full font-cinzel">{k}</span>
                  ))}
                </div>
              </div>

              {/* Meaning */}
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">
                  {item.reversed ? 'Reversed Meaning' : 'Upright Meaning'}
                </div>
                <p className="font-cormorant text-slate-200 text-base leading-relaxed">
                  {item.reversed ? item.card.reversedMeaning : item.card.uprightMeaning}
                </p>
              </div>

              {/* Both meanings */}
              <div className="space-y-3 pt-2 border-t border-stardust/30">
                <div>
                  <div className="text-xs font-cinzel text-emerald-400/70 uppercase tracking-wider mb-1">Upright</div>
                  <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{item.card.uprightMeaning}</p>
                </div>
                <div>
                  <div className="text-xs font-cinzel text-rose-400/70 uppercase tracking-wider mb-1">Reversed</div>
                  <p className="font-cormorant text-slate-400 text-sm leading-relaxed">{item.card.reversedMeaning}</p>
                </div>
              </div>

              {/* Planet context for Navagraha */}
              {planetContext && (
                <div className="glass-card p-3 border border-gold/20">
                  <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">Planetary Interpretation</div>
                  <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{planetContext}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Spread Layout Components ──────────────────────────────────────────────

const NAVAGRAHA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
const NAVAGRAHA_COLORS: Record<string, string> = {
  Sun: '#FFB347', Moon: '#C0C0FF', Mars: '#FF6B6B', Mercury: '#7DF9FF',
  Jupiter: '#FFD700', Venus: '#FFB6C1', Saturn: '#9B87F5', Rahu: '#888', Ketu: '#A0522D'
}

function getNavagrahaContext(position: string, card: TarotCardDef, reversed: boolean): string {
  const planet = position.split(' ')[0]
  const meaning = reversed ? card.reversedMeaning : card.uprightMeaning
  const contexts: Record<string, string> = {
    Sun: 'In the Sun position, this card speaks to your soul\'s core purpose, vitality, and how you shine your authentic self in the world.',
    Moon: 'In the Moon position, this card reveals your emotional landscape, subconscious patterns, and the intuitive currents running beneath your daily life.',
    Mars: 'In the Mars position, this card illuminates your drive, ambition, courage, and how you channel your energy toward your desires.',
    Mercury: 'In the Mercury position, this card speaks to your communication style, mental agility, and the way you process and share ideas.',
    Jupiter: 'In the Jupiter position, this card reflects your wisdom, philosophy, spiritual growth, and the blessings coming your way.',
    Venus: 'In the Venus position, this card reveals your relationship with love, beauty, pleasure, and material abundance.',
    Saturn: 'In the Saturn position, this card speaks to your karmic lessons, discipline, the structures you must build, and debts to be repaid.',
    Rahu: 'In the Rahu position, this card reveals your worldly desires, obsessions, and the karmic direction your soul craves in this lifetime.',
    Ketu: 'In the Ketu position, this card illuminates what you must release, past-life wisdom you carry, and your path toward spiritual liberation.',
  }
  return `${contexts[planet] || ''} The card ${card.name} ${reversed ? '(reversed) ' : ''}suggests: ${meaning}`
}

interface SpreadLayoutProps {
  spread: SpreadConfig
  cards: { card: TarotCardDef; position: string; reversed: boolean }[]
  flipped: Set<number>
  onFlip: (idx: number) => void
  onCardClick: (idx: number) => void
}

function SingleSpreadLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <FlipCard
        card={cards[0].card}
        reversed={cards[0].reversed}
        isFlipped={flipped.has(0)}
        onClick={() => flipped.has(0) ? onCardClick(0) : onFlip(0)}
        width={160}
        height={280}
      />
      <div className="text-center">
        <div className="text-xs font-cinzel text-gold/60">{cards[0].position}</div>
        {flipped.has(0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-sm font-cinzel mt-1" style={{ color: cards[0].card.color }}>{cards[0].card.name}</div>
            {cards[0].reversed && <div className="text-xs text-rose-400">↕ Reversed</div>}
            <div className="text-xs text-slate-500 mt-1 font-cormorant">Click to see full meaning</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ThreeCardSpreadLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-end gap-4 sm:gap-6">
        {cards.map((item, idx) => {
          const isCenter = idx === 1
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <FlipCard
                card={item.card}
                reversed={item.reversed}
                isFlipped={flipped.has(idx)}
                onClick={() => flipped.has(idx) ? onCardClick(idx) : onFlip(idx)}
                width={isCenter ? 120 : 100}
                height={isCenter ? 210 : 174}
              />
              <div className="text-center max-w-20">
                <div className="text-xs font-cinzel text-gold/60">{item.position}</div>
                {flipped.has(idx) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-xs font-cinzel mt-1" style={{ color: item.card.color }}>{item.card.name}</div>
                    {item.reversed && <div className="text-xs text-rose-400">↕</div>}
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CelticCrossLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  // Standard Celtic Cross positions: 0=center, 1=crossing(rotated), 2=below, 3=left, 4=above, 5=right, 6-9=staff right column (bottom to top)
  const cw = 80
  const ch = 140

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[520px] relative mx-auto" style={{ height: 560 }}>
        {/* Cross section */}
        {/* Position 5 - Above (top center) */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 120, top: 20 }}>
          <FlipCard card={cards[4].card} reversed={cards[4].reversed} isFlipped={flipped.has(4)}
            onClick={() => flipped.has(4) ? onCardClick(4) : onFlip(4)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center">{cards[4].position}</div>
        </div>

        {/* Position 2 - Below (bottom center) */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 120, top: 310 }}>
          <FlipCard card={cards[5].card} reversed={cards[5].reversed} isFlipped={flipped.has(5)}
            onClick={() => flipped.has(5) ? onCardClick(5) : onFlip(5)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center">{cards[5].position}</div>
        </div>

        {/* Position 4 - Left */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 20, top: 175 }}>
          <FlipCard card={cards[3].card} reversed={cards[3].reversed} isFlipped={flipped.has(3)}
            onClick={() => flipped.has(3) ? onCardClick(3) : onFlip(3)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center max-w-20">{cards[3].position}</div>
        </div>

        {/* Position 6 - Right */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 220, top: 175 }}>
          <FlipCard card={cards[2].card} reversed={cards[2].reversed} isFlipped={flipped.has(2)}
            onClick={() => flipped.has(2) ? onCardClick(2) : onFlip(2)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center max-w-20">{cards[2].position}</div>
        </div>

        {/* Position 0 - Center card */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 120, top: 175 }}>
          <FlipCard card={cards[0].card} reversed={cards[0].reversed} isFlipped={flipped.has(0)}
            onClick={() => flipped.has(0) ? onCardClick(0) : onFlip(0)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center">{cards[0].position}</div>
        </div>

        {/* Position 1 - Crossing card (rotated 90deg) */}
        <div className="absolute" style={{ left: 120 + (cw - ch) / 2, top: 175 + (ch - cw) / 2 }}>
          <FlipCard card={cards[1].card} reversed={cards[1].reversed} isFlipped={flipped.has(1)}
            onClick={() => flipped.has(1) ? onCardClick(1) : onFlip(1)} width={ch} height={cw} rotate={0} />
        </div>

        {/* Staff column (right side) - positions 6,7,8,9 from bottom to top */}
        {[9, 8, 7, 6].map((cardIdx, i) => (
          <div key={cardIdx} className="absolute flex flex-col items-center gap-1" style={{ left: 340, top: 20 + i * (ch + 20) }}>
            <FlipCard card={cards[cardIdx].card} reversed={cards[cardIdx].reversed} isFlipped={flipped.has(cardIdx)}
              onClick={() => flipped.has(cardIdx) ? onCardClick(cardIdx) : onFlip(cardIdx)} width={cw} height={ch} />
            <div className="text-xs font-cinzel text-gold/50 text-center max-w-20">{cards[cardIdx].position}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NavagrahaSpreadLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  const cw = 90
  const ch = 156
  const planets = NAVAGRAHA_PLANETS

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {cards.map((item, idx) => {
          const planet = planets[idx]
          const planetColor = NAVAGRAHA_COLORS[planet] ?? '#FFB347'
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <FlipCard
                  card={item.card}
                  reversed={item.reversed}
                  isFlipped={flipped.has(idx)}
                  onClick={() => flipped.has(idx) ? onCardClick(idx) : onFlip(idx)}
                  width={cw}
                  height={ch}
                />
                {/* Planet glow ring */}
                {flipped.has(idx) && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ boxShadow: `0 0 16px ${planetColor}55`, border: `1px solid ${planetColor}44` }} />
                )}
              </div>
              <div className="text-center">
                <div className="text-xs font-cinzel font-bold" style={{ color: planetColor }}>{planet}</div>
                {flipped.has(idx) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-xs font-cinzel leading-tight" style={{ color: item.card.color }}>{item.card.name}</div>
                    {item.reversed && <div className="text-xs text-rose-400">↕</div>}
                    <div className="text-xs text-slate-500 font-cormorant">tap for details</div>
                  </motion.div>
                )}
                {!flipped.has(idx) && (
                  <div className="text-xs text-slate-500 font-cormorant">{item.position.split('(')[1]?.replace(')', '') ?? item.position}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Spread View (Full Page Overlay) ──────────────────────────────────────

interface SpreadViewProps {
  spread: SpreadConfig
  date: Date
  onBack: () => void
  onComplete: (cards: { card: TarotCardDef; position: string; reversed: boolean }[], question?: string, interpretation?: string) => void
}

function SpreadView({ spread, date, onBack, onComplete }: SpreadViewProps) {
  const cards = useMemo(() => getSpreadCards(spread, date), [spread, date])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [drawerItem, setDrawerItem] = useState<{ card: TarotCardDef; position: string; reversed: boolean; idx: number } | null>(null)
  const [interpretation, setInterpretation] = useState('')
  const [loadingInterp, setLoadingInterp] = useState(false)
  const [showInterpSection, setShowInterpSection] = useState(false)
  const [question, setQuestion] = useState('')
  const { addXP } = useStore()

  const allFlipped = flipped.size === cards.length

  const flipCard = useCallback((idx: number) => {
    if (!flipped.has(idx)) {
      setFlipped(prev => new Set([...prev, idx]))
      addXP(5, 'TAROT_READING')
    }
  }, [flipped, addXP])

  function flipAll() {
    const allIndices = new Set(cards.map((_, i) => i))
    setFlipped(allIndices)
    addXP(5, 'TAROT_READING')
  }

  function openDrawer(idx: number) {
    setDrawerItem({ ...cards[idx], idx })
  }

  async function getInterpretation() {
    setLoadingInterp(true)
    try {
      const res = await fetch('/api/v1/tarot/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spread: spread.name,
          cards: cards.map(c => ({ name: c.card.name, position: c.position, reversed: c.reversed }))
        }),
        signal: AbortSignal.timeout(8000),
      }).catch(() => null)

      if (res?.ok) {
        const data = await res.json()
        setInterpretation(data.interpretation || data.text || '')
      } else {
        const summary = cards.map(c =>
          `${c.position}: ${c.card.name}${c.reversed ? ' (reversed)' : ''} — ${c.reversed ? c.card.reversedMeaning : c.card.uprightMeaning}`
        ).join('\n\n')
        setInterpretation(`Cosmic Reading Summary:\n\n${summary}\n\nThe cards invite you to reflect deeply on these themes as they weave through your current journey.`)
      }
      addXP(spread.xp, 'TAROT_READING')
    } finally {
      setLoadingInterp(false)
    }
  }

  const layoutProps: SpreadLayoutProps = { spread, cards, flipped, onFlip: flipCard, onCardClick: openDrawer }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-cinzel text-gold/60 hover:text-gold transition-colors">
          <ChevronLeft size={14} /> Spreads
        </button>
        <div className="text-center">
          <h2 className="font-cinzel text-lg text-gold">{spread.icon} {spread.name}</h2>
          <p className="font-cormorant text-xs text-slate-400">
            {flipped.size}/{cards.length} cards revealed · Click a card to flip
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-cinzel text-gold/50">
          <Zap size={12} className="text-gold" />+{spread.xp} XP
        </div>
      </div>

      {/* Question / Intention */}
      {flipped.size === 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
          <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-2">Set Your Intention</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What's on your mind? (optional)"
            className="w-full bg-stardust/30 border border-stardust/50 rounded-xl px-4 py-2.5 text-white font-cormorant text-sm placeholder-slate-500 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </motion.div>
      )}

      {/* Flip All button */}
      {!allFlipped && flipped.size < cards.length && (
        <div className="flex justify-center">
          <button
            onClick={flipAll}
            className="flex items-center gap-2 bg-stardust/40 border border-stardust/60 text-slate-300 font-cinzel text-xs px-4 py-2 rounded-full hover:border-gold/40 hover:text-gold transition-all"
          >
            <Layers size={12} /> Flip All Cards
          </button>
        </div>
      )}

      {/* Spread layout */}
      <div className="glass-card p-4 sm:p-6">
        {spread.id === 'single' && <SingleSpreadLayout {...layoutProps} />}
        {spread.id === 'three' && <ThreeCardSpreadLayout {...layoutProps} />}
        {spread.id === 'celtic' && <CelticCrossLayout {...layoutProps} />}
        {spread.id === 'navagraha' && <NavagrahaSpreadLayout {...layoutProps} />}
      </div>

      {/* Revealed card meanings (compact) */}
      {flipped.size > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-wider">Revealed Cards</h3>
          <div className="space-y-2">
            {Array.from(flipped).sort((a, b) => a - b).map(idx => {
              const { card, position, reversed } = cards[idx]
              return (
                <button
                  key={idx}
                  onClick={() => openDrawer(idx)}
                  className="w-full flex gap-3 items-center p-2.5 rounded-xl hover:bg-stardust/30 transition-colors text-left"
                >
                  <CardFace card={card} reversed={reversed} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-sm" style={{ color: card.color }}>{card.name}</span>
                      {reversed && <span className="text-xs text-rose-400">↕</span>}
                    </div>
                    <div className="text-xs text-gold/50 font-cinzel">{position}</div>
                    <p className="font-cormorant text-xs text-slate-400 truncate leading-tight mt-0.5">
                      {reversed ? card.reversedMeaning : card.uprightMeaning}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Get Reading section */}
      {allFlipped && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
          {!showInterpSection ? (
            <div className="text-center space-y-3">
              <p className="font-cormorant text-slate-300 text-lg">All {cards.length} cards revealed.</p>
              <p className="font-cormorant text-slate-400 text-sm">The cosmos has spoken through these sacred symbols. Receive the full interpretation?</p>
              <button
                onClick={() => setShowInterpSection(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-cinzel text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg"
              >
                <Star size={14} /> Interpret This Spread
              </button>
            </div>
          ) : !interpretation ? (
            <div className="space-y-3">
              <h3 className="font-cinzel text-sm text-gold/70 uppercase tracking-wider text-center">Cosmic Interpretation</h3>
              {loadingInterp ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-stardust/40 rounded-full w-full" />
                  <div className="h-3 bg-stardust/30 rounded-full w-5/6" />
                  <div className="h-3 bg-stardust/40 rounded-full w-4/6" />
                  <div className="h-3 bg-stardust/30 rounded-full w-full" />
                  <div className="h-3 bg-stardust/40 rounded-full w-3/4" />
                  <p className="text-center text-xs font-cormorant text-slate-500 pt-2">Reading the cosmic patterns...</p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={getInterpretation}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-cinzel text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                  >
                    <Star size={14} /> Get Cosmic Interpretation
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-cinzel text-sm text-gold/70 uppercase tracking-wider">Cosmic Interpretation</h3>
              <p className="font-cormorant text-slate-200 leading-relaxed whitespace-pre-line text-base">{interpretation}</p>
              <div className="flex gap-2 flex-wrap pt-2 border-t border-stardust/30">
                <button
                  onClick={() => onComplete(cards, question, interpretation)}
                  className="flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-sm font-cinzel px-4 py-2 rounded-xl hover:bg-gold/20 transition-colors"
                >
                  <Star size={14} /> Save Reading
                </button>
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 bg-stardust/30 text-slate-300 text-sm font-cinzel px-4 py-2 rounded-xl hover:bg-stardust/50 transition-colors"
                >
                  New Spread
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Card detail drawer */}
      <CardDetailDrawer
        item={drawerItem ? cards[drawerItem.idx] : null}
        planetContext={
          drawerItem && spread.id === 'navagraha'
            ? getNavagrahaContext(cards[drawerItem.idx].position, cards[drawerItem.idx].card, cards[drawerItem.idx].reversed)
            : undefined
        }
        onClose={() => setDrawerItem(null)}
      />
    </motion.div>
  )
}

// ─── Card Library ──────────────────────────────────────────────────────────

function CardLibrary({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Major' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles'>('All')
  const [selected, setSelected] = useState<TarotCardDef | null>(null)

  const filtered = useMemo(() => {
    let cards = FULL_DECK
    if (filter !== 'All') {
      if (filter === 'Major') cards = cards.filter(c => c.arcana === 'Major')
      else cards = cards.filter(c => c.suit === filter)
    }
    if (search) {
      const q = search.toLowerCase()
      cards = cards.filter(c => c.name.toLowerCase().includes(q) || c.keywords.some(k => k.toLowerCase().includes(q)))
    }
    return cards
  }, [search, filter])

  const filterOptions = ['All', 'Major', 'Wands', 'Cups', 'Swords', 'Pentacles'] as const

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-cinzel text-gold/60 hover:text-gold">
          <ChevronLeft size={14} /> Back
        </button>
        <h2 className="font-cinzel text-xl text-gold">Card Library</h2>
        <span className="text-sm text-slate-400 font-cormorant">{filtered.length} cards</span>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full bg-stardust/40 border border-stardust/60 rounded-xl pl-9 pr-4 py-2.5 text-white font-cormorant text-sm placeholder-slate-500 focus:outline-none focus:border-gold/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-xs font-cinzel px-3 py-1.5 rounded-full border transition-all ${
                filter === f ? 'bg-gold/20 text-gold border-gold/40' : 'text-slate-400 border-stardust/40 hover:border-gold/30'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {filtered.map(card => (
          <motion.div
            key={card.id}
            whileHover={{ y: -3, scale: 1.05 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSelected(card)}
            className="cursor-pointer"
          >
            <CardFace card={card} size="sm" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cosmos/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <CardFace card={selected} size="md" />
                  <div>
                    <h3 className="font-cinzel text-xl" style={{ color: selected.color }}>{selected.name}</h3>
                    <div className="text-sm text-slate-400 font-cormorant">
                      {selected.arcana === 'Major' ? 'Major Arcana' : `${selected.suit} · Minor Arcana`}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{selected.astro} · {selected.element}</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">Keywords</div>
                <div className="flex flex-wrap gap-1">
                  {selected.keywords.map(k => (
                    <span key={k} className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">Upright</div>
                <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{selected.uprightMeaning}</p>
              </div>
              <div>
                <div className="text-xs font-cinzel text-rose-400/60 uppercase tracking-wider mb-1">Reversed</div>
                <p className="font-cormorant text-slate-400 text-sm leading-relaxed">{selected.reversedMeaning}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Tarot Home ────────────────────────────────────────────────────────────

function TarotHome({
  onSelectSpread,
  onLibrary,
  onHistory,
}: {
  onSelectSpread: (s: SpreadConfig) => void
  onLibrary: () => void
  onHistory: () => void
}) {
  const { tarotReadings } = useStore()
  const today = useMemo(() => new Date(), [])
  const dailyCard = useMemo(() => getDailyCard(today), [today])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="font-cinzel text-3xl font-bold text-gold-gradient">Tarot Oracle</h1>
        <p className="font-cormorant text-slate-400 mt-2 text-lg">Let the ancient wisdom of 78 cards illuminate your path</p>
      </div>

      {/* Daily Card */}
      <div className="glass-card p-6 shimmer-border">
        <div className="flex items-center gap-2 mb-4">
          <Star size={14} className="text-gold" />
          <h2 className="font-cinzel text-sm uppercase tracking-widest text-gold">Today's Card</h2>
          <span className="text-xs text-slate-500 font-cormorant ml-auto">
            {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <CardFace card={dailyCard} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-cinzel text-xl" style={{ color: dailyCard.color }}>{dailyCard.name}</h3>
              {dailyCard.arcana === 'Major' && (
                <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded-full font-cinzel">Major</span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-cinzel mb-3">{dailyCard.astro} · {dailyCard.element}</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {dailyCard.keywords.map(k => (
                <span key={k} className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">{k}</span>
              ))}
            </div>
            <p className="font-cormorant text-slate-300 leading-relaxed">{dailyCard.uprightMeaning}</p>
          </div>
        </div>
      </div>

      {/* Spreads */}
      <div>
        <h2 className="font-cinzel text-sm uppercase tracking-widest text-gold/60 mb-3">Choose a Spread</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SPREADS.map(spread => (
            <motion.button
              key={spread.id}
              whileHover={{ y: -3 }}
              onClick={() => onSelectSpread(spread)}
              className="glass-card p-5 text-left hover:border-gold/40 transition-all border border-stardust/40"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl font-cinzel text-gold/60">{spread.icon}</div>
                <div className="flex items-center gap-1 text-xs font-cinzel text-gold/50">
                  <Zap size={10} />+{spread.xp}
                </div>
              </div>
              <h3 className="font-cinzel font-bold text-white mb-1">{spread.name}</h3>
              <div className="text-xs text-gold/50 font-cinzel mb-2">{spread.cardCount} card{spread.cardCount > 1 ? 's' : ''}</div>
              <p className="font-cormorant text-slate-400 text-sm">{spread.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onLibrary}
          className="glass-card p-4 flex items-center gap-3 hover:border-gold/40 transition-all border border-stardust/40"
        >
          <BookOpen size={20} className="text-gold/60" />
          <div className="text-left">
            <div className="font-cinzel text-sm text-white">Card Library</div>
            <div className="font-cormorant text-xs text-slate-400">All 78 cards</div>
          </div>
        </button>
        <button
          onClick={onHistory}
          className="glass-card p-4 flex items-center gap-3 hover:border-gold/40 transition-all border border-stardust/40"
        >
          <Clock size={20} className="text-gold/60" />
          <div className="text-left">
            <div className="font-cinzel text-sm text-white">History</div>
            <div className="font-cormorant text-xs text-slate-400">{tarotReadings.length} reading{tarotReadings.length !== 1 ? 's' : ''}</div>
          </div>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Reading History ───────────────────────────────────────────────────────

function ReadingHistory({ onBack }: { onBack: () => void }) {
  const { tarotReadings } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-cinzel text-gold/60 hover:text-gold">
          <ChevronLeft size={14} /> Back
        </button>
        <h2 className="font-cinzel text-xl text-gold">Reading History</h2>
      </div>

      {tarotReadings.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="text-4xl mb-3">🃏</div>
          <p className="font-cinzel text-slate-400">No readings yet. Begin your tarot journey!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tarotReadings.slice(0, 20).map(reading => (
            <div key={reading.id} className="glass-card p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === reading.id ? null : reading.id)}>
              {reading.question && (
                <p className="font-cormorant text-xs text-purple-300/70 italic mb-2">"{reading.question}"</p>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-cinzel text-sm text-gold">{reading.spreadType}</div>
                  <div className="font-cormorant text-xs text-slate-500 mt-0.5">
                    <Clock size={10} className="inline mr-1" />
                    {new Date(reading.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {reading.cards.slice(0, 5).map((c, i) => (
                  <div key={i} className={`text-xs font-cinzel px-2 py-1 rounded ${c.isReversed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-stardust/30 text-slate-400'}`}>
                    {c.cardName || `Card ${i + 1}`}
                    {c.isReversed && ' ↕'}
                  </div>
                ))}
                {reading.cards.length > 5 && <span className="text-xs text-slate-500">+{reading.cards.length - 5} more</span>}
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expandedId === reading.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-3 border-t border-stardust/20 space-y-3">
                      {/* All cards with positions */}
                      <div className="space-y-1.5">
                        {reading.cards.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="font-cinzel text-gold/50 w-28 flex-shrink-0">{c.position}</span>
                            <span className={`font-cinzel ${c.isReversed ? 'text-rose-400' : 'text-slate-300'}`}>
                              {c.cardName}{c.isReversed ? ' (Reversed)' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Saved interpretation */}
                      {reading.interpretation && (
                        <div className="bg-stardust/20 rounded-lg p-3">
                          <div className="font-cinzel text-[10px] text-gold/50 uppercase tracking-wider mb-1">Interpretation</div>
                          <p className="font-cormorant text-slate-300 text-sm leading-relaxed whitespace-pre-line">{reading.interpretation}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Tarot Page ───────────────────────────────────────────────────────

type TarotView = 'home' | 'spread' | 'library' | 'history'

export default function TarotPage() {
  const { addTarotReading } = useStore()
  const [view, setView] = useState<TarotView>('home')
  const [activeSpread, setActiveSpread] = useState<SpreadConfig | null>(null)
  const today = useMemo(() => new Date(), [])

  function handleSelectSpread(spread: SpreadConfig) {
    setActiveSpread(spread)
    setView('spread')
  }

  const [lastQuestion, setLastQuestion] = useState('')
  const [lastInterpretation, setLastInterpretation] = useState('')

  function handleReadingComplete(cards: { card: TarotCardDef; position: string; reversed: boolean }[], q?: string, interp?: string) {
    if (!activeSpread) return
    if (q) setLastQuestion(q)
    if (interp) setLastInterpretation(interp)
    const reading: TarotReading = {
      id: generateId(),
      spreadType: activeSpread.name,
      question: q || lastQuestion,
      cards: cards.map((c) => ({
        cardId: c.card.id,
        cardName: c.card.name,
        position: c.position,
        isReversed: c.reversed,
      })),
      interpretation: interp || lastInterpretation,
      createdAt: new Date().toISOString(),
    }
    addTarotReading(reading)
    setView('home')
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TarotHome
              onSelectSpread={handleSelectSpread}
              onLibrary={() => setView('library')}
              onHistory={() => setView('history')}
            />
          </motion.div>
        )}
        {view === 'spread' && activeSpread && (
          <motion.div key="spread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SpreadView
              spread={activeSpread}
              date={today}
              onBack={() => setView('home')}
              onComplete={handleReadingComplete}
            />
          </motion.div>
        )}
        {view === 'library' && (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardLibrary onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReadingHistory onBack={() => setView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
