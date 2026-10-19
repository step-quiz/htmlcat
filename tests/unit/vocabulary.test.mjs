// Tests de site/js/course/vocabulary.js (el vocabulari del glossari)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VOCABULARI, TIPUS, vocabularyUntil } from '../../site/js/course/vocabulary.js';
import { CAPITOLS } from '../../site/js/course/data.js';

test('cada entrada té tipus, capítol existent i una definició d\'una frase', () => {
  const capitols = new Set(CAPITOLS.map((c) => c.num));
  for (const entry of VOCABULARI) {
    assert.ok(entry.tipus in TIPUS, `${entry.terme}: tipus ${entry.tipus}`);
    assert.ok(capitols.has(entry.capitol), `${entry.terme}: capítol ${entry.capitol}`);
    assert.ok(entry.terme.trim(), 'terme buit');
    assert.match(entry.def, /^\S.*[.!?)]$/, `${entry.terme}: la definició ha de ser una frase acabada`);
  }
});

test('cap terme repetit dins del mateix tipus', () => {
  const seen = new Set();
  for (const entry of VOCABULARI) {
    const key = `${entry.tipus}|${entry.terme}`;
    assert.ok(!seen.has(key), key);
    seen.add(key);
  }
});

test('tots els capítols de la part A i B hi aporten vocabulari', () => {
  for (const capitol of CAPITOLS.filter((c) => c.num <= 14)) {
    assert.ok(VOCABULARI.some((e) => e.capitol === capitol.num), `capítol ${capitol.num} sense vocabulari`);
  }
});

test('vocabularyUntil només dona el que ja s\'ha ensenyat, per ordre alfabètic', () => {
  const fins3 = vocabularyUntil(3);
  assert.ok(fins3.every((e) => e.capitol <= 3));
  assert.ok(fins3.some((e) => e.terme === '<li>'));
  assert.ok(!fins3.some((e) => e.terme === '<a>'));
  const claus = fins3.map((e) => e.terme.replace(/^[<#.@!]+/, '').toLowerCase());
  assert.deepEqual(claus, [...claus].sort((a, b) => a.localeCompare(b, 'ca')));
});
