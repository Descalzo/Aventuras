/* EL RUMBO DE LA CASA — Archivo antiguo
 * Adaptado del archivo de "La Casa de la Sirena": el estudio más antiguo de la casa, de la
 * época del primer piloto mayor. Se entra por una de las dos puertas reales del zaguán (la
 * otra lleva, con un cerrojo de medallones, al taller de azulejos) — antes era un acceso
 * inventado detrás de la estantería del despacho, sin nada real en esa pared de la imagen.
 * El mapa del Guadalquivir y la cajonera de mapas (fecha 1620) no cambian; las estanterías,
 * antes solo decorativas, entregan el anillo graduado que hacía falta para montar el
 * astrolabio del piloto — el objeto que cruza esta sala de Sevilla con el puzle de Derrotero.
 *
 * (La cerradura de la cajonera NO tiene bloqueo previo sobre la rueda — ver el comentario
 * junto a `dials.chest` más abajo para la razón: 1620 nunca se menciona en ningún otro sitio
 * de la casa, así que la dependencia real con el reloj de sol ya existe sin necesidad de
 * congelar la rueda.)
 *
 * REVISIÓN (auditoría de coherencia visual, petición directa del usuario): la puerta de
 * vuelta al zaguán dejaba ver una galería exterior soleada con naranjos y una reja con vista
 * a la ciudad — no se parecía en nada al zaguán real (un vestíbulo interior en penumbra).
 * `room_base.webp` regenerado (img-0112) para que a través de esa puerta se vea un pasillo de
 * piedra en sombra, con el mismo zócalo de azulejos azul y oro y una reja oscura al fondo,
 * coherente con el vestíbulo real.
 *
 * REVISIÓN (petición directa del usuario, jugando en vivo — "los objetos aparecen por encima
 * del cajón"): `closeup_chest_items.webp` (estilo de bronce + azulejo de campana) tenía un
 * recuadro de transparencia que llegaba hasta tocar la placa de la cerradura de cuatro
 * ruedas del cajón, así que el borde inferior de los objetos se solapaba visiblemente con
 * ella. Regenerado (img-0121) con los objetos claramente por encima de la placa, con hueco
 * de tela de sobra antes de llegar a ella, y recortado (`tools/make_overlay.py`) sin bajar
 * de esa línea. Mismo fichero, sin cambio de ruta: también corrige `sevilla/archivo.js`
 * (comparte tal cual esta escena y este mismo defecto, nunca antes detectado).
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/sevilla/archivo/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const CHEST_CODE = "1620";

const WINDS = ["TRAMONTANA","GREGAL","LEVANTE","JALOQUE","MEDIODÍA","LEBECHE","PONIENTE","MAESTRAL"];
const ROSE = {x:265, y:245, r:135};
const TOWNS = [
  { name:"SEVILLA",  x:1400, y:348 },
  { name:"CORIA",    x:990,  y:405 },
  { name:"LEBRIJA",  x:1075, y:515 },
  { name:"SANLÚCAR", x:520,  y:672 }
];
function roseLabels(){
  let out = '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">';
  WINDS.forEach((w,i)=>{
    const a = (i*45-90)*Math.PI/180, x = 200+168*Math.cos(a), y = 200+168*Math.sin(a);
    out += '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-size="'+(i===5?15:12)+'" font-weight="'+(i===5?'700':'400')+'" fill="#4a3320">'+w+'</text>';
  });
  return out+'</svg>';
}

TD.registerScene({
  id:"piloto_archivo",
  phase:"piloto",
  name:"Archivo antiguo",
  base: A+"room_base.webp",
  enter: "El archivo. Legajos, instrumentos de navegación y un gran mapa del río sobre una cajonera de mapas — todo más viejo que el resto de la casa.",
  backMessage: "Vuelves a mirar el archivo.",

  overlays:[
    { id:"chest_open", src:A+"chest_open.webp", when:F("chestOpen"),
      rect:pct(480,500,1070,592), label:"cajón abierto" }
  ],

  hotspots:[
    { id:"door",      label:"Volver al zaguán",     rect:pct(1160,110,1390,640), goto:"piloto_zaguan", message:"Vuelves al zaguán." },
    { id:"map",       label:"Mapa del Guadalquivir", rect:pct(490,90,1075,445), closeup:"map" },
    { id:"chest",     label:"Cajonera de mapas",   rect:pct(460,495,1080,670),  closeup:"chest" },
    { id:"desk",      label:"Derrotero",           rect:pct(90,720,600,850) },
    { id:"shelves",   label:"Estanterías",         rect:pct(0,0,370,650), when:s=>!s.flags.anilloTaken },
    { id:"window",    label:"Ventana",             rect:pct(1500,0,1670,560) }
  ],

  closeups:{
    map:{
      label:"Mapa del Guadalquivir",
      image: A+"closeup_map.webp",
      html:[
        { rect:pct(ROSE.x-ROSE.r*1.3, ROSE.y-ROSE.r*1.3, ROSE.x+ROSE.r*1.3, ROSE.y+ROSE.r*1.3), cls:"rose", content:roseLabels },
        ...TOWNS.map(t=>({ rect:pct(t.x-90, t.y-14, t.x+90, t.y+14), cls:"map-label", content:t.name })),
        { rect:pct(1060,692,1585,828), cls:"paper cartouche",
          content:"<b>Derrotero de la casa</b>Partida de la Casa a las V de la tarde, con la marea, río abajo hasta Sanlúcar. Rumbo a la mar con viento de Lebeche." }
      ],
      hotspots:[ { id:"read", label:"Leer la cartela", rect:pct(1040,680,1600,840) },
                 { id:"rose", label:"Rosa de los vientos", rect:pct(ROSE.x-ROSE.r*1.3, ROSE.y-ROSE.r*1.3, ROSE.x+ROSE.r*1.3, ROSE.y+ROSE.r*1.3) } ]
    },
    chest:{
      label:"Cajonera de mapas",
      image: s => s.flags.chestOpen ? A+"closeup_chest_open.webp" : A+"closeup_chest.webp",
      layers:[
        { id:"items", src:A+"closeup_chest_items.webp", when:s=>s.flags.chestOpen && !s.flags.chestEmptied,
          rect:pct(470,275,1170,450), label:"estilo y azulejo" }
      ],
      hotspots:[
        { id:"items", label:"Coger el estilo y el azulejo", rect:pct(480,280,1160,445), when:s=>s.flags.chestOpen && !s.flags.chestEmptied }
      ],
      /* Sin gate por `sundialRead`: igual que cualquier otro candado numérico del proyecto
       * (el cajón 1699 del despacho, por ejemplo), las ruedas siempre responden al tacto —
       * lo que hace depender el puzle del reloj de sol es que 1620 no se menciona en
       * ningún otro sitio de la casa, no un bloqueo artificial de la rueda. Congelar la
       * rueda hasta cumplir una condición sería inconsistente con el resto del proyecto
       * (y con el propio rediseño de la acequia de esta misma fase, que abandonó
       * deliberadamente ese patrón de "bloqueo silencioso"). */
      dials:{
        id:"chest", code:CHEST_CODE, flag:"chestOpen",
        when:s=>!s.flags.chestOpen,
        help:"Cerradura de cuatro ruedas · Clic: siguiente · Clic derecho: anterior",
        positions:[
          pct(752,345,792,430), pct(796,345,836,430), pct(840,345,880,430), pct(884,345,924,430)
        ]
      }
    }
  },

  actions:{
    room:{
      desk(s){ S.say("El derrotero está abierto, pero la tinta se ha desvanecido: solo quedan las líneas de la marea. El primer piloto guardó lo importante en el mapa."); },
      shelves(s){
        if(!s.flags.chestOpen){
          S.say("Legajos atados con cinta, un astrolabio, un compás de puntas y un reloj de arena. Instrumentos de quien navegaba el río hasta la mar.");
          return;
        }
        s.flags.anilloTaken=true; S.addItem("anillo_graduado");
        S.emit("solve");
        S.say("Con la cajonera abierta, te fijas mejor en el astrolabio del estante: le falta el anillo graduado. Está suelto entre los legajos, cubierto de polvo. Lo coges: encajará en uno más reciente.");
      },
      window(s){ S.say("Por la reja de la ventana se ve el patio y, sobre los tejados, la torre de la ciudad. El sol ya toca los aleros."); }
    },
    closeups:{
      map:{
        read(s){
          s.flags.mapRead=true; S.emit("paper");
          S.say("Cartela: partida a las V de la tarde, río abajo hasta Sanlúcar, rumbo a la mar con viento de Lebeche.");
        },
        rose(s){
          S.say("Rosa de los vientos con los nombres antiguos: Tramontana al norte, Levante al este, Mediodía al sur, Poniente al oeste; entre ellos Gregal, Jaloque, Lebeche y Maestral.");
        }
      },
      chest:{
        items(s){
          s.flags.chestEmptied=true;
          S.addItem("gnomon"); S.addItem("tileBell");
          S.say("Dentro del cajón: un estilo de bronce, triangular, y un azulejo con una campana pintada.");
        }
      }
    },
    dials:{
      chest(s){ S.emit("unlock"); S.say("Las cuatro ruedas marcan el año de la casa. El cajón superior se desliza solo."); }
    }
  }
});
})();
