/* TRICKY DOORS — Sevilla: Patio de la Sirena
 * Inicio de la fase. Reloj de sol (luz/sombra + mecanismo), zócalo con símbolos,
 * puerta del taller con medallones, reja de la escalera y cancela (final).
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/sevilla/patio/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

/* Símbolos de los medallones de la puerta del taller (orden del zócalo por numeral).
 * REVISIÓN (petición directa del usuario): cada símbolo pasa a ser la imagen de un medallón
 * cerámico real (mismo estilo que el zócalo del patio), no un glifo de texto sobre una placa
 * oscura — ver `DOOR_TILES` y el mismo cambio en piloto/zaguan.js, que comparte este asset. */
const SYMBOLS = ["sol","luna","estrella","ancla"];
const DOOR_CODE = "solestrellalunaancla";
const DOOR_TILES = {
  sol:      A+"medallion_sol.webp",
  luna:     A+"medallion_luna.webp",
  estrella: A+"medallion_estrella.webp",
  ancla:    A+"medallion_ancla.webp"
};

/* Reloj de sol: la esfera tiene 12 sectores; los numerales I..XII se pintan en el centro de
 * cada sector (i*30+15 grados desde arriba, sentido horario) y giran con la esfera, que
 * arranca girada BASE pasos. La sombra del estilo cae fija sobre el sector SHADOW_POS (135°).
 * Numeral bajo la sombra con la esfera girada r pasos: NUMERALS[(SHADOW_POS - BASE - r) mod 12]. */
const NUMERALS = ["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"];
const SHADOW_POS = 4, BASE = 3;
const RING_SYMBOLS = NUMERALS.map((_,r)=>NUMERALS[((SHADOW_POS - BASE - r) % 12 + 12) % 12]);
const SUNDIAL_HOUR = "V";
/* Esfera en el primer plano: centro y radio en px de la imagen. */
const DIAL_CENTER = {x:836, y:398, r:300};
function ring(s){
  const r = (s.dials.sundial || [0])[0] || 0;
  let out = '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet"><g transform="rotate('+((r+BASE)*30)+' 100 100)">';
  NUMERALS.forEach((n,i)=>{
    const a = i*30 + 15 - 90, rad = a*Math.PI/180, x = 100+80*Math.cos(rad), y = 100+80*Math.sin(rad);
    out += '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" transform="rotate('+(i*30+15)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-weight="700" font-size="12" fill="#4a3a26">'+n+'</text>';
  });
  return out+'</g></svg>';
}

TD.registerScene({
  id:"patio",
  phase:"sevilla",
  name:"Patio de la Sirena",
  base: A+"room_base.webp",
  enter: "El patio. La cancela está cerrada y la luz de poniente entra baja entre las columnas.",
  backMessage: "Vuelves a mirar el patio.",
  /* Tras salir por la cancela ya no hay nada más que hacer: bloquea el resto de hotspots de
   * la sala para que un clic repetido en "exit" (u otro hotspot) no reabra la transición del
   * telón mientras el final está apareciendo. Ver también el guard en actions.exit. */
  locked: F("exited"),
  lockedMessage: "Ya has cruzado la cancela. El callejón te espera.",

  overlays:[
    { id:"rope_gone", src:A+"rope_gone.webp", when:F("ropeTaken"),
      rect:pct(80,748,325,892), label:"sin soga" },
    { id:"sundial_gnomon", src:A+"sundial_gnomon.webp", when:F("gnomonPlaced"),
      rect:pct(425,190,565,365), label:"estilo en el reloj de sol" },
    { id:"niche_key",   src:A+"niche_key.webp",   when:s=>s.flags.sundialSet && !s.flags.stairsKeyTaken,
      rect:pct(440,355,545,455), label:"hornacina abierta con llave" },
    { id:"niche_empty", src:A+"niche_empty.webp", when:F("stairsKeyTaken"),
      rect:pct(440,355,545,455), label:"hornacina vacía" },
    { id:"taller_open", src:A+"taller_open.webp", when:F("tallerOpen"),
      rect:pct(1440,170,1640,710), label:"puerta del taller abierta" },
    { id:"stairs_open", src:A+"stairs_open.webp", when:F("stairsOpen"),
      rect:pct(1100,160,1300,660), label:"reja abierta" },
    { id:"cancela_open", src:A+"cancela_open.webp", when:F("cancelaOpen"),
      rect:pct(730,230,950,650), label:"cancela abierta" }
  ],

  hotspots:[
    { id:"archive_door", label:"Archivo",                 rect:pct(60,170,300,700),   goto:"archivo" },
    { id:"taller_door",  label:"Puerta del taller",       rect:pct(1450,175,1630,700), closeup:"tallerDoor", when:s=>!s.flags.tallerOpen,
      message:"Cuatro medallones de cerámica giran sobre la puerta. Cada uno muestra una figura." },
    { id:"taller_enter", label:"Entrar en el taller",     rect:pct(1450,175,1630,700), goto:"taller", when:F("tallerOpen") },
    { id:"stairs",       label:"Reja de la escalera",     rect:pct(1110,165,1290,650), when:s=>!s.flags.stairsOpen },
    { id:"stairs_up",    label:"Subir a la azotea",       rect:pct(1110,165,1290,650), goto:"azotea", when:F("stairsOpen") },
    { id:"cancela",      label:"Cancela",                 rect:pct(745,235,935,640),  closeup:"cancela", when:s=>!s.flags.cancelaOpen,
      message:"La cancela de hierro. Los cerrojos están echados por dentro de un mecanismo; no hay cerradura." },
    { id:"exit",         label:"Salir al callejón",       rect:pct(745,235,935,640),  when:F("cancelaOpen") },
    { id:"sundial",      label:"Reloj de sol",            rect:pct(425,190,565,365),  closeup:"sundial" },
    { id:"niche",        label:"Losa bajo el reloj",      rect:pct(445,362,540,450) },
    { id:"fountain",     label:"Fuente",                  rect:pct(600,690,1080,830) },
    { id:"rope",         label:"Soga de esparto",         rect:pct(105,775,245,865),  when:s=>!s.flags.ropeTaken },
    { id:"zocalo",       label:"Zócalo de azulejos",      rect:pct(350,450,600,620),  closeup:"zocalo" },
    { id:"zocalo2",      label:"Zócalo de azulejos",      rect:pct(1130,450,1480,620), closeup:"zocalo" }
  ],

  closeups:{
    tallerDoor:{
      label:"Medallones de la puerta",
      image: A+"closeup_taller_door.webp",
      dials:{
        id:"tallerDoor", code:DOOR_CODE, flag:"tallerOpen",
        symbols:SYMBOLS,
        tiles:DOOR_TILES,
        help:"Medallones: clic gira · clic derecho gira atrás",
        /* REVISIÓN (petición directa del usuario, "colócalos un poco más arriba para que
         * encajen perfectamente"): recalibradas por detección de píxel del borde azul de
         * cada hueco — ver el mismo cambio y comentario en piloto/zaguan.js, que comparte
         * este asset. */
        positions:[
          pct(368,332,574,538), pct(612,332,818,538), pct(853,332,1059,538), pct(1094,332,1300,538)
        ]
      }
    },
    sundial:{
      label:"Reloj de sol",
      /* sin estilo, o con el estilo y su sombra (misma vista) */
      image: s => s.flags.gnomonPlaced ? A+"closeup_sundial_gnomon.webp" : A+"closeup_sundial.webp",
      html:[
        { rect:pct(DIAL_CENTER.x-DIAL_CENTER.r, DIAL_CENTER.y-DIAL_CENTER.r, DIAL_CENTER.x+DIAL_CENTER.r, DIAL_CENTER.y+DIAL_CENTER.r), cls:"ring", content:ring }
      ],
      hotspots:[
        { id:"hole",        label:"Agujero del estilo",  rect:pct(790,352,882,446), when:s=>!s.flags.gnomonPlaced },
        { id:"inscription", label:"Inscripción",         rect:pct(566,710,1101,822) }
      ],
      dials:{
        id:"sundial", code:SUNDIAL_HOUR, flag:"sundialSet",
        when:s=>s.flags.gnomonPlaced && !s.flags.sundialSet,
        symbols:[RING_SYMBOLS],
        help:"La esfera gira: clic avanza, clic derecho retrocede. Se muestra el numeral bajo la sombra.",
        positions:[ pct(1214,347,1314,447) ]
      }
    },
    zocalo:{
      label:"Zócalo",
      image: A+"closeup_zocalo.webp",
      /* numerales en la esquina superior izquierda de cada azulejo de figura: sol, luna, estrella, ancla */
      html:[
        { rect:pct(84,336,164,406),   cls:"numeral", content:"I" },
        { rect:pct(496,336,576,406),  cls:"numeral", content:"III" },
        { rect:pct(906,336,986,406),  cls:"numeral", content:"II" },
        { rect:pct(1315,336,1395,406), cls:"numeral", content:"IV" }
      ],
      hotspots:[ { id:"look", label:"Observar el zócalo", rect:pct(60,310,1610,640) } ]
    },
    cancela:{
      label:"Cancela",
      image: A+"closeup_cancela.webp",
      html:[
        { rect:pct(600,96,1075,224), cls:"plate engraved", content:"SIRENA A LA MAR<br>CAMPANAS A SU TOQUE" }
      ],
      hotspots:[
        { id:"plaque", label:"Placa",     rect:pct(579,80,1093,239) },
        { id:"bolts",  label:"Cerrojos",  rect:pct(640,246,1030,804) }
      ]
    }
  },

  actions:{
    room:{
      stairs(s){
        if(S.useSelected("stairsKey")){
          s.flags.stairsOpen=true; S.emit("unlock");
          S.say("La llave gira con esfuerzo. La reja se abre y la escalera de azulejos sube hacia la azotea.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("stairsKey") ? "La cerradura de la reja es pequeña y de hierro. Selecciona la llave." : "Una reja de hierro cierra la escalera. Tiene una cerradura pequeña.");
      },
      niche(s){
        if(!s.flags.sundialSet){ S.say("Una losa de piedra encastrada en el muro, bajo el reloj de sol. Tiene una junta muy fina; parece una puertecilla sin tirador."); return; }
        if(!s.flags.stairsKeyTaken){
          s.flags.stairsKeyTaken=true; S.addItem("stairsKey");
          S.say("En la hornacina hay una llave de hierro forjado. La coges.");
          return;
        }
        S.say("La hornacina está vacía.");
      },
      fountain(s){
        if(!s.flags.anchorTileTaken){
          s.flags.anchorTileTaken=true; S.addItem("tileAnchor");
          S.say("La taza de la fuente está seca. En el fondo, entre hojas, hay un azulejo suelto con un ancla pintada.");
        }else S.say("La fuente sigue seca. Solo hojas de naranjo en la taza.");
      },
      rope(s){
        s.flags.ropeTaken=true; S.addItem("rope");
        S.say("Una soga de esparto, gruesa y áspera. La enrollas y te la llevas.");
      },
      exit(s){
        if(s.flags.exited) return;   // no reabrir el telón si el clic llega repetido
        s.flags.exited=true; S.emit("door");
        S.say("Cruzas la cancela. El callejón huele a azahar y las campanas siguen sonando sobre los tejados.");
      }
    },
    closeups:{
      sundial:{
        hole(s){
          if(S.useSelected("gnomon")){
            s.flags.gnomonPlaced=true; S.emit("use");
            S.say("El estilo de bronce encaja en el agujero. La luz de poniente proyecta una sombra larga sobre la esfera.");
          }else{
            if(s.selected) S.emit("wrong");
            S.say("En el centro de la esfera hay un agujero: falta el estilo que proyecte la sombra.");
          }
        },
        inscription(s){
          s.flags.sundialRead=true; S.emit("paper");
          S.say("Bajo la esfera, tallado en el mármol: MDCXX.");
        }
      },
      zocalo:{
        look(s){
          s.flags.zocaloSeen=true; S.emit("paper");
          S.say("Entre la lacería, cuatro azulejos de figura. En la esquina de cada uno hay un numeral: sol I, estrella II, luna III, ancla IV.");
        }
      },
      cancela:{
        plaque(s){
          s.flags.plaqueRead=true; S.emit("paper");
          S.say("La placa dice: «Sirena a la mar, campanas a su toque».");
        },
        bolts(s){
          S.say("Tres cerrojos de hierro entran en el marco desde arriba, unidos a una cadena que sube por el muro. No hay cerradura.");
        }
      }
    },
    dials:{
      /* REVISIÓN (petición directa del usuario, mismo cambio que piloto/zaguan.js: cortaba a
       * la sala antes de que el jugador llegara a ver los 4 medallones ya en su sitio). */
      tallerDoor(s){
        S.emit("unlock");
        S.say("El último medallón encaja con un chasquido y la puerta del taller se entreabre.");
        setTimeout(()=>{
          if(s.view!=="tallerDoor") return;
          s.view="room"; S.emit("view",{view:"room"});
          TD.refresh();
        }, 1100);
      },
      sundial(s){
        S.emit("unlock");
        S.say("La sombra cae sobre las V. Algo se mueve dentro del muro: la losa bajo el reloj se abre.");
      }
    }
  }
});
})();
