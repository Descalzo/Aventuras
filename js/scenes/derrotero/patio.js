/* EL DERROTERO PERDIDO — Patio principal (nudo central)
 * Comunica zaguán, salón, jardín y taller. El aljibe central, vaciado con la manivela del
 * cabrestante, deja ver una losa suelta — pero lo que hay debajo solo aparece si, además,
 * se ha retirado el libro correcto de la librería (el haz de luz que entra por su hueco
 * señala la losa exacta). Coordenadas en % de la escena (1672x941).
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/derrotero/patio/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"derrotero_patio",
  phase:"derrotero",
  name:"Patio principal",
  base: A+"room_base.webp",
  enter: "El patio. Columnas de mármol, un aljibe seco en el centro y azulejos descoloridos por dos siglos de sol.",
  backMessage: "Vuelves a mirar el patio.",

  overlays:[
    { id:"aljibe_vacio", src:A+"aljibe_vacio.webp", when:F("pasadizoAbierto"),
      rect:pct(650,520,1020,780), label:"aljibe vaciado" },
    { id:"losa_movida",  src:A+"losa_movida.webp",  when:F("frag3Taken"),
      rect:pct(700,700,880,800), label:"losa levantada" },
    { id:"haz_luz",      src:A+"haz_luz.webp",      when:s=>s.flags.libroCorrectoRetirado && !s.flags.frag3Taken,
      rect:pct(680,120,920,700), label:"haz de luz desde la galería" },
    { id:"puerta_biblioteca_abierta", src:A+"puerta_biblioteca_abierta.webp", when:F("bibliotecaAbierta"),
      rect:pct(1095,130,1305,580), label:"cancela de la librería abierta" }
  ],

  hotspots:[
    /* La única puerta visible a cada lado (izquierda: zaguán/jardín; derecha: salón/taller)
     * tenía dos hotspots solapados casi por completo (uno contenía por completo al otro) —
     * se reparte en banda superior/inferior de la misma puerta para que cada uno sea
     * clicable sin robarle el clic al otro (ver auditoría de coherencia visual). */
    { id:"puerta_jardin",  label:"Jardín",   rect:pct(60,260,300,420),   goto:"derrotero_jardin" },
    { id:"puerta_zaguan",  label:"Zaguán",   rect:pct(60,450,260,760),   goto:"derrotero_zaguan" },
    { id:"puerta_taller",  label:"Taller",   rect:pct(1380,260,1620,420), goto:"derrotero_taller" },
    { id:"puerta_salon",   label:"Salón",    rect:pct(1420,450,1620,760), goto:"derrotero_salon" },
    { id:"puerta_biblioteca_cerrada", label:"Puerta de la librería", rect:pct(1120,180,1320,400), when:s=>!s.flags.bibliotecaAbierta },
    { id:"puerta_biblioteca",         label:"Librería",              rect:pct(1120,180,1320,400), goto:"derrotero_biblioteca", when:F("bibliotecaAbierta") },
    { id:"cabrestante",    label:"Cabrestante del aljibe", rect:pct(650,520,1020,780), when:s=>!s.flags.pasadizoAbierto },
    { id:"losa",           label:"Losa suelta del aljibe", rect:pct(700,700,880,800), when:s=>s.flags.pasadizoAbierto && !s.flags.frag3Taken },
    { id:"placa",          label:"Placa conmemorativa",    rect:pct(420,340,560,500) }
  ],

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
      placa(s){
        s.flags.placaLeida=true; S.emit("paper");
        S.say("«Aquí se lloró, en 1697, la pérdida de la Nuestra Señora del Rocío». Debajo, en letra más pequeña y casi borrada: «D. Fadrique de Valderas, piloto mayor».");
      },
      puerta_biblioteca_cerrada(s){
        if(S.useSelected("llave_biblioteca")){
          s.flags.bibliotecaAbierta=true; S.emit("unlock");
          S.say("La llave gira con un chirrido. La puerta de la librería se abre.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("llave_biblioteca") ? "La cerradura de la librería es pequeña. Selecciona la llave." : "Una puerta cerrada con una cerradura pequeña, distinta de las demás.");
      }
    }
  }
});
})();
