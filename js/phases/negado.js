/* TRICKY DOORS — fase 5: El Archivo Negado
 * Datos de la fase: objetos, notas, progreso, pistas, final y crónica global.
 * Escenarios en js/scenes/negado/*.js (phase:"negado"). Diseño: docs/negado/README.md.
 * Las condiciones `when(s)` reciben el gameState (s.flags, s.items, s.scene...).
 * Primera fase que LEE la crónica global (js/engine/chronicle.js, D017) — solo en
 * bonificaciones de texto, nunca para bloquear ni desbloquear lógica de puzle.
 */
window.TD = window.TD || {};

TD.registerPhase((function(){
const A = "assets/negado/items/";

const ICON = {
  lens:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="20" cy="20" r="13"/><path d="M29 29 L40 40"/></svg>',
  seal:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><circle cx="24" cy="20" r="14"/><path d="M18 32 L14 42 L24 37 L34 42 L30 32"/></svg>',
  card:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><rect x="8" y="10" width="32" height="24" rx="2"/><path d="M14 18h20M14 24h14"/></svg>',
  key:    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M31 24v5"/></svg>',
  folder: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M6 14 h14 l4 5 h18 v20 h-36 Z"/></svg>',
  book:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 8 h16 v32 h-16 Z"/><path d="M24 8 h16 v32 h-16 Z"/><path d="M24 8 v32" stroke-width="2"/></svg>',
  anchor: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="10" r="5"/><path d="M24 15 v25 M14 18 h20 M24 40 c-8 0-13-6-13-13 M24 40 c8 0-13-6 13-13"/><path d="M24 40 c8 0 13-6 13-13"/><path d="M15 34 l-5 4 M33 34 l5 4"/></svg>'
};

const ITEMS = {
  lupa:               { name:"Lupa de escribano",         img:A+"lupa.webp",               icon:ICON.lens },
  sello_contratacion: { name:"Sello de la Casa",           img:A+"sello_contratacion.webp", icon:ICON.seal },
  ficha_naos:         { name:"Ficha: naos y flotas",       img:A+"ficha_naos.webp",         icon:ICON.card },
  ficha_costas:       { name:"Ficha: costas y derroteros", img:A+"ficha_costas.webp",       icon:ICON.card },
  ficha_pilotos:      { name:"Ficha: pilotos y licencias", img:A+"ficha_pilotos.webp",      icon:ICON.card },
  ficha_contratacion: { name:"Ficha: oficiales de la Casa",img:A+"ficha_contratacion.webp", icon:ICON.card },
  llave_deposito:     { name:"Llave del depósito",         img:A+"llave_deposito.webp",     icon:ICON.key },
  expediente_correcto:{ name:"Expediente correcto",        img:A+"expediente_correcto.webp",icon:ICON.folder },
  libro_secreto:      { name:"El libro secreto de Ibáñez", img:A+"libro_secreto.webp",      icon:ICON.book },
  ancla_deposito:     { name:"Áncora del depósito",         img:A+"ancla_deposito.webp",     icon:ICON.anchor }
};

/* Las cuatro fichas se consumen al archivarse en su pestaña correcta (ver ficheros.js);
 * no hay COMBOS de inventario en esta fase — la variedad de puzle viene de la clasificación,
 * la comparación de cartas y la identificación por deducción, no de ensamblar objetos. */

const INTRO_TEXT = "El anexo de la antigua Casa de la Contratación lleva sellado desde que la institución se disolvió. Llevas meses catalogando casas y torres de la costa; esta vez te llaman al propio archivo.";

const F = k => s => !!s.flags[k];
const I = k => s => s.items.includes(k);

const NOTES = [
  { when:F("retratoLeido"),     text:"Placa de la entrada: «Casa de la Contratación de Indias. Aquí se guardó, y a veces se calló, el rumbo de la Carrera.»" },
  { when:F("discrepanciaHallada"), text:"La corrección privada de un piloto difiere del Padrón Real oficial en un tramo de costa: el Bajío del Serrano, que la carta oficial nunca marcó." },
  { when:F("selloProbado"),     text:"El sello de la Casa: una nao entre dos torres, bajo una corona pequeña. Coincide con la huella del molde de cera." },
  { when:F("notasLeidas"),      text:"Notas de Baltasar Ibáñez, escribano mayor: «No tenía autoridad para corregir el Padrón Real. Así que guardé, aparte, cada corrección que la Casa prefirió no ver.»" },
  { when:F("ficherosCompletos"),text:"Las cuatro fichas archivadas abren el cajón inferior del fichero: dentro, la llave del depósito." },
  { when:F("expedienteCorrectoTaken"), text:"El expediente correcto: menciona el Bajío del Serrano y lleva el sello auténtico de la Casa. Los otros dos, no." },
  { when:F("faseCompletada"),   text:"El libro secreto de Ibáñez: décadas de correcciones que la Casa nunca incorporó, ordenadas, una por una, para que alguien las encontrara." }
];
const NOTES_EMPTY = "Aún no has anotado nada.";

const PROGRESS = [
  { key:"discrepanciaHallada", label:"Comparación de cartas" },
  { key:"selloProbado",        label:"Sello de la Casa" },
  { key:"ficherosCompletos",   label:"Fichero clasificado" },
  { key:"depositoAbierto",     label:"Depósito abierto" },
  { key:"expedienteCorrectoTaken", label:"Expediente correcto" },
  { key:"pasoCamaraAbierto",   label:"Paso a la cámara oculta" },
  { key:"faseCompletada",      label:"El libro secreto" }
];

const H = (when,tiers)=>({when,tiers});
const HINTS = [
  H(s=>!s.flags.discrepanciaHallada, [
    "En la sala de mapas hay dos cartas que se pueden comparar.",
    "Superpón la copia del Padrón Real y la corrección privada del piloto.",
    "Busca el tramo de costa donde las dos cartas de la sala de mapas no coinciden."
  ]),
  H(s=>!s.flags.lupaTaken, [
    "El despacho del escribano esconde algo detrás de los libros.",
    "Revisa el estante del despacho: hay una lupa detrás de la fila de libros.",
    "Coge la lupa del estante del despacho: la necesitarás para leer letra pequeña."
  ]),
  H(s=>s.flags.lupaTaken && !s.flags.selloProbado, [
    "Un molde de cera, en el despacho, conserva la huella de un sello.",
    "Compara la huella del molde con los sellos disponibles: nao entre dos torres, con corona.",
    "El sello correcto del despacho es el que tiene nao, dos torres Y una corona pequeña — ni más ni menos."
  ]),
  H(s=>!s.flags.ficherosCompletos, [
    "El fichero tiene cuatro fichas sueltas y cuatro pestañas.",
    "Cada ficha describe un tema: naos, costas, pilotos, o la propia Casa. Va en la pestaña de ese tema.",
    "Archiva: naos y flotas, costas y derroteros, pilotos y licencias, y la Casa — una ficha en cada pestaña que describe."
  ]),
  H(s=>s.flags.ficherosCompletos && !s.flags.depositoAbierto, [
    "Tienes una llave que no has usado todavía.",
    "La llave del depósito abre la puerta del depósito, junto a la entrada.",
    "Usa la llave del depósito en la puerta del depósito."
  ]),
  H(s=>s.flags.depositoAbierto && !s.flags.expedienteCorrectoTaken, [
    "En el depósito hay varios expedientes retirados: solo uno es el correcto.",
    "Selecciona la lupa y examina cada expediente: el correcto menciona el Bajío del Serrano y lleva el sello auténtico.",
    "El expediente correcto es el único que coincide en dos cosas a la vez: el lugar de la sala de mapas Y el sello del despacho."
  ]),
  H(s=>s.flags.expedienteCorrectoTaken && !s.flags.pasoCamaraAbierto, [
    "Al sacar el expediente, la estantería del depósito ha cedido un poco: algo raro asoma en la piedra de detrás.",
    "Esa grieta en la pared no cede a mano: hace falta algo con lo que hacer palanca.",
    "Selecciona el áncora del depósito y úsala sobre la pared del fondo para forzar el paso."
  ]),
  H(s=>I("expediente_correcto")(s) && I("sello_contratacion")(s) && !s.flags.faseCompletada, [
    "La cámara oculta necesita el expediente y el sello, cada uno en su sitio.",
    "Inserta el expediente correcto en la ranura de la cámara oculta y luego sella con el sello de la Casa.",
    "En la cámara oculta: primero el expediente en la ranura, después el sello encima para autenticarlo."
  ]),
  H(s=>true, [
    "Explora la entrada: mapas, despacho y ficheros están abiertos desde el principio.",
    "Cada sala da una pieza distinta; el depósito las necesita todas para identificar un solo expediente.",
    "Empieza por cualquiera de las tres salas de la entrada — ninguna depende de las otras para empezar."
  ])
];
const HINT_FALLBACK = "Observa cada sala: el archivo cuenta su propia historia si se compara con atención.";

const END = {
  when: F("faseCompletada"),
  title: "El libro secreto",
  text: "El expediente encaja en la ranura; el sello lo autentica con un chasquido seco. El compartimento se abre: el libro de Ibáñez, décadas de correcciones que la Casa prefirió no ver, ordenadas para que alguien, por fin, las encontrara. No repara nada por sí solo. Pero ya no es un caso aislado: es un patrón, y tú lo has visto entero."
};

/* Crónica global (js/engine/chronicle.js, DECISIONS.md D017).
 * Escribe: fin de fase (automático) + una clave nueva propia, lista para una fase futura.
 * Lee (solo bonificación de texto, ver negado/despacho.js y negado/mapas.js): si la crónica
 * ya conoce conocimiento.encubrimiento_naval (derrotero y/o faro) o
 * simbolo.sirena_orientacion (sevilla), esta fase añade una línea de reconocimiento sin
 * cambiar en nada la lógica de sus puzles. */
const CHRONICLE = [
  { flag:"faseCompletada", key:"conocimiento.patron_institucional",
    label:"Una institución entera, no un solo funcionario, sostuvo durante décadas el mismo silencio sobre sus propios errores." }
];

return {
  id:"negado",
  name:"El Archivo Negado",
  startScene:"negado_entrada",
  data:{ ITEMS, INTRO_TEXT, NOTES, NOTES_EMPTY, PROGRESS, HINTS, HINT_FALLBACK, END, CHRONICLE }
};
})());
