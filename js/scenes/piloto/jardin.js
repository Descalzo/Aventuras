/* EL RUMBO DE LA CASA — Jardín interior
 * Idéntico al jardín de "El Derrotero Perdido" (acequia, plantas, escudo de la nao), con un
 * único injerto: el azulejo del ancla de "La Casa de la Sirena" se traslada aquí, a la
 * fuente de pared que el propio jardín ya tenía sin usar — en vez de duplicar una segunda
 * fuente exclusiva de Sevilla.
 *
 * REVISIÓN (petición directa del usuario): la puerta del taller de instrumentos, hasta ahora
 * de libre acceso, pasa a necesitar una llave (`llave_taller`) que aparece al examinar la
 * planta de tabaco del arriate — DELIBERADAMENTE sin depender del estado de la acequia (el
 * usuario lo pidió así tras notar que la pista del orden de cierre vive dentro del propio
 * taller, en el plano de la pared: exigir la acequia resuelta para entrar habría creado un
 * candado circular). El mensaje al examinar el tabaco por primera vez varía según si las
 * llaves de la acequia siguen abiertas o ya están cerradas, pero la llave se entrega en
 * ambos casos por igual.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/jardin/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

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
  id:"piloto_jardin",
  phase:"piloto",
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
    { id:"puerta_patio",   label:"Volver al patio", rect:pct(40,220,260,420), goto:"piloto_patio", message:"Vuelves al patio." },
    /* Galería cubierta de la derecha (rejilla: x 1380-1670, y 100-650), hasta ahora sin
     * usar: el taller de instrumentos pasa a alcanzarse desde aquí en vez de compartir
     * puerta con el salón en el patio (ver piloto/patio.js y piloto/taller.js).
     * REVISIÓN (petición directa del usuario): ya no es libre — necesita `llave_taller`,
     * encontrada en la planta de tabaco (ver closeups.plantas.tabaco más abajo). Mismo
     * patrón que la compuerta del techo (piloto/taller.js): par cerrada/abierta, llave
     * seleccionada y consumida al usarla. */
    { id:"puerta_taller_cerrada", label:"Taller", rect:pct(1380,100,1670,580), when:s=>!s.flags.tallerAbierto },
    { id:"puerta_taller",  label:"Taller",           rect:pct(1380,100,1670,580), goto:"piloto_taller", when:F("tallerAbierto"), message:"Cruzas la galería cubierta hacia el taller." },
    { id:"raices",         label:"Raíces de la buganvilla", rect:pct(200,430,520,750), when:s=>!s.flags.naveTaken },
    { id:"acequia",        label:"Llaves de la acequia",    rect:pct(610,630,975,790), closeup:"acequia" },
    { id:"plantas",        label:"Arriates",                rect:pct(560,300,1550,600), closeup:"plantas" },
    { id:"arriate_rincon", label:"Arriate del rincón",       rect:pct(1160,590,1665,880), when:s=>s.flags.valvulasResueltas && !s.flags.frag5Taken },
    /* Azulejo del ancla (antes en la fuente seca del patio de Sevilla, que ya no existe
     * como escena propia): la fuente de pared de este jardín, hasta ahora pura decoración,
     * pasa a tener un azulejo suelto en la base. Cero asset nuevo. */
    { id:"fuente",         label:"Fuente de pared",          rect:pct(780,180,980,430), when:s=>!s.flags.anchorTileTaken }
  ],

  closeups:{
    acequia:{
      label:"Llaves de la acequia",
      /* REVISIÓN (petición directa del usuario, jugando en vivo): dos arreglos de imagen.
       * 1) Las tres llaves no reflejaban su propio estado — los overlays `_closed` solo
       *    tapaban el caño/agua, nunca la propia rueda, así que el aspecto era siempre el
       *    mismo pasara lo que pasara. Regenerados los tres (edición Codex de este mismo
       *    `closeup_acequia.webp`) para que la rueda cerrada se vea realmente atornillada
       *    hacia abajo y girada, no solo el caño seco.
       * 2) La rueda de poniente (izquierda) ya venía, en la foto original, bastante más alta
       *    que las otras dos — nivelada por separado (img-0128) para que las tres queden a
       *    la misma altura al estar abiertas. Esto obligó a recortar de nuevo los overlays
       *    `_closed` de levante y mediodía con una caja más alta (antes empezaba justo donde
       *    quedaba la rueda VIEJA, más baja): si no, con la rueda ya nivelada más arriba,
       *    asomaba una rueda "fantasma" por encima de la cerrada. */
      image: A+"closeup_acequia.webp",
      layers:[
        { id:"poniente_closed", src:A+"valvula_poniente_closed.webp", when:F("valvulaPonienteCerrada"),
          rect:pct(170,470,570,910), label:"llave de poniente cerrada" },
        { id:"levante_closed",  src:A+"valvula_levante_closed.webp",  when:F("valvulaLevanteCerrada"),
          rect:pct(655,470,1035,910), label:"llave de levante cerrada" },
        { id:"mediodia_closed", src:A+"valvula_mediodia_closed.webp", when:F("valvulaMediodiaCerrada"),
          rect:pct(1180,470,1560,910), label:"llave de mediodía cerrada" }
      ],
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
      },
      fuente(s){
        s.flags.anchorTileTaken=true; S.addItem("tileAnchor");
        S.say("La fuente de pared lleva mucho sin correr. En la base, medio suelto, un azulejo con un ancla pintada: el mismo estilo que los del taller de cerámica.");
      },
      puerta_taller_cerrada(s){
        if(S.useSelected("llave_taller")){
          s.flags.tallerAbierto=true; S.emit("unlock");
          S.say("La llave enterrada junto al tabaco encaja en la cerradura de la galería. La puerta del taller, cerrada desde hace generaciones, cede.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("llave_taller") ? "Una puerta de madera al fondo de la galería, con una cerradura pequeña. Selecciona la llave." : "Está cerrada con llave.");
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
          if(!s.flags.llaveTallerTaken){
            s.flags.llaveTallerTaken=true; S.addItem("llave_taller");
            S.say(s.flags.valvulasResueltas
              ? "Hojas anchas y pegajosas, un tallo que ningún jardinero sevillano plantaría por gusto: tabaco, traído de las Indias. Casi no necesita agua, y por suerte las tres llaves de la acequia ya están cerradas. Rebuscando entre sus raíces, medio hundida en la tierra, aparece una llave de hierro."
              : "Hojas anchas y pegajosas, un tallo que ningún jardinero sevillano plantaría por gusto: tabaco, traído de las Indias. Casi no necesita agua, y sin embargo alguien dejó las tres llaves de la acequia abiertas de par en par: la tierra, empapada, puede acabar ahogando las raíces — habría que cerrarlas. Rebuscando entre ellas, medio hundida en el barro, aparece una llave de hierro.");
            return;
          }
          S.say(s.flags.valvulasResueltas
            ? "El tabaco, con la tierra ya seca gracias a la acequia cerrada."
            : "El tabaco sigue con la tierra empapada: las llaves de la acequia siguen abiertas.");
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
