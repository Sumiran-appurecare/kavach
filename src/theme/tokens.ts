/**
 * Design tokens for Nyaya Kavach.
 *
 * The palette is taken from the reference design: navy header, white cards on a
 * cool off-white ground, pastel feature tiles, and one red.
 *
 * Colour jobs — a user learns the code in one session:
 *   navy    identity and the header
 *   accent  anything tappable that is not a tile (links, active tab)
 *   brass   deadlines, and only deadlines
 *   siren   the emergency path, and NOTHING else (FR-EMG-01)
 *   leaf    safe / healthy / done
 *
 * `siren` is reserved. If a second feature borrows it, it stops meaning
 * "emergency" to someone whose hands are shaking, which is the one moment
 * this app exists for.
 */

export type Palette = {
  paper: string;
  card: string;
  card2: string;

  /** Header gradient, dark → darker, plus the ink used on top of it. */
  forest: string;
  forest2: string;
  forest3: string;
  onForest: string;
  onForestDim: string;
  onForestLine: string;
  onForestFill: string;
  /** The one bright tint on the navy — used for the user's name. */
  onForestAccent: string;
  /** The one deep-blue block in the body: the Safety Center scanner. */
  scanner: string;

  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  line2: string;

  accent: string;
  accentBg: string;

  siren: string;
  sirenDeep: string;
  onSiren: string;
  sirenBg: string;

  brass: string;
  brassBg: string;

  leaf: string;
  leafBg: string;

  /** Unfilled part of a progress track. */
  trackFill: string;

  /** Tile tints, in the order the home grid uses them. */
  tileBlue: string;
  tileBlueBg: string;
  tileViolet: string;
  tileVioletBg: string;
  tileTeal: string;
  tileTealBg: string;
  tilePurple: string;
  tilePurpleBg: string;

  shadow: string;
};

export const light: Palette = {
  paper: '#F1F6FA',
  card: '#FFFFFF',
  card2: '#F6F9FC',

  forest: '#2F66A6',
  forest2: '#3A78BC',
  forest3: '#1E4A80',
  scanner: '#1B4374',
  onForest: '#FFFFFF',
  onForestDim: '#A8C3DE',
  onForestLine: 'rgba(255,255,255,0.22)',
  onForestFill: 'rgba(0,0,0,0.22)',
  onForestAccent: '#6FB7F0',

  ink: '#0F2A4A',
  ink2: '#43617E',
  ink3: '#7C93AB',
  line: '#E2EAF2',
  line2: '#EEF3F8',

  accent: '#1D4ED8',
  accentBg: '#E6F0FC',

  siren: '#E23744',
  sirenDeep: '#C61F2C',
  onSiren: '#FFFFFF',
  sirenBg: '#FDECEE',

  brass: '#B45309',
  brassBg: '#FEF3E2',

  leaf: '#16A34A',
  leafBg: '#E8F6EE',

  trackFill: '#DCE6F0',

  tileBlue: '#2563EB',
  tileBlueBg: '#E6F0FC',
  tileViolet: '#7C3AED',
  tileVioletBg: '#EFEAFB',
  tileTeal: '#0E9BAC',
  tileTealBg: '#E4F4F6',
  tilePurple: '#8B5CF6',
  tilePurpleBg: '#F2EBFC',

  shadow: '#0F2A4A',
};

export const dark: Palette = {
  paper: '#060D18',
  card: '#0E1B2D',
  card2: '#132338',

  forest: '#1E4A80',
  forest2: '#2A5F9E',
  forest3: '#163659',
  scanner: '#122F51',
  onForest: '#FFFFFF',
  onForestDim: '#8FAAC6',
  onForestLine: 'rgba(255,255,255,0.18)',
  onForestFill: 'rgba(0,0,0,0.30)',
  onForestAccent: '#6FB7F0',

  ink: '#E7EEF6',
  ink2: '#A6BBD0',
  ink3: '#7891AC',
  line: '#20344C',
  line2: '#1A2C42',

  accent: '#6C9BF5',
  accentBg: '#15294A',

  siren: '#F04C5A',
  sirenDeep: '#C61F2C',
  onSiren: '#FFFFFF',
  sirenBg: '#301621',

  brass: '#E0A44F',
  brassBg: '#2E2314',

  leaf: '#4ADE80',
  leafBg: '#122D20',

  trackFill: '#20344C',

  tileBlue: '#3B82F6',
  tileBlueBg: '#14294A',
  tileViolet: '#A78BFA',
  tileVioletBg: '#231F42',
  tileTeal: '#2DD4BF',
  tileTealBg: '#11302F',
  tilePurple: '#C084FC',
  tilePurpleBg: '#271E3F',

  shadow: '#000000',
};

/**
 * Two faces, each with a job. Hind carries Devanagari and Latin, so a Hindi
 * string never falls back mid-sentence — which matters because Hindi is P0,
 * not a translation layer. IBM Plex Mono holds anything that is a reference:
 * acknowledgement numbers, countdowns, case ids, hashes.
 */
export const font = {
  /** Headings. Hind Bold rather than a second display face, so the design
   *  canvas and the app render identically. */
  display: 'Hind_700Bold',
  regular: 'Hind_400Regular',
  medium: 'Hind_500Medium',
  semibold: 'Hind_600SemiBold',
  bold: 'Hind_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemibold: 'IBMPlexMono_600SemiBold',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 30,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 15,
  xl: 20,
  pill: 999,
} as const;

/** Cross-platform card lift. Android needs elevation, iOS needs the shadow. */
export function cardShadow(color: string) {
  return {
    shadowColor: color,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  };
}
