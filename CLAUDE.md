# CLAUDE.md — rules for AI agents working on HTMLCat

<!-- regles-comunes:inici -->
## Regles comunes de Step Quiz

*Aquest bloc és igual a tots els repositoris de `step-quiz`. Les regles específiques d'aquest
repositori, si n'hi ha més avall, manen sobre aquestes quan diuen una altra cosa.*

- **Llengua.** Parla amb l'usuari en català. Tot el que veu l'alumnat, també en català.
- **L'usuari.** David, llicenciat en Matemàtiques i professor d'ESO i Batxillerat a Catalunya.
  Programa en C i dissenya algorismes; d'HTML, CSS, JS, Git, GitHub, Codespaces i LaTeX en sap
  el que cal per fer-los servir, no més. Quan hagi de fer alguna cosa (pull, push, commit, pujar
  un ZIP, compilar…), dona-li els passos numerats, amb les ordres o els textos per copiar i
  enganxar, i explica què fa cada pas.
- **ZIP.** Els ZIP que lliuris, l'usuari els puja a `_uploads/` (GitHub → `_uploads/` →
  *Add file* → *Upload files*), i el workflow `unzip-upload.yml` els descomprimeix a l'arrel i en
  fa commit. Per tant, les rutes de dins del ZIP comencen a l'arrel del repositori (`js/app.js`,
  no `projecte/js/app.js`): cap carpeta que ho contingui tot. El que hi hagi a `.github/` s'ignora;
  els workflows es canvien des del web de GitHub.
- **Publicació.** Els webs es publiquen amb Cloudflare Pages a cada commit de `main`. Cap missatge
  de commit pot portar `[skip ci]`, `[ci skip]` ni `[cf-pages-skip]`, tampoc els dels workflows
  que desen fitxers generats: Cloudflare no publicaria aquell commit.
- **Webs estàtiques.** HTML, CSS i JavaScript sense compilació ni servidor, si aquest repositori
  no diu el contrari. Cap dada personal de l'alumnat en un repositori públic.
- **Documentació.** Si canvies el comportament, posa al dia el README i els documents que el
  descriuen en el mateix commit. Si el codi i un document no coincideixen, el que s'ha
  d'arreglar és el document.
- **Proves.** Abans de lliurar res, passa les proves del repositori i digues-ne el resultat.
<!-- regles-comunes:fi -->

## Aquest repositori

HTMLCat is a static, build-free course that teaches HTML + CSS and clean code to
15-year-olds, in Catalan. It is part of the *Cat family (KarelCat, PyCat, JSCat).

## Read first, in this order

0. `HANDOFF.md` — where the work stopped and the next task (start here).
1. `docs/STATE.md` — what exists now, decisions taken, pending work (single source of truth).
2. `docs/BLUEPRINT.md` — design reference for everything not built yet, and the rationale.
3. `docs/CURRICULUM.md` — before touching course content.

If the code and a doc disagree, the code is right and the doc is a bug: fix the doc in the same PR.

## Non-negotiable constraints

- HTML, CSS and JavaScript only. No framework, bundler, transpiler, build step,
  runtime dependency or CDN script. Native ES modules (`<script type="module">`), no globals.
- The website lives in `site/`; the root `index.html` is the welcome page (portada: Capítols and Editor
  lliure) and loads its CSS/JS from `site/`. Cloudflare publishes the whole repository (owner's decision, 2026-10-03), so
  everything committed is public, solutions in `tests/solutions/` included: never commit private data.
- Everything the student sees is in Catalan. Engine identifiers and file names in English;
  code comments in Catalan.
- Students never write JavaScript. The preview iframe uses `sandbox="allow-same-origin"`
  and must never get `allow-scripts`.
- Privacy of minors: no analytics, no cookies, no third-party requests (self-host fonts and images).
- No `style=""` attributes, no inline event handlers, no service worker, no COOP/COEP headers.
- Never derive identity from the URL: use `body[data-pagina][data-num]` and `data-id`.
- Render student-derived text with `textContent`, never `innerHTML`.

## Working agreement with the owner

- The owner is a maths teacher (knows C and algorithms; limited Git/GitHub/Codespaces).
  Reply in **Catalan**. When the owner must do something, give numbered steps with
  copy-paste commands and explain what each one does.
- After pushing a branch, **open the pull request yourself**. The owner merges on GitHub.
- Never write `[skip ci]`, `[ci skip]` or `[cf-pages-skip]` in a commit message:
  Cloudflare Pages would not deploy that commit.
- The owner rests from 23:00 to 07:00: schedule nothing in that window.
- All changes go through Git commits with descriptive Catalan messages
  (no uploads through the GitHub web UI).

## Every PR

- Small and focused. Update `docs/STATE.md` (and `docs/CURRICULUM.md` for content)
  in the same PR whenever behaviour, contracts, content or pending work change.
- Run the test commands listed in `docs/STATE.md` §Tests before pushing, and report
  the results in the PR body.
- PR body in Catalan with: **Què canvia**, **Per què**, **Com comprovar-ho**, **Tests**, **Documentació**.
- Before asking the owner about a decision, check `docs/STATE.md` §Decisions:
  it may already be answered.
