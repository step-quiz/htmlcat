// Tests de site/js/activities/parsons-model.js (problemes de Parsons)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INDENT, MAX_LEVEL, checkLines, parseSolution, shuffledOrder } from '../../site/js/activities/parsons-model.js';

const LLISTA = `<ul>
  <li>Fruita
    <ul>
      <li>Pomes</li>
    </ul>
  </li>

  <li>Verdura</li>
</ul>`;

test('parseSolution: una entrada per línia no buida, amb el nivell (2 espais per nivell)', () => {
  const lines = parseSolution(LLISTA);
  assert.equal(INDENT, 2);
  assert.deepEqual(lines.map((l) => l.level), [0, 1, 2, 3, 2, 1, 1, 0]);
  assert.equal(lines[3].text, '<li>Pomes</li>');
  assert.ok(lines.every((l) => l.text === l.text.trim()));
  assert.equal(parseSolution('a\r\n  b\r\n').length, 2);
  assert.equal(parseSolution(' '.repeat(40) + 'x')[0].level, MAX_LEVEL);
});

test('shuffledOrder: sempre la mateixa barreja per a la mateixa llavor, mai l\'ordre bo', () => {
  const lines = parseSolution(LLISTA);
  const a = shuffledOrder(lines, 'cap-3-parsons');
  assert.deepEqual(a, shuffledOrder(lines, 'cap-3-parsons'));
  assert.deepEqual([...a].sort((x, y) => x - y), lines.map((_, i) => i));
  for (const seed of ['a', 'b', 'cap-1-parsons', 'cap-9-parsons', '']) {
    const order = shuffledOrder(lines, seed);
    assert.ok(order.some((index, pos) => lines[index].text !== lines[pos].text), seed);
  }
  // Dues línies diferents: sempre girades
  assert.deepEqual(shuffledOrder(parseSolution('a\nb'), 'x'), [1, 0]);
  // Totes iguals: no hi ha res a barrejar
  assert.deepEqual(shuffledOrder(parseSolution('a\na'), 'x'), [0, 1]);
});

test('checkLines: marca les línies fora de lloc o mal indentades; les línies iguals són intercanviables', () => {
  const solution = parseSolution(LLISTA);
  const good = solution.map((l) => ({ ...l }));
  assert.deepEqual(checkLines(good, solution), { wrong: good.map(() => false), orderOk: true, solved: true });

  const indent = good.map((l, i) => ({ ...l, level: i === 3 ? 1 : l.level }));
  const r1 = checkLines(indent, solution);
  assert.equal(r1.solved, false);
  assert.equal(r1.orderOk, true);
  assert.deepEqual(r1.wrong.map((w, i) => (w ? i : -1)).filter((i) => i >= 0), [3]);

  const swapped = [...good];
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const r2 = checkLines(swapped, solution);
  assert.equal(r2.orderOk, false);
  assert.equal(r2.solved, false);

  // Els dos </ul> (o </li>) són iguals: intercanviar-los no és cap error
  // (l'alumne pot haver posat al lloc 4 la línia que la barreja havia tret com a última)
  const same = [...good];
  [same[4], same[7]] = [{ ...same[7], level: same[4].level }, { ...same[4], level: same[7].level }];
  assert.equal(same[4].text, same[7].text);
  assert.equal(checkLines(same, solution).solved, true);
});
