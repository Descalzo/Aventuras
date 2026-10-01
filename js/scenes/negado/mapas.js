/* EL ARCHIVO NEGADO — Sala de mapas
 * Accesible desde la entrada sin llave. La mesa de cartas superpone el Padrón Real oficial
 * y una corrección privada; señalar dónde difieren da el dato (Bajío del Serrano) que
 * hace falta en el depósito. La rosa de los vientos es una bonificación de crónica opcional
 * (D017): si el jugador ya conoce simbolo.sirena_orientacion (fase sevilla), añade una línea
 * de reconocimiento sin cambiar nada más. Coordenadas en % de la escena (1672x941), sin
 * calibrar todavía contra arte real.
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/negado/mapas/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"negado_mapas",
  phase:"negado",
  name:"Sala de mapas",
  base: A+"room_base.webp",
  enter: "La sala de mapas. Una mesa larga con cartas superpuestas y, en la pared, una rosa de los vientos de bronce.",
  backMessage: "Vuelves a mirar la sala de mapas.",

  hotspots:[
    { id:"puerta_entrada", label:"Volver a la entrada", rect:pct(40,220,260,780), goto:"negado_entrada", message:"Vuelves a la entrada." },
    { id:"mesa_cartas",    label:"Mesa de cartas",      rect:pct(500,500,1200,880), closeup:"cartas" },
    { id:"rosa_vientos",   label:"Rosa de los vientos", rect:pct(1300,150,1600,450) }
  ],

  closeups:{
    cartas:{
      label:"Padrón Real y corrección privada",
      image: A+"closeup_cartas.webp",
      hotspots:[
        { id:"coincide_1",    label:"Tramo de costa",   rect:pct(200,200,600,400) },
        { id:"coincide_2",    label:"Tramo de costa",   rect:pct(900,500,1300,700) },
        { id:"discrepancia",  label:"Tramo de costa",   rect:pct(600,600,1000,850), when:s=>!s.flags.discrepanciaHallada },
        { id:"discrepancia_hallada", label:"Bajío del Serrano", rect:pct(600,600,1000,850), when:F("discrepanciaHallada") }
      ]
    }
  },

  actions:{
    room:{
      rosa_vientos(s){
        let msg = "Una rosa de los vientos de bronce, con los ocho rumbos marcados. Orientada, como toda rosa, al norte.";
        if(TD.chronicle && TD.chronicle.know("simbolo.sirena_orientacion")){
          msg += " Ya has visto antes una veleta orientarse así, mirando a la mar.";
        }
        S.say(msg);
      }
    },
    closeups:{
      cartas:{
        coincide_1(s){ S.say("Aquí las dos cartas coinciden trazo a trazo."); },
        coincide_2(s){ S.say("Aquí también: la corrección privada no cambia nada en este tramo."); },
        discrepancia(s){
          s.flags.discrepanciaHallada=true; S.emit("paper");
          S.say("Aquí las dos cartas difieren: la corrección privada marca un bajío que el Padrón Real oficial nunca llegó a dibujar. Junto al trazo, un nombre a pluma: «Bajío del Serrano».");
        },
        discrepancia_hallada(s){ S.say("El Bajío del Serrano, marcado solo en la corrección privada. Ya lo has anotado."); }
      }
    }
  }
});
})();
