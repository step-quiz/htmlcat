// ════════════════════════════════════════════════════════
// pages/landing-page.js — Punt d'entrada de la portada (l'index.html de
// l'arrel del repositori)
//
// Munta el selector de la família Cat a la barra, ressalta els exemples de
// codi i omple la llista de capítols (<ol data-capitols>) a partir de
// course/data.js, amb ✓ als que l'alumne ja ha superat.
// ════════════════════════════════════════════════════════

import { highlightCodeExamples } from '../editor/code-examples.js';
import { courseSequence } from '../course/data.js';
import { completedGoals } from '../course/progress.js';
import { t } from '../i18n/ca.js';
import { mountFamily } from '../family/family.js';

highlightCodeExamples();

const bar = document.querySelector('.barra');
if (bar) mountFamily(bar);

const list = document.querySelector('[data-capitols]');
if (list) {
  const goals = completedGoals();
  for (const page of courseSequence()) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = new URL('../../curs/' + page.arxiu, import.meta.url).href;   // (la portada és a l'arrel, no a site/)
    link.textContent = `${page.pagina === 'repte' ? t('course.repte', { num: page.num }) : t('course.chapter', { num: page.num })}: ${page.titol}`;
    item.append(link);
    if (goals[page.goalId]) item.append(' ✓');
    list.append(item);
  }
}
