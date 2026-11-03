export type OrbitQuadrantClan = 'ayah_user' | 'ibu_user' | 'ayah_pasangan' | 'ibu_pasangan';

export type OrbitQuadrant = OrbitQuadrantClan | 'poros';

export type OrbitGeneration = -3 | -2 | -1 | 0 | 1 | 2 | 3;
// -3: Uyut / Buyut
// -2: Kakek / Nenek
// -1: Orang Tua
//  0: User & Pasangan (Poros Pusat)
//  1: Anak
//  2: Cucu
//  3: Cicit

export type ConnectorStyle = 'linear' | 'divergent' | 'hybrid';

export type VisualTheme = 'cosmic' | 'neural' | 'atom' | 'roots';

export interface OrbitNode {
  id: string;
  name: string;
  nickname?: string;
  binBinti?: string;
  gender: 'L' | 'P';
  generation: OrbitGeneration;
  quadrant: OrbitQuadrant;
  parentId?: string;
  spouseId?: string;
  birthYear?: string;
  deathYear?: string;
  status: 'Hidup' | 'Almarhum';
  origin?: string;
  notes?: string;
  photo?: string;
  connectorStyle?: ConnectorStyle;
  // Dynamic computed coordinates on canvas
  x?: number;
  y?: number;
  angle?: number; // In degrees 0 - 360
  radius?: number; // Distance from center
  sectorStart?: number;
  sectorEnd?: number;
}

export interface DualBridgePoros {
  user: {
    id: string;
    name: string;
    nickname?: string;
    gender: 'L';
    birthYear?: string;
    photo?: string;
    trahTitle: string; // e.g. "Trah Ayah & Ibu (Kuningan/Bogor)"
  };
  spouse: {
    id: string;
    name: string;
    nickname?: string;
    gender: 'P';
    birthYear?: string;
    photo?: string;
    trahTitle: string; // e.g. "Trah Pasangan (Dramaga/Cirebon)"
  };
  marriageYear?: string;
  notes?: string;
}

export interface OrbitQuDataset {
  poros: DualBridgePoros;
  nodes: OrbitNode[];
  lastUpdated: string;
  version: string;
}

export interface QuadrantConfig {
  id: OrbitQuadrant;
  label: string;
  subLabel: string;
  clanName: string;
  colorHex: string;
  glowHex: string;
  angleRange: [number, number]; // [minAngle, maxAngle] in degrees
  bgGradient: string;
}

export const QUADRANT_CONFIGS: Record<OrbitQuadrantClan, QuadrantConfig> = {
  ayah_user: {
    id: 'ayah_user',
    label: 'Kuadran I: Trah Ayah',
    subLabel: 'Paternal Ego',
    clanName: 'Bani Ayah (Kuningan)',
    colorHex: '#38bdf8', // Sky Blue
    glowHex: '#0284c7',
    angleRange: [270, 360], // Top Right (Quadrant 1)
    bgGradient: 'from-sky-950/40 to-blue-900/10'
  },
  ibu_user: {
    id: 'ibu_user',
    label: 'Kuadran II: Trah Ibu',
    subLabel: 'Maternal Ego',
    clanName: 'Bani Ibu (Bogor)',
    colorHex: '#34d399', // Emerald Mint
    glowHex: '#059669',
    angleRange: [180, 270], // Top Left (Quadrant 2)
    bgGradient: 'from-emerald-950/40 to-teal-900/10'
  },
  ayah_pasangan: {
    id: 'ayah_pasangan',
    label: 'Kuadran III: Trah Ayah Pasangan',
    subLabel: 'Paternal Besan / Mertua',
    clanName: 'Bani Mertua Laki-laki',
    colorHex: '#fbbf24', // Amber Gold
    glowHex: '#d97706',
    angleRange: [90, 180], // Bottom Left (Quadrant 3)
    bgGradient: 'from-amber-950/40 to-yellow-900/10'
  },
  ibu_pasangan: {
    id: 'ibu_pasangan',
    label: 'Kuadran IV: Trah Ibu Pasangan',
    subLabel: 'Maternal Besan / Mertua',
    clanName: 'Bani Mertua Perempuan',
    colorHex: '#c084fc', // Purple Fuchsia
    glowHex: '#9333ea',
    angleRange: [0, 90], // Bottom Right (Quadrant 4)
    bgGradient: 'from-purple-950/40 to-indigo-900/10'
  }
};

export const GENERATION_LABELS: Record<OrbitGeneration, { title: string; orbitName: string; ringIndex: number; radius: number }> = {
  [-3]: { title: 'Uyut / Buyut', orbitName: 'Orbit VI (Uyut)', ringIndex: 6, radius: 460 },
  [-2]: { title: 'Kakek / Nenek', orbitName: 'Orbit V (Kakek/Nenek)', ringIndex: 5, radius: 380 },
  [-1]: { title: 'Orang Tua', orbitName: 'Orbit IV (Orang Tua)', ringIndex: 4, radius: 300 },
  [0]: { title: 'Poros (User & Pasangan)', orbitName: 'Inti Pusat Tata Surya', ringIndex: 0, radius: 0 },
  [1]: { title: 'Anak', orbitName: 'Orbit I (Anak)', ringIndex: 1, radius: 155 },
  [2]: { title: 'Cucu', orbitName: 'Orbit II (Cucu)', ringIndex: 2, radius: 230 },
  [3]: { title: 'Cicit', orbitName: 'Orbit III (Cicit)', ringIndex: 3, radius: 310 }
};

export const THEME_CONFIGS: Record<VisualTheme, {
  name: string;
  badge: string;
  iconName: string;
  desc: string;
  darkCanvasBg: string;
  lightCanvasBg: string;
  starColor: string;
  ringStrokeDark: string;
  ringStrokeLight: string;
  connectorColor: string;
}> = {
  cosmic: {
    name: 'Tata Surya Cosmic',
    badge: 'Cosmic Constellation',
    iconName: 'Sun',
    desc: 'Orbit melingkar kosmik dengan partikel bintang dan pendaran benda langit.',
    darkCanvasBg: 'radial-gradient(circle at center, #0f172a 0%, #030712 70%, #000000 100%)',
    lightCanvasBg: 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 70%, #cbd5e1 100%)',
    starColor: '#ffffff',
    ringStrokeDark: 'rgba(56, 189, 248, 0.18)',
    ringStrokeLight: 'rgba(2, 132, 199, 0.22)',
    connectorColor: '#38bdf8'
  },
  neural: {
    name: 'Urat Syaraf / Neural',
    badge: 'Neural Synapse Glow',
    iconName: 'Network',
    desc: 'Pendaran cahaya node organik dan jalur sinapsis elektro-biologis.',
    darkCanvasBg: 'radial-gradient(circle at center, #022c22 0%, #021a14 60%, #010d0a 100%)',
    lightCanvasBg: 'radial-gradient(circle at center, #ecfdf5 0%, #d1fae5 70%, #a7f3d0 100%)',
    starColor: '#34d399',
    ringStrokeDark: 'rgba(52, 211, 153, 0.22)',
    ringStrokeLight: 'rgba(5, 150, 105, 0.25)',
    connectorColor: '#10b981'
  },
  atom: {
    name: 'Struktur Atom / Molekul',
    badge: 'Quantum Orbital',
    iconName: 'Atom',
    desc: 'Orbit elektron presisi ilmiah dengan kisi mekanika kuantum.',
    darkCanvasBg: 'radial-gradient(circle at center, #1e1b4b 0%, #0c0a1f 60%, #030209 100%)',
    lightCanvasBg: 'radial-gradient(circle at center, #faf5ff 0%, #f3e8ff 70%, #e9d5ff 100%)',
    starColor: '#c084fc',
    ringStrokeDark: 'rgba(192, 132, 252, 0.22)',
    ringStrokeLight: 'rgba(147, 51, 234, 0.25)',
    connectorColor: '#a855f7'
  },
  roots: {
    name: 'Akar Organik / Digital Roots',
    badge: 'Golden Tree of Life',
    iconName: 'Trees',
    desc: 'Jalur serat kayu futuristik yang bertumbuh merambat dari poros benih.',
    darkCanvasBg: 'radial-gradient(circle at center, #291807 0%, #150c04 60%, #070301 100%)',
    lightCanvasBg: 'radial-gradient(circle at center, #fefce8 0%, #fef08a 70%, #fde047 100%)',
    starColor: '#fbbf24',
    ringStrokeDark: 'rgba(251, 191, 36, 0.22)',
    ringStrokeLight: 'rgba(217, 119, 6, 0.25)',
    connectorColor: '#f59e0b'
  }
};
