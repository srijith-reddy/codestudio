/**
 * The Atelier — public-domain paintings from many cultures.
 *
 * Each artwork is a real historical painting sourced from Wikimedia Commons
 * via the stable `Special:FilePath` redirector. The image loads progressively
 * behind a tile mask; as the user earns tiles, the tiles dissolve away and
 * reveal the painting underneath. If the image fails to load (rare, but
 * possible), the gradient background ensures the canvas never looks broken.
 *
 * Why real paintings instead of generative SVGs?
 *  - Felt impersonal. A Hokusai wave or a Vermeer pearl earring carries
 *    context and history that abstract shapes don't.
 *  - Cultural breadth. The previous version was three abstract pieces; this
 *    one spans European, Japanese, Chinese, Indian, Mughal, Mesoamerican,
 *    and Romantic/American schools, plus many centuries.
 *  - All works are confidently in the public domain (artist died >100y ago
 *    or the work predates 1926 US threshold).
 *
 * The Wikimedia `Special:FilePath/<filename>` URL is documented as the
 * canonical stable way to reference a Commons file — it redirects to the
 * current upload.wikimedia.org URL regardless of future server moves.
 */

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string; // display-friendly, e.g. "1889" or "c. 1665"
  culture: string; // short region/school label, e.g. "Dutch Golden Age", "Edo Japan"
  cols: number;
  rows: number;
  /** Wikimedia Commons filename (no `File:` prefix). Used for seed paintings. */
  commonsFile: string;
  /**
   * Optional direct CDN URL. Runtime-fetched paintings (e.g. from the Met
   * Museum API) set this and leave `commonsFile` empty — the canvas prefers
   * `imageUrl` when present.
   */
  imageUrl?: string;
  /** CSS gradient used as the base + fallback if the image fails to load. */
  background: string;
  description: string;
}

/**
 * Build a Wikimedia Commons image URL via the stable Special:FilePath
 * redirector. The `width` param asks Commons for a scaled thumbnail so we
 * don't pull 40MB originals on every render.
 */
export function commonsImageUrl(filename: string, width = 1200): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename,
  )}?width=${width}`;
}

const raw: Omit<Artwork, "cols" | "rows">[] = [
  // ── European: Post-Impressionism & Impressionism ─────────────────
  {
    id: "starry-night",
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at top, #1B2A55 0%, #0a1230 60%, #050818 100%)",
    description: "Swirling cypress, quiet village, a sky that will not sit still.",
  },
  {
    id: "water-lilies",
    title: "Water Lilies",
    artist: "Claude Monet",
    year: "1906",
    culture: "Impressionism · France",
    commonsFile: "Claude_Monet_-_Water_Lilies_-_1906,_Ryerson.jpg",
    background: "radial-gradient(ellipse at center, #214C3A 0%, #0f2a24 70%, #06141a 100%)",
    description: "Monet's pond at Giverny, painted as light rather than place.",
  },
  {
    id: "grande-jatte",
    title: "A Sunday on La Grande Jatte",
    artist: "Georges Seurat",
    year: "1884",
    culture: "Pointillism · France",
    commonsFile: "A_Sunday_on_La_Grande_Jatte,_Georges_Seurat,_1884.jpg",
    background: "radial-gradient(ellipse at center, #3E5C2F 0%, #1f2e17 70%, #0a120a 100%)",
    description: "Parisians at rest, assembled one dot at a time.",
  },

  // ── European: Dutch & Flemish Masters ────────────────────────────
  {
    id: "pearl-earring",
    title: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: "c. 1665",
    culture: "Dutch Golden Age",
    commonsFile: "1665_Girl_with_a_Pearl_Earring.jpg",
    background: "radial-gradient(ellipse at center, #2B1B0F 0%, #120a05 75%, #05020a 100%)",
    description: "A glance caught in paint — Vermeer's most famous sitter.",
  },
  {
    id: "night-watch",
    title: "The Night Watch",
    artist: "Rembrandt van Rijn",
    year: "1642",
    culture: "Dutch Golden Age",
    commonsFile: "The_Nightwatch_by_Rembrandt_-_Rijksmuseum.jpg",
    background: "radial-gradient(ellipse at center, #3A2512 0%, #17100a 70%, #05040a 100%)",
    description: "A civic militia frozen in chiaroscuro, stepping out of the dark.",
  },
  {
    id: "arnolfini",
    title: "The Arnolfini Portrait",
    artist: "Jan van Eyck",
    year: "1434",
    culture: "Early Netherlandish",
    commonsFile: "Van_Eyck_-_Arnolfini_Portrait.jpg",
    background: "radial-gradient(ellipse at center, #2E1E14 0%, #140c08 75%, #05030a 100%)",
    description: "Every mirror, dog, and candle carries a meaning. A room full of secrets.",
  },
  {
    id: "tower-of-babel",
    title: "The Tower of Babel",
    artist: "Pieter Bruegel the Elder",
    year: "1563",
    culture: "Flemish Renaissance",
    commonsFile:
      "Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg",
    background: "radial-gradient(ellipse at center, #4A3418 0%, #241a0c 75%, #0a0805 100%)",
    description: "A spiral ambition in brick and sky.",
  },

  // ── European: Italian Renaissance & Baroque ──────────────────────
  {
    id: "mona-lisa",
    title: "Mona Lisa",
    artist: "Leonardo da Vinci",
    year: "c. 1503",
    culture: "Italian Renaissance",
    commonsFile: "Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg",
    background: "radial-gradient(ellipse at center, #3D2A12 0%, #19110a 75%, #06040a 100%)",
    description: "A smile everyone has seen and no one can describe.",
  },
  {
    id: "birth-of-venus",
    title: "The Birth of Venus",
    artist: "Sandro Botticelli",
    year: "c. 1486",
    culture: "Italian Renaissance",
    commonsFile:
      "Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
    background: "radial-gradient(ellipse at center, #4A6B72 0%, #1f3338 70%, #081418 100%)",
    description: "Venus arrives on a shell, wind and flowers conspiring.",
  },
  {
    id: "creation-of-adam",
    title: "The Creation of Adam",
    artist: "Michelangelo",
    year: "c. 1512",
    culture: "Italian High Renaissance",
    commonsFile: "Michelangelo_-_Creation_of_Adam_(cropped).jpg",
    background: "radial-gradient(ellipse at center, #4A2E18 0%, #1f130a 75%, #06040a 100%)",
    description: "Two fingers, almost touching. The most famous gap in painting.",
  },
  {
    id: "school-of-athens",
    title: "The School of Athens",
    artist: "Raphael",
    year: "1511",
    culture: "Italian High Renaissance",
    commonsFile: "\"Scuola_di_atene\"_di_Raffaello_Sanzio_da_Urbino.jpg",
    background: "radial-gradient(ellipse at center, #3A2714 0%, #17110a 75%, #06040a 100%)",
    description: "Every philosopher you've ever heard of, under one arch.",
  },

  // ── European: Romanticism, Symbolism & Expressionism ────────────
  {
    id: "the-kiss",
    title: "The Kiss",
    artist: "Gustav Klimt",
    year: "1908",
    culture: "Vienna Secession",
    commonsFile: "The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    background: "radial-gradient(ellipse at center, #5C3E0A 0%, #24190a 70%, #0a0804 100%)",
    description: "Gold leaf, two lovers, everything else dissolved.",
  },
  {
    id: "the-scream",
    title: "The Scream",
    artist: "Edvard Munch",
    year: "1893",
    culture: "Expressionism · Norway",
    commonsFile:
      "Edvard_Munch,_1893,_The_Scream,_oil,_tempera_and_pastel_on_cardboard,_91_x_73_cm,_National_Gallery_of_Norway.jpg",
    background: "radial-gradient(ellipse at top, #5C2A0A 0%, #2a1208 65%, #0a0408 100%)",
    description: "A sky the colour of a nervous system.",
  },
  {
    id: "wanderer",
    title: "Wanderer above the Sea of Fog",
    artist: "Caspar David Friedrich",
    year: "1818",
    culture: "German Romanticism",
    commonsFile: "Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
    background: "radial-gradient(ellipse at top, #5A6E7A 0%, #1f2930 70%, #060a0e 100%)",
    description: "One figure, one view. The entire 19th century in a stance.",
  },
  {
    id: "fighting-temeraire",
    title: "The Fighting Temeraire",
    artist: "J.M.W. Turner",
    year: "1839",
    culture: "Romanticism · Britain",
    commonsFile:
      "Turner,_J._M._W._-_The_Fighting_Téméraire_tugged_to_her_last_berth_to_be_broken_up,_1838.jpg",
    background: "radial-gradient(ellipse at center, #7A4A18 0%, #2f1c0a 70%, #0a0604 100%)",
    description: "A warship towed to its death under a burning sunset.",
  },
  {
    id: "saturn",
    title: "Saturn Devouring His Son",
    artist: "Francisco Goya",
    year: "c. 1820",
    culture: "Spanish Romanticism",
    commonsFile:
      "Francisco_de_Goya,_Saturno_devorando_a_su_hijo_(1819-1823).jpg",
    background: "radial-gradient(ellipse at center, #2E1B0E 0%, #120a06 80%, #05030a 100%)",
    description: "A nightmare painted straight onto Goya's dining room wall.",
  },

  // ── Spanish: Velázquez ───────────────────────────────────────────
  {
    id: "las-meninas",
    title: "Las Meninas",
    artist: "Diego Velázquez",
    year: "1656",
    culture: "Spanish Golden Age",
    commonsFile:
      "Las_Meninas,_by_Diego_Velázquez,_from_Prado_in_Google_Earth.jpg",
    background: "radial-gradient(ellipse at center, #3B2916 0%, #18110a 75%, #06050a 100%)",
    description: "A royal portrait that stares back at you — and the painter is in it.",
  },

  // ── Japan: Ukiyo-e ───────────────────────────────────────────────
  {
    id: "great-wave",
    title: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    year: "c. 1831",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile: "Tsunami_by_hokusai_19th_century.jpg",
    background: "radial-gradient(ellipse at center, #0F4A6E 0%, #0a1f30 70%, #040a12 100%)",
    description: "The most reproduced wave in history. Mt. Fuji waits underneath.",
  },
  {
    id: "red-fuji",
    title: "Fine Wind, Clear Morning (Red Fuji)",
    artist: "Katsushika Hokusai",
    year: "c. 1831",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile: "Red_Fuji_southern_wind_clear_morning.jpg",
    background: "radial-gradient(ellipse at center, #6B2A14 0%, #29140a 70%, #0a0604 100%)",
    description: "Mt. Fuji painted in one calm, unforgiving shade of red.",
  },
  {
    id: "plum-park",
    title: "Plum Park in Kameido",
    artist: "Utagawa Hiroshige",
    year: "1857",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile: "Hiroshige_Plum_Park_Kameido.jpg",
    background: "radial-gradient(ellipse at center, #5A1A2B 0%, #240a12 75%, #0a0306 100%)",
    description: "Plum blossoms framed by a tree so close it becomes the composition.",
  },

  // ── India: Raja Ravi Varma ───────────────────────────────────────
  {
    id: "shakuntala",
    title: "Shakuntala",
    artist: "Raja Ravi Varma",
    year: "c. 1898",
    culture: "British Raj · India",
    commonsFile: "Raja_Ravi_Varma,_Shakuntala_(1898).jpg",
    background: "radial-gradient(ellipse at center, #4A2A18 0%, #1f110a 75%, #06040a 100%)",
    description: "A scene from the Mahabharata, painted in oil for the first time.",
  },

  // ── China: Song dynasty ─────────────────────────────────────────
  {
    id: "along-the-river",
    title: "Along the River During the Qingming Festival",
    artist: "Zhang Zeduan",
    year: "12th c.",
    culture: "Northern Song · China",
    commonsFile:
      "Along_the_River_During_the_Qingming_Festival_(detail_of_original).jpg",
    background: "radial-gradient(ellipse at center, #4E3C18 0%, #1f180a 75%, #06050a 100%)",
    description: "A 5-meter scroll of everyday life in 12th-century Kaifeng.",
  },

  // ── American: Hudson River School ───────────────────────────────
  {
    id: "the-oxbow",
    title: "The Oxbow (View from Mount Holyoke)",
    artist: "Thomas Cole",
    year: "1836",
    culture: "Hudson River School · USA",
    commonsFile:
      "Thomas_Cole_-_View_from_Mount_Holyoke,_Northampton,_Massachusetts,_after_a_Thunderstorm—The_Oxbow_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2E4218 0%, #131c0a 75%, #060a04 100%)",
    description: "Wilderness and cultivation, split down the middle by a single river bend.",
  },

  // ── European: more Dutch / Flemish / Baroque ────────────────────
  {
    id: "hunters-in-the-snow",
    title: "Hunters in the Snow",
    artist: "Pieter Bruegel the Elder",
    year: "1565",
    culture: "Flemish Renaissance",
    commonsFile:
      "Pieter_Bruegel_the_Elder_-_Hunters_in_the_Snow_(Winter)_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #314154 0%, #141c28 70%, #05080e 100%)",
    description: "A village frozen beneath a slate sky — the first great winter painting.",
  },
  {
    id: "milkmaid",
    title: "The Milkmaid",
    artist: "Johannes Vermeer",
    year: "c. 1658",
    culture: "Dutch Golden Age",
    commonsFile:
      "Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3A2A12 0%, #17110a 75%, #05040a 100%)",
    description: "A single poured stream of milk and the patience of an entire century.",
  },
  {
    id: "calling-matthew",
    title: "The Calling of Saint Matthew",
    artist: "Caravaggio",
    year: "c. 1600",
    culture: "Italian Baroque",
    commonsFile:
      "The_Calling_of_Saint_Matthew-Caravaggo_(1599-1600).jpg",
    background: "radial-gradient(ellipse at center, #3B240F 0%, #180f08 75%, #06030a 100%)",
    description: "A finger, a beam of light, a moment of recognition.",
  },

  // ── European: Romanticism & Realism ─────────────────────────────
  {
    id: "liberty-leading",
    title: "Liberty Leading the People",
    artist: "Eugène Delacroix",
    year: "1830",
    culture: "French Romanticism",
    commonsFile:
      "Eugène_Delacroix_-_La_liberté_guidant_le_peuple.jpg",
    background: "radial-gradient(ellipse at center, #5C2A1F 0%, #251208 70%, #0a0408 100%)",
    description: "Revolution personified — a woman, a flag, a stride through smoke.",
  },
  {
    id: "monk-by-sea",
    title: "The Monk by the Sea",
    artist: "Caspar David Friedrich",
    year: "1810",
    culture: "German Romanticism",
    commonsFile:
      "Caspar_David_Friedrich_-_Der_Mönch_am_Meer_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at top, #374A5E 0%, #131d28 70%, #05080e 100%)",
    description: "One figure against an endless sea. Loneliness, but calm about it.",
  },

  // ── Russia: Realism ──────────────────────────────────────────────
  {
    id: "barge-haulers",
    title: "Barge Haulers on the Volga",
    artist: "Ilya Repin",
    year: "1873",
    culture: "Russian Realism",
    commonsFile:
      "Ilya_Repin_-_Barge_Haulers_on_the_Volga_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #5A3A1C 0%, #241808 75%, #0a0504 100%)",
    description: "Eleven men, one rope, a river — painted as a single exhausted breath.",
  },

  // ── Japan: more Ukiyo-e ──────────────────────────────────────────
  {
    id: "ohashi-shower",
    title: "Sudden Shower over Shin-Ōhashi Bridge",
    artist: "Utagawa Hiroshige",
    year: "1857",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile:
      "Hiroshige_Atake_sous_une_averse_soudaine.jpg",
    background: "radial-gradient(ellipse at center, #2B3E52 0%, #111a24 70%, #050810 100%)",
    description: "The print Van Gogh copied. Rain as diagonal brush strokes, pedestrians running.",
  },
  {
    id: "three-beauties",
    title: "Three Beauties of the Present Day",
    artist: "Kitagawa Utamaro",
    year: "c. 1793",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile:
      "Kitagawa_Utamaro_-_Three_Beauties_of_the_Present_Day_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #4A3a28 0%, #1d1610 75%, #06050a 100%)",
    description: "Three faces, almost identical — Utamaro's quiet rebellion against typecasting.",
  },

  // ── Korea: Joseon dynasty ────────────────────────────────────────
  {
    id: "miindo",
    title: "Miindo (Portrait of a Beauty)",
    artist: "Shin Yun-bok",
    year: "c. 1800",
    culture: "Joseon Korea",
    commonsFile:
      "Miindo_by_Sin_Yunbok.jpg",
    background: "radial-gradient(ellipse at center, #3D2819 0%, #19100a 75%, #06040a 100%)",
    description: "A courtesan rendered with the kind of attention usually reserved for kings.",
  },

  // ── China: more classical ────────────────────────────────────────
  {
    id: "thousand-li",
    title: "A Thousand Li of Rivers and Mountains",
    artist: "Wang Ximeng",
    year: "1113",
    culture: "Northern Song · China",
    commonsFile:
      "Wang_Ximeng._A_Thousand_Li_of_Rivers_and_Mountains._(Complete_12m_Scroll).jpg",
    background: "radial-gradient(ellipse at center, #1F4438 0%, #0d1c18 70%, #04090a 100%)",
    description: "A 12-meter scroll of mountains, painted at eighteen, by a boy who died at twenty-three.",
  },

  // ── India: Mughal & Bengal ───────────────────────────────────────
  {
    id: "akbar-tiger",
    title: "Akbar Hunting with Cheetahs",
    artist: "Basawan & Tara",
    year: "c. 1590",
    culture: "Mughal India",
    commonsFile:
      "Akbarnama_-_Akbar's_hunt.jpg",
    background: "radial-gradient(ellipse at center, #5C3A14 0%, #24180a 75%, #0a0604 100%)",
    description: "An Akbarnama folio — the emperor, his horses, and a world of careful detail.",
  },
  {
    id: "bharat-mata",
    title: "Bharat Mata",
    artist: "Abanindranath Tagore",
    year: "1905",
    culture: "Bengal School · India",
    commonsFile:
      "Bharat_Mata_by_Abanindranath_Tagore.jpg",
    background: "radial-gradient(ellipse at center, #5A3A1C 0%, #241a0a 75%, #0a0604 100%)",
    description: "A personification of India as a calm four-armed figure in saffron.",
  },

  // ── Persia: Safavid miniatures ───────────────────────────────────
  {
    id: "shahnameh",
    title: "Court of Gayumars (Shahnameh)",
    artist: "Sultan Muhammad",
    year: "c. 1525",
    culture: "Safavid Persia",
    commonsFile:
      "Court_of_Gayumars._Shahnameh_of_Shah_Tahmasp.jpg",
    background: "radial-gradient(ellipse at center, #3C5A28 0%, #162210 75%, #05080a 100%)",
    description: "Gayumars, the first king, holds court in a paradise of flowering rocks.",
  },

  // ── Ancient Egypt ────────────────────────────────────────────────
  {
    id: "nebamun",
    title: "Nebamun Hunting in the Marshes",
    artist: "Unknown",
    year: "c. 1350 BCE",
    culture: "New Kingdom Egypt",
    commonsFile:
      "Nebamun_hunting_in_the_marshes_(fragment).jpg",
    background: "radial-gradient(ellipse at center, #6B4A18 0%, #2a1c0a 75%, #0a0604 100%)",
    description: "A tomb painting of a hunt in the reeds — cat, birds, family, immortality.",
  },

  // ── Byzantine / Orthodox ─────────────────────────────────────────
  {
    id: "theotokos",
    title: "Virgin of Vladimir",
    artist: "Unknown (Constantinople)",
    year: "c. 1131",
    culture: "Byzantine",
    commonsFile:
      "Vladimirskaya.jpg",
    background: "radial-gradient(ellipse at center, #3C1410 0%, #180808 75%, #06030a 100%)",
    description: "The most copied Orthodox icon in history — tenderness rendered in gold.",
  },

  // ── Ethiopian Orthodox ───────────────────────────────────────────
  {
    id: "ethiopian-triptych",
    title: "Ethiopian Processional Icon",
    artist: "Unknown (Gondar school)",
    year: "17th c.",
    culture: "Ethiopian Orthodox",
    commonsFile:
      "Ethiopian_-_Diptych_Icon_with_Mary_and_Her_Son_Flanked_by_Archangels,_Apostles_and_a_Saint_-_Walters_36.10.jpg",
    background: "radial-gradient(ellipse at center, #4A1F0F 0%, #1c0c06 75%, #08020a 100%)",
    description: "Gondar-school tempera on wood — wide eyes, red borders, quiet faith.",
  },

  // ── Mesoamerica ──────────────────────────────────────────────────
  {
    id: "codex-borbonicus",
    title: "Codex Borbonicus",
    artist: "Aztec tlacuilos",
    year: "c. 1520",
    culture: "Aztec",
    commonsFile:
      "Codex_Borbonicus_(p._13).jpg",
    background: "radial-gradient(ellipse at center, #5C3A14 0%, #24180a 75%, #0a0604 100%)",
    description: "An Aztec divinatory almanac painted on bark paper, just before the world ended.",
  },

  // ── Australia: Aboriginal ────────────────────────────────────────
  {
    id: "bark-painting",
    title: "Mimih Spirits Bark Painting",
    artist: "Anonymous Arnhem Land",
    year: "early 20th c.",
    culture: "Aboriginal Australia",
    commonsFile:
      "Aboriginal_bark_painting,_Arnhem_Land.jpg",
    background: "radial-gradient(ellipse at center, #5C2E14 0%, #24130a 75%, #0a0504 100%)",
    description: "Thin spirit-figures painted in ochre on eucalyptus bark.",
  },

  // ── More Van Gogh ─────────────────────────────────────────────────
  {
    id: "sunflowers",
    title: "Sunflowers",
    artist: "Vincent van Gogh",
    year: "1888",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Vincent_Willem_van_Gogh_127.jpg",
    background: "radial-gradient(ellipse at center, #B8860B 0%, #3d2c0a 70%, #0a0604 100%)",
    description: "Yellow on yellow on yellow — paint as raw light.",
  },
  {
    id: "cafe-terrace",
    title: "Café Terrace at Night",
    artist: "Vincent van Gogh",
    year: "1888",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_(Yorck).jpg",
    background: "radial-gradient(ellipse at top, #D4A017 0%, #1a2955 60%, #050818 100%)",
    description: "A yellow awning against a cobalt sky — Van Gogh without a trace of black.",
  },
  {
    id: "bedroom-arles",
    title: "Bedroom in Arles",
    artist: "Vincent van Gogh",
    year: "1888",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #6B8E4E 0%, #2a3a20 70%, #0a1008 100%)",
    description: "A painter's bedroom painted as therapy against insomnia.",
  },
  {
    id: "wheatfield-crows",
    title: "Wheatfield with Crows",
    artist: "Vincent van Gogh",
    year: "1890",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Vincent_van_Gogh_(1853-1890)_-_Wheat_Field_with_Crows_(1890).jpg",
    background: "radial-gradient(ellipse at top, #1a2a55 0%, #3d2a0a 60%, #0a0604 100%)",
    description: "Three paths, a storm, and a scatter of crows. Days before the end.",
  },
  {
    id: "almond-blossoms",
    title: "Almond Blossoms",
    artist: "Vincent van Gogh",
    year: "1890",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #A8D8E8 0%, #1a3540 70%, #050c14 100%)",
    description: "A gift for a newborn nephew — spring against a sky the colour of hope.",
  },
  {
    id: "vg-self-portrait",
    title: "Self-Portrait with Grey Felt Hat",
    artist: "Vincent van Gogh",
    year: "1887",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3d2a0a 0%, #180f05 75%, #05030a 100%)",
    description: "One of forty self-portraits — Van Gogh as his own most patient sitter.",
  },
  {
    id: "irises",
    title: "Irises",
    artist: "Vincent van Gogh",
    year: "1889",
    culture: "Post-Impressionism · Netherlands",
    commonsFile: "Irises-Vincent_van_Gogh.jpg",
    background: "radial-gradient(ellipse at center, #2a1a6e 0%, #0a0a2a 70%, #050510 100%)",
    description: "Painted the week he entered the asylum at Saint-Rémy.",
  },

  // ── More Monet ────────────────────────────────────────────────────
  {
    id: "impression-sunrise",
    title: "Impression, Sunrise",
    artist: "Claude Monet",
    year: "1872",
    culture: "Impressionism · France",
    commonsFile: "Monet_-_Impression,_Sunrise.jpg",
    background: "radial-gradient(ellipse at center, #D4541A 0%, #1a2a3a 70%, #050810 100%)",
    description: "The painting that named a movement — Le Havre harbour at dawn.",
  },
  {
    id: "japanese-bridge",
    title: "The Water Lily Pond (Japanese Bridge)",
    artist: "Claude Monet",
    year: "1899",
    culture: "Impressionism · France",
    commonsFile: "Claude_Monet_-_The_Water-Lily_Pond_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2a4a2a 0%, #0f1f14 70%, #05100a 100%)",
    description: "The bridge Monet built for himself at Giverny, painted dozens of times.",
  },
  {
    id: "woman-parasol",
    title: "Woman with a Parasol",
    artist: "Claude Monet",
    year: "1875",
    culture: "Impressionism · France",
    commonsFile: "Claude_Monet_-_Woman_with_a_Parasol_-_Madame_Monet_and_Her_Son_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at top, #6A8ECC 0%, #24364a 70%, #050810 100%)",
    description: "Camille and Jean caught mid-breeze, dress fluttering into sky.",
  },
  {
    id: "rouen-cathedral",
    title: "Rouen Cathedral",
    artist: "Claude Monet",
    year: "1894",
    culture: "Impressionism · France",
    commonsFile: "Claude_Monet_-_Rouen_Cathedral,_Facade_(Sunset).jpg",
    background: "radial-gradient(ellipse at center, #C47518 0%, #3a1f0a 70%, #0a0604 100%)",
    description: "Same building, different hour, different light — thirty times over.",
  },

  // ── Renoir ────────────────────────────────────────────────────────
  {
    id: "moulin-galette",
    title: "Dance at Le Moulin de la Galette",
    artist: "Pierre-Auguste Renoir",
    year: "1876",
    culture: "Impressionism · France",
    commonsFile: "Pierre-Auguste_Renoir,_Le_Moulin_de_la_Galette.jpg",
    background: "radial-gradient(ellipse at center, #3A2A18 0%, #17110a 75%, #05040a 100%)",
    description: "Sunlight through leaves, dappling a Sunday afternoon crowd.",
  },
  {
    id: "luncheon-boating",
    title: "Luncheon of the Boating Party",
    artist: "Pierre-Auguste Renoir",
    year: "1881",
    culture: "Impressionism · France",
    commonsFile: "Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #4A3A18 0%, #1d1608 75%, #06050a 100%)",
    description: "Fourteen of Renoir's friends, one terrace, one perfect lunch.",
  },

  // ── Degas ─────────────────────────────────────────────────────────
  {
    id: "ballet-class",
    title: "The Ballet Class",
    artist: "Edgar Degas",
    year: "1874",
    culture: "Impressionism · France",
    commonsFile: "Edgar_Degas_-_The_Ballet_Class_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #5C4518 0%, #241a0a 75%, #0a0604 100%)",
    description: "A rehearsal observed from a corner — Degas made dance feel like labour.",
  },
  {
    id: "absinthe",
    title: "L'Absinthe",
    artist: "Edgar Degas",
    year: "1876",
    culture: "Impressionism · France",
    commonsFile: "Edgar_Degas_-_In_a_Café_-_Google_Art_Project_2.jpg",
    background: "radial-gradient(ellipse at center, #3D2F18 0%, #18130a 75%, #05040a 100%)",
    description: "Two figures at a cafe table. One stare through the glass, one out.",
  },

  // ── Manet ─────────────────────────────────────────────────────────
  {
    id: "olympia",
    title: "Olympia",
    artist: "Édouard Manet",
    year: "1863",
    culture: "Realism · France",
    commonsFile: "Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg",
    background: "radial-gradient(ellipse at center, #3B2516 0%, #170f08 75%, #05040a 100%)",
    description: "A gaze that scandalised the 1865 Salon. It still looks back at you.",
  },
  {
    id: "dejeuner",
    title: "Le Déjeuner sur l'herbe",
    artist: "Édouard Manet",
    year: "1863",
    culture: "Realism · France",
    commonsFile: "Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2E4218 0%, #131c0a 75%, #060a04 100%)",
    description: "A picnic that got one painter banned and one movement started.",
  },
  {
    id: "folies-bergere",
    title: "A Bar at the Folies-Bergère",
    artist: "Édouard Manet",
    year: "1882",
    culture: "Realism · France",
    commonsFile: "Edouard_Manet,_A_Bar_at_the_Folies-Bergère.jpg",
    background: "radial-gradient(ellipse at center, #3A2812 0%, #17110a 75%, #05040a 100%)",
    description: "A barmaid, a mirror, and the strangest reflection in 19th-century painting.",
  },

  // ── Cézanne ───────────────────────────────────────────────────────
  {
    id: "card-players",
    title: "The Card Players",
    artist: "Paul Cézanne",
    year: "1895",
    culture: "Post-Impressionism · France",
    commonsFile: "Paul_Cézanne,_The_Card_Players,_1892-95.jpg",
    background: "radial-gradient(ellipse at center, #3D2A14 0%, #18100a 75%, #05040a 100%)",
    description: "Two men, one table, the weight of everything unsaid between them.",
  },
  {
    id: "mont-sainte-victoire",
    title: "Mont Sainte-Victoire",
    artist: "Paul Cézanne",
    year: "1904",
    culture: "Post-Impressionism · France",
    commonsFile: "Paul_Cézanne_-_Mont_Sainte-Victoire_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #4A5E2A 0%, #1f2810 75%, #080a05 100%)",
    description: "One mountain, eighty paintings, the scaffolding of modern art.",
  },

  // ── David, Ingres, Delacroix ──────────────────────────────────────
  {
    id: "napoleon-alps",
    title: "Napoleon Crossing the Alps",
    artist: "Jacques-Louis David",
    year: "1801",
    culture: "Neoclassicism · France",
    commonsFile: "Jacques-Louis_David_-_Bonaparte_franchissant_le_Grand_Saint-Bernard,_20_mai_1800_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #8C2A14 0%, #2e100a 70%, #0a0404 100%)",
    description: "A red cloak, a white horse, a myth in progress.",
  },
  {
    id: "death-of-marat",
    title: "The Death of Marat",
    artist: "Jacques-Louis David",
    year: "1793",
    culture: "Neoclassicism · France",
    commonsFile: "Death_of_Marat_by_David.jpg",
    background: "radial-gradient(ellipse at center, #2A1810 0%, #10080a 75%, #05020a 100%)",
    description: "A revolutionary dead in his bath — the secular Pietà of the French Revolution.",
  },
  {
    id: "grande-odalisque",
    title: "Grande Odalisque",
    artist: "Jean-Auguste-Dominique Ingres",
    year: "1814",
    culture: "Neoclassicism · France",
    commonsFile: "Jean_Auguste_Dominique_Ingres,_La_Grande_Odalisque,_1814.jpg",
    background: "radial-gradient(ellipse at center, #3A2014 0%, #18100a 75%, #05040a 100%)",
    description: "An impossibly long back and the birth of a 200-year argument.",
  },
  {
    id: "raft-medusa",
    title: "The Raft of the Medusa",
    artist: "Théodore Géricault",
    year: "1819",
    culture: "French Romanticism",
    commonsFile: "JEAN_LOUIS_THÉODORE_GÉRICAULT_-_La_Balsa_de_la_Medusa_(Museo_del_Louvre,_1818-19).jpg",
    background: "radial-gradient(ellipse at top, #3A2418 0%, #170e0a 70%, #05030a 100%)",
    description: "Survivors at the edge of rescue — a news painting that became history.",
  },

  // ── Courbet, Millet ───────────────────────────────────────────────
  {
    id: "stone-breakers",
    title: "The Stone Breakers",
    artist: "Gustave Courbet",
    year: "1849",
    culture: "Realism · France",
    commonsFile: "Gustave_Courbet_-_The_Stonebreakers_-_WGA05457.jpg",
    background: "radial-gradient(ellipse at center, #3D2E16 0%, #18140a 75%, #05040a 100%)",
    description: "Two labourers, no heroism, no allegory — just the work itself.",
  },
  {
    id: "gleaners",
    title: "The Gleaners",
    artist: "Jean-François Millet",
    year: "1857",
    culture: "Realism · France",
    commonsFile: "Jean-François_Millet_(II)_-_Gleaners_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #5A4018 0%, #241808 75%, #0a0604 100%)",
    description: "Three women collecting what the harvest left — poverty painted with grace.",
  },

  // ── Vermeer (more) ────────────────────────────────────────────────
  {
    id: "view-of-delft",
    title: "View of Delft",
    artist: "Johannes Vermeer",
    year: "c. 1661",
    culture: "Dutch Golden Age",
    commonsFile: "Vermeer-view-of-delft.jpg",
    background: "radial-gradient(ellipse at center, #3A4A5A 0%, #151c24 70%, #050810 100%)",
    description: "The city portrait Proust called the most beautiful painting in the world.",
  },
  {
    id: "woman-balance",
    title: "Woman Holding a Balance",
    artist: "Johannes Vermeer",
    year: "c. 1664",
    culture: "Dutch Golden Age",
    commonsFile: "Johannes_Vermeer_-_Woman_Holding_a_Balance_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2B1B0F 0%, #120a05 75%, #05020a 100%)",
    description: "A quiet moment of judgement, weighed against an empty scale.",
  },
  {
    id: "little-street",
    title: "The Little Street",
    artist: "Johannes Vermeer",
    year: "c. 1658",
    culture: "Dutch Golden Age",
    commonsFile: "Johannes_Vermeer_-_Gezicht_op_huizen_in_Delft,_bekend_als_'Het_straatje'_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3A2818 0%, #17100a 75%, #05040a 100%)",
    description: "An ordinary brick wall that Vermeer made into architecture for memory.",
  },

  // ── Rembrandt (more) ──────────────────────────────────────────────
  {
    id: "anatomy-lesson",
    title: "The Anatomy Lesson of Dr. Tulp",
    artist: "Rembrandt van Rijn",
    year: "1632",
    culture: "Dutch Golden Age",
    commonsFile: "Rembrandt_-_The_Anatomy_Lesson_of_Dr_Nicolaes_Tulp.jpg",
    background: "radial-gradient(ellipse at center, #3A2512 0%, #17100a 70%, #05040a 100%)",
    description: "Seven faces around a corpse — science, group portrait, advertisement.",
  },
  {
    id: "storm-galilee",
    title: "The Storm on the Sea of Galilee",
    artist: "Rembrandt van Rijn",
    year: "1633",
    culture: "Dutch Golden Age",
    commonsFile: "Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg",
    background: "radial-gradient(ellipse at top, #3D2A14 0%, #18110a 70%, #05040a 100%)",
    description: "A boat in chaos, a miracle asleep. Stolen in 1990 and never found.",
  },

  // ── Goya (more) ───────────────────────────────────────────────────
  {
    id: "third-of-may",
    title: "The Third of May 1808",
    artist: "Francisco Goya",
    year: "1814",
    culture: "Spanish Romanticism",
    commonsFile: "El_Tres_de_Mayo,_by_Francisco_de_Goya,_from_Prado_thin_black_margin.jpg",
    background: "radial-gradient(ellipse at center, #3D1A0A 0%, #180806 75%, #05020a 100%)",
    description: "A lantern, a firing squad, a raised pair of hands — modern war begins here.",
  },
  {
    id: "maja-desnuda",
    title: "La Maja Desnuda",
    artist: "Francisco Goya",
    year: "c. 1800",
    culture: "Spanish Romanticism",
    commonsFile: "La_maja_desnuda_(Prado).jpg",
    background: "radial-gradient(ellipse at center, #3A2816 0%, #18100a 75%, #05040a 100%)",
    description: "A reclining nude that got Goya interrogated by the Inquisition.",
  },

  // ── El Greco ──────────────────────────────────────────────────────
  {
    id: "view-toledo",
    title: "View of Toledo",
    artist: "El Greco",
    year: "c. 1600",
    culture: "Spanish Mannerism",
    commonsFile: "El_Greco_View_of_Toledo.jpg",
    background: "radial-gradient(ellipse at top, #2A3E4A 0%, #111820 70%, #050810 100%)",
    description: "A city under a storm sky that looks like the end of the world.",
  },

  // ── American: Whistler, Homer, Sargent ────────────────────────────
  {
    id: "whistlers-mother",
    title: "Whistler's Mother",
    artist: "James McNeill Whistler",
    year: "1871",
    culture: "Tonalism · USA",
    commonsFile: "Whistlers_Mother_high_res.jpg",
    background: "radial-gradient(ellipse at center, #2A2A2E 0%, #121215 75%, #050508 100%)",
    description: "Officially 'Arrangement in Grey and Black No. 1' — America's icon of restraint.",
  },
  {
    id: "gulf-stream",
    title: "The Gulf Stream",
    artist: "Winslow Homer",
    year: "1899",
    culture: "Realism · USA",
    commonsFile: "Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg",
    background: "radial-gradient(ellipse at center, #1A4A5A 0%, #0a1e24 70%, #040a10 100%)",
    description: "A man alone on a broken boat, sharks circling, a ship on the horizon.",
  },
  {
    id: "madame-x",
    title: "Madame X",
    artist: "John Singer Sargent",
    year: "1884",
    culture: "Belle Époque · USA/France",
    commonsFile: "Madame_X_(Madame_Pierre_Gautreau),_John_Singer_Sargent,_1884_(unfree_frame_crop).jpg",
    background: "radial-gradient(ellipse at center, #1f1410 0%, #0c0606 80%, #05020a 100%)",
    description: "A black dress, a pale profile, one scandal too many for Paris.",
  },
  {
    id: "heart-andes",
    title: "The Heart of the Andes",
    artist: "Frederic Edwin Church",
    year: "1859",
    culture: "Hudson River School · USA",
    commonsFile: "Frederic_Edwin_Church_-_The_Heart_of_the_Andes_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2E4218 0%, #131c0a 75%, #060a04 100%)",
    description: "South America as Eden — Church worked from Humboldt's travel notes.",
  },

  // ── Pre-Raphaelite & Symbolism ────────────────────────────────────
  {
    id: "ophelia",
    title: "Ophelia",
    artist: "John Everett Millais",
    year: "1851",
    culture: "Pre-Raphaelite · Britain",
    commonsFile: "John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2A3A1F 0%, #0f170a 70%, #050a04 100%)",
    description: "Shakespeare's drowning, painted in a cold English river over four months.",
  },
  {
    id: "lady-shalott",
    title: "The Lady of Shalott",
    artist: "John William Waterhouse",
    year: "1888",
    culture: "Pre-Raphaelite · Britain",
    commonsFile: "John_William_Waterhouse_-_The_Lady_of_Shalott_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2E3A28 0%, #121810 75%, #050a05 100%)",
    description: "Tennyson's cursed weaver floats toward Camelot in a boat full of candles.",
  },

  // ── Caravaggio (more) ─────────────────────────────────────────────
  {
    id: "judith",
    title: "Judith Beheading Holofernes",
    artist: "Caravaggio",
    year: "c. 1599",
    culture: "Italian Baroque",
    commonsFile: "Caravaggio_Judith_Beheading_Holofernes.jpg",
    background: "radial-gradient(ellipse at center, #3B1810 0%, #170806 75%, #06020a 100%)",
    description: "A biblical assassination painted with the indifference of a butcher.",
  },
  {
    id: "bacchus",
    title: "Bacchus",
    artist: "Caravaggio",
    year: "c. 1596",
    culture: "Italian Baroque",
    commonsFile: "Bacchus_by_Caravaggio.jpg",
    background: "radial-gradient(ellipse at center, #3D2814 0%, #18100a 75%, #05040a 100%)",
    description: "A god with dirty fingernails offering wine to the viewer directly.",
  },

  // ── Titian ────────────────────────────────────────────────────────
  {
    id: "venus-urbino",
    title: "Venus of Urbino",
    artist: "Titian",
    year: "1538",
    culture: "Venetian Renaissance",
    commonsFile: "Tiziano_-_Venere_di_Urbino_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3B2616 0%, #180f0a 75%, #05040a 100%)",
    description: "A reclining nude that defined the pose for the next five centuries.",
  },
  {
    id: "bacchus-ariadne",
    title: "Bacchus and Ariadne",
    artist: "Titian",
    year: "1523",
    culture: "Venetian Renaissance",
    commonsFile: "Titian_-_Bacchus_and_Ariadne_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at top, #2A4A6E 0%, #0f1d2e 70%, #050810 100%)",
    description: "A god leaping from a chariot, a girl mid-flinch, a whole myth in one frame.",
  },

  // ── Leonardo (more) ───────────────────────────────────────────────
  {
    id: "last-supper",
    title: "The Last Supper",
    artist: "Leonardo da Vinci",
    year: "c. 1498",
    culture: "Italian Renaissance",
    commonsFile: "Última_Cena_-_Da_Vinci_5.jpg",
    background: "radial-gradient(ellipse at center, #3A2A14 0%, #17100a 75%, #05040a 100%)",
    description: "Twelve reactions to one sentence: 'one of you will betray me.'",
  },
  {
    id: "lady-ermine",
    title: "Lady with an Ermine",
    artist: "Leonardo da Vinci",
    year: "c. 1490",
    culture: "Italian Renaissance",
    commonsFile: "The_Lady_with_an_Ermine.jpg",
    background: "radial-gradient(ellipse at center, #1a0e0a 0%, #0a0505 80%, #05020a 100%)",
    description: "Cecilia Gallerani and a white stoat — a portrait coded with hidden symbols.",
  },

  // ── Kandinsky, Klimt (more) ───────────────────────────────────────
  {
    id: "composition-vii",
    title: "Composition VII",
    artist: "Wassily Kandinsky",
    year: "1913",
    culture: "Expressionism · Russia",
    commonsFile: "Vassily_Kandinsky,_1913_-_Composition_7.jpg",
    background: "radial-gradient(ellipse at center, #3A2A4E 0%, #17111f 75%, #050510 100%)",
    description: "Abstraction as symphony — Kandinsky claimed it was the most complex thing he ever made.",
  },
  {
    id: "adele-bloch-bauer",
    title: "Portrait of Adele Bloch-Bauer I",
    artist: "Gustav Klimt",
    year: "1907",
    culture: "Vienna Secession",
    commonsFile: "Gustav_Klimt_046.jpg",
    background: "radial-gradient(ellipse at center, #5C3E0A 0%, #24190a 70%, #0a0804 100%)",
    description: "A wife of a Viennese magnate, painted in so much gold leaf it looks like armour.",
  },
  {
    id: "tree-of-life",
    title: "The Tree of Life",
    artist: "Gustav Klimt",
    year: "1909",
    culture: "Vienna Secession",
    commonsFile: "Gustav_Klimt_-_Tree_of_Life,_Stoclet_Frieze_-_WGA12742.jpg",
    background: "radial-gradient(ellipse at center, #5C4318 0%, #241a08 75%, #0a0604 100%)",
    description: "Spiral branches in gold — designed as a mosaic for a Brussels mansion.",
  },

  // ── Bruegel (more) ────────────────────────────────────────────────
  {
    id: "icarus",
    title: "Landscape with the Fall of Icarus",
    artist: "Pieter Bruegel the Elder (attr.)",
    year: "c. 1560",
    culture: "Flemish Renaissance",
    commonsFile: "Pieter_Bruegel_de_Oude_-_De_val_van_Icarus.jpg",
    background: "radial-gradient(ellipse at center, #2A3E4A 0%, #111820 70%, #050810 100%)",
    description: "A plowman works, a ship sails, and in the corner — two small legs vanish.",
  },
  {
    id: "netherlandish-proverbs",
    title: "Netherlandish Proverbs",
    artist: "Pieter Bruegel the Elder",
    year: "1559",
    culture: "Flemish Renaissance",
    commonsFile: "Pieter_Bruegel_the_Elder_-_The_Dutch_Proverbs_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #4A3418 0%, #241a0c 75%, #0a0805 100%)",
    description: "Over a hundred proverbs enacted in one chaotic village square.",
  },

  // ── Hokusai / Hiroshige (more Edo) ────────────────────────────────
  {
    id: "kajikazawa",
    title: "Kajikazawa in Kai Province",
    artist: "Katsushika Hokusai",
    year: "c. 1831",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile: "Hokusai_-_Kajikazawa_in_Kai_Province.jpg",
    background: "radial-gradient(ellipse at center, #1F3A4A 0%, #0c1720 70%, #040810 100%)",
    description: "A fisherman on a rock, Mt. Fuji ghosting through the mist behind him.",
  },
  {
    id: "evening-snow",
    title: "Evening Snow at Kambara",
    artist: "Utagawa Hiroshige",
    year: "1833",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile: "Hiroshige_-_Kambara.jpg",
    background: "radial-gradient(ellipse at center, #2A2F3E 0%, #10141c 75%, #050710 100%)",
    description: "Three figures trudging through new snow — the stillest print in the Tokaido series.",
  },
  {
    id: "moon-pine",
    title: "Moon Pine, Ueno",
    artist: "Utagawa Hiroshige",
    year: "1857",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile: "100_views_edo_089.jpg",
    background: "radial-gradient(ellipse at center, #2E4018 0%, #121a0a 75%, #060a04 100%)",
    description: "A pine bent into a moon-shaped loop — the monastery used it as a viewpoint.",
  },

  // ── Turner (more) ─────────────────────────────────────────────────
  {
    id: "rain-steam",
    title: "Rain, Steam and Speed",
    artist: "J.M.W. Turner",
    year: "1844",
    culture: "Romanticism · Britain",
    commonsFile: "Rain_Steam_and_Speed_the_Great_Western_Railway.jpg",
    background: "radial-gradient(ellipse at center, #5A3A1A 0%, #241808 75%, #0a0504 100%)",
    description: "A train bursting through rain on the new Great Western Railway — modern life blurring.",
  },
  {
    id: "slave-ship",
    title: "The Slave Ship",
    artist: "J.M.W. Turner",
    year: "1840",
    culture: "Romanticism · Britain",
    commonsFile: "Slave-ship.jpg",
    background: "radial-gradient(ellipse at center, #7A2A0A 0%, #2a0e04 70%, #0a0404 100%)",
    description: "A burning sky over a ship that threw its chained human cargo into the sea.",
  },

  // ── Friedrich, Delacroix (more) ───────────────────────────────────
  {
    id: "sea-of-ice",
    title: "The Sea of Ice",
    artist: "Caspar David Friedrich",
    year: "1823",
    culture: "German Romanticism",
    commonsFile: "Caspar_David_Friedrich_-_Das_Eismeer_-_Hamburger_Kunsthalle_-_02.jpg",
    background: "radial-gradient(ellipse at top, #3A4A5A 0%, #151c24 70%, #050810 100%)",
    description: "Shards of ice crushing a shipwreck — the dream of polar exploration as nightmare.",
  },
  {
    id: "abbey-oakwood",
    title: "The Abbey in the Oakwood",
    artist: "Caspar David Friedrich",
    year: "1810",
    culture: "German Romanticism",
    commonsFile: "Caspar_David_Friedrich_-_Abtei_im_Eichwald_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at top, #2A2A2E 0%, #10101a 75%, #050510 100%)",
    description: "A funeral procession toward a ruined gothic arch at dusk.",
  },

  // ── Hiroshige Great Wave variations & other ─────────────────────
  {
    id: "whirlpools-naruto",
    title: "The Whirlpools at Naruto",
    artist: "Utagawa Hiroshige",
    year: "1855",
    culture: "Edo Japan · Ukiyo-e",
    commonsFile: "Hiroshige_Views_of_famous_places_in_the_sixty-odd_provinces_-_Awa,_Naruto_Whirlpool.jpg",
    background: "radial-gradient(ellipse at center, #0F4A6E 0%, #0a1f30 70%, #040a12 100%)",
    description: "The Seto Inland Sea churning into spiral geometry.",
  },

  // ── Cassatt, Morisot (Impressionist women) ───────────────────────
  {
    id: "the-bath",
    title: "The Child's Bath",
    artist: "Mary Cassatt",
    year: "1893",
    culture: "Impressionism · USA",
    commonsFile: "Cassatt_Mary_The_Child's_Bath_1893.jpg",
    background: "radial-gradient(ellipse at center, #3A4A28 0%, #151f10 75%, #060a04 100%)",
    description: "A mother and child painted as architecture — two bodies folding into one diagonal.",
  },
  {
    id: "cradle",
    title: "The Cradle",
    artist: "Berthe Morisot",
    year: "1872",
    culture: "Impressionism · France",
    commonsFile: "Berthe_Morisot_001.jpg",
    background: "radial-gradient(ellipse at center, #2A2A38 0%, #11111a 75%, #05050a 100%)",
    description: "Morisot's sister watching a sleeping child — the first Impressionist group show's quietest work.",
  },

  // ── More Italian Renaissance ─────────────────────────────────────
  {
    id: "primavera",
    title: "Primavera",
    artist: "Sandro Botticelli",
    year: "c. 1482",
    culture: "Italian Renaissance",
    commonsFile: "Botticelli-primavera.jpg",
    background: "radial-gradient(ellipse at center, #2A3E1F 0%, #101808 75%, #040a05 100%)",
    description: "Venus, Mercury, three Graces, and a whole lot of hidden mythology in one grove.",
  },

  // ── Chinese classical (more) ──────────────────────────────────────
  {
    id: "travelers-mountain",
    title: "Travelers among Mountains and Streams",
    artist: "Fan Kuan",
    year: "c. 1000",
    culture: "Northern Song · China",
    commonsFile: "Fan_Kuan_-_Travelers_Among_Mountains_and_Streams_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2A2418 0%, #110f0a 75%, #05040a 100%)",
    description: "A thousand-year-old monumental landscape — a waterfall, a mule train, no people at center.",
  },
  {
    id: "early-spring",
    title: "Early Spring",
    artist: "Guo Xi",
    year: "1072",
    culture: "Northern Song · China",
    commonsFile: "Guo_Xi_-_Early_Spring_(large).jpg",
    background: "radial-gradient(ellipse at center, #3A2E18 0%, #17130a 75%, #05040a 100%)",
    description: "Rock formations drawn like neurons — Song dynasty landscape at its most cerebral.",
  },

  // ── Korean & Japanese classical (more) ──────────────────────────
  {
    id: "pine-trees",
    title: "Pine Trees Screen",
    artist: "Hasegawa Tōhaku",
    year: "c. 1595",
    culture: "Azuchi-Momoyama Japan",
    commonsFile: "Hasegawa_Tōhaku_-_Pine_Trees_(Shōrin-zu_byōbu)_-_right_hand_screen.jpg",
    background: "radial-gradient(ellipse at center, #1A1A1F 0%, #0a0a12 85%, #050510 100%)",
    description: "Pines dissolving into mist on blank paper — almost nothing, everything implied.",
  },

  // ── Indian miniature & Mughal (more) ─────────────────────────────
  {
    id: "krishna-radha",
    title: "Krishna and Radha in a Bower",
    artist: "Kangra School",
    year: "c. 1780",
    culture: "Kangra · India",
    commonsFile: "Krishna_and_Radha_in_a_Bower.jpg",
    background: "radial-gradient(ellipse at center, #4A2E18 0%, #1e120a 75%, #080504 100%)",
    description: "Kangra-school miniature — flowering branches, monsoon clouds, love as weather.",
  },

  // ── Orthodox / Byzantine (more) ──────────────────────────────────
  {
    id: "rublev-trinity",
    title: "The Trinity",
    artist: "Andrei Rublev",
    year: "c. 1425",
    culture: "Russian Orthodox",
    commonsFile: "Angelsatmamre-trinity-rublev-1410.jpg",
    background: "radial-gradient(ellipse at center, #5A3A0F 0%, #24190a 75%, #0a0604 100%)",
    description: "Three angels at Abraham's table — the most famous Russian icon in existence.",
  },

  // ── African modern / precolonial ─────────────────────────────────
  {
    id: "benin-plaque",
    title: "Benin Bronze Plaque (Court Scene)",
    artist: "Edo artists",
    year: "16th c.",
    culture: "Benin Kingdom",
    commonsFile: "Benin_brass_plaque_in_the_British_Museum.jpg",
    background: "radial-gradient(ellipse at center, #3A2A10 0%, #17110a 75%, #05040a 100%)",
    description: "A bronze relief from the Benin palace — looted in 1897, scattered worldwide since.",
  },

  // ── More Europe: Whistler, Chardin, Watteau ──────────────────────
  {
    id: "nocturne-black-gold",
    title: "Nocturne in Black and Gold",
    artist: "James McNeill Whistler",
    year: "1875",
    culture: "Tonalism · USA",
    commonsFile: "Whistler-Nocturne_in_black_and_gold.jpg",
    background: "radial-gradient(ellipse at center, #1A1A22 0%, #0a0a12 80%, #05050a 100%)",
    description: "The painting Ruskin sued over — a firework dissolving into darkness.",
  },
  {
    id: "pilgrimage-cythera",
    title: "Pilgrimage to Cythera",
    artist: "Antoine Watteau",
    year: "1717",
    culture: "Rococo · France",
    commonsFile: "L'Embarquement_pour_Cythere,_by_Antoine_Watteau,_from_C2RMF_retouched.jpg",
    background: "radial-gradient(ellipse at center, #3A2E1A 0%, #17130a 75%, #05040a 100%)",
    description: "Couples leaving (or arriving at?) the island of love — Watteau's most famous ambiguity.",
  },
  {
    id: "ray-chardin",
    title: "The Ray",
    artist: "Jean-Baptiste-Siméon Chardin",
    year: "1728",
    culture: "Rococo · France",
    commonsFile: "Jean_Siméon_Chardin_-_La_Raie_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3D2A14 0%, #18100a 75%, #05040a 100%)",
    description: "A gutted ray hanging in a kitchen — still life as silent horror.",
  },

  // ── Persian / Ottoman / Mughal (more) ────────────────────────────
  {
    id: "miraj-nameh",
    title: "Miraj Nameh Folio",
    artist: "Herat School",
    year: "c. 1436",
    culture: "Timurid Persia",
    commonsFile: "Miraj_by_Sultan_Muhammad.jpg",
    background: "radial-gradient(ellipse at center, #1F3A4A 0%, #0c1720 70%, #040810 100%)",
    description: "The Prophet's night journey painted in lapis and gold — Timurid book art at its peak.",
  },

  // ── More Symbolism / Art Nouveau ──────────────────────────────────
  {
    id: "isle-of-dead",
    title: "Isle of the Dead",
    artist: "Arnold Böcklin",
    year: "1880",
    culture: "Symbolism · Switzerland",
    commonsFile: "Arnold_Böcklin_-_Die_Toteninsel_III_(Alte_Nationalgalerie,_Berlin).jpg",
    background: "radial-gradient(ellipse at top, #1F2A2E 0%, #0c1115 75%, #05080a 100%)",
    description: "A white-robed figure rowed toward an island of cypress and stone. Painted five times.",
  },
  {
    id: "judith-klimt",
    title: "Judith and the Head of Holofernes",
    artist: "Gustav Klimt",
    year: "1901",
    culture: "Vienna Secession",
    commonsFile: "Gustav_Klimt_039.jpg",
    background: "radial-gradient(ellipse at center, #5C3E0A 0%, #24190a 70%, #0a0804 100%)",
    description: "Half-closed eyes, gold leaf, a severed head just visible at the frame.",
  },
  {
    id: "dance-of-life",
    title: "The Dance of Life",
    artist: "Edvard Munch",
    year: "1900",
    culture: "Expressionism · Norway",
    commonsFile: "Edvard_Munch_-_The_Dance_of_Life_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2E2A3E 0%, #11101c 75%, #05050a 100%)",
    description: "A woman in white, a woman in red, a woman in black — one life in three acts.",
  },

  // ── Baroque / Flemish (more) ──────────────────────────────────────
  {
    id: "rubens-descent",
    title: "The Descent from the Cross",
    artist: "Peter Paul Rubens",
    year: "1614",
    culture: "Flemish Baroque",
    commonsFile: "Peter_Paul_Rubens_-_Descent_from_the_Cross_(detail)_-_WGA20210.jpg",
    background: "radial-gradient(ellipse at center, #3A1A10 0%, #170a08 75%, #05020a 100%)",
    description: "A diagonal of bodies handing down Christ — muscular Baroque grief.",
  },
  {
    id: "garden-earthly-delights",
    title: "The Garden of Earthly Delights",
    artist: "Hieronymus Bosch",
    year: "c. 1500",
    culture: "Early Netherlandish",
    commonsFile: "The_Garden_of_earthly_delights.jpg",
    background: "radial-gradient(ellipse at center, #3A2E1A 0%, #17130a 75%, #05040a 100%)",
    description: "Eden, pleasure, hell — a triptych cataloguing every sin Bosch could imagine.",
  },
  {
    id: "ambassadors",
    title: "The Ambassadors",
    artist: "Hans Holbein the Younger",
    year: "1533",
    culture: "Northern Renaissance",
    commonsFile: "Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #2E2A18 0%, #11100a 75%, #05040a 100%)",
    description: "Two men, science instruments, and a smeared skull only readable from the side.",
  },

  // ── Postwar-pre-1926 Modernism ────────────────────────────────────
  {
    id: "black-square",
    title: "Black Square",
    artist: "Kazimir Malevich",
    year: "1915",
    culture: "Suprematism · Russia",
    commonsFile: "Kazimir_Malevich,_1915,_Black_Suprematic_Square,_oil_on_linen_canvas,_79.5_x_79.5_cm,_Tretyakov_Gallery,_Moscow.jpg",
    background: "radial-gradient(ellipse at center, #1A1A1A 0%, #0a0a0a 80%, #050505 100%)",
    description: "The degree-zero of painting — a black square on white, and the end of representation.",
  },

  // ── More Japanese / Chinese / Korean ──────────────────────────────
  {
    id: "tale-of-genji",
    title: "Tale of Genji Scroll (Yomogiu)",
    artist: "Unknown",
    year: "c. 1130",
    culture: "Heian Japan",
    commonsFile: "Genji_emaki_YOMOGIU.jpg",
    background: "radial-gradient(ellipse at center, #3A2A1A 0%, #17110a 75%, #05040a 100%)",
    description: "A scene from the world's first novel, painted less than 200 years after Murasaki wrote it.",
  },
  {
    id: "hermit-pine",
    title: "Hermit Under a Pine",
    artist: "Ma Yuan",
    year: "c. 1200",
    culture: "Southern Song · China",
    commonsFile: "Ma_Yuan_-_Scholar_Reclining_and_Watching_Rising_Clouds.jpg",
    background: "radial-gradient(ellipse at center, #1F2418 0%, #0c100a 75%, #050805 100%)",
    description: "Song-dynasty 'one-corner' composition — three-quarters of the silk left empty on purpose.",
  },
  {
    id: "fishermen",
    title: "Fishermen on the River",
    artist: "Xu Daoning",
    year: "c. 1049",
    culture: "Northern Song · China",
    commonsFile: "Xu_Daoning_-_Fisherman's_Evening_Song.jpg",
    background: "radial-gradient(ellipse at center, #2E2E18 0%, #10100a 75%, #050505 100%)",
    description: "Mountains rising out of river mist — a handscroll meant to be unrolled slowly, alone.",
  },

  // ── More American / Frontier ─────────────────────────────────────
  {
    id: "american-gothic",
    title: "American Gothic",
    artist: "Grant Wood",
    year: "1930",
    culture: "Regionalism · USA",
    commonsFile: "Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3A2E18 0%, #17130a 75%, #05040a 100%)",
    description: "A farmer, his daughter, a pitchfork — the most parodied painting in America.",
  },
  {
    id: "niagara",
    title: "Niagara",
    artist: "Frederic Edwin Church",
    year: "1857",
    culture: "Hudson River School · USA",
    commonsFile: "Frederic_Edwin_Church_-_Niagara_-_WGA04852.jpg",
    background: "radial-gradient(ellipse at center, #2A3E4A 0%, #111820 70%, #050810 100%)",
    description: "The falls painted from the Canadian side — a piece of God's own punctuation.",
  },
  {
    id: "snap-whip",
    title: "Snap the Whip",
    artist: "Winslow Homer",
    year: "1872",
    culture: "Realism · USA",
    commonsFile: "Snap_the_Whip_1872_Winslow_Homer.jpeg",
    background: "radial-gradient(ellipse at center, #2E4218 0%, #131c0a 75%, #060a04 100%)",
    description: "Barefoot schoolboys playing on a hillside — post-Civil-War America exhaling.",
  },

  // ── More French ──────────────────────────────────────────────────
  {
    id: "oath-horatii",
    title: "Oath of the Horatii",
    artist: "Jacques-Louis David",
    year: "1784",
    culture: "Neoclassicism · France",
    commonsFile: "Jacques-Louis_David_-_Le_Serment_des_Horaces.jpg",
    background: "radial-gradient(ellipse at center, #3D2A14 0%, #18100a 75%, #05040a 100%)",
    description: "Three brothers swearing to die for Rome, while three women grieve in advance.",
  },
  {
    id: "coronation",
    title: "The Coronation of Napoleon",
    artist: "Jacques-Louis David",
    year: "1807",
    culture: "Neoclassicism · France",
    commonsFile: "Jacques-Louis_David,_The_Coronation_of_Napoleon_edit.jpg",
    background: "radial-gradient(ellipse at center, #5C2A14 0%, #24100a 75%, #0a0404 100%)",
    description: "The emperor crowning his wife while the Pope sits behind him, uninvolved.",
  },
  {
    id: "burial-ornans",
    title: "A Burial at Ornans",
    artist: "Gustave Courbet",
    year: "1850",
    culture: "Realism · France",
    commonsFile: "Gustave_Courbet_-_A_Burial_at_Ornans_-_Google_Art_Project_2.jpg",
    background: "radial-gradient(ellipse at center, #2A2014 0%, #10100a 75%, #05040a 100%)",
    description: "A village funeral painted on a canvas historically reserved for kings.",
  },

  // ── More British ─────────────────────────────────────────────────
  {
    id: "hay-wain",
    title: "The Hay Wain",
    artist: "John Constable",
    year: "1821",
    culture: "Romanticism · Britain",
    commonsFile: "John_Constable_-_The_Hay_Wain_(1821).jpg",
    background: "radial-gradient(ellipse at center, #2E4218 0%, #131c0a 75%, #060a04 100%)",
    description: "A cart in a stream, a cottage, a tree — the archetype of English countryside.",
  },
  {
    id: "derby-day",
    title: "The Derby Day",
    artist: "William Powell Frith",
    year: "1858",
    culture: "Victorian · Britain",
    commonsFile: "William_Powell_Frith_-_The_Derby_Day_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3A2814 0%, #17100a 75%, #05040a 100%)",
    description: "Every class of Victorian society squeezed into one horse-race crowd.",
  },

  // ── Rococo ───────────────────────────────────────────────────────
  {
    id: "the-swing",
    title: "The Swing",
    artist: "Jean-Honoré Fragonard",
    year: "1767",
    culture: "Rococo · France",
    commonsFile: "Fragonard,_The_Swing.jpg",
    background: "radial-gradient(ellipse at center, #2E4018 0%, #121a0a 75%, #060a04 100%)",
    description: "A flirtation painted in the most indulgent pinks and greens the 18th century allowed.",
  },
  {
    id: "progress-harlot",
    title: "A Harlot's Progress (plate 1)",
    artist: "William Hogarth",
    year: "1732",
    culture: "Georgian · Britain",
    commonsFile: "William_Hogarth_-_A_Harlot's_Progress,_plate_1.png",
    background: "radial-gradient(ellipse at center, #2E2418 0%, #121008 75%, #05040a 100%)",
    description: "The first comic strip in European painting — a satire in six printed plates.",
  },

  // ── More Vermeer / Dutch genre ───────────────────────────────────
  {
    id: "astronomer",
    title: "The Astronomer",
    artist: "Johannes Vermeer",
    year: "c. 1668",
    culture: "Dutch Golden Age",
    commonsFile: "Johannes_Vermeer_-_The_Astronomer_-_Google_Art_Project.jpg",
    background: "radial-gradient(ellipse at center, #3A2810 0%, #17100a 75%, #05040a 100%)",
    description: "A scholar reaching for a celestial globe — Vermeer imagining science.",
  },
  {
    id: "jewish-bride",
    title: "The Jewish Bride",
    artist: "Rembrandt van Rijn",
    year: "c. 1667",
    culture: "Dutch Golden Age",
    commonsFile: "Rembrandt_Harmensz._van_Rijn_-_Portret_van_een_paar_als_oudtestamentische_figuren,_genaamd_'Het_Joodse_bruidje'.jpg",
    background: "radial-gradient(ellipse at center, #5A2E14 0%, #241008 75%, #0a0404 100%)",
    description: "Rembrandt's late masterpiece — a touch on a chest, gold turned into paint.",
  },

  // ── African / Caribbean / Oceanic ────────────────────────────────
  {
    id: "tahitian-women",
    title: "Tahitian Women on the Beach",
    artist: "Paul Gauguin",
    year: "1891",
    culture: "Post-Impressionism · France",
    commonsFile: "Gauguin_Tahitian_women_on_the_beach.jpg",
    background: "radial-gradient(ellipse at center, #4A3418 0%, #1d140a 75%, #08050a 100%)",
    description: "Two women, bright sand, the start of Gauguin's long self-mythologising.",
  },
  {
    id: "yellow-christ",
    title: "The Yellow Christ",
    artist: "Paul Gauguin",
    year: "1889",
    culture: "Post-Impressionism · France",
    commonsFile: "Paul_Gauguin_138.jpg",
    background: "radial-gradient(ellipse at center, #8C7A1A 0%, #2a2408 75%, #0a0804 100%)",
    description: "A yellow crucifix in a Breton field — sacred and childlike at once.",
  },
];

/**
 * Every painting gets the same tile grid so the reveal feels consistent
 * across the gallery. 10×6 = 60 tiles means one arc day ≈ 6% of a painting,
 * which is a rewarding-but-not-trivial pace.
 */
const DEFAULT_COLS = 10;
const DEFAULT_ROWS = 6;

export const ARTWORKS: Record<string, Artwork> = Object.fromEntries(
  raw.map((r) => [r.id, { ...r, cols: DEFAULT_COLS, rows: DEFAULT_ROWS }]),
);

export const ARTWORK_ORDER: string[] = raw.map((r) => r.id);

/**
 * Total tiles across the gallery. Used to compute % unlocked.
 * Accepts an optional catalog so progress UI can pass a merged
 * (seed + runtime-fetched) catalog without needing a separate helper.
 */
export function totalTiles(catalog?: Artwork[]): number {
  const list = catalog ?? Object.values(ARTWORKS);
  return list.reduce((acc, a) => acc + a.cols * a.rows, 0);
}

/**
 * Gallery lap info. Once the user exceeds `totalTiles()`, they've completed
 * a full pass through every painting in the catalogue — a "lap". The gallery
 * cycles: lap 2 starts from 0 again on the same catalogue, but we track laps
 * so any UI can show "you've finished the gallery N times."
 */
export function galleryLap(
  unlocked: number,
  catalog?: Artwork[],
): {
  laps: number;
  withinLap: number;
  perLap: number;
} {
  const perLap = totalTiles(catalog);
  if (perLap === 0) return { laps: 0, withinLap: 0, perLap: 0 };
  return {
    laps: Math.floor(unlocked / perLap),
    withinLap: unlocked % perLap,
    perLap,
  };
}

/**
 * Given how many tiles the user has unlocked overall, return a per-artwork
 * breakdown of how many tiles each currently shows. Uses the current lap's
 * progress (`unlocked % totalTiles()`) so that after a full lap the gallery
 * resets and paintings start filling again — giving the user a fresh sweep
 * instead of a permanently-capped display.
 *
 * Accepts an optional catalog (defaults to the seed `ARTWORKS`). When the
 * progress page has a merged catalog of seed + runtime-fetched paintings,
 * it passes that so distribution flows across every painting the user has.
 */
export function distributeTiles(unlocked: number, catalog?: Artwork[]) {
  const list = catalog ?? ARTWORK_ORDER.map((id) => ARTWORKS[id]);
  const total = totalTiles(list);
  const { withinLap, laps } = galleryLap(unlocked, list);
  const out: Record<string, number> = {};
  // If we're mid-lap, distribute withinLap normally. If we're exactly at the
  // end of a lap and have completed at least one, show all paintings full
  // (the user has earned the completion view before the next lap empties it).
  let remaining = laps > 0 && withinLap === 0 ? total : withinLap;
  for (const art of list) {
    const cap = art.cols * art.rows;
    const take = Math.min(cap, Math.max(0, remaining));
    out[art.id] = take;
    remaining -= take;
  }
  return out;
}

/**
 * Given total unlocked tiles, which artwork should be the "current" one
 * (i.e. the one actively being revealed right now)?
 */
export function currentArtworkId(unlocked: number): string {
  let remaining = unlocked;
  for (const id of ARTWORK_ORDER) {
    const cap = ARTWORKS[id].cols * ARTWORKS[id].rows;
    if (remaining < cap) return id;
    remaining -= cap;
  }
  return ARTWORK_ORDER[ARTWORK_ORDER.length - 1];
}

/**
 * Deterministic 1:1 problem → artwork assignment.
 *
 * With 42 paintings and 131 problems, each painting is reused ~3× across
 * the curriculum. The mapping is by curriculum index (PROBLEMS order) mod
 * gallery size — not by hash — so adjacent problems within the same pattern
 * always land on different paintings. A hash-based scheme collided ~5% of
 * the time and the user hit one of those days.
 *
 * Solve-time reveal is LOCAL per problem — solving problem A never affects
 * problem B's tile state, even when they share a source image. The gallery
 * shows one tile-state per problem, not per image.
 */
import { PROBLEMS } from "./problems";
import { SQL_PROBLEMS } from "./sql";

const PROBLEM_INDEX: Map<string, number> = new Map(
  PROBLEMS.map((p, i) => [p.id, i]),
);
const SQL_PROBLEM_INDEX: Map<string, number> = new Map(
  SQL_PROBLEMS.map((p, i) => [p.id, i]),
);

/**
 * Map a problem (DSA or SQL) to the canonical painting it reveals. DSA
 * problems hash into one slice of the artwork pool; SQL problems hash into
 * an offset slice so the two tracks don't stamp the same artwork on the
 * same day. Accepts either a raw problem id or a `sql:${id}` shared-gallery
 * key — the SQL pages use the prefixed form when reading from the store.
 */
export function artworkForProblem(problemId: string): Artwork {
  if (problemId.startsWith("sql:")) {
    const rawId = problemId.slice(4);
    const sqlIdx = SQL_PROBLEM_INDEX.get(rawId) ?? 0;
    // Offset by PROBLEMS.length so SQL problems don't collide with DSA
    // assignments for the same ordinal position.
    const idx =
      (sqlIdx + PROBLEMS.length) % ARTWORK_ORDER.length;
    return ARTWORKS[ARTWORK_ORDER[idx]];
  }
  const idx = (PROBLEM_INDEX.get(problemId) ?? 0) % ARTWORK_ORDER.length;
  return ARTWORKS[ARTWORK_ORDER[idx]];
}

/** Tile capacity for any painting (all paintings share the same grid). */
export const TILES_PER_PROBLEM = DEFAULT_COLS * DEFAULT_ROWS;
