// ════════════════════════════════════════════════════════
// checks/checks.js — Avalua les comprovacions d'un exercici
//
// Les comprovacions (format a checks/schema.js) s'avaluen sobre el
// document que ha construït el navegador amb el codi de l'alumne (DOM,
// estils calculats i posició de les caixes d'un iframe ocult) i sobre el
// codi font (uses-html, uses-css, lint). No toca el DOM fins que es crida:
// es pot importar des de Node.
//
// API pública:
//   runChecks({ doc, files, mode, chapter, checks, env }) → Result[]
//   Result: { check, passed, detail }   detail: precisió en català o ''
// ════════════════════════════════════════════════════════

import { tokenizeHtml } from '../lang/html-tokenizer.js';
import { parseCss } from '../lang/css-parser.js';
import { lintStatic } from '../lint/lint.js';
import { t } from '../i18n/ca.js';

const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const compact = (text) => text.replace(/\s+/g, '');
const shorten = (text) => (text.length > 60 ? text.slice(0, 57) + '…' : text);

/** Compara un text amb equals / includes / matches (ci: sense distingir majúscules). */
function matchesText(actual, check) {
  if ('matches' in check) return new RegExp(check.matches, check.ci ? 'i' : '').test(actual);
  const fold = (text) => (check.ci ? text.toLowerCase() : text);
  return 'equals' in check ? fold(actual) === fold(check.equals) : fold(actual).includes(fold(check.includes));
}

// Elements del selector, o null si el selector està mal escrit
function select(doc, selector) {
  try {
    return [...doc.querySelectorAll(selector)];
  } catch {
    return null;
  }
}

// Els elements que cal mirar: el primer, o tots amb «all»
function targets(check, ctx) {
  const found = select(ctx.doc, check.selector);
  if (!found) return { error: t('checks.detail.invalid') };
  if (!found.length) return { error: t('checks.detail.none') };
  return { elements: check.all ? found : found.slice(0, 1) };
}

/**
 * Avalua amb el marc ocult a una altra amplada (width: 360, com un mòbil):
 * el navegador torna a fer la maqueta i els @media a l'instant. Després
 * el deixa com estava.
 */
function atWidth(check, ctx, evaluate) {
  const frame = check.width && ctx.doc.defaultView?.frameElement;
  if (!frame) return evaluate();
  const before = frame.style.width;
  frame.style.width = `${check.width}px`;
  try {
    return evaluate();
  } finally {
    frame.style.width = before;
  }
}

// Cada avaluador retorna { passed, detail? }
const EVALUATORS = {
  exists(check, ctx) {
    const found = select(ctx.doc, check.selector);
    if (!found) return { passed: false, detail: t('checks.detail.invalid') };
    return { passed: found.length > 0 };
  },

  count(check, ctx) {
    const found = select(ctx.doc, check.selector);
    if (!found) return { passed: false, detail: t('checks.detail.invalid') };
    const n = found.length;
    const passed = 'eq' in check ? n === check.eq
      : (check.min === undefined || n >= check.min) && (check.max === undefined || n <= check.max);
    return { passed, detail: t('checks.detail.count', { n }) };
  },

  text(check, ctx) {
    const { elements, error } = targets(check, ctx);
    if (error) return { passed: false, detail: error };
    const wrong = elements.find((el) => !matchesText(normalize(el.textContent), check));
    return wrong ? { passed: false, detail: t('checks.detail.text', { text: shorten(normalize(wrong.textContent)) }) } : { passed: true };
  },

  attr(check, ctx) {
    const { elements, error } = targets(check, ctx);
    if (error) return { passed: false, detail: error };
    for (const el of elements) {
      const value = el.getAttribute(check.name);
      if (value === null) return { passed: false, detail: t('checks.detail.attr.missing', { name: check.name }) };
      const ok = check.present || (check.nonEmpty ? Boolean(value.trim()) : matchesText(value, check));
      if (!ok) return { passed: false, detail: t('checks.detail.attr.value', { value: shorten(value) }) };
    }
    return { passed: true };
  },

  // L'estil calculat de l'element es compara amb el d'un element de prova,
  // germà seu, amb el valor demanat: així el navegador normalitza els dos
  // valors igual (teal = rgb(0, 128, 128), 2em = 32px…).
  style(check, ctx) {
    const { elements, error } = targets(check, ctx);
    if (error) return { passed: false, detail: error };
    for (const el of elements) {
      const view = el.ownerDocument.defaultView;
      const probe = el.ownerDocument.createElement(el.localName);
      probe.style.setProperty(check.prop, check.equals);
      el.after(probe);
      const expected = view.getComputedStyle(probe).getPropertyValue(check.prop);
      probe.remove();
      const actual = view.getComputedStyle(el).getPropertyValue(check.prop);
      if (actual !== expected) return { passed: false, detail: t('checks.detail.style', { value: actual }) };
    }
    return { passed: true };
  },

  // On són les caixes (getBoundingClientRect, al marc ocult de 800 × 600,
  // o de l'amplada que demani «width»):
  // row / column: tots els elements, en ordre, un a la dreta (o a sota) de
  // l'anterior i a la mateixa altura (o columna); centered-x / centered-y:
  // centrat dins del pare; fits-width: no surt per la dreta de la pàgina.
  layout(check, ctx) {
    const tolerance = check.tolerance ?? 2;
    if (check.kind === 'row' || check.kind === 'column') {
      const found = select(ctx.doc, check.selector);
      if (!found) return { passed: false, detail: t('checks.detail.invalid') };
      if (found.length < 2) return { passed: false, detail: t('checks.detail.layout.few', { n: found.length }) };
      const boxes = found.map((el) => el.getBoundingClientRect());
      const row = check.kind === 'row';
      for (let i = 1; i < boxes.length; i++) {
        const [a, b] = [boxes[i - 1], boxes[i]];
        const after = row ? b.left >= a.right - tolerance : b.top >= a.bottom - tolerance;
        const beside = row ? b.top < a.bottom && a.top < b.bottom : b.left < a.right && a.left < b.right;
        if (!after || !beside) return { passed: false, detail: t(`checks.detail.layout.${check.kind}`, { n: i + 1 }) };
      }
      return { passed: true };
    }
    const { elements, error } = targets({ ...check, all: true }, ctx);
    if (error) return { passed: false, detail: error };
    for (const el of elements) {
      const box = el.getBoundingClientRect();
      if (check.kind === 'fits-width') {
        const overflow = Math.round(box.right - el.ownerDocument.documentElement.clientWidth);
        if (overflow > tolerance) return { passed: false, detail: t('checks.detail.layout.overflow', { n: overflow }) };
        continue;
      }
      const parent = el.parentElement.getBoundingClientRect();
      const [before, after] = check.kind === 'centered-x'
        ? [box.left - parent.left, parent.right - box.right]
        : [box.top - parent.top, parent.bottom - box.bottom];
      if (Math.abs(before - after) > tolerance) {
        return { passed: false, detail: t(`checks.detail.layout.${check.kind}`, { before: Math.round(before), after: Math.round(after) }) };
      }
    }
    return { passed: true };
  },

  // Al codi font (no al DOM: el navegador hi afegeix elements, com <tbody>)
  'uses-html'(check, ctx) {
    const passed = htmlSources(ctx.files).some((src) => tokenizeHtml(src).some((token) =>
      token.type === 'startTag' &&
      (!check.tag || token.name === check.tag) &&
      (!check.attr || token.attrs.some((a) => a.name === check.attr))));
    return { passed };
  },

  'uses-css'(check, ctx) {
    const prop = check.prop.toLowerCase();
    const passed = cssSources(ctx.files).some((css) => styleRules(parseCss(css).rules).some((rule) =>
      selectorMatches(rule, check) && rule.declarations.some((decl) =>
        decl.property.text.toLowerCase() === prop &&
        (check.value === undefined || (decl.value && normalize(decl.value.text) === normalize(check.value))) &&
        (check.valueIncludes === undefined || (decl.value && compact(decl.value.text).includes(compact(check.valueIncludes)))))));
    return { passed };
  },

  lint(check, ctx) {
    const problems = lintStatic({ files: ctx.files, mode: ctx.mode, chapter: ctx.chapter, env: ctx.env })
      .filter((p) => !check.rules || check.rules.includes(p.rule));
    const errors = problems.filter((p) => p.severity === 'error').length;
    const warnings = problems.filter((p) => p.severity === 'warning').length;
    const passed = errors <= (check.maxErrors ?? 0) && (check.maxWarnings === undefined || warnings <= check.maxWarnings);
    return { passed, detail: passed ? '' : t('checks.detail.lint', { errors, warnings }) };
  },
};

const htmlSources = (files) => Object.keys(files).filter((name) => !name.endsWith('.css')).map((name) => files[name]);

/** Fitxers CSS i contingut dels <style> de l'HTML. */
function cssSources(files) {
  const sources = Object.keys(files).filter((name) => name.endsWith('.css')).map((name) => files[name]);
  for (const src of htmlSources(files)) {
    const tokens = tokenizeHtml(src);
    tokens.forEach((token, i) => {
      if (token.raw && tokens[i - 1].name === 'style') sources.push(src.slice(token.start, token.end));
    });
  }
  return sources;
}

function* styleRules(list) {
  for (const rule of list) {
    if (rule.type === 'style') yield rule;
    if (rule.rules) yield* styleRules(rule.rules);
  }
}

function selectorMatches(rule, check) {
  const selectors = rule.selectors.map((s) => normalize(s.text));
  if (check.selector !== undefined) return selectors.includes(normalize(check.selector));
  if (check.matches !== undefined) return selectors.some((s) => new RegExp(check.matches).test(s));
  return true;
}

/**
 * @param {{ doc: Document, files: Record<string,string>, mode?: string,
 *           chapter?: number, checks: Array<Object>, env?: Object }} options
 * @returns {Array<{ check: Object, passed: boolean, detail: string }>}
 */
export function runChecks({ doc, files, mode = 'fragment', chapter = Infinity, checks, env = {} }) {
  const ctx = { doc, files, mode, chapter, env };
  return checks.map((check) => {
    const evaluate = EVALUATORS[check.type];
    if (!evaluate) return { check, passed: false, detail: t('checks.detail.invalid') };
    const { passed, detail = '' } = atWidth(check, ctx, () => evaluate(check, ctx));
    return { check, passed, detail };
  });
}
