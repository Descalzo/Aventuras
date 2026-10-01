/* TRICKY DOORS — escenario: Estudio del relojero
 * Datos declarativos + acciones específicas. Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/study/";

/* Reloj de bolsillo del retrato: marca las 3:40 (pista para el portón del vestíbulo). */
const WATCH_HOUR = 3, WATCH_MIN = 40;
/* Esfera y hotspot del reloj en los primeros planos del retrato apartado (zoom fiel de la
 * escena, por eso el reloj es pequeño). Caja cerrada: elipse (766,572)-(803,627).
 * Caja abierta: la puerta de la caja tapa parte del retrato, elipse (999,592)-(1032,642). */
const WATCH_CLOSED    = {left:45.8,top:60.8,width:2.2,height:5.8};
const WATCH_CLOSED_HS = {left:44.3,top:57.4,width:5.4,height:12.8};
const WATCH_OPEN      = {left:59.7,top:62.9,width:2.0,height:5.3};
const WATCH_OPEN_HS   = {left:58.3,top:60.0,width:4.8,height:13.3};
function watchHands(){
  const ah = (WATCH_HOUR + WATCH_MIN/60) * 30, am = WATCH_MIN * 6;
  const p = (r,a)=>(50+r*Math.sin(a*Math.PI/180)).toFixed(1)+'" y2="'+(50-r*Math.cos(a*Math.PI/180)).toFixed(1);
  return '<svg viewBox="0 0 100 100" preserveAspectRatio="none">'+
    '<line x1="50" y1="50" x2="'+p(24,ah)+'" stroke="#2b2114" stroke-width="5" stroke-linecap="round"/>'+
    '<line x1="50" y1="50" x2="'+p(36,am)+'" stroke="#2b2114" stroke-width="3.5" stroke-linecap="round"/>'+
    '<circle cx="50" cy="50" r="3.5" fill="#6b5327"/></svg>';
}

TD.registerScene({
  id:"study",
  phase:"clockmaker",
  name:"Estudio del relojero",
  base: A+"room_base.webp",
  enter: "El estudio del relojero.",
  backMessage: "Vuelves a mirar el estudio.",

  /* Overlays sobre la escena base. El orden del array es el orden de apilado. */
  overlays:[
    { id:"drawer_open",    src:A+"drawer_open.webp",    when:F("drawerOpen"),
      rect:{left:18,top:52.8,width:16.2,height:15.5}, label:"cajón abierto" },
    { id:"panel_powered",  src:A+"panel_powered.webp",  when:F("panelPowered"),
      rect:{left:69.4,top:25.5,width:9.6,height:21.8}, label:"cuadro eléctrico" },
    { id:"clock_repaired", src:A+"clock_repaired.webp", when:F("clockRepaired"),
      rect:{left:35,top:1.6,width:16.5,height:35}, label:"reloj reparado" },
    { id:"picture_moved",  src:A+"picture_moved.webp",  when:s=>s.flags.pictureMoved && !s.flags.safeOpen,   // exclusivo con safe_open
      rect:{left:52.4,top:5,width:19.2,height:37.3}, label:"cuadro desplazado" },
    { id:"safe_open",      src:A+"safe_open.webp",      when:F("safeOpen"), fallback:"picture_moved",
      rect:{left:53.8,top:12.5,width:9.5,height:25}, label:"caja fuerte abierta" },
    { id:"door_open",      src:A+"door_open.webp",      when:F("doorOpen"),
      rect:{left:82.5,top:7,width:15,height:80}, label:"puerta abierta" }
  ],

  hotspots:[
    { id:"plant",    label:"Examinar maceta",           rect:{left:0,   top:40,  width:9,   height:37} },
    { id:"drawer",   label:"Examinar cajón",            rect:{left:19,  top:56,  width:14,  height:11}, closeup:"drawer" },
    { id:"clock",    label:"Examinar reloj",            rect:{left:35,  top:2,   width:17,  height:35} },
    { id:"picture",  label:"Examinar retrato",          rect:{left:54,  top:7.5, width:14,  height:31}, when:s=>!s.flags.pictureMoved, closeup:"portrait", message:"El retrato del relojero. El marco no está fijado a la pared: se mueve un poco." },
    { id:"portrait", label:"Mirar el retrato de cerca", rect:{left:62,  top:6,   width:9,   height:34}, when:F("pictureMoved"), closeup:"portrait", message:"El retrato apartado, con su reloj de bolsillo en la mano." },
    { id:"safe",     label:"Examinar caja fuerte",      rect:{left:54,  top:12.5,width:9,   height:25}, when:F("pictureMoved"), closeup:"safe" },
    { id:"panel",    label:"Examinar cuadro eléctrico", rect:{left:69.5,top:25.5,width:10,  height:22} },
    { id:"door",     label:"Examinar puerta",           rect:{left:82.5,top:8,   width:15.5,height:75}, when:s=>!s.flags.doorOpen },
    { id:"exit",     label:"Salir al pasillo",          rect:{left:82.5,top:8,   width:15.5,height:75}, when:F("doorOpen"), goto:"hall" }
  ],

  closeups:{
    drawer:{
      label:"Cajón del escritorio",
      image: s => !s.flags.drawerOpen ? A+"closeup_drawer_closed.webp"
                : (s.flags.noteTaken ? A+"closeup_drawer_empty.webp" : A+"closeup_drawer_open.webp"),
      hotspots:[
        { id:"lock", label:"Cerradura del cajón", rect:{left:21,top:52,width:59,height:22}, when:s=>!s.flags.drawerOpen },
        { id:"note", label:"Coger la nota",       rect:{left:37,top:52,width:17,height:11}, when:s=>s.flags.drawerOpen && !s.flags.noteTaken }
      ]
    },
    safe:{
      label:"Caja fuerte",
      image: s => s.flags.safeOpen ? A+"closeup_safe_open.webp" : A+"closeup_safe.webp",
      layers:[
        { id:"items", src:A+"closeup_safe_items.webp", when:s=>s.flags.safeOpen && !s.flags.safeEmptied,
          rect:{left:36.8,top:33.5,width:21.4,height:18}, label:"engranaje y fusible" }
      ],
      hotspots:[
        { id:"items", label:"Coger el engranaje y el fusible", rect:{left:36.8,top:33.5,width:21.4,height:18}, when:s=>s.flags.safeOpen && !s.flags.safeEmptied }
      ],
      dials:{
        id:"safe", code:"0825", flag:"safeOpen",
        when:s=>!s.flags.safeOpen,
        help:"Clic: girar rueda · Clic derecho: girar hacia atrás · Esc: volver",
        positions:[
          { left:40.3, top:41.4, width:3.4, height:10.6 },
          { left:44.2, top:41.4, width:3.4, height:10.6 },
          { left:47.9, top:41.4, width:3.4, height:10.6 },
          { left:51.7, top:41.4, width:3.4, height:10.6 }
        ]
      }
    },
    portrait:{
      label:"Retrato del relojero",
      /* colgado recto, o apartado sobre sus bisagras con la caja fuerte cerrada o abierta detrás */
      image: s => !s.flags.pictureMoved ? A+"closeup_portrait.webp"
                : (s.flags.safeOpen ? A+"closeup_portrait_moved.webp" : A+"closeup_portrait_moved_closed.webp"),
      html:[
        /* esfera del reloj, retrato recto: centro (893,650), diámetro 132 px */
        { rect:{left:49.5,top:62.1,width:7.9,height:14.0}, cls:"hands", content:watchHands, when:s=>!s.flags.pictureMoved },
        /* esfera del reloj, retrato apartado: una imagen por estado de la caja */
        { rect:WATCH_CLOSED, cls:"hands", content:watchHands, when:s=>s.flags.pictureMoved && !s.flags.safeOpen },
        { rect:WATCH_OPEN,   cls:"hands", content:watchHands, when:s=>s.flags.pictureMoved && s.flags.safeOpen }
      ],
      hotspots:[
        { id:"watch", label:"Reloj de bolsillo",  rect:{left:47,top:58,width:13,height:22}, when:s=>!s.flags.pictureMoved },
        { id:"watch", label:"Reloj de bolsillo",  rect:WATCH_CLOSED_HS, when:s=>s.flags.pictureMoved && !s.flags.safeOpen },
        { id:"watch", label:"Reloj de bolsillo",  rect:WATCH_OPEN_HS,   when:s=>s.flags.pictureMoved && s.flags.safeOpen },
        { id:"move",  label:"Apartar el retrato", rect:{left:27,top:2,width:46,height:20}, when:s=>!s.flags.pictureMoved }
      ]
    }
  },

  actions:{
    room:{
      plant(s){
        if(!s.flags.plantSearched){
          s.flags.plantSearched=true; S.addItem("smallKey");
          S.say("Apartas la tierra de la maceta. Debajo encuentras una pequeña llave de latón.");
        }else S.say("No parece haber nada más entre la tierra.");
      },
      drawer(s){
        s.view="drawer"; S.emit("view",{view:"drawer"});
        if(!s.flags.drawerOpen) S.say("Te acercas al cajón. Está cerrado con llave; la cerradura es muy pequeña.");
        else if(!s.flags.noteTaken) S.say("Dentro del cajón hay un sobre lacrado.");
        else S.say("El cajón está abierto. Ya no queda nada dentro.");
      },

      safe(s){
        s.view="safe"; S.emit("view",{view:"safe"});
        if(!s.flags.safeOpen) S.say("Cuatro ruedas numéricas. Gira cada una hasta formar el código correcto.");
        else if(!s.flags.safeEmptied) S.say("La caja fuerte está abierta. Dentro hay algo.");
        else S.say("La caja fuerte está abierta y vacía.");
      },
      clock(s){
        if(s.flags.clockRepaired){ S.say("El reloj vuelve a funcionar. El péndulo avanza con un tic-tac regular."); return; }
        if(S.useSelected("gear")){
          s.flags.clockRepaired=true; S.emit("solve"); S.addItem("doorKey");
          S.say("El engranaje encaja. El reloj revive y una llave ornamentada cae de una pequeña ranura.");
        }else{
          if(s.selected) S.emit("wrong");
          S.say("El reloj está parado a las 08:25. Tras el cristal falta uno de los engranajes.");
        }
      },
      panel(s){
        if(s.flags.panelPowered){ S.say("El cuadro eléctrico funciona. Una luz verde indica que la cerradura tiene corriente."); return; }
        if(S.useSelected("fuse")){
          s.flags.panelPowered=true; S.emit("unlock");
          S.say("Insertas el fusible. Las luces parpadean y la cerradura de la puerta se activa.");
        }else{
          if(s.selected) S.emit("wrong");
          S.say("El cuadro está abierto. Falta un fusible en el alojamiento central.");
        }
      },
      door(s){
        if(!s.flags.panelPowered){ if(s.selected) S.emit("wrong"); S.say("La cerradura electrónica está apagada. No llega corriente."); return; }
        if(!S.useSelected("doorKey")){
          if(s.selected) S.emit("wrong");
          S.say(S.has("doorKey") ? "Selecciona la llave ornamentada del inventario." : "La cerradura está activa, pero necesitas la llave adecuada.");
          return;
        }
        s.flags.doorOpen=true; S.emit("door");
        S.say("La llave gira. La puerta se abre lentamente hacia un pasillo iluminado.");
      }
    },
    closeups:{
      drawer:{
        lock(s){
          if(S.useSelected("smallKey")){
            s.flags.drawerOpen=true; S.emit("unlock");
            S.say("La llave encaja y gira. El cajón se abre: dentro hay un sobre lacrado.");
          }else if(S.has("smallKey")){
            if(s.selected) S.emit("wrong");
            S.say("El cajón está cerrado. Selecciona la llave pequeña del inventario y vuelve a pulsar sobre la cerradura.");
          }else{
            S.say("Cerrado con llave. La cerradura es demasiado pequeña para una llave normal.");
          }
        },
        note(s){
          s.flags.noteTaken=true; S.emit("paper");
          S.say("Abres el sobre. La nota dice: “"+TD.data.NOTE_TEXT+"”");
        }
      },
      safe:{
        items(s){
          s.flags.safeEmptied=true;
          S.addItem("gear"); S.addItem("fuse");
          S.say("Coges el engranaje y el fusible.");
        }
      },
      portrait:{
        watch(s){
          s.flags.portraitSeen=true; S.emit("paper");
          S.say("El reloj de bolsillo del retrato marca las tres y cuarenta. Curioso: el pintor se molestó en detallar la hora.");
        },
        move(s){
          s.flags.pictureMoved=true; s.view="room"; S.emit("unlock"); S.emit("view",{view:"room"});
          S.say("Empujas el marco: el retrato gira sobre unas bisagras ocultas. Detrás aparece una caja fuerte empotrada en la pared.");
        }
      }
    },
    dials:{
      safe(s){
        S.emit("unlock");
        S.say("Clac. La caja fuerte se abre. Dentro hay un engranaje y un fusible.");
      }
    }
  }
});
})();
