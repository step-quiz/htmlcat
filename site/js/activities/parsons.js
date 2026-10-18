// ════════════════════════════════════════════════════════
// activities/parsons.js — Problema de Parsons: ordena i indenta el codi
//
// Marcatge (docs/STATE.md §2.10):
//   <div class="parsons" data-goal-id="cap-3-parsons">
//     <p class="parsons-enunciat">Què ha de fer el codi…</p>
//     <pre class="parsons-codi">…la solució, indentada amb 2 espais…</pre>
//   </div>
//
// El <pre> (la solució) es treu de la pàgina i les línies es mostren
// barrejades (sempre igual per a un mateix goal-id) i sense indentar.
// L'alumne les mou (arrossegant o amb ↑ ↓) i les indenta (⇤ ⇥); tot es pot
// fer amb el teclat. «✓ Comprova» marca les línies que no són al seu lloc
// i, si està tot bé, desa l'activitat com a superada (course/progress.js).
//
// API pública:
//   mountParsons(el)
// ════════════════════════════════════════════════════════

import { t } from '../i18n/ca.js';
import { isGoalCompleted, saveGoalCompleted } from '../course/progress.js';
import { MAX_LEVEL, checkLines, parseSolution, shuffledOrder } from './parsons-model.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(className, text, label) {
  const b = el('button', className, text);
  b.type = 'button';
  if (label) {
    b.title = label;
    b.setAttribute('aria-label', label);
  }
  return b;
}

/** @param {HTMLElement} host */
export function mountParsons(host) {
  const pre = host.querySelector('.parsons-codi');
  if (!pre) return;
  const goalId = host.dataset.goalId || '';
  const solution = parseSolution(pre.textContent);
  pre.remove();
  const start = shuffledOrder(solution, goalId);
  let state = [];

  const list = el('ol', 'parsons-llista');
  list.setAttribute('aria-label', t('parsons.list'));
  const actions = el('div', 'activitat-accions');
  const check = button('boto boto--petit', t('parsons.check'));
  const reset = button('boto boto--petit boto--secundari', t('parsons.reset'));
  actions.append(check, reset);
  const feedback = el('p', 'activitat-resultat');
  feedback.setAttribute('role', 'status');
  if (goalId && isGoalCompleted(goalId)) showFeedback(t('activity.done.before'), 'ok');
  host.append(list, actions, feedback);

  function showFeedback(text, kind = '') {
    feedback.textContent = text;
    feedback.className = 'activitat-resultat' + (kind ? ` activitat-resultat--${kind}` : '');
  }

  function restart() {
    state = start.map((index) => ({ text: solution[index].text, level: 0 }));
    render();
  }

  function move(from, to) {
    if (to < 0 || to >= state.length) return;
    const [line] = state.splice(from, 1);
    state.splice(to, 0, line);
  }

  // Després de cada canvi, el focus torna al mateix botó de la línia moguda
  function act(change, focusAt) {
    change();
    if (feedback.classList.contains('activitat-resultat--ko')) showFeedback('');
    render();
    if (focusAt) list.children[focusAt.index]?.querySelector(`[data-accio="${focusAt.action}"]`)?.focus();
  }

  let dragged = null;
  function render(wrong = []) {
    list.textContent = '';
    state.forEach((line, i) => {
      const item = el('li', 'parsons-linia' + (wrong[i] ? ' parsons-linia--malament' : ''));
      item.dataset.nivell = String(line.level);
      item.draggable = true;
      const code = el('code', 'parsons-linia__codi', line.text);
      const buttons = el('span', 'parsons-linia__botons');
      const controls = [
        ['desindenta', '⇤', t('parsons.dedent'), () => { line.level = Math.max(0, line.level - 1); }, i],
        ['indenta', '⇥', t('parsons.indent'), () => { line.level = Math.min(MAX_LEVEL, line.level + 1); }, i],
        ['puja', '↑', t('parsons.up'), () => move(i, i - 1), Math.max(0, i - 1)],
        ['baixa', '↓', t('parsons.down'), () => move(i, i + 1), Math.min(state.length - 1, i + 1)],
      ];
      for (const [action, symbol, label, change, focusIndex] of controls) {
        const b = button('parsons-linia__boto', symbol, t('parsons.button.label', { action: label, line: line.text }));
        b.dataset.accio = action;
        b.addEventListener('click', () => act(change, { index: focusIndex, action }));
        buttons.append(b);
      }
      item.append(code, buttons);

      // Arrossegar amb el ratolí (el teclat fa servir els botons)
      item.addEventListener('dragstart', (e) => {
        dragged = i;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(i));
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        item.classList.add('parsons-linia--sobre');
      });
      item.addEventListener('dragleave', () => item.classList.remove('parsons-linia--sobre'));
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragged !== null && dragged !== i) act(() => move(dragged, i));
        dragged = null;
      });
      item.addEventListener('dragend', () => { dragged = null; });
      list.append(item);
    });
  }

  check.addEventListener('click', () => {
    const { wrong, orderOk, solved } = checkLines(state, solution);
    render(wrong);
    if (solved) {
      showFeedback(t('parsons.ok'), 'ok');
      if (goalId) saveGoalCompleted(goalId);
      return;
    }
    const n = wrong.filter(Boolean).length;
    const lines = n === 1 ? t('parsons.lines.one') : t('parsons.lines', { n });
    showFeedback(t(orderOk ? 'parsons.wrong.indent' : 'parsons.wrong.order', { lines }), 'ko');
  });
  reset.addEventListener('click', () => {
    showFeedback('');
    restart();
  });

  restart();
}
