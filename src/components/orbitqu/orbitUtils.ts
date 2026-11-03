import {
  OrbitNode,
  OrbitQuadrant,
  OrbitQuadrantClan,
  OrbitGeneration,
  DualBridgePoros,
  OrbitQuDataset,
  QUADRANT_CONFIGS,
  GENERATION_LABELS
} from './orbitTypes';

export const ORBITQU_STORAGE_KEY = 'wargaqu_orbitqu_data_v1';

export const DEFAULT_POROS: DualBridgePoros = {
  user: {
    id: 'user_ego',
    name: 'Hendriana',
    nickname: 'Bageur',
    gender: 'L',
    birthYear: '1985',
    trahTitle: 'Trah Ayah (Kuningan) & Ibu (Bogor)'
  },
  spouse: {
    id: 'spouse_ego',
    name: 'Siti Nurhaliza',
    nickname: 'Neng Siti',
    gender: 'P',
    birthYear: '1988',
    trahTitle: 'Trah Pasangan (Dramaga)'
  },
  marriageYear: '2011',
  notes: 'Poros Pusat Silsilah Dua Keluarga'
};

/**
 * Sub-Sectoring Angle & Orbit Radius Calculator (Zero Cross-Lines Algorithm)
 * Menghitung koordinat Cartesius (x, y) dari koordinat polar (r, theta)
 * dengan jaminan pembagian sudut bertingkat sehingga garis konektor tidak bersilangan.
 */
export function calculateOrbitLayout(
  nodes: OrbitNode[],
  poros: DualBridgePoros,
  center: { x: number; y: number } = { x: 600, y: 600 }
): OrbitNode[] {
  const result: OrbitNode[] = [];

  // Group nodes by quadrant
  const quadrants: OrbitQuadrantClan[] = ['ayah_user', 'ibu_user', 'ayah_pasangan', 'ibu_pasangan'];

  quadrants.forEach(quadId => {
    const quadConfig = QUADRANT_CONFIGS[quadId];
    const [minAngle, maxAngle] = quadConfig.angleRange;
    const quadNodes = nodes.filter(n => n.quadrant === quadId);

    if (quadNodes.length === 0) return;

    // We partition the quadrant into hierarchy:
    // Ancestor branches (generation -1, -2, -3) and descendant branches (1, 2, 3)
    const ancestors = quadNodes.filter(n => n.generation < 0);
    const descendants = quadNodes.filter(n => n.generation > 0);

    // Layout Ancestors: Gen -1 (Orang Tua), Gen -2 (Kakek/Nenek), Gen -3 (Uyut)
    // Sub-sectoring: divide quadrant angle span among top parents
    const genNeg1 = ancestors.filter(n => n.generation === -1);
    const angleSpan = maxAngle - minAngle;
    const paddingAngle = 8; // deg margin from borders
    const effectiveSpan = angleSpan - paddingAngle * 2;

    if (genNeg1.length > 0) {
      const sliceSize = effectiveSpan / genNeg1.length;
      genNeg1.forEach((parent, pIdx) => {
        const pStart = minAngle + paddingAngle + pIdx * sliceSize;
        const pEnd = pStart + sliceSize;
        const pAngle = (pStart + pEnd) / 2;
        const pRadius = GENERATION_LABELS[-1].radius;

        // Position Gen -1
        const rad = (pAngle * Math.PI) / 180;
        const px = center.x + pRadius * Math.cos(rad);
        const py = center.y + pRadius * Math.sin(rad);

        result.push({
          ...parent,
          x: px,
          y: py,
          angle: pAngle,
          radius: pRadius,
          sectorStart: pStart,
          sectorEnd: pEnd
        });

        // Position its parents (Gen -2: Kakek/Nenek) within this parent's sub-sector!
        const genNeg2 = ancestors.filter(n => n.generation === -2 && (n.parentId === parent.id || !n.parentId));
        if (genNeg2.length > 0) {
          const sliceG2 = (pEnd - pStart) / genNeg2.length;
          genNeg2.forEach((kakek, kIdx) => {
            const kStart = pStart + kIdx * sliceG2;
            const kEnd = kStart + sliceG2;
            const kAngle = (kStart + kEnd) / 2;
            const kRadius = GENERATION_LABELS[-2].radius;
            const kRad = (kAngle * Math.PI) / 180;

            result.push({
              ...kakek,
              x: center.x + kRadius * Math.cos(kRad),
              y: center.y + kRadius * Math.sin(kRad),
              angle: kAngle,
              radius: kRadius,
              sectorStart: kStart,
              sectorEnd: kEnd
            });

            // Position its parents (Gen -3: Uyut) within Kakek's sub-sector!
            const genNeg3 = ancestors.filter(n => n.generation === -3 && (n.parentId === kakek.id || !n.parentId));
            if (genNeg3.length > 0) {
              const sliceG3 = (kEnd - kStart) / genNeg3.length;
              genNeg3.forEach((uyut, uIdx) => {
                const uStart = kStart + uIdx * sliceG3;
                const uEnd = uStart + sliceG3;
                const uAngle = (uStart + uEnd) / 2;
                const uRadius = GENERATION_LABELS[-3].radius;
                const uRad = (uAngle * Math.PI) / 180;

                result.push({
                  ...uyut,
                  x: center.x + uRadius * Math.cos(uRad),
                  y: center.y + uRadius * Math.sin(uRad),
                  angle: uAngle,
                  radius: uRadius,
                  sectorStart: uStart,
                  sectorEnd: uEnd
                });
              });
            }
          });
        }
      });
    } else {
      // If no Gen -1, layout any remaining Gen -2 or -3 evenly
      ancestors.forEach((anc, aIdx) => {
        const step = effectiveSpan / Math.max(1, ancestors.length);
        const aAngle = minAngle + paddingAngle + aIdx * step + step / 2;
        const rad = (aAngle * Math.PI) / 180;
        const r = GENERATION_LABELS[anc.generation]?.radius || 300;
        result.push({
          ...anc,
          x: center.x + r * Math.cos(rad),
          y: center.y + r * Math.sin(rad),
          angle: aAngle,
          radius: r
        });
      });
    }

    // Layout Descendants: Gen 1 (Anak), Gen 2 (Cucu), Gen 3 (Cicit)
    const gen1 = descendants.filter(n => n.generation === 1);
    if (gen1.length > 0) {
      const sliceD1 = effectiveSpan / gen1.length;
      gen1.forEach((child, cIdx) => {
        const cStart = minAngle + paddingAngle + cIdx * sliceD1;
        const cEnd = cStart + sliceD1;
        const cAngle = (cStart + cEnd) / 2;
        const cRadius = GENERATION_LABELS[1].radius;
        const cRad = (cAngle * Math.PI) / 180;

        result.push({
          ...child,
          x: center.x + cRadius * Math.cos(cRad),
          y: center.y + cRadius * Math.sin(cRad),
          angle: cAngle,
          radius: cRadius,
          sectorStart: cStart,
          sectorEnd: cEnd
        });

        // Gen 2: Cucu under this child
        const gen2 = descendants.filter(n => n.generation === 2 && n.parentId === child.id);
        if (gen2.length > 0) {
          const sliceD2 = (cEnd - cStart) / gen2.length;
          gen2.forEach((cucu, cuIdx) => {
            const cuStart = cStart + cuIdx * sliceD2;
            const cuEnd = cuStart + sliceD2;
            const cuAngle = (cuStart + cuEnd) / 2;
            const cuRadius = GENERATION_LABELS[2].radius;
            const cuRad = (cuAngle * Math.PI) / 180;

            result.push({
              ...cucu,
              x: center.x + cuRadius * Math.cos(cuRad),
              y: center.y + cuRadius * Math.sin(cuRad),
              angle: cuAngle,
              radius: cuRadius,
              sectorStart: cuStart,
              sectorEnd: cuEnd
            });

            // Gen 3: Cicit under this cucu
            const gen3 = descendants.filter(n => n.generation === 3 && n.parentId === cucu.id);
            if (gen3.length > 0) {
              const sliceD3 = (cuEnd - cuStart) / gen3.length;
              gen3.forEach((cicit, ciIdx) => {
                const ciAngle = cuStart + ciIdx * sliceD3 + sliceD3 / 2;
                const ciRadius = GENERATION_LABELS[3].radius;
                const ciRad = (ciAngle * Math.PI) / 180;

                result.push({
                  ...cicit,
                  x: center.x + ciRadius * Math.cos(ciRad),
                  y: center.y + ciRadius * Math.sin(ciRad),
                  angle: ciAngle,
                  radius: ciRadius
                });
              });
            }
          });
        }
      });
    } else {
      descendants.forEach((desc, dIdx) => {
        const step = effectiveSpan / Math.max(1, descendants.length);
        const dAngle = minAngle + paddingAngle + dIdx * step + step / 2;
        const rad = (dAngle * Math.PI) / 180;
        const r = GENERATION_LABELS[desc.generation]?.radius || 155;
        result.push({
          ...desc,
          x: center.x + r * Math.cos(rad),
          y: center.y + r * Math.sin(rad),
          angle: dAngle,
          radius: r
        });
      });
    }
  });

  return result;
}

/**
 * Storage Load & Save
 */
export function loadOrbitQuData(): OrbitQuDataset {
  try {
    const raw = localStorage.getItem(ORBITQU_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.poros && Array.isArray(parsed.nodes)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading OrbitQu data:', e);
  }

  // Return clean dataset
  return {
    poros: DEFAULT_POROS,
    nodes: [],
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  };
}

export function saveOrbitQuData(data: OrbitQuDataset): void {
  try {
    localStorage.setItem(ORBITQU_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving OrbitQu data:', e);
  }
}

/**
 * Generate Curvilinear Path for Connectors
 */
export function generateConnectorPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  style: 'linear' | 'divergent' | 'hybrid' = 'divergent',
  centerX: number = 600,
  centerY: number = 600
): string {
  if (style === 'linear') {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  // Divergent / curved planetary arc
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Gentle curve toward center of orbit
  const bendFactor = 0.25;
  const ctrlX = midX + (centerX - midX) * bendFactor;
  const ctrlY = midY + (centerY - midY) * bendFactor;

  return `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
}
