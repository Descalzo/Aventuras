/* EL RUMBO DE LA CASA — Azotea, rincón del astrolabio
 * Mismo tejado que la azotea de "La Casa de la Sirena" (comprobado por imagen: misma noche,
 * misma luna, misma torre al fondo, la espadaña de tres campanas ya visible al fondo desde
 * aquí) visto desde el rincón donde Valderas instaló su rueda de constelaciones.
 *
 * REVISIÓN (petición directa del usuario): se sube aquí por la compuerta del taller de
 * instrumentos (ver taller.js), cuya llave — desde la tercera revisión — solo se consigue
 * colocando el astrolabio YA montado sobre el derrotero YA reconstruido, en la mesa del
 * despacho (ver despacho.js). La otra vía, cruzar el tejado desde la espadaña
 * (azotea_campanas.js), también exige astrolabio+derrotero_verdadero en esa dirección
 * concreta. El final de la fase exige, además de orientar la rueda, que el mecanismo de las
 * campanas del otro extremo del tejado también esté resuelto — las dos líneas de la casa
 * (Derrotero y la Sirena) se cierran juntas, no por separado, y ninguna de las dos mitades
 * del tejado se alcanza ya sin haber completado antes el derrotero y el astrolabio.
 *
 * REVISIÓN (segunda vuelta, petición directa del usuario): el toque de campanas, antes,
 * solo ponía un flag a true — "debe darnos algo que valga para terminar la fase". Ahora la
 * propia rueda de constelaciones le falta la aguja indicadora (el eje central queda vacío,
 * `closeup_planisferio_sin_aguja.webp`, hasta que se coloca) — la misma aguja que suelta la
 * veleta de la espadaña al completar el toque (`aguja_constelaciones`, ver
 * azotea_campanas.js). Sin cruzar primero al otro lado del tejado y resolver el toque, la
 * rueda ni siquiera se deja intentar: dependencia mecánica real entre las dos mitades de la
 * casa, no solo el candado final del compartimento.
 *
 * REVISIÓN (cuarta vuelta, petición directa del usuario): el `room_base.webp` (el plano
 * general, antes de entrar en el primer plano) mostraba la aguja YA puesta de fábrica, aunque
 * el primer plano exigiera colocarla — la misma clase de contradicción visual que el aviso
 * del reloj de sol. Regenerado sin la aguja (`img-0109`); overlay `aguja_colocada.webp`
 * (recortado de los mismos píxeles del `room_base` anterior, no un render nuevo) para cuando
 * `agujaPlaced` es cierto, también visible desde el plano general.
 *
 * REVISIÓN (auditoría de coherencia visual, petición directa del usuario): `room_base.webp`
 * mostraba, a la izquierda, una puerta ABIERTA con una escalera interior iluminada tras
 * ella — sugiriendo un segundo acceso a esta sala que no existe: la única vía real es la
 * trampilla del suelo (`trampilla_bajar`, hacia el taller). Regenerado (`img-0113`) con esa
 * puerta cerrada y sin ninguna escalera visible, para no prometer un acceso que no hay.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/azotea/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

const MESES = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
const MES_CODE = "OCTUBRE";

TD.registerScene({
  id:"piloto_azotea",
  phase:"piloto",
  name:"Azotea — rincón del astrolabio",
  base: A+"room_base.webp",
  enter: "El rincón del astrolabio, en lo más alto de la casa. Un armazón de bronce oxidado y, al fondo, toda la ciudad extendida bajo un cielo ya oscuro; más allá, se adivina la espadaña de la casa.",
  backMessage: "Vuelves a mirar este rincón de la azotea.",

  overlays:[
    { id:"compartimento_abierto", src:A+"compartimento_abierto.webp", when:F("ruedaResuelta"),
      rect:pct(1010,290,1260,665), label:"compartimento abierto" },
    /* Petición directa del usuario: el plano general mostraba la aguja YA puesta por
     * defecto, contradiciendo el primer plano (que sí empezaba sin ella) — room_base.webp
     * regenerado sin la aguja (img-0109); este overlay recorta la aguja original del propio
     * room_base previo (mismos píxeles, comprobado por composición) para el estado "ya
     * colocada", visible también desde el plano general, no solo en el primer plano. */
    { id:"aguja_colocada", src:A+"aguja_colocada.webp", when:F("agujaPlaced"),
      rect:pct(460,240,1020,520), label:"aguja colocada en la rueda" }
  ],

  hotspots:[
    { id:"trampilla_bajar", label:"Bajar al taller", rect:pct(80,700,320,900), goto:"piloto_taller", message:"Bajas de nuevo al taller." },
    { id:"cruzar_tejado", label:"Cruzar hacia la espadaña", rect:pct(1380,0,1672,300), goto:"piloto_azotea_campanas",
      message:"Cruzas el tejado, entre macetas y tejas sueltas, hacia la espadaña." },
    { id:"planisferio",     label:"Rueda de constelaciones", rect:pct(500,200,1000,700), when:s=>!s.flags.ruedaResuelta },
    { id:"compartimento",   label:"Compartimento del armazón", rect:pct(1010,290,1260,665), when:F("ruedaResuelta") }
  ],

  closeups:{
    planisferio:{
      label:"Rueda de constelaciones",
      image: s => s.flags.agujaPlaced ? A+"closeup_planisferio.webp" : A+"closeup_planisferio_sin_aguja.webp",
      hotspots:[
        { id:"eje", label:"Eje central de la rueda", rect:pct(700,330,1000,570), when:s=>!s.flags.agujaPlaced }
      ],
      dials:{
        id:"planisferio", code:MES_CODE, flag:"ruedaResuelta",
        when:s=>s.flags.agujaPlaced && !s.flags.ruedaResuelta,
        symbols:[MESES],
        help:"La rueda exterior gira: clic avanza un mes, clic derecho retrocede",
        positions:[ pct(700,780,1000,880) ]
      }
    }
  },

  actions:{
    room:{
      planisferio(s){
        if(!s.flags.ruedaLubricada){
          if(S.useSelected("candil")){
            s.flags.ruedaLubricada=true; S.emit("use");
            S.say("Viertes el aceite del candil sobre el eje oxidado de la rueda. El chirrido cede: ahora gira con soltura.");
            return;
          }
          if(s.selected) S.emit("wrong");
          S.say(S.has("candil") ? "La rueda de constelaciones apenas gira: el eje está agarrotado por el óxido. Selecciona el candil para engrasarlo." : "La rueda de constelaciones apenas gira: el eje está agarrotado por el óxido y reseco de años.");
          return;
        }
        s.view = "planisferio";
        S.emit("view",{view:"planisferio"});
      },
      compartimento(s){
        if(s.flags.faseCompletada){ S.say("El compartimento sigue abierto, vacío ya: te llevaste lo que guardaba."); return; }
        if(!s.flags.toqueDone){
          S.say("Dentro del compartimento, protegido de la intemperie por dos siglos de bronce cerrado: el derrotero verdadero. Pero el pestillo no acaba de soltarse del todo — algo, en la espadaña al otro lado del tejado, sigue sin sonar como debe.");
          return;
        }
        s.flags.faseCompletada=true;
        S.emit("solve"); S.emit("door");
        S.say("Dentro del compartimento, protegido de la intemperie por dos siglos de bronce cerrado: el derrotero verdadero, tal y como lo dejó la última noche que subió aquí. En el mismo instante, abajo en el patio, los cerrojos de la cancela ceden: la sirena mira a la mar, las campanas han sonado su toque, y la casa entera, por fin, cuenta su historia completa.");
      }
    },
    closeups:{
      planisferio:{
        eje(s){
          if(S.useSelected("aguja_constelaciones")){
            s.flags.agujaPlaced=true; S.emit("use");
            S.say("La aguja de bronce encaja en el eje central, exactamente donde le falta a la rueda. Ahora sí señala algo.");
          }else{
            if(s.selected) S.emit("wrong");
            S.say("El eje central de la rueda está vacío: le falta la aguja que señale las constelaciones.");
          }
        }
      }
    },
    dials:{
      planisferio(s){
        S.emit("unlock");
        S.say("La rueda encaja en octubre. Un engranaje oculto libera un pestillo en el armazón de bronce: un compartimento se entreabre.");
      }
    }
  }
});
})();
