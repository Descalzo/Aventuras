/* EL ARCHIVO NEGADO — Cámara oculta (final)
 * Solo se entra desde negado_deposito, tras identificar el expediente correcto (ver
 * deposito.js). Dos pasos: insertar el expediente en la ranura, después autenticar con el
 * sello de la Casa — variación deliberada del cierre habitual de "reunir 2-3 piezas y
 * activar" (ver docs/JOURNEY_AUDIT.md §2): aquí se inserta y se autentica, no se monta un
 * mecanismo. Coordenadas en % de la escena (1672x941), sin calibrar todavía contra arte real.
 */
(function(){
const S = TD.state;
const F = k => s => !!s.flags[k];
const A = "assets/negado/camara/";
const pct = (x0,y0,x1,y1)=>({left:+(x0/16.72).toFixed(1), top:+(y0/9.41).toFixed(1), width:+((x1-x0)/16.72).toFixed(1), height:+((y1-y0)/9.41).toFixed(1)});

TD.registerScene({
  id:"negado_camara",
  phase:"negado",
  name:"Cámara oculta",
  base: A+"room_base.webp",
  enter: "La cámara oculta. Una ranura en la pared, del tamaño exacto de un expediente, y junto a ella un cojín de tinta para sellar.",
  backMessage: "Vuelves a mirar la cámara oculta.",

  overlays:[
    { id:"expediente_insertado", src:A+"expediente_insertado.webp", when:F("expedienteInsertado"),
      rect:pct(530,230,760,390), label:"expediente insertado" },
    { id:"compartimento_abierto", src:A+"compartimento_abierto.webp", when:F("faseCompletada"),
      rect:pct(1230,140,1650,620), label:"compartimento abierto" }
  ],

  hotspots:[
    { id:"puerta_deposito", label:"Volver al depósito", rect:pct(40,220,260,780), goto:"negado_deposito", message:"Vuelves al depósito." },
    { id:"ranura",   label:"Ranura del expediente", rect:pct(530,230,760,390), when:s=>!s.flags.expedienteInsertado },
    { id:"cojin_tinta", label:"Cojín de tinta y sello", rect:pct(880,380,1150,460), when:s=>s.flags.expedienteInsertado && !s.flags.faseCompletada },
    { id:"compartimento", label:"Compartimento", rect:pct(1230,140,1650,620), when:F("faseCompletada") }
  ],

  actions:{
    room:{
      ranura(s){
        if(S.useSelected("expediente_correcto")){
          s.flags.expedienteInsertado=true; S.emit("use");
          S.say("El expediente encaja en la ranura, justo del tamaño previsto.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("expediente_correcto") ? "Una ranura vacía, del tamaño exacto de un expediente. Selecciona el expediente correcto." : "Una ranura vacía en la pared, del tamaño exacto de un expediente.");
      },
      cojin_tinta(s){
        if(S.useSelected("sello_contratacion")){
          s.flags.faseCompletada=true; S.addItem("libro_secreto");
          S.emit("solve"); S.emit("door");
          S.say("Presionas el sello de la Casa sobre el expediente ya insertado. Encaja con un chasquido seco: el compartimento se abre. Dentro, el libro secreto de Ibáñez — décadas de correcciones que la Casa prefirió no ver, ordenadas, una por una, para que alguien, por fin, las encontrara.");
          return;
        }
        if(s.selected) S.emit("wrong");
        S.say(S.has("sello_contratacion") ? "El expediente ya está insertado. Selecciona el sello de la Casa y autentícalo." : "El expediente está insertado, pero sin sellar no vale como autenticación.");
      },
      compartimento(s){
        S.say("El compartimento sigue abierto, vacío ya: el libro secreto de Ibáñez está contigo.");
      }
    }
  }
});
})();
