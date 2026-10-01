/* TRICKY DOORS — crónica (capa de metaprogresión global)
 * Persistencia separada de cada fase (clave propia, `trickyDoors.chronicle`), NO del
 * `saveKey` de ninguna fase. Guarda solo dos cosas: qué fases se han completado, y qué
 * "conocimientos" (conceptos, nombres, fechas, temas) se han descubierto, por su clave,
 * independientemente de en qué fase se descubrieron.
 *
 * Diseño (ver D017 en DECISIONS.md, sustituye a D015):
 * - Ninguna fase existente LEE la crónica todavía para bloquear u ofrecer nada: solo
 *   escriben en ella. Esto garantiza que las cuatro fases actuales siguen siendo
 *   jugables exactamente igual que antes y no hay riesgo de softlock por esta capa.
 * - Se comparte CONOCIMIENTO (claves booleanas con una etiqueta legible) y CONSECUENCIAS
 *   (fases completadas), nunca objetos de inventario ni estado de sala.
 * - Una fase declara qué aprende y cuándo mediante `TD.data.CHRONICLE` (opcional):
 *     CHRONICLE = [ { flag:"diarioLeido", key:"conocimiento.encubrimiento_naval",
 *                     label:"..." } ]
 *   `js/engine/main.js` revisa esa lista en cada `refresh()`: si `state.flags[flag]` es
 *   cierto y la crónica no conoce `key` todavía, la aprende. Una fase sin `CHRONICLE`
 *   declarado no se ve afectada en absoluto.
 * - Cuando el `END` de una fase se cumple, `main.js` marca esa fase como completada en la
 *   crónica automáticamente (sin que la fase tenga que declarar nada).
 * - `entries()` da una lista humana (clave + etiqueta + cuándo) pensada para una futura
 *   pantalla de "Bitácora" que permita consultar lo aprendido sin tener que rejugar una
 *   fase antigua — todavía no existe esa pantalla; se añadirá cuando una fase futura
 *   necesite de verdad exigir conocimiento previo (ver DECISIONS.md D017).
 */
window.TD = window.TD || {};

(function(){
  const KEY = "trickyDoors.chronicle";
  const VERSION = 1;

  function initial(){ return { version:VERSION, phasesCompleted:{}, knowledge:{} }; }
  let current = initial();

  function sanitize(raw){
    const base = initial();
    if(!raw || typeof raw!=="object") return base;
    if(raw.phasesCompleted && typeof raw.phasesCompleted==="object"){
      Object.keys(raw.phasesCompleted).forEach(id=>{ if(raw.phasesCompleted[id]) base.phasesCompleted[id]=true; });
    }
    if(raw.knowledge && typeof raw.knowledge==="object"){
      Object.keys(raw.knowledge).forEach(k=>{
        const v = raw.knowledge[k];
        if(v && typeof v==="object") base.knowledge[k] = { learnedAt: v.learnedAt||Date.now(), label: String(v.label||k) };
      });
    }
    return base;
  }

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      current = raw ? sanitize(JSON.parse(raw)) : initial();
    }catch(e){ current = initial(); }
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(current)); }catch(e){} }

  function completed(phaseId){ return !!current.phasesCompleted[phaseId]; }
  function markCompleted(phaseId){
    if(!phaseId || current.phasesCompleted[phaseId]) return;
    current.phasesCompleted[phaseId] = true;
    save();
  }

  function know(key){ return !!current.knowledge[key]; }
  function learn(key, label){
    if(!key || current.knowledge[key]) return;
    current.knowledge[key] = { learnedAt: Date.now(), label: String(label||key) };
    save();
  }

  function entries(){
    return Object.keys(current.knowledge).sort().map(k=>({
      key:k, label:current.knowledge[k].label, learnedAt:current.knowledge[k].learnedAt
    }));
  }
  function completedPhases(){ return Object.keys(current.phasesCompleted).filter(id=>current.phasesCompleted[id]); }

  load();

  TD.chronicle = { load, save, completed, markCompleted, know, learn, entries, completedPhases, get:()=>current };
})();
