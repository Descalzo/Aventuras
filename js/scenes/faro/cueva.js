/* EL FARO DE PUNTA CORVO — Cueva
 * Solo se entra desde la vivienda con la marea conocida (guardia) y el equipo de buceo
 * (despensa) — la puerta ya queda oculta en faro_vivienda cuando no se cumplen ambas
 * condiciones. Dentro, la campana del Santa Comba entre las rocas. Coordenadas en % de la
 * escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/faro/cueva/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"faro_cueva",
  phase:"faro",
  name:"Cueva",
  base: A+"room_base.webp",
  enter: "La cueva bajo el cabo. La marea baja deja al descubierto un suelo de rocas negras y algas, y el eco del mar entrando y saliendo.",
  backMessage: "Vuelves a mirar la cueva.",

  overlays:[
    { id:"campana_ausente", src:A+"campana_ausente.webp", when:F("campanaTaken"),
      rect:pct(550,550,1300,900), label:"hueco entre las rocas" }
  ],

  hotspots:[
    { id:"puerta_vivienda", label:"Subir a la vivienda", rect:pct(10,10,280,470), goto:"faro_vivienda", message:"Subes de vuelta a la vivienda." },
    { id:"rocas", label:"Entre las rocas", rect:pct(550,550,1300,900), when:s=>!s.flags.campanaTaken },
    { id:"marca_agua", label:"Marca de agua en la pared", rect:pct(380,360,1050,440) }
  ],

  actions:{
    room:{
      rocas(s){
        s.flags.campanaTaken=true; S.addItem("campana_santa_comba");
        S.emit("pickup");
        S.say("Cubierta de percebes y arena, entre dos rocas: una campana de bronce. Todavía se lee, a duras penas, el nombre grabado: Santa Comba.");
      },
      marca_agua(s){
        S.say("Una línea de sal marca hasta dónde sube el agua en marea alta. Ahora mismo queda muy por debajo.");
      }
    }
  }
});
})();
