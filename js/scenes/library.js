/* TRICKY DOORS — escenario: Biblioteca
 * Pistas cruzadas: el libro de registro habla del torno del taller y del busto;
 * el busto esconde la llave del taller; el globo guarda el disco de latón.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/library/";

TD.registerScene({
  id:"library",
  phase:"clockmaker",
  name:"Biblioteca",
  /* Se entra desde la puerta izquierda del vestíbulo: la puerta de vuelta debe quedar a la derecha. */
  mirror:true,
  base: A+"room_base.webp",
  enter: "La biblioteca. Huele a papel viejo. Un libro de registro espera abierto sobre el escritorio.",
  backMessage: "Vuelves a mirar la biblioteca.",

  overlays:[
    { id:"globe_open", src:A+"globe_open.webp", when:F("globeOpen"),
      rect:{left:82.5,top:40.9,width:15.8,height:46.2}, label:"globo abierto" }
  ],

  hotspots:[
    { id:"door",    label:"Volver al vestíbulo",     rect:{left:0.0,top:3.7,width:14.7,height:87.7}, goto:"hall", message:"Vuelves al vestíbulo." },
    { id:"ladder",  label:"Escalera",                rect:{left:16.4,top:12.8,width:10.8,height:70.7} },
    { id:"bust",    label:"Busto de Cronos",         rect:{left:33.8,top:32.4,width:8.1,height:24.4} },
    { id:"ledger",  label:"Libro de registro",       rect:{left:57.1,top:53.1,width:12.6,height:10.6}, closeup:"ledger" },
    { id:"globe",   label:"Globo terráqueo",         rect:{left:82.5,top:40.9,width:15.8,height:46.2} },
    { id:"shelves", label:"Estanterías",             rect:{left:17.9,top:0.0,width:62.8,height:35.1} }
  ],

  closeups:{
    ledger:{
      label:"Libro de registro",
      image: A+"closeup_ledger.webp",
      html:[
        { rect:{left:26.9,top:22.8,width:20.3,height:57.9}, cls:"paper", content:
          "<b>Inventario de la casa</b><br><br>"+
          "Torno de relojero, Bramah e Hijos. El número de serie está en la placa de latón del propio torno. La misma cifra abre el armario de herramientas del taller.<br><br>"+
          "Llave del taller: guardada bajo Cronos, que todo lo devora." },
        { rect:{left:55.9,top:21.3,width:27.2,height:59.5}, cls:"paper", content:
          "<b>Mecanismo del portón</b><br><br>"+
          "Solo cede con su péndulo instalado y las manecillas a la hora que mi padre guarda en el pecho, en su retrato.<br><br>"+
          "El disco de latón para el péndulo lo dejé donde el mundo se abre por el norte." }
      ],
      hotspots:[ { id:"read", label:"Leer el registro", rect:{left:12.3,top:15.4,width:76.9,height:70.1} } ]
    }
  },

  actions:{
    room:{
      ladder(s){ S.say("Una escalera de biblioteca. Los volúmenes de arriba tratan de astronomía y mecánica; nada que necesites ahora."); },
      shelves(s){ S.say("Tratados de relojería, mapas celestes y libros de cuentas. Uno de los estantes tiene un hueco del tamaño de un libro de registro."); },
      bust(s){
        if(s.flags.bustMoved){ S.say("El busto de Cronos, ya inclinado. Bajo la peana no queda nada."); return; }
        s.flags.bustMoved=true; S.emit("unlock");
        S.addItem("workshopKey");
        S.say("Inclinas el pesado busto de Cronos. Bajo la peana hay una llave de hierro con la etiqueta «Taller».");
      },
      globe(s){
        if(s.flags.globeOpen){ S.say("El hemisferio norte del globo está abierto como una tapa. Ya no hay nada dentro."); return; }
        s.flags.globeOpen=true; S.emit("open");
        S.addItem("brassDisc");
        S.say("Presionas el polo norte: el hemisferio se abre como una tapa. Dentro hay un disco de latón grabado, pesado.");
      }
    },
    closeups:{
      ledger:{
        read(s){
          s.flags.ledgerRead=true; S.emit("paper");
          S.say("Lees el registro: el número de serie del torno abre el armario del taller; la llave del taller está bajo Cronos; el disco, donde el mundo se abre por el norte.");
        }
      }
    }
  }
});
})();
