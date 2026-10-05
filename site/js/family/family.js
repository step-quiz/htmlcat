// ════════════════════════════════════════════════════════
// family/family.js — Selector discret dels projectes «Cat»
//
// Mostra el text «EXPLORA» i 4 icones petites a la capçalera. En passar-hi
// el ratolí per sobre (o en arribar-hi amb Tab):
//   · la icona creix i fa un «shake-and-blink» d'1 segon;
//   · les altres 3 s'encongeixen un 20 % i s'aclareixen un 10 %;
//   · el text «EXPLORA» és substituït pel nom del projecte.
// Els estils són a css/family.css (la tipografia, Josefin Sans, s'hi serveix
// des de fonts/: cap petició a tercers).
//
// ESCALAR: per afegir un projecte nou, afegeix-lo a CAT_PROJECTS i posa la
// seva icona a img/family/ (el test unitari comprova que el fitxer existeix).
//
// API pública:
//   CURRENT_PROJECT          → id d'aquest projecte (no és un enllaç)
//   CAT_PROJECTS             → llista de projectes { id, nom, url, icona }
//   mountFamily(host)        → afegeix el <nav class="cat-family"> a host
//                              i retorna el <nav>
// Les icones es busquen amb import.meta.url, no amb l'adreça de la pàgina (A9).
// ════════════════════════════════════════════════════════

import { t } from '../i18n/ca.js';

export const CURRENT_PROJECT = 'htmlcat';

export const CAT_PROJECTS = [
  { id: 'htmlcat', nom: 'HTMLCat', url: 'https://htmlcat.step-quiz.net', icona: 'htmlcat.svg' },
  { id: 'pycat', nom: 'PyCat', url: 'https://pycat.step-quiz.net', icona: 'pycat.svg' },
  { id: 'karelcat', nom: 'KarelCat', url: 'https://karelcat.step-quiz.net', icona: 'karelcat.svg' },
  { id: 'jscat', nom: 'JSCat', url: 'https://jscat.step-quiz.net', icona: 'jscat.svg' },
];

// Quant triga a desactivar-se una icona en sortir-ne el ratolí: sense aquest
// retard, en passar d'una icona a la del costat tot es reinicia i parpelleja.
const HIDE_DELAY_MS = 80;

const ICONS = new URL('../../img/family/', import.meta.url);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * @param {Element} host contenidor (la capçalera de la pàgina)
 * @returns {HTMLElement} el <nav> creat
 */
export function mountFamily(host) {
  const nav = el('nav', 'cat-family');
  nav.setAttribute('aria-label', t('family.label'));

  const label = el('span', 'cat-label');
  label.setAttribute('aria-hidden', 'true');
  const nameEl = el('span', 'cat-name');
  label.append(el('span', 'cat-explora', t('family.explora')), nameEl);
  nav.append(label);

  let activeEl = null;
  let hideTimer = null;

  function activate(item, nom) {
    clearTimeout(hideTimer);
    if (activeEl && activeEl !== item) activeEl.classList.remove('is-active');
    activeEl = item;
    nameEl.textContent = nom;
    item.classList.add('is-active');
    nav.classList.add('has-active');
  }

  function deactivate() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (activeEl) activeEl.classList.remove('is-active');
      activeEl = null;
      nav.classList.remove('has-active');
    }, HIDE_DELAY_MS);
  }

  // En pantalles tàctils no hi ha «hover»: un toc només segueix l'enllaç,
  // sense deixar cap icona activa enganxada.
  const canHover = Boolean(window.matchMedia && window.matchMedia('(hover: hover)').matches);

  for (const project of CAT_PROJECTS) {
    const isCurrent = project.id === CURRENT_PROJECT;
    const item = el(isCurrent ? 'span' : 'a', isCurrent ? 'cat-family-item is-current' : 'cat-family-item');
    if (isCurrent) {
      item.setAttribute('aria-current', 'page');
      item.setAttribute('aria-label', t('family.current', { name: project.nom }));
    } else {
      item.href = project.url;
      item.target = '_blank';   // l'alumne no perd el codi de l'editor
      item.rel = 'noopener';
      item.setAttribute('aria-label', t('family.open', { name: project.nom }));
    }
    const img = el('img');
    img.src = new URL(project.icona, ICONS).href;
    img.alt = '';
    img.draggable = false;
    item.append(img);

    if (canHover) {
      item.addEventListener('mouseenter', () => activate(item, project.nom));
      item.addEventListener('mouseleave', deactivate);
    }
    // Teclat (Tab): el mateix efecte. En tàctil no, perquè el focus quedaria enganxat.
    item.addEventListener('focus', () => {
      if (item.matches(':focus-visible')) activate(item, project.nom);
    });
    item.addEventListener('blur', deactivate);
    nav.append(item);
  }

  host.append(nav);
  return nav;
}
