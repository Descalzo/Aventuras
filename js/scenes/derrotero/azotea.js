/* EL DERROTERO PERDIDO — Azotea (observatorio)
 * Solo se sube aquí con el astrolabio montado y el derrotero verdadero completo (ver
 * taller.js, trampilla). Una rueda de constelaciones, alineada con la fecha que el propio
 * derrotero señala (octubre), abre el compartimento final. Coordenadas en % de la escena
 * (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/azotea/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const MESES = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
const MES_CODE = "OCTUBRE";

TD.registerScene({
  id:"derrotero_azotea",
  phase:"derrotero",
  name:"Azotea",
  base: A+"room_base.webp",
  enter: "La azotea de Valderas. Un observatorio improvisado entre las tejas: un armazón de bronce oxidado y, al fondo, toda Sevilla extendida bajo un cielo ya oscuro.",
  backMessage: "Vuelves a mirar la azotea.",

  overlays:[
    { id:"compartimento_abierto", src:A+"compartimento_abierto.webp", when:F("ruedaResuelta"),
      rect:pct(1010,290,1260,665), label:"compartimento abierto" }
  ],

  hotspots:[
    { id:"trampilla_bajar", label:"Bajar al taller", rect:pct(80,700,320,900), goto:"derrotero_taller", message:"Bajas de nuevo al taller." },
    /* Ya no abre el primer plano directamente (quitado el `closeup:` declarativo): hace
     * falta engrasarla primero con el candil, ver actions.room.planisferio más abajo. */
    { id:"planisferio",     label:"Rueda de constelaciones", rect:pct(500,200,1000,700), when:s=>!s.flags.ruedaResuelta },
    { id:"compartimento",   label:"Compartimento del armazón", rect:pct(1010,290,1260,665), when:F("ruedaResuelta") }
  ],

  closeups:{
    planisferio:{
      label:"Rueda de constelaciones",
      image: A+"closeup_planisferio.webp",
      dials:{
        id:"planisferio", code:MES_CODE, flag:"ruedaResuelta",
        when:s=>!s.flags.ruedaResuelta,
        symbols:[MESES],
        help:"La rueda exterior gira: clic avanza un mes, clic derecho retrocede",
        positions:[ pct(700,780,1000,880) ]
      }
    }
  },

  actions:{
    room:{
      /* Da un uso real al candil de aceite (antes puramente decorativo, sin ningún uso en
       * toda la fase): hay que engrasar con él el eje agarrotado de la rueda antes de que
       * se deje girar. Una sola vez (ruedaLubricada); no cambia el puzle del dial en sí. */
      planisferio(s){
        if(!s.flags.ruedaLubricada){
          if(S.useSelected("candil")){
            s.flags.ruedaLubricada=true; S.emit("use");
            S.say("Viertes el aceite del candil sobre el eje oxidado de la rueda. El chirrido cede: ahora gira con soltura.");
            return;
          }
          if(s.selected) S.emit("wrong");
          S.say(S.has("candil") ? "La rueda de constelaciones apenas gira: el eje está agarrotado por el óxido. Selecciona el candil para engrasarlo." : "La rueda de constelaciones apenas gira: el eje está agarrotado por el óxido y reseco de años.");
          return;
        }
        s.view = "planisferio";
        S.emit("view",{view:"planisferio"});
      },
      compartimento(s){
        if(s.flags.faseCompletada){ S.say("El compartimento sigue abierto, vacío ya: te llevaste lo que guardaba."); return; }
        s.flags.faseCompletada=true;
        S.emit("solve"); S.emit("door");
        S.say("Dentro del compartimento, protegido de la intemperie por dos siglos de bronce cerrado: el derrotero verdadero, tal y como Valderas lo dejó la última noche que subió aquí.");
      }
    },
    dials:{
      planisferio(s){
        S.emit("unlock");
        S.say("La rueda encaja en octubre. Un engranaje oculto libera un pestillo en el armazón de bronce: un compartimento se entreabre.");
      }
    }
  }
});
})();
