#!/usr/bin/env node
// ════════════════════════════════════════════════════════
// tests/course-browser.mjs — Comprovacions amb navegador real
//
// Ús (des de tests/, després de «npm ci»):
//     node course-browser.mjs
//
// Serveix site/ amb un petit servidor HTTP i obre cada pàgina amb
// Chromium (Playwright) a dues amplades (mòbil 360 px i escriptori
// 1280 px). Falla (codi 1) si alguna pàgina:
//   1. escriu errors a la consola del navegador o llança excepcions;
//   2. té peticions que fallen (recurs inexistent, error de xarxa);
//   3. fa una petició a un servidor extern (privacitat dels alumnes);
//   4. té desplaçament horitzontal (no cap a l'amplada de la pantalla).
//
// A la fase 4 s'hi afegiran les comprovacions dels exercicis: la solució
// de referència supera les comprovacions i el codi inicial no
// (docs/BLUEPRINT.md §8.3).
// ════════════════════════════════════════════════════════

import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const VIEWPORTS = [
  { name: 'mòbil', width: 360, height: 740 },
  { name: 'escriptori', width: 1280, height: 800 },
];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function listPages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listPages(path);
    return extname(entry.name) === '.html' ? [path] : [];
  });
}

// Servidor estàtic semblant a Cloudflare Pages: carpeta → index.html,
// fitxer inexistent → 404.html amb codi 404.
function startServer() {
  const server = createServer((req, res) => {
    let path = join(SITE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!path.startsWith(SITE)) { res.writeHead(403).end(); return; }
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
    if (!existsSync(path)) {
      res.writeHead(404, { 'content-type': MIME['.html'] }).end(readFileSync(join(SITE, '404.html')));
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(readFileSync(path));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const problems = [];
let visits = 0;

for (const file of listPages(SITE)) {
  const url = origin + '/' + relative(SITE, file).split(sep).join('/');
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport });
    const where = `${relative(SITE, file)} (${viewport.name})`;
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`${where}: error a la consola: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`${where}: excepció: ${err.message}`));
    page.on('requestfailed', (req) => problems.push(`${where}: ha fallat ${req.url()}`));
    page.on('request', (req) => {
      if (!req.url().startsWith(origin) && !req.url().startsWith('data:')) {
        problems.push(`${where}: petició externa a ${req.url()}`);
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 400 && res.url() !== url) problems.push(`${where}: ${res.status()} a ${res.url()}`);
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) problems.push(`${where}: desplaçament horitzontal de ${overflow} px`);
    await page.close();
    visits++;
  }
}

await browser.close();
server.close();

if (problems.length) {
  console.error(`❌ ${problems.length} problema(es):\n` + problems.map((p) => '  · ' + p).join('\n'));
  process.exit(1);
}
console.log(`✅ Tot correcte (${visits} visites de pàgina)`);
