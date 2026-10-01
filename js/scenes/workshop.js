/* TRICKY DOORS — escenario: Taller mecánico
 * La placa del torno da el número del candado del armario; el armario guarda la
 * manivela y el muelle; en el tornillo de banco se monta el péndulo (disco + muelle).
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/workshop/";
const LATHE_SERIAL = "417";

TD.registerScene({
  id:"workshop",
  phase:"clockmaker",
  name:"Taller mecánico",
  /* Se entra desde la puerta derecha del vestíbulo: la puerta de vuelta debe quedar a la izquierda. */
  mirror:true,
  base: A+"room_base.webp",
  enter: "El taller. Herramientas colgadas, un torno de relojero y un armario metálico cerrado con candado de combinación.",
  backMessage: "Vuelves a mirar el taller.",

  overlays:[
    { id:"cabinet_open", src:A+"cabinet_open.webp", when:F("cabinetOpen"),
      rect:{left:68.8,top:14.9,width:16.7,height:71.7}, label:"armario abierto" }
  ],

  hotspots:[
    { id:"door",    label:"Volver al vestíbulo",   rect:{left:86.1,top:5.8,width:13.9,height:84.0}, goto:"hall", message:"Vuelves al vestíbulo." },
    { id:"stove",   label:"Estufa",                rect:{left:0.0,top:37.2,width:7.2,height:45.7} },
    { id:"scrap",   label:"Caja de chatarra",      rect:{left:6.3,top:62.2,width:8.7,height:18.1} },
    { id:"vise",    label:"Tornillo de banco",     rect:{left:23.3,top:44.6,width:10.5,height:18.1}, closeup:"vise" },
    { id:"lathe",   label:"Torno",                 rect:{left:46.7,top:43.0,width:20.6,height:13.8}, closeup:"lathe" },
    { id:"cabinet", label:"Armario de herramientas", rect:{left:69.7,top:16.5,width:15.0,height:68.5}, closeup:"cabinet" }
  ],

  closeups:{
    lathe:{
      label:"Placa del torno",
      image: A+"closeup_lathe.webp",
      html:[
        { rect:{left:41.3,top:66.7,width:19.7,height:10.0}, cls:"plate", content:"BRAMAH · Nº "+LATHE_SERIAL }
      ],
      hotspots:[ { id:"plate", label:"Leer la placa", rect:{left:39.5,top:63.8,width:23.3,height:15.9} } ]
    },
    cabinet:{
      label:"Armario de herramientas",
      image: s => s.flags.cabinetOpen ? A+"closeup_cabinet_open.webp" : A+"closeup_cabinet.webp",
      layers:[
        { id:"items", src:A+"closeup_cabinet_items.webp", when:s=>s.flags.cabinetOpen && !s.flags.cabinetEmptied,
          rect:{left:27.8,top:39.3,width:39.5,height:23.4}, label:"manivela y muelle" }
      ],
      hotspots:[
        { id:"items", label:"Coger la manivela y el muelle", rect:{left:27.8,top:39.3,width:39.5,height:23.4}, when:s=>s.flags.cabinetOpen && !s.flags.cabinetEmptied }
      ],
      dials:{
        id:"cabinet", code:LATHE_SERIAL, flag:"cabinetOpen",
        when:s=>!s.flags.cabinetOpen,
        help:"Candado de tres ruedas · Clic: siguiente · Clic derecho: anterior",
        positions:[
          {left:45.2,top:55.5,width:3.3,height:12.2},
          {left:48.9,top:55.5,width:3.0,height:12.2},
          {left:52.3,top:55.5,width:3.1,height:12.2}
        ]
      }
    },
    vise:{
      label:"Tornillo de banco",
      image: A+"closeup_vise.webp",
      layers:[
        { id:"disc", src:A+"closeup_vise_disc.webp", when:s=>s.flags.discPlaced && !s.flags.pendulumMade,
          rect:{left:43.4,top:9.6,width:15.3,height:36.1}, label:"disco en el tornillo" }
      ],
      hotspots:[
        { id:"jaws", label:"Mordazas del tornillo", rect:{left:38.3,top:12.8,width:23.9,height:53.1}, when:s=>!s.flags.pendulumMade }
      ]
    }
  },

  actions:{
    room:{
      stove(s){ S.say("Una estufa de hierro, fría desde hace tiempo. Solo ceniza."); },
      scrap(s){ S.say("Restos de latón, muelles rotos y tornillos. Nada aprovechable."); }
    },
    closeups:{
      lathe:{
        plate(s){
          s.flags.latheRead=true; S.emit("paper");
          S.say("La placa del torno: «BRAMAH · Nº "+LATHE_SERIAL+"».");
        }
      },
      cabinet:{
        items(s){
          s.flags.cabinetEmptied=true;
          S.addItem("crank"); S.addItem("spring");
          S.say("Coges una manivela de hierro y un muelle de acero.");
        }
      },
      vise:{
        jaws(s){
          if(!s.flags.discPlaced){
            if(S.useSelected("brassDisc")){
              s.flags.discPlaced=true; S.emit("use");
              S.say("Fijas el disco de latón entre las mordazas. Tiene un vástago con rosca: le falta algo que lo una a un eje.");
            }else{
              if(s.selected) S.emit("wrong");
              S.say("Un tornillo de banco robusto, con las mordazas abiertas. Sirve para sujetar una pieza mientras se monta.");
            }
            return;
          }
          if(S.useSelected("spring")){
            s.flags.pendulumMade=true; S.emit("solve");
            S.addItem("pendulum");
            S.say("Enroscas el muelle al vástago del disco y aprietas. Ya tienes un péndulo completo.");
          }else{
            if(s.selected) S.emit("wrong");
            S.say("El disco está sujeto en el tornillo. Necesita un muelle o varilla que lo una a un eje.");
          }
        }
      }
    },
    dials:{
      cabinet(s){ S.emit("unlock"); S.say("El candado se abre. Dentro del armario hay herramientas ordenadas."); }
    }
  }
});
})();
