// ════════════════════════════════════════════════════════
// course/glossary.js — El glossari: botó de la barra, finestra i llista
//
// Als capítols, el botó «📖 Glossari» de la barra obre un <dialog> amb tot
// el que s'ha ensenyat fins a aquell capítol (course/vocabulary.js),
// agrupat per tipus i amb un camp per filtrar. La pàgina site/glossari.html
// fa servir la mateixa llista, sencera i amb el capítol de cada terme.
// Tot el text es posa amb textContent.
//
// API pública:
//   createGlossaryButton(capitol)          → <button> per a la barra del curs
//   renderGlossary(container, entries, { ambCapitol })
//   mountGlossaryFilter(input, container)  filtra la llista mentre s'escriu
// ════════════════════════════════════════════════════════

import { TIPUS, vocabularyUntil } from './vocabulary.js';
import { t } from '../i18n/ca.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const normalitza = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * @param {HTMLElement} container
 * @param {Array<{ terme: string, tipus: string, capitol: number, def: string }>} entries
 * @param {{ ambCapitol?: boolean }} [options]
 */
export function renderGlossary(container, entries, { ambCapitol = false } = {}) {
  container.textContent = '';
  for (const [tipus, titol] of Object.entries(TIPUS)) {
    const group = entries.filter((entry) => entry.tipus === tipus);
    if (!group.length) continue;
    const section = el('section', 'glossari__grup');
    section.append(el('h3', 'glossari__tipus', titol));
    const list = el('dl', 'glossari__llista');
    for (const entry of group) {
      const item = el('div', 'glossari__entrada');
      item.dataset.text = normalitza(`${entry.terme} ${entry.def}`);
      const term = el('dt', 'glossari__terme');
      term.append(el('code', '', entry.terme));
      if (ambCapitol) term.append(el('span', 'glossari__capitol', t('glossary.chapter', { num: entry.capitol })));
      item.append(term, el('dd', 'glossari__def', entry.def));
      list.append(item);
    }
    section.append(list);
    container.append(section);
  }
  container.append(el('p', 'glossari__cap', t('glossary.none')));
}

/**
 * @param {HTMLInputElement} input
 * @param {HTMLElement} container
 */
export function mountGlossaryFilter(input, container) {
  const empty = container.querySelector('.glossari__cap');
  if (empty) empty.hidden = true;
  input.addEventListener('input', () => {
    const query = normalitza(input.value.trim());
    let shown = 0;
    for (const section of container.querySelectorAll('.glossari__grup')) {
      let inSection = 0;
      for (const item of section.querySelectorAll('.glossari__entrada')) {
        const match = !query || item.dataset.text.includes(query);
        item.hidden = !match;
        if (match) inSection++;
      }
      section.hidden = inSection === 0;
      shown += inSection;
    }
    const none = container.querySelector('.glossari__cap');
    if (none) none.hidden = shown > 0;
  });
}

function createDialog(capitol) {
  const dialog = el('dialog', 'glossari-finestra');
  dialog.setAttribute('aria-labelledby', 'glossari-titol');
  const head = el('div', 'glossari-finestra__capcalera');
  const title = el('h2', '', t('glossary.title'));
  title.id = 'glossari-titol';
  const close = el('button', 'glossari-finestra__tanca', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', t('glossary.close'));
  close.addEventListener('click', () => dialog.close());
  head.append(title, close);

  const intro = el('p', 'glossari-finestra__intro', t('glossary.intro', { num: capitol }));
  const label = el('label', 'glossari__filtre');
  label.append(el('span', '', t('glossary.filter')));
  const input = el('input');
  input.type = 'text';   // (amb type="search", el primer Esc buida el camp en lloc de tancar la finestra)
  input.enterKeyHint = 'search';
  input.autocomplete = 'off';
  label.append(input);
  const body = el('div', 'glossari');
  renderGlossary(body, vocabularyUntil(capitol));
  mountGlossaryFilter(input, body);
  const all = el('a', 'glossari-finestra__tot', t('glossary.all'));
  all.href = new URL('../../glossari.html', import.meta.url).href;

  dialog.append(head, intro, label, body, all);
  // Clic fora de la finestra (al fons): es tanca
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}

/**
 * @param {number} capitol fins a quin capítol s'ha ensenyat
 * @returns {HTMLButtonElement}
 */
export function createGlossaryButton(capitol) {
  const button = el('button', 'course-bar__glossari');
  button.type = 'button';
  const icon = el('span', '', '📖');
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon, el('span', 'course-bar__etiqueta', t('glossary.button')));
  button.setAttribute('aria-haspopup', 'dialog');
  let dialog = null;
  button.addEventListener('click', () => {
    if (!dialog) {
      dialog = createDialog(capitol);
      document.body.append(dialog);
    }
    dialog.showModal();
    dialog.querySelector('input').focus();
  });
  return button;
}
