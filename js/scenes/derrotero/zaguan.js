/* EL DERROTERO PERDIDO — Zaguán (entrada)
 * Punto de partida. Una aldaba con tres relieves (estrella, ancla, nao) guarda el paso al
 * patio; una inscripción junto a la puerta da el orden. Coordenadas en % de la escena
 * (1672x941), igual que el resto del proyecto.
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/zaguan/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

/* Secuencia de la aldaba: estrella -> ancla -> nao. Cualquier pulsación fuera de orden reinicia. */
function resetAldaba(s){ s.flags.aldabaEstrella=false; s.flags.aldabaAncla=false; s.flags.aldabaNave=false; }
function pressAldaba(part){
  const order = ["estrella","ancla","nave"];
  const flagOf = { estrella:"aldabaEstrella", ancla:"aldabaAncla", nave:"aldabaNave" };
  const progressOf = s => { const i = order.findIndex(p=>!s.flags[flagOf[p]]); return i===-1 ? order.length : i; };
  return function(s){
    if(s.flags.zaguanAbierto){ S.say("La cancela ya está abierta de par en par."); return; }
    const current = progressOf(s);
    const idx = order.indexOf(part);
    if(idx===current){
      s.flags[flagOf[part]] = true;
      if(part==="nave"){
        s.flags.zaguanAbierto = true;
        S.emit("unlock");
        S.say("Estrella, ancla y nao: los tres relieves ceden a la vez. La cancela se abre con un quejido de goznes viejos.");
      }else{
        S.emit("use");
        S.say(part==="estrella"
          ? "Presionas la estrella de ocho puntas. Un chasquido dentro de la puerta."
          : "El ancla cede tras la estrella. Un segundo chasquido.");
      }
      return;
    }
    const hadProgress = current>0;
    resetAldaba(s);
    if(hadProgress){ S.emit("wrong"); S.say("Un chasquido seco: el mecanismo vuelve a su sitio de golpe. El orden importa."); }
    else S.say("El relieve se hunde un poco y vuelve a su sitio. No parece que sea el primero.");
  };
}

TD.registerScene({
  id:"derrotero_zaguan",
  phase:"derrotero",
  name:"Zaguán",
  base: A+"room_base.webp",
  enter: "El zaguán del Palacio de Valderas. Huele a piedra fría y a cera vieja. Una cancela de forja cierra el paso al patio.",
  backMessage: "Vuelves a mirar el zaguán.",

  overlays:[
    /* Regenerada esta sesión, dos veces: primero porque el asset desplegado no coincidía
     * con el render de referencia (geometría distinta) y tenía oscurecimiento en los
     * bordes; una segunda pasada amplió mucho la caja y la pluma (la neblina, aunque
     * más tenue, seguía notándose con un recorte ajustado) — repartida sobre un área
     * grande, la transición deja de percibirse. */
    { id:"cancela_abierta", src:A+"cancela_abierta.webp", when:F("zaguanAbierto"),
      rect:pct(470,40,1150,900), label:"cancela abierta" },
    { id:"candil_ausente", src:A+"candil_ausente.webp", when:F("candilTaken"),
      rect:pct(120,560,260,680), label:"hornacina sin candil" },
    /* Recorte ampliado (antes 1160,800-1420,915, pluma 10): el borde, aunque bien
     * difuminado, seguía notándose como una neblina rectangular sutil contra la
     * esquina pared/suelo. Con una caja mucho más grande y una pluma más generosa
     * la transición queda repartida en un área grande y deja de notarse. */
    { id:"baldosa_movida", src:A+"baldosa_movida.webp", when:F("frag1Taken"),
      rect:pct(1000,650,1550,941), label:"baldosa movida" },
    { id:"hueco_pared", src:A+"hueco_pared.webp", when:F("anclaTaken"),
      rect:pct(1450,150,1610,360), label:"piedra suelta ya retirada" }
  ],

  hotspots:[
    { id:"aldaba",     label:"Aldaba de la cancela", rect:pct(720,375,870,515), closeup:"aldaba", when:s=>!s.flags.zaguanAbierto },
    { id:"cancela",    label:"Cancela",              rect:pct(620,180,1050,780), goto:"derrotero_patio", when:F("zaguanAbierto"), message:"Cruzas la cancela hacia el patio." },
    { id:"hornacina",  label:"Hornacina con un candil", rect:pct(50,300,275,680), when:s=>!s.flags.candilTaken },
    { id:"baldosa",    label:"Baldosa suelta",       rect:pct(1170,820,1370,915), when:s=>!s.flags.frag1Taken },
    { id:"piedra",     label:"Piedra suelta del muro", rect:pct(1460,155,1600,350), when:s=>!s.flags.anclaTaken },
    { id:"blason",     label:"Blasón sobre la puerta", rect:pct(620,15,980,140) }
  ],

  closeups:{
    aldaba:{
      label:"Aldaba de la cancela",
      image: A+"closeup_aldaba.webp",
      /* Las tres reliquias (estrella/ancla/nao) estaban desplazadas ~220px hacia abajo
       * respecto al relieve real de closeup_aldaba.webp — el ancla y la nao apenas
       * tocaban el borde inferior de su propio icono y caían sobre todo en la zona del
       * llamador. Remedidas con una rejilla de referencia sobre la imagen real. */
      hotspots:[
        { id:"inscripcion", label:"Inscripción",       rect:pct(480,700,1180,820) },
        { id:"estrella",    label:"Relieve: estrella", rect:pct(680,90,925,250) },
        { id:"ancla",       label:"Relieve: ancla",    rect:pct(555,195,715,430) },
        { id:"nave",        label:"Relieve: nao",      rect:pct(930,175,1205,455) }
      ]
    }
  },

  actions:{
    room:{
      hornacina(s){
        s.flags.candilTaken=true; S.addItem("candil");
        S.say("Un candil de aceite, todavía con mecha. Lo llevas contigo: en esta casa hará falta luz.");
      },
      baldosa(s){
        s.flags.frag1Taken=true; S.addItem("fragmento_derrotero_1");
        S.say("La baldosa se mueve al pisarla. Debajo, envuelta en un paño podrido, hay una hoja de papel doblada: una hoja del derrotero.");
      },
      piedra(s){
        s.flags.anclaTaken=true; S.addItem("escudo_ancla");
        S.say("Una piedra del muro está suelta, sin argamasa. Detrás, un fragmento tallado: un ancla. El mismo dibujo que el blasón de la puerta.");
      },
      blason(s){
        S.say("Un blasón de piedra sobre la puerta: ancla, torre y nao, las armas de los Valderas. El mismo dibujo se repite en la aldaba.");
      }
    },
    closeups:{
      aldaba:{
        inscripcion(s){
          s.flags.aldabaLeida=true; S.emit("paper");
          S.say("Tallado en el dintel: «Toca primero la estrella que guía, luego el ancla que sujeta, y por último la nao que parte».");
        },
        estrella: pressAldaba("estrella"),
        ancla:    pressAldaba("ancla"),
        nave:     pressAldaba("nave")
      }
    }
  }
});
})();
