// ════════════════════════════════════════════════════════
// pages/teacher-page.js — Punt d'entrada de site/professorat.html
//
// Omple la taula dels capítols (títol i noms dels exercicis) a partir de
// course/data.js, perquè la guia no se'n desfasi mai.
// ════════════════════════════════════════════════════════

import { courseSequence } from '../course/data.js';
import { t } from '../i18n/ca.js';

const body = document.querySelector('[data-taula-curs] tbody');
if (body) {
  for (const page of courseSequence()) {
    const row = document.createElement('tr');
    const head = document.createElement('th');
    head.scope = 'row';
    head.textContent = page.pagina === 'repte' ? t('course.repte', { num: page.num }) : t('course.chapter', { num: page.num });
    const title = document.createElement('td');
    const link = document.createElement('a');
    link.href = new URL('../../curs/' + page.arxiu, import.meta.url).href;
    link.textContent = page.titol;
    title.append(link);
    const main = document.createElement('td');
    const code = document.createElement('code');
    code.textContent = page.goalId;
    main.append(code);
    const extra = document.createElement('td');
    (page.activitats || []).forEach((goal, i) => {
      if (i) extra.append(', ');
      const c = document.createElement('code');
      c.textContent = goal;
      extra.append(c);
    });
    row.append(head, title, main, extra);
    body.append(row);
  }
}
