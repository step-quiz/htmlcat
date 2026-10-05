// Tests de site/js/family/family.js (les dades; el comportament amb el
// ratolí el prova course-browser.mjs, checkFamily)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CAT_PROJECTS, CURRENT_PROJECT } from '../../site/js/family/family.js';

const ICONS = new URL('../../site/img/family/', import.meta.url);

test('hi ha 4 projectes amb ids i noms únics', () => {
  assert.equal(CAT_PROJECTS.length, 4);
  assert.equal(new Set(CAT_PROJECTS.map((p) => p.id)).size, 4);
  assert.equal(new Set(CAT_PROJECTS.map((p) => p.nom)).size, 4);
});

test('el projecte actual és HTMLCat i és a la llista', () => {
  assert.equal(CURRENT_PROJECT, 'htmlcat');
  assert.ok(CAT_PROJECTS.some((p) => p.id === CURRENT_PROJECT));
});

test('cada projecte té una adreça https de step-quiz.net i la seva icona', () => {
  for (const p of CAT_PROJECTS) {
    const url = new URL(p.url);
    assert.equal(url.protocol, 'https:', p.id);
    assert.equal(url.hostname, `${p.id}.step-quiz.net`, p.id);
    assert.ok(existsSync(new URL(p.icona, ICONS)), `falta img/family/${p.icona}`);
    assert.match(readFileSync(new URL(p.icona, ICONS), 'utf8'), /<svg\b/, p.icona);
  }
});

test('la icona d\'HTMLCat és la mateixa que el logotip', () => {
  const logo = readFileSync(new URL('../../site/img/logo.svg', import.meta.url), 'utf8');
  assert.equal(readFileSync(new URL('htmlcat.svg', ICONS), 'utf8'), logo);
});

test('el CSS serveix la tipografia des de fonts/ i no en demana cap a tercers', () => {
  const css = readFileSync(new URL('../../site/css/family.css', import.meta.url), 'utf8');
  assert.match(css, /url\("\.\.\/fonts\/josefin-sans-600\.woff2"\)/);
  assert.doesNotMatch(css, /https?:\/\//);
  assert.ok(existsSync(new URL('../../site/fonts/josefin-sans-600.woff2', import.meta.url)));
  assert.ok(existsSync(new URL('../../site/fonts/LICENSE-OFL.txt', import.meta.url)));
});
