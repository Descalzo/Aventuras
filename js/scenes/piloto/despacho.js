/* EL RUMBO DE LA CASA — Despacho del piloto
 * Adaptado del despacho de "El Derrotero Perdido", con varios cambios respecto al original:
 * 1) el cajón de fecha (1699) ya NO entrega la llave de la compuerta nada más resolverlo —
 *    petición directa del usuario: antes se podía coger la llave (y con ella subir al tejado
 *    y en teoría terminar la fase) sin haber reunido las cinco hojas del derrotero ni montado
 *    el astrolabio. Ahora resolver 1699 solo dejaba una nota — y, tras otra vuelta de
 *    revisión, el usuario pidió que el cajón siguiera dando "algo que sirva para seguir el
 *    juego": la solución final reparte el paso en DOS sitios sin reabrir el hueco de
 *    progresión: en `mesa_derrotero` se COLOCA el astrolabio ya montado sobre el derrotero ya
 *    reconstruido (con su propio estado visual, `astrolabio_expuesto.webp`, img-0108); solo
 *    entonces, un nuevo clic sobre el escritorio ya abierto entrega la llave de verdad — antes
 *    solo la nota. El anillo graduado (para el astrolabio) se ha trasladado al archivo antiguo
 *    (ver piloto/archivo.js), para que montarlo dependa de una sala procedente de la otra
 *    aventura;
 * 1b) REVISIÓN (petición directa del usuario): resuelto el código del cajón, se corta a la
 *    sala de inmediato y el primer plano del escritorio ya NO se vuelve a abrir — antes había
 *    que volver a entrar en el cierre y pulsar el fondo del cajón, un paso fácil de olvidar.
 *    Ahora `actions.room.escritorio` decide todo desde la sala: antes del código, abre el
 *    primer plano; después, el propio clic dice qué falta (la compuerta del taller de
 *    instrumentos, que solo cede con el derrotero y el astrolabio juntos en la mesa) o
 *    entrega la llave en cuanto esa condición se cumple;
 * 2) el tragaluz del techo, puramente decorativo en el original ("no parece que se pueda
 *    alcanzar"), ahora reacciona una vez resuelta la rueda de constelaciones de la azotea:
 *    dependencia cruzada de solo lectura (no bloquea nada), confirmación narrativa de que el
 *    tejado unificado está justo encima de esta sala;
 * 3) el archivo antiguo ya NO se entra desde aquí (el acceso "tras la estantería" era un
 *    hotspot inventado, sin nada real detrás en la imagen) — ahora se llega por una de las
 *    dos puertas laterales del zaguán, ya existentes en su propia escena;
 * 4) el hotspot del escritorio estaba desalineado (heredado sin remedir contra la imagen
 *    real): recalibrado con rejilla de referencia;
 * 5) La puerta a la librería, probada aquí en la revisión anterior (img-0102), se retiró a
 *    petición del usuario (quedaba pequeña y escondida tras la estantería) — la estantería
 *    de la derecha vuelve a ser continua (img-0104) y la puerta real de la librería se movió
 *    al salón (ver piloto/salon.js). Sin cerradura: la librería ya no depende de
 *    `llave_biblioteca` (reasignada a la compuerta del taller de instrumentos, ver
 *    piloto/taller.js) ni de la escalera del patio (ver piloto/patio.js).
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/despacho/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const FRAGMENTOS = [1,2,3,4,5].map(n=>"fragmento_derrotero_"+n);

TD.registerScene({
  id:"piloto_despacho",
  phase:"piloto",
  name:"Despacho del piloto",
  base: A+"room_base.webp",
  enter: "El despacho. Cartas de marear cubren las paredes; el polvo no se ha movido en generaciones, salvo el que has levantado tú al entrar.",
  backMessage: "Vuelves a mirar el despacho.",

  overlays:[
    { id:"cajon_abierto", src:A+"cajon_abierto.webp", when:F("cajonFechaAbierto"),
      rect:pct(700,600,940,760), label:"cajón abierto" },
    { id:"mesa_completa", src:A+"mesa_completa.webp", when:F("derroteroListo"),
      rect:pct(1080,520,1600,860), label:"derrotero reconstruido" },
    /* Astrolabio expuesto sobre la mesa — petición directa del usuario: antes de esto la
     * colocación del astrolabio no tenía ningún reflejo visual, solo un mensaje de texto. */
    { id:"astrolabio_expuesto", src:A+"astrolabio_expuesto.webp", when:F("astrolabioExpuesto"),
      rect:pct(1080,520,1600,860), label:"astrolabio sobre la mesa" }
  ],

  hotspots:[
    { id:"puerta_salon",  label:"Volver al salón", rect:pct(40,220,260,780), goto:"piloto_salon", message:"Vuelves al salón." },
    /* Recalibrado con rejilla de referencia sobre room_base.webp: el escritorio real (mesa
     * + silla + objetos de encima) ocupa x≈395-1000, y≈375-730 — el rect anterior
     * (560,540,1040,820) empezaba más a la derecha y más abajo, dejando fuera media mesa
     * por la izquierda y el tercio superior con los objetos, e invadía por abajo la
     * alfombra.
     * REVISIÓN (petición directa del usuario): ya no declara `closeup` aquí — una vez
     * abierto el cajón (código 1699), `actions.room.escritorio` pasa a resolver el clic
     * directamente desde la sala (ver más abajo), así que este campo quedaría muerto
     * (una acción con el mismo id siempre gana sobre `closeup`, ver runHotspot). */
    { id:"escritorio",    label:"Escritorio",      rect:pct(395,375,1000,730) },
    { id:"mesa_derrotero",label:"Mesa de derrotero", rect:pct(1080,520,1600,860) },
    { id:"tragaluz",      label:"Tragaluz del techo", rect:pct(1160,0,1420,90) }
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
        positions:[ pct(684,698,752,820), pct(762,698,830,820), pct(840,698,908,820), pct(918,698,986,820) ]
      }
    }
  },

  actions:{
    room:{
      /* REVISIÓN (petición directa del usuario): antes, resolver el cajón (1699) dejaba el
       * primer plano abierto indefinidamente, y la llave final solo aparecía volviendo a
       * entrar en el cierre y pulsando el fondo del cajón — fácil de olvidar. Ahora
       * `escritorio` decide todo desde la sala: antes de resolver el código, abre el primer
       * plano (como hacía antes el propio hotspot declarativo); resuelto ya el código, el
       * primer plano no se vuelve a abrir — el propio clic en la sala dice qué falta (la
       * compuerta del taller, que solo cede con el derrotero y el astrolabio juntos en la
       * mesa) o entrega la llave en cuanto esa condición se cumple. */
      escritorio(s){
        if(!s.flags.cajonFechaAbierto){
          s.view="escritorio"; S.emit("view",{view:"escritorio"});
          return;
        }
        if(s.flags.llaveBibliotecaTaken){ S.say("El cajón sigue abierto y vacío."); return; }
        if(s.flags.astrolabioExpuesto){
          s.flags.llaveBibliotecaTaken=true; S.addItem("llave_biblioteca");
          S.emit("solve");
          S.say("Rebuscas de nuevo en el fondo del cajón: donde antes solo había una nota, ahora hay una llave pequeña.");
          return;
        }
        S.say("El cajón sigue abierto, vacío salvo la nota de antes: en el taller de instrumentos hay una compuerta cerrada que solo se abrirá cuando el derrotero verdadero y el astrolabio del piloto reposen juntos sobre esta mesa.");
      },
      mesa_derrotero(s){
        if(s.flags.astrolabioExpuesto){ S.say("El derrotero verdadero y el astrolabio del piloto reposan juntos sobre la mesa, bajo un cristal."); return; }
        if(s.flags.derroteroListo){
          if(s.selected!=="astrolabio"){
            if(s.selected) S.emit("wrong");
            S.say("El derrotero verdadero ya está aquí, desplegado. La nota del cajón hablaba de dos cosas juntas: falta el astrolabio del piloto.");
            return;
          }
          s.selected=null;
          s.flags.astrolabioExpuesto=true; S.emit("use");
          S.say("Colocas el astrolabio sobre el derrotero desplegado, tal y como debieron quedar la última noche que alguien subió al tejado.");
          return;
        }
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
      },
      tragaluz(s){
        if(!s.flags.ruedaResuelta){ S.say("Un tragaluz cerrado. Desde aquí no parece que se pueda alcanzar."); return; }
        if(!s.flags.tragaluzVisto){
          s.flags.tragaluzVisto=true; S.emit("paper");
          S.say("Desde que en la azotea la rueda de constelaciones volvió a girar, algo se ha movido también aquí arriba: un rayo de luna entra ahora por el tragaluz y cae justo sobre el mapamundi de la pared, marcando un punto de la costa que nunca te había llamado la atención: Sanlúcar.");
          return;
        }
        S.say("El rayo de luna sigue cayendo sobre Sanlúcar, en el mapamundi.");
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
      /* REVISIÓN (petición directa del usuario): resuelto el código, se corta directamente a
       * la sala — el propio `actions.room.escritorio` (arriba) es ahora quien decide qué
       * pasa en cualquier visita posterior al cajón; el primer plano no se vuelve a abrir. */
      cajon(s){
        S.emit("unlock");
        s.flags.cajonNotaLeida=true; S.emit("paper");
        s.view="room"; S.emit("view",{view:"room"});
        S.say("1699. El cajón se abre: está vacío, salvo una nota con la misma letra del diario: «Cuando el derrotero verdadero y el astrolabio del piloto reposen juntos sobre esta mesa, la llave aparecerá donde debe estar».");
      }
    }
  }
});
})();
