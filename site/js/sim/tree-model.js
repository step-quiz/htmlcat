// ════════════════════════════════════════════════════════
// sim/tree-model.js — Quins elements de l'arbre ha afegit el navegador
// (mòdul pur)
//
// El panell 🌳 Arbre (sim/tree-panel.js) mostra el document que ha
// construït el navegador. Aquí es compara amb l'arbre del codi que ha
// escrit l'alumne (lang/html-model.js) per marcar els elements que no hi
// són: el <tbody> d'una taula, el <head> que falta, la segona <i> de
// <b><i>…</b></i>… És la manera més clara de veure per què cal niar bé.
//
// L'arbre del navegador arriba com a objectes senzills (no nodes del DOM),
// i així es pot provar amb Node:
//   { kind: 'element', name, children: [...] }   (i altres camps, que no es toquen)
//   { kind: 'text' | 'comment', ... }
//
// API pública:
//   markAdded(domChildren, sourceChildren)
//     Posa added = true / false a cada element de domChildren (i dels seus
//     descendents). sourceChildren: els fills de l'arbre del codi font
//     (nodes de buildSourceTree; només en compten els elements).
// ════════════════════════════════════════════════════════

const elementsOf = (nodes) => (nodes || []).filter((node) => node.type === 'element');

/**
 * Alinea els fills (elements) d'un node del navegador amb una llista
 * d'elements del codi font, en ordre i pel nom. Un element del navegador
 * que no casa és «afegit» i pot embolcallar els elements del codi que
 * venen a continuació (el <tbody> embolcalla les <tr>): per això es
 * continua dins seu amb la mateixa llista.
 *
 * @returns {number} quants elements de `source` s'han fet servir
 */
function align(domChildren, source) {
  let used = 0;
  for (const child of domChildren) {
    if (child.kind !== 'element') continue;
    const candidate = source[used];
    if (candidate && candidate.name === child.name) {
      child.added = false;
      align(child.children, elementsOf(candidate.children));
      used++;
    } else {
      child.added = true;
      used += align(child.children, source.slice(used));
    }
  }
  return used;
}

/**
 * @param {Array<Object>} domChildren
 * @param {Array<Object>} sourceChildren
 */
export function markAdded(domChildren, sourceChildren) {
  align(domChildren, elementsOf(sourceChildren));
}
