# HANDOFF — start here (for a Claude session with no prior context)

Last updated: 2026-10-05 (family icon selector), after chapter 14 (phase 5, content): parts A (HTML) and B (CSS) are complete; the final project (chapter 15) and the challenges are next.
Keep it short and current: when you finish a phase, rewrite the "Where we are" and
"Next task" sections.

## 1. What this is

HTMLCat: a static, build-free course (HTML + CSS + clean code) for 15-year-olds,
in Catalan, deployed by Cloudflare Pages from `main` (output dir `site/`,
`htmlcat.pages.dev`). Sibling projects: `step-quiz/pycat`, `step-quiz/jscat`.

Canonical repository: **`step-quiz2/htmlcat2`** (confirmed by the owner, 2026-10-02).
The history of phases 0–2 (PRs #1–#4) lives in the old repository; the code was
copied here by a GitHub web upload, which dropped every dot-file (see §6).

## 2. Read in this order

1. `CLAUDE.md` — constraints and the working agreement with the owner (short).
2. `docs/STATE.md` — single source of truth: files, module contracts (§2.1–2.5),
   decisions (§3, incl. pending D3, D4, D6–D12), tests (§4), deploy (§5), task list (§6).
3. `docs/BLUEPRINT.md` — design for everything not built yet. Phase 3 = §4.7 + Appendix C
   (lint rule catalogue); phase 4 = §4.8–4.13, §5, §8.
4. `docs/CURRICULUM.md` — only when writing content.

## 3. Where we are

- Phase 0 ✅ repo, licence, CI (`.github/workflows/ci.yml`, restored after the move).
- Phase 1 ✅ `site/js/lang/` (HTML tokenizer, source tree with structural problems,
  tolerant CSS parser) + `site/js/editor/highlight.js`.
- Phase 2 ✅ editor (`editor/editor.js`, `editing.js`), sandboxed preview
  (`preview/preview.js`, `srcdoc.js`), simulator component (`sim/simulador.js`),
  free editor at `site/editor/`, asset pack `site/recursos/`.
- Phase 3 ✅ linter (`site/js/lint/`: 35 rules at the end of phase 3, 81 after chapter 14; Catalan messages, STATE §2.6)
  and the "⚠ Problemes" panel (`sim/problems-panel.js`, STATE §2.4).
- Phase 4 ✅ course shell (`site/js/course/`: data, progress, shell; STATE §2.8), checks DSL v1
  (`site/js/checks/`, "✓ Comprova", hidden 800×600 check frame; STATE §2.7) and chapter 1
  (`site/curs/capitol-1.html`, exercises `cap-1-ex` and `cap-1-bug`, solutions in `tests/solutions/`).
- Phase 5 (content, one chapter per PR): chapters 1–14 done (`site/curs/capitol-N.html`,
  exercises `cap-N-ex` and `cap-N-bug`); chapter 4 added six link rules, chapter 5 six
  image/attribute rules (per-element attributes in `lang/html-spec.js`), chapter 6 four
  page-structure rules, chapter 7 five table rules (`html/th-scope` is the first `info`
  rule; enumerated attribute values live in `ENUMERATED_ATTRIBUTES`, STATE §2.6), chapter 8 two
  form rules, chapter 9 three CSS rules (`css/wrong-comment`, `css/unknown-element-selector`,
  `html/stylesheet-link`; HTML rules now get `ctx.fileNames`), chapter 10 six selector/cascade
  rules (`css/selector-matches-nothing` is static: CSS rules get `ctx.page` with the classes and
  ids of the simulator's HTML). Chapter 7 simulators carry a read-only `estils.css` so table borders show (CSS is
  taught in part B). Form simulators use `data-forms`; the preview CSP has `form-action 'none'`
  (second layer behind the submit interception) and the free editor accepts forms too. From chapter 6 on, exercises are full documents
  (`data-mode="document"`, D3), and `html/single-main` warns when a document has no `<main>`:
  every example document from chapter 6 on must have one (the free editor's starter code too).
  `html/image-not-found` is static: student images can only come from `site/recursos/`,
  listed in `site/js/preview/recursos.js` (a static test keeps list, files and
  `site/recursos/CREDITS.md` in sync; add a new image to all three). The browser test checks
  that, in every simulator, the images the browser cannot show match the panel's
  `html/image-not-found` entries.
  Chapter 11 added `lang/css-colors.js` (parses names, `#hex`, `rgb()`, `hsl()` exactly like
  Chromium, WCAG contrast), four rules (`css/generic-font-family`, `css/undefined-variable`,
  `css/low-contrast`, `css/repeated-color`), more `css/invalid-value` hints (Catalan keywords,
  `1.5 rem`, missing `#`, bad hex length, `--x` without `var()`), CSS rules get `ctx.variables`
  (every custom property of the simulator's CSS), and `uses-css` got `valueIncludes`.
  `css/low-contrast` is static: same-rule `color` + background only (other pairs would give false
  warnings). So far no rule needs the rendered document.
  Chapter 12 added four box-model rules: `css/border-without-style` (`border: 2px red` draws
  nothing), `css/inline-dimensions` (`width`/`height`/vertical margins on inline elements; a
  class selector counts when the simulator's HTML gives that class to one inline element type,
  via `ctx.page.classElements`; silent if any rule in any sheet changes that element's `display`,
  `float` or `position`), `css/shorthand-override` (`margin-top: 1rem; margin: 0`) and
  `css/spacing-scale` (info, more than 4 spacing sizes); more `css/invalid-value` hints (commas
  between values, negative padding, more than 4 values). CSS rules now get `ctx.sheets` (every
  parsed sheet). A figure, `site/img/model-caixa.svg`, styled by `.figura` in `course.css`.
  Beware: a `style` check builds a probe element without the student's classes, so it cannot
  check `width` of an inline element or `margin: auto` (both resolve differently on the probe);
  check `display` or use `uses-css` with `valueIncludes` instead.
  Chapter 13 added the `layout` check (STATE §2.7: `row`, `column`, `centered-x`, `centered-y`,
  `fits-width`, measured with `getBoundingClientRect` in the hidden 800×600 check frame; unit
  tests use fake boxes), `css/flex-without-display` (container properties in a rule that is not
  a flex/grid container; silent when another rule makes a box with the same last-compound name
  flex) and `css/float-layout` (info; not for images), and keyword hints in `css/invalid-value`
  (`display: flexbox` → `flex`, closest keyword, or the list of values). `css/inline-dimensions`
  now treats children of flex/grid containers as boxes (`ctx.page.parentNames`).
  Chapter 14 added a `width` option to `style` and `layout` checks (the hidden check frame is
  resized for that check: layout and `@media` update synchronously, verified in Chromium; this
  replaces the planned `viewport` check), `html/viewport` (document mode: missing, not
  `width=device-width`, or no zoom), `css/invalid-media` (static validation of media queries with
  a feature/type list and a corrected query: Chromium's `matchMedia` keeps `(min-width: 600)` but
  it never matches), `css/fixed-width` (width > 360 px outside `@media (min-width)`) and
  `css/desktop-first` (info). The free editor, the root simulator and the landing page examples
  now include `<meta name="viewport">` (desktop browsers ignore it; it matters on phones).
  Next: chapter 15, «Projecte final» (a personal or club page with several sections, everything
  together; BLUEPRINT §5 says "all" rules). Then the 12 challenges (`docs/CURRICULUM.md` §2,
  each with `afterChapter`; `REPTES` in `course/data.js` is still empty, and the course shell
  already supports `repte-N.html` pages: STATE §2.8).
- Family icon selector (2026-10-05, STATE §2.9, D13): `site/js/family/family.js` + `site/css/family.css` put "EXPLORA" and the 4 Cat icons in the header of the **landing page only** (owner's decision: not in the free editor nor the chapters). Ported from JSCat's `family.js` as an ES module, with Josefin Sans self-hosted in `site/fonts/` (no Google Fonts: privacy of minors).
- Decisions D3, D4, D6–D12: the owner accepted all recommended options (STATE §3).
- 233 unit tests + static checks + browser checks (editor, panel and every exercise end-to-end), all green.
- Still pending from phase 0 (owner's job): confirm Cloudflare Pages deploys
  `step-quiz2/htmlcat2` (it was connected to the old repo); confirm `/tests/` and `/docs/`
  return 404 on the deployed site; add custom domain `htmlcat.step-quiz.net`.

## 4. Next task: phase 5 — content, one chapter per PR

Follow BLUEPRINT §9.3 (per-chapter workflow) and §5.5 (content rules); read
`docs/CURRICULUM.md` and `site/curs/capitol-1.html` (tone, structure, how examples,
"Errors típics", exercises and "Troba l'error" are written). For chapter N:

1. Add the entry to `CAPITOLS` (`site/js/course/data.js`) and write
   `site/curs/capitol-N.html` (STATE §2.8): examples, "Errors típics" (read-only
   simulators that look almost right while the Problems panel explains), the exercise
   `cap-N-ex` (+ optional `cap-N-bug`) with `data-checks` (STATE §2.7), "Codi net", "Resum".
2. Solutions in `tests/solutions/<goal-id>/`. The tests already check every exercise:
   starter fails, solution passes with no lint errors, progress persists.
3. Add the lint rules the chapter introduces (BLUEPRINT Appendix C; STATE §2.6), each
   with a positive and a negative case in `tests/unit/lint-rules.test.mjs`.
4. Chapters 2–5: fragment mode; from chapter 6, full documents (D3).
5. Update `docs/CURRICULUM.md` (status) and STATE; proofread the Catalan.

Still open: vocabulary/glossary/autocomplete,
progress export/import (phase 6).

## 5. How to work (owner's rules — see also CLAUDE.md)

- Reply to the owner in **Catalan**; give copy-paste steps when they must act.
- Branch → commit (Catalan, descriptive) → push → **open the PR yourself** → owner merges.
  If the session's assigned branch was already merged, restart it from `origin/main`.
- Never put `[skip ci]`, `[ci skip]` or `[cf-pages-skip]` in a commit message.
- Before pushing, run (from repo root):
  ```bash
  node --test tests/unit/*.test.mjs        # a directory argument does NOT work on Node 22
  node tests/course-static.mjs
  cd tests && npm ci && node course-browser.mjs
  ```
  In a Claude Code cloud container Chromium is preinstalled: do not run `playwright install`.

## 6. Lessons learned in phases 0–2 (avoid repeating)

- **The root `index.html` is the welcome page** (portada, since 2026-10-04: Capítols and Editor
  lliure; STATE §3). It was first the owner's free simulator, created through the GitHub web
  editor by pasting a whole shell heredoc, so the file began with `cat > index.html <<'EOF'` and
  ended with `EOF`. When you give the owner a file to paste, give the file content and the shell
  command separately. `course-static.mjs` checks it; `course-browser.mjs` serves the whole
  repository, as the hosting does, and visits it.

- **Never move or update files through the GitHub web UI** (BLUEPRINT A2). Moving the
  project to `htmlcat2` by web upload silently dropped `.github/workflows/ci.yml`,
  `.editorconfig` and `.gitignore`, so CI stopped running and STATE.md was wrong.
  `tests/course-static.mjs` now fails if any of them is missing.

- **Verify that doc edits really landed.** In phase 1 a `grep -c` returning 0 stopped an
  `&&` chain, so the STATE.md update silently never ran and the PR description was wrong.
  After editing docs, `git diff --stat` and re-read the section.
- **Security has two independent layers** in the preview: `sandbox="allow-same-origin"`
  (never `allow-scripts`) and a CSP meta with `default-src 'none'`. The CSP alone also blocks
  scripts, so a behavioural test cannot detect a sandbox regression: the e2e test asserts
  the `sandbox` attribute and the CSP content directly. Keep both assertions.
- Playwright reports CSP-blocked requests as `requestfailed` with `errorText === 'csp'`;
  they never reach the network.
- Nodes inside the preview iframe belong to another realm: `x instanceof Element` is false;
  use feature checks (`typeof x.closest === 'function'`).
- `Element.append()` returns `undefined` (a phase 2 bug caught by the browser test).
- The static check strips `<script type="text/plain">` blocks before scanning tags
  (they are student code, checked separately in phase 4).
- Test the tests: break something on purpose and confirm the test fails, then restore.
