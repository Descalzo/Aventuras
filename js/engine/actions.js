/* TRICKY DOORS — interacciones genéricas
 * Traduce clics en hotspots/ruedas a acciones del escenario actual.
 * Cada escenario aporta sus acciones específicas en TD.scenes[id].actions.
 * Nada de DOM aquí; el arranque (main.js) llama al render después.
 */
window.TD = window.TD || {};

TD.actions = (function(){
const S = TD.state;
const D = TD.data;

const scene = () => TD.scenes[S.get().scene];
const closeupDef = (s) => { const sc = TD.scenes[s.scene]; return sc.closeups && sc.closeups[s.view]; };

/* Ejecuta fn con el contexto del hotspot (para que los eventos sepan dónde ocurrieron). */
function withContext(rect, fn){
  S.setContext({rect});
  try{ fn(); } finally { S.setContext(null); }
}

/* Comportamiento genérico de un hotspot según su definición:
 *  goto    -> viajar a otro escenario
 *  closeup -> abrir un primer plano
 *  action  -> nombre de acción específica (por defecto, el id del hotspot) */
function runHotspot(def, actions, s){
  const name = def.action || def.id;
  const fn = actions && actions[name];
  if(fn){ fn(s); return; }
  if(def.closeup){
    s.view = def.closeup;
    if(def.message) S.say(def.message);
    S.emit("view",{view:def.closeup});
    return;
  }
  if(def.goto){
    S.go(def.goto);
    S.say(def.message || (TD.scenes[def.goto].enter || ""));
  }
}

function roomHotspot(id){
  const s = S.get();
  const sc = scene();
  const def = sc.hotspots.find(h=>h.id===id && (!h.when || h.when(s)));
  if(!def) return;
  if(sc.locked && sc.locked(s)){ S.say(sc.lockedMessage || "Ya no hay nada más que hacer aquí."); return; }
  withContext(def.rect, ()=>runHotspot(def, sc.actions && sc.actions.room, s));
}

function closeupHotspot(view, id){
  const s = S.get();
  if(s.view!==view) return;
  const sc = scene();
  const cu = sc.closeups[view];
  const def = cu.hotspots.find(h=>h.id===id && (!h.when || h.when(s)));
  if(!def) return;
  const acts = sc.actions && sc.actions.closeups && sc.actions.closeups[view];
  withContext(def.rect, ()=>runHotspot(def, acts, s));
}

/* Símbolos de la rueda i: `symbols` puede ser una lista común o una lista por rueda. */
const DIGITS = ["0","1","2","3","4","5","6","7","8","9"];
function symbolsFor(dl, i){
  if(!dl.symbols) return DIGITS;
  return Array.isArray(dl.symbols[0]) ? dl.symbols[i] : dl.symbols;
}

/* Ruedas: state.dials[dial.id][i] avanza `delta` posiciones sobre `symbols`.
 * Si el conjunto coincide con `code`, se marca dial.flag y se llama onSolve. */
function turnDial(i, delta){
  const s = S.get();
  const cu = closeupDef(s);
  if(!cu || !cu.dials) return;
  const dl = cu.dials;
  if(dl.when && !dl.when(s)) return;
  if(dl.locked && dl.locked(s)) return;
  const values = S.dial(dl.id, dl.positions.length);
  const symbols = symbolsFor(dl, i);
  values[i] = ((values[i]+delta) % symbols.length + symbols.length) % symbols.length;
  S.emit("dial",{at:dl.positions[i]});
  const word = values.map((v,k)=>symbolsFor(dl,k)[v]).join("");
  if(word===dl.code){
    if(dl.flag) S.flag(dl.flag, true);
    S.emit("solve",{at:dl.positions[i]});
    const acts = scene().actions;
    const onSolve = acts && acts.dials && acts.dials[dl.id];
    if(onSolve) onSolve(s);
  }
}

function back(){
  const s = S.get();
  if(s.view==="room") return;
  s.view = "room";
  S.emit("view",{view:"room"});
  const sc = scene();
  S.say(sc.backMessage || "Vuelves a mirar la estancia.");
}

/* Combinar dos objetos del inventario (opcional por fase): D.COMBOS = [{a,b,result,message}].
 * Sin combinación definida para el par, seleccionar un segundo objeto simplemente cambia
 * la selección (comportamiento previo, sin cambios para fases que no usan COMBOS). */
function findCombo(a,b){
  const list = D.COMBOS || [];
  return list.find(c=>(c.a===a && c.b===b) || (c.a===b && c.b===a));
}
function selectItem(id){
  const s = S.get();
  if(!S.has(id)) return;
  if(s.selected && s.selected!==id){
    const combo = findCombo(s.selected, id);
    if(combo){
      const other = s.selected;
      S.removeItem(other); S.removeItem(id); S.addItem(combo.result);
      s.selected = null;
      if(combo.flag) S.flag(combo.flag, true);
      S.emit("combine",{item:combo.result});
      const resultItem = D.ITEMS[combo.result];
      S.say(combo.message || ("Combinas los objetos: obtienes "+(resultItem?resultItem.name:combo.result)+"."));
      return;
    }
  }
  s.selected = s.selected===id ? null : id;
  S.emit("select",{item:id, on:!!s.selected});
  S.say(s.selected ? "Has seleccionado: "+D.ITEMS[id].name+"." : "Objeto guardado.");
}
/* Entradas de inventario agrupadas (D.GROUPS, p.ej. varias hojas de un mismo
 * derrotero repartidas por la casa): se seleccionan/deseleccionan igual que un
 * objeto normal (ver S.toggleGroupSelected), para que la escena pueda exigir
 * "selecciona primero, luego usa sobre el hotspot", igual que con cualquier otro
 * objeto — sin eso, tocar el hotspot destino las colocaba solas sin pasar por el
 * inventario. */
function selectGroup(groupId){
  const g = D.GROUPS && D.GROUPS[groupId];
  if(!g) return;
  const owned = S.get().items.filter(id=>D.ITEMS[id] && D.ITEMS[id].group===groupId).length;
  const on = S.toggleGroupSelected(groupId);
  S.emit("select",{item:S.groupSelectId(groupId), on});
  S.say(on ? g.name+" seleccionadas ("+owned+"/"+g.total+")." : "Objeto guardado.");
}

/* Pista contextual: la primera de la lista cuya condición se cumple. Cada entrada puede ser
 * `{when,text}` (una sola pista, comportamiento previo) o `{when,tiers:[t1,t2,t3]}` (pistas
 * escalonadas: pulsar "Pista" varias veces seguidas sobre el MISMO acertijo avanza de nivel;
 * si el acertijo aplicable cambia, se reinicia al primer nivel). */
function hint(){
  const s = S.get();
  const h = D.HINTS.find(h=>h.when(s));
  if(!h){ S.say("Pista: "+D.HINT_FALLBACK); s.hintIndex++; S.emit("paper"); return; }
  if(Array.isArray(h.tiers) && h.tiers.length){
    const key = h.key || h.tiers[0];
    if(s.hintKey===key) s.hintTier = Math.min((s.hintTier||0)+1, h.tiers.length-1);
    else { s.hintKey = key; s.hintTier = 0; }
    S.say("Pista: "+h.tiers[s.hintTier]);
  }else{
    s.hintKey = h.text; s.hintTier = 0;
    S.say("Pista: "+h.text);
  }
  s.hintIndex++;
  S.emit("paper");
}

function reset(){ S.reset(); S.emit("travel",{scene:S.get().scene}); }
function travel(sceneId){ if(TD.phaseScenes()[sceneId] && S.go(sceneId)) S.say(TD.scenes[sceneId].enter || ""); }

return { roomHotspot, closeupHotspot, turnDial, back, selectItem, selectGroup, hint, reset, travel, symbolsFor };
})();
