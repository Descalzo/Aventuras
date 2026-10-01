/* EL ARCHIVO NEGADO — Despacho del escribano mayor
 * Accesible desde la entrada sin llave. El estante esconde la lupa (reutilizable, hace
 * falta después en el depósito); las notas de Ibáñez son la bonificación de crónica
 * principal (D017): si el jugador ya conoce conocimiento.encubrimiento_naval (derrotero
 * y/o faro), añade una línea de reconocimiento sin cambiar la lógica del puzle. El cajón de
 * lacre es una prueba de sello por comparación (NO numérica): el molde de cera describe una
 * huella exacta y solo uno de cuatro sellos candidatos coincide en los tres rasgos a la vez.
 * Coordenadas en % de la escena (1672x941), sin calibrar todavía contra arte real.
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/negado/despacho/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"negado_despacho",
  phase:"negado",
  name:"Despacho del escribano mayor",
  base: A+"room_base.webp",
  enter: "El despacho de Ibáñez. Un escritorio cubierto de papeles, un estante de libros y un cajón con molde de cera.",
  backMessage: "Vuelves a mirar el despacho.",

  overlays:[
    { id:"cajon_abierto", src:A+"cajon_abierto.webp", when:F("selloProbado"),
      rect:pct(1180,545,1500,700), label:"cajón del lacre abierto" }
  ],

  hotspots:[
    { id:"puerta_entrada", label:"Volver a la entrada", rect:pct(40,220,260,780), goto:"negado_entrada", message:"Vuelves a la entrada." },
    { id:"estante",        label:"Estante de libros",   rect:pct(300,300,700,750), when:s=>!s.flags.lupaTaken },
    { id:"escritorio",     label:"Escritorio",          rect:pct(900,550,1300,850) },
    { id:"cajon_lacre",    label:"Cajón con molde de cera", rect:pct(600,650,900,880), closeup:"lacre" }
  ],

  closeups:{
    lacre:{
      label:"Molde de cera",
      image: A+"closeup_lacre.webp",
      hotspots:[
        { id:"molde",   label:"Molde de cera",  rect:pct(700,150,1000,420) },
        { id:"sello_a", label:"Sello: áncora bajo corona",              rect:pct(150,550,420,800), when:s=>!s.flags.selloProbado },
        { id:"sello_b", label:"Sello: nao entre dos torres, sin corona", rect:pct(480,550,750,800), when:s=>!s.flags.selloProbado },
        { id:"sello_c", label:"Sello: nao entre dos torres, con corona", rect:pct(810,550,1080,800), when:s=>!s.flags.selloProbado },
        { id:"sello_d", label:"Sello: tres torres y una estrella",       rect:pct(1140,550,1410,800), when:s=>!s.flags.selloProbado }
      ]
    }
  },

  actions:{
    room:{
      estante(s){
        s.flags.lupaTaken=true; S.addItem("lupa");
        S.say("Detrás de una fila de libros de cuentas, una lupa de mango de asta. Te servirá para leer letra pequeña.");
      },
      escritorio(s){
        s.flags.notasLeidas=true; S.emit("paper");
        let msg = "Notas de Baltasar Ibáñez, escribano mayor: «No tenía autoridad para corregir el Padrón Real. Así que guardé, aparte, cada corrección que la Casa prefirió no ver.»";
        if(TD.chronicle && TD.chronicle.know("conocimiento.encubrimiento_naval")){
          msg += " No es la primera vez que ves este patrón: otra autoridad marítima, en otro lugar y otro siglo, calló del mismo modo.";
        }
        S.say(msg);
      }
    },
    closeups:{
      lacre:{
        molde(s){
          S.say("La huella del molde de cera: una nao entre dos torres, bajo una corona pequeña.");
        },
        sello_a(s){ S.emit("wrong"); S.say("No encaja: este sello lleva un áncora, no una nao."); },
        sello_b(s){ S.emit("wrong"); S.say("No encaja del todo: la nao y las torres coinciden, pero a este sello le falta la corona."); },
        sello_c(s){
          if(s.flags.selloProbado){ S.say("El sello correcto, ya probado."); return; }
          s.flags.selloProbado=true; S.addItem("sello_contratacion");
          S.emit("unlock");
          S.say("Nao entre dos torres, con corona pequeña: coincide exactamente con la huella del molde. El cajón cede y el sello de la Casa queda en tus manos.");
        },
        sello_d(s){ S.emit("wrong"); S.say("No encaja: este sello no tiene ni nao ni corona, solo torres y una estrella."); }
      }
    }
  }
});
})();
