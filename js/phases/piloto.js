/* TRICKY DOORS — fase 6: El Rumbo de la Casa
 * Fusión de "El Derrotero Perdido" y "La Casa de la Sirena" en una sola casa, una sola
 * historia: Andrés de Berrio, piloto mayor, levantó la casa en 1620 y la coronó con la
 * veleta-sirena; su descendiente Fadrique de Valderas, también piloto mayor, la heredó y
 * añadió sus propios candados sin desmontar los de su antepasado. Ambas fases originales
 * (derrotero, sevilla) siguen intactas y jugables por separado — esta fase reutiliza sus
 * escenas y objetos, adaptados, en js/scenes/piloto/*.js. Diseño acordado con el usuario en
 * la propia conversación (no hay documento aparte todavía).
 * Las condiciones `when(s)` reciben el gameState (s.flags, s.items, s.scene...).
 */
window.TD = window.TD || {};

TD.registerPhase((function(){
const AD = "assets/derrotero/items/";
const AS = "assets/sevilla/items/";

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
  chart:  '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 40 L8 10 L40 10" /><path d="M8 40 L40 40 L40 10"/><path d="M8 30 C 16 20, 24 34, 40 18" stroke-width="2"/></svg>',
  rope:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><ellipse cx="24" cy="26" rx="16" ry="9"/><ellipse cx="24" cy="21" rx="16" ry="9"/><path d="M8 21v5M40 21v5"/></svg>',
  tile:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><rect x="8" y="8" width="32" height="32" rx="2"/><path d="M8 24h32M24 8v32"/></svg>',
  gnomon:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 38h28L10 12z"/></svg>',
  clapper:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 6v22"/><circle cx="24" cy="35" r="7"/><path d="M18 6h12"/></svg>'
};

const ITEMS = {
  escudo_ancla:      { name:"Fragmento de escudo: ancla",     img:AD+"escudo_ancla.webp",      icon:ICON.shard },
  escudo_torre:      { name:"Fragmento de escudo: torre",     img:AD+"escudo_torre.webp",      icon:ICON.shard },
  escudo_nave:       { name:"Fragmento de escudo: nao",       img:AD+"escudo_nave.webp",       icon:ICON.shard },
  candil:            { name:"Candil de aceite",               img:AD+"candil.webp",            icon:ICON.lamp },
  herramienta_taller:{ name:"Formón de tornero",               img:AD+"herramienta_taller.webp",icon:ICON.tool },
  manivela_pozo:     { name:"Manivela del cabrestante",       img:AD+"manivela_pozo.webp",     icon:ICON.crank },
  llave_biblioteca:  { name:"Llave de la compuerta",           img:AD+"llave_biblioteca.webp",  icon:ICON.key },
  llave_taller:      { name:"Llave del taller",                img:AD+"llave_taller.webp",      icon:ICON.key },
  anillo_graduado:   { name:"Anillo graduado",                img:AD+"anillo_graduado.webp",   icon:ICON.ring },
  alidada:           { name:"Alidada de bronce",              img:AD+"alidada.webp",           icon:ICON.rod },
  soporte_tripode:   { name:"Trípode de latón",                img:AD+"soporte_tripode.webp",   icon:ICON.tripod },
  astrolabio_parcial:{ name:"Astrolabio sin trípode",         img:AD+"astrolabio_parcial.webp",icon:ICON.astro },
  astrolabio:        { name:"Astrolabio del piloto",          img:AD+"astrolabio.webp",        icon:ICON.astro },
  aguja_constelaciones:{ name:"Aguja de constelaciones",      img:AD+"aguja_constelaciones.webp", icon:ICON.rod },
  fragmento_derrotero_1:{ name:"Hoja del derrotero (I)",       img:AD+"fragmento_derrotero_1.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_2:{ name:"Hoja del derrotero (II)",      img:AD+"fragmento_derrotero_2.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_3:{ name:"Hoja del derrotero (III)",     img:AD+"fragmento_derrotero_3.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_4:{ name:"Hoja del derrotero (IV)",      img:AD+"fragmento_derrotero_4.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  fragmento_derrotero_5:{ name:"Hoja del derrotero (V)",       img:AD+"fragmento_derrotero_5.webp", icon:ICON.page, group:"fragmentos_derrotero" },
  derrotero_verdadero:  { name:"El derrotero verdadero",       img:AD+"derrotero_verdadero.webp",   icon:ICON.chart },
  rope:       { name:"Soga de esparto",       img:AS+"item_rope.webp",        icon:ICON.rope },
  tileAnchor: { name:"Azulejo del ancla",     img:AS+"item_tile_anchor.webp", icon:ICON.tile },
  tileBell:   { name:"Azulejo de la campana", img:AS+"item_tile_bell.webp",   icon:ICON.tile },
  tileSun:    { name:"Azulejo del sol",       img:AS+"item_tile_sun.webp",    icon:ICON.tile },
  gnomon:     { name:"Estilo de bronce",      img:AS+"item_gnomon.webp",      icon:ICON.gnomon },
  stairsKey:  { name:"Llave de la reja",      img:AS+"item_stairs_key.webp",  icon:ICON.key },
  clapper:    { name:"Badajo",                img:AS+"item_clapper.webp",     icon:ICON.clapper }
};

const GROUPS = {
  fragmentos_derrotero: { name:"Hojas del derrotero", icon:ICON.page, img:AD+"fragmento_derrotero_1.webp", total:5 }
};

const COMBOS = [
  { a:"alidada", b:"anillo_graduado", result:"astrolabio_parcial",
    message:"Encajas la alidada en el anillo graduado. Falta el trípode para sostenerlo firme." },
  { a:"astrolabio_parcial", b:"soporte_tripode", result:"astrolabio", flag:"astrolabioListo",
    message:"El astrolabio queda montado sobre su trípode de latón. El piloto lo reconocería." }
];

const INTRO_TEXT = "La casa lleva cerrada desde que el último de los Valderas se retiró, en 1699. Te han encargado inventariarla antes de la venta. Nadie recuerda ya que, mucho antes de Valderas, la levantó otro piloto mayor: Andrés de Berrio, en 1620.";

const F = k => s => !!s.flags[k];
const I = k => s => s.items.includes(k);

const NOTES = [
  { when:F("aldabaLeida"),        text:"Inscripción del zaguán: «Toca primero la estrella que guía, luego el ancla que sujeta, y por último la nao que parte»." },
  { when:F("sundialRead"),        text:"El reloj de sol del patio: MDCXX (1620). En una placa más pequeña, casi borrada: «Aquí se lloró, en 1697, la pérdida de la Nuestra Señora del Rocío. D. Fadrique de Valderas, piloto mayor»." },
  { when:F("zocaloSeen"),         text:"Zócalo del patio: cuatro azulejos con numerales — sol I, estrella II, luna III, ancla IV." },
  { when:F("diarioLeido"),        text:"Diario de Valderas: el bajío que hundió al Rocío nunca se marcó en las cartas oficiales; él lo sabía. «Me retiro este año de 1699, para no volver a hablar de aquella noche»." },
  { when:F("mapRead"),            text:"Mapa del archivo antiguo: la casa zarpó a las V de la tarde, río abajo hasta Sanlúcar, con viento de Lebeche (suroeste)." },
  { when:F("chestOpen"),          text:"La cajonera del archivo se abrió con 1620: dentro, un estilo de bronce y un azulejo con una campana." },
  { when:F("planoTallerVisto"),   text:"Plano del taller: engranajes en escuadra, norte-este-sur; la acequia, las tres llaves cerradas en orden mediodía-levante-poniente. En una esquina, añadido después: tres campanas, cada una con su propia voz — sin decir en qué orden." },
  { when:F("marcaAcequiaVista"),  text:"Poste junto a las macetas del jardín: tres muescas, mediodía-levante-poniente. El orden de las llaves de la acequia." },
  { when:F("llaveTallerTaken"),   text:"Entre las raíces del tabaco del jardín había una llave de hierro: abre la puerta del taller de instrumentos." },
  { when:F("tallerAbierto"),      text:"La llave del tabaco abrió la puerta del taller de instrumentos, al fondo de la galería del jardín." },
  { when:F("codiceResuelto"),     text:"El códice ordenado por estaciones señala un lomo verde en el segundo estante: «Derroteros, tomo II»." },
  { when:F("despachoAbierto"),    text:"El escudo de la familia —ancla, torre y nao— ha abierto el despacho." },
  { when:F("cajonFechaAbierto"),  text:"El cajón del escritorio se abrió con 1699, el año del retiro de Valderas. Dentro, ya vacío, una nota: «Cuando el derrotero verdadero y el astrolabio del piloto reposen juntos sobre esta mesa, la llave aparecerá donde debe estar»." },
  { when:F("astrolabioExpuesto"), text:"El astrolabio del piloto descansa ahora sobre el derrotero verdadero, en la mesa del despacho." },
  { when:F("llaveBibliotecaTaken"), text:"Con el derrotero y el astrolabio juntos sobre la mesa, el fondo del cajón del escritorio ya no está vacío: apareció la llave de la compuerta." },
  { when:F("compuertaTallerAbierta"), text:"Esa llave —recompensa por reunir el derrotero y el astrolabio— abre, en realidad, la compuerta del techo del taller de instrumentos." },
  { when:F("sundialSet"),         text:"Con el estilo puesto y la sombra sobre las V, el reloj de sol abrió una hornacina." },
  { when:F("azulejosOpen"),       text:"Los medallones de la puerta lateral del zaguán siguen el orden del zócalo del patio." },
  { when:F("panelComplete"),      text:"Panel del taller de azulejos completo: bajo las campanas hay tres notas pintadas. Chica SOL · mediana MI · grande DO." },
  { when:F("valvulasResueltas"),  text:"Las tres llaves de la acequia, cerradas: el arriate seco dejó ver lo que escondía." },
  { when:F("vaneSet"),            text:"La sirena de la veleta mira al Lebeche, hacia la mar." },
  { when:F("toqueDone"),          text:"El toque de la casa ha sonado: DO-MI-SOL-DO-SOL-MI-DO, un repique que sube y vuelve a bajar. La veleta, ya inmóvil, soltó su aguja de bronce." },
  { when:F("agujaPlaced"),        text:"La aguja de la veleta encaja en el eje de la rueda de constelaciones: ahora señala algo." },
  { when:F("tragaluzVisto"),      text:"Desde que la rueda de la azotea volvió a girar, la luna entra por el tragaluz del despacho y señala Sanlúcar en el mapamundi." },
  { when:F("astrolabioListo"),    text:"El astrolabio del piloto está completo: alidada, anillo y trípode." },
  { when:F("derroteroListo"),     text:"Las cinco hojas del derrotero, unidas, trazan un rumbo distinto al oficial." },
  { when:F("faseCompletada"),     text:"La azotea reveló el compartimento final, y en el mismo instante la casa entera —campanas, veleta y cancela incluidas— cerró su propia historia." }
];
const NOTES_EMPTY = "Aún no has anotado nada.";

const PROGRESS = [
  { key:"zaguanAbierto",     label:"Cancela del zaguán" },
  { key:"despachoAbierto",   label:"Despacho abierto" },
  { key:"tallerAbierto",     label:"Taller de instrumentos abierto" },
  { key:"stairsOpen",        label:"Escalera abierta" },
  { key:"compuertaTallerAbierta", label:"Compuerta del taller" },
  { key:"chestOpen",         label:"Archivo antiguo" },
  { key:"azulejosOpen",      label:"Taller de azulejos" },
  { key:"valvulasResueltas", label:"Acequia del jardín" },
  { key:"panelComplete",     label:"Panel de azulejos" },
  { key:"vaneSet",           label:"Veleta orientada" },
  { key:"toqueDone",         label:"Toque de campanas" },
  { key:"astrolabioListo",   label:"Astrolabio montado" },
  { key:"derroteroListo",    label:"Derrotero reconstruido" },
  { key:"faseCompletada",    label:"El rumbo de la casa" }
];

const H = (when,tiers)=>({when,tiers});
const HINTS = [
  H(s=>I("aguja_constelaciones")(s) && !F("agujaPlaced")(s), [
    "La aguja que soltó la veleta no es solo un recuerdo.",
    "La rueda de constelaciones, en el otro extremo del tejado, tiene el eje central vacío.",
    "Selecciona la aguja de constelaciones y colócala en el eje central de la rueda."
  ]),
  H(s=>F("agujaPlaced")(s) && !F("ruedaResuelta")(s), [
    "Con la aguja puesta, la rueda de constelaciones ya responde.",
    "El derrotero verdadero, sobre la mesa del despacho, subrayaba un mes dos veces.",
    "Gira la rueda exterior hasta octubre."
  ]),
  H(s=>F("compuertaTallerAbierta")(s) && !F("toqueDone")(s) && !I("aguja_constelaciones")(s), [
    "La rueda de constelaciones, arriba, tiene el eje central vacío: le falta una aguja.",
    "En el otro extremo del mismo tejado hay una espadaña con tres campanas y una veleta — la aguja está ahí. No es tocarlas sin más: es una melodía larga, y cada campana tiene su propia nota.",
    "El panel completo del taller de azulejos pinta la melodía bajo las campanas: chica SOL, mediana MI, grande DO. Orienta la veleta a Lebeche y toca el repique grande-mediana-chica-grande-chica-mediana-grande (DO-MI-SOL-DO-SOL-MI-DO) para soltar la aguja."
  ]),
  H(s=>F("compuertaTallerAbierta")(s) && F("stairsOpen")(s) && !F("toqueDone")(s), [
    "Ya puedes subir a la azotea por dos caminos distintos.",
    "El taller de instrumentos tiene una compuerta en el techo; la escalera del patio también sube, por el otro lado.",
    "Empieza por la espadaña (veleta a Lebeche, luego el repique del panel: grande-mediana-chica-grande-chica-mediana-grande): sin su aguja, la rueda de constelaciones ni siquiera gira."
  ]),
  H(s=>I("astrolabio_parcial")(s) && I("soporte_tripode")(s), [
    "El astrolabio parcial y el trípode son piezas del mismo instrumento.",
    "Selecciona el astrolabio parcial y luego el trípode de latón para montarlos.",
    "Combina el astrolabio sin trípode con el trípode de latón del jardín."
  ]),
  H(s=>I("alidada")(s) && I("anillo_graduado")(s) && !I("astrolabio_parcial")(s) && !I("astrolabio")(s), [
    "La alidada y el anillo graduado encajan entre sí.",
    "Selecciona la alidada y luego el anillo graduado.",
    "Combina la alidada de bronce con el anillo graduado del archivo antiguo."
  ]),
  H(s=>F("chestOpen")(s) && !s.items.includes("anillo_graduado") && !F("astrolabioListo")(s), [
    "En el archivo antiguo hay más que el mapa y la cajonera.",
    "Con la cajonera ya abierta, mira mejor las estanterías: hay un astrolabio incompleto.",
    "En las estanterías del archivo, una vez abierta la cajonera, falta el anillo graduado de un astrolabio viejo — cógelo."
  ]),
  H(s=>F("panelComplete")(s) && !s.flags.clapperTaken, [
    "El horno del taller de azulejos guarda algo.",
    "Abre el horno del taller de azulejos: dentro hay un badajo.",
    "Con el panel completo, abre el horno y coge el badajo para la campana grande de la azotea."
  ]),
  H(s=>F("azulejosOpen")(s) && !F("panelComplete")(s), [
    "Al panel del taller de azulejos le faltan tres piezas.",
    "Un hueco para el cielo, uno para la espadaña, uno para el río: cada azulejo tiene su sitio.",
    "Coloca el azulejo del sol, el de la campana y el del ancla, cada uno en su hueco del panel."
  ]),
  H(s=>F("zocaloSeen")(s) && !F("azulejosOpen")(s), [
    "Los medallones de la puerta lateral derecha del zaguán quieren un orden.",
    "El zócalo del patio marca el orden por numeral: sol, estrella, luna, ancla.",
    "Gira los cuatro medallones de la puerta lateral del zaguán hasta sol-estrella-luna-ancla."
  ]),
  H(s=>s.items.includes("llave_biblioteca") && !F("compuertaTallerAbierta")(s), [
    "Esa llave no es para ninguna puerta de esta sala: la librería no tiene cerradura propia.",
    "El taller de instrumentos tiene una compuerta en el techo, atrancada con una cerradura pequeña.",
    "Selecciona la llave y ábrela en la compuerta del techo del taller de instrumentos."
  ]),
  H(s=>F("astrolabioExpuesto")(s) && !F("llaveBibliotecaTaken")(s), [
    "El derrotero y el astrolabio ya reposan juntos sobre la mesa del despacho.",
    "La nota estaba dentro de un cajón — quizás merezca la pena volver a mirar ahí, ahora que se cumple lo que pedía.",
    "Vuelve a mirar el fondo del cajón del escritorio: donde antes solo había una nota, ahora debería haber algo más."
  ]),
  H(s=>F("derroteroListo")(s) && F("astrolabioListo")(s) && !F("astrolabioExpuesto")(s), [
    "El derrotero verdadero y el astrolabio del piloto ya están listos, cada uno por su lado.",
    "La nota del cajón del despacho hablaba de las dos cosas juntas, sobre la mesa de derrotero.",
    "Selecciona el astrolabio y colócalo sobre la mesa de derrotero del despacho, junto a las cinco hojas ya unidas."
  ]),
  H(s=>F("cajonNotaLeida")(s) && !(F("derroteroListo")(s) && F("astrolabioListo")(s)) && !F("llaveBibliotecaTaken")(s), [
    "La nota del cajón del despacho pedía dos cosas juntas sobre la mesa.",
    "Faltan por reunir: las cinco hojas del derrotero (en la mesa de derrotero) y el astrolabio del piloto (alidada, anillo graduado y trípode).",
    "Sin el derrotero verdadero Y el astrolabio montado sobre la mesa, ninguna llave va a aparecer en el cajón."
  ]),
  H(s=>F("sundialSet")(s) && !s.items.includes("stairsKey") && !F("stairsKeyTaken")(s), [
    "El reloj de sol abrió una hornacina en la pared del patio.",
    "Bajo el reloj de sol, una losa suelta esconde algo.",
    "Coge la llave de hierro de la hornacina, bajo el reloj de sol."
  ]),
  H(s=>F("gnomonPlaced")(s) && F("mapRead")(s) && !F("sundialSet")(s), [
    "Gira la esfera del reloj de sol hasta que la sombra caiga sobre las V.",
    "El mapa del archivo antiguo dice a qué hora zarpó la casa.",
    "En el reloj de sol del patio, gira la esfera hasta la V, la hora del mapa del archivo."
  ]),
  H(s=>s.items.includes("gnomon") && !F("gnomonPlaced")(s), [
    "El estilo de bronce del archivo es para el reloj de sol del patio.",
    "El reloj de sol tiene un agujero vacío en el centro de la esfera.",
    "Selecciona el estilo de bronce y colócalo en el agujero del reloj de sol."
  ]),
  H(s=>F("chestOpen")(s) && !s.flags.chestEmptied, [
    "La cajonera del archivo ya está abierta, pero no la has vaciado.",
    "Dentro del cajón abierto hay algo más que ver.",
    "Coge el estilo de bronce y el azulejo de la campana del cajón ya abierto."
  ]),
  H(s=>F("sundialRead")(s) && !F("chestOpen")(s), [
    "MDCXX es una fecha. La cajonera del archivo antiguo pide cuatro cifras.",
    "El reloj de sol del patio lleva tallada una fecha en números romanos.",
    "La cajonera del archivo se abre con 1620, la fecha del reloj de sol."
  ]),
  H(s=>F("despachoAbierto")(s) && !F("cajonFechaAbierto")(s), [
    "El escritorio del despacho tiene un cajón con cuatro ruedas numeradas.",
    "El diario, sobre el mismo escritorio, menciona un año: no es el de la placa del patio.",
    "El cajón se abre con 1699, el año en que Valderas se retiró, según su propio diario."
  ]),
  H(s=>F("valvulasResueltas")(s) && !s.flags.frag5Taken, [
    "El arriate seco del jardín no era solo tierra.",
    "Ahora que la acequia está cerrada, mira bajo el arriate que quedó al descubierto.",
    "Examina el arriate seco del jardín: ahí apareció una hoja del derrotero y un trípode."
  ]),
  H(s=>F("planoTallerVisto")(s) && !F("valvulasResueltas")(s), [
    "Las válvulas del jardín no se cierran al azar: importa el orden.",
    "El plano del taller de instrumentos describe la acequia cerrada al final — hay una marca en el propio jardín que da el orden exacto.",
    "Junto a las macetas de jazmín y romero hay un poste con tres muescas: cierra las llaves mediodía, levante, poniente en ese orden."
  ]),
  H(s=>s.flags.herramientaTaken && !F("engranajesResueltos")(s) && F("planoTallerVisto")(s), [
    "Los tres engranajes del taller de instrumentos no giran solos.",
    "El plano marca norte, este y sur, en ese orden de izquierda a derecha.",
    "Gira los engranajes del cajetín hasta N-E-S según el plano del taller."
  ]),
  H(s=>F("despachoAbierto")(s) && !F("tallerAbierto")(s), [
    "El taller de instrumentos, al fondo de la galería del jardín, está cerrado con llave.",
    "En el arriate del jardín hay una planta de tabaco que nadie sembraría por gusto: examínala de cerca.",
    "Entre las raíces del tabaco hay una llave de hierro: selecciónala y úsala en la puerta del taller."
  ]),
  H(s=>F("tallerAbierto")(s) && !s.flags.herramientaTaken, [
    "El taller de instrumentos tiene un cajón bloqueado por un barril pesado.",
    "Empuja el barril del taller para llegar al cajón con el formón.",
    "En el taller de instrumentos, empuja el barril apoyado contra el cajón: dentro está el formón."
  ]),
  H(s=>!F("despachoAbierto")(s) && (s.items.includes("escudo_ancla")||s.items.includes("escudo_torre")||s.items.includes("escudo_nave")), [
    "El escudo de la puerta del salón tiene tres huecos vacíos.",
    "Busca los tres fragmentos del escudo: uno en el zaguán, otro en el salón, otro en el jardín.",
    "Con los tres fragmentos —ancla, torre y nao— en el inventario, usa la puerta heráldica del salón."
  ]),
  H(s=>F("zaguanAbierto")(s) && !F("despachoAbierto")(s), [
    "El zaguán ya se ha abierto: explora patio, salón, jardín y taller.",
    "Cada sala guarda al menos una pieza distinta; ninguna depende de las demás para empezar.",
    "Reúne ancla (zaguán), torre (salón) y nao (jardín), y llévalos a la puerta heráldica del salón."
  ]),
  H(s=>true, [
    "La cancela del zaguán no cede a la fuerza: algo en la propia puerta da la pista.",
    "Lee la inscripción junto a la aldaba del zaguán antes de tocarla.",
    "Toca la aldaba en este orden: estrella, ancla, nao."
  ])
];
const HINT_FALLBACK = "Observa la casa entera: cada rincón, de una época o de la otra, cuenta parte de la misma historia.";

const END = {
  when: F("faseCompletada"),
  title: "El rumbo de la casa",
  text: "El compartimento se abre y la luz de la luna cae sobre las hojas que Valderas nunca pudo entregar. Casi ochenta años antes, su antepasado Berrio había dejado escrito el mismo rumbo, a su manera: la hora de partida, el viento, el río hasta Sanlúcar. Dos pilotos mayores, dos generaciones, la misma Casa de la Contratación negándose a marcar el mismo bajío en sus cartas oficiales. Abajo, en el patio, los cerrojos de la cancela ceden por fin. La casa, entera, ha contado su historia."
};

/* Crónica global (js/engine/chronicle.js, DECISIONS.md D017): esta fase confirma, por
 * tercera vez y desde dentro de una sola casa, el mismo patrón que ya comparten
 * derrotero+faro (conocimiento.encubrimiento_naval) y aporta de nuevo el símbolo de
 * sevilla (simbolo.sirena_orientacion) — sin cambiar en nada la lógica de sus puzles. */
const CHRONICLE = [
  { flag:"diarioLeido", key:"conocimiento.encubrimiento_naval",
    label:"Más de una autoridad marítima ha ocultado la verdad de un naufragio para no reconocer su propio error." },
  { flag:"toqueDone", key:"simbolo.sirena_orientacion",
    label:"Una veleta con forma de sirena, orientada a la mar, formaba parte del mecanismo de una casa-palacio sevillana." }
];

return {
  id:"piloto",
  name:"El Rumbo de la Casa",
  startScene:"piloto_zaguan",
  saveKey:"trickyDoors.piloto.save",
  data:{ ITEMS, ICON, GROUPS, COMBOS, INTRO_TEXT, NOTES, NOTES_EMPTY, PROGRESS, HINTS, HINT_FALLBACK, END, CHRONICLE }
};
})());
