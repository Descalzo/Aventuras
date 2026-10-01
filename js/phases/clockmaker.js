/* TRICKY DOORS — fase 1: La Habitación del Relojero
 * Datos de la fase: objetos, notas, progreso, pistas y final. Los escenarios
 * (study, hall, library, workshop) se registran en js/scenes/*.js con phase:"clockmaker".
 * Las condiciones `when(s)` reciben el gameState (s.flags, s.items, s.scene...).
 */
window.TD = window.TD || {};

TD.registerPhase((function(){
const ICON = {
  key:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M31 24v5"/></svg>',
  gear:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="7"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.9 9.9l4.2 4.2M33.9 33.9l4.2 4.2M9.9 38.1l4.2-4.2M33.9 14.1l4.2-4.2"/><circle cx="24" cy="24" r="15"/></svg>',
  fuse:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><rect x="6" y="18" width="36" height="12" rx="6"/><path d="M6 24H2M46 24h-4M18 24h12"/></svg>',
  bigKey:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="13" cy="24" r="9"/><circle cx="13" cy="24" r="3"/><path d="M22 24h24M40 24v8M34 24v6M28 24v4"/></svg>',
  disc:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="4"/></svg>',
  spring:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M8 34c4-8 8-8 12 0s8 8 12 0 8-8 12 0M6 14h36"/></svg>',
  crank:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M10 38V18h14v-8h14"/><circle cx="10" cy="40" r="3"/></svg>',
  pendulum:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 4v24"/><circle cx="24" cy="36" r="8"/></svg>'
};

/* Objetos de inventario. `icon` es un SVG de respaldo si falta la imagen. */
const ITEMS = {
  smallKey:   { name:"Llave pequeña",     img:"assets/items/item_small_key.webp",   icon:ICON.key },
  gear:       { name:"Engranaje",         img:"assets/items/item_gear.webp",        icon:ICON.gear },
  fuse:       { name:"Fusible",           img:"assets/items/item_fuse.webp",        icon:ICON.fuse },
  doorKey:    { name:"Llave ornamentada", img:"assets/items/item_door_key.webp",    icon:ICON.bigKey },
  workshopKey:{ name:"Llave del taller",  img:"assets/items/item_workshop_key.webp",icon:ICON.key },
  brassDisc:  { name:"Disco de latón",    img:"assets/items/item_brass_disc.webp",  icon:ICON.disc },
  spring:     { name:"Muelle",            img:"assets/items/item_spring.webp",      icon:ICON.spring },
  crank:      { name:"Manivela",          img:"assets/items/item_crank.webp",       icon:ICON.crank },
  pendulum:   { name:"Péndulo",           img:"assets/items/item_pendulum.webp",    icon:ICON.pendulum }
};

const INTRO_TEXT = "La puerta está cerrada. Hay algo extraño en esta habitación.";
const NOTE_TEXT = "Cuando el reloj se detuvo, marcaba las 08:25. El retrato esconde aquello que el tiempo olvidó.";

const F = k => s => !!s.flags[k];
const I = k => s => s.items.includes(k);

/* Notas: textos derivados del estado, en orden de descubrimiento. */
const NOTES = [
  { when:F("noteTaken"),                                text:"La nota dice: “"+NOTE_TEXT+"”" },
  { when:s=>s.flags.pictureMoved && !s.flags.safeOpen,  text:"Tras el retrato hay una caja fuerte con cuatro ruedas numéricas." },
  { when:F("safeOpen"),                                 text:"La caja fuerte contenía un engranaje y un fusible." },
  { when:F("clockRepaired"),                            text:"El reloj del estudio vuelve a funcionar. Soltó una llave ornamentada." },
  { when:F("panelPowered"),                             text:"La cerradura electrónica del estudio tiene corriente." },
  { when:F("portraitSeen"),                             text:"El reloj de bolsillo del retrato marca las 3:40." },
  { when:F("plaqueRead"),                               text:"Placa del vestíbulo: “Nada se mueve sin su peso. La hora es la que él guarda en el pecho.”" },
  { when:F("ledgerRead"),                               text:"Registro: el número de serie del torno abre el armario del taller. La llave del taller está bajo Cronos. El disco, donde el mundo se abre por el norte. El portón cede con su péndulo y a la hora del retrato." },
  { when:F("latheRead"),                                text:"La placa del torno dice: BRAMAH · Nº 417." },
  { when:F("cabinetOpen"),                              text:"El armario del taller estaba cerrado con el 417. Contenía una manivela y un muelle." },
  { when:F("pendulumMade"),                             text:"Con el disco de latón y el muelle has montado un péndulo." },
  { when:F("pendulumInstalled"),                        text:"El péndulo oscila en el portón." },
  { when:F("gateTimeSet"),                              text:"Las manecillas del portón marcan la hora del retrato." }
];
const NOTES_EMPTY = "Aún no has encontrado ninguna pista.";

/* Progreso global (flags clave). */
const PROGRESS = [
  { key:"drawerOpen",       label:"Cajón del estudio" },
  { key:"safeOpen",         label:"Caja fuerte" },
  { key:"clockRepaired",    label:"Reloj del estudio" },
  { key:"doorOpen",         label:"Puerta del estudio" },
  { key:"ledgerRead",       label:"Registro de la biblioteca" },
  { key:"workshopUnlocked", label:"Taller abierto" },
  { key:"cabinetOpen",      label:"Armario del taller" },
  { key:"pendulumMade",     label:"Péndulo montado" },
  { key:"gateOpen",         label:"Portón" }
];

/* Pistas contextuales: la primera cuya condición se cumple (de más avanzada a más inicial). */
const H = (when,text)=>({when,text});
const HINTS = [
  H(F("gateOpen"), "El portón está abierto. Sal de la casa."),
  H(s=>F("pendulumInstalled")(s) && F("gateTimeSet")(s) && F("crankPlaced")(s), "Todo está listo. Gira la manivela del portón."),
  H(s=>F("pendulumInstalled")(s) && F("gateTimeSet")(s) && I("crank")(s), "Coloca la manivela en el encastre del portón y gírala."),
  H(s=>F("pendulumInstalled")(s) && !F("gateTimeSet")(s) && F("portraitSeen")(s), "Las ruedas del portón deben marcar la hora del retrato: las tres y cuarenta."),
  H(s=>F("pendulumInstalled")(s) && !F("gateTimeSet")(s), "El portón necesita una hora. Mira de cerca el reloj de bolsillo del retrato del estudio."),
  H(s=>I("pendulum")(s), "Lleva el péndulo al mecanismo del portón, en el vestíbulo."),
  H(s=>F("discPlaced")(s) && I("spring")(s), "El disco está en el tornillo de banco. Únele el muelle."),
  H(s=>I("brassDisc")(s) && I("spring")(s), "En el tornillo de banco del taller puedes unir el disco y el muelle."),
  H(s=>F("cabinetOpen")(s) && !F("cabinetEmptied")(s), "El armario del taller está abierto. Coge lo que hay dentro."),
  H(s=>F("latheRead")(s) && !F("cabinetOpen")(s), "El candado del armario pide tres cifras: 417, el número de serie del torno."),
  H(s=>F("workshopUnlocked")(s) && F("ledgerRead")(s) && !F("latheRead")(s), "El registro habla del número de serie del torno. Lee la placa del torno en el taller."),
  H(s=>F("workshopUnlocked")(s) && !F("ledgerRead")(s), "Lee el libro de registro de la biblioteca: explica cómo abrir el armario del taller."),
  H(s=>I("workshopKey")(s), "La llave del taller abre la puerta de la derecha del vestíbulo."),
  H(s=>F("ledgerRead")(s) && !F("bustMoved")(s), "El registro dice que la llave del taller está bajo Cronos: inclina el busto de la biblioteca."),
  H(s=>F("ledgerRead")(s) && !F("globeOpen")(s), "«Donde el mundo se abre por el norte»: prueba a presionar el polo norte del globo."),
  H(s=>F("doorOpen")(s) && s.scene==="study", "La puerta está abierta. Sal al pasillo."),
  H(s=>F("doorOpen")(s) && s.scene==="hall" && !F("ledgerRead")(s), "Empieza por la biblioteca, la puerta de la izquierda. Su libro de registro lo explica casi todo."),
  H(s=>F("doorOpen")(s), "Explora la biblioteca y el taller. El portón necesita un péndulo, una hora y una manivela."),
  H(s=>F("panelPowered")(s) && I("doorKey")(s), "La cerradura tiene corriente. Selecciona la llave ornamentada y úsala en la puerta."),
  H(s=>I("doorKey")(s) && !F("panelPowered")(s) && I("fuse")(s), "La puerta es eléctrica. El cuadro de la pared necesita el fusible."),
  H(s=>I("doorKey")(s) && !F("panelPowered")(s), "La puerta es eléctrica y no llega corriente. Algo falta en el cuadro eléctrico."),
  H(I("gear"), "El reloj está parado y tras el cristal falta una pieza."),
  H(s=>F("safeOpen")(s) && !F("safeEmptied")(s), "La caja fuerte está abierta. Mira dentro."),
  H(s=>F("pictureMoved")(s) && F("noteTaken")(s), "08:25 puede convertirse directamente en un código de cuatro cifras: 0825."),
  H(F("pictureMoved"), "Las ruedas piden un número. La nota del cajón habla de una hora."),
  H(F("noteTaken"), "La nota menciona el retrato. Examínalo de cerca."),
  H(F("drawerOpen"), "Dentro del cajón hay un sobre. Ábrelo."),
  H(I("smallKey"), "Una llave tan pequeña solo puede abrir algo pequeño. Acércate al cajón del escritorio."),
  H(s=>true, "Empieza por algo que pueda esconder un objeto pequeño, como la maceta.")
];
const HINT_FALLBACK = "Observa con calma cada rincón.";

/* Final del juego. */
const END = {
  when: F("gateOpen"),
  title: "Has salido de la casa",
  text: "El reloj del portón vuelve a latir y las puertas de hierro se abren al jardín nocturno. La casa del relojero queda atrás, con todos sus mecanismos en marcha."
};

return {
  id:"clockmaker",
  name:"La Habitación del Relojero",
  startScene:"study",
  saveKey:"trickyDoors.save",
  data:{ ITEMS, ICON, INTRO_TEXT, NOTE_TEXT, NOTES, NOTES_EMPTY, PROGRESS, HINTS, HINT_FALLBACK, END }
};
})());
