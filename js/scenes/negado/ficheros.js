/* EL ARCHIVO NEGADO — Sala de ficheros
 * Accesible desde la entrada sin llave. Cuatro fichas sueltas sobre la mesa, cada una con
 * un tema distinto (naos, costas, pilotos, la propia Casa); el fichero de pared tiene una
 * pestaña por tema. Clasificación por contenido, NO por orden numérico ni estacional —
 * variedad deliberada frente al códice de derrotero. Al archivar las cuatro se abre el
 * cajón inferior con la llave del depósito. Coordenadas en % de la escena (1672x941), sin
 * calibrar todavía contra arte real.
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/negado/ficheros/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const FICHAS = ["ficha_naos","ficha_costas","ficha_pilotos","ficha_contratacion"];
function allFiled(s){ return FICHAS.every(id=>s.flags["filed_"+id]); }

function fileTab(correctId, label){
  return function(s){
    if(!s.selected){ S.say("La pestaña de «"+label+"». Selecciona una ficha del inventario para archivarla aquí."); return; }
    if(s.selected===correctId){
      s.flags["filed_"+correctId]=true;
      S.removeItem(correctId); s.selected=null;
      S.emit("solve");
      S.say("La ficha encaja bajo la pestaña de «"+label+"».");
      if(allFiled(s)){
        s.flags.ficherosCompletos=true; S.addItem("llave_deposito");
        S.emit("unlock");
        S.say("Con las cuatro fichas archivadas, el cajón inferior del fichero se abre solo: dentro, la llave del depósito.");
      }
      return;
    }
    S.emit("wrong");
    S.say("Esa ficha no habla de «"+label+"»: no es su sitio.");
  };
}

TD.registerScene({
  id:"negado_ficheros",
  phase:"negado",
  name:"Sala de ficheros",
  base: A+"room_base.webp",
  enter: "La sala de ficheros. Una mesa con fichas sueltas y, en la pared, un fichero de madera con cuatro pestañas.",
  backMessage: "Vuelves a mirar la sala de ficheros.",

  overlays:[
    /* room_base.webp se regeneró esta sesión (ver comentario en el hotspot "fichero" más
     * abajo): el mueble nuevo no tenía cajón inferior propio, así que se encoló un
     * segundo trabajo de imagen para añadir uno a juego bajo la rejilla 2x2 y esta capa
     * se recortó de ahí. rect remedido con rejilla de referencia sobre el resultado. */
    { id:"cajon_inferior_abierto", src:A+"cajon_inferior_abierto.webp", when:F("ficherosCompletos"),
      rect:pct(1090,440,1660,600), label:"cajón inferior abierto" }
  ],

  hotspots:[
    { id:"puerta_entrada", label:"Volver a la entrada", rect:pct(40,220,260,780), goto:"negado_entrada", message:"Vuelves a la entrada." },
    { id:"ficha_naos",         label:"Ficha: naos y flotas",       rect:pct(350,600,560,760), when:s=>!s.items.includes("ficha_naos") && !s.flags.filed_ficha_naos },
    { id:"ficha_costas",       label:"Ficha: costas y derroteros", rect:pct(600,600,810,760), when:s=>!s.items.includes("ficha_costas") && !s.flags.filed_ficha_costas },
    { id:"ficha_pilotos",      label:"Ficha: pilotos y licencias", rect:pct(850,600,1060,760), when:s=>!s.items.includes("ficha_pilotos") && !s.flags.filed_ficha_pilotos },
    { id:"ficha_contratacion", label:"Ficha: oficiales de la Casa",rect:pct(1100,600,1310,760), when:s=>!s.items.includes("ficha_contratacion") && !s.flags.filed_ficha_contratacion },
    /* room_base.webp regenerado esta sesión (el fichero de pared mostraba un mueble
     * distinto al del close-up, ver comentario más abajo): el mueble nuevo ocupa una
     * zona distinta de la escena, remedida con rejilla de referencia. */
    { id:"fichero", label:"Fichero de pared", rect:pct(1120,150,1672,560), closeup:"fichero" }
  ],

  closeups:{
    fichero:{
      label:"Fichero de pared",
      image: A+"closeup_fichero.webp",
      /* Recalibrado con rejilla de referencia sobre closeup_fichero.webp (imagen real,
       * no coordenadas heredadas): arriba-izq "Naos y flotas" (x 50-800,y 50-430),
       * arriba-dcha "Costas y derroteros" (x 850-1650,y 50-430), abajo-izq "Pilotos y
       * licencias" (x 50-800,y 440-830), abajo-dcha "La Casa" (x 850-1650,y 440-830).
       * Cada rect cubre el frente completo de SU cajón (etiqueta + tirador) sin invadir
       * el vecino — antes tab_costas/tab_pilotos tenían los rects del cajón contrario. */
      hotspots:[
        { id:"tab_naos",         label:"Pestaña: Naos y flotas",       rect:pct(60,60,790,420) },
        { id:"tab_costas",       label:"Pestaña: Costas y derroteros", rect:pct(860,60,1650,420) },
        { id:"tab_pilotos",      label:"Pestaña: Pilotos y licencias", rect:pct(60,450,790,820) },
        { id:"tab_contratacion", label:"Pestaña: La Casa",             rect:pct(860,450,1650,820) }
      ]
    }
  },

  actions:{
    room:{
      ficha_naos(s){ S.addItem("ficha_naos"); S.say("Ficha: registro de naos y galeones. Tonelaje, maestre, ruta."); },
      ficha_costas(s){ S.addItem("ficha_costas"); S.say("Ficha: derroteros y accidentes de costa. Bajíos, corrientes, mareas."); },
      ficha_pilotos(s){ S.addItem("ficha_pilotos"); S.say("Ficha: licencias de piloto. Examen, fecha, maestro examinador."); },
      ficha_contratacion(s){ S.addItem("ficha_contratacion"); S.say("Ficha: oficiales de la Casa. Escribanos, contadores, factores."); }
    },
    closeups:{
      fichero:{
        tab_naos:         fileTab("ficha_naos","Naos y flotas"),
        tab_costas:       fileTab("ficha_costas","Costas y derroteros"),
        tab_pilotos:       fileTab("ficha_pilotos","Pilotos y licencias"),
        tab_contratacion: fileTab("ficha_contratacion","La Casa")
      }
    }
  }
});
})();
