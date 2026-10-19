// ════════════════════════════════════════════════════════
// course/data.js — Les dades del curs: capítols i reptes (mòdul pur)
//
// Font única de veritat de l'estructura del curs: el menú de capítols,
// els enllaços «anterior / següent» i la portada es calculen d'aquí.
// Només hi ha les pàgines que existeixen (un test comprova que dades i
// fitxers de site/curs/ coincideixen): la feina a mitges va en branques,
// no amagada aquí.
//
// API pública:
//   CAPITOLS, REPTES, PARTS
//   courseSequence()          → pàgines en l'ordre del curs (cada repte
//                               just després del seu capítol afterChapter)
//   findPage(pagina, num)     → entrada de la seqüència o null
//   neighbours(pagina, num)   → { prev, next } (null als extrems)
//   pageGoals(page)           → [goalId, ...activitats] de la pàgina
//
// Capítol: { num, titol, arxiu, goalId, part, activitats }
//   activitats: els altres data-goal-id de la pàgina («Troba l'error»,
//   Parsons, qüestionari); la portada en compta els fets. Un test comprova
//   que coincideixen amb la pàgina.
// Repte:   { num, titol, arxiu, goalId, afterChapter, dificultat }
// Entrada de la seqüència: { pagina: 'capitol'|'repte', num, titol,
//                            arxiu, goalId, chapter }
//   chapter: capítol fins al qual s'ha ensenyat tot (el revisor de codi
//   només aplica aquestes regles)
// ════════════════════════════════════════════════════════

export const PARTS = {
  HTML: 'Part A · HTML',
  CSS: 'Part B · CSS',
};

export const CAPITOLS = [
  { num: 1, titol: 'Hola, HTML!', arxiu: 'capitol-1.html', goalId: 'cap-1-ex', part: 'HTML', activitats: ['cap-1-bug', 'cap-1-parsons', 'cap-1-quiz'] },
  { num: 2, titol: 'Text amb significat', arxiu: 'capitol-2.html', goalId: 'cap-2-ex', part: 'HTML', activitats: ['cap-2-bug', 'cap-2-quiz'] },
  { num: 3, titol: 'Llistes', arxiu: 'capitol-3.html', goalId: 'cap-3-ex', part: 'HTML', activitats: ['cap-3-bug', 'cap-3-parsons', 'cap-3-quiz'] },
  { num: 4, titol: 'Enllaços', arxiu: 'capitol-4.html', goalId: 'cap-4-ex', part: 'HTML', activitats: ['cap-4-bug', 'cap-4-quiz'] },
  { num: 5, titol: 'Imatges', arxiu: 'capitol-5.html', goalId: 'cap-5-ex', part: 'HTML', activitats: ['cap-5-bug', 'cap-5-quiz'] },
  { num: 6, titol: 'Estructura de la pàgina', arxiu: 'capitol-6.html', goalId: 'cap-6-ex', part: 'HTML', activitats: ['cap-6-bug', 'cap-6-parsons', 'cap-6-quiz'] },
  { num: 7, titol: 'Taules', arxiu: 'capitol-7.html', goalId: 'cap-7-ex', part: 'HTML', activitats: ['cap-7-bug', 'cap-7-quiz'] },
  { num: 8, titol: 'Formularis', arxiu: 'capitol-8.html', goalId: 'cap-8-ex', part: 'HTML', activitats: ['cap-8-bug', 'cap-8-quiz'] },
  { num: 9, titol: 'Hola, CSS!', arxiu: 'capitol-9.html', goalId: 'cap-9-ex', part: 'CSS', activitats: ['cap-9-bug', 'cap-9-parsons', 'cap-9-quiz'] },
  { num: 10, titol: 'Selectors i cascada', arxiu: 'capitol-10.html', goalId: 'cap-10-ex', part: 'CSS', activitats: ['cap-10-bug', 'cap-10-quiz'] },
  { num: 11, titol: 'Colors, text i unitats', arxiu: 'capitol-11.html', goalId: 'cap-11-ex', part: 'CSS', activitats: ['cap-11-bug', 'cap-11-quiz'] },
  { num: 12, titol: 'El model de caixa', arxiu: 'capitol-12.html', goalId: 'cap-12-ex', part: 'CSS', activitats: ['cap-12-bug', 'cap-12-quiz'] },
  { num: 13, titol: 'Flexbox', arxiu: 'capitol-13.html', goalId: 'cap-13-ex', part: 'CSS', activitats: ['cap-13-bug', 'cap-13-quiz'] },
  { num: 14, titol: 'Pàgines que s\'adapten', arxiu: 'capitol-14.html', goalId: 'cap-14-ex', part: 'CSS', activitats: ['cap-14-bug', 'cap-14-parsons', 'cap-14-quiz'] },
  { num: 15, titol: 'Projecte final', arxiu: 'capitol-15.html', goalId: 'cap-15-ex', part: 'CSS', activitats: ['cap-15-bug', 'cap-15-quiz'] },
];

export const REPTES = [];

/** @returns {Array<Object>} */
export function courseSequence() {
  const sequence = [];
  for (const capitol of CAPITOLS) {
    sequence.push({ pagina: 'capitol', ...capitol, chapter: capitol.num });
    for (const repte of REPTES.filter((r) => r.afterChapter === capitol.num)) {
      sequence.push({ pagina: 'repte', ...repte, chapter: repte.afterChapter });
    }
  }
  return sequence;
}

/**
 * Tots els objectius d'una pàgina: l'exercici principal i les activitats.
 *
 * @param {Object} page entrada de CAPITOLS, REPTES o courseSequence()
 * @returns {string[]}
 */
export function pageGoals(page) {
  return [page.goalId, ...(page.activitats || [])];
}

/**
 * @param {string} pagina 'capitol' | 'repte'
 * @param {number} num
 */
export function findPage(pagina, num) {
  return courseSequence().find((page) => page.pagina === pagina && page.num === num) || null;
}

/**
 * @param {string} pagina
 * @param {number} num
 * @returns {{ prev: Object|null, next: Object|null }}
 */
export function neighbours(pagina, num) {
  const sequence = courseSequence();
  const index = sequence.findIndex((page) => page.pagina === pagina && page.num === num);
  if (index === -1) return { prev: null, next: null };
  return { prev: sequence[index - 1] || null, next: sequence[index + 1] || null };
}
