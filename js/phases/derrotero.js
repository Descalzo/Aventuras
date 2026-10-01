/* TRICKY DOORS — fase 3: El Derrotero Perdido (Palacio de Valderas, Sevilla)
 * Datos de la fase: objetos, combinaciones, notas, progreso, pistas y final.
 * Escenarios en js/scenes/derrotero/*.js (phase:"derrotero"). Diseño: docs/derrotero/README.md.
 * Las condiciones `when(s)` reciben el gameState (s.flags, s.items, s.scene...).
 */
window.TD = window.TD || {};

TD.registerPhase((function(){
const A = "assets/derrotero/items/";

/* Iconos SVG de respaldo (si falta la imagen del objeto). */
const ICON = {
  shard:  '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 6 L38 20 L30 42 L10 30 Z"/></svg>',
  key:    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M31 24v5"/></svg>',
  lamp:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 30 C12 20 36 20 36 30 C36 36 28 38 24 38 C20 38 12 36 12 30 Z"/><path d="M20 38 L18 44 M28 38 L30 44"/><path d="M24 12 L24 20"/></svg>',
  tool:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 38 L26 22"/><path d="M28 12 L38 22 L34 26 L24 16 Z"/></svg>',
  crank:  '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="20" cy="28" r="9"/><path d="M27 21 L40 8 M40 8 L40 15 M40 8 L33 8"/></svg>',
  ring:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="15"/><circle cx="24" cy="24" r="8"/></svg>',
  rod:    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M10 38 L38 10"/><circle cx="10" cy="38" r="3" fill="currentColor"/><circle cx="38" cy="10" r="3" fill="currentColor"/></svg>',
  tripod: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 8 L12 40 M24 8 L24 40 M24 8 L36 40 M14 30 L34 30"/></svg>',
  astro:  '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="16"/><path d="M10 24h28M24 10v28" stroke-width="2"/><path d="M14 16 L34 32" stroke-width="2"/></svg>',
  page:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M12 6 h18 l6 6 v30 h-24 Z"/><path d="M30 6 v6 h6" /><path d="M17 22 h14 M17 28 h14 M17 34 h9"/></svg>',
  chart:  '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 40 L8 10 L40 10" /><path d="M8 40 L40 40 L40 10"/><path d="M8 30 C 16 20, 24 34, 40 18" stroke-width="2"/></svg>'
};

const ITEMS = {
  escudo_ancla:      { name:"Fragmento de escudo: ancla",     img:A+"escudo_ancla.webp",      icon:ICON.shard },
  escudo_torre:      { name:"Fragmento de escudo: torre",     img:A+"escudo_torre.webp",      icon:ICON.shard },
  escudo_nave:       { name:"Fragmento de escudo: nao",       img:A+"escudo_nave.webp",       icon:ICON.shard },
  candil:            { name:"Candil de aceite",               img:A+"candil.webp",            icon:ICON.lamp },
  herramienta_taller:{ name:"Formón de tornero",               img:A+"herramienta_taller.webp",icon:ICON.tool },
  manivela_pozo:     { name:"Manivela del cabrestante",       img:A+"manivela_pozo.webp",     icon:ICON.crank },
  llave_biblioteca:  { name:"Llave de la librería",           img:A+"llave_biblioteca.webp",  icon:ICON.key },
  anillo_graduado:   { name:"Anillo graduado",                img:A+"anillo_graduado.webp",   icon:ICON.ring },
  alidada:           { name:"Alidada de bronce",              img:A+"alidada.webp",           icon:ICON.rod },
  soporte_tripode:   { name:"Trípode de latón",                img:A+"soporte_tripode.webp",   icon:ICON.tripod },
  astrolabio_parcial:{ name:"Astrolabio sin trípode",         img:A+"astrolabio_parcial.webp",icon:ICON.astro },
  astrolabio:        { name:"Astrolabio del piloto",          img:A+"astrolabio.webp",        icon:ICON.astro },
  fragmento_derrotero_1:{ name:"Hoja del derrotero (I)",       img:A+"fragmento_derrotero_1.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_2:{ name:"Hoja del derrotero (II)",      img:A+"fragmento_derrotero_2.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_3:{ name:"Hoja del derrotero (III)",     img:A+"fragmento_derrotero_3.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_4:{ name:"Hoja del derrotero (IV)",      img:A+"fragmento_derrotero_4.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_5:{ name:"Hoja del derrotero (V)",       img:A+"fragmento_derrotero_5.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  derrotero_verdadero:  { name:"El derrotero verdadero",       img:A+"derrotero_verdadero.webp",   icon:ICON.chart }
};

/* Colección acumulativa: las cinco hojas sueltas se ven en el inventario como una
 * sola entrada con progreso "n/5", no como cinco objetos independientes — se
 * siguen guardando y consumiendo igual (S.has/S.removeItem por id), esto es solo
 * la representación visual (ver TD.render.renderInventory). */
const GROUPS = {
  fragmentos_derrotero: { name:"Hojas del derrotero", icon:ICON.page, img:A+"fragmento_derrotero_1.webp", total:5 }
};

/* Combinaciones de inventario: dos objetos seleccionados en secuencia producen un tercero.
 * (El escudo y el derrotero se resuelven en su propio mueble/hueco, no por combinación:
 * ver taller.js/despacho.js — solo el astrolabio se monta pieza a pieza en el inventario.) */
const COMBOS = [
  { a:"alidada", b:"anillo_graduado", result:"astrolabio_parcial",
    message:"Encajas la alidada en el anillo graduado. Falta el trípode para sostenerlo firme." },
  { a:"astrolabio_parcial", b:"soporte_tripode", result:"astrolabio", flag:"astrolabioListo",
    message:"El astrolabio queda montado sobre su trípode de latón. El piloto lo reconocería." }
];

const INTRO_TEXT = "El Palacio de Valderas lleva cerrado desde 1699. Te han encargado inventariar lo que quede antes de la venta. La cancela del zaguán no se abre desde hace generaciones.";

const F = k => s => !!s.flags[k];
const I = k => s => s.items.includes(k);

/* Notas: lo que el jugador ha aprendido, en orden de descubrimiento. */
const NOTES = [
  { when:F("aldabaLeida"),        text:"Inscripción del zaguán: «Toca primero la estrella que guía, luego el ancla que sujeta, y por último la nao que parte»." },
  { when:F("placaLeida"),         text:"Placa del patio: «Aquí se lloró, en 1697, la pérdida de la Nuestra Señora del Rocío»." },
  { when:F("diarioLeido"),        text:"Diario de Valderas: el bajío que hundió al Rocío nunca se marcó en las cartas oficiales; él lo sabía. «Me retiro este año de 1699, para no volver a hablar de aquella noche»." },
  { when:F("planoTallerVisto"),   text:"Plano del taller: engranajes en escuadra, norte-este-sur; y la acequia, las tres llaves cerradas al final." },
  { when:F("marcaAcequiaVista"),  text:"Poste junto a las macetas del jardín: tres muescas, mediodía-levante-poniente. El orden de las llaves de la acequia." },
  { when:F("codiceResuelto"),     text:"El códice ordenado por estaciones señala un lomo verde en el segundo estante: «Derroteros, tomo II»." },
  { when:F("despachoAbierto"),    text:"El escudo de los Valderas —ancla, torre y nao— ha abierto el despacho." },
  { when:F("cajonFechaAbierto"),  text:"El cajón del escritorio se abrió con 1699, el año del retiro." },
  { when:F("valvulasResueltas"),  text:"Las tres llaves de la acequia, cerradas: el arriate seco dejó ver lo que escondía." },
  { when:F("pasadizoAbierto"),    text:"El aljibe del patio, vaciado, dejó una losa suelta en el fondo." },
  { when:F("astrolabioListo"),    text:"El astrolabio del piloto está completo: alidada, anillo y trípode." },
  { when:F("derroteroListo"),     text:"Las cinco hojas del derrotero, unidas, trazan un rumbo distinto al oficial." },
  { when:F("faseCompletada"),     text:"La azotea reveló el compartimento final: el derrotero verdadero ha vuelto a la luz." }
];
const NOTES_EMPTY = "Aún no has anotado nada.";

const PROGRESS = [
  { key:"zaguanAbierto",     label:"Cancela del zaguán" },
  { key:"despachoAbierto",   label:"Despacho del piloto" },
  { key:"bibliotecaAbierta", label:"Librería" },
  { key:"pasadizoAbierto",   label:"Aljibe del patio" },
  { key:"engranajesResueltos", label:"Engranajes del taller" },
  { key:"valvulasResueltas", label:"Acequia del jardín" },
  { key:"astrolabioListo",   label:"Astrolabio montado" },
  { key:"derroteroListo",    label:"Derrotero reconstruido" },
  { key:"ruedaResuelta",     label:"Rueda de constelaciones" },
  { key:"faseCompletada",    label:"Compartimento final" }
];

/* Pistas: la primera cuya condición se cumple. `tiers` = 3 niveles que escalan si se pulsa
 * "Pista" varias veces seguidas para el MISMO acertijo (ver actions.js:hint). */
const H = (when,tiers)=>({when,tiers});
const HINTS = [
  H(s=>F("astrolabioListo")(s) && F("derroteroListo")(s) && !F("ruedaLubricada")(s), [
    "La rueda de constelaciones de la azotea no gira: el eje está agarrotado.",
    "Algo con aceite podría soltar ese eje oxidado.",
    "Usa el candil de aceite sobre la rueda de constelaciones para poder girarla."
  ]),
  H(s=>F("astrolabioListo")(s) && F("derroteroListo")(s) && F("ruedaLubricada")(s) && !F("ruedaResuelta")(s), [
    "En la azotea, la rueda de constelaciones espera una fecha.",
    "El derrotero verdadero lleva escrita una fecha de rumbo: gira la rueda hasta esa palabra.",
    "Abre el derrotero verdadero y gira la rueda de la azotea hasta 'OCTUBRE'."
  ]),
  H(s=>F("astrolabioListo")(s) && !F("derroteroListo")(s), [
    "A la azotea solo se sube con el trabajo del piloto terminado.",
    "Aún falta reunir las cinco hojas del derrotero en la mesa del despacho.",
    "Cuando tengas las cinco hojas del derrotero, llévalas a la mesa del despacho para unirlas."
  ]),
  H(s=>!F("astrolabioListo")(s) && F("derroteroListo")(s), [
    "A la azotea solo se sube con el trabajo del piloto terminado.",
    "Aún falta montar el astrolabio completo: alidada, anillo y trípode.",
    "Combina la alidada con el anillo graduado, y el resultado con el trípode de latón."
  ]),
  H(s=>F("valvulasResueltas")(s) && !F("frag5Taken")(s), [
    "El arriate seco del jardín no era solo tierra.",
    "Ahora que la acequia corre limpia, mira bajo el arriate que quedó al descubierto.",
    "Examina el arriate seco del jardín: ahí apareció una de las hojas del derrotero."
  ]),
  H(s=>F("planoTallerVisto")(s) && !F("valvulasResueltas")(s), [
    "Las válvulas del jardín no se cierran al azar: importa el orden, no solo el resultado.",
    "El plano del taller describe la acequia: al final, las tres llaves cerradas — pero hay una marca en el propio jardín que da el orden exacto para llegar ahí.",
    "Junto a las macetas de jazmín y romero hay un poste con tres muescas: mediodía, levante, poniente. Cierra las tres llaves en ese orden; si te equivocas, las tres se abren de golpe y puedes volver a intentarlo."
  ]),
  H(s=>F("despachoAbierto")(s) && !F("valvulasResueltas")(s) && !F("planoTallerVisto")(s), [
    "El taller guarda un plano en la pared que aún no has mirado.",
    "Revisa la pared del taller: hay un plano con anotaciones sobre engranajes y acequia.",
    "En el taller, examina el plano de la pared antes de tocar las válvulas del jardín o los engranajes."
  ]),
  H(s=>F("herramientaTaken")(s) && !F("engranajesResueltos")(s) && F("planoTallerVisto")(s), [
    "Los tres engranajes del taller no giran solos.",
    "El plano marca norte, este y sur para los tres engranajes, en ese orden de izquierda a derecha.",
    "Gira los engranajes hasta N-E-S (izquierda, centro, derecha) según el plano del taller."
  ]),
  H(s=>F("despachoAbierto")(s) && !F("herramientaTaken")(s), [
    "El taller tiene un cajón bloqueado por un barril pesado.",
    "Empuja el barril del taller para llegar al cajón con el formón.",
    "En el taller, empuja el barril apoyado contra el cajón: dentro está el formón."
  ]),
  H(s=>F("cajonFechaAbierto")(s) && !F("bibliotecaAbierta")(s), [
    "Tienes una llave que no has usado todavía.",
    "La llave de la librería abre una puerta que sale del patio.",
    "Usa la llave de la librería en la puerta de la librería, junto al patio."
  ]),
  H(s=>F("despachoAbierto")(s) && !F("cajonFechaAbierto")(s), [
    "El escritorio del despacho tiene un cajón con cuatro ruedas numeradas.",
    "El diario, sobre el mismo escritorio, menciona un año: no es 1697.",
    "El cajón se abre con 1699, el año en que Valderas se retiró, según su propio diario."
  ]),
  H(s=>F("bibliotecaAbierta")(s) && !F("codiceResuelto")(s), [
    "Las hojas sueltas del códice no están en orden.",
    "Cada hoja lleva una estación del año dibujada en la esquina.",
    "Ordena las cuatro hojas del códice: primavera, verano, otoño, invierno, de izquierda a derecha."
  ]),
  H(s=>!F("despachoAbierto")(s) && (s.items.includes("escudo_ancla")||s.items.includes("escudo_torre")||s.items.includes("escudo_nave")), [
    "El escudo de la puerta del salón tiene tres huecos vacíos.",
    "Busca los tres fragmentos del escudo: uno en el zaguán, otro en el salón, otro en el jardín.",
    "Con los tres fragmentos —ancla, torre y nao— en el inventario, usa la puerta heráldica del salón."
  ]),
  H(s=>F("zaguanAbierto")(s) && !F("despachoAbierto")(s), [
    "El zaguán ya se ha abierto: explora patio, salón y jardín.",
    "Busca los tres fragmentos de un escudo repartido por la casa.",
    "Reúne ancla (zaguán), torre (salón) y nao (jardín), y llévalos a la puerta heráldica del salón."
  ]),
  H(s=>true, [
    "La cancela del zaguán no cede a la fuerza: algo en la propia puerta da la pista.",
    "Lee la inscripción junto a la aldaba del zaguán antes de tocarla.",
    "Toca la aldaba en este orden: estrella, ancla, nao."
  ])
];
const HINT_FALLBACK = "Observa la casa: cada rincón cuenta algo de Valderas.";

const END = {
  when: F("faseCompletada"),
  title: "El derrotero verdadero",
  text: "El compartimento se abre y la luz de la tarde cae sobre las hojas que Valderas nunca pudo entregar. El Rocío se perdió por un bajío que nadie quiso marcar en las cartas oficiales; su piloto lo supo siempre. Cierras el derrotero verdadero. Alguien, por fin, lo sabrá también."
};

/* Crónica global (ver js/engine/chronicle.js, DECISIONS.md D017): qué aprende esta fase,
 * y con qué flag ya existente. Puramente aditivo — no cambia el comportamiento de la fase.
 * Misma clave que en faro.js: dos historias sin relación entre sí, siglos y océanos
 * aparte, confirman el mismo patrón por separado. */
const CHRONICLE = [
  { flag:"diarioLeido", key:"conocimiento.encubrimiento_naval",
    label:"Más de una autoridad marítima ha ocultado la verdad de un naufragio para no reconocer su propio error." }
];

return {
  id:"derrotero",
  name:"El Derrotero Perdido",
  startScene:"derrotero_zaguan",
  saveKey:"trickyDoors.derrotero.save",
  data:{ ITEMS, ICON, GROUPS, COMBOS, INTRO_TEXT, NOTES, NOTES_EMPTY, PROGRESS, HINTS, HINT_FALLBACK, END, CHRONICLE }
};
})());
