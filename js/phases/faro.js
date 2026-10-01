/* TRICKY DOORS — fase 4: El Faro de Punta Corvo
 * Datos de la fase: objetos, combinaciones, notas, progreso, pistas y final.
 * Escenarios en js/scenes/faro/*.js (phase:"faro"). Diseño: docs/faro/README.md.
 * Las condiciones `when(s)` reciben el gameState (s.flags, s.items, s.scene...).
 */
window.TD = window.TD || {};

TD.registerPhase((function(){
const A = "assets/faro/items/";

/* Iconos SVG de respaldo (si falta la imagen del objeto). */
const ICON = {
  key:    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M31 24v5"/></svg>',
  gear:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="7"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.9 9.9l4.2 4.2M33.9 33.9l4.2 4.2M9.9 38.1l4.2-4.2M33.9 14.1l4.2-4.2"/><circle cx="24" cy="24" r="15"/></svg>',
  tool:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 38 L26 22"/><path d="M28 12 L38 22 L34 26 L24 16 Z"/></svg>',
  page:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M12 6 h18 l6 6 v30 h-24 Z"/><path d="M30 6 v6 h6" /><path d="M17 22 h14 M17 28 h14 M17 34 h9"/></svg>',
  book:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 8 h16 v32 h-16 Z"/><path d="M24 8 h16 v32 h-16 Z"/><path d="M24 8 v32" stroke-width="2"/></svg>',
  can:    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M12 16 h24 v24 h-24 Z"/><path d="M18 16 v-6 h12 v6"/></svg>',
  helmet: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 30 a16 16 0 0 1 32 0 v6 h-32 Z"/><circle cx="24" cy="26" r="6"/></svg>',
  belt:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><rect x="6" y="20" width="36" height="8" rx="2"/><rect x="20" y="18" width="8" height="12" rx="1"/></svg>',
  diving: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 26 a16 16 0 0 1 32 0 v6 h-32 Z"/><circle cx="24" cy="24" r="5"/><rect x="10" y="34" width="28" height="6" rx="2"/></svg>',
  bell:   '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 6 C14 6 12 20 10 30 h28 C36 20 34 6 24 6 Z"/><path d="M8 30 h32 v4 h-32 Z"/><circle cx="24" cy="40" r="3"/></svg>'
};

const ITEMS = {
  llave_arcon:        { name:"Llave del arcón",          img:A+"llave_arcon.webp",        icon:ICON.key },
  pieza_mecanismo_1:  { name:"Pieza del mecanismo (I)",  img:A+"pieza_mecanismo_1.webp",   icon:ICON.gear },
  herramienta_taller: { name:"Herramienta de torrero",   img:A+"herramienta_taller.webp",  icon:ICON.tool },
  plano_original:     { name:"Plano original",           img:A+"plano_original.webp",      icon:ICON.page },
  pieza_mecanismo_2:  { name:"Pieza del mecanismo (II)", img:A+"pieza_mecanismo_2.webp",   icon:ICON.gear },
  libro_codigos:      { name:"Libro de señales",         img:A+"libro_codigos.webp",       icon:ICON.book },
  pieza_mecanismo_3:  { name:"Pieza del mecanismo (III)",img:A+"pieza_mecanismo_3.webp",   icon:ICON.gear },
  combustible:        { name:"Bidón de aceite",          img:A+"combustible.webp",         icon:ICON.can },
  casco_buzo:         { name:"Casco de buceo",           img:A+"casco_buzo.webp",          icon:ICON.helmet },
  lastre:             { name:"Cinturón de lastre",       img:A+"lastre.webp",              icon:ICON.belt },
  equipo_buceo:       { name:"Equipo de buceo",          img:A+"equipo_buceo.webp",        icon:ICON.diving },
  mecanismo_parcial:  { name:"Mecanismo a medio montar", img:A+"mecanismo_parcial.webp",   icon:ICON.gear },
  mecanismo_completo: { name:"Mecanismo de la sirena",   img:A+"mecanismo_completo.webp",  icon:ICON.gear },
  campana_santa_comba:{ name:"Campana del Santa Comba",  img:A+"campana_santa_comba.webp", icon:ICON.bell }
};

/* Combinaciones de inventario: dos objetos seleccionados en secuencia producen un tercero.
 * (Las piezas del mecanismo y el equipo de buceo se montan aquí; el resto de objetos se
 * resuelve en su propio mueble/hotspot, ver js/scenes/faro/*.js.) */
const COMBOS = [
  { a:"casco_buzo", b:"lastre", result:"equipo_buceo", flag:"buceoListo",
    message:"Ajustas el casco al cinturón de lastre. El equipo de buceo, pesado y anticuado, está listo." },
  { a:"pieza_mecanismo_1", b:"pieza_mecanismo_2", result:"mecanismo_parcial",
    message:"Las dos primeras piezas encajan por su eje común. Falta la tercera para que el mecanismo gire entero." },
  { a:"mecanismo_parcial", b:"pieza_mecanismo_3", result:"mecanismo_completo", flag:"mecanismoCompletado",
    message:"La tercera pieza cierra el mecanismo. Cuarenta años después, la sirena de niebla de Ramón Padrón podría volver a sonar." }
];

const INTRO_TEXT = "El Faro de Punta Corvo lleva apagado desde 1968. Te han encargado catalogarlo antes de que se convierta en museo.";

const F = k => s => !!s.flags[k];
const I = k => s => s.items.includes(k);

/* Notas: lo que el jugador ha aprendido, en orden de descubrimiento. */
const NOTES = [
  { when:F("placaLeida"),        text:"Placa conmemorativa de la vivienda: «A la memoria del vapor Santa Comba, perdido en este cabo el 24 de agosto de 1911»." },
  { when:F("diarioLeido"),       text:"Diario de Ramón Padrón: la sirena de niebla llevaba meses averiada; pidió el repuesto tres veces. «Si esta noche pasa algo, que nadie diga que no avisé.» La comisión lo culpó igualmente." },
  { when:F("planoLeido"),        text:"Plano original del mecanismo, con anotaciones de dos letras distintas: la de Ramón, y encima, más reciente, la de su hijo Xacobe, terminando lo que el padre dejó a medio dibujar." },
  { when:F("cajonGuardiaAbierto"),text:"El cajón de la guardia cede con la misma fecha de la placa: 24 de agosto. Dentro, además de una pieza del mecanismo, la tabla de mareas confirma que hoy es también marea viva." },
  { when:F("libroLeido"),        text:"Libro de señales del faro: el código de destellos de Punta Corvo, el mismo desde 1867, nunca llegó a cambiarse." },
  { when:F("buceoListo"),        text:"El equipo de buceo, aunque anticuado, es el mismo con el que Xacobe debió bajar a la cueva, años atrás, a por la campana." },
  { when:F("mecanismoCompletado"),text:"El mecanismo de la sirena está completo: la pieza que Ramón empezó y las dos que Xacobe terminó, cuarenta años después." },
  { when:F("campanaTaken"),      text:"La campana del Santa Comba, cubierta de percebes, todavía lleva grabado el nombre del vapor." },
  { when:F("faseCompletada"),    text:"La sirena de Punta Corvo ha sonado, una sola vez, tal y como debió sonar aquella noche de 1911." }
];
const NOTES_EMPTY = "Aún no has anotado nada.";

const PROGRESS = [
  { key:"arconAbierto",       label:"Arcón de la vivienda" },
  { key:"armarioAbierto",     label:"Armario del taller" },
  { key:"cajonGuardiaAbierto",label:"Cajón de la guardia" },
  { key:"buceoListo",         label:"Equipo de buceo" },
  { key:"mecanismoCompletado",label:"Mecanismo completo" },
  { key:"campanaTaken",       label:"Campana del Santa Comba" },
  { key:"mecanismoMontado",   label:"Mecanismo instalado" },
  { key:"campanaMontada",     label:"Campana colgada" },
  { key:"lamparaCargada",     label:"Lámpara cargada" },
  { key:"faseCompletada",     label:"La sirena suena" }
];

/* Pistas: la primera cuya condición se cumple. `tiers` = 3 niveles que escalan si se pulsa
 * "Pista" varias veces seguidas para el MISMO acertijo (ver actions.js:hint). */
const H = (when,tiers)=>({when,tiers});
const HINTS = [
  H(s=>!s.flags.llaveArconTaken, [
    "En la vivienda hay un arcón cerrado.",
    "La llave del arcón no estará lejos: revisa el hogar de la vivienda.",
    "Busca en la caja de ceniza del hogar, en la propia vivienda."
  ]),
  H(s=>s.flags.llaveArconTaken && !s.flags.arconAbierto, [
    "Ya tienes una llave pequeña.",
    "Selecciona la llave del arcón y úsala sobre el arcón mismo.",
    "Selecciona 'Llave del arcón' en el inventario y pulsa sobre el arcón de la vivienda."
  ]),
  H(s=>!s.flags.herramientaTaken, [
    "El taller esconde una herramienta.",
    "Algo bloquea el paso en el taller: un barril pesado.",
    "Aparta el barril del taller para encontrar la herramienta de torrero."
  ]),
  H(s=>s.flags.herramientaTaken && !s.flags.armarioAbierto, [
    "El armario del taller está cerrado.",
    "Ya tienes una herramienta: podría forzar la cerradura del armario.",
    "Usa el armario del taller: la herramienta ya en tu poder lo abrirá."
  ]),
  H(s=>!s.flags.placaLeida, [
    "La vivienda guarda alguna inscripción.",
    "Lee la placa conmemorativa de la vivienda antes de subir a la guardia.",
    "La placa de la vivienda da una fecha en formato día/mes: la necesitarás en la guardia."
  ]),
  H(s=>s.flags.placaLeida && !s.flags.cajonGuardiaAbierto, [
    "El cajón de la guardia tiene una cerradura de cuatro ruedas.",
    "La fecha de la placa de la vivienda (día y mes) abre el cajón de la guardia.",
    "Pon el cajón de la guardia en 2408: 24 de agosto."
  ]),
  H(s=>s.flags.herramientaTaken && !s.flags.buceoListo, [
    "En la despensa hay cajones atascados.",
    "La misma herramienta del taller sirve para forzar los cajones de la despensa.",
    "Fuerza los cajones de la despensa con la herramienta; luego combina el casco y el lastre."
  ]),
  H(s=>(!s.flags.tideSolved || !s.items.includes("equipo_buceo")) && (s.flags.tideSolved || s.items.includes("equipo_buceo")), [
    "La cueva no se deja entrar todavía.",
    "Hace falta conocer la marea (guardia) Y tener el equipo de buceo (despensa) para entrar en la cueva.",
    "Resuelve el cajón de la guardia y monta el equipo de buceo en la despensa: ambos abren la cueva."
  ]),
  H(s=>!s.items.includes("mecanismo_completo") && (s.items.includes("pieza_mecanismo_1")||s.items.includes("pieza_mecanismo_2")||s.items.includes("pieza_mecanismo_3")||s.items.includes("mecanismo_parcial")), [
    "Tienes piezas del mecanismo sueltas.",
    "Selecciona dos piezas del mecanismo, una tras otra, para combinarlas.",
    "Combina las tres piezas del mecanismo: dos primero, y el resultado con la tercera."
  ]),
  H(s=>s.items.includes("mecanismo_completo") && s.items.includes("campana_santa_comba") && !s.flags.faseCompletada, [
    "En la linterna hay tres cosas por hacer antes de encender.",
    "Usa el mecanismo, la campana y el combustible cada uno en su sitio dentro de la linterna.",
    "Monta el mecanismo, cuelga la campana y carga la lámpara; luego enciende."
  ])
];
const HINT_FALLBACK = "Sigue explorando la vivienda, el taller, la guardia y la despensa: todavía queda algo por encontrar.";

const END = {
  when: F("faseCompletada"),
  title: "La sirena de Punta Corvo",
  text: "El mecanismo gira, la campana del Santa Comba vibra una vez y el sonido cruza el cabo como no lo hizo aquella noche de 1911. Cuarenta años y dos torreros después, alguien ha terminado lo que Ramón Padrón dejó a medias."
};

/* Crónica global (ver js/engine/chronicle.js, DECISIONS.md D017): qué aprende esta fase,
 * y con qué flag ya existente. Puramente aditivo — no cambia el comportamiento de la fase.
 * Misma clave que en derrotero.js: dos historias sin relación entre sí, siglos y océanos
 * aparte, confirman el mismo patrón por separado. */
const CHRONICLE = [
  { flag:"diarioLeido", key:"conocimiento.encubrimiento_naval",
    label:"Más de una autoridad marítima ha ocultado la verdad de un naufragio para no reconocer su propio error." }
];

return {
  id:"faro",
  name:"El Faro de Punta Corvo",
  startScene:"faro_vivienda",
  data:{ ITEMS, COMBOS, INTRO_TEXT, NOTES, NOTES_EMPTY, PROGRESS, HINTS, HINT_FALLBACK, END, CHRONICLE }
};
})());
