import { getToppingVisualProfile } from '../../data/customPizzaData';

function seedHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Fine powder/grated cheese dust particles */
export function getCheeseDust(cheeseId, count = 36) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const h = seedHash(`${cheeseId}-dust-${i}`);
    const angle = ((h * 137) % 360) * (Math.PI / 180);
    const radius = 6 + ((h >> 3) % 34);
    items.push({
      id: `dust-${i}`,
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius * 0.92,
      size: 1.5 + (h % 3),
      opacity: 0.35 + (h % 40) / 100,
      delay: (i % 10) * 0.02,
    });
  }
  return items;
}

/** Shredded cheese strands scattered on the pizza */
export function getCheeseShreds(cheeseId, count = 58) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const h = seedHash(`${cheeseId}-shred-${i}`);
    const angle = ((h * 53 + i * 17) % 180) - 90;
    const theta = ((seedHash(cheeseId) + h * 97) % 360) * (Math.PI / 180);
    const radius = 5 + ((h >> 4) % 33);
    const isCurl = h % 9 === 0;
    items.push({
      id: `shred-${i}`,
      left: 50 + Math.cos(theta) * radius,
      top: 50 + Math.sin(theta) * radius * 0.94,
      angle,
      length: isCurl ? 7 + (h % 6) : 9 + (h % 11),
      thickness: isCurl ? 2.5 + (h % 2) : 1.8 + (h % 2.5),
      opacity: 0.72 + (h % 28) / 100,
      delay: (i % 14) * 0.022,
      variant: isCurl ? 'curl' : h % 5 === 0 ? 'chunk' : 'strand',
    });
  }
  return items;
}

/** Melted stringy cheese drips (SVG paths) */
export function getCheeseStrings(cheeseId, count = 7) {
  const strings = [];
  for (let i = 0; i < count; i++) {
    const h = seedHash(`${cheeseId}-string-${i}`);
    const sx = 28 + (h % 144);
    const sy = 32 + ((h >> 4) % 120);
    const cx1 = sx + ((h >> 2) % 40) - 20;
    const cy1 = sy + 18 + (h % 22);
    const cx2 = sx + ((h >> 5) % 50) - 25;
    const cy2 = sy + 35 + (h % 18);
    const ex = sx + ((h >> 6) % 30) - 15;
    const ey = sy + 48 + (h % 14);
    strings.push({
      id: `str-${i}`,
      d: `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`,
      width: 2.2 + (h % 3) * 0.6,
      opacity: 0.45 + (h % 35) / 100,
      delay: i * 0.06,
    });
  }
  return strings;
}

/** Melt pools — soft blobs where cheese melted into sauce */
export function getCheesePools(cheeseId, count = 5) {
  const pools = [];
  for (let i = 0; i < count; i++) {
    const h = seedHash(`${cheeseId}-pool-${i}`);
    const angle = ((h * 73) % 360) * (Math.PI / 180);
    const radius = 10 + ((h >> 3) % 22);
    pools.push({
      id: `pool-${i}`,
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius,
      w: 18 + (h % 16),
      h: 14 + (h % 12),
      opacity: 0.28 + (h % 20) / 100,
    });
  }
  return pools;
}

/** Sauce texture specks (herbs, tomato pulp) */
export function getSauceSpecks(sauceId, count = 22) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const h = seedHash(`${sauceId}-speck-${i}`);
    const angle = ((h * 113) % 360) * (Math.PI / 180);
    const radius = 4 + ((h >> 2) % 36);
    items.push({
      id: `speck-${i}`,
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius * 0.9,
      size: 1.2 + (h % 4),
      opacity: 0.25 + (h % 45) / 100,
      tone: h % 3,
    });
  }
  return items;
}

/** Dough air bubbles on the crust surface */
export function getDoughBubbles(shapeSeed, count = 14) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const h = seedHash(`${shapeSeed}-bubble-${i}`);
    const angle = ((h * 89) % 360) * (Math.PI / 180);
    const radius = 58 + (h % 28);
    items.push({
      id: `b-${i}`,
      cx: 100 + Math.cos(angle) * radius * 0.85,
      cy: 100 + Math.sin(angle) * radius * 0.85,
      r: 1.2 + (h % 3.5),
      opacity: 0.08 + (h % 12) / 100,
    });
  }
  return items;
}

export function getToppingPieceMeta(toppingId, idx) {
  const h = seedHash(`${toppingId}-meta-${idx}`);
  const profile = getToppingVisualProfile(toppingId);
  const scaleSteps = Math.max(1, Math.round(profile.scaleRange * 100));
  return {
    scale: profile.scaleMin + (h % scaleSteps) / 100,
    rotate: (h % 70) - 35,
    tiltX: ((h >> 3) % 14) - 7,
    delay: idx * 0.045,
    sink: 1 + (h % 3),
  };
}
