/* EL FARO DE PUNTA CORVO — Sala de la guardia
 * Accesible desde la vivienda sin llave. El cajón del escritorio (primer plano, cerradura de
 * cuatro ruedas) se abre con 24/08 — la fecha de la placa conmemorativa de la vivienda,
 * legible desde el principio — y da la tercera pieza del mecanismo Y confirma la marea
 * (tideSolved), condición para entrar en la cueva. La escalera de caracol sigue hacia la
 * linterna, pero solo con el mecanismo completo y la campana. Coordenadas en % de la
 * escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/faro/guardia/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

function linternaLista(s){ return s.items.includes("mecanismo_completo") && s.items.includes("campana_santa_comba"); }

TD.registerScene({
  id:"faro_guardia",
  phase:"faro",
  name:"Sala de la guardia",
  base: A+"room_base.webp",
  enter: "La sala de la guardia. Cartas náuticas cubren la pared junto a una ventana que mira al bajío. Un escritorio con un cajón de cuatro ruedas y una mesa con libros.",
  backMessage: "Vuelves a mirar la sala de la guardia.",

  overlays:[
    { id:"cajon_abierto", src:A+"cajon_abierto.webp", when:F("cajonGuardiaAbierto"),
      rect:pct(600,600,880,790), label:"cajón abierto" }
  ],

  hotspots:[
    { id:"puerta_vivienda", label:"Bajar a la vivienda", rect:pct(10,130,195,650), goto:"faro_vivienda", message:"Bajas a la vivienda." },
    { id:"escalera_linterna_cerrada", label:"Escalera hacia la linterna", rect:pct(880,10,1140,560), when:s=>!linternaLista(s) },
    { id:"escalera_linterna", label:"Escalera hacia la linterna", rect:pct(880,10,1140,560), when:linternaLista, goto:"faro_linterna", message:"Subes los últimos peldaños hacia la linterna." },
    { id:"mesa_libro", label:"Mesa con libros", rect:pct(1440,380,1670,700), when:s=>!s.flags.libroCodigosTaken },
    { id:"escritorio", label:"Escritorio", rect:pct(600,600,880,790), closeup:"escritorio_guardia" },
    { id:"ventana_mar", label:"Ventana al bajío", rect:pct(1105,45,1440,560) }
  ],

  closeups:{
    escritorio_guardia:{
      label:"Cajón del escritorio",
      image: A+"closeup_escritorio.webp",
      dials:{
        id:"cajon_guardia", code:"2408", flag:"cajonGuardiaAbierto",
        when:s=>!s.flags.cajonGuardiaAbierto,
        help:"Cuatro ruedas numeradas: clic avanza, clic derecho retrocede",
        positions:[ pct(565,455,675,625), pct(690,455,800,625), pct(815,455,925,625), pct(940,455,1055,625) ]
      }
    }
  },

  actions:{
    room:{
      escalera_linterna_cerrada(s){
        const need = [];
        if(!s.items.includes("mecanismo_completo")) need.push("el mecanismo completo");
        if(!s.items.includes("campana_santa_comba")) need.push("la campana del Santa Comba");
        S.say("Los peldaños de arriba están astillados y en penumbra. No subirías sin "+need.join(" y ")+".");
      },
      mesa_libro(s){
        s.flags.libroCodigosTaken=true; s.flags.libroLeido=true;
        S.addItem("libro_codigos"); S.emit("paper");
        S.say("Un libro de señales del faro. El código de destellos de Punta Corvo, el mismo desde 1867, nunca llegó a cambiarse.");
      },
      ventana_mar(s){
        S.say("Desde aquí se ve el bajío, apenas una sombra bajo la superficie cuando baja la marea.");
      }
    },
    dials:{
      cajon_guardia(s){
        s.flags.tideSolved = true;
        S.addItem("pieza_mecanismo_3");
        S.emit("unlock");
        S.say("2 y 4, 0 y 8: la misma fecha de la placa de la vivienda. El cajón cede. Dentro, la tercera pieza del mecanismo y la tabla de mareas: hoy es, también, marea viva.");
      }
    }
  }
});
})();
