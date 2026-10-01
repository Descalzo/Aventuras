/* EL FARO DE PUNTA CORVO — Taller
 * Accesible desde la vivienda sin llave. Un barril esconde la herramienta de torrero, que
 * nunca se consume: abre el armario de aquí y, más adelante, fuerza los cajones de la
 * despensa (misma pieza, dos salas). El banco de trabajo da el plano original, puro contexto.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/faro/taller/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"faro_taller",
  phase:"faro",
  name:"Taller",
  base: A+"room_base.webp",
  enter: "El taller del faro. Herramientas colgadas de la pared, un banco de trabajo cubierto de virutas y un armario metálico oxidado.",
  backMessage: "Vuelves a mirar el taller.",

  overlays:[
    { id:"barril_movido", src:A+"barril_movido.webp", when:F("herramientaTaken"),
      rect:pct(1340,280,1670,941), label:"barril apartado" },
    { id:"armario_abierto", src:A+"armario_abierto.webp", when:F("armarioAbierto"),
      rect:pct(1100,150,1335,765), label:"armario abierto" }
  ],

  hotspots:[
    { id:"puerta_vivienda", label:"Volver a la vivienda", rect:pct(10,130,195,650), goto:"faro_vivienda", message:"Vuelves a la vivienda." },
    { id:"barril",  label:"Barril", rect:pct(1340,280,1670,941), when:s=>!s.flags.herramientaTaken },
    { id:"banco",   label:"Banco de trabajo", rect:pct(300,420,990,830) },
    { id:"armario", label:"Armario", rect:pct(1100,150,1335,765) }
  ],

  actions:{
    room:{
      barril(s){
        s.flags.herramientaTaken=true; S.addItem("herramienta_taller");
        S.say("Apartas el barril con esfuerzo. Detrás, colgada de un clavo, una herramienta de torrero: te servirá para forzar cosas.");
      },
      banco(s){
        s.flags.planoLeido=true; S.emit("paper");
        if(!S.has("plano_original")) S.addItem("plano_original");
        S.say("Sobre el banco, un plano a tinta del mecanismo de la sirena. Dos letras distintas lo anotan: la de Ramón, y encima, más reciente, la de su hijo Xacobe.");
      },
      armario(s){
        if(s.flags.armarioAbierto){ S.say("El armario, ya vacío, sigue abierto."); return; }
        if(s.selected!=="herramienta_taller"){
          S.say(s.flags.herramientaTaken ? "Necesito algo para romper esto." : "Un armario metálico, con la cerradura soldada por el óxido. Necesitarías algo con lo que forzarla.");
          return;
        }
        s.selected=null;
        s.flags.armarioAbierto=true; S.addItem("pieza_mecanismo_2");
        S.emit("unlock");
        S.say("La herramienta hace palanca en la cerradura oxidada. Dentro del armario, envuelta en trapo aceitado, la segunda pieza del mecanismo.");
      }
    }
  }
});
})();
