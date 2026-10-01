/* EL ARCHIVO NEGADO — Entrada (nudo central, inicio)
 * Comunica mapas, despacho y ficheros (siempre abiertas) y, solo con la llave del depósito
 * (ficheros), el depósito. Coordenadas en % de la escena (1672x941), sin calibrar todavía
 * contra arte real (ver docs/negado/README.md §9 — se recalibrarán cuando exista).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/negado/entrada/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"negado_entrada",
  phase:"negado",
  name:"Entrada del archivo",
  base: A+"room_base.webp",
  enter: "La entrada del anexo. Polvo, papeles a medio clasificar, y tres puertas además de la que has cruzado.",
  backMessage: "Vuelves a mirar la entrada.",

  overlays:[
    { id:"deposito_abierto", src:A+"deposito_abierto.webp", when:F("depositoAbierto"),
      rect:pct(1360,90,1560,760), label:"puerta del depósito abierta" }
  ],

  hotspots:[
    { id:"puerta_mapas",     label:"Sala de mapas",   rect:pct(15,90,155,570),   goto:"negado_mapas", message:"Entras en la sala de mapas." },
    { id:"puerta_despacho",  label:"Despacho",        rect:pct(605,280,755,620), goto:"negado_despacho", message:"Entras en el despacho del escribano." },
    { id:"puerta_ficheros",  label:"Ficheros",        rect:pct(280,60,420,420),  goto:"negado_ficheros", message:"Detrás del tapiz, un arco más bajo lleva a la sala de ficheros." },
    { id:"puerta_deposito_cerrada", label:"Puerta del depósito", rect:pct(1360,90,1560,760), when:s=>!s.flags.depositoAbierto },
    { id:"puerta_deposito",  label:"Depósito",        rect:pct(1360,90,1560,760), goto:"negado_deposito", when:F("depositoAbierto"), message:"Entras en el depósito de expedientes retirados." },
    { id:"retrato",          label:"Placa de la entrada", rect:pct(870,170,1060,460) }
  ],

  actions:{
    room:{
      puerta_deposito_cerrada(s){
        if(S.useSelected("llave_deposito")){
          s.flags.depositoAbierto=true; S.emit("unlock");
          S.say("La llave gira. La puerta del depósito se abre.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("llave_deposito") ? "La puerta del depósito está cerrada. Selecciona la llave del depósito." : "La puerta del depósito está cerrada con una cerradura de hierro.");
      },
      retrato(s){
        s.flags.retratoLeido=true; S.emit("paper");
        S.say("«Casa de la Contratación de Indias. Aquí se guardó, y a veces se calló, el rumbo de la Carrera.»");
      }
    }
  }
});
})();
