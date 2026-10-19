// ════════════════════════════════════════════════════════
// course/backup.js — Exportar i importar el progrés (mòdul pur)
//
// Els ordinadors de l'escola són compartits i sovint s'esborren
// (docs/BLUEPRINT.md §4.12): l'alumne es pot endur el que ha fet en un
// fitxer JSON i tornar-lo a posar en un altre navegador.
//
// El fitxer porta totes les dades d'HTMLCat (docs/STATE.md §2.5), sense
// el prefix «htmlcat:v1:»:
//   { format: 'htmlcat-progres', versio: 1, exportat: '2026-10-19T…',
//     dades: { progress: {…}, 'code:c01-exercici': {…}, … } }
//
// Importar no esborra mai res: els exercicis superats se sumen (es
// conserva el moment de la primera vegada) i, per a cada codi, es queda
// el més recent. Les entrades que no tenen la forma esperada s'ignoren i
// es compten.
//
// Les funcions reben l'emmagatzematge (localStorage, o un de fals als
// tests): getItem, setItem, key(i), length.
//
// API pública:
//   collectBackup(storage, now?)  → objecte del fitxer
//   parseBackup(text)             → { ok: true, dades, resum } | { ok: false, error }
//   mergeBackup(storage, dades)   → { exercicis, codis }  (quants n'han entrat de nous)
//   backupFileName(date?)         → 'htmlcat-progres-2026-10-19.json'
// ════════════════════════════════════════════════════════

import { PREFIX } from '../util/storage.js';

export const FORMAT = 'htmlcat-progres';
export const VERSION = 1;
const MAX_BYTES = 5_000_000;
const CODE_KEY = /^code:[\w.:-]{1,80}$/;

function readJson(storage, key) {
  try {
    const raw = storage.getItem(PREFIX + key);
    return raw === null || raw === undefined ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function isProgress(value) {
  return isPlainObject(value) && isPlainObject(value.goals) &&
    Object.values(value.goals).every((time) => Number.isFinite(time) && time > 0);
}

function isCode(value) {
  return isPlainObject(value) && isPlainObject(value.files) &&
    Object.entries(value.files).every(([name, text]) => /^[\w.-]{1,40}$/.test(name) && typeof text === 'string') &&
    (value.savedAt === undefined || Number.isFinite(value.savedAt));
}

/**
 * @param {Storage} storage
 * @param {number} [now]
 */
export function collectBackup(storage, now = Date.now()) {
  const dades = {};
  for (let i = 0; i < storage.length; i++) {
    const fullKey = storage.key(i);
    if (!fullKey || !fullKey.startsWith(PREFIX)) continue;
    const key = fullKey.slice(PREFIX.length);
    const value = readJson(storage, key);
    if ((key === 'progress' && isProgress(value)) || (CODE_KEY.test(key) && isCode(value))) dades[key] = value;
  }
  return { format: FORMAT, versio: VERSION, exportat: new Date(now).toISOString(), dades };
}

/**
 * @param {string} text el contingut del fitxer
 * @returns {{ ok: true, dades: Object, resum: { exercicis: number, codis: number, ignorats: number } }
 *          | { ok: false, error: 'massa-gran'|'no-json'|'no-htmlcat'|'versio' }}
 */
export function parseBackup(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) return { ok: false, error: 'massa-gran' };
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    return { ok: false, error: 'no-json' };
  }
  if (!isPlainObject(file) || file.format !== FORMAT || !isPlainObject(file.dades)) return { ok: false, error: 'no-htmlcat' };
  if (file.versio !== VERSION) return { ok: false, error: 'versio' };

  const dades = {};
  let ignorats = 0;
  for (const [key, value] of Object.entries(file.dades)) {
    if ((key === 'progress' && isProgress(value)) || (CODE_KEY.test(key) && isCode(value))) dades[key] = value;
    else ignorats++;
  }
  const exercicis = dades.progress ? Object.keys(dades.progress.goals).length : 0;
  const codis = Object.keys(dades).filter((key) => key.startsWith('code:')).length;
  return { ok: true, dades, resum: { exercicis, codis, ignorats } };
}

/**
 * Afegeix les dades d'un fitxer (ja validades amb parseBackup) a les que hi ha.
 *
 * @param {Storage} storage
 * @param {Object} dades
 * @returns {{ exercicis: number, codis: number }}
 */
export function mergeBackup(storage, dades) {
  const result = { exercicis: 0, codis: 0 };
  if (dades.progress) {
    const current = readJson(storage, 'progress');
    const goals = isProgress(current) ? { ...current.goals } : {};
    for (const [goal, time] of Object.entries(dades.progress.goals)) {
      if (!goals[goal]) result.exercicis++;
      goals[goal] = goals[goal] ? Math.min(goals[goal], time) : time;
    }
    storage.setItem(PREFIX + 'progress', JSON.stringify({ goals }));
  }
  for (const [key, value] of Object.entries(dades)) {
    if (!key.startsWith('code:')) continue;
    const current = readJson(storage, key);
    if (isCode(current) && (current.savedAt || 0) >= (value.savedAt || 0)) continue;
    storage.setItem(PREFIX + key, JSON.stringify(value));
    result.codis++;
  }
  return result;
}

/** @param {Date} [date] */
export function backupFileName(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `htmlcat-progres-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}
