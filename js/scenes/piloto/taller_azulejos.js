/* EL RUMBO DE LA CASA — Taller de azulejos
 * Adaptado del taller de "La Casa de la Sirena": el taller del pariente ceramista que ya
 * menciona la propia historia de Derrotero (nunca explicado allí, porque su propio taller de
 * instrumentos no es un taller de cerámica) — aquí, por fin, aparece de verdad. Se entra por
 * la puerta derecha del zaguán, cerrada con el cerrojo de medallones (código del zócalo del
 * patio) — antes este taller colgaba de una puerta pegada al cajetín de engranajes del otro
 * taller, un acceso inventado sin nada real en esa pared. Panel de azulejos incompleto
 * (composición: cada pieza en su hueco), horno con el badajo y azulejo del sol sobre la
 * mesa.
 *
 * REVISIÓN (petición directa del usuario): el toque de campanas de la espadaña (ver
 * piloto/azotea_campanas.js) dejó de ser "tocar en un orden cualquiera" para ser una melodía
 * real (DO-MI-SOL, cada campana con su propia nota sintetizada). La pista de qué nota lleva
 * cada campana ya no son números romanos (I/II/III) sin relación musical — son las propias
 * notas, en el mismo sitio de la cenefa, bajo cada campana del panel. Aparecen al completar
 * el panel (los tres azulejos colocados), no antes: es la recompensa real de terminarlo, tal
 * y como pidió el usuario — "al poner los 3 azulejos... que aparezca una melodía", no solo
 * al conseguirlos.
 *
 * REVISIÓN (segunda vuelta, petición directa del usuario): "la melodía la quería más larga,
 * usando solo esas tres notas" — el mensaje de `bells` (al tocar las campanas ya pintadas
 * del panel) ahora también deletrea el repique completo de 7 golpes
 * (grande-mediana-chica-grande-chica-mediana-grande), no solo las tres notas sueltas.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/sevilla/taller/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const SLOTS = {
  sky:   { rect:pct(336,103,519,278),  item:"tileSun",    flag:"tileSunPlaced" },
  belfry:{ rect:pct(1210,381,1357,552), item:"tileBell",   flag:"tileBellPlaced" },
  river: { rect:pct(966,679,1116,843), item:"tileAnchor", flag:"tileAnchorPlaced" }
};
/* Antes números romanos (I/II/III) sin relación musical entre sí — ahora las notas reales
 * con las que suena cada campana (ver piloto/azotea_campanas.js: NOTE/SOUND), en el mismo
 * sitio de la cenefa donde estaban los numerales: chica (izquierda) SOL, mediana (centro) MI,
 * grande (derecha) DO — de izquierda a derecha, de aguda a grave. */
const BELL_NOTES = [
  { rect:pct(1090,552,1190,602), content:"SOL", bell:"chica"   },
  { rect:pct(1253,552,1348,602), content:"MI",  bell:"mediana" },
  { rect:pct(1408,552,1503,602), content:"DO",  bell:"grande"  }
];
const allPlaced = s => s.flags.tileSunPlaced && s.flags.tileBellPlaced && s.flags.tileAnchorPlaced;

function placeTile(slotId){
  return function(s){
    const slot = SLOTS[slotId];
    if(s.flags[slot.flag]){ S.say("Ese hueco ya tiene su azulejo."); return; }
    if(S.useSelected(slot.item)){
      s.flags[slot.flag]=true; S.emit("use");
      if(allPlaced(s)){
        s.flags.panelComplete=true; S.emit("solve");
        S.say("El último azulejo encaja. El panel queda completo y, bajo las campanas, aparecen tres notas pintadas en la cenefa: una melodía.");
      }else S.say("El azulejo encaja en el hueco: el dibujo continúa sin cortes.");
      return;
    }
    if(s.selected){
      S.emit("wrong");
      S.say("Ese azulejo no continúa el dibujo aquí. Fíjate en lo que rodea al hueco.");
      return;
    }
    const where = { sky:"En el hueco del cielo falta algo que dé luz al panel.", belfry:"En la espadaña falta la campana del centro.", river:"En el río falta lo que sujeta a un barco." }[slotId];
    S.say("Un hueco con el yeso a la vista. "+where);
  };
}

TD.registerScene({
  id:"piloto_taller_azulejos",
  phase:"piloto",
  name:"Taller de azulejos",
  base: A+"room_base.webp",
  enter: "El taller viejo. Huele a arcilla y a humo frío. Un gran panel de azulejos preside la pared, con tres huecos.",
  backMessage: "Vuelves a mirar el taller de azulejos.",

  overlays:[
    { id:"kiln_open",  src:A+"kiln_open.webp",  when:s=>s.flags.kilnOpen && !s.flags.clapperTaken,
      rect:pct(1295,305,1505,580), label:"horno abierto, con el badajo dentro" },
    { id:"kiln_empty", src:A+"kiln_empty.webp", when:F("clapperTaken"),
      rect:pct(1295,305,1505,580), label:"horno abierto y vacío" },
    { id:"table_no_sun", src:A+"table_no_sun.webp", when:F("sunTileTaken"),
      rect:pct(795,695,955,785), label:"mesa sin el azulejo" },
    { id:"tile_sun_placed",   src:A+"tile_sun_placed.webp",   when:F("tileSunPlaced"),
      rect:pct(580,105,1140,485), label:"azulejo del sol colocado" },
    { id:"tile_anchor_placed", src:A+"tile_anchor_placed.webp", when:F("tileAnchorPlaced"),
      rect:pct(580,105,1140,485), label:"azulejo de ancla colocado" },
    { id:"tile_bell_placed",   src:A+"tile_bell_placed.webp",   when:F("tileBellPlaced"),
      rect:pct(580,105,1140,485), label:"campana colocada" }
  ],

  hotspots:[
    { id:"door",     label:"Volver al zaguán", rect:pct(20,90,330,760),    goto:"piloto_zaguan", message:"Vuelves al zaguán." },
    { id:"panel",    label:"Panel de azulejos",    rect:pct(580,105,1140,485), closeup:"panel" },
    { id:"kiln",     label:"Horno",                rect:pct(1300,310,1500,575) },
    { id:"sun_tile", label:"Azulejo del sol",      rect:pct(815,705,945,775),  when:s=>!s.flags.sunTileTaken },
    { id:"pigments", label:"Cuencos de pigmento",  rect:pct(780,620,1130,700) },
    { id:"wheel",    label:"Torno",                rect:pct(1420,640,1650,830) },
    { id:"shelves",  label:"Estantes",             rect:pct(350,120,560,560) }
  ],

  closeups:{
    panel:{
      label:"Panel de azulejos",
      image: A+"closeup_panel.webp",
      layers:[
        { id:"sun",    src:A+"closeup_panel_sun.webp",    when:F("tileSunPlaced"),    rect:SLOTS.sky.rect,    label:"sol" },
        { id:"bell",   src:A+"closeup_panel_bell.webp",   when:F("tileBellPlaced"),   rect:SLOTS.belfry.rect, label:"campana" },
        { id:"anchor", src:A+"closeup_panel_anchor.webp", when:F("tileAnchorPlaced"), rect:SLOTS.river.rect,  label:"ancla" }
      ],
      html: BELL_NOTES.map(n=>({ rect:n.rect, cls:"numeral", content:n.content, when:F("panelComplete") })),
      hotspots:[
        { id:"sky",    label:"Hueco del cielo",     rect:SLOTS.sky.rect,    when:s=>!s.flags.tileSunPlaced },
        { id:"belfry", label:"Hueco de la espadaña", rect:SLOTS.belfry.rect, when:s=>!s.flags.tileBellPlaced },
        { id:"river",  label:"Hueco del río",        rect:SLOTS.river.rect,  when:s=>!s.flags.tileAnchorPlaced },
        { id:"bells",  label:"Campanas del panel",   rect:pct(1080,370,1510,610), when:F("panelComplete") }
      ]
    }
  },

  actions:{
    room:{
      kiln(s){
        if(s.flags.clapperTaken){ S.say("El horno está abierto. Dentro solo queda ceniza tibia."); return; }
        if(!s.flags.kilnOpen){
          s.flags.kilnOpen=true; S.emit("open");
          S.say("Abres la puerta de hierro del horno. Entre la ceniza hay un badajo de campana, pesado y frío.");
          return;
        }
        s.flags.clapperTaken=true; S.addItem("clapper");
        S.say("Coges el badajo. Pesa más de lo que parece.");
      },
      sun_tile(s){
        s.flags.sunTileTaken=true; S.addItem("tileSun");
        S.say("Un azulejo recién cocido con un sol dorado. Todavía guarda el calor del horno.");
      },
      pigments(s){ S.say("Cobalto para el azul, cobre para el verde, manganeso para el morado y ocre. Los colores de Triana."); },
      wheel(s){ S.say("Un torno de alfarero con la rueda cubierta de barbotina seca. Hace mucho que nadie lo pisa."); },
      shelves(s){ S.say("Cántaros, botijos y pilas de azulejos en bizcocho, sin vidriar."); }
    },
    closeups:{
      panel:{
        sky:    placeTile("sky"),
        belfry: placeTile("belfry"),
        river:  placeTile("river"),
        bells(s){
          S.say("Bajo las campanas del panel, tres notas: la chica SOL, la mediana MI, la grande DO. Debajo, casi borrado por el humo del horno, alguien trazó el repique completo con esas mismas tres campanas: grande, mediana, chica, grande, chica, mediana, grande — sube y vuelve a bajar, dos veces por la grande.");
        }
      }
    }
  }
});
})();
