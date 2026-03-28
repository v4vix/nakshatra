import { Graha } from '../types';

export const GRAHAS: Graha[] = [
  {
    id: 1,
    name: 'Sun',
    sanskritName: 'Surya',
    symbol: '☉',
    mahadashaYears: 6,
    exaltationSign: 1,      // Mesha (Aries)
    debilitationSign: 7,    // Tula (Libra)
    ownSigns: [5],          // Simha (Leo)
    mooltrikonSign: 5,
    nature: 'Malefic',
    friendlyPlanets: ['Moon', 'Mars', 'Jupiter'],
    neutralPlanets: ['Mercury'],
    enemyPlanets: ['Venus', 'Saturn', 'Rahu', 'Ketu'],
    color: 'Orange / Copper',
    gemstone: 'Ruby',
    day: 'Sunday',
    direction: 'East',
    metal: 'Gold',
    deity: 'Shiva / Agni',
    karakatwa: [
      'Soul (Atma)', 'Father', 'Government and Authority', 'Self-confidence',
      'Health and Vitality', 'Bones', 'Leadership', 'Politics', 'Name and Fame',
      'Eyes (right eye for males)', 'Heart', 'Forests',
    ],
    bodyParts: ['Heart', 'Spine', 'Right Eye (Male)', 'Left Eye (Female)', 'Bones'],
    diseases: ['Heart disease', 'Eye problems', 'Skin diseases', 'Fever', 'Bone disorders'],
    professions: ['Government official', 'Doctor', 'Politician', 'Administrator', 'Gold dealer', 'Timber merchant'],
  },
  {
    id: 2,
    name: 'Moon',
    sanskritName: 'Chandra',
    symbol: '☽',
    mahadashaYears: 10,
    exaltationSign: 2,      // Vrishabha (Taurus)
    debilitationSign: 8,    // Vrischika (Scorpio)
    ownSigns: [4],          // Karka (Cancer)
    mooltrikonSign: 2,
    nature: 'Benefic',
    friendlyPlanets: ['Sun', 'Mercury'],
    neutralPlanets: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
    enemyPlanets: [],
    color: 'White / Pearl',
    gemstone: 'Pearl',
    day: 'Monday',
    direction: 'NW',
    metal: 'Silver',
    deity: 'Parvati / Goddess Durga',
    karakatwa: [
      'Mind (Manas)', 'Mother', 'Emotions', 'Memory', 'Imagination',
      'Public', 'Water and fluids', 'Agriculture', 'Milk', 'White items',
      'Travel (especially by water)', 'Left eye', 'Breast',
    ],
    bodyParts: ['Mind', 'Blood', 'Breast', 'Left Eye', 'Uterus', 'Stomach'],
    diseases: ['Mental disorders', 'Emotional instability', 'Tuberculosis', 'Anaemia', 'Asthma'],
    professions: ['Nurse', 'Sailor', 'Farmer', 'Caterer', 'Dairy industry', 'Hotel industry', 'Cloth merchant'],
  },
  {
    id: 3,
    name: 'Mars',
    sanskritName: 'Mangal',
    symbol: '♂',
    mahadashaYears: 7,
    exaltationSign: 10,     // Makara (Capricorn)
    debilitationSign: 4,    // Karka (Cancer)
    ownSigns: [1, 8],       // Mesha, Vrischika
    mooltrikonSign: 1,
    nature: 'Malefic',
    friendlyPlanets: ['Sun', 'Moon', 'Jupiter'],
    neutralPlanets: ['Venus', 'Saturn'],
    enemyPlanets: ['Mercury'],
    color: 'Red / Scarlet',
    gemstone: 'Red Coral',
    day: 'Tuesday',
    direction: 'South',
    metal: 'Copper',
    deity: 'Kartikeya / Subramanya',
    karakatwa: [
      'Energy and Courage', 'Younger siblings', 'Land and Property',
      'Military and Police', 'Surgery', 'Blood', 'Accidents',
      'Determination', 'Technology and Engineering', 'Weapons',
    ],
    bodyParts: ['Blood', 'Bone marrow', 'Muscles', 'Forehead', 'Nose', 'Genitalia'],
    diseases: ['Blood disorders', 'Accidents', 'Surgery', 'Fever', 'Inflammation', 'Wounds'],
    professions: ['Soldier', 'Surgeon', 'Engineer', 'Police officer', 'Butcher', 'Real estate dealer'],
  },
  {
    id: 4,
    name: 'Mercury',
    sanskritName: 'Budha',
    symbol: '☿',
    mahadashaYears: 17,
    exaltationSign: 6,      // Kanya (Virgo) - 15° specifically
    debilitationSign: 12,   // Meena (Pisces)
    ownSigns: [3, 6],       // Mithuna, Kanya
    mooltrikonSign: 6,
    nature: 'Neutral',
    friendlyPlanets: ['Sun', 'Venus'],
    neutralPlanets: ['Mars', 'Jupiter', 'Saturn'],
    enemyPlanets: ['Moon'],
    color: 'Green / Grass Green',
    gemstone: 'Emerald',
    day: 'Wednesday',
    direction: 'North',
    metal: 'Bronze / Mixed metals',
    deity: 'Vishnu',
    karakatwa: [
      'Intelligence and Intellect', 'Communication', 'Education', 'Writing',
      'Trade and Commerce', 'Nervous system', 'Skin', 'Maternal uncle',
      'Mathematics', 'Astrology and occult sciences', 'Speech',
    ],
    bodyParts: ['Nervous system', 'Skin', 'Speech organs', 'Tongue', 'Arms'],
    diseases: ['Nervous disorders', 'Skin diseases', 'Speech defects', 'Respiratory issues', 'Anxiety'],
    professions: ['Writer', 'Teacher', 'Accountant', 'Journalist', 'Lawyer', 'Astrologer', 'Trader'],
  },
  {
    id: 5,
    name: 'Jupiter',
    sanskritName: 'Guru',
    symbol: '♃',
    mahadashaYears: 16,
    exaltationSign: 4,      // Karka (Cancer)
    debilitationSign: 10,   // Makara (Capricorn)
    ownSigns: [9, 12],      // Dhanu, Meena
    mooltrikonSign: 9,
    nature: 'Benefic',
    friendlyPlanets: ['Sun', 'Moon', 'Mars'],
    neutralPlanets: ['Saturn'],
    enemyPlanets: ['Mercury', 'Venus'],
    color: 'Yellow / Golden',
    gemstone: 'Yellow Sapphire',
    day: 'Thursday',
    direction: 'NE',
    metal: 'Gold / Brass',
    deity: 'Indra / Brahma',
    karakatwa: [
      'Wisdom and Higher Knowledge', 'Children (sons)', 'Husband (in female chart)',
      'Guru and Teacher', 'Religion and Dharma', 'Wealth (Dhana)', 'Liver',
      'Long-distance travel', 'Philosophy', 'Law', 'Luck and Fortune',
    ],
    bodyParts: ['Liver', 'Thighs', 'Hips', 'Arterial system', 'Fat in body'],
    diseases: ['Liver disease', 'Diabetes', 'Obesity', 'Jaundice', 'Ear problems'],
    professions: ['Judge', 'Teacher/Professor', 'Priest/Guru', 'Lawyer', 'Banker', 'Doctor', 'Philosopher'],
  },
  {
    id: 6,
    name: 'Venus',
    sanskritName: 'Shukra',
    symbol: '♀',
    mahadashaYears: 20,
    exaltationSign: 12,     // Meena (Pisces)
    debilitationSign: 6,    // Kanya (Virgo)
    ownSigns: [2, 7],       // Vrishabha, Tula
    mooltrikonSign: 7,
    nature: 'Benefic',
    friendlyPlanets: ['Mercury', 'Saturn'],
    neutralPlanets: ['Mars', 'Jupiter'],
    enemyPlanets: ['Sun', 'Moon'],
    color: 'White / Cream',
    gemstone: 'Diamond',
    day: 'Friday',
    direction: 'SE',
    metal: 'Silver / Platinum',
    deity: 'Lakshmi',
    karakatwa: [
      'Love and Romance', 'Wife (in male chart)', 'Arts and Creativity',
      'Luxury and Comfort', 'Vehicles', 'Music', 'Dance', 'Jewellery',
      'Bedroom pleasures', 'Flowers and Perfumes', 'Semen (Shukra)',
    ],
    bodyParts: ['Reproductive organs', 'Kidneys', 'Skin', 'Cheeks', 'Throat'],
    diseases: ['Reproductive disorders', 'Kidney disease', 'Diabetes', 'Skin disorders', 'Venereal diseases'],
    professions: ['Artist', 'Musician', 'Actor/Actress', 'Fashion designer', 'Hotel industry', 'Jeweller'],
  },
  {
    id: 7,
    name: 'Saturn',
    sanskritName: 'Shani',
    symbol: '♄',
    mahadashaYears: 19,
    exaltationSign: 7,      // Tula (Libra)
    debilitationSign: 1,    // Mesha (Aries)
    ownSigns: [10, 11],     // Makara, Kumbha
    mooltrikonSign: 11,
    nature: 'Malefic',
    friendlyPlanets: ['Mercury', 'Venus'],
    neutralPlanets: ['Jupiter'],
    enemyPlanets: ['Sun', 'Moon', 'Mars'],
    color: 'Dark Blue / Black',
    gemstone: 'Blue Sapphire',
    day: 'Saturday',
    direction: 'West',
    metal: 'Iron / Lead',
    deity: 'Yama / Vishnu (Kurma avatar)',
    karakatwa: [
      'Karma and Discipline', 'Old age and Longevity', 'Service workers and masses',
      'Delays and Obstacles', 'Chronic diseases', 'Detachment', 'Bones and Teeth',
      'Cold and Death', 'Foreign lands', 'Oil and fuel', 'Mines and underground',
    ],
    bodyParts: ['Bones', 'Teeth', 'Knees', 'Joints', 'Spleen', 'Hair and Nails'],
    diseases: ['Chronic diseases', 'Arthritis', 'Paralysis', 'Depression', 'Dental problems', 'Bone fractures'],
    professions: ['Laborer', 'Miner', 'Real estate (land)', 'Mechanic', 'Jailer', 'Antiquities dealer', 'Scientist'],
  },
  {
    id: 8,
    name: 'Rahu',
    sanskritName: 'Rahu',
    symbol: '☊',
    mahadashaYears: 18,
    exaltationSign: 2,      // Some traditions: Vrishabha; others: Mithuna
    debilitationSign: 8,    // Some traditions: Vrischika; others: Dhanu
    ownSigns: [11],         // Kumbha (by some authorities)
    mooltrikonSign: null,
    nature: 'Malefic',
    friendlyPlanets: ['Venus', 'Saturn', 'Mercury'],
    neutralPlanets: ['Jupiter'],
    enemyPlanets: ['Sun', 'Moon', 'Mars'],
    color: 'Smoky / Dark Blue',
    gemstone: 'Hessonite (Gomed)',
    day: 'Saturday (shared with Saturn)',
    direction: 'SW',
    metal: 'Lead / Mixed metals',
    deity: 'Durga / Kali',
    karakatwa: [
      'Illusion (Maya)', 'Foreign countries and travel', 'Ambition and Worldly desire',
      'Technology and Computers', 'Epidemics and Poison', 'Gambling', 'Paternal grandfather',
      'Outcasts and Foreigners', 'Sudden events', 'Mass media', 'Drugs and alcohol',
    ],
    bodyParts: ['Skin', 'Spleen', 'Legs', 'Feet'],
    diseases: ['Skin diseases', 'Poisoning', 'Mental confusion', 'Neurological disorders', 'Cancer (some authorities)'],
    professions: ['IT professional', 'Politician', 'Speculator', 'Film industry', 'Smuggler', 'Foreign trade'],
  },
  {
    id: 9,
    name: 'Ketu',
    sanskritName: 'Ketu',
    symbol: '☋',
    mahadashaYears: 7,
    exaltationSign: 8,      // Some traditions: Vrischika; others: Dhanu
    debilitationSign: 2,    // Some traditions: Vrishabha; others: Mithuna
    ownSigns: [8],          // Vrischika (by some authorities)
    mooltrikonSign: null,
    nature: 'Malefic',
    friendlyPlanets: ['Mars', 'Venus', 'Saturn'],
    neutralPlanets: ['Jupiter'],
    enemyPlanets: ['Sun', 'Moon', 'Mercury'],
    color: 'Smoky Grey / Pied',
    gemstone: 'Cat\'s Eye (Lehsunia)',
    day: 'Tuesday (shared with Mars)',
    direction: 'NW',
    metal: 'Lead / Iron',
    deity: 'Ganesha / Brahma',
    karakatwa: [
      'Spirituality and Moksha', 'Past life karma', 'Psychic abilities',
      'Maternal grandfather', 'Detachment', 'Occult knowledge', 'Research',
      'Wounds and surgery', 'Pets (dogs)', 'Foreign religions', 'Enlightenment',
    ],
    bodyParts: ['Spine', 'Feet', 'Abdomen'],
    diseases: ['Mysterious diseases', 'Insanity', 'Wounds', 'Abscesses', 'Spiritual afflictions'],
    professions: ['Spiritual teacher', 'Astrologer', 'Researcher', 'Doctor (surgery)', 'Soldier', 'Healer'],
  },
];

// Utility: get Graha by name
export function getGrahaByName(name: string): Graha | undefined {
  return GRAHAS.find(g => g.name.toLowerCase() === name.toLowerCase() ||
    g.sanskritName.toLowerCase() === name.toLowerCase());
}

// Vimshottari Dasha order
export const VIMSHOTTARI_ORDER: string[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

export const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export default GRAHAS;
