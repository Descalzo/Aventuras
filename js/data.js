/* TRICKY DOORS — registros globales
 * Escenarios (TD.registerScene) y fases (TD.registerPhase). Una fase es una aventura
 * completa con sus propios objetos, notas, pistas, progreso, final, escena inicial y
 * clave de guardado. TD.data es el conjunto de datos de la fase ACTIVA: el motor lo
 * captura por referencia, así que TD.usePhase() rellena siempre el mismo objeto.
 * Las condiciones `when(s)` reciben el gameState (s.flags, s.items, s.scene...).
 */
window.TD = window.TD || {};

/* Registro de escenarios. Un escenario es un objeto declarativo:
 *  { id, phase, name, base, enter, overlays:[], hotspots:[], closeups:{}, actions:{room,closeups,dials} } */
TD.DEFAULT_PHASE = "clockmaker";
TD.scenes = {};
TD.registerScene = function(def){
  if(!def || !def.id) throw new Error("registerScene: falta id");
  def.phase = def.phase || TD.DEFAULT_PHASE;   // escenarios sin fase explícita: fase por defecto
  def.overlays = def.overlays || [];
  def.hotspots = def.hotspots || [];
  def.closeups = def.closeups || {};
  def.actions  = def.actions  || {};
  Object.keys(def.closeups).forEach(id=>{
    const cu = def.closeups[id];
    cu.hotspots = cu.hotspots || []; cu.layers = cu.layers || []; cu.html = cu.html || [];
  });
  TD.scenes[def.id] = def;
  return def;
};

/* Registro de fases: { id, name, startScene, saveKey, data:{ITEMS, INTRO_TEXT, NOTES, NOTES_EMPTY,
 * PROGRESS, HINTS, HINT_FALLBACK, END, ...} } */
TD.phases = {};
TD.registerPhase = function(def){
  if(!def || !def.id || !def.startScene || !def.data) throw new Error("registerPhase: definición incompleta");
  def.saveKey = def.saveKey || ("trickyDoors."+def.id+".save");
  TD.phases[def.id] = def;
  return def;
};

TD.data = {};          // datos de la fase activa (se rellena en usePhase)
TD.phase = null;       // definición de la fase activa

/* Activa una fase: copia sus datos en TD.data (mismo objeto, capturado por el motor). */
TD.usePhase = function(id){
  const def = TD.phases[id] || TD.phases[TD.DEFAULT_PHASE];
  if(!def) throw new Error("usePhase: no hay fases registradas");
  Object.keys(TD.data).forEach(k=>{ delete TD.data[k]; });
  Object.assign(TD.data, def.data);
  TD.data.PHASE = def.id;
  TD.phase = def;
  return def;
};

/* Escenarios de la fase activa. */
TD.phaseScenes = function(){
  const out = {};
  Object.keys(TD.scenes).forEach(id=>{ if(!TD.phase || TD.scenes[id].phase===TD.phase.id) out[id]=TD.scenes[id]; });
  return out;
};
