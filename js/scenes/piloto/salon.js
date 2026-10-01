/* EL RUMBO DE LA CASA — Salón principal
 * Idéntico al salón de "El Derrotero Perdido": retratos de familia y una puerta heráldica
 * con tres huecos (ancla, torre, nao) que da paso al despacho.
 *
 * REVISIÓN (petición directa del usuario, tercera vuelta): puerta real nueva a la librería
 * (img-0105), en el tramo de pared entre la consola con candelabros y la puerta heráldica —
 * sustituye a la puerta que se había probado en el despacho (demasiado escondida tras la
 * estantería, retirada). Sin cerradura. El hotspot de los retratos se recorta en x=850 para
 * no invadir la columna de la puerta nueva.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/salon/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const ESCUDO_PIECES = ["escudo_ancla","escudo_torre","escudo_nave"];

TD.registerScene({
  id:"piloto_salon",
  phase:"piloto",
  name:"Salón principal",
  base: A+"room_base.webp",
  enter: "El salón. Retratos ennegrecidos por el humo de las velas miran desde las paredes. Al fondo, una puerta con un escudo de piedra al que le faltan tres piezas.",
  backMessage: "Vuelves a mirar el salón.",

  overlays:[
    { id:"vitrina_vacia", src:A+"vitrina_vacia.webp", when:F("torreTaken"),
      rect:pct(200,480,420,760), label:"vitrina vacía" },
    { id:"escudo_ancla_puesto", src:A+"escudo_ancla_puesto.webp", when:F("despachoAbierto"),
      rect:pct(1180,340,1320,480), label:"ancla encajada" },
    { id:"escudo_torre_puesto", src:A+"escudo_torre_puesto.webp", when:F("despachoAbierto"),
      rect:pct(1320,300,1440,440), label:"torre encajada" },
    { id:"escudo_nave_puesto",  src:A+"escudo_nave_puesto.webp",  when:F("despachoAbierto"),
      rect:pct(1440,340,1580,480), label:"nao encajada" },
    { id:"puerta_despacho_abierta", src:A+"puerta_despacho_abierta.webp", when:F("despachoAbierto"),
      rect:pct(1050,10,1620,870), label:"puerta del despacho abierta" }
  ],

  hotspots:[
    { id:"puerta_patio",    label:"Volver al patio", rect:pct(40,220,185,780), goto:"piloto_patio", message:"Vuelves al patio." },
    { id:"vitrina",         label:"Vitrina de porcelana", rect:pct(200,480,420,760), when:s=>!s.flags.torreTaken },
    { id:"retratos",        label:"Retratos de familia",  rect:pct(190,0,850,400) },
    /* Puerta real nueva (img-0105), remedida por rejilla sobre la imagen desplegada. */
    { id:"puerta_biblioteca", label:"Librería", rect:pct(870,220,1000,620), goto:"piloto_biblioteca", message:"Cruzas a la librería." },
    { id:"puerta_heraldica",label:"Puerta con el escudo",  rect:pct(1050,10,1620,870), when:s=>!s.flags.despachoAbierto },
    { id:"puerta_despacho", label:"Despacho",              rect:pct(1050,10,1620,870), goto:"piloto_despacho", when:F("despachoAbierto") }
  ],

  actions:{
    room:{
      vitrina(s){
        s.flags.torreTaken=true; S.addItem("escudo_torre");
        S.say("La vitrina está resquebrajada. Entre los añicos de porcelana, un fragmento de piedra tallada: una torre. Encaja con el blasón de la puerta.");
      },
      retratos(s){
        S.say("Generaciones enteras, todos con el mismo gesto serio. Dos de los retratos, separados por casi un siglo, llevan el mismo anillo con un ancla grabada: el sello de piloto mayor no cambió de mano tan a menudo como el apellido de la familia.");
      },
      puerta_heraldica(s){
        const missing = ESCUDO_PIECES.filter(id=>!S.has(id));
        if(missing.length===0){
          ESCUDO_PIECES.forEach(id=>S.removeItem(id));
          s.flags.despachoAbierto=true;
          S.emit("unlock");
          S.say("Encajas el ancla, la torre y la nao en sus huecos. El escudo completo gira sobre un eje oculto: la puerta del despacho se abre.");
          return;
        }
        if(missing.length===3){
          S.say("Un escudo de piedra con tres huecos vacíos: la forma de un ancla, una torre y una nao. Alguien retiró las piezas hace mucho.");
        }else{
          S.say("Aún faltan "+missing.length+" piezas del escudo. Tienes "+(3-missing.length)+" de 3.");
        }
      }
    }
  }
});
})();
