// ════════════════════════════════════════════════════════
// pages/glossary-page.js — Punt d'entrada de site/glossari.html
//
// Tot el vocabulari del curs (course/vocabulary.js), amb el capítol on
// surt cada terme i un camp per filtrar.
// ════════════════════════════════════════════════════════

import { VOCABULARI, vocabularyUntil } from '../course/vocabulary.js';
import { renderGlossary, mountGlossaryFilter } from '../course/glossary.js';

const container = document.querySelector('[data-glossari]');
const input = document.querySelector('[data-glossari-filtre]');
if (container) {
  const last = Math.max(...VOCABULARI.map((entry) => entry.capitol));
  renderGlossary(container, vocabularyUntil(last), { ambCapitol: true });
  if (input) mountGlossaryFilter(input, container);
}
