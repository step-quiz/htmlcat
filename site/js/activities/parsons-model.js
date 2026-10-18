// ════════════════════════════════════════════════════════
// activities/parsons-model.js — La lògica dels problemes de Parsons
// (mòdul pur)
//
// Un problema de Parsons dona les línies d'un codi barrejades i sense
// indentar: l'alumne les ha de posar en ordre i indentar-les. La solució
// és el codi mateix, indentat amb 2 espais per nivell (l'estil del curs).
//
// API pública:
//   parseSolution(text)        → [{ text, level }] (sense línies en blanc)
//   shuffledOrder(lines, seed) → índexs en un ordre barrejat repetible
//                                (sempre el mateix per a la mateixa llavor,
//                                i mai l'ordre bo si hi ha més d'una línia diferent)
//   checkLines(state, solution) → { wrong: [boolean], orderOk, solved }
//   INDENT, MAX_LEVEL
// ════════════════════════════════════════════════════════

export const INDENT = 2;
export const MAX_LEVEL = 8;

/**
 * @param {string} text
 * @returns {Array<{ text: string, level: number }>}
 */
export function parseSolution(text) {
  return text.replace(/\r\n?/g, '\n').split('\n')
    .filter((line) => line.trim())
    .map((line) => ({
      text: line.trim(),
      level: Math.min(MAX_LEVEL, Math.floor(line.match(/^ */)[0].length / INDENT)),
    }));
}

// Nombres pseudoaleatoris repetibles a partir d'un text (FNV-1a + xorshift)
function random(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/**
 * @param {Array<{ text: string }>} lines
 * @param {string} seed
 * @returns {number[]}
 */
export function shuffledOrder(lines, seed) {
  const order = lines.map((_, i) => i);
  const differs = () => order.some((index, position) => lines[index].text !== lines[position].text);
  if (new Set(lines.map((line) => line.text)).size < 2) return order;
  const next = random(seed || 'parsons');
  for (let attempt = 0; attempt < 20; attempt++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (differs()) return order;
  }
  // (no hauria de passar mai) almenys, girada
  return order.reverse();
}

/**
 * Les línies iguals (dos </li>) són intercanviables: es compara el text.
 *
 * @param {Array<{ text: string, level: number }>} state ordre i nivells de l'alumne
 * @param {Array<{ text: string, level: number }>} solution
 */
export function checkLines(state, solution) {
  const wrong = state.map((line, i) => line.text !== solution[i].text || line.level !== solution[i].level);
  const orderOk = state.every((line, i) => line.text === solution[i].text);
  return { wrong, orderOk, solved: !wrong.some(Boolean) };
}
