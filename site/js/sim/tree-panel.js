// ════════════════════════════════════════════════════════
// sim/tree-panel.js — El panell 🌳 Arbre del simulador
//
// Mostra el document tal com l'ha construït el navegador, com una llista
// niada que es pot plegar: el nom de cada element (amb l'id i les classes),
// els textos escurçats i els comentaris en gris. Els elements que no són al
// codi de l'alumne es marquen «afegit pel navegador» (sim/tree-model.js).
// En passar el ratolí (o el focus) per sobre d'un element, es ressalta al
// resultat: s'hi posa un atribut i un <style> (cap script a la
// previsualització).
//
// En mode fragment l'arrel és el <body> (l'alumne només n'escriu el
// contingut); en mode document, l'<html>. No es mostren el <meta> de la CSP
// ni el <base> que hi injecta el simulador, i un <style data-file> (el que
// substitueix un <link> a un fitxer del simulador) es mostra com a <link>.
// Tot el text que ve del codi de l'alumne es posa amb textContent.
//
// API pública:
//   createTreePanel(container) → { update(doc, { mode, sourceRoot }) }
// ════════════════════════════════════════════════════════

import { t } from '../i18n/ca.js';
import { markAdded } from './tree-model.js';

const HIGHLIGHT_ATTR = 'data-htmlcat-arbre';
const HIGHLIGHT_CSS = `[${HIGHLIGHT_ATTR}] { outline: 3px solid #db2777 !important; outline-offset: 2px !important; }`;
const TEXT_MAX = 40;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Nodes que hi posa el simulador, no l'alumne (preview/srcdoc.js)
function isInjected(node) {
  const name = node.localName;
  return (name === 'meta' && (node.getAttribute('http-equiv') || '').toLowerCase() === 'content-security-policy') ||
    (name === 'base' && node.parentNode?.localName === 'head' && node === node.ownerDocument.querySelector('base'));
}

/** Converteix el DOM de la previsualització en objectes senzills. */
function modelOf(node) {
  const children = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 1 && !isInjected(child)) children.push(modelOf(child));
    else if (child.nodeType === 3 && child.data.trim()) children.push({ kind: 'text', text: child.data.replace(/\s+/g, ' ').trim() });
    else if (child.nodeType === 8) children.push({ kind: 'comment', text: child.data.replace(/\s+/g, ' ').trim() });
  }
  const fromLink = node.localName === 'style' && node.hasAttribute('data-file');
  return {
    kind: 'element',
    name: fromLink ? 'link' : node.localName,
    id: node.getAttribute('id'),
    classes: (node.getAttribute('class') || '').trim(),
    href: fromLink ? node.getAttribute('data-file') : null,
    // El CSS que substitueix el <link> no es mostra com a text
    children: fromLink || node.localName === 'style' ? [] : children,
    domNode: node,
  };
}

const shorten = (text) => (text.length > TEXT_MAX ? text.slice(0, TEXT_MAX - 1) + '…' : text);

/**
 * @param {HTMLElement} container
 */
export function createTreePanel(container) {
  container.classList.add('sim-tree-panel');
  const help = el('p', 'sim-tree__help', t('sim.tree.help'));
  const legend = el('p', 'sim-tree__legend');
  const tree = el('ul', 'sim-tree');
  tree.setAttribute('aria-label', t('sim.tree.label'));
  container.append(help, tree, legend);

  let highlighted = null;
  function highlight(node) {
    if (highlighted && highlighted !== node) highlighted.removeAttribute(HIGHLIGHT_ATTR);
    highlighted = node;
    if (!node) return;
    const doc = node.ownerDocument;
    if (doc && !doc.querySelector('style[data-htmlcat-arbre-css]')) {
      const style = doc.createElement('style');
      style.setAttribute('data-htmlcat-arbre-css', '');
      style.textContent = HIGHLIGHT_CSS;
      (doc.head || doc.documentElement).append(style);
    }
    node.setAttribute(HIGHLIGHT_ATTR, '');
  }

  function label(model) {
    const tag = el('code', 'sim-tree__tag');
    tag.append(`<${model.name}`);
    if (model.href) tag.append(el('span', 'sim-tree__attr', ` href="${model.href}"`));
    if (model.id) tag.append(el('span', 'sim-tree__attr', ` id="${model.id}"`));
    if (model.classes) tag.append(el('span', 'sim-tree__attr', ` class="${model.classes}"`));
    tag.append('>');
    const row = el('span', 'sim-tree__node' + (model.added ? ' sim-tree__node--afegit' : ''));
    row.append(tag);
    if (model.added) row.append(el('span', 'sim-tree__added', t('sim.tree.added')));
    const on = () => highlight(model.domNode);
    const off = () => highlight(null);
    row.addEventListener('mouseenter', on);
    row.addEventListener('mouseleave', off);
    return { row, on, off };
  }

  function item(model) {
    const li = el('li');
    if (model.kind === 'text') {
      li.append(el('span', 'sim-tree__text', `"${shorten(model.text)}"`));
      return li;
    }
    if (model.kind === 'comment') {
      li.append(el('span', 'sim-tree__comment', `<!-- ${shorten(model.text)} -->`));
      return li;
    }
    const { row, on, off } = label(model);
    if (!model.children.length) {
      row.tabIndex = 0;
      row.addEventListener('focus', on);
      row.addEventListener('blur', off);
      li.append(row);
      return li;
    }
    const details = el('details');
    details.open = true;
    const summary = el('summary');
    summary.append(row);
    summary.addEventListener('focus', on);
    summary.addEventListener('blur', off);
    const list = el('ul');
    for (const child of model.children) list.append(item(child));
    details.append(summary, list);
    li.append(details);
    return li;
  }

  return {
    /**
     * @param {Document} doc el de la previsualització
     * @param {{ mode: 'fragment'|'document', sourceRoot: Object }} source
     */
    update(doc, { mode, sourceRoot }) {
      highlighted = null;
      tree.textContent = '';
      legend.textContent = '';
      if (!doc || !doc.documentElement) return;
      const roots = mode === 'document'
        ? [modelOf(doc.documentElement)]
        : (doc.body ? modelOf(doc.body).children : []);
      markAdded(roots, sourceRoot ? sourceRoot.children : []);
      for (const model of roots) tree.append(item(model));
      if (tree.querySelector('.sim-tree__node--afegit')) legend.textContent = t('sim.tree.legend');
    },
  };
}
