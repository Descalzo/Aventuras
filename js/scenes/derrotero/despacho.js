/* EL DERROTERO PERDIDO — Despacho del piloto
 * Solo accesible tras montar el escudo en el salón. El escritorio guarda el diario (con la
 * fecha real, distinta de la que todo el mundo recuerda) y un cajón con una cerradura de
 * cuatro ruedas. La mesa de derrotero reúne las cinco hojas cuando están todas en el
 * inventario. Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/despacho/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const FRAGMENTOS = [1,2,3,4,5].map(n=>"fragmento_derrotero_"+n);

TD.registerScene({
  id:"derrotero_despacho",
  phase:"derrotero",
  name:"Despacho del piloto",
  base: A+"room_base.webp",
  enter: "El despacho de Valderas. Cartas de marear cubren las paredes; el polvo no se ha movido en generaciones, salvo el que has levantado tú al entrar.",
  backMessage: "Vuelves a mirar el despacho.",

  overlays:[
    { id:"cajon_abierto", src:A+"cajon_abierto.webp", when:F("cajonFechaAbierto"),
      rect:pct(700,600,940,760), label:"cajón abierto" },
    { id:"mesa_completa", src:A+"mesa_completa.webp", when:F("derroteroListo"),
      rect:pct(1080,520,1600,860), label:"derrotero reconstruido" }
  ],

  hotspots:[
    { id:"puerta_salon",  label:"Volver al salón", rect:pct(40,220,260,780), goto:"derrotero_salon", message:"Vuelves al salón." },
    { id:"escritorio",    label:"Escritorio",      rect:pct(560,540,1040,820), closeup:"escritorio" },
    { id:"mesa_derrotero",label:"Mesa de derrotero", rect:pct(1080,520,1600,860) },
    { id:"puerta_azotea_hint", label:"Trampilla del techo", rect:pct(1160,0,1420,90),
      message:"Un tragaluz cerrado. Desde aquí no parece que se pueda alcanzar." }
  ],

  closeups:{
    escritorio:{
      label:"Escritorio",
      image: A+"closeup_escritorio.webp",
      hotspots:[
        { id:"diario", label:"Diario de Valderas", rect:pct(520,320,900,560) }
      ],
      dials:{
        id:"cajon", code:"1699", flag:"cajonFechaAbierto",
        when:s=>!s.flags.cajonFechaAbierto,
        help:"Cuatro ruedas numeradas: clic avanza, clic derecho retrocede",
        /* Las cuatro ruedas estaban desplazadas ~100-125px hacia abajo respecto a la
         * imagen real (el rect empezaba en y=780 pero la ranura de cada rueda va de
         * y≈700 a y≈818) — medido por umbral de brillo columna a columna. */
        positions:[ pct(684,698,752,820), pct(762,698,830,820), pct(840,698,908,820), pct(918,698,986,820) ]
      }
    }
  },

  actions:{
    room:{
      mesa_derrotero(s){
        if(s.flags.derroteroListo){ S.say("Las cinco hojas ya descansan unidas sobre la mesa, bajo un cristal."); return; }
        /* Igual que cualquier otro objeto: hay que seleccionar las hojas en el
         * inventario antes de usarlas sobre la mesa — antes se unían solas con solo
         * pulsar la mesa, sin pasar por la selección. */
        if(S.selectedGroup()!=="fragmentos_derrotero"){ S.say("Necesito colocar aquí algo."); return; }
        const missing = FRAGMENTOS.filter(id=>!S.has(id));
        if(missing.length===0){
          S.useSelectedGroup("fragmentos_derrotero");
          FRAGMENTOS.forEach(id=>S.removeItem(id));
          S.addItem("derrotero_verdadero");
          s.flags.derroteroListo=true;
          S.emit("solve");
          S.say("Extiendes las cinco hojas sobre la mesa. Los bordes rotos encajan uno con otro: el derrotero verdadero traza un rumbo bien distinto del oficial, y una fecha, subrayada dos veces: OCTUBRE.");
          return;
        }
        S.say("Una mesa alargada, pensada para extender cartas de marear. Tienes "+(5-missing.length)+" de 5 hojas del derrotero.");
      }
    },
    closeups:{
      escritorio:{
        diario(s){
          s.flags.diarioLeido=true; S.emit("paper");
          S.say("«...el bajío que hundió al Rocío nunca se marcó en las cartas oficiales, y yo lo sabía. Me retiro este año de 1699, para no volver a hablar de aquella noche. — F. de Valderas»");
        }
      }
    },
    dials:{
      cajon(s){
        S.emit("unlock");
        S.say("1699. El cajón se abre. Dentro, una llave pequeña y un anillo de metal graduado: los recoges los dos.");
        s.flags.llaveBibliotecaTaken=true; S.addItem("llave_biblioteca");
        s.flags.anilloTaken=true; S.addItem("anillo_graduado");
      }
    }
  }
});
})();
