/* EL FARO DE PUNTA CORVO — Vivienda del torrero (nudo central, inicio)
 * Comunica taller, guardia y despensa (siempre abiertas) y, solo con la marea conocida
 * (guardia) y el equipo de buceo (despensa), la cueva. El hogar esconde la llave del arcón;
 * el arcón guarda el diario del padre y la primera pieza del mecanismo. La placa
 * conmemorativa, legible desde el principio, da la fecha (24/08) que abrirá el cajón de la
 * guardia mucho después. Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/faro/vivienda/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

function cuevaLista(s){ return !!s.flags.tideSolved && s.items.includes("equipo_buceo"); }

TD.registerScene({
  id:"faro_vivienda",
  phase:"faro",
  name:"Vivienda del torrero",
  base: A+"room_base.webp",
  enter: "La vivienda del torrero. Una estancia baja y circular, con el hogar todavía negro de humo y un arcón contra la pared.",
  backMessage: "Vuelves a mirar la vivienda.",

  overlays:[
    { id:"arcon_abierto", src:A+"arcon_abierto.webp", when:F("arconAbierto"),
      rect:pct(560,330,850,590), label:"arcón abierto" },
    { id:"hogar_vacio", src:A+"hogar_vacio.webp", when:F("llaveArconTaken"),
      rect:pct(280,370,530,610), label:"hogar sin la llave" }
  ],

  hotspots:[
    { id:"puerta_cueva_cerrada", label:"Puerta al exterior", rect:pct(10,120,140,650), when:s=>!cuevaLista(s) },
    { id:"puerta_cueva",         label:"Puerta al exterior", rect:pct(10,120,140,650), when:cuevaLista, goto:"faro_cueva", message:"Bajas por las rocas hacia la cueva, con el equipo de buceo a cuestas." },
    { id:"hogar",         label:"Hogar", rect:pct(280,370,530,610), when:s=>!s.flags.llaveArconTaken },
    { id:"arcon",         label:"Arcón", rect:pct(560,330,850,590) },
    { id:"escalera_guardia", label:"Escalera de caracol", rect:pct(880,20,1150,570), goto:"faro_guardia", message:"Subes por la escalera de caracol hacia la sala de la guardia." },
    { id:"retrato_familia", label:"Retrato familiar", rect:pct(1200,130,1410,345) },
    { id:"placa_memorial", label:"Placa conmemorativa", rect:pct(1220,365,1410,490) },
    { id:"puerta_taller",  label:"Taller", rect:pct(1550,90,1670,630), goto:"faro_taller", message:"Entras en el taller." },
    { id:"trampilla_despensa", label:"Trampilla", rect:pct(1075,630,1370,800), goto:"faro_despensa", message:"Bajas la escalera hacia la despensa." }
  ],

  actions:{
    room:{
      puerta_cueva_cerrada(s){
        const need = [];
        if(!s.flags.tideSolved) need.push("conocer la marea (guardia)");
        if(!s.items.includes("equipo_buceo")) need.push("el equipo de buceo (despensa)");
        S.say("La puerta da a las rocas y al mar. No bajarías sin "+need.join(" y ")+".");
      },
      hogar(s){
        s.flags.llaveArconTaken=true; S.addItem("llave_arcon");
        S.say("Entre la ceniza fría del hogar, envuelta en un paño, hay una llave pequeña: la del arcón.");
      },
      arcon(s){
        if(s.flags.arconAbierto){ S.say("El arcón, ya vacío, sigue abierto contra la pared."); return; }
        if(S.useSelected("llave_arcon")){
          s.flags.arconAbierto=true; s.flags.diarioLeido=true;
          S.addItem("pieza_mecanismo_1");
          S.emit("unlock");
          S.say("La llave gira. Dentro del arcón, un cuaderno de tapas duras y, envuelta en fieltro, una pieza de bronce. El cuaderno es el diario de Ramón Padrón: «la sirena lleva meses averiada, he pedido el repuesto tres veces. Si esta noche pasa algo, que nadie diga que no avisé».");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("llave_arcon") ? "Un arcón de madera oscura, cerrado. Selecciona la llave." : "Un arcón de madera oscura, cerrado con llave.");
      },
      retrato_familia(s){
        S.say("Dos torreros, padre e hijo, posan frente al faro en una fotografía descolorida. Ninguno sonríe.");
      },
      placa_memorial(s){
        s.flags.placaLeida=true; S.emit("paper");
        S.say("«A la memoria del vapor Santa Comba, perdido en este cabo el 24 de agosto de 1911».");
      }
    }
  }
});
})();
