// Tests de site/js/sim/tree-model.js (què ha afegit el navegador a l'arbre)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markAdded } from '../../site/js/sim/tree-model.js';
import { buildSourceTree } from '../../site/js/lang/html-model.js';

// Arbre del navegador fet a mà: e('table', e('tbody', e('tr')))
const e = (name, ...children) => ({ kind: 'element', name, children });
const text = (value) => ({ kind: 'text', text: value });
const added = (nodes) => nodes.flatMap((n) => (n.kind === 'element' ? [...(n.added ? [n.name] : []), ...added(n.children)] : []));

test('una taula sense <tbody>: el <tbody> l\'ha afegit el navegador', () => {
  const src = '<table>\n  <tr>\n    <td>1</td>\n  </tr>\n  <tr>\n    <td>2</td>\n  </tr>\n</table>';
  const dom = [e('table', e('tbody', e('tr', e('td', text('1'))), e('tr', e('td', text('2')))))];
  markAdded(dom, buildSourceTree(src).root.children);
  assert.deepEqual(added(dom), ['tbody']);
  assert.equal(dom[0].added, false);
  assert.equal(dom[0].children[0].children[1].added, false);
});

test('<b><i>…</b>…</i>: la segona <i> l\'ha afegit el navegador', () => {
  const src = '<p><b><i>Hola</b> món</i></p>';
  const dom = [e('p', e('b', e('i', text('Hola'))), e('i', text(' món')))];
  markAdded(dom, buildSourceTree(src).root.children);
  assert.deepEqual(added(dom), ['i']);
  assert.equal(dom[0].children[1].added, true);
  assert.equal(dom[0].children[0].children[0].added, false);
});

test('un document sense <head>: el <head> és afegit, i el que té a dins, de l\'alumne', () => {
  const src = '<!DOCTYPE html>\n<html lang="ca">\n<meta charset="UTF-8">\n<title>Hola</title>\n<body>\n<p>Hola</p>\n</body>\n</html>';
  const dom = [e('html', e('head', e('meta'), e('title', text('Hola'))), e('body', e('p', text('Hola'))))];
  markAdded(dom, buildSourceTree(src).root.children);
  assert.deepEqual(added(dom), ['head']);
});

test('un codi sense errors: no hi ha res afegit', () => {
  const src = '<ul>\n  <li>A</li>\n  <li>B</li>\n</ul>\n<p>Fi</p>';
  const dom = [e('ul', e('li', text('A')), e('li', text('B'))), e('p', text('Fi'))];
  markAdded(dom, buildSourceTree(src).root.children);
  assert.deepEqual(added(dom), []);
});

test('un <p> que tanca un bloc: el </p> solt crea un <p> buit, afegit', () => {
  const src = '<p>Hola\n<ul>\n  <li>A</li>\n</ul>\n</p>';
  const dom = [e('p', text('Hola')), e('ul', e('li', text('A'))), e('p')];
  markAdded(dom, buildSourceTree(src).root.children);
  assert.deepEqual(added(dom), ['p']);
  assert.equal(dom[2].added, true);
});
