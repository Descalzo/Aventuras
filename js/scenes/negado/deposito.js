/* EL ARCHIVO NEGADO — Depósito de expedientes retirados
 * Solo se entra con la llave del depósito (ficheros, ver entrada.js). Tres expedientes;
 * examinarlos sin la lupa da un mensaje genérico. Con la lupa, revela el texto completo —
 * el expediente correcto es el único que menciona el Bajío del Serrano (mapas) Y coincide
 * con el sello de la Casa (despacho) a la vez; los otros dos fallan en al menos un criterio,
 * sin penalización por examinarlos. Deducción cruzada de tres salas — NO un código numérico.
 * Sacar el expediente correcto solo DESCUBRE una grieta en la pared del fondo (la estantería,
 * aligerada, cede un poco) — no la abre. Abrirla de verdad exige seleccionar el áncora que
 * hay apoyada junto a las estanterías (siempre disponible desde que se entra aquí, sin
 * relación con los expedientes) y usarla sobre la pared: selección de inventario real, nunca
 * "tenerla en el inventario basta". Un tercer flag (pasoCamaraAbierto) separa "sé que hay
 * algo" de "el paso está abierto", así que no hay ninguna otra ruta que salte la selección.
 * Coordenadas en % de la escena (1672x941), sin calibrar todavía contra arte real.
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/negado/deposito/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

function needList(s){
  const need=[];
  if(!s.flags.discrepanciaHallada) need.push("saber qué lugar buscas (sala de mapas)");
  if(!s.flags.selloProbado) need.push("conocer el sello auténtico de la Casa (despacho)");
  if(!S.has("lupa")) need.push("la lupa (despacho)");
  return need;
}

TD.registerScene({
  id:"negado_deposito",
  phase:"negado",
  name:"Depósito de expedientes retirados",
  base: A+"room_base.webp",
  enter: "El depósito. Estanterías con expedientes retirados, cada uno cerrado con un cordel y un sello de lacre.",
  backMessage: "Vuelves a mirar el depósito.",

  overlays:[
    { id:"ancla_ausente",    src:A+"ancla_ausente.webp",    when:F("anclaTaken"),
      rect:pct(440,370,780,810), label:"hueco donde estaba el áncora" },
    { id:"camara_revelada", src:A+"camara_revelada.webp", when:F("pasoCamaraAbierto"),
      rect:pct(1330,140,1670,941), label:"paso a la cámara oculta revelado" }
  ],

  /* Hotspots de los tres expedientes y del áncora remedidos con rejilla de referencia
   * sobre room_base.webp: los tres "expediente_N" venían de coordenadas nunca
   * calibradas (rects genéricos que no seguían los tres fajos de papel con sello de
   * lacre real de la imagen) — expediente_3 en particular apenas rozaba su fajo real
   * (estaba desplazado a la derecha, sobre el barril) y expediente_1 invadía por
   * completo la zona donde ahora se apoya el áncora nueva. */
  hotspots:[
    { id:"puerta_entrada", label:"Volver a la entrada", rect:pct(40,220,260,780), goto:"negado_entrada", message:"Vuelves a la entrada." },
    { id:"ancla",         label:"Áncora apoyada en la estantería", rect:pct(530,400,720,720), when:s=>!s.flags.anclaTaken },
    { id:"expediente_1", label:"Expediente retirado",  rect:pct(370,370,520,500), when:s=>!s.flags.expedienteCorrectoTaken },
    { id:"expediente_2", label:"Expediente retirado",  rect:pct(750,380,900,500), when:s=>!s.flags.expedienteCorrectoTaken },
    { id:"expediente_3", label:"Expediente retirado",  rect:pct(1020,380,1180,500), when:s=>!s.flags.expedienteCorrectoTaken },
    { id:"puerta_camara_cerrada", label:"Pared del fondo", rect:pct(1330,140,1670,941), when:s=>!s.flags.pasoCamaraAbierto },
    { id:"puerta_camara", label:"Paso a la cámara oculta", rect:pct(1330,140,1670,941), goto:"negado_camara", when:F("pasoCamaraAbierto"), message:"Entras por el paso que ha dejado ver la estantería movida." }
  ],

  actions:{
    room:{
      ancla(s){
        s.flags.anclaTaken=true; S.addItem("ancla_deposito");
        S.say("Un áncora pequeña de hierro, apoyada junto a las estanterías desde quién sabe cuándo. Pesa lo suyo: serviría para hacer palanca.");
      },
      expediente_1(s){
        if(!S.has("lupa")){ S.say("Un expediente cerrado con cordel. Necesitarías la lupa para leer la letra pequeña del sello."); return; }
        S.say("Expediente sobre una avería en el muelle de Triana, 1678. No menciona ningún bajío, y el sello es un áncora bajo corona: no es el de la Casa.");
      },
      expediente_2(s){
        if(!S.has("lupa")){ S.say("Un expediente cerrado con cordel. Necesitarías la lupa para leer la letra pequeña del sello."); return; }
        S.say("Expediente sobre el Bajío de la Sal, no el del Serrano. El sello, nao entre dos torres, con corona: correcto en el sello, pero no en el lugar.");
      },
      expediente_3(s){
        if(!S.has("lupa")){ S.say("Un expediente cerrado con cordel. Necesitarías la lupa para leer la letra pequeña del sello."); return; }
        if(s.flags.expedienteCorrectoTaken){ S.say("El expediente correcto, ya en tus manos."); return; }
        const need = needList(s);
        if(need.length){ S.say("Con la lupa lees: menciona un bajío y lleva un sello, pero te falta "+need.join(" y ")+" para estar seguro de que es el correcto."); return; }
        s.flags.expedienteCorrectoTaken=true; S.addItem("expediente_correcto");
        S.emit("solve");
        S.say("Expediente sobre el Bajío del Serrano. El sello, nao entre dos torres, con corona: coincide exactamente con el de la Casa. Es el correcto. Al sacarlo, notas que la estantería, aligerada, cede un poco: detrás asoma una grieta en la piedra que no estaba antes.");
      },
      /* Pared del fondo: descubrirla (expedienteCorrectoTaken) NO la abre. Hace falta
       * seleccionar el áncora y pulsar aquí — tenerla en el inventario sin seleccionar
       * no hace nada, igual que un objeto incorrecto seleccionado. Única ruta que activa
       * pasoCamaraAbierto en toda la escena. */
      puerta_camara_cerrada(s){
        if(!s.flags.expedienteCorrectoTaken){ S.say("Una pared de piedra lisa, sin nada llamativo."); return; }
        if(S.useSelected("ancla_deposito")){
          s.flags.pasoCamaraAbierto=true; S.emit("unlock");
          S.say("Encajas el áncora en la grieta y haces palanca. La estantería cede del todo: detrás, un paso a oscuras.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("ancla_deposito") ? "Hay algo extraño aquí, pero no puedo abrirlo con las manos. Selecciona el áncora para hacer palanca." : "Hay algo extraño aquí, pero no puedo abrirlo con las manos.");
      }
    }
  }
});
})();
