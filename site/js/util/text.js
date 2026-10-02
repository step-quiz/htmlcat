// ════════════════════════════════════════════════════════
// util/text.js — Utilitats de text (mòdul pur)
//
// No toca document, window ni localStorage: es pot provar
// amb Node (tests/unit/text.test.mjs).
//
// API pública:
//   normalizeNewlines(text) — converteix \r\n i \r en \n
//   dedent(text)            — treu la indentació comuna i les
//                             línies buides del principi i del final
//   lineColAt(text, offset) — { line, col } (1-based) d'una posició
// ════════════════════════════════════════════════════════

/**
 * @param {string} text
 * @returns {string}
 */
export function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, '\n');
}

/**
 * Treu la indentació comuna d'un bloc de codi escrit dins d'una pàgina
 * (p. ex. el codi inicial d'un simulador) i les línies buides dels extrems.
 * Només compta espais: les tabulacions no s'admeten al contingut del curs.
 * El resultat acaba sempre amb un salt de línia (o és buit).
 *
 * @param {string} text
 * @returns {string}
 */
export function dedent(text) {
  const lines = normalizeNewlines(text).split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines.at(-1).trim()) lines.pop();
  if (!lines.length) return '';

  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^ */)[0].length);
  const cut = Math.min(...indents);
  return lines.map((line) => line.slice(cut)).join('\n') + '\n';
}

/**
 * Línia i columna (començant per 1) d'una posició del text.
 * La posició es compta en unitats UTF-16, com textarea.selectionStart.
 *
 * @param {string} text
 * @param {number} offset
 * @returns {{ line: number, col: number }}
 */
export function lineColAt(text, offset) {
  const before = text.slice(0, Math.max(0, offset));
  const lastNewline = before.lastIndexOf('\n');
  return {
    line: before.split('\n').length,
    col: offset - lastNewline,
  };
}
