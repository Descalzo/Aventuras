/* EL RUMBO DE LA CASA — Patio principal (nudo central de toda la casa)
 * Fusión deliberada de los dos patios de las fases originales: son, comprobado por imagen,
 * la misma composición (misma cámara, misma arquería, misma fuente octogonal, misma
 * escalera enrejada con candado en el mismo sitio). Se usa el patio de "El Derrotero
 * Perdido" como base física (aljibe+cabrestante, blasón, naranjos) y se le injerta el reloj
 * de sol y el zócalo de "La Casa de la Sirena" en la misma zona de pared donde éste ya tenía
 * una placa en blanco.
 *
 * REVISIÓN: el reloj de sol ahora se ve también en el plano general (antes solo existía al
 * entrar en su close-up) — room_base.webp regenerado con la esfera en la pared, en el mismo
 * sitio, perspectiva e iluminación que closeup_sundial.webp.
 *
 * REVISIÓN (petición directa del usuario, tercera vuelta): faltaba la trampilla CERRADA bajo
 * el reloj — antes esa zona era pared lisa sin ningún indicio hasta que `sundialSet` hacía
 * aparecer la hornacina abierta con la llave; ahora el propio `room_base.webp` (img-0103)
 * lleva ya tallada una trampillita cuadrada de piedra con anilla, siempre visible, cerrada
 * por defecto.
 *
 * REVISIÓN (petición directa del usuario, jugando en vivo: "la trampilla cuando se abre no
 * coincide con donde realmente está, se ve un recuadro negro"): los overlays de Sevilla
 * `niche_key.webp`/`niche_empty.webp` que se reutilizaban aquí (dados por "comprobados" en
 * la revisión anterior) en realidad NO encajaban contra la trampillita tallada en ESTE
 * room_base — mostraban un hueco rectangular oscuro de otro patio, de otro tamaño y algo más
 * abajo, dejando ver un filo de la propia piedra tallada por debajo. Igual que la soga:
 * assets propios nuevos, edición Codex de este mismo `room_base.webp` abriendo la
 * trampillita real (con llave y luego vacía) y recorte local (`tools/make_overlay.py`)
 * ajustado a su hueco de verdad — encajan ahora exactamente con el marco tallado. El hotspot
 * `niche` (más abajo) recalibrado igual, por la misma razón. La soga, al recogerse,
 * deja de verse (rope_gone.webp — REVISIÓN posterior, petición directa del usuario jugando
 * en vivo: el de Sevilla que se daba aquí por "comprobado" en realidad no encajaba contra
 * este room_base; ahora es un asset propio de Derrotero, ver más abajo). A nivel de sala se reutiliza
 * el propio overlay de Derrotero "puerta_biblioteca_abierta.webp" para la reja abierta, que ya
 * muestra la escalera de azulejos ascendiendo tras la verja.
 *
 * La escalera enrejada, una vez abierta con `stairsKey` (de la hornacina del reloj de sol),
 * lleva ÚNICAMENTE a las campanas de la azotea unificada — un solo hotspot sobre TODA la
 * reja, sin repartirla en bandas invisibles (ese reparto, con una supuesta "puerta lateral
 * de la librería" en la banda inferior, fue el propio defecto que el usuario señaló jugando
 * en vivo: la imagen solo dibuja una reja con un candado, nada más).
 *
 * REVISIÓN (petición directa del usuario, segunda vuelta): la librería ya NO se alcanza por
 * esta escalera en absoluto — `llave_biblioteca` se ha reasignado a la compuerta del techo
 * del taller de instrumentos (ver piloto/taller.js) y la librería pasa a tener una puerta
 * real propia, sin cerradura, desde el despacho (ver piloto/despacho.js). El flag
 * `bibliotecaAbierta` desaparece: ya no hace falta abrir nada para entrar.
 *
 * REVISIÓN: el taller de instrumentos ya no se alcanza desde aquí (compartía puerta visual
 * con el salón, banda inferior/superior de un mismo hueco) — ahora se entra por una puerta
 * real del jardín (ver piloto/jardin.js); la puerta del salón queda como acceso único de la
 * derecha, sin repartir bandas con nadie.
 * Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A  = "assets/derrotero/patio/";
const AS = "assets/sevilla/patio/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

/* --- Reloj de sol (idéntico a js/scenes/sevilla/patio.js, mismas imágenes) --- */
const NUMERALS = ["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"];
const SHADOW_POS = 4, BASE = 3;
const RING_SYMBOLS = NUMERALS.map((_,r)=>NUMERALS[((SHADOW_POS - BASE - r) % 12 + 12) % 12]);
const SUNDIAL_HOUR = "V";
const DIAL_CENTER = {x:836, y:398, r:300};
function ring(s){
  const r = (s.dials.sundial || [0])[0] || 0;
  let out = '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet"><g transform="rotate('+((r+BASE)*30)+' 100 100)">';
  NUMERALS.forEach((n,i)=>{
    const a = i*30 + 15 - 90, rad = a*Math.PI/180, x = 100+80*Math.cos(rad), y = 100+80*Math.sin(rad);
    out += '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" transform="rotate('+(i*30+15)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-weight="700" font-size="12" fill="#4a3a26">'+n+'</text>';
  });
  return out+'</g></svg>';
}

TD.registerScene({
  id:"piloto_patio",
  phase:"piloto",
  name:"Patio principal",
  base: A+"room_base.webp",
  enter: "El patio. Columnas de mármol, un aljibe seco en el centro y azulejos descoloridos por generaciones de sol.",
  backMessage: "Vuelves a mirar el patio.",

  overlays:[
    { id:"aljibe_vacio", src:A+"aljibe_vacio.webp", when:F("pasadizoAbierto"),
      rect:pct(650,520,1020,780), label:"aljibe vaciado" },
    { id:"losa_movida",  src:A+"losa_movida.webp",  when:F("frag3Taken"),
      rect:pct(700,700,880,800), label:"losa levantada" },
    { id:"haz_luz",      src:A+"haz_luz.webp",      when:s=>s.flags.libroCorrectoRetirado && !s.flags.frag3Taken,
      rect:pct(680,120,920,700), label:"haz de luz desde la galería" },
    /* Reutiliza el propio asset de Derrotero (no el de Sevilla): ya muestra la escalera de
     * azulejos ascendiendo tras la reja entreabierta, comprobado por composición directa. */
    { id:"reja_abierta", src:A+"puerta_biblioteca_abierta.webp", when:F("stairsOpen"),
      rect:pct(1070,100,1340,700), label:"reja de la escalera abierta" },
    /* Soga recogida: sin este overlay la cuerda seguía viéndose en el suelo pese a estar ya
     * en el inventario.
     * REVISIÓN (petición directa del usuario, jugando en vivo): el overlay de Sevilla que se
     * reutilizaba aquí (misma pila de cuerda, mismo rincón) en realidad NO encajaba contra
     * ESTE room_base (el de Derrotero) — el enladrillado tiene otro ángulo/iluminación en la
     * imagen original de Sevilla, así que se veía un parche de suelo claramente distinto
     * (\"algo raro en el suelo\") y, al ser el recorte tan pegado al macetero, también le
     * comía una esquina. Asset propio nuevo: edición Codex de este mismo room_base
     * (img-0118) quitando solo la cuerda, recortado localmente con make_overlay.py — mismo
     * enladrillado, misma luz, el macetero intacto. */
    { id:"rope_gone", src:A+"rope_gone.webp", when:F("ropeTaken"),
      rect:pct(80,748,325,892), label:"sin soga" },
    /* Hornacina bajo el reloj de sol: con llave / ya vacía. Asset propio de Derrotero (ver
     * cabecera) — rect recalibrado por rejilla contra el hueco tallado real (405,345)-(550,440). */
    { id:"niche_key",   src:A+"niche_key.webp",   when:s=>s.flags.sundialSet && !s.flags.stairsKeyTaken,
      rect:pct(405,345,550,440), label:"hornacina abierta con llave" },
    { id:"niche_empty", src:A+"niche_empty.webp", when:F("stairsKeyTaken"),
      rect:pct(405,345,550,440), label:"hornacina vacía" }
  ],

  hotspots:[
    { id:"puerta_jardin",  label:"Jardín",   rect:pct(60,260,300,420),   goto:"piloto_jardin" },
    { id:"puerta_zaguan",  label:"Zaguán",   rect:pct(60,450,260,760),   goto:"piloto_zaguan" },
    /* Puerta única de la derecha, ya no repartida en bandas con el taller (ver cabecera). */
    { id:"puerta_salon",   label:"Salón",    rect:pct(1380,260,1620,760), goto:"piloto_salon" },

    { id:"escalera_cerrada", label:"Reja de la escalera", rect:pct(1110,165,1290,650), when:s=>!s.flags.stairsOpen },
    /* Una sola reja real, un solo hotspot sobre TODA su altura, un único destino (las
     * campanas) — sin repartir la imagen en bandas ni ramas por selección. */
    { id:"escalera_subir", label:"Subir a las campanas", rect:pct(1110,165,1290,650), when:F("stairsOpen"),
      goto:"piloto_azotea_campanas", message:"Subes por la escalera de azulejos, más allá de donde llega la luz del patio." },

    { id:"cabrestante",    label:"Cabrestante del aljibe", rect:pct(650,520,1020,780), when:s=>!s.flags.pasadizoAbierto },
    { id:"losa",           label:"Losa suelta del aljibe", rect:pct(700,700,880,800), when:s=>s.flags.pasadizoAbierto && !s.flags.frag3Taken },

    /* Soga de esparto (La Casa de la Sirena): la misma pila de cuerda junto a una maceta,
     * ya visible en ambos patios en el mismo rincón — se reutiliza tal cual. */
    { id:"rope", label:"Soga de esparto", rect:pct(105,775,245,865), when:s=>!s.flags.ropeTaken },

    /* Reloj de sol: injertado en la misma zona donde Derrotero tenía solo una placa en
     * blanco. REVISIÓN (petición directa del usuario): el disco quedaba demasiado abajo,
     * casi tocando la zona de la hornacina — regenerado más arriba en la misma pared
     * (img-0100) y remedido por rejilla: la placa cuadrada ocupa ahora x≈400-655
     * (disco+ruedecilla), y≈195-330; la hornacina queda a más de 25px de distancia, sin
     * tocarse. La lectura de la inscripción, más abajo en el hotspot, conserva el texto
     * original de la placa (1697, señuelo) además de la fecha del reloj (1620). */
    { id:"sundial", label:"Reloj de sol", rect:pct(395,170,655,350), closeup:"sundial" },
    /* Trampillita cuadrada con anilla, tallada en el propio room_base (img-0103). REVISIÓN
     * (petición directa del usuario): remedida de nuevo por rejilla contra el hueco tallado
     * real — el rect anterior (420,335,530,425) quedaba desplazado hacia arriba/izquierda
     * respecto al marco de verdad; ahora x≈405-550, y≈345-440, el mismo hueco que usan los
     * overlays `niche_key`/`niche_empty` de arriba. */
    { id:"niche",   label:"Trampilla bajo el reloj", rect:pct(405,345,550,440) },

    /* Los azulejos son únicamente una pista visual del código de la puerta. */
  ],

  closeups:{
    sundial:{
      label:"Reloj de sol",
      image: s => s.flags.gnomonPlaced ? AS+"closeup_sundial_gnomon.webp" : AS+"closeup_sundial.webp",
      html:[
        { rect:pct(DIAL_CENTER.x-DIAL_CENTER.r, DIAL_CENTER.y-DIAL_CENTER.r, DIAL_CENTER.x+DIAL_CENTER.r, DIAL_CENTER.y+DIAL_CENTER.r), cls:"ring", content:ring }
      ],
      hotspots:[
        { id:"hole",        label:"Agujero del estilo",  rect:pct(790,352,882,446), when:s=>!s.flags.gnomonPlaced },
        { id:"inscription", label:"Inscripción",         rect:pct(566,710,1101,822) }
      ],
      dials:{
        id:"sundial", code:SUNDIAL_HOUR, flag:"sundialSet",
        when:s=>s.flags.gnomonPlaced && !s.flags.sundialSet,
        symbols:[RING_SYMBOLS],
        help:"La esfera gira: clic avanza, clic derecho retrocede. Se muestra el numeral bajo la sombra.",
        positions:[ pct(1214,347,1314,447) ]
      }
    },
    /* Los azulejos del patio son únicamente una pista visual. No tienen closeup ni hito. */
  },

  actions:{
    room:{
      cabrestante(s){
        if(S.useSelected("manivela_pozo")){
          s.flags.pasadizoAbierto=true; S.emit("use");
          S.say("Encajas la manivela y giras. La cadena chirría y el agua del aljibe desciende poco a poco hasta desaparecer bajo el suelo, dejando ver el fondo agrietado.");
          return;
        }
        if(s.flags.pasadizoAbierto){ S.say("El aljibe ya está vacío."); return; }
        if(s.selected) S.emit("wrong");
        S.say(S.has("manivela_pozo") ? "El cabrestante tiene el eje pelado: encaja la manivela." : "Un cabrestante de hierro sobre el aljibe, sin manivela. Falta la pieza que lo hace girar.");
      },
      losa(s){
        if(!s.flags.libroCorrectoRetirado){
          S.say("La losa del fondo está suelta, pero apenas se ve nada ahí abajo: falta luz, o quizá el ángulo correcto desde arriba.");
          return;
        }
        s.flags.frag3Taken=true; S.addItem("fragmento_derrotero_3");
        S.say("Con el hueco de la librería dejando pasar la luz de la tarde justo hasta el fondo del aljibe, se ve algo bajo la losa: otra hoja del derrotero, protegida en un tubo de latón.");
      },
      rope(s){
        s.flags.ropeTaken=true; S.addItem("rope");
        S.say("Una soga de esparto, gruesa y áspera. La enrollas y te la llevas.");
      },
      escalera_cerrada(s){
        if(S.useSelected("stairsKey")){
          s.flags.stairsOpen=true; S.emit("unlock");
          S.say("La llave gira con esfuerzo en la cerradura de la reja. Se abre con un chirrido: detrás, una escalera de azulejos sube hacia la oscuridad.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("stairsKey") ? "La reja de hierro que guarda la escalera tiene una cerradura pequeña. Selecciona la llave." : "Una reja de hierro cierra el paso a una escalera que sube. Tiene una cerradura pequeña, distinta de las demás.");
      },
      niche(s){
        if(!s.flags.sundialSet){ S.say("Una trampillita de piedra bajo el reloj de sol, con una anilla de hierro. No cede: algo la traba por dentro."); return; }
        if(!s.flags.stairsKeyTaken){
          s.flags.stairsKeyTaken=true; S.addItem("stairsKey");
          S.say("En la hornacina hay una llave de hierro forjado. La coges.");
          return;
        }
        S.say("La hornacina está vacía.");
      }
    },
    closeups:{
      sundial:{
        hole(s){
          if(S.useSelected("gnomon")){
            s.flags.gnomonPlaced=true; S.emit("use");
            S.say("El estilo de bronce encaja en el agujero. La luz de poniente proyecta una sombra larga sobre la esfera.");
          }else{
            if(s.selected) S.emit("wrong");
            S.say("En el centro de la esfera hay un agujero: falta el estilo que proyecte la sombra.");
          }
        },
        inscription(s){
          s.flags.sundialRead=true; s.flags.placaLeida=true; S.emit("paper");
          S.say("Bajo la esfera, tallado en el mármol: MDCXX. En una placa más pequeña, remachada al pedestal y casi borrada: «Aquí se lloró, en 1697, la pérdida de la Nuestra Señora del Rocío. D. Fadrique de Valderas, piloto mayor».");
        }
      },
    },
    dials:{
      sundial(s){
        S.emit("unlock");
        S.say("La sombra cae sobre las V. Algo cede dentro del muro: la anilla de la trampilla bajo el reloj gira sola, ya abierta.");
      }
    }
  }
});
})();
