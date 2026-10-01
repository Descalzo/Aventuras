/* EL DERROTERO PERDIDO — Jardín interior
 * Accesible desde el patio sin llave. Tres llaves de la acequia, ABIERTAS por defecto (agua
 * corriendo por las tres): hay que CERRARLAS en el orden marcado en una teja escondida junto
 * a las macetas (mediodía, levante, poniente) para que el agua deje de regar un arriate y
 * aparezca lo que escondía. Cada llave se puede pulsar libremente en cualquier momento (nunca
 * se bloquea un giro): abre o cierra esa llave sin más. Lo que se vigila es la SECUENCIA de
 * las últimas 3 pulsaciones — si al completar 3 no coincide con el orden correcto, las tres
 * vuelven a abrirse de golpe y hay que empezar de nuevo. El plano del taller y un acierto
 * botánico confirman el mismo orden por otros caminos, sin revelarlo directamente.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/jardin/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

/* Orden correcto para CERRAR: mediodía -> levante -> poniente. Cada llave puede abrirse o
 * cerrarse libremente en cualquier momento (nunca se impide un giro). El flag valvulaXCerrada
 * indica "cerrada" (false/ausente = abierta, el estado por defecto del motor de juego para
 * cualquier flag no tocado, que es justo lo que queremos sin necesitar un inicializador).
 * Se guarda la secuencia de las últimas 3 llaves pulsadas; al llegar a 3 pulsaciones se
 * comprueba de una vez si coincide con el orden correcto de cierre. */
const ACEQUIA_ORDER = ["mediodia","levante","poniente"];
const ACEQUIA_LABEL = { mediodia:"mediodía", levante:"levante", poniente:"poniente" };
const valvulaFlag = w => "valvula"+w[0].toUpperCase()+w.slice(1)+"Cerrada";
function abrirTodas(s){ ACEQUIA_ORDER.forEach(w=>{ s.flags[valvulaFlag(w)]=false; }); }
function pressValvula(name){
  return function(s){
    if(s.flags.valvulasResueltas){ S.say("Las tres llaves están cerradas, tal y como marca el poste. El circuito ya no riega el rincón."); return; }
    const nowClosed = s.flags[valvulaFlag(name)] = !s.flags[valvulaFlag(name)];
    S.emit(nowClosed ? "wrong" : "use");
    S.say(nowClosed ? "Cierras la llave de "+ACEQUIA_LABEL[name]+". El ramal deja de correr." : "Abres la llave de "+ACEQUIA_LABEL[name]+". El agua vuelve a correr por ese ramal.");

    const seq = (s.acequiaSecuencia||[]).concat(name).slice(-3);
    s.acequiaSecuencia = seq;
    if(seq.length<3) return;
    s.acequiaSecuencia = [];
    const matches = ACEQUIA_ORDER.every((w,i)=>seq[i]===w) && ACEQUIA_ORDER.every(w=>!!s.flags[valvulaFlag(w)]);
    if(matches){
      s.flags.valvulasResueltas=true; S.emit("solve");
      S.say("Las tres llaves ceden en el orden grabado en la teja. El último giro purga el circuito: el agua deja de correr hacia el arriate del rincón. En pocos minutos la tierra, ya seca, empieza a agrietarse y algo asoma entre las raíces.");
    }else{
      abrirTodas(s); S.emit("wrong");
      S.say("Ese no era el orden: la presión se descontrola y las tres llaves se abren de golpe. Empiezas de nuevo.");
    }
  };
}

TD.registerScene({
  id:"derrotero_jardin",
  phase:"derrotero",
  name:"Jardín interior",
  base: A+"room_base.webp",
  enter: "El jardín. Naranjos, jazmines y, en un rincón, plantas que nadie sembraría en una huerta corriente. Las tres llaves de la acequia corren abiertas sin control: el agua anega un arriate que debería estar seco.",
  backMessage: "Vuelves a mirar el jardín.",

  overlays:[
    { id:"nave_ausente",  src:A+"nave_ausente.webp",  when:F("naveTaken"),
      rect:pct(200,430,520,750), label:"hueco entre las raíces" },
    { id:"arriate_seco",  src:A+"arriate_seco.webp",  when:F("valvulasResueltas"),
      rect:pct(1160,590,1665,880), label:"arriate seco" },
    { id:"arriate_vacio", src:A+"arriate_vacio.webp", when:F("frag5Taken"),
      rect:pct(1160,590,1665,880), label:"arriate ya registrado" }
  ],

  hotspots:[
    /* Recortada por abajo (antes llegaba a y=780): invadía la raíz de la buganvilla, que
     * empieza en y=430, y al pintarse antes en el DOM le robaba el clic en esa franja —
     * exactamente la confusión "raíz pegada al hito de al lado" que hay que evitar. */
    { id:"puerta_patio",   label:"Volver al patio", rect:pct(40,220,260,420), goto:"derrotero_patio", message:"Vuelves al patio." },
    { id:"raices",         label:"Raíces de la buganvilla", rect:pct(200,430,520,750), when:s=>!s.flags.naveTaken },
    /* Remedido con rejilla sobre room_base.webp: las tres llaves + la tubería que las
     * une caían un poco más arriba y más estrechas que el rect anterior (que dejaba las
     * cabezas de las tres ruedas parcialmente fuera por arriba). */
    { id:"acequia",        label:"Llaves de la acequia",    rect:pct(610,630,975,790), closeup:"acequia" },
    /* "plantas" (arriates del fondo) empezaba en x=300, invadiendo por completo la zona de
     * "raices" (x=200-520): al estar declarado después, se pintaba encima y robaba el clic
     * de la raíz de la buganvilla en toda esa franja — el jugador no podía cogerla. Se
     * recorta para que empiece justo donde termina "raices", sin solape. */
    { id:"plantas",        label:"Arriates",                rect:pct(560,300,1550,600), closeup:"plantas" },
    { id:"arriate_rincon", label:"Arriate del rincón",       rect:pct(1160,590,1665,880), when:s=>s.flags.valvulasResueltas && !s.flags.frag5Taken }
  ],

  closeups:{
    acequia:{
      label:"Llaves de la acequia",
      image: A+"closeup_acequia.webp",
      /* closeup_acequia.webp muestra ahora las tres llaves ABIERTAS por defecto (estado
       * inicial del puzle). Cada llave cerrada se añade como overlay independiente,
       * condicionado a que su flag esté a false (cerrada). */
      layers:[
        { id:"poniente_closed", src:A+"valvula_poniente_closed.webp", when:F("valvulaPonienteCerrada"),
          rect:pct(170,470,570,910), label:"llave de poniente cerrada" },
        { id:"levante_closed",  src:A+"valvula_levante_closed.webp",  when:F("valvulaLevanteCerrada"),
          rect:pct(655,470,1035,910), label:"llave de levante cerrada" },
        { id:"mediodia_closed", src:A+"valvula_mediodia_closed.webp", when:F("valvulaMediodiaCerrada"),
          rect:pct(1180,470,1560,910), label:"llave de mediodía cerrada" }
      ],
      /* Las tres llaves estaban desplazadas ~200-250px a la derecha y ~200px hacia abajo
       * respecto a las ruedas reales de closeup_acequia.webp: cada hotspot caía casi
       * encima de la llave SIGUIENTE en vez de la suya, y ninguno llegaba a cubrir la
       * rueda (solo el tramo inferior del mecanismo). Remedidas con rejilla de referencia. */
      hotspots:[
        { id:"valvula_poniente", label:"Llave de poniente", rect:pct(195,90,545,560) },
        { id:"valvula_levante",  label:"Llave de levante",  rect:pct(680,180,1010,545) },
        { id:"valvula_mediodia", label:"Llave de mediodía", rect:pct(1205,180,1530,545) }
      ]
    },
    plantas:{
      label:"Arriates del jardín",
      image: A+"closeup_plantas.webp",
      hotspots:[
        { id:"naranjo", label:"Naranjo",      rect:pct(120,200,480,780) },
        { id:"jazmin",  label:"Jazmín",       rect:pct(560,200,900,780) },
        { id:"romero",  label:"Romero",       rect:pct(960,200,1280,780) },
        { id:"tabaco",  label:"Planta desconocida", rect:pct(1340,200,1640,780) },
        /* Pista del orden de la acequia, integrada en el jardín (pedido explícito del
         * usuario): el poste de piedra entre el arriate del jazmín y el del romero, con
         * tres muescas talladas. Va después en el array para ganar el pequeño solape con
         * "jazmin" en esa esquina. */
        { id:"marca", label:"Poste con muescas", rect:pct(800,560,900,700) }
      ]
    }
  },

  actions:{
    room:{
      raices(s){
        s.flags.naveTaken=true; S.addItem("escudo_nave");
        S.say("Entre las raíces de la buganvilla, medio cubierto de tierra, hay un fragmento de piedra tallada: una nao. Encaja con el blasón de la puerta del salón.");
      },
      arriate_rincon(s){
        s.flags.frag5Taken=true; S.addItem("fragmento_derrotero_5"); S.addItem("soporte_tripode");
        S.say("Bajo la tierra agrietada, envueltos juntos en tela encerada: una hoja del derrotero y un trípode de latón, las patas plegadas como si esperaran esta tarde.");
      }
    },
    closeups:{
      acequia:{
        valvula_poniente: pressValvula("poniente"),
        valvula_levante:  pressValvula("levante"),
        valvula_mediodia: pressValvula("mediodia")
      },
      plantas:{
        naranjo(s){ S.say("Un naranjo cargado de azahar. Tan sevillano como la propia casa: no es lo que buscas."); },
        jazmin(s){ S.say("Jazmín, trepando por un enrejado. Común en cualquier patio de la ciudad."); },
        romero(s){ S.say("Romero, plantado en hilera. Nada fuera de lo corriente."); },
        tabaco(s){
          s.flags.plantaIdentificada=true; S.emit("paper");
          S.say("Hojas anchas y pegajosas, un tallo que ningún jardinero sevillano plantaría por gusto: tabaco, traído de las Indias. Necesita poca agua: alguien cerró a propósito las tres llaves de la acequia para no ahogarla.");
        },
        marca(s){
          s.flags.marcaAcequiaVista=true; S.emit("paper");
          S.say("Entre el arriate del jazmín y el del romero, un poste de piedra con tres muescas casi borradas por el musgo, cada una con una flecha: mediodía, levante, poniente. El orden exacto en que hay que cerrar las llaves de la acequia.");
        }
      }
    }
  }
});
})();
