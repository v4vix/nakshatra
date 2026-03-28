// Rule-Based Vedic Astrology Interpretation Engine
// Uses authentic classical Vedic astrological data

export interface KundliInterpretationParams {
  lagna?: string;
  moonSign?: string;
  sunSign?: string;
  planets?: Array<{ planet: string; rashi: string; house: number; isRetrograde?: boolean }>;
  yogas?: string[];
  doshas?: string[];
  currentDasha?: string;
  nakshatraName?: string;
}

export interface TarotInterpretation {
  cardName: string;
  position: string;
  isReversed: boolean;
  meaning: string;
  advice: string;
}

export interface NumerologyInterpretation {
  lifePathNumber: number;
  expressionNumber?: number;
  meaning: string;
  traits: string[];
  challenges: string[];
  advice: string;
}

export interface VastuInterpretation {
  zone: string;
  element: string;
  ruling: string;
  description: string;
  defectAnalysis: string[];
  remedies: string[];
}

export interface ShlokaEntry {
  verse: string;
  source: string;
  translation: string;
  meaning: string;
}

// ─── Rashi (Sign) Data ───────────────────────────────────────────────────────

const LAGNA_DESCRIPTIONS: Record<string, string> = {
  Mesha: 'Mesha (Aries) Lagna bestows a dynamic, pioneering spirit. Ruled by Mars, native is energetic, courageous, and self-motivated. The head and face are prominent features. Natural leadership ability combined with impatience; tends to initiate projects but may struggle to complete them. Fire sign that drives one toward independence and direct action.',
  Vrishabha: 'Vrishabha (Taurus) Lagna gives a steady, patient, and sensual nature. Ruled by Venus, the native appreciates beauty, luxury, and material security. Known for persistence and determination. Strong attachment to possessions and comfort. Practical and reliable, with a natural talent for finance and aesthetics. The throat and neck are significant.',
  Mithuna: 'Mithuna (Gemini) Lagna produces an intellectual, communicative, and versatile nature. Ruled by Mercury, the native is curious, adaptable, and articulate. Dual in nature, often torn between two paths. Excels in writing, speaking, and trade. Quick-witted but may be inconsistent. The arms and shoulders carry karmic significance.',
  Karka: 'Karka (Cancer) Lagna bestows a nurturing, intuitive, and emotionally sensitive nature. Ruled by the Moon, the native is deeply connected to home, family, and tradition. Strong maternal or paternal instincts. Psychic sensitivity and strong memory. Moods fluctuate with lunar cycles. The chest and stomach are physically prominent.',
  Simha: 'Simha (Leo) Lagna gives a regal, generous, and proud nature. Ruled by the Sun, the native has natural authority and commands respect. Creative, dramatic, and loving of attention. Loyal and warm-hearted but can be egotistical. Natural performer and leader. The heart and upper spine hold karmic significance.',
  Kanya: 'Kanya (Virgo) Lagna produces an analytical, service-oriented, and discriminating nature. Ruled by Mercury, the native excels in detail work, health sciences, and problem-solving. Critical mind with high standards. May struggle with perfectionism and worry. Strong capacity for healing and service. The digestive system is significant.',
  Tula: 'Tula (Libra) Lagna bestows a diplomatic, aesthetic, and relationship-focused nature. Ruled by Venus, the native seeks balance, harmony, and justice. Natural mediator with a strong sense of fairness. May be indecisive. Gifted in arts, law, and partnerships. Lower back and kidneys are physically significant.',
  Vrishchika: 'Vrishchika (Scorpio) Lagna gives an intense, transformative, and penetrating nature. Ruled by Mars (and Ketu by some systems), the native has deep psychological insight and willpower. Secretive and magnetic. Drawn to mysteries, occult, and healing. May carry deep emotional wounds. The reproductive system is significant.',
  Dhanu: 'Dhanu (Sagittarius) Lagna produces a philosophical, adventurous, and optimistic nature. Ruled by Jupiter, the native is expansive, truth-seeking, and religious. Natural teacher, explorer, and philosopher. May be blunt and overconfident. Drawn to higher learning, spirituality, and foreign lands. The hips and thighs are significant.',
  Makara: 'Makara (Capricorn) Lagna bestows an ambitious, disciplined, and responsible nature. Ruled by Saturn, the native is practical, patient, and achievement-oriented. Slow and steady rise in life. Natural aptitude for management, government, and long-term planning. May be overly serious. The knees and skeletal system are significant.',
  Kumbha: 'Kumbha (Aquarius) Lagna gives a humanitarian, innovative, and unconventional nature. Ruled by Saturn (and Rahu by some systems), the native is intellectually oriented toward social reform. Idealistic and independent. Drawn to science, technology, and collective causes. The ankles and circulatory system are significant.',
  Meena: 'Meena (Pisces) Lagna produces an intuitive, compassionate, and spiritually inclined nature. Ruled by Jupiter, the native is sensitive, empathetic, and imaginative. Strong psychic and artistic gifts. May be escapist or lack firm boundaries. Drawn to spirituality, healing arts, and service. The feet and lymphatic system are significant.',
};

const MOON_SIGN_DESCRIPTIONS: Record<string, string> = {
  Mesha: 'Moon in Mesha creates emotional impulsiveness and a need for excitement. The mind is fiery, quick to react, and craves independence. Emotional renewal comes through action and challenge. Difficulty sustaining long emotional commitments without variety.',
  Vrishabha: 'Moon in Vrishabha (exaltation) gives emotional stability, sensory richness, and a strong need for security. The mind is steady, patient, and comforted by beauty and material ease. Deep attachment to home and loved ones. Excellent memory and artistic sensitivity.',
  Mithuna: 'Moon in Mithuna creates a restless, mentally active emotional nature. Communication and intellectual stimulation are emotional needs. Quick emotional changes; processes feelings through talking and thinking. Dual nature may cause emotional ambivalence.',
  Karka: 'Moon in Karka (own sign) intensifies emotional sensitivity, intuition, and nurturing instincts. Deeply connected to mother and home. Rich inner life and vivid imagination. Moods fluctuate significantly; needs emotional security and belonging.',
  Simha: 'Moon in Simha gives emotional pride, warmth, and a need for appreciation. The heart is generous but craves recognition. Dramatic emotional expression. Loyalty and protectiveness toward loved ones. Creative and performative emotional style.',
  Kanya: 'Moon in Kanya creates a discriminating, analytical emotional nature. Feelings are processed intellectually; the mind seeks to categorize and improve. Prone to worry and self-criticism. Finds emotional satisfaction in service and practical help.',
  Tula: 'Moon in Tula creates a need for harmony, beauty, and partnership. Uncomfortable with conflict; seeks balance in all relationships. Charming and socially adept emotional expression. Indecisiveness in emotional matters; influenced by others\' opinions.',
  Vrishchika: 'Moon in Vrishchika (debilitation) creates intense, transformative emotional depths. Feelings run deep and are rarely expressed openly. Strong psychological insight but potential for jealousy, obsession, or emotional manipulation. Emotional healing through transformation.',
  Dhanu: 'Moon in Dhanu gives an optimistic, freedom-loving, and philosophical emotional nature. Needs space and adventure for emotional well-being. Enthusiastic and generous emotionally. Avoids emotional restriction; drawn to wisdom traditions for inner comfort.',
  Makara: 'Moon in Makara creates a reserved, responsible, and disciplined emotional nature. Emotional expression is controlled; may appear cold but feels deeply. Finds comfort in achievement and structure. Takes time to build emotional trust.',
  Kumbha: 'Moon in Kumbha gives a detached, humanitarian, and intellectually-oriented emotional nature. Connects emotionally through shared ideals rather than personal intimacy. Needs freedom and may seem emotionally unavailable. Strong social conscience.',
  Meena: 'Moon in Meena creates a deeply empathetic, spiritually sensitive, and intuitive emotional nature. Absorbs others\' emotions easily; needs clear boundaries. Rich dream life and psychic sensitivity. Finds emotional nourishment in solitude, art, and spiritual practice.',
};

// ─── Planet-in-House Meanings ────────────────────────────────────────────────

const PLANET_IN_HOUSE: Record<string, Record<number, string>> = {
  Sun: {
    1: 'Sun in the 1st house confers vitality, leadership, and a commanding presence. The native has a strong sense of identity and is meant for prominence. Health is generally robust. The self-expression is solar and authoritative.',
    4: 'Sun in the 4th house may create tension with the father or authority figures in the home. Deep sense of pride in heritage. Inner life is bright but domestic tensions possible. Government connections through land or property.',
    7: 'Sun in the 7th house (Karaka conflict) may delay or complicate marriage. Partner may be authoritative or government-connected. Public recognition through partnerships. The native seeks a prominent spouse.',
    10: 'Sun in the 10th house (strong directional strength) is highly auspicious for career. Native rises to positions of authority, government service, or public leadership. Father and career interlinked. Fame and recognition in the world.',
  },
  Moon: {
    1: 'Moon in the 1st house gives a sensitive, emotionally expressive personality. Public image is gentle and receptive. Strong intuition and adaptability. Moods influence the entire outlook; strong connection to mother.',
    4: 'Moon in the 4th house (own house for Karka) is highly beneficial. Emotional security, happy home life, and strong maternal blessings. Real estate and vehicles indicated. Deep roots in family and native land.',
    7: 'Moon in the 7th house indicates an emotionally sensitive spouse who may be changeable. Relationships are emotionally fulfilling but variable. The public and business dealings are influenced by emotional currents.',
    10: 'Moon in the 10th house indicates a public-facing career connected to the masses, nurturing, or emotional service. Fame through service. Career may fluctuate. Strong public appeal and connection to women.',
  },
  Jupiter: {
    1: 'Jupiter in the 1st house bestows wisdom, generosity, and natural grace. The body may be large or well-proportioned. A teacher, counselor, or advisor. Strong ethical sense and spiritual orientation. Protects the entire horoscope.',
    5: 'Jupiter in the 5th house (own or strong placement) blesses with creative intelligence, good children, and spiritual merit from past lives. Excellent for education, speculation (with caution), and devotion. Mantra and meditation are highly effective.',
    9: 'Jupiter in the 9th house (another own house) is among the most auspicious placements. Deep philosophical wisdom, strong dharma, and blessings of the guru. Foreign travel for higher learning. Strong father relationship and spiritual discipline.',
    11: 'Jupiter in the 11th house brings gains through network, elder siblings, and social connections. Large friend circle of learned individuals. Financial gains and fulfillment of desires. Corporate or organizational success.',
  },
  Mars: {
    1: 'Mars in the 1st house creates energy, courage, and drive. The native is assertive, competitive, and physically strong. May be prone to accidents or impulsive actions. Mangal Dosha is formed; needs appropriate matching for marriage.',
    3: 'Mars in the 3rd house gives courage, initiative, and strength of younger siblings. Excellent for sports, writing, and valor. The native is bold in communication and excels in competitive fields.',
    7: 'Mars in the 7th house forms Mangal Dosha and indicates a dominant or assertive spouse. Partnership conflicts possible. Business partnerships may be competitive. Needs careful marriage matching.',
    10: 'Mars in the 10th house gives strong career drive, ambition, and leadership. Success in engineering, military, police, or competitive fields. Authoritative and action-oriented professionally.',
  },
  Saturn: {
    3: 'Saturn in the 3rd house gives disciplined communication and steady effort. Results come slowly but surely. Younger siblings may face challenges. Writing, research, and technical fields favored.',
    7: 'Saturn in the 7th house delays marriage and may create a sense of duty over love in partnerships. A responsible, mature, or older spouse. Business partnerships are serious and long-term.',
    10: 'Saturn in the 10th house (own sign in Makara or Kumbha) is powerful for career. Slow but steady rise to prominence through discipline and hard work. Government, law, and administrative careers indicated.',
    11: 'Saturn in the 11th house gives steady, long-term gains and a disciplined approach to social networking. Gains come late but are lasting. Elder siblings may be significant.',
  },
  Venus: {
    1: 'Venus in the 1st house gives beauty, charm, artistic sensibility, and a magnetic personality. Natural grace and social ease. Strong desires for pleasure and comfort. Favors creative fields, fashion, and relationships.',
    4: 'Venus in the 4th house brings happiness in the home, beautiful surroundings, and property gains. Maternal influence is Venusian. Comfort and luxury are important. Artistic home environment.',
    7: 'Venus in the 7th house (karaka in own bhava) can be double-edged. Strong desire for partnership; marriage important and often beautiful. However, over-emphasis on pleasure in relationships possible. Generally gives a charming spouse.',
    5: 'Venus in the 5th house gives creative expression, romantic inclinations, and pleasure in artistic pursuits. Romantic affairs before marriage possible. Strong love of children and the arts.',
  },
  Mercury: {
    1: 'Mercury in the 1st house gives an intelligent, communicative, and analytical personality. Quick-witted and youthful appearance. Excels in writing, speaking, and intellectual pursuits.',
    4: 'Mercury in the 4th house indicates intelligence derived from home and mother. Multiple education paths. Real estate and vehicles through communication or business. The mind is rooted in tradition.',
    10: 'Mercury in the 10th house gives a career in communication, business, writing, or education. Intellectual authority and success through mental agility. The native is known for analytical skill.',
  },
  Rahu: {
    1: 'Rahu in the 1st house creates an unconventional, ambitious personality with strong material desires. The native may be ahead of their time. Health and identity are sites of transformation. Foreign influences significant.',
    7: 'Rahu in the 7th house indicates unconventional partnerships, possibly a foreign or unusual spouse. Intense attraction and obsession in relationships. Business partnerships may be with foreign entities.',
    10: 'Rahu in the 10th house gives sudden rise to fame, possibly through unconventional means. Career in foreign lands, media, technology, or out-of-the-ordinary fields. Ambition is intense and relentless.',
  },
  Ketu: {
    1: 'Ketu in the 1st house indicates a spiritually detached personality. The native may feel unmoored in identity; past-life spiritual merit present. Interest in moksha and liberation over worldly success.',
    7: 'Ketu in the 7th house indicates separation from partnerships or unusual marriage circumstances. Deep spiritual connection with the spouse. Business partnerships may dissolve unexpectedly.',
    12: 'Ketu in the 12th house is highly favorable for spiritual liberation. Strong connection to ashrams, foreign lands, and moksha. Sleep and dream experiences may be vivid and spiritually significant.',
  },
};

// ─── Tarot Card Data ─────────────────────────────────────────────────────────

const MAJOR_ARCANA: Record<string, { upright: string; reversed: string; advice: string }> = {
  'The Fool': {
    upright: 'New beginnings, innocence, spontaneity, and a free spirit. A leap of faith is called for. The universe supports new ventures undertaken with childlike trust. Zero is the number of potential.',
    reversed: 'Recklessness, risk-taking without preparation, naivety, and holding back from necessary leaps. Fear of the unknown or foolish decisions made without forethought.',
    advice: 'Trust the journey even when the destination is unclear. Each step forward, however uncertain, builds the path.',
  },
  'The Magician': {
    upright: 'Willpower, skill, manifestation, and resourcefulness. You have all the tools needed to create your desired reality. Mastery of the four elements: wands, cups, swords, pentacles.',
    reversed: 'Manipulation, poor planning, untapped talents, or illusion. Skills are present but being misused or not fully employed.',
    advice: 'Channel your intentions clearly and use every resource available. Focus turns potential into reality.',
  },
  'The High Priestess': {
    upright: 'Intuition, sacred knowledge, the subconscious mind, and divine feminine mystery. Listen to your inner voice. What is not yet visible is more important than what is apparent.',
    reversed: 'Secrets, disconnection from intuition, withdrawal, and silence that has become problematic. Hidden agendas or ignored inner wisdom.',
    advice: 'Sit in stillness and allow deeper knowing to surface. The answers you seek reside within.',
  },
  'The Empress': {
    upright: 'Fertility, abundance, nature, nurturing, and creative expression. Mother archetype bringing growth and sensory richness. A time of creativity, physical abundance, and nurturing others and self.',
    reversed: 'Creative block, dependence, smothering, or neglect of self. Imbalance between giving and receiving. Need to reconnect with natural cycles.',
    advice: 'Allow yourself to receive as generously as you give. Abundance is your natural state when you align with nature.',
  },
  'The Emperor': {
    upright: 'Authority, structure, stability, and masculine power. The father archetype. Established systems and leadership. Building solid foundations through discipline and strategic thinking.',
    reversed: 'Tyranny, rigidity, domination, or lack of discipline. Authority being misused or a need to take control of chaotic situations.',
    advice: 'Build with intention and lead with wisdom. True authority serves those under its care.',
  },
  'The Hierophant': {
    upright: 'Tradition, religious institutions, spiritual wisdom, and established beliefs. A spiritual teacher or mentor is indicated. Conformity to social or spiritual structures that provide meaning.',
    reversed: 'Rebellion, subversiveness, challenging dogma, and personal spiritual discovery outside of institutions. Breaking with tradition for individual truth.',
    advice: 'Honor the wisdom in traditions while having the courage to ask deeper questions.',
  },
  'The Lovers': {
    upright: 'Love, harmony, relationships, values alignment, and choices. Not merely romantic love but the integration of opposites. A significant choice must be made based on core values.',
    reversed: 'Disharmony, imbalance, misalignment of values, and poor choices in relationships. Self-love being neglected.',
    advice: 'Choose alignment over convenience. Relationships built on shared values are the most enduring.',
  },
  'The Chariot': {
    upright: 'Control, willpower, success through determination, and victory. Harnessing opposing forces toward a unified goal. Travel and movement indicated. Discipline leads to triumph.',
    reversed: 'Lack of direction, aggression without purpose, and loss of control. The opposing forces have not been balanced.',
    advice: 'Gather your will and take the reins. Victory belongs to those who direct their energy with purpose.',
  },
  'Strength': {
    upright: 'Courage, persuasion, influence, and compassion over brute force. Inner strength and patience tame what force cannot. Mastery of the instincts and emotions through love.',
    reversed: 'Self-doubt, weakness, insecurity, and raw energy without direction. Fear suppressing natural power.',
    advice: 'Your greatest strength lies in gentleness. Approach challenges with both courage and compassion.',
  },
  'The Hermit': {
    upright: 'Soul-searching, introspection, being alone, and inner guidance. A period of withdrawal for wisdom-seeking. The lantern of the Hermit illuminates the path for self and others.',
    reversed: 'Isolation, loneliness, withdrawal as avoidance, and refusing good counsel. The time for solitude may be over.',
    advice: 'Turn your gaze inward. The wisdom you seek cannot be found in external noise.',
  },
  'Wheel of Fortune': {
    upright: 'Good luck, karma, life cycles, destiny, and turning points. Forces larger than the individual are at work. What goes around, comes around. A fortunate turn of events is possible.',
    reversed: 'Bad luck, resistance to change, breaking cycles, and feeling at the mercy of fate. Refusing to accept change prolongs difficulty.',
    advice: 'Flow with the wheel rather than fighting its turns. Every cycle carries seeds of the next phase.',
  },
  'Justice': {
    upright: 'Justice, fairness, truth, cause and effect, and law. Balanced decisions will be made. Legal matters resolve fairly. Accountability and karmic equilibrium are at play.',
    reversed: 'Unfairness, lack of accountability, dishonesty, and avoidance of consequences. Legal matters may not resolve justly at this time.',
    advice: 'Act with integrity in all matters. The universe keeps perfect accounts.',
  },
  'The Hanged Man': {
    upright: 'Pause, surrender, letting go, and new perspectives. Voluntary sacrifice for greater understanding. Seeing through a different lens transforms apparent defeat into wisdom.',
    reversed: 'Delays, resistance, stalling, and useless sacrifice. Indecision prolonged without productive introspection.',
    advice: 'Suspend your usual view and what you feared as defeat may reveal itself as liberation.',
  },
  'Death': {
    upright: 'Endings, change, transformation, and transition. Not physical death but the necessary ending of a phase to allow new growth. Clinging to what must pass only prolongs suffering.',
    reversed: 'Resistance to change, inability to move on, and stagnation. Holding onto what has already ended.',
    advice: 'Release what has served its purpose. Every ending is the beginning of something more aligned with your growth.',
  },
  'Temperance': {
    upright: 'Balance, moderation, patience, purpose, and meaning. The blending of opposites creates something greater. Alchemy of self. A time for healing, integration, and finding the middle path.',
    reversed: 'Imbalance, excess, lack of long-term vision, and discord. The elements are not working in harmony.',
    advice: 'Blend opposites with patience and you will discover the gold within apparent contradictions.',
  },
  'The Devil': {
    upright: 'Shadow self, attachment, addiction, restriction, and sexuality. The chains that bind are often self-forged. Materialism and unhealthy dependencies. What in you believes you are not free?',
    reversed: 'Releasing limiting beliefs, exploring dark thoughts, detachment from unhealthy patterns. Recovery and liberation from compulsions.',
    advice: 'Look unflinchingly at what has enslaved your energy. The moment you see the chain, you can choose to remove it.',
  },
  'The Tower': {
    upright: 'Sudden change, upheaval, chaos, revelation, and awakening. Structures built on false foundations are struck down. Though painful, Tower moments clear the way for authentic rebuilding.',
    reversed: 'Fear of change, averting disaster, avoiding necessary upheaval. The collapse comes internally rather than externally.',
    advice: 'What cannot withstand truth was never truly stable. Allow the clearing to make way for what is real.',
  },
  'The Star': {
    upright: 'Hope, faith, purpose, renewal, and spirituality. After the storm, the Star shines with quiet assurance. Healing is underway. Trust that the universe is guiding you toward restoration.',
    reversed: 'Lack of faith, despair, disconnection from inspiration. Hope feels inaccessible; healing is delayed by hopelessness.',
    advice: 'Renew your faith in the greater design. You are more guided and supported than you currently perceive.',
  },
  'The Moon': {
    upright: 'Illusion, fear, the subconscious, and confusion. Things are not as they appear. The Moon illuminates the hidden world of dreams, shadows, and unresolved fears. Trust your intuition over appearances.',
    reversed: 'Release of fear, repressed emotion coming to surface, and confusion lifting. Hidden truths being revealed as clarity returns.',
    advice: 'Navigate the fog with intuition rather than the rational mind. What confuses you now will become clear.',
  },
  'The Sun': {
    upright: 'Positivity, fun, warmth, success, and vitality. Clarity, joy, and conscious awareness. After darkness, the light is brilliant. Abundance, optimism, and genuine happiness are present.',
    reversed: 'Temporary depression, lack of success, and excessive optimism that leads to overlooking challenges.',
    advice: 'Let your authentic light shine without apology. Your vitality and joy are gifts to the world.',
  },
  'Judgement': {
    upright: 'Reflection, reckoning, awakening, and absolution. A calling from the higher self. Review of the past with compassion before a new chapter. The soul is being evaluated and renewed.',
    reversed: 'Self-doubt, refusing the call, harsh self-judgment, and ignoring important signals from the higher self.',
    advice: 'Answer the call of your higher nature without fear. You are ready for the rebirth that awaits.',
  },
  'The World': {
    upright: 'Completion, integration, accomplishment, and wholeness. A cycle has been completed with mastery. The world is yours to inhabit fully. Travel, success, and the achievement of long-held goals.',
    reversed: 'Incompleteness, shortcuts, and delays in achieving goals. Closure is being avoided or a cycle remains unfinished.',
    advice: 'Celebrate your completion and know that every ending is the threshold of a greater beginning.',
  },
};

// ─── Numerology Data ─────────────────────────────────────────────────────────

const LIFE_PATH_MEANINGS: Record<number, { meaning: string; traits: string[]; challenges: string[]; advice: string }> = {
  1: {
    meaning: 'The Leader. Life Path 1 is the number of initiation, independence, and original thought. You are a pioneer, born to lead and forge new paths. Your soul purpose involves developing individuality, self-reliance, and courage.',
    traits: ['Natural leadership', 'Independence', 'Originality', 'Courage', 'Ambition', 'Determination', 'Pioneering spirit'],
    challenges: ['Stubbornness', 'Egotism', 'Difficulty delegating', 'Intolerance of others\' methods', 'Loneliness from self-sufficiency'],
    advice: 'Channel your leadership toward serving others. True strength is the ability to lift those around you.',
  },
  2: {
    meaning: 'The Peacemaker. Life Path 2 is the number of cooperation, diplomacy, and sensitivity. You are a natural mediator, bringing balance and harmony to situations and relationships. Partnership is your path of growth.',
    traits: ['Diplomacy', 'Sensitivity', 'Cooperation', 'Patience', 'Intuition', 'Empathy', 'Harmony-seeking'],
    challenges: ['Over-sensitivity', 'Indecisiveness', 'Dependency', 'Fear of conflict', 'Difficulty asserting personal needs'],
    advice: 'Your sensitivity is a superpower. Learning to honor your own needs is the foundation of healthy partnership.',
  },
  3: {
    meaning: 'The Communicator. Life Path 3 is the number of self-expression, creativity, and joy. You are a natural artist, communicator, and social catalyst. Your purpose involves uplifting others through creative expression.',
    traits: ['Creativity', 'Expressiveness', 'Optimism', 'Social magnetism', 'Humor', 'Artistic talent', 'Inspiration'],
    challenges: ['Scattered energy', 'Superficiality', 'Self-doubt in expression', 'Moodiness', 'Difficulty with discipline'],
    advice: 'Commit to developing your creative gifts with discipline. The world needs your unique voice.',
  },
  4: {
    meaning: 'The Builder. Life Path 4 is the number of work, foundation, and practicality. You are the backbone of society: reliable, disciplined, and thorough. Your purpose involves creating stable structures that serve many.',
    traits: ['Practicality', 'Reliability', 'Hard work', 'Discipline', 'Loyalty', 'Honesty', 'Methodical approach'],
    challenges: ['Rigidity', 'Resistance to change', 'Overwork', 'Limitation mindset', 'Difficulty with spontaneity'],
    advice: 'Your foundations support others\' dreams too. Allow yourself moments of improvisation within your structures.',
  },
  5: {
    meaning: 'The Freedom Seeker. Life Path 5 is the number of freedom, change, and experience. You are a natural adventurer who learns through varied experience. Your purpose involves embracing change and helping others adapt.',
    traits: ['Adaptability', 'Curiosity', 'Versatility', 'Adventurousness', 'Wit', 'Progressive thinking', 'Sensory awareness'],
    challenges: ['Restlessness', 'Irresponsibility', 'Excess in pleasures', 'Commitment issues', 'Scattered focus'],
    advice: 'True freedom is an inner state. Once you find it within, your adventures become purposeful rather than escapist.',
  },
  6: {
    meaning: 'The Nurturer. Life Path 6 is the number of responsibility, home, and service to loved ones. You are the cosmic caregiver, with a deep sense of duty toward family and community. Harmony and beauty are your values.',
    traits: ['Responsibility', 'Nurturing', 'Artistic sense', 'Compassion', 'Devotion', 'Community focus', 'Counseling ability'],
    challenges: ['Self-sacrifice to the point of depletion', 'Perfectionism', 'Martyrdom', 'Unwanted advice-giving', 'Control through care'],
    advice: 'Care for yourself as devotedly as you care for others. Your wellbeing is the source from which all service flows.',
  },
  7: {
    meaning: 'The Seeker. Life Path 7 is the number of wisdom, introspection, and spiritual inquiry. You are the analyst and mystic, seeking truth beneath appearances. Your purpose involves mastery of knowledge, inner and outer.',
    traits: ['Analytical ability', 'Introspection', 'Spiritual depth', 'Intellect', 'Perfectionism', 'Research ability', 'Wisdom'],
    challenges: ['Isolation', 'Skepticism', 'Emotional distance', 'Difficulty with trust', 'Analysis paralysis'],
    advice: 'Your quest for truth is sacred. Share your discoveries with the world; wisdom withheld serves no one.',
  },
  8: {
    meaning: 'The Powerhouse. Life Path 8 is the number of material mastery, authority, and abundance. You are the executive, the manifestor, and the authority figure. Your purpose involves using power and resources with integrity.',
    traits: ['Business acumen', 'Ambition', 'Authority', 'Manifestation ability', 'Efficiency', 'Leadership', 'Material mastery'],
    challenges: ['Workaholism', 'Materialism', 'Control issues', 'Impatience', 'Using people for ends'],
    advice: 'Material mastery is your gift; use it in service of the greater good and abundance will flow without limitation.',
  },
  9: {
    meaning: 'The Humanitarian. Life Path 9 is the number of completion, compassion, and universal love. You are the old soul, carrying the wisdom of all previous numbers. Your purpose involves selfless service and wisdom sharing.',
    traits: ['Compassion', 'Generosity', 'Artistic vision', 'Old-soul wisdom', 'Idealism', 'Universal perspective', 'Emotional depth'],
    challenges: ['Difficulty letting go', 'Martyrdom', 'Unfocused idealism', 'Emotional volatility', 'Feeling misunderstood'],
    advice: 'Your heart holds the world. Let go of what no longer serves and trust that your true purpose will fill the space.',
  },
  11: {
    meaning: 'The Intuitive Visionary (Master Number). Life Path 11 carries the sensitivity of 2 elevated to a higher octave. You are a spiritual messenger, highly intuitive, and a channel for inspiration. Your nervous system is highly attuned.',
    traits: ['Heightened intuition', 'Spiritual sensitivity', 'Visionary capacity', 'Inspiration of others', 'Psychic ability', 'Charisma', 'Idealism'],
    challenges: ['Extreme sensitivity', 'Anxiety and nervous energy', 'Self-doubt', 'Living up to inner knowing', 'Impracticality'],
    advice: 'Ground your visions through practical steps. Your intuitive gifts are meant to be shared through lived experience.',
  },
  22: {
    meaning: 'The Master Builder (Master Number). Life Path 22 is the most powerful number, combining the intuition of 11 with the practical ability of 4. You are capable of manifesting grand dreams into reality and building for collective benefit.',
    traits: ['Master manifestation', 'Practical idealism', 'Large-scale vision', 'Organizational genius', 'Leadership for collective good', 'Groundedness in vision'],
    challenges: ['Overwhelming sense of responsibility', 'Self-imposed limitations', 'Fear of not living up to potential', 'Overwork'],
    advice: 'Your capacity to build is unparalleled when aligned with purpose beyond personal gain. Serve the vision, not the ego.',
  },
  33: {
    meaning: 'The Master Teacher (Master Number). Life Path 33 is the rarest and most spiritually elevated number. You are a master of compassion, combining the creative expression of 3 with the universal love of 6, elevated to cosmic service.',
    traits: ['Selfless service', 'Spiritual teaching', 'Deep compassion', 'Creative healing', 'Wisdom of love', 'Elevation of others'],
    challenges: ['Overwhelming sensitivity', 'Difficulty in personal life due to universal focus', 'Unrealistic expectations of self'],
    advice: 'You are a beacon of divine love. Maintain your human groundedness as the foundation for your spiritual heights.',
  },
};

// ─── Vastu Shastra Zone Data ─────────────────────────────────────────────────

const VASTU_ZONES: Record<string, { element: string; ruling: string; description: string; remedies: string[] }> = {
  North: {
    element: 'Water',
    ruling: 'Kubera (God of Wealth)',
    description: 'The North zone governs wealth, career, and new opportunities. This direction is associated with the magnetic north and the flow of positive energy into the home. An open, clutter-free north brings financial prosperity and career growth.',
    remedies: ['Place a water feature or aquarium in the north', 'Keep this zone open and well-lit', 'Blue or green colors enhance this zone', 'Buddha or Kuber yantra placed facing north'],
  },
  Northeast: {
    element: 'Water + Ether',
    ruling: 'Ishaan (Shiva)',
    description: 'The Northeast (Ishaan Kona) is the most sacred direction in Vastu Shastra, the corner of divine wisdom, spirituality, and healing energy. A puja room, meditation space, or water source here amplifies positive energy throughout the entire structure.',
    remedies: ['Place the puja room or meditation corner here', 'Keep this corner clean, open, and lighter than other corners', 'Crystal or clear quartz amplifies energy here', 'Avoid heavy storage, toilets, or kitchens in this zone'],
  },
  East: {
    element: 'Fire (Rising Sun)',
    ruling: 'Indra (King of Devas)',
    description: 'The East zone governs social connections, health, and new beginnings. The rising sun energizes this direction, making it ideal for windows, the main entrance, or the study. Health and vitality are supported by an open, clean east.',
    remedies: ['Large windows or main door in the east invite solar energy', 'Green plants and natural light enhance this zone', 'Avoid dark, heavy objects blocking the east', 'Sunrise meditations facing east harness its full power'],
  },
  Southeast: {
    element: 'Fire',
    ruling: 'Agni (Fire God)',
    description: 'The Southeast (Agni Kona) governs fire energy, digestion, financial security, and passion. The kitchen is ideally placed here. Healthy fire energy supports transformation, digestion of food and experience, and material security.',
    remedies: ['Kitchen should be in the southeast whenever possible', 'Red, orange, or yellow color accents strengthen fire energy', 'Candles or incense in the southeast activate positive fire', 'Avoid water features that suppress fire energy here'],
  },
  South: {
    element: 'Earth + Fire',
    ruling: 'Yama (God of Dharma)',
    description: 'The South zone governs fame, recognition, reputation, and dharmic living. When properly balanced, it brings stability, recognition in career, and strong relationships. Heavy structures like mountains in the south provide protection.',
    remedies: ['Heavy furniture or storage in the south provides stability', 'Red and earthy colors strengthen the south', 'Fame-related achievements can be displayed on the south wall', 'Avoid the main entrance in the south wherever possible'],
  },
  Southwest: {
    element: 'Earth',
    ruling: 'Niritti (Pitru / Ancestors)',
    description: 'The Southwest (Niritti Kona) governs stability, relationships, the head of the household, and ancestral connections. The master bedroom is ideally placed here. Heavy and grounding, this zone must be strong and closed to maintain stability.',
    remedies: ['Master bedroom in the southwest', 'Heavy furniture anchors this zone', 'Yellow and earthy tones support this direction', 'Avoid cuts, missing corners, or openings in the southwest'],
  },
  West: {
    element: 'Water + Air',
    ruling: 'Varuna (God of Water and Cosmic Order)',
    description: 'The West zone governs gains, children, creativity, and the completion of efforts. Varuna oversees cosmic order, and a balanced west brings rewards for work done. Children\'s rooms and study areas benefit from western placement.',
    remedies: ['Blue and metallic colors enhance the west', 'Children\'s room or creative studio benefits from this zone', 'Circular or oval shapes harmonize western energy', 'Water features here must be used mindfully'],
  },
  Northwest: {
    element: 'Air',
    ruling: 'Vayu (Wind God)',
    description: 'The Northwest (Vayu Kona) governs movement, change, support from others, and socialization. Guest rooms, garages, and granaries are traditionally placed here. Air energy brings change and the assistance of helpful people.',
    remedies: ['Guest room or storage in the northwest is auspicious', 'White or gray colors align with air element', 'Windchimes activate benevolent air energy', 'Keep this zone from being completely sealed or stagnant'],
  },
  Center: {
    element: 'Ether / Akasha',
    ruling: 'Brahma (Creator)',
    description: 'The center of the structure (Brahmasthana) is the cosmic navel of the building, the meeting point of all energies. It must be open, clean, and ideally free of structural weight. A courtyard, open hall, or meditation space here energizes the entire structure.',
    remedies: ['Keep the center of the home open and clutter-free', 'No heavy columns, pillars, or toilets in the center', 'Light colors and natural light in the center benefit all zones', 'A square or circular pattern on the floor activates the Brahmasthana'],
  },
};

// ─── Daily Shlokas ────────────────────────────────────────────────────────────

const DAILY_SHLOKAS: ShlokaEntry[] = [
  {
    verse: 'Karagre vasate Lakshmi, karamadhye Saraswati | Karamule sthita Gouri, prabhate karadarshanam ||',
    source: 'Traditional morning prayer (Stotra)',
    translation: 'At the tip of the hands resides Lakshmi (wealth), in the middle resides Saraswati (wisdom), at the base of the hands resides Gauri (Shakti). Therefore, one should see one\'s hands every morning.',
    meaning: 'This shloka reminds us that the hands are sacred instruments containing divine energy. Looking at the palms upon waking aligns the mind with purpose, creativity, and divine grace before engaging the world.',
  },
  {
    verse: 'Vakratunda mahakaya suryakoti samaprabha | Nirvighnam kuru me deva sarva karyeshu sarvada ||',
    source: 'Ganesha Stuti',
    translation: 'O Lord Ganesha, of curved trunk and mighty form, with the radiance of a million suns, please remove all obstacles from my endeavors, always and in all things.',
    meaning: 'Ganesha, the remover of obstacles, is invoked before any significant beginning. This prayer acknowledges that our best efforts require divine alignment, and that surrendering pride in the work to the greater intelligence yields auspicious results.',
  },
  {
    verse: 'Sarve bhavantu sukhinah, sarve santu niramayah | Sarve bhadrani pashyantu, ma kashchid duhkha bhagbhavet ||',
    source: 'Brihadaranyaka Upanishad',
    translation: 'May all beings be happy; may all beings be free from disease; may all beings see what is auspicious; may none suffer.',
    meaning: 'This universal prayer from the Upanishads expands the heart beyond personal concerns. Vedic wisdom teaches that genuine happiness is only possible when we sincerely wish wellbeing for all. This prayer is a spiritual technology for dissolving the illusion of separation.',
  },
  {
    verse: 'Om asato ma sadgamaya, tamaso ma jyotirgamaya | Mrityor ma amritam gamaya, om shanti shanti shanti ||',
    source: 'Brihadaranyaka Upanishad 1.3.28',
    translation: 'Lead me from the unreal to the real; lead me from darkness to light; lead me from death to immortality. Om, peace, peace, peace.',
    meaning: 'This Upanishadic invocation represents the deepest prayer of the seeking soul. The movement from asat (unreal/ego) to sat (real/Self), from tamas (ignorance) to jyoti (illumination), and from mrityu (the death-identified life) to amrita (the deathless Self) is the entire arc of sadhana.',
  },
  {
    verse: 'Guru Brahma, Guru Vishnu, Guru devo Maheshvara | Guru sakshat para Brahma, tasmai shri gurave namah ||',
    source: 'Traditional Guru Stotra',
    translation: 'The Guru is Brahma (the creator), the Guru is Vishnu (the sustainer), the Guru is Shiva (the transformer). The Guru is verily the Supreme Absolute itself. To that revered Guru, I bow.',
    meaning: 'The Vedic tradition holds the Guru as the living embodiment of the supreme truth. This shloka acknowledges that all three cosmic functions — creation, preservation, and dissolution — are contained within the enlightened teacher who transmits liberation to the student.',
  },
  {
    verse: 'Yada yada hi dharmasya glanir bhavati bharata | Abhyutthanam adharmasya tadatmanam srijamyaham ||',
    source: 'Bhagavad Gita 4.7',
    translation: 'Whenever there is a decline of righteousness (dharma) and a rise of unrighteousness, O Arjuna, then I manifest myself on earth.',
    meaning: 'Krishna\'s assurance of divine intervention in times of moral decline offers profound comfort. It teaches that the universe has a self-correcting intelligence, and that periods of adharma are always followed by the arising of a force that restores cosmic balance. Our role is to remain aligned with dharma.',
  },
  {
    verse: 'Nayam atma pravacanena labhyo na medhaya na bahuna shrutena | Yam evaisa vrinute tena labhyas tasyaisa atma vivrinute tanum svam ||',
    source: 'Katha Upanishad 1.2.23',
    translation: 'This Self cannot be attained by study, nor by intellect, nor by much learning. It is attained only by the one whom It chooses; to that one It reveals Its own form.',
    meaning: 'The Katha Upanishad reveals the paradox at the heart of spiritual seeking: the Self cannot be grasped by the very mind that seeks it. This teaching dissolves spiritual ego and opens the seeker to grace. Sadhana creates the conditions; the Self reveals itself in its own time.',
  },
  {
    verse: 'Tamasoma jyotirgamaya | Asato ma sadgamaya | Mrityor mamritam gamaya ||',
    source: 'Pavamana Mantras, Brihadaranyaka Upanishad',
    translation: 'From darkness, lead me to light. From unreality, lead me to reality. From death, lead me to immortality.',
    meaning: 'These three prayers, known as the Pavamana Mantras, represent the three primary movements of spiritual awakening. Darkness to light is intellectual illumination; unreality to reality is philosophical awakening; death to immortality is the direct experiential recognition of one\'s deathless nature.',
  },
];

// ─── Engine Implementation ────────────────────────────────────────────────────

export class RuleBasedEngine {
  interpretKundli(params: KundliInterpretationParams): string {
    const sections: string[] = [];

    if (params.lagna && LAGNA_DESCRIPTIONS[params.lagna]) {
      sections.push(`**Lagna (Ascendant) — ${params.lagna}**\n${LAGNA_DESCRIPTIONS[params.lagna]}`);
    }

    if (params.moonSign && MOON_SIGN_DESCRIPTIONS[params.moonSign]) {
      sections.push(`**Chandra (Moon Sign) — ${params.moonSign}**\n${MOON_SIGN_DESCRIPTIONS[params.moonSign]}`);
    }

    if (params.sunSign && LAGNA_DESCRIPTIONS[params.sunSign]) {
      sections.push(`**Surya (Sun Sign) — ${params.sunSign}**\nThe Sun illuminates the ${params.sunSign} qualities in your chart, indicating the soul's core purpose and the area of life where you seek to shine.`);
    }

    if (params.nakshatraName) {
      sections.push(`**Birth Nakshatra — ${params.nakshatraName}**\nThe Moon's placement in ${params.nakshatraName} Nakshatra deeply shapes the emotional body, instinctual responses, and the pattern of your Vimshottari Dasha cycle, which begins from this Nakshatra's ruling planet.`);
    }

    if (params.planets && params.planets.length > 0) {
      const planetSections: string[] = [];
      for (const p of params.planets) {
        const houseData = PLANET_IN_HOUSE[p.planet]?.[p.house];
        if (houseData) {
          const retroNote = p.isRetrograde ? ` (Retrograde — internalized energy, past-life themes emphasized)` : '';
          planetSections.push(`${p.planet} in House ${p.house} (${p.rashi})${retroNote}: ${houseData}`);
        }
      }
      if (planetSections.length > 0) {
        sections.push(`**Planetary Placements**\n${planetSections.join('\n\n')}`);
      }
    }

    if (params.yogas && params.yogas.length > 0) {
      sections.push(`**Yogas Identified**\n${params.yogas.map(y => `• ${y}`).join('\n')}`);
    }

    if (params.doshas && params.doshas.length > 0) {
      sections.push(`**Doshas Present**\n${params.doshas.map(d => `• ${d}`).join('\n')}\n\nNote: Doshas indicate karmic lessons and areas requiring attention. Each dosha has classical remedies. Consult a qualified Jyotishi for personalized remedial measures.`);
    }

    if (params.currentDasha) {
      sections.push(`**Current Dasha Period**\n${params.currentDasha}\n\nThe Vimshottari Dasha system maps the unfolding of karma through planetary periods. The current dasha planet's significations and house placements are especially activated during this period.`);
    }

    if (sections.length === 0) {
      return 'Insufficient chart data for interpretation. Please provide lagna, moon sign, and planetary positions for a complete reading.';
    }

    return sections.join('\n\n---\n\n');
  }

  interpretTarot(cardName: string, position: string, isReversed: boolean, context: string): TarotInterpretation {
    const cardData = MAJOR_ARCANA[cardName];

    if (!cardData) {
      return {
        cardName,
        position,
        isReversed,
        meaning: `${cardName} — This card invites deep reflection on the themes it carries. Every card in the Tarot is a mirror of cosmic wisdom.`,
        advice: 'Sit with this card\'s imagery in meditation and allow its message to arise from within.',
      };
    }

    const meaning = isReversed ? cardData.reversed : cardData.upright;
    const contextNote = context ? ` In the context of ${context}, ` : '';

    return {
      cardName,
      position,
      isReversed,
      meaning: `${contextNote}${meaning}`,
      advice: cardData.advice,
    };
  }

  interpretNumerology(lifePathNumber: number, expressionNumber?: number): NumerologyInterpretation {
    const lpData = LIFE_PATH_MEANINGS[lifePathNumber];

    if (!lpData) {
      return {
        lifePathNumber,
        expressionNumber,
        meaning: `Life Path ${lifePathNumber}: This number carries unique vibrational qualities. All numbers reduce to the core of 1-9 and master numbers 11, 22, 33.`,
        traits: ['Unique vibrational signature'],
        challenges: ['Integration of the number\'s dual nature'],
        advice: 'Explore the deeper symbolism of your number through numerological study.',
      };
    }

    let meaning = lpData.meaning;
    if (expressionNumber && LIFE_PATH_MEANINGS[expressionNumber]) {
      const expData = LIFE_PATH_MEANINGS[expressionNumber];
      meaning += `\n\nExpression Number ${expressionNumber}: ${expData.meaning.split('.')[0]}. This reveals how you express yourself to the world and your natural talents.`;
    }

    return {
      lifePathNumber,
      expressionNumber,
      meaning,
      traits: lpData.traits,
      challenges: lpData.challenges,
      advice: lpData.advice,
    };
  }

  interpretVastu(zone: string, defects: string[] = []): VastuInterpretation {
    const zoneKey = Object.keys(VASTU_ZONES).find(
      k => k.toLowerCase() === zone.toLowerCase()
    ) || zone;
    const zoneData = VASTU_ZONES[zoneKey];

    if (!zoneData) {
      return {
        zone,
        element: 'Unknown',
        ruling: 'Unknown',
        description: `The ${zone} zone carries directional energy according to Vastu Shastra principles. Consult the classical texts for specific guidance.`,
        defectAnalysis: defects.map(d => `Defect noted: ${d}`),
        remedies: ['Consult a Vastu Shastra practitioner for specific remedies.'],
      };
    }

    const defectAnalysis = defects.length > 0
      ? defects.map(d => `The defect "${d}" in the ${zone} zone may disrupt ${zoneData.ruling}'s energy flow, potentially affecting: ${zoneData.description.split('.')[0].toLowerCase()}.`)
      : ['No specific defects reported for this zone.'];

    return {
      zone: zoneKey,
      element: zoneData.element,
      ruling: zoneData.ruling,
      description: zoneData.description,
      defectAnalysis,
      remedies: zoneData.remedies,
    };
  }

  getDailyShloka(date: Date): ShlokaEntry {
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % DAILY_SHLOKAS.length;
    return DAILY_SHLOKAS[index];
  }

  getAllShlokas(): ShlokaEntry[] {
    return DAILY_SHLOKAS;
  }
}

export const ruleBasedEngine = new RuleBasedEngine();
