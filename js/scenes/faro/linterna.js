/* EL FARO DE PUNTA CORVO — Linterna (final)
 * Solo se sube aquí desde faro_guardia con el mecanismo completo y la campana en el
 * inventario (ver guardia.js, escalera_linterna). Tres usos de objeto (mecanismo, campana,
 * combustible) y, con los tres hechos, encender: fin de la fase. Coordenadas en % de la
 * escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/faro/linterna/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

function listaParaEncender(s){ return s.flags.mecanismoMontado && s.flags.campanaMontada && s.flags.lamparaCargada; }

TD.registerScene({
  id:"faro_linterna",
  phase:"faro",
  name:"Linterna",
  base: A+"room_base.webp",
  enter: "La linterna, en lo más alto del faro. La lente muerta desde 1968 mira al mar; junto a ella, el soporte vacío de la sirena de niebla que Ramón Padrón nunca terminó.",
  backMessage: "Vuelves a mirar la linterna.",

  overlays:[
    { id:"mecanismo_puesto", src:A+"mecanismo_puesto.webp", when:F("mecanismoMontado"),
      rect:pct(390,150,1010,660), label:"mecanismo instalado" },
    { id:"campana_puesta", src:A+"campana_puesta.webp", when:F("campanaMontada"),
      rect:pct(1240,110,1490,430), label:"campana colgada" },
    { id:"lampara_encendida", src:A+"lampara_encendida.webp", when:F("faseCompletada"),
      rect:pct(680,15,1010,520), label:"linterna encendida" }
  ],

  hotspots:[
    { id:"puerta_guardia", label:"Bajar a la guardia", rect:pct(10,380,330,930), goto:"faro_guardia", message:"Bajas de nuevo a la sala de la guardia." },
    { id:"soporte_mecanismo", label:"Soporte de la sirena", rect:pct(390,150,1010,660), when:s=>!s.flags.mecanismoMontado },
    { id:"gancho_campana",   label:"Gancho de la campana", rect:pct(1240,110,1490,430), when:s=>!s.flags.campanaMontada },
    { id:"deposito_lampara", label:"Depósito de la lámpara", rect:pct(1410,530,1665,880), when:s=>!s.flags.lamparaCargada },
    { id:"encender_bloqueado", label:"Palanca de encendido", rect:pct(670,650,1030,910), when:s=>!listaParaEncender(s) && !s.flags.faseCompletada },
    { id:"encender", label:"Palanca de encendido", rect:pct(670,650,1030,910), when:s=>listaParaEncender(s) && !s.flags.faseCompletada }
  ],

  actions:{
    room:{
      soporte_mecanismo(s){
        if(S.useSelected("mecanismo_completo")){
          s.flags.mecanismoMontado=true; S.emit("use");
          S.say("El mecanismo encaja en el soporte, exactamente donde Ramón lo dibujó cuarenta años antes.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("mecanismo_completo") ? "Un soporte vacío, con el eje pelado. Selecciona el mecanismo completo." : "Un soporte de hierro, vacío, con el perfil exacto de un mecanismo que falta.");
      },
      gancho_campana(s){
        if(S.useSelected("campana_santa_comba")){
          s.flags.campanaMontada=true; S.emit("use");
          S.say("Cuelgas la campana del Santa Comba del gancho. Encaja como si hubiera estado ahí siempre.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("campana_santa_comba") ? "Un gancho de bronce, vacío, del tamaño exacto de una campana de vapor. Selecciona la campana." : "Un gancho de bronce, vacío, esperando una campana que no está.");
      },
      deposito_lampara(s){
        if(S.useSelected("combustible")){
          s.flags.lamparaCargada=true; S.emit("use");
          S.say("Viertes el aceite en el depósito. La mecha, reseca, vuelve a empaparse poco a poco.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("combustible") ? "El depósito de la lámpara está seco. Selecciona el bidón de aceite." : "El depósito de la lámpara, seco desde hace décadas.");
      },
      encender_bloqueado(s){
        const need = [];
        if(!s.flags.mecanismoMontado) need.push("el mecanismo instalado");
        if(!s.flags.campanaMontada) need.push("la campana colgada");
        if(!s.flags.lamparaCargada) need.push("la lámpara cargada");
        S.say("Una palanca de bronce. No serviría de nada tirar de ella sin "+need.join(", ")+".");
      },
      encender(s){
        if(s.flags.faseCompletada){ S.say("La sirena ya sonó. La lente sigue encendida sobre el cabo."); return; }
        s.flags.faseCompletada=true;
        S.emit("solve"); S.emit("bell");
        S.say("Tiras de la palanca. El mecanismo gira, la lámpara prende y la campana del Santa Comba suena una vez sobre el cabo, cuarenta años después de lo que debió sonar.");
      }
    }
  }
});
})();
