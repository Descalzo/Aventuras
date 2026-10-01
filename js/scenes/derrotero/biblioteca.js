/* EL DERROTERO PERDIDO — Librería
 * Solo accesible con la llave del cajón del despacho. Un códice desordenado, con cuatro
 * hojas sueltas marcadas cada una con una estación del año, señala —una vez ordenado— el
 * lomo correcto entre los estantes, donde se esconde una hoja del derrotero. Sacar ese libro
 * concreto deja un hueco que, por la tarde, proyecta luz hasta el patio (ver patio.js).
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/biblioteca/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

/* Códice: cuatro hojas, orden correcto primavera->verano->otoño->invierno. */
const ESTACIONES = ["primavera","verano","otono","invierno"];
const ESTACION_LABEL = { primavera:"Primavera", verano:"Verano", otono:"Otoño", invierno:"Invierno" };
const paginaFlag = e => "pagina_"+e;
/* Límite real de cada hoja en closeup_codice.webp (medido por brillo, ver comentario
 * más abajo) — no una subdivisión uniforme a ojo del ancho total. */
const SEASON_RECT = [
  pct(40,220,415,745), pct(445,220,825,745), pct(855,220,1245,745), pct(1270,220,1645,745)
];
function resetCodice(s){ ESTACIONES.forEach(e=>{ s.flags[paginaFlag(e)]=false; }); }
function progresoCodice(s){ const i = ESTACIONES.findIndex(e=>!s.flags[paginaFlag(e)]); return i===-1 ? ESTACIONES.length : i; }
function pressPagina(estacion){
  return function(s){
    if(s.flags.codiceResuelto){ S.say("El códice ya está ordenado."); return; }
    const current = progresoCodice(s);
    const idx = ESTACIONES.indexOf(estacion);
    if(idx===current){
      s.flags[paginaFlag(estacion)] = true;
      if(current===ESTACIONES.length-1){
        s.flags.codiceResuelto=true; S.emit("solve");
        S.say("Primavera, verano, otoño, invierno: las cuatro hojas encajan por sus bordes rotos. En la última, una nota al margen señala un lomo verde: «Derroteros, tomo II», segundo estante.");
      }else{
        S.emit("use");
        S.say("La hoja de "+estacion+" encaja con la anterior por su borde roto.");
      }
      return;
    }
    const hadProgress = current>0;
    resetCodice(s);
    if(hadProgress){ S.emit("wrong"); S.say("Esa hoja no sigue a la anterior: los bordes no casan. Vuelves a empezar."); }
    else S.say("Coges la hoja de "+estacion+", pero sin saber cuál va primero no encaja con nada todavía.");
  };
}

TD.registerScene({
  id:"derrotero_biblioteca",
  phase:"derrotero",
  name:"Librería",
  base: A+"room_base.webp",
  enter: "La librería. Estantes hasta el techo, escalera de mano y un códice desmontado sobre la mesa de lectura.",
  backMessage: "Vuelves a mirar la librería.",

  overlays:[
    { id:"hueco_estante", src:A+"hueco_estante.webp", when:F("libroCorrectoRetirado"),
      rect:pct(1250,175,1370,310), label:"hueco en el segundo estante" }
  ],

  hotspots:[
    { id:"puerta_patio", label:"Volver al patio", rect:pct(40,220,260,780), goto:"derrotero_patio", message:"Vuelves al patio." },
    { id:"codice",       label:"Códice sobre la mesa", rect:pct(560,660,1080,880), closeup:"codice",
      message:"Cuatro hojas sueltas, cada una con una estación distinta. Los bordes rotos de cada hoja deberían encajar con la anterior: hay que tocarlas en el orden en que pasan las estaciones." },
    { id:"estante",       label:"Segundo estante",      rect:pct(1130,170,1650,650) },
    /* El libro de lomo verde («Derroteros, tomo II») tiene su propio hotspot, ajustado
     * al lomo real (medido con rejilla sobre room_base.webp) — antes la recogida
     * dependía del hotspot ancho de "estante", que no señalaba el libro concreto.
     * Va después en el array para ganar el clic sobre "estante" en su franja. */
    { id:"libro_verde",   label:"Libro de lomo verde",  rect:pct(1275,195,1315,280),
      when:s=>s.flags.codiceResuelto && !s.flags.libroCorrectoRetirado }
  ],

  closeups:{
    codice:{
      label:"Códice desmontado",
      image: A+"closeup_codice.webp",
      /* Los cuatro hitos estaban desplazados respecto a las hojas reales: cada caja
       * quedaba a caballo entre dos hojas en vez de encima de una sola (medido por
       * diferencia de brillo columna a columna contra la imagen real) — de ahí la
       * confusión al tocarlas. Recalculadas para que cada una caiga limpiamente
       * dentro de los bordes rotos de su propia hoja. */
      html: ESTACIONES.map((estacion,i)=>({
        rect: SEASON_RECT[i],
        cls:"season-slot",
        content: s => s.flags[paginaFlag(estacion)]
          ? '<div class="season-placed"><span class="season-label">'+ESTACION_LABEL[estacion]+'</span></div>'
          : ''
      })),
      hotspots: ESTACIONES.map((estacion,i)=>({
        id: estacion, label:"Hoja: "+ESTACION_LABEL[estacion].toLowerCase(), rect: SEASON_RECT[i]
      }))
    }
  },

  actions:{
    room:{
      estante(s){
        if(!s.flags.codiceResuelto){
          S.say("Estantes altos y apretados. Sin saber qué libro buscas, podrías tirar la biblioteca entera antes de encontrarlo.");
          return;
        }
        if(s.flags.libroCorrectoRetirado){ S.say("El hueco del «Derroteros, tomo II» sigue vacío, tal como lo dejaste."); return; }
        S.say("Ahora sabes qué buscas: un lomo verde, «Derroteros, tomo II», en el segundo estante.");
      },
      libro_verde(s){
        s.flags.libroCorrectoRetirado=true; S.addItem("fragmento_derrotero_2");
        S.emit("solve");
        S.say("«Derroteros, tomo II», de lomo verde. Dentro, presionada entre dos páginas, una hoja del derrotero de Valderas. Al sacar el libro, un rayo de sol de la tarde entra por el hueco y atraviesa la galería hacia el patio.");
      }
    },
    closeups:{
      codice:{
        primavera: pressPagina("primavera"),
        verano:    pressPagina("verano"),
        otono:     pressPagina("otono"),
        invierno:  pressPagina("invierno")
      }
    }
  }
});
})();
