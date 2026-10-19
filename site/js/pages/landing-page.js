// ════════════════════════════════════════════════════════
// pages/landing-page.js — Punt d'entrada de la portada (l'index.html de
// l'arrel del repositori)
//
// Munta el selector de la família Cat a la barra, ressalta els exemples de
// codi i omple, a partir de course/data.js i del progrés desat:
//   - el resum del progrés (exercicis i activitats superats, barra) i el
//     botó «Comença / Continua» (porta al primer capítol sense superar);
//   - la llista de capítols (<ol data-capitols>), amb l'estat de cadascun;
//   - «Exporta el meu progrés» / «Importa» (course/backup.js): un fitxer
//     JSON amb el progrés i el codi, per canviar d'ordinador.
// ════════════════════════════════════════════════════════

import { highlightCodeExamples } from '../editor/code-examples.js';
import { courseSequence } from '../course/data.js';
import { completedGoals } from '../course/progress.js';
import { collectBackup, parseBackup, mergeBackup, backupFileName } from '../course/backup.js';
import { t } from '../i18n/ca.js';
import { mountFamily } from '../family/family.js';

const CURS = new URL('../../curs/', import.meta.url);   // (la portada és a l'arrel, no a site/)
const ERRORS = {
  'massa-gran': t('backup.error.massa-gran'),
  'no-json': t('backup.error.no-json'),
  'no-htmlcat': t('backup.error.no-htmlcat'),
  versio: t('backup.error.versio'),
};

highlightCodeExamples();

const bar = document.querySelector('.barra');
if (bar) mountFamily(bar);

const $ = (selector) => document.querySelector(selector);
const message = $('[data-progres-missatge]');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function storage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function renderProgress() {
  const goals = completedGoals();
  const sequence = courseSequence();
  const exercises = sequence.filter((page) => goals[page.goalId]).length;
  const activities = sequence.flatMap((page) => page.activitats || []);
  const activitiesDone = activities.filter((goal) => goals[goal]).length;

  const summary = $('[data-progres-resum]');
  if (summary) {
    summary.textContent = exercises || activitiesDone
      ? t('landing.progress.summary', { ex: exercises, totalEx: sequence.length, act: activitiesDone, totalAct: activities.length })
      : t('landing.progress.none');
  }
  const progress = $('[data-progres-barra]');
  if (progress) {
    progress.max = sequence.length;
    progress.value = exercises;
    progress.setAttribute('aria-label', t('landing.progress.bar'));
  }
  const next = sequence.find((page) => !goals[page.goalId]);
  const go = $('[data-continua]');
  if (go && next && exercises) {
    go.href = new URL(next.arxiu, CURS).href;
    go.textContent = `${t('course.chapter', { num: next.num })}: ${next.titol} →`;
  }

  const list = $('[data-capitols]');
  if (!list) return;
  list.textContent = '';
  for (const page of sequence) {
    const item = el('li', 'index-capitols__item');
    const done = Boolean(goals[page.goalId]);
    if (done) item.classList.add('index-capitols__item--fet');
    const link = el('a', 'index-capitols__enllac');
    link.href = new URL(page.arxiu, CURS).href;
    link.append(
      el('span', 'index-capitols__num', page.pagina === 'repte' ? t('course.repte', { num: page.num }) : t('course.chapter', { num: page.num })),
      el('span', 'index-capitols__titol', page.titol),
    );
    const state = el('span', 'index-capitols__estat', done ? t('landing.chapter.done') : t('landing.chapter.pending'));
    const extra = page.activitats || [];
    if (extra.length) {
      const n = extra.filter((goal) => goals[goal]).length;
      state.append(' · ', t('landing.chapter.activities', { n, total: extra.length }));
    }
    link.append(state);
    item.append(link);
    list.append(item);
  }
}

function say(text) {
  if (message) message.textContent = text;
}

function exportProgress() {
  const store = storage();
  const backup = store ? collectBackup(store) : null;
  if (!backup || !Object.keys(backup.dades).length) {
    say(t('backup.exported.none'));
    return;
  }
  const name = backupFileName();
  const blob = new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  say(t('backup.exported', { file: name }));
}

async function importProgress(file) {
  const parsed = parseBackup(await file.text());
  if (!parsed.ok) {
    say(ERRORS[parsed.error] || ERRORS['no-htmlcat']);
    return;
  }
  const { exercicis, codis, ignorats } = parsed.resum;
  if (!window.confirm(t('backup.confirm', { ex: exercicis, codis }))) return;
  const store = storage();
  let result;
  try {
    result = mergeBackup(store, parsed.dades);
  } catch {
    say(t('backup.error.storage'));
    return;
  }
  renderProgress();
  say(t('backup.imported', { ex: result.exercicis, codis: result.codis }) +
    (ignorats ? ' ' + t('backup.ignored', { n: ignorats }) : ''));
}

renderProgress();

const exportButton = $('[data-exporta]');
const importButton = $('[data-importa]');
const fileInput = $('[data-fitxer]');
if (exportButton) exportButton.addEventListener('click', exportProgress);
if (importButton && fileInput) {
  importButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const [file] = fileInput.files;
    fileInput.value = '';
    if (file) importProgress(file);
  });
}

// Si l'alumne torna a la portada amb el botó «enrere», el progrés pot haver canviat
window.addEventListener('pageshow', (event) => {
  if (event.persisted) renderProgress();
});

