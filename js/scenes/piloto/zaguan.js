/* EL RUMBO DE LA CASA — Zaguán (entrada)
 * Punto de partida de la casa unificada. Una aldaba con tres relieves (estrella, ancla, nao)
 * guarda el paso al patio; una inscripción junto a la puerta da el orden — igual que en "El
 * Derrotero Perdido".
 *
 * NUEVO (revisión de navegación): el propio room_base.webp ya tiene, sin usar, dos puertas
 * de madera oscura a los lados del pasillo (comprobado por rejilla) — antes el archivo
 * antiguo y el taller de azulejos se alcanzaban por accesos inventados (uno detrás de la
 * estantería del despacho, otro pegado al cajetín de engranajes del taller). Se reutilizan
 * esas dos puertas reales en su lugar:
 *  - puerta izquierda -> archivo antiguo, siempre abierta (el archivo tiene su propio
 *    candado interno: la cajonera, que sigue exigiendo la fecha del reloj de sol).
 *  - puerta derecha -> el mismo cerrojo de medallones que antes vivía junto al cajetín del
 *    taller (código del zócalo del patio), ahora aquí: una vez resuelto, lleva al taller de
 *    azulejos. El puzle no se pierde, solo cambia de sitio a una puerta real.
 *
 * REVISIÓN (auditoría de coherencia visual, petición directa del usuario): la cancela dejaba
 * ver, tanto cerrada como abierta, un patio genérico —sin fuente, sin cabrestante, sin cubo,
 * sin reloj de sol— que no coincidía con el patio real al que en realidad se entra.
 * `room_base.webp` regenerado (img-0110) para que la fuente con el cabrestante y el cubo, el
 * reloj de sol de la pared izquierda y la escalera enrejada sean reconocibles a través de las
 * rejas, aunque algo más lejanas/veladas por la distancia. `cancela_abierta.webp` también
 * regenerado (img-0111) para que, con la cancela abierta, se vea EXACTAMENTE el mismo patio,
 * ahora sin barrotes de por medio — antes mostraba un patio todavía distinto al cerrado.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A  = "assets/derrotero/zaguan/";
const AS = "assets/sevilla/patio/";
const ITEM_AS = "assets/sevilla/items/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

/* Medallones de la puerta derecha: mismo código que antes (sol · estrella · luna · ancla,
 * por numeral del zócalo del patio) — trasladado tal cual desde piloto/taller.js.
 * REVISIÓN (petición directa del usuario): los 4 huecos mostraban una placa oscura con un
 * glifo de texto encima, no un azulejo real — ahora cada símbolo es la imagen de un medallón
 * cerámico (mismo estilo que el zócalo del patio: sol, luna, rosa de los vientos, ancla),
 * recortado del propio hueco circular de closeup_taller_door.webp. `DOOR_SYMBOLS` pasa a ser
 * de identificadores en vez de glifos unicode; `DOOR_TILES` mapea cada uno a su imagen. El
 * motor (render.js) pinta esa imagen en el botón en vez de texto cuando `dials.tiles` existe;
 * sin `tiles` (como en el reloj de sol) el motor sigue pintando el símbolo como texto, sin
 * cambios. */
const DOOR_SYMBOLS = ["sol","luna","estrella","ancla","campana","campana_alt"];
/* El código se deduce mirando la pared del patio, de izquierda a derecha:
 * sol, luna, estrella, ancla. */
const DOOR_CODE = "sollunaestrellaancla";
const DOOR_TILES = {
  sol:      AS+"medallion_sol.webp",
  luna:     AS+"medallion_luna.webp",
  estrella: AS+"medallion_estrella.webp",
  ancla:    AS+"medallion_ancla.webp",
  campana:  AS+"medallion_campana.webp",
  campana_alt: AS+"medallion_compass.webp"
};

/* Secuencia de la aldaba: estrella -> ancla -> nao. Cualquier pulsación fuera de orden reinicia. */
function resetAldaba(s){ s.flags.aldabaEstrella=false; s.flags.aldabaAncla=false; s.flags.aldabaNave=false; }
function pressAldaba(part){
  const order = ["estrella","ancla","nave"];
  const flagOf = { estrella:"aldabaEstrella", ancla:"aldabaAncla", nave:"aldabaNave" };
  const progressOf = s => { const i = order.findIndex(p=>!s.flags[flagOf[p]]); return i===-1 ? order.length : i; };
  return function(s){
    if(s.flags.zaguanAbierto){ S.say("La cancela ya está abierta de par en par."); return; }
    const current = progressOf(s);
    const idx = order.indexOf(part);
    if(idx===current){
      s.flags[flagOf[part]] = true;
      if(part==="nave"){
        s.flags.zaguanAbierto = true;
        S.emit("unlock");
        S.say("Estrella, ancla y nao: los tres relieves ceden a la vez. La cancela se abre con un quejido de goznes viejos.");
        setTimeout(()=>{
          if(s.view!=="aldaba") return;
          s.view="room"; S.emit("view",{view:"room"});
          TD.refresh();
        }, 1100);
      }else{
        S.emit("use");
        S.say(part==="estrella"
          ? "Presionas la estrella de ocho puntas. Un chasquido dentro de la puerta."
          : "El ancla cede tras la estrella. Un segundo chasquido.");
      }
      return;
    }
    const hadProgress = current>0;
    resetAldaba(s);
    if(hadProgress){ S.emit("wrong"); S.say("Un chasquido seco: el mecanismo vuelve a su sitio de golpe. El orden importa."); }
    else S.say("El relieve se hunde un poco y vuelve a su sitio. No parece que sea el primero.");
  };
}

TD.registerScene({
  id:"piloto_zaguan",
  phase:"piloto",
  name:"Zaguán",
  base: A+"room_base.webp",
  enter: "El zaguán de la casa. Huele a piedra fría y a cera vieja. Una cancela de forja cierra el paso al patio.",
  backMessage: "Vuelves a mirar el zaguán.",

  overlays:[
    { id:"cancela_abierta", src:A+"cancela_abierta.webp", when:F("zaguanAbierto"),
      rect:pct(470,40,1150,900), label:"cancela abierta" },
    { id:"candil_ausente", src:A+"candil_ausente.webp", when:F("candilTaken"),
      rect:pct(120,560,260,680), label:"hornacina sin candil" },
    { id:"baldosa_movida", src:A+"baldosa_movida.webp", when:F("frag1Taken"),
      rect:pct(1000,650,1550,941), label:"baldosa movida" },
    { id:"hueco_pared", src:A+"hueco_pared.webp", when:F("anclaTaken"),
      rect:pct(1450,150,1610,360), label:"piedra suelta ya retirada" }
  ],

  hotspots:[
    { id:"aldaba",     label:"Aldaba de la cancela", rect:pct(720,375,870,515), closeup:"aldaba", when:s=>!s.flags.zaguanAbierto },
    { id:"cancela",    label:"Cancela",              rect:pct(620,180,1050,780), goto:"piloto_patio", when:F("zaguanAbierto"), message:"Cruzas la cancela hacia el patio." },
    { id:"hornacina",  label:"Hornacina con un candil", rect:pct(50,300,275,680), when:s=>!s.flags.candilTaken },
    { id:"baldosa",    label:"Baldosa suelta",       rect:pct(1170,820,1370,915), when:s=>!s.flags.frag1Taken },
    { id:"piedra",     label:"Piedra suelta del muro", rect:pct(1460,155,1600,350), when:s=>!s.flags.anclaTaken },
    { id:"blason",     label:"Blasón sobre la puerta", rect:pct(620,15,980,140) },

    /* Puerta izquierda del pasillo (rejilla: x 345-460, y 130-620): siempre abierta, sin
     * candado propio — el archivo antiguo se cuida solo con la cajonera de dentro. */
    { id:"puerta_archivo", label:"Puerta lateral", rect:pct(345,130,460,620), goto:"piloto_archivo",
      message:"Empujas la puerta lateral. Detrás, un archivo más antiguo que el resto de la casa." },

    /* Puerta derecha del pasillo (rejilla: x 1195-1310, y 145-620): el cerrojo de medallones
     * que antes vivía junto al cajetín del taller de instrumentos — mismo código, mismo
     * closeup, solo cambia de sitio a una puerta real. */
    { id:"puerta_azulejos_cerrada", label:"Puerta lateral", rect:pct(1195,145,1310,620), closeup:"puertaAzulejos", when:s=>!s.flags.azulejosOpen },
    { id:"puerta_azulejos", label:"Taller de azulejos", rect:pct(1195,145,1310,620), goto:"piloto_taller_azulejos", when:F("azulejosOpen") }
  ],

  closeups:{
    aldaba:{
      label:"Aldaba de la cancela",
      image: A+"closeup_aldaba.webp",
      hotspots:[
        { id:"inscripcion", label:"Inscripción",       rect:pct(480,700,1180,820) },
        { id:"estrella",    label:"Relieve: estrella", rect:pct(680,90,925,250) },
        { id:"ancla",       label:"Relieve: ancla",    rect:pct(555,195,715,430) },
        { id:"nave",        label:"Relieve: nao",      rect:pct(930,175,1205,455) }
      ]
    },
    puertaAzulejos:{
      label:"Puerta lateral: medallones",
      image: AS+"closeup_taller_door.webp",
      dials:{
        id:"puertaAzulejos", code:DOOR_CODE, flag:"azulejosOpen",
        when:()=>true,
        locked:s=>!!s.flags.azulejosOpen,
        symbols:DOOR_SYMBOLS,
        tiles:DOOR_TILES,
        help:"Medallones: clic gira · clic derecho gira atrás",
        /* REVISIÓN (petición directa del usuario, "colócalos un poco más arriba para que
         * encajen perfectamente"): las posiciones originales (heredadas del cerrojo de texto,
         * antes de tener medallones de imagen) quedaban ~17px más abajo y bastante más
         * pequeñas que el propio círculo cerámico pintado en closeup_taller_door.webp —
         * recalibradas por detección de píxel del borde azul de cada uno de los 4 huecos
         * (círculo real: ~206x206, centro y≈435 en los cuatro, x≈470/716/956/1196). Los 4
         * assets `medallion_*.webp` se recortaron de nuevo con esta misma caja. */
        positions:[
          pct(368,332,574,538), pct(612,332,818,538), pct(853,332,1059,538), pct(1094,332,1300,538)
        ]
      }
    }
  },

  actions:{
    room:{
      hornacina(s){
        s.flags.candilTaken=true; S.addItem("candil");
        S.say("Un candil de aceite, todavía con mecha. Lo llevas contigo: en esta casa hará falta luz.");
      },
      baldosa(s){
        s.flags.frag1Taken=true; S.addItem("fragmento_derrotero_1");
        S.say("La baldosa se mueve al pisarla. Debajo, envuelta en un paño podrido, hay una hoja de papel doblada: una hoja del derrotero.");
      },
      piedra(s){
        s.flags.anclaTaken=true; S.addItem("escudo_ancla");
        S.say("Una piedra del muro está suelta, sin argamasa. Detrás, un fragmento tallado: un ancla. El mismo dibujo que el blasón de la puerta.");
      },
      blason(s){
        S.say("Un blasón de piedra sobre la puerta: ancla, torre y nao, las armas de la familia. El mismo dibujo se repite en la aldaba.");
      }
    },
    closeups:{
      aldaba:{
        inscripcion(s){
          s.flags.aldabaLeida=true; S.emit("paper");
          S.say("Tallado en el dintel: «Toca primero la estrella que guía, luego el ancla que sujeta, y por último la nao que parte».");
        },
        estrella: pressAldaba("estrella"),
        ancla:    pressAldaba("ancla"),
        nave:     pressAldaba("nave")
      }
    },
    dials:{
      /* REVISIÓN (petición directa del usuario): al resolver el cerrojo, la vista se quedaba
       * fija en el closeup de la puerta y el jugador tenía que retroceder a mano para seguir
       * jugando. Mismo patrón que sevilla/patio.js (tallerDoor): se deja ver un momento el
       * mensaje con los 4 medallones ya en su sitio y luego se vuelve sola al plano general. */
      puertaAzulejos(s){
        S.emit("unlock");
        S.say("El último medallón encaja con un chasquido: detrás, un taller más viejo, con olor a arcilla y horno frío.");
        setTimeout(()=>{
          if(s.view!=="puertaAzulejos") return;
          s.view="room"; S.emit("view",{view:"room"});
          TD.refresh();
        }, 1100);
      }
    }
  }
});
})();
