/**
 * Built-in Knowledge Seed
 *
 * Pre-seeds the knowledge base with ~50 authoritative Vedic knowledge chunks
 * that work without any internet access or file uploads. This ensures the
 * Oracle can answer basic questions about Vedic astrology out of the box.
 */

export interface SeedEntry {
  section: string;
  text: string;
}

export const SEED_KNOWLEDGE: SeedEntry[] = [
  // ─── 27 Nakshatras ────────────────────────────────────────────────────────────

  {
    section: 'Nakshatras',
    text: `The 27 Nakshatras (Lunar Mansions) of Vedic Astrology

1. Ashwini (0°00' - 13°20' Aries) — Ruled by Ketu. Deity: Ashwini Kumaras (divine physicians). Symbol: Horse's head. Nature: Swift, healing, initiating. Ashwini natives are quick, energetic, and drawn to healing arts. They possess natural vitality and are often pioneers.

2. Bharani (13°20' - 26°40' Aries) — Ruled by Venus. Deity: Yama (god of death/dharma). Symbol: Yoni (female reproductive organ). Nature: Restraining, bearing, transformative. Bharani carries the energy of creation and destruction, dealing with the cycles of life.

3. Krittika (26°40' Aries - 10°00' Taurus) — Ruled by Sun. Deity: Agni (god of fire). Symbol: Razor/flame. Nature: Sharp, purifying, critical. Krittika bestows a cutting intellect, leadership qualities, and the ability to separate truth from falsehood.

4. Rohini (10°00' - 23°20' Taurus) — Ruled by Moon. Deity: Brahma (creator). Symbol: Ox cart/chariot. Nature: Growing, creative, fertile. Rohini is considered the most creative and materially productive Nakshatra, favouring beauty and abundance.

5. Mrigashira (23°20' Taurus - 6°40' Gemini) — Ruled by Mars. Deity: Soma (Moon god). Symbol: Deer's head. Nature: Searching, curious, gentle. Mrigashira gives a restless seeking nature, love of travel, and intellectual curiosity.`,
  },
  {
    section: 'Nakshatras',
    text: `6. Ardra (6°40' - 20°00' Gemini) — Ruled by Rahu. Deity: Rudra (storm god/Shiva). Symbol: Teardrop/diamond. Nature: Stormy, transformative, destructive-creative. Ardra brings intensity, emotional depth, and the power to destroy the old to create anew.

7. Punarvasu (20°00' Gemini - 3°20' Cancer) — Ruled by Jupiter. Deity: Aditi (mother of gods). Symbol: Bow and quiver. Nature: Renewing, returning, prosperous. Punarvasu gives the ability to bounce back from adversity, wisdom, and spiritual generosity.

8. Pushya (3°20' - 16°40' Cancer) — Ruled by Saturn. Deity: Brihaspati (Jupiter, guru of gods). Symbol: Cow's udder/lotus. Nature: Nourishing, auspicious, protective. Pushya is considered the most auspicious Nakshatra for beginning ventures and spiritual practices.

9. Ashlesha (16°40' - 30°00' Cancer) — Ruled by Mercury. Deity: Sarpa (serpent deities/Nagas). Symbol: Coiled serpent. Nature: Clinging, mystical, penetrating. Ashlesha gives psychic sensitivity, occult knowledge, and the kundalini energy.

10. Magha (0°00' - 13°20' Leo) — Ruled by Ketu. Deity: Pitris (ancestors). Symbol: Royal throne. Nature: Regal, ancestral, ceremonial. Magha bestows authority, respect for tradition, and connection to lineage and ancestral karma.`,
  },
  {
    section: 'Nakshatras',
    text: `11. Purva Phalguni (13°20' - 26°40' Leo) — Ruled by Venus. Deity: Bhaga (god of fortune/delight). Symbol: Hammock/front legs of a bed. Nature: Relaxing, creative, romantic. Purva Phalguni brings artistic talents, enjoyment of life, and social warmth.

12. Uttara Phalguni (26°40' Leo - 10°00' Virgo) — Ruled by Sun. Deity: Aryaman (god of patronage/friendship). Symbol: Back legs of a bed. Nature: Helpful, generous, contractual. Uttara Phalguni gives leadership through service, strong partnerships, and reliability.

13. Hasta (10°00' - 23°20' Virgo) — Ruled by Moon. Deity: Savitar (creative Sun god). Symbol: Open hand/fist. Nature: Skillful, clever, manifesting. Hasta bestows manual dexterity, craftsmanship, and the ability to materialise intentions through action.

14. Chitra (23°20' Virgo - 6°40' Libra) — Ruled by Mars. Deity: Vishvakarma (divine architect). Symbol: Bright jewel/pearl. Nature: Brilliant, artistic, creative. Chitra gives aesthetic vision, architectural talent, and the desire to create beautiful structures.

15. Swati (6°40' - 20°00' Libra) — Ruled by Rahu. Deity: Vayu (wind god). Symbol: Young plant/coral. Nature: Independent, flexible, dispersing. Swati brings independence, adaptability, and the ability to thrive in foreign environments.`,
  },
  {
    section: 'Nakshatras',
    text: `16. Vishakha (20°00' Libra - 3°20' Scorpio) — Ruled by Jupiter. Deity: Indra-Agni (chief god + fire god). Symbol: Triumphal arch/potter's wheel. Nature: Determined, goal-oriented, transformative. Vishakha gives single-pointed focus, ambition, and the power to achieve goals through perseverance.

17. Anuradha (3°20' - 16°40' Scorpio) — Ruled by Saturn. Deity: Mitra (god of friendship/devotion). Symbol: Lotus/triumphal archway. Nature: Devoted, friendly, organisational. Anuradha bestows the ability to create and maintain friendships, devotion, and success in foreign places.

18. Jyeshtha (16°40' - 30°00' Scorpio) — Ruled by Mercury. Deity: Indra (king of gods). Symbol: Circular amulet/earring. Nature: Eldest, chief, protective. Jyeshtha gives seniority, authority, and the responsibility of protecting others. It carries the energy of the spiritual warrior.

19. Mula (0°00' - 13°20' Sagittarius) — Ruled by Ketu. Deity: Nirrti (goddess of dissolution). Symbol: Bunch of roots/tied roots. Nature: Uprooting, investigating, fundamental. Mula gives the power to destroy (uproot) ignorance and get to the root cause of things.

20. Purva Ashadha (13°20' - 26°40' Sagittarius) — Ruled by Venus. Deity: Apas (water deity). Symbol: Elephant tusk/fan. Nature: Invincible, purifying, invigorating. Purva Ashadha bestows an invincible spirit, philosophical depth, and the ability to energise others.`,
  },
  {
    section: 'Nakshatras',
    text: `21. Uttara Ashadha (26°40' Sagittarius - 10°00' Capricorn) — Ruled by Sun. Deity: Vishvedevas (universal gods). Symbol: Elephant tusk/small bed. Nature: Universal, unchallengeable, pervasive. Uttara Ashadha gives final victory, leadership on the world stage, and the ability to achieve lasting success.

22. Shravana (10°00' - 23°20' Capricorn) — Ruled by Moon. Deity: Vishnu (preserver). Symbol: Three footprints/ear. Nature: Listening, learning, connecting. Shravana bestows the power of listening and learning, making it excellent for teachers, counsellors, and media professionals.

23. Dhanishtha (23°20' Capricorn - 6°40' Aquarius) — Ruled by Mars. Deity: Vasus (eight elemental gods). Symbol: Drum/flute. Nature: Wealthy, musical, ambitious. Dhanishtha gives musical talent, material prosperity, and the ability to keep rhythm with cosmic forces.

24. Shatabhisha (6°40' - 20°00' Aquarius) — Ruled by Rahu. Deity: Varuna (god of cosmic waters). Symbol: Empty circle/100 flowers. Nature: Healing, mystical, veiling. Shatabhisha is the star of the healer, giving mastery over medicines, herbs, and alternative healing modalities.

25. Purva Bhadrapada (20°00' Aquarius - 3°20' Pisces) — Ruled by Jupiter. Deity: Aja Ekapada (one-footed serpent). Symbol: Front of funeral cot/two-faced man. Nature: Scorching, purifying, elevating. Purva Bhadrapada brings spiritual fire, occult powers, and the ability to transcend material limitations.

26. Uttara Bhadrapada (3°20' - 16°40' Pisces) — Ruled by Saturn. Deity: Ahir Budhnya (serpent of the deep). Symbol: Back of funeral cot/twins. Nature: Controlling, depths, wisdom. Uttara Bhadrapada gives mastery over the subconscious, kundalini energy, and deep spiritual wisdom.

27. Revati (16°40' - 30°00' Pisces) — Ruled by Mercury. Deity: Pushan (nourisher/protector of travelers). Symbol: Fish/drum. Nature: Nourishing, protective, journeying. Revati is the final Nakshatra, representing completion, safe travel, and the nourishment needed for new beginnings.`,
  },

  // ─── 12 Rashis ────────────────────────────────────────────────────────────────

  {
    section: 'Rashis',
    text: `The 12 Rashis (Zodiac Signs) of Vedic Astrology

In Jyotisha, the zodiac is sidereal (Nirayana), aligned with fixed stars rather than the vernal equinox. The difference from the tropical zodiac is called the Ayanamsha (~24° in the current era, per Lahiri).

1. Mesha (Aries) — Ruler: Mars (Mangala). Element: Fire. Quality: Movable (Chara). Gender: Male. Direction: East. Mesha is the first sign, symbolising new beginnings, courage, and initiative. Mars gives it a warrior-like, pioneering nature.

2. Vrishabha (Taurus) — Ruler: Venus (Shukra). Element: Earth. Quality: Fixed (Sthira). Gender: Female. Direction: South. Vrishabha represents stability, material comfort, beauty, and the accumulation of resources.

3. Mithuna (Gemini) — Ruler: Mercury (Budha). Element: Air. Quality: Dual (Dvisvabhava). Gender: Male. Direction: West. Mithuna governs communication, intellectual curiosity, trade, and adaptability.

4. Karka (Cancer) — Ruler: Moon (Chandra). Element: Water. Quality: Movable. Gender: Female. Direction: North. Karka represents the home, mother, emotions, nourishment, and inner security.

5. Simha (Leo) — Ruler: Sun (Surya). Element: Fire. Quality: Fixed. Gender: Male. Direction: East. Simha embodies sovereignty, creativity, self-expression, and the soul's purpose (Atmakaraka).

6. Kanya (Virgo) — Ruler: Mercury (Budha). Element: Earth. Quality: Dual. Gender: Female. Direction: South. Kanya governs analysis, service, health, purity, and discrimination (Viveka).`,
  },
  {
    section: 'Rashis',
    text: `7. Tula (Libra) — Ruler: Venus (Shukra). Element: Air. Quality: Movable. Gender: Male. Direction: West. Tula represents balance, partnerships, justice, diplomacy, and aesthetic harmony.

8. Vrishchika (Scorpio) — Ruler: Mars (Mangala), co-ruler Ketu. Element: Water. Quality: Fixed. Gender: Female. Direction: North. Vrishchika governs transformation, the occult, hidden knowledge, intensity, and regeneration.

9. Dhanu (Sagittarius) — Ruler: Jupiter (Guru/Brihaspati). Element: Fire. Quality: Dual. Gender: Male. Direction: East. Dhanu represents dharma, higher learning, philosophy, long journeys, and the pursuit of truth.

10. Makara (Capricorn) — Ruler: Saturn (Shani). Element: Earth. Quality: Movable. Gender: Female. Direction: South. Makara embodies ambition, discipline, worldly achievement, structure, and karma.

11. Kumbha (Aquarius) — Ruler: Saturn (Shani), co-ruler Rahu. Element: Air. Quality: Fixed. Gender: Male. Direction: West. Kumbha governs innovation, humanitarian ideals, community, and detachment from material desires.

12. Meena (Pisces) — Ruler: Jupiter (Guru). Element: Water. Quality: Dual. Gender: Female. Direction: North. Meena represents dissolution, spirituality, compassion, imagination, and moksha (liberation).`,
  },

  // ─── 9 Grahas ─────────────────────────────────────────────────────────────────

  {
    section: 'Grahas',
    text: `The 9 Grahas (Celestial Influencers) of Vedic Astrology

The word Graha means "that which seizes or grasps." Unlike the Western concept of planets, Grahas include the two lunar nodes (Rahu and Ketu) and exclude the outer planets discovered after the Vedic period.

1. Surya (Sun) — The Atmakaraka (soul significator). Represents the self, father, authority, government, vitality, and the soul's purpose. Exalted in Mesha (Aries), debilitated in Tula (Libra). Its gem is Ruby (Manikya).

2. Chandra (Moon) — The Manokaraka (mind significator). Represents the mind, mother, emotions, nurturing, public image, and the subconscious. Exalted in Vrishabha (Taurus), debilitated in Vrishchika (Scorpio). Its gem is Pearl (Moti).

3. Mangala (Mars) — The Bhumikaraka (land significator). Represents energy, courage, siblings, property, surgery, and military pursuits. Exalted in Makara (Capricorn), debilitated in Karka (Cancer). Its gem is Red Coral (Moonga).

4. Budha (Mercury) — The Vidyakaraka (knowledge significator). Represents intellect, communication, commerce, mathematics, and analytical ability. Exalted in Kanya (Virgo), debilitated in Meena (Pisces). Its gem is Emerald (Panna).

5. Guru/Brihaspati (Jupiter) — The Dhanakaraka (wealth/wisdom significator). Represents wisdom, expansion, children, dharma, higher learning, and grace. Exalted in Karka (Cancer), debilitated in Makara (Capricorn). Its gem is Yellow Sapphire (Pukhraj).`,
  },
  {
    section: 'Grahas',
    text: `6. Shukra (Venus) — The Kalatrakaraka (spouse significator). Represents love, beauty, luxury, arts, marriage, and sensual pleasures. Exalted in Meena (Pisces), debilitated in Kanya (Virgo). Its gem is Diamond (Heera).

7. Shani (Saturn) — The Karmakaraka (karma significator). Represents discipline, longevity, suffering, service, justice, and karmic lessons. Exalted in Tula (Libra), debilitated in Mesha (Aries). Its gem is Blue Sapphire (Neelam). Shani is the great teacher who rewards patience and punishes shortcuts.

8. Rahu (North Lunar Node) — The shadow planet of worldly desire. Represents illusion, foreign things, technology, obsession, and material ambition. Functions like Saturn. Exalted in Vrishabha (Taurus) or Mithuna (Gemini) per different traditions. Its gem is Hessonite Garnet (Gomed).

9. Ketu (South Lunar Node) — The shadow planet of spiritual liberation. Represents detachment, past-life karma, mysticism, moksha, and sudden events. Functions like Mars. Exalted in Vrishchika (Scorpio) or Dhanu (Sagittarius) per different traditions. Its gem is Cat's Eye (Lehsunia).

The Navagraha (nine planets) form the foundation of all Jyotisha analysis. Their positions in the Rashis and Nakshatras at the time of birth create the Kundli (horoscope), which maps the individual's karma and life trajectory.`,
  },

  // ─── Vimshottari Dasha ────────────────────────────────────────────────────────

  {
    section: 'Vimshottari Dasha',
    text: `The Vimshottari Dasha System

The Vimshottari Dasha is the primary planetary period system used in Vedic astrology for timing events. It operates on a 120-year cycle divided among the nine Grahas, each ruling a Mahadasha (major period):

Ketu: 7 years | Venus: 20 years | Sun: 6 years | Moon: 10 years | Mars: 7 years | Rahu: 18 years | Jupiter: 16 years | Saturn: 19 years | Mercury: 17 years

The starting Dasha is determined by the Moon's exact position in a Nakshatra at birth. Each Nakshatra is ruled by one of the nine Grahas, and the portion of the Nakshatra already traversed by the Moon determines how much of the initial Dasha has elapsed.

Subdivision Hierarchy:
- Mahadasha (major period): The main planetary period
- Antardasha (sub-period): Division within Mahadasha
- Pratyantardasha: Sub-sub-period
- Sookshma Dasha: Minute sub-period
- Prana Dasha: Finest sub-period

The effects of a Dasha depend on:
1. The Graha's placement in the birth chart (house and sign)
2. The Graha's dignity (exalted, own sign, friendly, debilitated)
3. Aspects (Drishti) received by the Graha
4. Yogas (combinations) the Graha participates in
5. The Graha's natural significations (Naisargika Karakatva)

During a Mahadasha, the themes of the ruling Graha become prominent in the native's life. The Antardasha lord modulates these themes, creating nuanced periods of activation.`,
  },

  // ─── Ashtakoot Compatibility ──────────────────────────────────────────────────

  {
    section: 'Ashtakoot Compatibility',
    text: `The Ashtakoot (Eight-Fold) Compatibility System

Ashtakoot Milan is the traditional Vedic method for assessing marriage compatibility based on the Moon Nakshatras of both individuals. The eight factors (Kootas) and their maximum points are:

1. Varna (Caste/Spiritual Temperament) — 1 point max
Four varnas: Brahmana, Kshatriya, Vaishya, Shudra. The groom's Varna should ideally be equal to or higher than the bride's. Represents spiritual compatibility.

2. Vashya (Dominance/Attraction) — 2 points max
Five categories: Chatushpada (quadruped), Manava (human), Jalachara (aquatic), Vanachara (wild), Keeta (insect). Determines mutual attraction and control dynamics.

3. Tara (Birth Star Compatibility) — 3 points max
Based on the count from the bride's Nakshatra to the groom's and vice versa. Divided into 9 groups of 3 Nakshatras each: Janma, Sampat, Vipat, Kshema, Pratyari, Sadhaka, Vadha, Mitra, Ati Mitra.

4. Yoni (Sexual/Physical Compatibility) — 4 points max
14 animal types associated with Nakshatras. Matching, friendly, neutral, enemy, and sworn-enemy animal pairs determine physical compatibility.

5. Graha Maitri (Planetary Friendship) — 5 points max
Based on the friendship between the Rashi lords of both Moon signs. Natural friendship/enmity between planets determines mental wavelength compatibility.

6. Gana (Temperament) — 6 points max
Three Ganas: Deva (divine), Manushya (human), Rakshasa (demonic). Same-Gana matches score highest. Determines emotional and temperamental harmony.

7. Bhakoot (Moon Sign Relationship) — 7 points max
Based on the relative position of both Moon signs (2/12, 6/8, 5/9, etc.). Certain combinations are auspicious while 6/8 and 2/12 relationships can indicate challenges.

8. Nadi (Physiological/Genetic Compatibility) — 8 points max
Three Nadis: Aadi (Vata), Madhya (Pitta), Antya (Kapha). Same-Nadi match scores 0 (most inauspicious, indicating potential health issues in offspring). Different Nadi scores 8.

Total: 36 points. A score of 18+ is generally considered acceptable. 25+ is excellent. Below 18 requires careful consideration of Graha Doshams and remedial measures.`,
  },

  // ─── Bhagavad Gita ────────────────────────────────────────────────────────────

  {
    section: 'Bhagavad Gita',
    text: `The Bhagavad Gita — Chapter Summaries (Chapters 1-6)

The Bhagavad Gita ("Song of God") is a 700-verse scripture within the Mahabharata, comprising a dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra. It addresses the moral and philosophical dilemmas of life through three primary paths: Karma Yoga (action), Jnana Yoga (knowledge), and Bhakti Yoga (devotion).

Chapter 1: Arjuna Vishada Yoga (The Yoga of Arjuna's Dejection)
Arjuna surveys the battlefield and sees beloved teachers, relatives, and friends on both sides. Overwhelmed by grief and moral confusion, he puts down his weapons and refuses to fight. This chapter establishes the human predicament that the Gita addresses.

Chapter 2: Sankhya Yoga (The Yoga of Knowledge)
Krishna begins his teaching with the immortality of the Atman (soul). The famous verse "The soul is never born, nor does it die" establishes the metaphysical foundation. Krishna introduces Karma Yoga — performing one's duty without attachment to results (Nishkama Karma). This chapter contains the Gita's most quoted verse on action without attachment to fruits.

Chapter 3: Karma Yoga (The Yoga of Action)
Krishna elaborates on selfless action. Even wise persons must act, for inaction is impossible for embodied beings. One should act according to one's dharma without ego, offering all actions to the Divine. The concept of Svadharma (one's own duty) is emphasized over Paradharma (another's duty).

Chapter 4: Jnana Karma Sannyasa Yoga (The Yoga of Knowledge and Renunciation of Action)
Krishna reveals the eternal nature of this teaching, passed through a lineage of spiritual masters. He describes the divine incarnation (Avatar) doctrine: "Whenever dharma declines, I manifest Myself." Different types of sacrifice (Yajna) are explained.

Chapter 5: Karma Sannyasa Yoga (The Yoga of Renunciation)
Krishna reconciles renunciation of action with performance of action, declaring both paths lead to liberation but Karma Yoga is superior. A true Sannyasi renounces the fruits of action, not action itself. The wise see all beings as equal.

Chapter 6: Dhyana Yoga (The Yoga of Meditation)
Detailed instructions on meditation practice: posture, breath, mental focus. The mind is declared both the friend and enemy of the self. Krishna describes the characteristics of a Sthitaprajna (one of steady wisdom). Even partial practice brings benefit in future lives.`,
  },
  {
    section: 'Bhagavad Gita',
    text: `The Bhagavad Gita — Chapter Summaries (Chapters 7-12)

Chapter 7: Jnana Vijnana Yoga (The Yoga of Knowledge and Wisdom)
Krishna reveals His nature as the Supreme Reality underlying all existence. He describes His lower nature (Apara Prakriti — material elements) and higher nature (Para Prakriti — consciousness). Four types of devotees are described. Rare is the soul who truly knows Krishna.

Chapter 8: Akshara Brahma Yoga (The Yoga of the Imperishable Brahman)
The science of death and afterlife is explained. What one thinks of at the moment of death determines one's next destination. The paths of light (Devayana) and darkness (Pitriyana) after death are described. Constant remembrance of the Divine is emphasized.

Chapter 9: Raja Vidya Raja Guhya Yoga (The Yoga of Royal Knowledge and Royal Secret)
Krishna calls this the supreme knowledge, the greatest secret. He is the creator, sustainer, and destroyer of the universe, yet remains transcendent. Even a small offering of a leaf, flower, fruit, or water, given with devotion, is accepted. All paths ultimately lead to Him.

Chapter 10: Vibhuti Yoga (The Yoga of Divine Manifestations)
Krishna describes His divine manifestations (Vibhutis) in all realms: He is the best among all categories of existence. Among mountains, He is Meru; among rivers, the Ganga; among scriptures, the Sama Veda; among letters, the syllable Om. This chapter reveals divinity in all things.

Chapter 11: Vishvarupa Darshana Yoga (The Yoga of the Cosmic Vision)
Arjuna requests to see Krishna's universal form. Krishna grants divine vision, and Arjuna beholds the terrifying, infinite Vishvarupa containing all creation, preservation, and destruction simultaneously. Overwhelmed, Arjuna begs Krishna to return to His gentle human form.

Chapter 12: Bhakti Yoga (The Yoga of Devotion)
Krishna declares devotion (Bhakti) as the most accessible path to realization. Qualities of the ideal devotee: free from hatred, friendly, compassionate, without ego, equipoised in pleasure and pain, forgiving, content, self-controlled, and firmly devoted. This devotee is extremely dear to Krishna.`,
  },
  {
    section: 'Bhagavad Gita',
    text: `The Bhagavad Gita — Chapter Summaries (Chapters 13-18)

Chapter 13: Kshetra Kshetrajna Vibhaga Yoga (The Yoga of the Field and Knower)
Distinction between the body (Kshetra/field) and the soul (Kshetrajna/knower of the field). Twenty qualities of true knowledge are listed, including humility, non-violence, patience, and devotion to the teacher. Understanding this distinction leads to liberation.

Chapter 14: Gunatraya Vibhaga Yoga (The Yoga of the Three Gunas)
The three qualities of material nature: Sattva (goodness/harmony), Rajas (passion/activity), Tamas (ignorance/inertia). All beings and actions are influenced by these Gunas. Transcending all three leads to liberation. Each Guna binds in its own way.

Chapter 15: Purushottama Yoga (The Yoga of the Supreme Person)
The metaphor of the Ashvattha (sacred fig) tree with roots above and branches below represents the material world. Krishna is the Supreme Person (Purushottama), beyond both the perishable (Kshara) and the imperishable (Akshara). He dwells in the hearts of all beings.

Chapter 16: Daivasura Sampad Vibhaga Yoga (The Yoga of Divine and Demonic Natures)
Twenty-six divine qualities (fearlessness, purity, charity, self-control) and six demonic qualities (hypocrisy, arrogance, anger) are enumerated. The three gates to self-destruction are lust, anger, and greed. Scriptures (Shastra) should guide one's conduct.

Chapter 17: Shraddhatraya Vibhaga Yoga (The Yoga of Three Kinds of Faith)
Faith, food, sacrifice, austerity, and charity are each classified according to the three Gunas. The sacred syllable "Om Tat Sat" is invoked for purifying all spiritual acts.

Chapter 18: Moksha Sannyasa Yoga (The Yoga of Liberation through Renunciation)
The grand conclusion. Renunciation means abandoning the fruits of action, not action itself. Action, knowledge, actor, intellect, fortitude, and happiness are each classified by the three Gunas. Krishna's final teaching: "Surrender all dharmas unto Me. I shall free you from all sins. Do not grieve." Arjuna's confusion is dispelled, and he resolves to fight as a matter of dharmic duty.`,
  },

  // ─── Panchanga ────────────────────────────────────────────────────────────────

  {
    section: 'Panchanga',
    text: `Panchanga — The Five Limbs of Vedic Time

The Panchanga (Pancha = five, Anga = limb) is the traditional Vedic calendar and almanac system that tracks five essential elements of time. It is fundamental to Muhurta (electional astrology) and daily astrological practice.

1. Tithi (Lunar Day) — 30 tithis per lunar month
A Tithi is completed when the Moon gains 12° over the Sun. There are 15 tithis in each half (Shukla Paksha/bright half and Krishna Paksha/dark half). Each Tithi is ruled by a deity and is suitable for specific activities. The five groups are: Nanda (1,6,11), Bhadra (2,7,12), Jaya (3,8,13), Rikta (4,9,14), Purna (5,10,15/Amavasya/Purnima).

2. Vara (Weekday) — 7 Varas
Each day is ruled by a Graha: Ravivara (Sunday/Sun), Somavara (Monday/Moon), Mangalavara (Tuesday/Mars), Budhavara (Wednesday/Mercury), Guruvara (Thursday/Jupiter), Shukravara (Friday/Venus), Shanivara (Saturday/Saturn).

3. Nakshatra (Lunar Mansion) — 27 Nakshatras
The Moon's position in one of the 27 Nakshatras determines the daily Nakshatra. Each lasts approximately one day (the Moon transits ~13°20' daily). Specific Nakshatras are auspicious or inauspicious for various activities.

4. Yoga (Luni-Solar Combination) — 27 Yogas
A Yoga is formed by the combined longitude of the Sun and Moon divided by 13°20'. The 27 Yogas range from Vishkambha to Vaidhriti. Some are auspicious (Siddha, Amrita, Shubha) and others inauspicious (Vyaghata, Vajra, Parigha).

5. Karana (Half-Tithi) — 11 Karanas
Each Tithi has two Karanas. There are 4 fixed Karanas (Shakuni, Chatushpada, Naga, Kimstughna) and 7 movable Karanas (Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti). Vishti (Bhadra) Karana is generally considered inauspicious.

The Panchanga is consulted daily by Vedic astrologers, priests, and practitioners to determine auspicious timings (Muhurtas) for rituals, ceremonies, travel, business ventures, and all important activities.`,
  },

  // ─── Vastu Shastra ────────────────────────────────────────────────────────────

  {
    section: 'Vastu Shastra',
    text: `Vastu Shastra — The Science of Sacred Architecture

Vastu Shastra is the ancient Indian science of architecture and spatial arrangement, based on the harmonious alignment of structures with natural forces and cosmic energies. It is derived from the Sthapatya Veda, an Upaveda (subsidiary Veda) of the Atharva Veda.

The Vastu Purusha Mandala:
The foundational concept is the Vastu Purusha — a cosmic being whose body forms the blueprint for any structure. The Mandala (grid) maps this being onto the plot of land:
- Head (Ishanya/Northeast): Governed by Jupiter. Zone of water, prayer, and meditation.
- Right Hand (Purva/East): Governed by Sun. Zone of new beginnings and health.
- Left Hand (Paschima/West): Governed by Saturn. Zone of gains and storage.
- Feet (Nairitya/Southwest): Governed by Rahu. Zone of stability, the master bedroom.
- Centre (Brahmasthan): The sacred center, governed by Brahma. Should be open and unobstructed.

Cardinal Directions and Their Significance:
North (Uttara) — Ruled by Kubera (god of wealth). Associated with Mercury. Ideal for: Financial activities, treasure, safe, living room.
East (Purva) — Ruled by Indra (king of gods). Associated with Sun. Ideal for: Main entrance, prayer room, open spaces.
South (Dakshina) — Ruled by Yama (god of dharma/death). Associated with Mars. Ideal for: Heavy construction, master bedroom, storage.
West (Paschima) — Ruled by Varuna (god of water). Associated with Saturn. Ideal for: Dining, children's room, study.
Northeast (Ishanya) — Most auspicious. Water element. Keep clean, open, and lightweight.
Southeast (Agneya) — Fire element. Ideal for kitchen.
Southwest (Nairitya) — Earth element. Heaviest constructions here.
Northwest (Vayavya) — Air element. Guest rooms, garage.

The Five Elements (Pancha Mahabhutas) in Vastu:
Earth (Prithvi), Water (Jala), Fire (Agni), Air (Vayu), Space (Akasha) must be balanced in every structure for harmony and prosperity.`,
  },

  // ─── Kundli (Birth Chart) Basics ──────────────────────────────────────────────

  {
    section: 'Kundli',
    text: `The Kundli (Vedic Birth Chart) — Foundational Concepts

A Kundli (also called Janam Kundali or Janam Patri) is the Vedic birth chart — a celestial map of the exact positions of all nine Grahas at the moment of birth, set against the backdrop of the 12 Rashis and 27 Nakshatras.

The 12 Bhavas (Houses):
Each house governs specific life domains:
1st House (Lagna/Ascendant): Self, personality, physical body, health, overall life direction.
2nd House (Dhana): Wealth, family, speech, food, values, early education.
3rd House (Sahaja): Siblings, courage, communication, short journeys, skills, hobbies.
4th House (Sukha): Mother, home, vehicles, emotional well-being, education, property.
5th House (Putra): Children, creativity, intelligence, romance, past-life merit (Purva Punya), speculation.
6th House (Ripu): Enemies, disease, debts, daily work, service, pets, obstacles.
7th House (Kalatra): Spouse, partnerships, business, foreign travel, public dealings.
8th House (Randhra): Longevity, sudden events, inheritance, occult, transformation, chronic illness.
9th House (Dharma): Father, luck, higher education, dharma, long journeys, guru, philosophy.
10th House (Karma): Career, reputation, authority, government, public status, actions.
11th House (Labha): Gains, income, elder siblings, friends, aspirations, social networks.
12th House (Vyaya): Losses, expenses, foreign lands, spirituality, isolation, moksha, sleep.

Key Chart Components:
Lagna (Ascendant): The rising sign at birth; the most important point in the chart.
Moon Sign (Rashi): Where the Moon is placed; governs the mind and emotions.
Sun Sign: Represents the soul, father, and ego.
Yogas: Special planetary combinations that modify the chart's results.
Drishti (Aspects): Each Graha casts specific aspects that influence other houses and Grahas.`,
  },

  // ─── Important Yogas ──────────────────────────────────────────────────────────

  {
    section: 'Yogas',
    text: `Important Yogas in Vedic Astrology

Yogas are specific planetary combinations that produce notable results in a person's life. They are a distinctive feature of Jyotisha not found in Western astrology.

Raja Yogas (Combinations of Power):
Raja Yoga forms when lords of Kendra houses (1, 4, 7, 10) combine with lords of Trikona houses (1, 5, 9) through conjunction, mutual aspect, or exchange. The strongest Raja Yogas involve the 9th and 10th lords. These yogas bestow authority, wealth, and social status.

Dhana Yogas (Wealth Combinations):
Formed by connections between the 2nd house (accumulated wealth), 11th house (income), and their lords with benefic planets. The strongest Dhana Yoga involves the 2nd and 11th lords in mutual exchange with Jupiter aspecting.

Pancha Mahapurusha Yogas (Five Great Person Yogas):
These form when Mars, Mercury, Jupiter, Venus, or Saturn occupy their own sign or exaltation sign in a Kendra house:
- Ruchaka Yoga (Mars): Brave, commanding, athletic
- Bhadra Yoga (Mercury): Intellectual, eloquent, wealthy
- Hamsa Yoga (Jupiter): Righteous, learned, revered
- Malavya Yoga (Venus): Beautiful, artistic, luxurious
- Shasha Yoga (Saturn): Powerful, disciplined, authoritative

Gajakesari Yoga: Moon and Jupiter in mutual Kendras. Gives wisdom, prosperity, and lasting fame.

Budhaditya Yoga: Sun and Mercury conjunct. Gives intelligence, communication skills, and governmental favour.

Chandra-Mangala Yoga: Moon and Mars conjunction or mutual aspect. Gives wealth through enterprise, bold nature.

Viparita Raja Yoga: Lords of Dusthana houses (6, 8, 12) in other Dusthana houses. Paradoxically gives rise through adversity, enemies' destruction, and unexpected gains.

Kemadruma Yoga (Inauspicious): Moon with no planets in the 2nd or 12th from it. Can indicate emotional difficulties and poverty unless cancelled by other factors.

Neecha Bhanga Raja Yoga: A debilitated planet whose debilitation is cancelled by specific conditions. The native rises from humble beginnings to great heights.`,
  },

  // ─── Remedial Measures ────────────────────────────────────────────────────────

  {
    section: 'Remedies',
    text: `Vedic Astrological Remedies (Upayas)

Jyotisha provides a sophisticated system of remedies to mitigate negative planetary influences and strengthen beneficial ones:

Mantra (Sacred Sound):
Each Graha has specific Beej (seed) mantras and Vedic mantras:
- Surya: "Om Hraam Hreem Hraum Sah Suryaya Namah"
- Chandra: "Om Shraam Shreem Shraum Sah Chandraya Namah"
- Mangala: "Om Kraam Kreem Kraum Sah Bhaumaya Namah"
- Budha: "Om Braam Breem Braum Sah Budhaya Namah"
- Guru: "Om Graam Greem Graum Sah Gurave Namah"
- Shukra: "Om Draam Dreem Draum Sah Shukraya Namah"
- Shani: "Om Praam Preem Praum Sah Shanaye Namah"
- Rahu: "Om Bhraam Bhreem Bhraum Sah Rahave Namah"
- Ketu: "Om Sraam Sreem Sraum Sah Ketave Namah"

Ratna (Gemstone Therapy):
Each Graha is associated with a gemstone that amplifies its positive qualities. The gem should be natural, untreated, and of sufficient carat weight. It must be worn on the correct finger, on the correct day, during the planet's Hora.

Dana (Charity):
Donating items associated with a specific Graha can reduce its malefic effects. Saturday charity of black sesame seeds, iron items, or oil helps Saturn. Tuesday charity of red lentils, jaggery, or copper helps Mars.

Yantra (Sacred Geometry):
Yantras are geometric diagrams that capture and channel planetary energies. The Sri Yantra is the most powerful, representing the cosmos itself. Each Graha has its own Yantra for worship and meditation.

Vrata (Fasting/Observances):
Fasting on specific days corresponding to troubled planets: Monday for Moon, Tuesday for Mars, Wednesday for Mercury, Thursday for Jupiter, Friday for Venus, Saturday for Saturn.`,
  },

  // ─── Numerology ───────────────────────────────────────────────────────────────

  {
    section: 'Numerology',
    text: `Vedic Numerology (Sankhya Shastra)

Vedic Numerology assigns cosmic significance to numbers 1-9, each corresponding to a Graha:

1 (Surya/Sun): Leadership, independence, originality, ambition. The number of creation and new beginnings. People with 1 as their life path are natural leaders.

2 (Chandra/Moon): Cooperation, diplomacy, sensitivity, balance. The number of duality and partnerships. 2s are peacemakers, intuitive, and emotionally aware.

3 (Guru/Jupiter): Expression, creativity, joy, expansion. The number of the trinity and artistic expression. 3s are creative communicators and optimists.

4 (Rahu): Structure, stability, hard work, unconventional methods. The number of foundations and material mastery. 4s are builders who may take unusual paths.

5 (Budha/Mercury): Freedom, change, communication, versatility. The number of the five senses and adaptability. 5s love travel, variety, and intellectual stimulation.

6 (Shukra/Venus): Love, harmony, beauty, responsibility. The number of domesticity and artistic refinement. 6s are nurturers, drawn to beauty and service.

7 (Ketu): Spirituality, introspection, analysis, mysticism. The number of seekers and philosophers. 7s are drawn to inner knowledge and metaphysical truth.

8 (Shani/Saturn): Power, karma, material success, discipline. The number of cause and effect. 8s experience extremes and must learn the responsible use of power.

9 (Mangala/Mars): Completion, universal love, courage, service. The number of the warrior-sage. 9s are idealistic, compassionate, and driven to serve humanity.

Key Calculations:
Life Path Number: Sum of all digits in the birth date, reduced to a single digit.
Destiny Number: Sum of all letters in the full birth name (using Chaldean or Pythagorean values).
Soul Urge Number: Sum of vowels in the name. Reveals inner desires.`,
  },

  // ─── Tarot and Vedic Connections ──────────────────────────────────────────────

  {
    section: 'Tarot',
    text: `Tarot and Its Vedic Astrological Correspondences

The Tarot's Major Arcana can be mapped to Vedic astrological concepts, creating a bridge between Western esoteric and Eastern Vedic traditions:

Major Arcana — Planetary Correspondences:
The Fool (0) — Ketu (spiritual liberation, the leap of faith into the unknown)
The Magician (I) — Budha/Mercury (skill, communication, manifestation)
The High Priestess (II) — Chandra/Moon (intuition, the subconscious, mystery)
The Empress (III) — Shukra/Venus (fertility, abundance, beauty, Lakshmi)
The Emperor (IV) — Surya/Sun (authority, structure, the father, Rama)
The Hierophant (V) — Guru/Jupiter (wisdom, tradition, the guru, Brihaspati)
The Lovers (VI) — Mithuna/Gemini (choice, union, duality)
The Chariot (VII) — Karka/Cancer (emotional control, victory, Arjuna's chariot)
Strength (VIII) — Simha/Leo (courage, inner power, Durga energy)
The Hermit (IX) — Kanya/Virgo (introspection, wisdom, the sage in the cave)
Wheel of Fortune (X) — Rahu (karma, cycles, fate, the wheel of samsara)
Justice (XI) — Tula/Libra (dharma, balance, cosmic law)
The Hanged Man (XII) — Shani/Saturn (sacrifice, new perspective, tapas)
Death (XIII) — Vrishchika/Scorpio (transformation, rebirth, Shiva's dance)
Temperance (XIV) — Dhanu/Sagittarius (balance, higher purpose, the middle path)
The Tower (XVI) — Mangala/Mars (sudden destruction, ego dissolution, Rudra)
The Star (XVII) — Kumbha/Aquarius (hope, inspiration, cosmic connection)
The Moon (XVIII) — Meena/Pisces (illusion, the subconscious, dreams, Maya)
The Sun (XIX) — Surya/Sun (vitality, success, enlightenment, Surya Narayana)
Judgement (XX) — Guru/Jupiter (resurrection, karmic evaluation, dharmic renewal)
The World (XXI) — Shani/Saturn (completion, mastery, moksha)`,
  },
];
