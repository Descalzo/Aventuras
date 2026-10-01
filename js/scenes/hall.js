/* TRICKY DOORS — escenario: Vestíbulo
 * Distribuidor de la casa: conecta estudio, biblioteca y taller. Al fondo, el portón
 * con el mecanismo maestro: péndulo + hora correcta + manivela.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/hall/";

/* Hora que marca el reloj de bolsillo del retrato (estudio): 3:40 -> III / 40 */
const HOURS = ["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"];
const MINUTES = ["00","05","10","15","20","25","30","35","40","45","50","55"];
const GATE_CODE = "III40";

/* Manecillas del reloj del portón según las ruedas (SVG sobre la esfera). */
function hands(s){
  const v = s.dials.gate || [0,0];
  const h = v[0]%12, m = v[1]%12;
  const ah = (h + (m*5)/60) * 30, am = m*5*6;
  return '<svg viewBox="0 0 100 100">'+
    '<line x1="50" y1="50" x2="'+(50+26*Math.sin(ah*Math.PI/180)).toFixed(1)+'" y2="'+(50-26*Math.cos(ah*Math.PI/180)).toFixed(1)+'" stroke="#2b2114" stroke-width="5" stroke-linecap="round"/>'+
    '<line x1="50" y1="50" x2="'+(50+38*Math.sin(am*Math.PI/180)).toFixed(1)+'" y2="'+(50-38*Math.cos(am*Math.PI/180)).toFixed(1)+'" stroke="#2b2114" stroke-width="3.5" stroke-linecap="round"/>'+
    '<circle cx="50" cy="50" r="3.5" fill="#c9a55c"/></svg>';
}

TD.registerScene({
  id:"hall",
  phase:"clockmaker",
  name:"Vestíbulo",
  base: A+"room_base.webp",
  enter: "El vestíbulo. Al fondo, un portón de hierro con un mecanismo de relojería. Dos puertas más: una a cada lado.",
  backMessage: "Vuelves a mirar el vestíbulo.",

  overlays:[
    { id:"gate_open", src:A+"gate_open.webp", when:F("gateOpen"),
      rect:{left:34.1,top:6.4,width:32.9,height:80.8}, label:"portón abierto" }
  ],

  hotspots:[
    { id:"study_door",   label:"Volver al estudio",        rect:{left:0.0,top:19.1,width:6.0,height:57.4}, goto:"study", message:"Vuelves al estudio." },
    { id:"library_door", label:"Puerta de la biblioteca",  rect:{left:6.9,top:9.6,width:15.0,height:79.7}, goto:"library" },
    { id:"workshop_door",label:"Puerta del taller",        rect:{left:77.8,top:9.0,width:16.4,height:81.3} },
    { id:"plaque",       label:"Placa grabada",            rect:{left:25.1,top:34.5,width:6.9,height:6.9}, closeup:"plaque" },
    { id:"gate",         label:"Mecanismo del portón",     rect:{left:35.9,top:8.5,width:29.3,height:76.5}, closeup:"gate", when:s=>!s.flags.gateOpen },
    { id:"exit",         label:"Salir",                    rect:{left:35.9,top:8.5,width:29.3,height:76.5}, when:F("gateOpen") }
  ],

  closeups:{
    plaque:{
      label:"Placa de latón",
      image: A+"closeup_plaque.webp",
      html:[
        { rect:{left:23.9,top:29.8,width:52.3,height:36.1}, cls:"plate engraved",
          content:"NADA SE MUEVE SIN SU PESO.<br>LA HORA ES LA QUE ÉL GUARDA EN EL PECHO." }
      ],
      hotspots:[ { id:"read", label:"Leer la placa", rect:{left:14.2,top:17.6,width:71.1,height:59.6} } ]
    },
    gate:{
      label:"Mecanismo del portón",
      image: A+"closeup_gate.webp",
      layers:[
        { id:"pendulum", src:A+"closeup_gate_pendulum.webp", when:F("pendulumInstalled"),
          rect:{left:40.7,top:43.6,width:18.5,height:52.1}, label:"péndulo instalado" },
        { id:"crank",    src:A+"closeup_gate_crank.webp",    when:F("crankPlaced"),
          rect:{left:65.8,top:45.2,width:19.7,height:26.0}, label:"manivela colocada" }
      ],
      html:[
        { rect:{left:40.1,top:8.0,width:19.7,height:35.1}, cls:"hands", content:hands }
      ],
      hotspots:[
        { id:"housing", label:"Alojamiento del péndulo", rect:{left:41.9,top:45.7,width:16.1,height:47.8}, when:s=>!s.flags.pendulumInstalled },
        { id:"socket",  label:"Encastre de la manivela",  rect:{left:62.2,top:46.8,width:8.4,height:21.3}, when:s=>!s.flags.crankPlaced },
        { id:"turn",    label:"Girar la manivela",        rect:{left:65.8,top:45.2,width:19.7,height:26.0}, when:s=>s.flags.crankPlaced && !s.flags.gateOpen }
      ],
      dials:{
        id:"gate", code:GATE_CODE, flag:"gateTimeSet",
        when:s=>!s.flags.gateOpen,
        help:"Ruedas: hora y minutos · Clic: siguiente · Clic derecho: anterior",
        symbols:[HOURS, MINUTES],   // un conjunto de símbolos por rueda
        positions:[
          {left:26.5,top:39.7,width:6.0,height:10.6},
          {left:26.4,top:53.7,width:6.0,height:10.6}
        ]
      }
    }
  },

  actions:{
    room:{
      workshop_door(s){
        if(s.flags.workshopUnlocked){ S.go("workshop"); S.say(TD.scenes.workshop.enter); return; }
        if(S.useSelected("workshopKey")){
          s.flags.workshopUnlocked=true; S.emit("unlock");
          S.say("La llave del taller abre el candado. El cerrojo cede con un chirrido.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say("La puerta del taller está cerrada con un cerrojo y un candado pesado.");
      },
      exit(s){
        S.say("El portón está abierto. La noche fría entra desde el jardín.");
      }
    },
    closeups:{
      plaque:{
        read(s){
          s.flags.plaqueRead=true; S.emit("paper");
          S.say("Placa: “Nada se mueve sin su peso. La hora es la que él guarda en el pecho.”");
        }
      },
      gate:{
        housing(s){
          if(S.useSelected("pendulum")){
            s.flags.pendulumInstalled=true; S.emit("unlock");
            S.say("El péndulo encaja en sus guías y empieza a oscilar lentamente.");
          }else{
            if(s.selected) S.emit("wrong");
            S.say("Un alojamiento vertical con guías, vacío. Le falta un peso que oscile.");
          }
        },
        socket(s){
          if(S.useSelected("crank")){
            s.flags.crankPlaced=true; S.emit("unlock");
            S.say("La manivela entra en el encastre cuadrado.");
          }else{
            if(s.selected) S.emit("wrong");
            S.say("Un encastre cuadrado de latón. Aquí iría una manivela.");
          }
        },
        turn(s){
          if(!s.flags.pendulumInstalled){ S.emit("wrong"); S.say("La manivela gira en vano: sin péndulo, el mecanismo no toma cuerda."); return; }
          if(!s.flags.gateTimeSet){ S.emit("wrong"); S.say("El mecanismo se traba. Las manecillas no marcan la hora correcta."); return; }
          s.flags.gateOpen=true; s.view="room";   // el telón descubre el portón abierto en la sala
          S.emit("door"); S.emit("solve");
          S.say("Giras la manivela. El reloj cobra vida, los cerrojos se retiran uno a uno y el portón se abre.");
        }
      }
    },
    dials:{
      gate(s){ S.emit("unlock"); S.say("Clic. Las manecillas quedan fijas: el mecanismo acepta la hora."); }
    }
  }
});
})();
