/* EL FARO DE PUNTA CORVO — Despensa
 * Accesible desde la vivienda sin llave (trampilla). El combustible es libre; los cajones
 * atascados necesitan la herramienta del taller (misma pieza, segunda sala) y dan el casco y
 * el lastre, que se combinan en el inventario (COMBOS, js/phases/faro.js) en equipo de buceo.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/faro/despensa/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"faro_despensa",
  phase:"faro",
  name:"Despensa",
  base: A+"room_base.webp",
  enter: "La despensa, bajo la vivienda. Estantes con provisiones resecas y cajones de madera hinchados por la humedad.",
  backMessage: "Vuelves a mirar la despensa.",

  overlays:[
    { id:"cajones_movidos", src:A+"cajones_movidos.webp", when:F("cajonesForzados"),
      rect:pct(870,290,1300,790), label:"cajones forzados" }
  ],

  hotspots:[
    { id:"puerta_vivienda", label:"Subir a la vivienda", rect:pct(10,10,300,930), goto:"faro_vivienda", message:"Subes a la vivienda." },
    { id:"estante_combustible", label:"Estante con un bidón", rect:pct(350,90,520,270), when:s=>!s.flags.combustibleTaken },
    { id:"cajones", label:"Cajones atascados", rect:pct(870,290,1300,790), when:s=>!s.flags.cajonesForzados },
    { id:"hornillo", label:"Hornillo apagado", rect:pct(1345,140,1610,400) }
  ],

  actions:{
    room:{
      estante_combustible(s){
        s.flags.combustibleTaken=true; S.addItem("combustible");
        S.say("Un bidón de aceite, todavía casi lleno. Servirá para la lámpara de la linterna.");
      },
      cajones(s){
        if(s.selected!=="herramienta_taller"){
          S.say(s.flags.herramientaTaken ? "Necesito algo para romper esto." : "Dos cajones de madera, hinchados y atascados por la humedad. Necesitarías algo con lo que forzarlos.");
          return;
        }
        s.selected=null;
        s.flags.cajonesForzados=true;
        S.addItem("casco_buzo"); S.addItem("lastre");
        S.emit("unlock");
        S.say("La herramienta del taller hace palanca entre las tablas. Dentro: un casco de buceo abombado y un cinturón de lastre, cubiertos de moho.");
      },
      hornillo(s){
        S.say("Un hornillo de hierro, frío desde hace décadas. Al lado, un montón de latas vacías: alguien vivió aquí mucho tiempo.");
      }
    }
  }
});
})();
