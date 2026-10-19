// Tests de site/js/course/backup.js (exportar i importar el progrés)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectBackup, parseBackup, mergeBackup, backupFileName, FORMAT } from '../../site/js/course/backup.js';
import { PREFIX } from '../../site/js/util/storage.js';

class FakeStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
}
const json = (value) => JSON.stringify(value);
const read = (storage, key) => JSON.parse(storage.getItem(PREFIX + key));

test('exporta només les dades d\'HTMLCat, sense el prefix', () => {
  const storage = new FakeStorage({
    [PREFIX + 'progress']: json({ goals: { 'cap-1-ex': 100 } }),
    [PREFIX + 'code:c01-exercici']: json({ files: { 'index.html': '<p>Hola</p>' }, savedAt: 5 }),
    [PREFIX + 'code:malmès']: '{no és json',
    'altre-web': 'res',
  });
  const backup = collectBackup(storage, Date.UTC(2026, 9, 19));
  assert.equal(backup.format, FORMAT);
  assert.equal(backup.versio, 1);
  assert.equal(backup.exportat, '2026-10-19T00:00:00.000Z');
  assert.deepEqual(Object.keys(backup.dades).sort(), ['code:c01-exercici', 'progress']);
});

test('el que s\'exporta es pot tornar a llegir', () => {
  const storage = new FakeStorage({ [PREFIX + 'progress']: json({ goals: { 'cap-2-ex': 7 } }) });
  const parsed = parseBackup(JSON.stringify(collectBackup(storage)));
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.resum, { exercicis: 1, codis: 0, ignorats: 0 });
});

test('rebutja els fitxers que no són d\'HTMLCat', () => {
  assert.deepEqual(parseBackup('hola'), { ok: false, error: 'no-json' });
  assert.deepEqual(parseBackup('{"a":1}'), { ok: false, error: 'no-htmlcat' });
  assert.deepEqual(parseBackup(json({ format: FORMAT, versio: 2, dades: {} })), { ok: false, error: 'versio' });
  assert.deepEqual(parseBackup('x'.repeat(5_000_001)), { ok: false, error: 'massa-gran' });
});

test('ignora (i compta) les entrades amb una forma estranya', () => {
  const parsed = parseBackup(json({ format: FORMAT, versio: 1, dades: {
    progress: { goals: { 'cap-1-ex': 1 } },
    'code:ok': { files: { 'index.html': '' }, savedAt: 1 },
    'code:dolent': { files: { 'index.html': 3 } },
    'galetes': { x: 1 },
  } }));
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.resum, { exercicis: 1, codis: 1, ignorats: 2 });
});

test('importar suma els exercicis i conserva la primera data', () => {
  const storage = new FakeStorage({ [PREFIX + 'progress']: json({ goals: { 'cap-1-ex': 50, 'cap-2-ex': 10 } }) });
  const result = mergeBackup(storage, { progress: { goals: { 'cap-1-ex': 20, 'cap-3-ex': 30 } } });
  assert.deepEqual(result, { exercicis: 1, codis: 0 });
  assert.deepEqual(read(storage, 'progress').goals, { 'cap-1-ex': 20, 'cap-2-ex': 10, 'cap-3-ex': 30 });
});

test('de cada codi es queda el més nou; mai no s\'esborra res', () => {
  const storage = new FakeStorage({
    [PREFIX + 'code:a']: json({ files: { 'index.html': 'nou' }, savedAt: 200 }),
    [PREFIX + 'code:b']: json({ files: { 'index.html': 'vell' }, savedAt: 100 }),
    [PREFIX + 'code:c']: json({ files: { 'index.html': 'només aquí' }, savedAt: 1 }),
  });
  const result = mergeBackup(storage, {
    'code:a': { files: { 'index.html': 'vell del fitxer' }, savedAt: 150 },
    'code:b': { files: { 'index.html': 'nou del fitxer' }, savedAt: 300 },
    'code:d': { files: { 'index.html': 'nou' }, savedAt: 5 },
  });
  assert.deepEqual(result, { exercicis: 0, codis: 2 });
  assert.equal(read(storage, 'code:a').files['index.html'], 'nou');
  assert.equal(read(storage, 'code:b').files['index.html'], 'nou del fitxer');
  assert.equal(read(storage, 'code:c').files['index.html'], 'només aquí');
  assert.equal(read(storage, 'code:d').files['index.html'], 'nou');
});

test('nom del fitxer amb la data', () => {
  assert.equal(backupFileName(new Date(2026, 0, 5)), 'htmlcat-progres-2026-01-05.json');
});
