// ════════════════════════════════════════════════════════
// activities/activities.js — Munta les activitats d'una pàgina
//
// pages/course-page.js només el carrega (import dinàmic) si la pàgina té
// algun problema de Parsons (.parsons) o algun qüestionari (.quiz).
//
// API pública:
//   mountActivities(root = document)
// ════════════════════════════════════════════════════════

import { mountParsons } from './parsons.js';
import { mountQuiz } from './quiz.js';

/** @param {ParentNode} [root] */
export function mountActivities(root = document) {
  for (const host of root.querySelectorAll('.parsons')) mountParsons(host);
  for (const host of root.querySelectorAll('.quiz')) mountQuiz(host);
}
