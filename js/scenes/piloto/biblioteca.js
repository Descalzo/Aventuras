/* EL RUMBO DE LA CASA — Librería
 * Idéntica a la librería de "El Derrotero Perdido". REVISIÓN: ya no se entra por la escalera
 * del patio (esa reja solo lleva a las campanas, ver piloto/patio.js). REVISIÓN (tercera
 * vuelta, petición directa del usuario): tampoco se entra ya desde el despacho (esa puerta,
 * probada en la revisión anterior, quedaba pequeña y escondida — retirada) — ahora tiene su
 * propia puerta real, sin cerradura, desde el SALÓN (ver piloto/salon.js, hotspot
 * `puerta_biblioteca`, imagen generada en tools/image-jobs.json img-0105). La sala en sí y
 * su puzle no cambian. Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/biblioteca/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const ESTACIONES = ["primavera","verano","otono","invierno"];
const ESTACION_LABEL = { primavera:"Primavera", verano:"Verano", otono:"Otoño", invierno:"Invierno" };
const paginaFlag = e => "pagina_"+e;
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
  id:"piloto_biblioteca",
  phase:"piloto",
  name:"Librería",
  base: A+"room_base.webp",
  enter: "La librería. Estantes hasta el techo, escalera de mano y un códice desmontado sobre la mesa de lectura.",
  backMessage: "Vuelves a mirar la librería.",

  overlays:[
    { id:"hueco_estante", src:A+"hueco_estante.webp", when:F("libroCorrectoRetirado"),
      rect:pct(1250,175,1370,310), label:"hueco en el segundo estante" }
  ],

  hotspots:[
    { id:"puerta_patio", label:"Volver al salón", rect:pct(40,220,260,780), goto:"piloto_salon", message:"Vuelves al salón." },
    { id:"codice",       label:"Códice sobre la mesa", rect:pct(560,660,1080,880), closeup:"codice",
      message:"Cuatro hojas sueltas, cada una con una estación distinta. Los bordes rotos de cada hoja deberían encajar con la anterior: hay que tocarlas en el orden en que pasan las estaciones." },
    { id:"estante",       label:"Segundo estante",      rect:pct(1130,170,1650,650) },
    { id:"libro_verde",   label:"Libro de lomo verde",  rect:pct(1275,195,1315,280),
      when:s=>s.flags.codiceResuelto && !s.flags.libroCorrectoRetirado }
  ],

  closeups:{
    codice:{
      label:"Códice desmontado",
      image: A+"closeup_codice.webp",
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
        S.say("«Derroteros, tomo II», de lomo verde. Dentro, presionada entre dos páginas, una hoja del derrotero. Al sacar el libro, un rayo de sol de la tarde entra por el hueco y atraviesa la galería hacia el patio.");
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
