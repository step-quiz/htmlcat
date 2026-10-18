// ════════════════════════════════════════════════════════
// activities/quiz.js — Qüestionari d'opció múltiple
//
// Marcatge (docs/STATE.md §2.10):
//   <div class="quiz" data-goal-id="cap-2-quiz">
//     <div class="quiz-q" data-correcta="2">
//       <p>Quina etiqueta fa servir per a un text important?</p>
//       <ol class="quiz-opcions"><li>&lt;b&gt;</li><li>&lt;strong&gt;</li></ol>
//       <p class="quiz-explica">&lt;strong&gt; indica importància…</p>
//     </div>
//   </div>
//
// data-correcta és la posició (1, 2…) de la resposta bona. Cada opció es
// converteix en un botó: una de dolenta es ratlla i es pot tornar a provar;
// la bona mostra l'explicació. Quan totes les preguntes tenen la resposta
// bona, l'activitat queda superada (course/progress.js).
//
// API pública:
//   mountQuiz(el)
// ════════════════════════════════════════════════════════

import { t } from '../i18n/ca.js';
import { isGoalCompleted, saveGoalCompleted } from '../course/progress.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** @param {HTMLElement} host */
export function mountQuiz(host) {
  const goalId = host.dataset.goalId || '';
  const questions = [...host.querySelectorAll('.quiz-q')];
  const firstTry = questions.map(() => null);   // null: sense resoldre; true: bé a la primera
  const feedback = el('p', 'activitat-resultat');
  feedback.setAttribute('role', 'status');
  if (goalId && isGoalCompleted(goalId)) {
    feedback.textContent = t('activity.done.before');
    feedback.classList.add('activitat-resultat--ok');
  }

  questions.forEach((question, qi) => {
    const correct = Number(question.dataset.correcta) - 1;
    const explanation = question.querySelector('.quiz-explica');
    if (explanation) explanation.hidden = true;
    const status = el('p', 'quiz-estat');
    status.setAttribute('role', 'status');
    const number = el('p', 'quiz-num', t('quiz.num', { n: qi + 1, total: questions.length }));
    question.prepend(number);
    let failed = false;

    const options = [...question.querySelectorAll('.quiz-opcions > li')];
    options.forEach((item, oi) => {
      const b = el('button', 'quiz-opcio');
      b.type = 'button';
      b.append(...item.childNodes);
      item.append(b);
      b.addEventListener('click', () => {
        if (firstTry[qi] !== null) return;
        if (oi === correct) {
          b.classList.add('quiz-opcio--bona');
          firstTry[qi] = !failed;
          for (const other of options) other.querySelector('button').disabled = true;
          status.textContent = t('quiz.right');
          if (explanation) explanation.hidden = false;
          finish();
        } else {
          failed = true;
          b.classList.add('quiz-opcio--dolenta');
          b.disabled = true;
          status.textContent = t('quiz.wrong');
        }
      });
    });
    question.querySelector('.quiz-opcions')?.after(status);
  });
  host.append(feedback);

  function finish() {
    if (firstTry.includes(null)) return;
    const n = firstTry.filter(Boolean).length;
    feedback.textContent = t('quiz.done', { n, total: questions.length });
    feedback.className = 'activitat-resultat activitat-resultat--ok';
    if (goalId) saveGoalCompleted(goalId);
  }
}
