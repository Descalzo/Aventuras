/* EL DERROTERO PERDIDO — Taller
 * Accesible desde el patio sin llave. Un barril bloquea un cajón con un formón; el formón,
 * una vez en el inventario, permite forzar el cofre (manivela), el tarro sellado (hoja IV)
 * y el cajetín de los engranajes (alidada) — nunca se consume, es una herramienta.
 * Un plano en la pared da la clave de los engranajes de aquí Y de las válvulas del jardín.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/taller/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const GEAR_SYMBOLS = ["N","E","S","O"];
const GEAR_CODE = "NES";

TD.registerScene({
  id:"derrotero_taller",
  phase:"derrotero",
  name:"Taller",
  base: A+"room_base.webp",
  enter: "El taller. Herramientas de tornero cubiertas de telarañas, un banco de trabajo y olor a aceite viejo.",
  backMessage: "Vuelves a mirar el taller.",

  overlays:[
    { id:"barril_movido", src:A+"barril_movido.webp", when:F("herramientaTaken"),
      rect:pct(25,505,505,880), label:"barril apartado" },
    { id:"cofre_abierto",  src:A+"cofre_abierto.webp",  when:F("manivelaTaken"),
      rect:pct(500,660,760,880), label:"cofre abierto" },
    { id:"tarro_roto",     src:A+"tarro_roto.webp",     when:F("frag4Taken"),
      rect:pct(1320,540,1520,810), label:"tarro roto" }
  ],

  hotspots:[
    /* Recortada por abajo (antes llegaba a y=780): invadía el barril, que empieza en
     * y=505, y al pintarse antes en el DOM le robaba el clic en esa franja. */
    { id:"puerta_patio", label:"Volver al patio", rect:pct(40,220,260,480), goto:"derrotero_patio", message:"Vuelves al patio." },
    { id:"barril",       label:"Barril pesado",   rect:pct(180,600,420,880), when:s=>!s.flags.herramientaTaken },
    { id:"cofre",         label:"Cofre de hierro",  rect:pct(500,660,760,880), when:s=>!s.flags.manivelaTaken },
    { id:"tarro",         label:"Tarro sellado",    rect:pct(1330,530,1510,760), when:s=>!s.flags.frag4Taken },
    { id:"plano",         label:"Plano en la pared", rect:pct(900,160,1300,420) },
    { id:"cajetin",       label:"Cajetín de engranajes", rect:pct(1370,240,1660,545), closeup:"engranajes", when:s=>s.flags.herramientaTaken },
    { id:"cajetin_cerrado", label:"Cajetín de engranajes", rect:pct(1370,240,1660,545), when:s=>!s.flags.herramientaTaken,
      message:"Un cajetín remachado. Necesitarías herramienta para abrirlo." },
    { id:"trampilla",     label:"Trampilla de la azotea", rect:pct(680,0,1040,130), when:s=>S.has("astrolabio") && S.has("derrotero_verdadero"), goto:"derrotero_azotea" },
    { id:"trampilla_cerrada", label:"Trampilla de la azotea", rect:pct(680,0,1040,130), when:s=>!(S.has("astrolabio") && S.has("derrotero_verdadero")) }
  ],

  closeups:{
    engranajes:{
      label:"Cajetín de engranajes",
      image: A+"closeup_engranajes.webp",
      dials:{
        id:"engranajes", code:GEAR_CODE, flag:"engranajesResueltos",
        when:s=>!s.flags.engranajesResueltos,
        symbols:GEAR_SYMBOLS,
        help:"Tres engranajes: clic gira, clic derecho gira al revés",
        /* Los tres engranajes estaban desplazados a la derecha respecto a la imagen real
         * (el primero solo tenía un 18% de solape con su propio engranaje). Remedidos
         * con rejilla sobre closeup_engranajes.webp. */
        positions:[ pct(1040,335,1190,535), pct(1240,335,1390,535), pct(1435,335,1585,535) ]
      }
    }
  },

  actions:{
    room:{
      barril(s){
        s.flags.herramientaTaken=true; S.addItem("herramienta_taller");
        S.say("Apoyas el hombro contra el barril y lo apartas. Detrás, en un cajón entreabierto, hay un formón de tornero todavía afilado. Lo coges: te servirá para forzar cosas.");
      },
      cofre(s){
        if(!s.flags.herramientaTaken){ S.say("Un cofre de hierro, con la cerradura oxidada y soldada por el óxido. Necesitarías algo con lo que forzarla."); return; }
        /* El formón no se consume (es una herramienta reutilizable, ver cajetín y tarro),
         * así que no se puede usar S.useSelected (lo retiraría del inventario) — solo se
         * comprueba que esté seleccionado, igual que exige el resto del juego antes de
         * usar un objeto sobre un hotspot. */
        if(s.selected!=="herramienta_taller"){ S.say("Necesito el formón para forzar esto."); return; }
        s.selected=null;
        s.flags.manivelaTaken=true; S.addItem("manivela_pozo");
        S.say("Hincas el formón bajo la cerradura y hace palanca. El cofre se abre: dentro, la manivela de un cabrestante.");
      },
      tarro(s){
        if(!s.flags.herramientaTaken){ S.say("Un tarro de barro, sellado con cera y lacre. No se abre a mano limpia."); return; }
        if(s.selected!=="herramienta_taller"){ S.say("Necesito el formón para forzar esto."); return; }
        s.selected=null;
        s.flags.frag4Taken=true; S.addItem("fragmento_derrotero_4");
        S.say("El formón rompe el lacre. Dentro del tarro, enrollada para protegerla de la humedad, otra hoja del derrotero.");
      },
      plano(s){
        s.flags.planoTallerVisto=true; S.emit("paper");
        S.say("Un plano a tinta, medio borrado. Junto a un dibujo de tres engranajes: «norte, este, sur». Junto a un dibujo de la acequia del jardín: «las tres llaves, cerradas».");
      },
      cajetin_cerrado(s){
        S.say("Un cajetín de bronce remachado a la pared. Necesitarías herramienta para abrirlo.");
      },
      trampilla_cerrada(s){
        const need = [];
        if(!S.has("astrolabio")) need.push("el astrolabio montado");
        if(!S.has("derrotero_verdadero")) need.push("las cinco hojas del derrotero unidas");
        S.say("Una trampilla firmemente atrancada desde dentro. No cederá hasta que tengas "+need.join(" y ")+".");
      }
    },
    dials:{
      engranajes(s){
        S.emit("unlock");
        S.addItem("alidada");
        S.say("Norte, este, sur: los tres engranajes encajan sus dientes y liberan un cajetín interior. Dentro, envuelta en fieltro, una alidada de bronce.");
      }
    }
  }
});
})();
