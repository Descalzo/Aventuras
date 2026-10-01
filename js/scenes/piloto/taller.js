/* EL RUMBO DE LA CASA — Taller de instrumentos
 * Idéntico al taller de "El Derrotero Perdido" (formón, cofre, tarro, engranajes, plano,
 * compuerta al tejado). La puerta de medallones que comunicaba este taller con el de
 * azulejos se ha trasladado al zaguán (ver piloto/zaguan.js): estaba pegada al cajetín de
 * engranajes, un acceso inventado sin correspondencia real en la imagen, y ahora usa una de
 * las dos puertas reales del pasillo de entrada.
 *
 * REVISIÓN: este taller ya no se alcanza desde el patio (compartía la puerta del salón,
 * banda superior/inferior de un mismo hueco) — ahora se entra por una puerta real del
 * jardín, y esa puerta pasa a necesitar una llave propia (`llave_taller`, ver
 * piloto/jardin.js: aparece en la planta de tabaco). El plano de la pared sigue dando la
 * clave de los engranajes de aquí y de la acequia del jardín — REVISIÓN (petición directa
 * del usuario): antes solo decía «las tres llaves, cerradas», sin especificar en qué orden;
 * ahora repite el mismo orden que el poste del jardín (mediodía-levante-poniente), ya que el
 * usuario señaló que esta pista in situ debería bastar por sí sola.
 *
 * REVISIÓN (petición directa del usuario): la compuerta del techo ya NO depende
 * DIRECTAMENTE del astrolabio ni del derrotero verdadero en su propio código — depende
 * EXCLUSIVAMENTE de `llave_biblioteca` seleccionada, y la llave se consume al abrir la
 * compuerta (ya no tiene más usos). La librería, mientras tanto, dejó de necesitar cerradura
 * propia (se entra ahora por una puerta nueva desde el salón, ver piloto/salon.js).
 *
 * REVISIÓN (tercera vuelta, petición directa del usuario): la primera versión de este
 * cambio dejaba la compuerta —y con ella las dos mitades del tejado— alcanzable sin haber
 * completado ni el derrotero ni el astrolabio, porque la llave salía directa del cajón 1699
 * del despacho. Corregido moviendo el origen de la llave a `despacho.js`
 * (`actions.room.mesa_derrotero`): ahora solo aparece al colocar el astrolabio YA montado
 * sobre el derrotero YA reconstruido, en la misma mesa. La dependencia real queda así
 * reconstituida sin necesidad de comprobar `astrolabio`/`derrotero_verdadero` aquí mismo.
 *
 * REVISIÓN (segunda vuelta, petición directa del usuario): se probó un overlay
 * `compuerta_abierta.webp` para el estado visual abierto, pero el resultado no convenció al
 * usuario visualmente — retirado. La compuerta mantiene el mismo aspecto cerrado en el plano
 * general en los dos estados (se sabe que está abierta por el mensaje y porque el hotspot
 * pasa a llevar directamente a la azotea, no por un cambio de imagen).
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
  id:"piloto_taller",
  phase:"piloto",
  name:"Taller de instrumentos",
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
    /* Antes "Volver al patio": el taller ahora cuelga del jardín, no del patio. Mismo
     * hueco de puerta de la imagen (esquina inferior izquierda), solo cambia el destino. */
    { id:"puerta_jardin", label:"Volver al jardín", rect:pct(40,220,260,480), goto:"piloto_jardin", message:"Vuelves al jardín." },
    { id:"barril",       label:"Barril pesado",   rect:pct(180,600,420,880), when:s=>!s.flags.herramientaTaken },
    { id:"cofre",         label:"Cofre de hierro",  rect:pct(500,660,760,880), when:s=>!s.flags.manivelaTaken },
    { id:"tarro",         label:"Tarro sellado",    rect:pct(1330,530,1510,760), when:s=>!s.flags.frag4Taken },
    { id:"plano",         label:"Plano en la pared", rect:pct(900,160,1300,420) },
    { id:"cajetin",       label:"Cajetín de engranajes", rect:pct(1370,240,1660,545), closeup:"engranajes", when:s=>s.flags.herramientaTaken },
    { id:"cajetin_cerrado", label:"Cajetín de engranajes", rect:pct(1370,240,1660,545), when:s=>!s.flags.herramientaTaken,
      message:"Un cajetín remachado. Necesitarías herramienta para abrirlo." },
    { id:"compuerta",     label:"Compuerta del techo", rect:pct(680,0,1040,130), when:F("compuertaTallerAbierta"), goto:"piloto_azotea" },
    { id:"compuerta_cerrada", label:"Compuerta del techo", rect:pct(680,0,1040,130), when:s=>!s.flags.compuertaTallerAbierta }
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
        S.say("Un plano a tinta, medio borrado. Junto a un dibujo de tres engranajes: «norte, este, sur». Junto a un dibujo de la acequia del jardín: «las tres llaves, cerradas: mediodía, levante, poniente». En una esquina, casi ilegible, alguien más joven añadió después tres campanas, cada una con su propia voz — sin decir en qué orden.");
      },
      cajetin_cerrado(s){
        S.say("Un cajetín de bronce remachado a la pared. Necesitarías herramienta para abrirlo.");
      },
      compuerta_cerrada(s){
        if(S.useSelected("llave_biblioteca")){
          s.flags.compuertaTallerAbierta=true; S.emit("unlock");
          S.say("La llave de la librería encaja también en la cerradura de la compuerta. Cede con un chasquido: arriba, un rectángulo de cielo nocturno.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("llave_biblioteca") ? "Una compuerta de madera, atrancada con una cerradura pequeña. Selecciona la llave." : "Está cerrada con llave.");
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
