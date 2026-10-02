# HTMLCat — Estat actual del projecte

> **Font única de veritat.** Aquest document descriu l'estat real del projecte.
> Qualsevol canvi que modifiqui l'arquitectura, el comportament, el contingut
> del curs o les tasques pendents ha d'actualitzar aquest document **en el mateix
> commit**.
>
> **Regla d'or:** un document d'estat obsolet és més perillós que no tenir-ne.

Darrera actualització: 2026-10-02.

---

## 1. Visió general

**HTMLCat** és un curs interactiu per aprendre **HTML i CSS** i a escriure
**codi net i ben estructurat**, en català, adreçat a alumnes d'ESO (≈ 15 anys).
És un web estàtic «vanilla» (sense pas de compilació ni dependències) que es
publicarà a Cloudflare Pages des d'aquest repositori.

El disseny complet és a [`BLUEPRINT.md`](BLUEPRINT.md). Mentre una part no
estigui construïda, el BLUEPRINT n'és la referència; quan ja existeix, mana
aquest document (i el codi).

---

## 2. Què hi ha ara

**Fase actual: 0 (arrencada), acabada pel que fa al repositori.** Falta
configurar Cloudflare Pages (§5). Encara no hi ha cap capítol ni l'editor.

```
README.md              Presentació del projecte (per a persones)
CLAUDE.md              Normes per a les IA que hi treballin
LICENSE                Text de les dues llicències (CC BY-NC-SA 4.0 i MIT)
LLICENCIA.md           Explicació de la llicència en català
.editorconfig          UTF-8, LF, 2 espais
.gitignore             node_modules/
.github/workflows/ci.yml  Executa tots els tests a cada push i PR

docs/STATE.md          Aquest document
docs/BLUEPRINT.md      Disseny inicial i lliçons apreses de PyCat i JSCat (en anglès)
docs/CURRICULUM.md     Pla de capítols i reptes (proposta)

site/                  ← l'única carpeta que es publica
  index.html           Portada provisional «En construcció»
  404.html             Pàgina d'error (Cloudflare la fa servir sola)
  _headers             Capçaleres de seguretat per a Cloudflare Pages
  LICENSE.txt          Còpia de LICENSE (el peu hi enllaça)
  css/tokens.css       Variables de disseny (colors, espais, tipografies) i tema fosc
  css/base.css         Reinici, tipografia i estructura bàsica (.pagina, .peu, .avis, .logo)
  img/logo.svg         Logotip (també és la icona de la pestanya)
  js/util/text.js      Mòdul pur: normalizeNewlines, dedent, lineColAt

tests/
  package.json         Només Playwright (versió fixada), per als tests
  package-lock.json
  unit/*.test.mjs      Tests unitaris dels mòduls purs (node:test)
  course-static.mjs    Comprovacions estàtiques de site/ (sense dependències)
  course-browser.mjs   Comprovacions amb Chromium a 360 i 1280 px
```

Estructura completa prevista: BLUEPRINT §4.1.

---

## 3. Decisions preses

Decisions de base adoptades amb el BLUEPRINT (2026-10-02). No es desfan sense
motiu; si se'n canvia alguna, s'anota aquí amb la data i el motiu.

| Data | Decisió | Motiu |
|---|---|---|
| 2026-10-02 | HTML, CSS i JS «vanilla», sense pas de compilació ni dependències en temps d'execució | Coherència amb la sèrie; es pot provar amb `python3 -m http.server` |
| 2026-10-02 | Mòduls ES natius, sense objecte global | Dependències explícites; els mòduls purs es poden provar amb Node |
| 2026-10-02 | Només es publica `site/` | Les solucions i els tests no han de ser públics |
| 2026-10-02 | Previsualització en un `<iframe sandbox="allow-same-origin">` amb `srcdoc`, mai amb `allow-scripts` | El codi de l'alumne no pot executar res i el curs pot llegir el resultat (comprovat a Chromium, BLUEPRINT apèndix A) |
| 2026-10-02 | Codi inicial dels exercicis en blocs `<script type="text/plain">` | Conserven el codi exactament; `<template>` i els atributs no ho fan |
| 2026-10-02 | Llicència: contingut CC BY-NC-SA 4.0, codi MIT (igual que PyCat) | Coherència amb la sèrie |
| 2026-10-02 | Sense *service worker* ni capçaleres COOP/COEP | Lliçons de PyCat (BLUEPRINT §3.2, A14 i A15) |

### Decisions pendents de confirmar amb el propietari

Detall a BLUEPRINT §11. Entre parèntesis, l'opció recomanada.

| Id | Pregunta | Recomanació |
|---|---|---|
| D1 | Què mostra la pàgina d'inici `/`? | Portada amb targetes i progrés; editor lliure a `/editor/` |
| D2 | Nom del fitxer CSS dels exercicis | `estils.css` |
| D3 | Quan passen els exercicis de fragment a document complet? | Cap. 1 ensenya l'esquelet; caps. 2–5 fragments; des del cap. 6, documents complets |
| D4 | L'editor tanca les etiquetes sol? | No (cal aprendre a tancar-les); correcció ràpida des del cap. 4 |
| D5 | Imatges i fonts externes a les pàgines dels alumnes? | Bloquejades; paquet d'imatges propi |
| D6 | Tema de colors | Clar per defecte; fosc segons el sistema i amb botó |
| D7 | Tipografies | Space Mono per al codi i una sense serifa per al text, servides des del mateix web |
| D8 | Domini | `htmlcat.step-quiz.net` |
| D9 | Currículum | Els 15 capítols i ~12 reptes de [`CURRICULUM.md`](CURRICULUM.md) |
| D10 | Relació amb JSCat | HTMLCat abans de la part B de JSCat; enllaços en tots dos sentits |
| D11 | Llengua del codi del motor | Identificadors en anglès, comentaris en català |
| D12 | Noms de classes i ids que s'ensenyen | Català en minúscules, sense accents, amb guions (`menu-principal`) |

---

## 4. Tests

Des de l'arrel del projecte:

```bash
node --test tests/unit/*.test.mjs     # tests unitaris (sense dependències)
node tests/course-static.mjs          # comprovacions estàtiques de site/ (sense dependències)
cd tests && npm ci && node course-browser.mjs   # navegador (Playwright + Chromium)
```

(Al contenidor de Claude Code al núvol Chromium ja hi és: no cal
`npx playwright install`. En un Codespace o a GitHub sí que cal.)

| Test | Què comprova |
|---|---|
| `unit/` | Cada mòdul pur de `site/js/` (ara: `util/text.js`) |
| `course-static.mjs` | Cada pàgina té `<!DOCTYPE html>`, `lang="ca"`, `charset` i `<title>`; cap `style=""` ni `on…=""`; cap tabulació; tots els enllaços relatius existeixen; sintaxi de cada `.js`; cap menció de CC BY-NC-ND |
| `course-browser.mjs` | Cada pàgina, a 360 i 1280 px: cap error a la consola, cap petició fallida, cap petició a servidors externs, cap desplaçament horitzontal |

La GitHub Action `.github/workflows/ci.yml` executa els tres a cada push i a
cada pull request (pestanya «Actions» de GitHub).

---

## 5. Publicació

**Pendent de configurar** (ho ha de fer el propietari a Cloudflare):
branca de producció `main`, *framework preset* «None», ordre de compilació
buida, carpeta de sortida `site`, domini `htmlcat.step-quiz.net` (pendent de D8).
Després, cal comprovar que `/tests/` i `/docs/` donen la pàgina 404.

`site/_headers` afegeix `X-Content-Type-Options`, `Referrer-Policy` i
`Permissions-Policy`. **No** s'hi han de posar COOP/COEP (BLUEPRINT §3.2, A15)
ni capçaleres de memòria cau llarga.

---

## 6. Tasques pendents

Fases del BLUEPRINT §9.1:

- [ ] **Fase 0 — Arrencada.** Fet: documentació, llicència, `site/` provisional,
      tests i GitHub Action. Falta: configurar Cloudflare Pages i comprovar que
      `/tests/` i `/docs/` no es publiquen.
- [ ] Respondre les decisions pendents D1–D12 (§3).
- [ ] **Fase 1 — Nucli del llenguatge:** tokenitzador d'HTML, analitzador de CSS, arbre del codi font, ressaltat.
- [ ] **Fase 2 — Editor, previsualització i editor lliure.**
- [ ] **Fase 3 — Revisor de codi v1 i panell ⚠ Problemes.**
- [ ] **Fase 4 — Primer capítol complet** (esquelet del curs, progrés, comprovacions, tests).
- [ ] **Fase 5 — Continguts:** un capítol per PR.
- [ ] **Fase 6 — Activitats i eines:** Parsons, qüestionaris, 🌳 Arbre, exportar/importar el progrés.
- [ ] **Fase 7 — Acabats:** portada amb progrés, glossari, accessibilitat, guia del professorat.
