// ════════════════════════════════════════════════════════
// course/vocabulary.js — El vocabulari del curs (mòdul pur)
//
// Cada etiqueta, atribut, propietat CSS, valor i concepte que s'ensenya,
// amb el capítol on apareix per primera vegada i una definició d'una
// frase. Alimenta el glossari (course/glossary.js): a cada capítol només
// hi surt el que ja s'ha ensenyat fins aquell moment.
//
// Entrada: { terme, tipus, capitol, def }
//   tipus: 'element' | 'atribut' | 'propietat' | 'valor' | 'concepte'
//
// API pública:
//   VOCABULARI, TIPUS
//   vocabularyUntil(capitol) → entrades amb capitol <= capitol, per ordre alfabètic
// ════════════════════════════════════════════════════════

export const TIPUS = {
  element: 'Elements HTML',
  atribut: 'Atributs HTML',
  propietat: 'Propietats CSS',
  valor: 'Valors, unitats i regles CSS',
  concepte: 'Conceptes',
};

const v = (terme, tipus, capitol, def) => ({ terme, tipus, capitol, def });

export const VOCABULARI = [
  // ── Capítol 1 · Hola, HTML! ──
  v('element', 'concepte', 1, 'Una peça de la pàgina: etiqueta d\'obertura, contingut i etiqueta de tancament.'),
  v('etiqueta', 'concepte', 1, 'El nom de l\'element entre < i >; la de tancament porta una barra: </p>.'),
  v('niuament', 'concepte', 1, 'Posar elements dins d\'altres elements; el que s\'obre a dins es tanca a dins.'),
  v('indentació', 'concepte', 1, 'Els espais a l\'inici de cada línia, que mostren què és dins de què (2 espais per nivell).'),
  v('<!DOCTYPE html>', 'element', 1, 'La primera línia del document: diu al navegador que és HTML modern.'),
  v('<html>', 'element', 1, 'L\'element arrel, que ho conté tot: el <head> i el <body>.'),
  v('<head>', 'element', 1, 'La informació sobre la pàgina que no es veu: el títol, la codificació, els estils.'),
  v('<meta charset>', 'element', 1, 'Diu la codificació del text; amb UTF-8 es veuen bé els accents i la ç.'),
  v('<title>', 'element', 1, 'El títol de la pàgina, el que surt a la pestanya del navegador.'),
  v('<body>', 'element', 1, 'El contingut que es veu a la pàgina.'),
  v('<h1>', 'element', 1, 'El títol principal de la pàgina (n\'hi ha d\'haver un).'),
  v('<p>', 'element', 1, 'Un paràgraf de text.'),
  v('lang', 'atribut', 1, 'A <html>, l\'idioma de la pàgina (lang="ca"): ajuda els lectors de pantalla i els traductors.'),

  // ── Capítol 2 · Text amb significat ──
  v('<h2> … <h6>', 'element', 2, 'Títols de nivells més baixos; van en ordre, sense saltar-se\'n cap.'),
  v('<strong>', 'element', 2, 'Text important (es veu en negreta).'),
  v('<em>', 'element', 2, 'Text amb èmfasi, el que diries amb un altre to (es veu en cursiva).'),
  v('<br>', 'element', 2, 'Un salt de línia dins d\'un text, com en una adreça o un poema; no té tancament.'),
  v('comentari HTML', 'concepte', 2, 'Text entre <!-- i --> que el navegador no mostra: notes per a qui llegeix el codi.'),
  v('entitat', 'concepte', 2, 'Una manera d\'escriure caràcters especials: &lt; per a <, &gt; per a >, &amp; per a &.'),
  v('espais en blanc', 'concepte', 2, 'El navegador junta els espais i salts de línia seguits en un de sol.'),

  // ── Capítol 3 · Llistes ──
  v('<ul>', 'element', 3, 'Una llista sense ordre (amb pics).'),
  v('<ol>', 'element', 3, 'Una llista ordenada (numerada).'),
  v('<li>', 'element', 3, 'Un element d\'una llista; tot el que hi ha dins d\'una <ul> o una <ol> ha d\'anar en un <li>.'),
  v('llista niada', 'concepte', 3, 'Una llista dins d\'un <li> d\'una altra llista.'),

  // ── Capítol 4 · Enllaços ──
  v('<a>', 'element', 4, 'Un enllaç: el text on es fa clic per anar a una altra pàgina o a un altre lloc.'),
  v('href', 'atribut', 4, 'A <a>, on porta l\'enllaç.'),
  v('id', 'atribut', 4, 'Un nom únic per a un element de la pàgina; serveix per enllaçar-hi (#nom) i, al CSS, per seleccionar-lo.'),
  v('ruta absoluta', 'concepte', 4, 'Una adreça completa, amb https://; porta a una altra web.'),
  v('ruta relativa', 'concepte', 4, 'Una adreça a partir de la pàgina on ets: «pagina2.html», «fotos/gat.jpg».'),
  v('àncora', 'concepte', 4, 'Un enllaç a un lloc de la mateixa pàgina: href="#contacte" porta a l\'element amb id="contacte".'),

  // ── Capítol 5 · Imatges ──
  v('<img>', 'element', 5, 'Una imatge; no té tancament.'),
  v('src', 'atribut', 5, 'A <img>, la ruta del fitxer de la imatge.'),
  v('alt', 'atribut', 5, 'A <img>, el text que descriu la imatge, per a qui no la pot veure.'),
  v('width', 'atribut', 5, 'A <img>, l\'amplada en píxels (amb height, el navegador reserva l\'espai abans que arribi).'),
  v('height', 'atribut', 5, 'A <img>, l\'alçada en píxels.'),
  v('<figure>', 'element', 5, 'Una imatge (o un altre contingut) amb el seu peu.'),
  v('<figcaption>', 'element', 5, 'El peu d\'una <figure>.'),
  v('atribut', 'concepte', 5, 'Una informació de més a l\'etiqueta d\'obertura: nom="valor".'),

  // ── Capítol 6 · Estructura de la pàgina ──
  v('<header>', 'element', 6, 'La capçalera de la pàgina o d\'una secció: el logo, el títol.'),
  v('<nav>', 'element', 6, 'El menú de navegació, amb els enllaços principals.'),
  v('<main>', 'element', 6, 'El contingut principal de la pàgina; només n\'hi ha un.'),
  v('<section>', 'element', 6, 'Una part de la pàgina amb el seu propi títol.'),
  v('<article>', 'element', 6, 'Un contingut que té sentit tot sol: una notícia, una entrada d\'un blog.'),
  v('<aside>', 'element', 6, 'Un contingut relacionat però secundari: una nota al marge, enllaços relacionats.'),
  v('<footer>', 'element', 6, 'El peu de la pàgina o d\'una secció: l\'autor, el contacte.'),
  v('<div>', 'element', 6, 'Una caixa sense significat; només quan cap altre element no hi escau.'),
  v('HTML semàntic', 'concepte', 6, 'Triar cada element pel que és, no per com es veu.'),

  // ── Capítol 7 · Taules ──
  v('<table>', 'element', 7, 'Una taula de dades.'),
  v('<caption>', 'element', 7, 'El títol d\'una taula.'),
  v('<thead>', 'element', 7, 'Les files de capçalera d\'una taula.'),
  v('<tbody>', 'element', 7, 'Les files de dades d\'una taula (si no hi és, el navegador l\'afegeix).'),
  v('<tr>', 'element', 7, 'Una fila d\'una taula.'),
  v('<th>', 'element', 7, 'Una cel·la de capçalera.'),
  v('<td>', 'element', 7, 'Una cel·la de dades.'),
  v('scope', 'atribut', 7, 'A <th>, si és la capçalera d\'una columna (col) o d\'una fila (row).'),

  // ── Capítol 8 · Formularis ──
  v('<form>', 'element', 8, 'Un formulari, que agrupa els camps que s\'envien junts.'),
  v('<label>', 'element', 8, 'El text que explica un camp; amb for, fer-hi clic hi porta el cursor.'),
  v('for', 'atribut', 8, 'A <label>, l\'id del camp que explica.'),
  v('<input>', 'element', 8, 'Un camp per escriure o triar; type diu de quina mena és.'),
  v('type', 'atribut', 8, 'A <input>, la mena de camp: text, email, number, checkbox, radio, date, etc.'),
  v('name', 'atribut', 8, 'Als camps, el nom amb què s\'envia la dada.'),
  v('placeholder', 'atribut', 8, 'Un exemple dins del camp buit; no substitueix l\'etiqueta.'),
  v('required', 'atribut', 8, 'El camp és obligatori: el formulari no s\'envia si és buit.'),
  v('<select>', 'element', 8, 'Una llista desplegable; cada opció és un <option>.'),
  v('<option>', 'element', 8, 'Una opció d\'un <select>.'),
  v('<textarea>', 'element', 8, 'Un camp per a text llarg, de diverses línies.'),
  v('<button>', 'element', 8, 'Un botó; type="submit" envia el formulari.'),

  // ── Capítol 9 · Hola, CSS! ──
  v('CSS', 'concepte', 9, 'El llenguatge que diu com es veu la pàgina: colors, lletres, espais, posició.'),
  v('regla CSS', 'concepte', 9, 'Un selector i, entre claus, les declaracions: p { color: teal; }.'),
  v('declaració', 'concepte', 9, 'Una propietat i el seu valor, acabada en punt i coma: color: teal;.'),
  v('<link>', 'element', 9, 'Dins del <head>, enllaça un full d\'estils: <link rel="stylesheet" href="estils.css">.'),
  v('rel', 'atribut', 9, 'A <link>, la relació amb el fitxer; per al CSS, rel="stylesheet".'),
  v('color', 'propietat', 9, 'El color del text.'),
  v('background-color', 'propietat', 9, 'El color del fons.'),
  v('font-size', 'propietat', 9, 'La mida de la lletra.'),
  v('comentari CSS', 'concepte', 9, 'Text entre /* i */ que el navegador no llegeix.'),

  // ── Capítol 10 · Selectors i cascada ──
  v('selector', 'concepte', 10, 'La part de la regla que diu a quins elements s\'aplica.'),
  v('selector d\'element', 'valor', 10, 'p, h1, li: tots els elements d\'aquest tipus.'),
  v('selector de classe', 'valor', 10, '.avis: els elements amb class="avis".'),
  v('selector d\'id', 'valor', 10, '#menu: l\'element amb id="menu".'),
  v('selector descendent', 'valor', 10, 'nav a: els <a> que són dins d\'un <nav>.'),
  v('selectors agrupats', 'valor', 10, 'h1, h2: la mateixa regla per a tots dos.'),
  v('class', 'atribut', 10, 'Un o més noms (separats per espais) per donar el mateix estil a diversos elements.'),
  v('cascada', 'concepte', 10, 'Com decideix el navegador quina regla guanya quan n\'hi ha diverses per al mateix element.'),
  v('especificitat', 'concepte', 10, 'Quan dues regles es contradiuen, guanya el selector més específic: un id més que una classe, i una classe més que un element.'),
  v('herència', 'concepte', 10, 'Algunes propietats (color, font-family…) passen dels pares als fills.'),

  // ── Capítol 11 · Colors, text i unitats ──
  v('#rrggbb', 'valor', 11, 'Un color en hexadecimal: vermell, verd i blau, de 00 a ff (#c2410c).'),
  v('rgb()', 'valor', 11, 'Un color amb vermell, verd i blau de 0 a 255: rgb(194, 65, 12).'),
  v('hsl()', 'valor', 11, 'Un color amb to (0–360), saturació i lluminositat: hsl(20, 88%, 40%).'),
  v('px', 'valor', 11, 'Píxels: una mida fixa.'),
  v('em', 'valor', 11, 'Una mida relativa a la lletra de l\'element.'),
  v('rem', 'valor', 11, 'Una mida relativa a la lletra de la pàgina (1rem sol ser 16 px).'),
  v('%', 'valor', 11, 'Un percentatge del que ocupa l\'element pare.'),
  v('font-family', 'propietat', 11, 'La lletra; s\'acaba amb una família genèrica (sans-serif, serif, monospace).'),
  v('font-weight', 'propietat', 11, 'El gruix de la lletra: normal, bold, 700, etc.'),
  v('font-style', 'propietat', 11, 'La lletra cursiva (italic) o normal.'),
  v('line-height', 'propietat', 11, 'L\'alçada de cada línia de text; 1.5 vol dir una vegada i mitja la mida de la lletra.'),
  v('text-align', 'propietat', 11, 'L\'alineació del text: left, center, right, justify.'),
  v('variable CSS', 'valor', 11, 'Un valor amb nom (--color-principal: teal;) que es fa servir amb var(--color-principal).'),
  v('contrast', 'concepte', 11, 'La diferència entre el color del text i el del fons; amb poc contrast, costa de llegir.'),

  // ── Capítol 12 · El model de caixa ──
  v('model de caixa', 'concepte', 12, 'Cada element és una caixa: contingut, padding, border i margin, de dins cap a fora.'),
  v('margin', 'propietat', 12, 'L\'espai de fora de la vora, que separa la caixa de les altres.'),
  v('padding', 'propietat', 12, 'L\'espai de dins, entre el contingut i la vora.'),
  v('border', 'propietat', 12, 'La vora: gruix, estil i color (border: 2px solid teal).'),
  v('border-radius', 'propietat', 12, 'Arrodoneix les cantonades.'),
  v('width', 'propietat', 12, 'L\'amplada de la caixa.'),
  v('max-width', 'propietat', 12, 'L\'amplada màxima: la caixa pot ser més estreta, però no més ampla.'),
  v('box-sizing', 'propietat', 12, 'Amb border-box, l\'amplada inclou el padding i la vora.'),
  v('display', 'propietat', 12, 'Com es col·loca la caixa: block, inline, inline-block, none o flex.'),
  v('block', 'valor', 12, 'Una caixa que ocupa tota l\'amplada i comença en una línia nova (p, div, h1).'),
  v('inline', 'valor', 12, 'Una caixa que va dins del text, sense amplada pròpia (a, strong, em).'),
  v('margin: 0 auto', 'valor', 12, 'Centra horitzontalment una caixa que té una amplada.'),

  // ── Capítol 13 · Flexbox ──
  v('flexbox', 'concepte', 13, 'Una manera de col·locar caixes en fila o en columna, amb display: flex al contenidor.'),
  v('flex-direction', 'propietat', 13, 'La direcció dels fills d\'un contenidor flex: row (fila) o column (columna).'),
  v('justify-content', 'propietat', 13, 'Com es reparteixen els fills en la direcció principal: center, space-between, etc.'),
  v('align-items', 'propietat', 13, 'Com s\'alineen els fills en l\'altra direcció: center, flex-start, stretch, etc.'),
  v('gap', 'propietat', 13, 'L\'espai entre els fills d\'un contenidor flex (o grid).'),
  v('flex-wrap', 'propietat', 13, 'Amb wrap, els fills passen a la línia següent si no hi caben.'),
  v('flex', 'propietat', 13, 'En un fill, quant creix per omplir l\'espai que sobra (flex: 1).'),

  // ── Capítol 14 · Pàgines que s'adapten ──
  v('<meta name="viewport">', 'element', 14, 'Diu al mòbil que faci servir l\'amplada de la pantalla; sense, la pàgina es veu petita.'),
  v('@media', 'valor', 14, 'Regles que només s\'apliquen en certes condicions: @media (min-width: 600px) { … }.'),
  v('min-width', 'valor', 14, 'En un @media, a partir d\'una amplada de pantalla.'),
  v('max-width (en @media)', 'valor', 14, 'En un @media, fins a una amplada de pantalla.'),
  v('disseny adaptable', 'concepte', 14, 'Una pàgina que es veu bé al mòbil, a la tauleta i a l\'ordinador.'),
  v('primer el mòbil', 'concepte', 14, 'Escriure primer els estils per al mòbil i afegir @media (min-width) per a pantalles més grans.'),
  v('imatge flexible', 'concepte', 14, 'max-width: 100% fa que una imatge no surti mai de la seva caixa.'),
];

/**
 * @param {number} capitol
 * @returns {Array<{ terme: string, tipus: string, capitol: number, def: string }>}
 */
export function vocabularyUntil(capitol) {
  const clau = (terme) => terme.replace(/^[<#.@!]+/, '').toLowerCase();
  return VOCABULARI.filter((entry) => entry.capitol <= capitol)
    .sort((a, b) => clau(a.terme).localeCompare(clau(b.terme), 'ca'));
}
