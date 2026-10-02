/* TRICKY DOORS — arranque
 * Conecta interacciones -> estado -> render/sonido, y la persistencia.
 */
(function(){
"use strict";
/* Fase activa: ?phase=<id> en la URL, si no la última usada, si no la fase por defecto. */
const PHASE_KEY = "trickyDoors.phase";
const wanted = new URLSearchParams(location.search).get("phase");
let remembered = null; try{ remembered = localStorage.getItem(PHASE_KEY); }catch(e){}
const phase = TD.usePhase(wanted || remembered || "piloto");
try{ localStorage.setItem(PHASE_KEY, phase.id); }catch(e){}
document.title = "Tricky Doors — "+phase.name;

const S = TD.state, A = TD.actions, R = TD.render, AU = TD.audio;

const SOUND_FOR = { pickup:"pickup", use:"use", dial:"dial", solve:"solve", unlock:"unlock",
                    wrong:"wrong", view:"open", travel:"travel", door:"door", select:"select", paper:"paper", bell:"bell",
                    combine:"solve" };


async function enterGameMode() {
  // El manifest ya establece fullscreen y landscape en la app instalada.
  if (matchMedia("(display-mode: fullscreen)").matches ||
      matchMedia("(display-mode: standalone)").matches) return;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (e) {
    console.log("Fullscreen no disponible:", e);
  }

  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch (e) {
    console.log("Bloqueo de orientación no disponible:", e);
  }
}  

document.addEventListener("pointerdown", function firstTouch() {
  enterGameMode();

  document.removeEventListener("pointerdown", firstTouch);
}, { once: true });
  
  
/* Crónica (metaprogresión global, ver js/engine/chronicle.js y DECISIONS.md D017):
 * al terminar la fase se marca completada; cada entrada declarada en TD.data.CHRONICLE
 * se aprende en cuanto su flag es cierto. Puramente aditivo: una fase sin CHRONICLE no
 * se ve afectada, y ninguna fase lee la crónica todavía para bloquear nada. */
function syncChronicle(){
  const s = S.get();
  (TD.data.CHRONICLE||[]).forEach(entry=>{
    if(s.flags[entry.flag] && !TD.chronicle.know(entry.key)) TD.chronicle.learn(entry.key, entry.label);
  });
  if(TD.data.END && TD.data.END.when(s)) TD.chronicle.markCompleted(phase.id);
}

/* Tras cada acción: sincronizar el DOM, reproducir efectos y guardar.
 * Si la acción cambia de vista o escenario, el DOM se actualiza bajo el telón
 * (a negro -> cambio -> descubrir), nunca antes de que oscurezca. */
function refresh(){
  const events = S.drain();
  const sync = ()=>R.update(S.get());
  if(R.needsCut(events)) R.transition(sync); else sync();
  R.effects(events);
  events.forEach(ev=>{ const snd = ev.sound || SOUND_FOR[ev.type]; if(snd) AU.play(snd); });
  S.save();
  syncChronicle();
}
function run(fn){ return function(){ fn.apply(null, arguments); refresh(); }; }

/* Expuesto para escenas que necesitan aplazar un cambio de vista/escena (p.ej. dejar ver
 * unos segundos un mecanismo ya resuelto antes de cortar a la sala) sin duplicar el propio
 * ciclo de refresco: la escena muta el estado directamente (S.get()...) y llama a
 * TD.refresh() cuando quiere que se pinte, con el mismo telón que cualquier otra acción. */
TD.refresh = refresh;

R.mount({
  onRoomHotspot:    run(A.roomHotspot),
  onCloseupHotspot: run(A.closeupHotspot),
  onDial:           run(A.turnDial),
  onBack:           run(A.back),
  onItem:           run(A.selectItem),
  onGroupItem:      run(A.selectGroup),
  onAssetMissing:   ()=>R.update(S.get())   // una imagen ha fallado: re-evaluar capas/placeholders
});

document.querySelectorAll('[data-action="hint"]').forEach(b=>b.addEventListener("click",run(A.hint)));
document.querySelectorAll('[data-action="reset"]').forEach(b=>b.addEventListener("click",run(A.reset)));

/* Panel de notas: estado de interfaz, no de juego (no se guarda). */
const notesPanel = document.querySelector('[data-slot="notes-panel"]');
const notesButtons = document.querySelectorAll('[data-action="notes"]');
function toggleNotes(open){
  if(!notesPanel) return;
  const show = open===undefined ? notesPanel.hidden : open;
  notesPanel.hidden = !show;
  notesButtons.forEach(b=>b.setAttribute("aria-expanded", String(show)));
  if(show) AU.play("paper");
}
notesButtons.forEach(b=>b.addEventListener("click",()=>{ toggleNotes(); togglePhases(false); }));

/* Panel de aventuras: lista las fases registradas y permite cambiar (recarga la página,
 * cada fase guarda bajo su propia clave, ver TD.registerPhase). Estado de interfaz, no de juego. */
const TAGLINE = {
  clockmaker: "Escape room clásico en el estudio de un relojero desaparecido.",
  sevilla:    "Casa-palacio sevillana: abre la cancela antes de que caiga la noche.",
  derrotero:  "Palacio de Valderas: reconstruye el derrotero y el astrolabio de un piloto.",
  faro:       "Un faro abandonado en la costa: termina la sirena que dos torreros no acabaron.",
  negado:     "El archivo de una institución que prefirió callar: encuentra el expediente correcto.",
  piloto: "Una casa sevillana llena de secretos: reconstruye su rumbo y descubre qué ocurrió."
};
const phasesPanel = document.querySelector('[data-slot="phases-panel"]');
const phasesList = document.querySelector('[data-slot="phases-list"]');
const phasesButtons = document.querySelectorAll('[data-action="phases"]');
function renderPhasesList(){
  if(!phasesList) return;
  phasesList.innerHTML = "";
  Object.keys(TD.phases).sort().forEach(id=>{
    const def = TD.phases[id];
    const isCurrent = id === phase.id;
    const card = document.createElement(isCurrent ? "div" : "button");
    if(!isCurrent) card.type = "button";
    card.className = "phase-card" + (isCurrent ? " current" : "");
    card.innerHTML = '<div class="name">'+def.name+'</div>'
      +'<div class="tagline">'+(TAGLINE[id]||"")+'</div>'
      +(isCurrent ? '<span class="tag">Jugando ahora</span>' : "");
    if(!isCurrent) card.addEventListener("click",()=>{
      const url = new URL(location.href);
      url.searchParams.set("phase", id);
      location.href = url.toString();
    });
    phasesList.appendChild(card);
  });
}
function togglePhases(open){
  if(!phasesPanel) return;
  const show = open===undefined ? phasesPanel.hidden : open;
  phasesPanel.hidden = !show;
  phasesButtons.forEach(b=>b.setAttribute("aria-expanded", String(show)));
  if(show){ renderPhasesList(); AU.play("paper"); }
}
phasesButtons.forEach(b=>b.addEventListener("click",()=>{ togglePhases(); toggleNotes(false); }));

/* Sonido: preferencia de interfaz persistida aparte del guardado. */
const muteButtons = document.querySelectorAll('[data-action="mute"]');
function renderMute(){
  muteButtons.forEach(b=>{
    b.setAttribute("aria-pressed", String(AU.isMuted()));
    b.title = AU.isMuted() ? "Activar sonido" : "Silenciar";
    const ico=b.querySelector(".ico"); if(ico) ico.textContent = AU.isMuted() ? "🔇" : "🔊";
  });
}
muteButtons.forEach(b=>b.addEventListener("click",()=>{ AU.toggle(); renderMute(); if(!AU.isMuted()) AU.play("click"); }));
renderMute();

const DEBUG = /[?&]debug\b/.test(location.search);
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    if(notesPanel && !notesPanel.hidden) toggleNotes(false);
    else if(phasesPanel && !phasesPanel.hidden) togglePhases(false);
    else run(A.back)();
  }
  if(DEBUG && (e.key==="h" || e.key==="H")) R.toggleDebug();
});

S.load();
refresh();

// expuesto para depuración y pruebas
window.trickyDoors = {
  get state(){ return S.get(); },
  refresh, reset: run(A.reset), toggleNotes, travel: run(A.travel), phase,
  actions: A, render: R, data: TD.data, audio: AU, scenes: TD.scenes
};
})();
