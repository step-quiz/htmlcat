// Tests de site/js/checks/schema.js i de les comprovacions de checks.js
// que no necessiten navegador (uses-html, uses-css, lint). Les altres
// (sobre el DOM) les prova course-browser.mjs amb els exercicis de debò.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateChecks, CHECK_TYPES } from '../../site/js/checks/schema.js';
import { runChecks } from '../../site/js/checks/checks.js';
import { RULES } from '../../site/js/lint/lint.js';

const ruleIds = RULES.map((r) => r.id);
const validate = (checks) => validateChecks(checks, { ruleIds });

const VALID = [
  { type: 'exists', selector: 'h1', msg: 'Hi ha d\'haver un <h1>.' },
  { type: 'count', selector: 'body > p', min: 2, max: 5, msg: 'Entre dos i cinc paràgrafs.' },
  { type: 'count', selector: 'h1', eq: 1, msg: 'Un sol <h1>.' },
  { type: 'text', selector: 'title', matches: '^qui s[oó]c$', ci: true, msg: 'El títol diu «Qui soc».' },
  { type: 'text', selector: 'p', includes: 'gat', all: true, msg: 'Tots els paràgrafs parlen del gat.' },
  { type: 'attr', selector: 'html', name: 'lang', equals: 'ca', msg: 'La pàgina és en català.' },
  { type: 'attr', selector: 'img', name: 'alt', nonEmpty: true, all: true, msg: 'Cada imatge té alt.' },
  { type: 'style', selector: 'h1', prop: 'color', equals: 'teal', msg: 'El títol és de color teal.' },
  { type: 'uses-html', tag: 'meta', attr: 'charset', msg: 'Hi ha <meta charset>.' },
  { type: 'uses-css', selector: 'h1', prop: 'color', value: 'teal', msg: 'Una regla h1 posa color: teal.' },
  { type: 'layout', selector: 'nav a', kind: 'row', msg: 'Els enllaços estan en una fila.' },
  { type: 'layout', selector: 'main', kind: 'centered-x', tolerance: 4, msg: 'El contingut està centrat.' },
  { type: 'layout', selector: '.targeta', kind: 'column', width: 360, msg: 'En un mòbil, les targetes van en columna.' },
  { type: 'lint', maxErrors: 0, msg: 'El codi no té errors.' },
  { type: 'lint', rules: ['html/indentation'], maxWarnings: 0, msg: 'La indentació és correcta.' },
];

test('esquema: totes les comprovacions vàlides passen (i cobreixen tots els tipus)', () => {
  assert.deepEqual(validate(VALID), []);
  assert.deepEqual([...new Set(VALID.map((c) => c.type))].sort(), [...CHECK_TYPES].sort());
});

test('esquema: errors típics', () => {
  const one = (check) => validate([check]);
  assert.match(validateChecks([]).join(), /llista no buida/);
  assert.match(validateChecks({}).join(), /llista no buida/);
  assert.match(one('h1').join(), /objecte/);
  assert.match(one({ type: 'existeix', selector: 'h1', msg: 'x' }).join(), /tipus desconegut/);
  assert.match(one({ type: 'exists', selector: 'h1' }).join(), /falta «msg»/);
  assert.match(one({ type: 'exists', selecter: 'h1', msg: 'x' }).join(), /camp desconegut «selecter»/);
  assert.match(one({ type: 'exists', msg: 'x' }).join(), /falta «selector»/);
  assert.match(one({ type: 'exists', selector: ' ', msg: 'x' }).join(), /text no buit/);
  assert.match(one({ type: 'count', selector: 'p', msg: 'x' }).join(), /almenys un de eq, min, max/);
  assert.match(one({ type: 'count', selector: 'p', eq: 1, min: 1, msg: 'x' }).join(), /no es pot combinar/);
  assert.match(one({ type: 'count', selector: 'p', min: -1, msg: 'x' }).join(), /enter no negatiu/);
  assert.match(one({ type: 'text', selector: 'p', equals: 'a', includes: 'b', msg: 'x' }).join(), /exactament un/);
  assert.match(one({ type: 'text', selector: 'p', msg: 'x' }).join(), /exactament un/);
  assert.match(one({ type: 'text', selector: 'p', matches: '([', msg: 'x' }).join(), /expressió regular/);
  assert.match(one({ type: 'text', selector: 'p', equals: 'a', ci: 'sí', msg: 'x' }).join(), /true o false/);
  assert.match(one({ type: 'attr', selector: 'img', name: 'alt', present: false, msg: 'x' }).join(), /ha de ser true/);
  assert.match(one({ type: 'layout', selector: 'a', kind: 'fila', msg: 'x' }).join(), /«kind» ha de ser un de row, column/);
  assert.match(one({ type: 'layout', selector: 'a', msg: 'x' }).join(), /falta «kind»/);
  assert.match(one({ type: 'layout', selector: 'a', kind: 'row', tolerance: -1, msg: 'x' }).join(), /enter no negatiu/);
  assert.match(one({ type: 'layout', selector: 'a', kind: 'row', width: 100, msg: 'x' }).join(), /«width» ha de ser un enter entre 240 i 1600/);
  assert.match(one({ type: 'text', selector: 'a', equals: 'x', width: 360, msg: 'x' }).join(), /camp desconegut «width»/);
  assert.match(one({ type: 'uses-html', msg: 'x' }).join(), /almenys un de tag, attr/);
  assert.match(one({ type: 'lint', rules: ['html/no-existeix'], msg: 'x' }).join(), /regla desconeguda/);
  assert.match(one({ type: 'lint', rules: [], msg: 'x' }).join(), /llista no buida/);
});

// ── Comprovacions sobre el codi font (sense navegador) ──

const files = {
  'index.html': '<!DOCTYPE html>\n<html lang="ca">\n  <head>\n    <meta charset="UTF-8">\n    <title>X</title>\n    <link rel="stylesheet" href="estils.css">\n' +
    '    <style>\n      p { margin: 0; }\n    </style>\n  </head>\n  <body>\n    <h1>Hola</h1>\n  </body>\n</html>\n',
  'estils.css': 'h1,\nh2 {\n  color:   teal;\n}\n\n@media (min-width: 40em) {\n  .avis {\n    display: flex;\n  }\n}\n',
};
const passed = (check, extra = {}) => runChecks({ doc: null, files, mode: 'document', checks: [{ msg: 'x', ...check }], ...extra })[0].passed;

test('uses-html: al codi font', () => {
  assert.equal(passed({ type: 'uses-html', tag: 'meta', attr: 'charset' }), true);
  assert.equal(passed({ type: 'uses-html', tag: 'h1' }), true);
  assert.equal(passed({ type: 'uses-html', attr: 'lang' }), true);
  assert.equal(passed({ type: 'uses-html', tag: 'tbody' }), false);
  assert.equal(passed({ type: 'uses-html', tag: 'h1', attr: 'class' }), false);
});

test('uses-css: fitxers CSS, <style> i @media; el selector i el valor es normalitzen', () => {
  assert.equal(passed({ type: 'uses-css', selector: 'h2', prop: 'color', value: 'teal' }), true);
  assert.equal(passed({ type: 'uses-css', selector: 'p', prop: 'margin' }), true);
  assert.equal(passed({ type: 'uses-css', selector: '.avis', prop: 'display', value: 'flex' }), true);
  assert.equal(passed({ type: 'uses-css', matches: '^\\.', prop: 'display' }), true);
  assert.equal(passed({ type: 'uses-css', prop: 'COLOR' }), true);
  assert.equal(passed({ type: 'uses-css', selector: 'h1', prop: 'color', value: 'red' }), false);
  assert.equal(passed({ type: 'uses-css', selector: 'p', prop: 'color' }), false);
});

test('uses-css: valueIncludes busca un tros del valor (sense espais)', () => {
  const withVars = { 'estils.css': ':root {\n  --principal: #2a9d8f;\n}\n\nh1 {\n  border: 2px solid var( --principal );\n}\n' };
  const ok = (check) => runChecks({ doc: null, files: withVars, checks: [{ msg: 'x', type: 'uses-css', ...check }] })[0].passed;
  assert.equal(ok({ selector: 'h1', prop: 'border', valueIncludes: 'var(--principal)' }), true);
  assert.equal(ok({ selector: 'h1', prop: 'border', valueIncludes: 'solid var(--principal)' }), true);
  assert.equal(ok({ selector: 'h1', prop: 'border', valueIncludes: 'var(--fons)' }), false);
  assert.equal(ok({ selector: 'h1', prop: 'border', value: '2px solid var( --principal )', valueIncludes: '2px' }), true);
  assert.deepEqual(validate([{ type: 'uses-css', prop: 'color', valueIncludes: 'var(--x)', msg: 'x' }]), []);
  assert.match(validate([{ type: 'uses-css', prop: 'color', valueIncludes: '', msg: 'x' }]).join(), /text no buit/);
});

test('lint: errors i avisos al nivell del capítol', () => {
  assert.equal(passed({ type: 'lint', maxErrors: 0 }), true);
  const broken = { 'index.html': '<p>sense tancar\n<ul>\n<li>x</li>\n</ul>\n' };
  const result = (check, chapter) => runChecks({ doc: null, files: broken, chapter, checks: [{ msg: 'x', ...check }] })[0];
  assert.equal(result({ type: 'lint' }, 1).passed, false);
  assert.match(result({ type: 'lint' }, 1).detail, /errors: 1/);
  assert.equal(result({ type: 'lint', maxErrors: 1 }, 1).passed, true);
  assert.equal(result({ type: 'lint', rules: ['html/indentation'], maxWarnings: 0 }, 1).passed, true);  // amb errors no es revisa
});

test('un tipus desconegut no fa fallar res: la comprovació no se supera', () => {
  const [result] = runChecks({ doc: null, files, checks: [{ type: 'màgia', msg: 'x' }] });
  assert.equal(result.passed, false);
  assert.match(result.detail, /mal escrita/);
});

// ── layout, amb caixes de mentida (al navegador ho prova course-browser.mjs) ──

/** Un document de mentida: cada selector dona caixes { left, top, width, height } dins d'un pare. */
function fakeDoc(boxes, parent = { left: 0, top: 0, width: 800, height: 600 }) {
  const rect = ({ left, top, width, height }) => ({ left, top, width, height, right: left + width, bottom: top + height });
  const doc = { documentElement: { clientWidth: 800 } };
  const parentElement = { getBoundingClientRect: () => rect(parent) };
  doc.querySelectorAll = (selector) => {
    if (selector === '((') throw new SyntaxError('selector');
    return (boxes[selector] || []).map((box) => ({ ownerDocument: doc, parentElement, getBoundingClientRect: () => rect(box) }));
  };
  return doc;
}
const layout = (boxes, check, parent) => runChecks({ doc: fakeDoc(boxes, parent), files: {}, checks: [{ type: 'layout', msg: 'x', ...check }] })[0];

test('layout: row i column, en ordre i a la mateixa altura (o columna)', () => {
  const row = [{ left: 0, top: 10, width: 50, height: 20 }, { left: 60, top: 0, width: 50, height: 40 }, { left: 120, top: 10, width: 50, height: 20 }];
  assert.equal(layout({ a: row }, { selector: 'a', kind: 'row' }).passed, true);
  assert.equal(layout({ a: row }, { selector: 'a', kind: 'column' }).passed, false);
  const column = row.map((box, i) => ({ left: 0, top: i * 30, width: 100, height: 20 }));
  assert.equal(layout({ a: column }, { selector: 'a', kind: 'column' }).passed, true);
  const wrapped = [row[0], row[1], { left: 0, top: 50, width: 50, height: 20 }];   // el tercer ha baixat de línia
  const result = layout({ a: wrapped }, { selector: 'a', kind: 'row' });
  assert.equal(result.passed, false);
  assert.match(result.detail, /l'element número 3 no és a la dreta/);
  // En escala (cada un més a la dreta, però més avall) no és ni una fila ni una columna
  const stairs = [{ left: 0, top: 0, width: 50, height: 20 }, { left: 60, top: 30, width: 50, height: 20 }];
  assert.equal(layout({ a: stairs }, { selector: 'a', kind: 'row' }).passed, false);
  assert.equal(layout({ a: stairs }, { selector: 'a', kind: 'column' }).passed, false);
  // 2 px de tolerància per defecte (vores que es toquen), o la que es demani
  const touching = [{ left: 0, top: 0, width: 50, height: 20 }, { left: 48, top: 0, width: 50, height: 20 }];
  assert.equal(layout({ a: touching }, { selector: 'a', kind: 'row' }).passed, true);
  assert.equal(layout({ a: touching }, { selector: 'a', kind: 'row', tolerance: 0 }).passed, false);
  // Calen almenys dos elements, i un selector ben escrit
  assert.match(layout({ a: [row[0]] }, { selector: 'a', kind: 'row' }).detail, /almenys dos, i n'hi ha 1/);
  assert.match(layout({}, { selector: '((', kind: 'row' }).detail, /mal escrita/);
});

test('layout: centrat dins del pare i sense sortir per la dreta', () => {
  const parent = { left: 100, top: 0, width: 400, height: 300 };
  assert.equal(layout({ p: [{ left: 200, top: 100, width: 200, height: 100 }] }, { selector: 'p', kind: 'centered-x' }, parent).passed, true);
  assert.equal(layout({ p: [{ left: 200, top: 100, width: 200, height: 100 }] }, { selector: 'p', kind: 'centered-y' }, parent).passed, true);
  const left = layout({ p: [{ left: 100, top: 0, width: 200, height: 100 }] }, { selector: 'p', kind: 'centered-x' }, parent);
  assert.deepEqual([left.passed, left.detail], [false, '(No està centrat: té 0 px a l\'esquerra i 200 px a la dreta.)']);
  assert.match(layout({ p: [{ left: 200, top: 0, width: 200, height: 100 }] }, { selector: 'p', kind: 'centered-y' }, parent).detail, /0 px a dalt i 200 px a baix/);
  assert.equal(layout({ p: [] }, { selector: 'p', kind: 'centered-x' }).passed, false);
  assert.equal(layout({ img: [{ left: 0, top: 0, width: 800, height: 10 }] }, { selector: 'img', kind: 'fits-width' }).passed, true);
  const wide = layout({ img: [{ left: 0, top: 0, width: 900, height: 10 }] }, { selector: 'img', kind: 'fits-width' });
  assert.deepEqual([wide.passed, wide.detail], [false, '(Surt 100 px per la dreta de la pàgina.)']);
});

test('width: la comprovació es fa amb el marc a aquella amplada, i després torna a com estava', () => {
  const frameElement = { style: { width: '' } };
  const seen = [];
  const doc = {
    defaultView: { frameElement },
    documentElement: { clientWidth: 800 },
    querySelectorAll: () => [{ ownerDocument: doc, getBoundingClientRect: () => { seen.push(frameElement.style.width); return { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }; } }],
  };
  runChecks({ doc, files: {}, checks: [
    { type: 'layout', selector: 'img', kind: 'fits-width', width: 360, msg: 'x' },
    { type: 'layout', selector: 'img', kind: 'fits-width', msg: 'x' },
  ] });
  assert.deepEqual(seen, ['360px', '']);
  assert.equal(frameElement.style.width, '');
});
