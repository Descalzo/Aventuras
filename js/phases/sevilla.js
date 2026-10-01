/* TRICKY DOORS — fase 2: La Casa de la Sirena (Sevilla)
 * Datos de la fase: objetos, notas, progreso, pistas y final. Escenarios en
 * js/scenes/sevilla/*.js (phase:"sevilla"). Diseño: SEVILLA_DESIGN.md.
 * Las condiciones `when(s)` reciben el gameState (s.flags, s.items, s.scene...).
 */
window.TD = window.TD || {};

TD.registerPhase((function(){
const A = "assets/sevilla/items/";

/* Iconos SVG de respaldo (si falta la imagen del objeto). */
const ICON = {
  rope:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><ellipse cx="24" cy="26" rx="16" ry="9"/><ellipse cx="24" cy="21" rx="16" ry="9"/><path d="M8 21v5M40 21v5"/></svg>',
  tile:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><rect x="8" y="8" width="32" height="32" rx="2"/><path d="M8 24h32M24 8v32"/></svg>',
  gnomon:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 38h28L10 12z"/></svg>',
  key:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M31 24v5"/></svg>',
  clapper:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 6v22"/><circle cx="24" cy="35" r="7"/><path d="M18 6h12"/></svg>'
};

const ITEMS = {
  rope:       { name:"Soga de esparto",       img:A+"item_rope.webp",        icon:ICON.rope },
  tileAnchor: { name:"Azulejo del ancla",     img:A+"item_tile_anchor.webp", icon:ICON.tile },
  tileBell:   { name:"Azulejo de la campana", img:A+"item_tile_bell.webp",   icon:ICON.tile },
  tileSun:    { name:"Azulejo del sol",       img:A+"item_tile_sun.webp",    icon:ICON.tile },
  gnomon:     { name:"Estilo de bronce",      img:A+"item_gnomon.webp",      icon:ICON.gnomon },
  stairsKey:  { name:"Llave de la reja",      img:A+"item_stairs_key.webp",  icon:ICON.key },
  clapper:    { name:"Badajo",                img:A+"item_clapper.webp",     icon:ICON.clapper }
};

const INTRO_TEXT = "La cancela se ha cerrado sola al caer la tarde. El patio huele a azahar y a piedra caliente.";

const F = k => s => !!s.flags[k];
const I = k => s => s.items.includes(k);

/* Notas: lo que el jugador ha aprendido, en orden de descubrimiento. */
const NOTES = [
  { when:F("plaqueRead"),      text:"Placa de la cancela: «SIRENA A LA MAR · CAMPANAS A SU TOQUE»." },
  { when:F("zocaloSeen"),      text:"Zócalo: cuatro azulejos de figura con numerales: sol I, estrella II, luna III, ancla IV." },
  { when:F("sundialRead"),     text:"Reloj de sol: inscripción MDCXX (1620). Le falta el estilo que proyecte la sombra." },
  { when:F("mapRead"),         text:"Mapa: la casa zarpó a las V de la tarde, río abajo hasta Sanlúcar, con viento de Lebeche (suroeste)." },
  { when:F("chestOpen"),       text:"La cajonera del archivo se abrió con 1620: dentro había el estilo de bronce y un azulejo con una campana." },
  { when:F("tallerOpen"),      text:"Los medallones de la puerta del taller siguen el orden del zócalo." },
  { when:F("sundialSet"),      text:"Con el estilo puesto y la sombra sobre las V, el reloj de sol abrió una hornacina." },
  { when:F("panelComplete"),   text:"Panel del taller completo: bajo las campanas hay numerales. Grande I · chica II · mediana III." },
  { when:F("vaneSet"),         text:"La sirena de la veleta mira al Lebeche, hacia la mar." },
  { when:F("toqueDone"),       text:"El toque de la casa ha soltado los cerrojos de la cancela." }
];
const NOTES_EMPTY = "Aún no has anotado nada.";

const PROGRESS = [
  { key:"tallerOpen",    label:"Puerta del taller" },
  { key:"chestOpen",     label:"Cajonera de mapas" },
  { key:"sundialSet",    label:"Reloj de sol" },
  { key:"stairsOpen",    label:"Reja de la escalera" },
  { key:"panelComplete", label:"Panel de azulejos" },
  { key:"vaneSet",       label:"Veleta" },
  { key:"toqueDone",     label:"Toque de campanas" },
  { key:"cancelaOpen",   label:"Cancela" }
];

/* Pistas: la primera cuya condición se cumple (de más avanzada a más inicial). */
const H = (when,text)=>({when,text});
const HINTS = [
  H(F("cancelaOpen"), "La cancela está abierta. Sal al callejón."),
  H(s=>F("toqueDone")(s), "Baja al patio: los cerrojos de la cancela se han retirado."),
  H(s=>F("vaneSet")(s) && F("ropeInstalled")(s) && F("panelComplete")(s), "Toca las campanas en el orden de los numerales del panel: grande, chica, mediana."),
  H(s=>F("vaneSet")(s) && F("ropeInstalled")(s), "Las campanas tienen un orden. El panel de azulejos del taller lo muestra cuando está completo."),
  H(s=>F("ropeInstalled")(s) && F("mapRead")(s) && !F("vaneSet")(s), "La sirena debe mirar a la mar: el mapa dice que el río lleva a Sanlúcar con viento de Lebeche."),
  H(s=>F("ropeInstalled")(s) && !F("vaneSet")(s), "La placa de la cancela habla de la sirena. El mapa del archivo dice hacia dónde va el río."),
  H(s=>F("clapperInstalled")(s) && I("rope")(s), "La campana grande ya tiene badajo. Ahora necesita su cuerda."),
  H(s=>F("clapperInstalled")(s), "La campana grande necesita una cuerda. En el patio hay una soga junto a un naranjo."),
  H(s=>F("stairsOpen")(s) && I("clapper")(s), "Sube a la azotea y pon el badajo en la campana grande."),
  H(s=>F("stairsOpen")(s) && !F("clapperTaken")(s), "En la azotea a la campana grande le falta el badajo. El horno del taller guarda algo."),
  H(s=>I("stairsKey")(s), "La llave de la hornacina abre la reja de la escalera."),
  H(s=>F("gnomonPlaced")(s) && F("mapRead")(s) && !F("sundialSet")(s), "Gira la esfera del reloj de sol hasta que la sombra caiga sobre las V, la hora a la que zarpó el piloto."),
  H(s=>F("gnomonPlaced")(s) && !F("sundialSet")(s), "La sombra ya cae. ¿A qué hora zarpó el piloto? El mapa del archivo lo dice."),
  H(s=>I("gnomon")(s), "El estilo de bronce es el gnomon del reloj de sol del patio."),
  H(s=>F("sundialRead")(s) && !F("chestOpen")(s), "MDCXX es una fecha. La cajonera del archivo pide cuatro cifras."),
  H(s=>F("mapRead")(s) && !F("chestOpen")(s), "La cajonera del archivo se abre con un año. Busca una fecha tallada en el patio."),
  H(s=>F("tallerOpen")(s) && !F("panelComplete")(s), "Al panel del taller le faltan tres azulejos: uno en el cielo, uno en la espadaña y uno en el río."),
  H(s=>F("zocaloSeen")(s) && !F("tallerOpen")(s), "Los medallones de la puerta del taller quieren los símbolos del zócalo, por su numeral: sol, estrella, luna, ancla."),
  H(s=>!F("zocaloSeen")(s), "Mira de cerca el zócalo de azulejos: hay cuatro figuras entre la lacería."),
  H(s=>true, "Explora el patio. El archivo está abierto.")
];
const HINT_FALLBACK = "Observa la arquitectura: la casa cuenta su historia.";

const END = {
  when: F("exited"),
  title: "Has salido al callejón",
  text: "Las campanas siguen sonando sobre los tejados y la sirena mira a la mar. La Casa de la Sirena vuelve a guardar su secreto, y tú conoces el toque."
};

/* Crónica global (ver js/engine/chronicle.js, DECISIONS.md D017): qué aprende esta fase,
 * y con qué flag ya existente. Puramente aditivo — no cambia el comportamiento de la fase. */
const CHRONICLE = [
  { flag:"plaqueRead", key:"simbolo.sirena_orientacion",
    label:"Una veleta con forma de sirena, orientada a la mar, formaba parte del mecanismo de una casa-palacio sevillana." }
];

return {
  id:"sevilla",
  name:"La Casa de la Sirena",
  startScene:"patio",
  saveKey:"trickyDoors.sevilla.save",
  data:{ ITEMS, ICON, INTRO_TEXT, NOTES, NOTES_EMPTY, PROGRESS, HINTS, HINT_FALLBACK, END, CHRONICLE }
};
})());
